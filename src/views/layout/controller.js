import { World } from './world.js';
import { canvas, gfx, handlers } from './canvas.js';

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
    stateData = null;

    constructor() {
        this.world = new World();
        this.canvas = canvas;

        this.update = this.update.bind(this);
        this.onFormUpdate = this.onFormUpdate.bind(this);

        handlers.onClick = this.onClick.bind(this);
        handlers.onCancel = this.onCancel.bind(this);
        handlers.onRotate = this.onRotate.bind(this);
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

    onClick(x, y) {
        if (this.mode == modes.Preview) {
            this.world.place(x, y, this.stateData.width, this.stateData.height);
        }
    }

    onCancel() {
        this.mode = modes.Default;
        this.stateData = null;
        gfx.preview(1, 1, 0);
    }

    onRotate() {
        if (this.mode == modes.Preview) {
            const t = this.stateData.width;
            this.stateData.width = this.stateData.height;
            this.stateData.height = t;
            gfx.preview(this.stateData.width, this.stateData.height, this.stateData.radius);
        }
    }

    onFormUpdate(data) {
        console.log(data);
        this.mode = modes.Preview;
        this.stateData = {
            width: data.width,
            height: data.height,
            radius: data.radius
        };
        gfx.preview(data.width, data.height, data.radius);
    }
}

const modes = {
    Default: Symbol('default'),
    Preview: Symbol('preview')
};