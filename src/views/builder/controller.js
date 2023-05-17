import { createBuilding, World } from './world.js';
import { canvas, gfx, handlers } from './canvas.js';
import { createCluster, modes, rotateCluster } from './util.js';
import { emit, listen } from './eventBus.js';
import { buildings } from './catalog.js';

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

    constructor() {
        this.world = new World();

        this.canvas = canvas;

        this.update = this.update.bind(this);
        this.onCatalogSelect = this.onCatalogSelect.bind(this);

        handlers.onClick = this.onClick.bind(this);
        handlers.onCancel = this.onCancel.bind(this);
        handlers.onRotate = this.onRotate.bind(this);
        handlers.onMove = this.onMove.bind(this);
        handlers.onSelectionStart = this.onSelectionStart.bind(this);

        listen('copy', this.onBuildingCopy.bind(this));
        listen('move', this.onBuildingMove.bind(this));
        listen('demolish', this.onBuildingDemolish.bind(this));
        listen('undo', this.onUndo.bind(this));
    }

    load(layout) {
        this.world.deserialize(layout);
        gfx.invalidate();
    }

    save() {
        return this.world.serialize();
    }

    activate() {
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

    onUndo() {
        this.world.undo();
        gfx.invalidate();
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
        if (this.mode == modes.PreviewPlacement) {
            if (this.stateData.building) {
                this.stateData.building.centerOn(x, y);
                this.world.place(this.stateData.building);
                this.prepareBuilding(this.stateData.building.type, this.stateData.building.x, this.stateData.building.y, this.stateData.building.width);
            } else if (this.stateData.cluster) {
                for (let building of this.stateData.cluster.buildings) {
                    building.ref.centerOn(x + building.offsetX, y + building.offsetY);
                }
                this.world.place(this.stateData.cluster.buildings.map(b => b.ref));
                this.onCancel(true);
            }
        } else if (this.mode == modes.Selection) {
            const selected = this.world.trySelect(x, y, this.stateData.startX, this.stateData.startY);
            emit('select', selected);
            this.mode = modes.Default;
            gfx.invalidate();
        } else if (this.mode == modes.Default) {
            // This used to be selection mode
        }
    }

    onCancel(keepSelection) {
        this.mode = modes.Default;
        this.stateData = null;

        if (keepSelection !== true) {
            this.world.deselect();
        }

        gfx.preview([], false);
    }

    onRotate() {
        if (this.mode == modes.PreviewPlacement) {
            if (this.stateData?.building) {
                const t = this.stateData.building.width;
                this.stateData.building.width = this.stateData.building.height;
                this.stateData.building.height = t;
                gfx.invalidate();
            } else if (this.stateData?.cluster) {
                rotateCluster(this.stateData.cluster);
                gfx.invalidate();
            }
        }
    }

    prepareBuilding(type, x, y, w) {
        const building = createBuilding(type, x, y, w);
        this.stateData = {
            building
        };
        gfx.preview([building], true);
    }

    onCatalogSelect(data) {
        const type = buildings[data.buildingType];
        this.mode = modes.PreviewPlacement;
        this.prepareBuilding(type);
    }

    onBuildingCopy() {
        if (this.mode != modes.Default || this.world.index.selected.size == 0) {
            return;
        }
        const selected = [...this.world.index.selected.values()];

        if (selected.length == 1) {
            this.stateData = { building: selected[0].clone() };
            this.mode = modes.PreviewPlacement;
            gfx.preview([this.stateData.building], true);
        } else {
            const cluster = createCluster(selected);
            this.stateData = { cluster };
            this.mode = modes.PreviewPlacement;
            gfx.preview(cluster.buildings.map(r => r.ref), true);
        }
    }

    onBuildingMove() {
        if (this.mode != modes.Default || this.world.index.selected.size == 0) {
            return;
        }
        const selected = [...this.world.index.selected.values()];

        this.world.demolish(selected);

        if (selected.length == 1) {
            this.stateData = { building: selected[0] };
            this.mode = modes.PreviewPlacement;
            gfx.preview([this.stateData.building], true);
        } else {
            const cluster = createCluster(selected, true);
            this.stateData = { cluster };
            this.mode = modes.PreviewPlacement;
            gfx.preview(cluster.buildings.map(r => r.ref), true);
        }
    }

    onBuildingDemolish() {
        if (this.mode != modes.Default || this.world.index.selected.size == 0) {
            return;
        }
        const selected = [...this.world.index.selected.values()];

        this.world.demolish(selected);
        gfx.invalidate();
    }

    onBuildingReplace(newType) {
        if (this.mode != modes.Default || this.world.index.selected.size == 0) {
            return;
        }
        const selected = [...this.world.index.selected.values()];

        this.world.replace(selected, newType);
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