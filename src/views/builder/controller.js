import { buildings, createBuilding, World } from './world.js';
import { canvas, gfx, handlers } from './canvas.js';
import { createCluster, modes } from './util.js';
import { emit, listen } from './eventBus.js';

export class LayoutController {
    /** @type {LayoutController} */
    static #instance = null;

    static get instance() {
        if (this.#instance == null) {
            this.#instance = new LayoutController();
        }

        return this.#instance;
    }

    /** @type {World} */
    world = null;
    /** @type {HTMLCanvasElement} */
    canvas = null;
    /** @type {boolean} */
    active = true;
    /** @type {string} */
    mode = modes.Default;
    /** @type {WorldState?} */
    stateData = null;

    storage;

    constructor() {
        this.world = new World();

        this.canvas = canvas;

        this.update = this.update.bind(this);
        this.onFormUpdate = this.onFormUpdate.bind(this);

        handlers.onClick = this.onClick.bind(this);
        handlers.onCancel = this.onCancel.bind(this);
        handlers.onRotate = this.onRotate.bind(this);
        handlers.onMove = this.onMove.bind(this);
        handlers.onSelectionStart = this.onSelectionStart.bind(this);

        listen('copy', this.onBuildingCopy.bind(this));
        listen('move', this.onBuildingMove.bind(this));
        listen('demolish', this.onBuildingDemolish.bind(this));
    }

    load() {
        this.world.deserialize(this.storage.get());
        gfx.invalidate();
    }

    save() {
        this.storage.set(this.world.serialize());
    }

    activate(storage) {
        this.storage = storage;

        this.active = true;
        this.update();
    }

    disable() {
        this.active = false;
    }

    update() {
        if (!gfx.isValid()) {
            gfx.render(this.world);
        }

        if (this.active) {
            requestAnimationFrame(this.update);
        }
    }

    onMove(x, y) {
        if (this.stateData?.building) {
            this.stateData.building.centerOn(x, y);
            gfx.setCursor(x, y);
        } else if (this.stateData?.cluster) {
            for (let building of this.stateData.cluster.buildings) {
                building.ref.centerOn(x + building.offsetX, y + building.offsetY);
            }
            gfx.setCursor(x, y);
        } else if (this.mode == modes.Selection) {
            gfx.setCursor(x, y, this.stateData.startX, this.stateData.startY);
        } else {
            this.world.tryHover(x, y);
            gfx.setCursor(x, y);
        }
    }

    onClick(x, y) {
        if (this.mode == modes.Preview) {
            if (this.stateData.building) {
                this.stateData.building.centerOn(x, y);
                this.world.place(this.stateData.building);
                this.prepareBuilding(this.stateData.building.type, this.stateData.building.x, this.stateData.building.y, this.stateData.building.width);
            } else if (this.stateData.cluster) {
                for (let building of this.stateData.cluster.buildings) {
                    building.ref.centerOn(x + building.offsetX, y + building.offsetY);
                    this.world.place(building.ref);
                }
                this.onCancel();
            }
        } else if (this.mode == modes.Selection) {
            const selected = this.world.trySelect(x, y, this.stateData.startX, this.stateData.startY);
            emit('select', selected);
            this.mode = modes.Default;
            this.stateData = null;
        } else if (this.mode == modes.Default) {
            // This used to be selection mode
        }
    }

    onCancel() {
        this.mode = modes.Default;
        this.stateData = null;
        gfx.preview([], false);
    }

    onRotate() {
        if (this.mode == modes.Preview && this.stateData?.building) {
            const t = this.stateData.building.width;
            this.stateData.building.width = this.stateData.building.height;
            this.stateData.building.height = t;
            gfx.invalidate();
        }
    }

    prepareBuilding(type, x, y, w) {
        const building = createBuilding(type, x, y, w);
        this.stateData = {
            building
        };
        gfx.preview([building], true);
    }

    onFormUpdate(data) {
        const type = buildings[data.buildingType];
        this.mode = modes.Preview;
        this.prepareBuilding(type);
    }

    onBuildingCopy(buildings) {
        if (buildings.length == 1) {
            this.stateData = { building: buildings[0].clone() };
            this.mode = modes.Preview;
            gfx.preview([this.stateData.building], true);
        } else {
            const cluster = createCluster(buildings);
            this.stateData = { cluster };
            this.mode = modes.Preview;
            gfx.preview(cluster.buildings.map(r => r.ref), true);
        }
    }

    onBuildingMove(buildings) {
        for (let building of buildings) {
            this.world.demolish(building);
        }
        this.onBuildingCopy(buildings);
    }

    onBuildingDemolish(buildings) {
        for (let building of buildings) {
            this.world.demolish(building);
        }
        gfx.invalidate();
    }

    onSelectionStart(x, y) {
        if (this.mode == modes.Default) {
            this.stateData = {
                startX: x,
                startY: y
            };
            this.mode = modes.Selection;
        }
    }
}

/** @typedef {import('./world.js').Building} Building */

/** 
 *  @typedef {Object} WorldState
 *  @property {Building?} building
 *  @property {{cx: number, cy: number, buildings: Array<{offsetX: number, offsetY: number, ref: Building}>}} cluster
 *  @property {number?} startX
 *  @property {number?} startY
 */