import { buildings, World } from './world.js';
import { canvas, gfx, handlers } from './canvas.js';
import { modes } from './util.js';

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
    emit;

    constructor() {
        this.world = new World();

        this.canvas = canvas;

        this.update = this.update.bind(this);
        this.onFormUpdate = this.onFormUpdate.bind(this);

        handlers.onClick = this.onClick.bind(this);
        handlers.onCancel = this.onCancel.bind(this);
        handlers.onRotate = this.onRotate.bind(this);
        handlers.onMove = this.onMove.bind(this);
    }

    load() {
        this.world.deserialize(this.storage.get());
        gfx.invalidate();
    }

    save() {
        this.storage.set(this.world.serialize());
    }

    activate(storage, emit) {
        this.storage = storage;
        this.emit = emit;

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
        }
        this.world.tryHover(x, y);
        gfx.setCursor(x, y);
    }

    onClick(x, y) {
        if (this.mode == modes.Preview) {
            this.stateData.building.centerOn(x, y);
            this.world.place(this.stateData.building);
            this.prepareBuilding(this.stateData.building.type, this.stateData.building.x, this.stateData.building.y, this.stateData.building.width);
        } else if (this.mode == modes.Default) {
            const selected = this.world.trySelect(x, y);
            this.emit('selected', selected);
        }
    }

    onCancel() {
        this.mode = modes.Default;
        this.stateData = null;
        gfx.preview(null, false);
    }

    onRotate() {
        if (this.mode == modes.Preview) {
            const t = this.stateData.building.width;
            this.stateData.building.width = this.stateData.building.height;
            this.stateData.building.height = t;
            gfx.invalidate();
        }
    }

    prepareBuilding(type, x, y, w) {
        const building = this.world.createBuilding(type, x, y, w);
        this.stateData = {
            building
        };
        gfx.preview(building, true);
    }

    onFormUpdate(data) {
        const type = buildings[data.buildingType];
        this.mode = modes.Preview;
        this.prepareBuilding(type);
    }
}

/** @typedef {import('./world.js').Building} Building */

/** 
 *  @typedef {Object} WorldState
 *  @property {Building?} building
 */