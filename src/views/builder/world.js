import { buildingTemplates } from './catalog.js';
import { pointInRect, positionRect, rectInRect, uuid } from './util.js';

export class World {
    /** @type {Building[]} */
    buildings = [];
    index = {
        /** @type {Set<Building>} */
        selected: new Set(),
        /** @type {Set<Building>} */
        influenced: new Set(),
    };
    undoStack = [];

    place(buildings) {
        if (Array.isArray(buildings) == false) {
            buildings = [buildings];
        }
        this.pushStack();
        this.buildings.push(...buildings);
    }

    demolish(buildings) {
        if (Array.isArray(buildings) == false) {
            buildings = [buildings];
        }
        this.pushStack();
        for (let building of buildings) {
            const index = this.buildings.indexOf(building);
            if (index !== -1) {
                this.buildings.splice(index, 1);
            }
        }
    }

    replace(buildings, newType) {
        if (Array.isArray(buildings) == false) {
            buildings = [buildings];
        }
        this.pushStack();
        for (let building of buildings) {
            const index = this.buildings.indexOf(building);
            if (index !== -1) {
                const newBuilding = createBuilding(newType, building.x, building.y);
                newBuilding.id = building.id;
                this.buildings[index] = newBuilding;
            }
        }
        this.deselect();
    }

    tryHover(x, y) {
        for (let building of this.buildings) {
            building.hover = building.pointInside(x, y);
        }
    }

    deselect() {
        for (let building of this.buildings) {
            building.selected = false;
            building.influenced = false;
            building.showInfluence = false;
            this.index.selected.clear();
            this.index.influenced.clear();
        }
    }

    pushStack() {
        const state = this.serialize();
        this.undoStack.push(state);
        if (this.undoStack.length > 10) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length > 0) {
            const state = this.undoStack.pop();
            this.deserialize(state);
        }
    }

    trySelect(x, y, x1, y1) {
        const [left, top] = [Math.min(x, x1), Math.min(y, y1)];
        const [width, height] = [Math.abs(x - x1), Math.abs(y - y1)];

        const selected = [];
        this.index.selected.clear();
        this.index.influenced.clear();

        if (width > 0.1 && height > 0.1) {
            for (let building of this.buildings) {
                const value = rectInRect({ x: building.x - 0.5, y: building.y - 0.5, width: building.width, height: building.height }, { x: left, y: top, width, height });
                building.selected = value;
                building.showInfluence = false;
                if (value) {
                    selected.push(building);
                    this.index.selected.add(building);
                }
            }
        } else {
            for (let building of this.buildings) {
                const value = building.pointInside(x, y);
                building.selected = value;
                building.showInfluence = value;
                if (value) {
                    selected.push(building);
                    this.index.selected.add(building);
                }
            }
            for (let building of this.buildings) {
                if (selected.length > 0) {
                    if (building == selected[0]) {
                        continue;
                    }
                    const influenced = selected[0].hasInfluence(building) || building.hasInfluence(selected[0]);
                    building.influenced = influenced;
                    if (influenced) {
                        selected[0].summary.add(building);
                        this.index.influenced.add(building);
                    }
                } else {
                    building.influenced = false;
                }
            }
        }

        return selected;
    }

    serialize() {
        return this.buildings.map(b => b.serialize());
    }

    deserialize(value) {
        this.index.selected.clear();
        this.index.influenced.clear();
        const data = value.map(b => createBuilding(b.type, b.x, b.y, b.width)).filter(b => b);
        this.buildings = data;
    }
}

export class Building {
    /** @type {string} */
    id;
    type = null;

    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    #width;
    /** @type {number} */
    #height;
    /** @type {number} */
    #cx;
    /** @type {number} */
    #cy;
    /** @type {number} */
    #radius;
    /** @type {number} */
    #rSq;

    effect = null;
    affected = [];
    /** @type {[number, number, number]} */
    color = [128, 128, 128];

    /** @type {boolean} */
    hover = false;
    /** @type {boolean} */
    selected = false;
    /** @type {boolean} */
    showInfluence = false;
    /** @type {boolean} */
    influenced = false;

    listOrder;
    summary = new Set();

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} w Width
     * @param {number} h Height
     */
    constructor(type, left, top, w, h, r = 0) {
        this.id = uuid();
        this.type = type;

        this.x = left;
        this.y = top;

        this.width = w;
        this.height = h;
        this.radius = r;
    }

    get width() {
        return this.#width;
    }
    set width(value) {
        this.#width = value;
        this.#calcCenter();
    }

    get height() {
        return this.#height;
    }
    set height(value) {
        this.#height = value;
        this.#calcCenter();
    }

    get radius() {
        return this.#radius;
    }
    set radius(value) {
        this.#radius = value;
        this.#rSq = value ** 2;
    }

    get cx() {
        return this.#cx;
    }

    get cy() {
        return this.#cy;
    }

    #calcCenter() {
        this.#cx = this.x + (this.width - 1) / 2;
        this.#cy = this.y + (this.height - 1) / 2;
    }

    pointInside(x, y) {
        return pointInRect(x + 0.5, y + 0.5, this);
    }

    /**
     * 
     * @param {Building} ref 
     * @returns {boolean}
     */
    hasInfluence(ref) {
        return ref.affected.includes(this.effect) && ((this.cx - ref.cx) ** 2 + (this.cy - ref.cy) ** 2 <= this.#rSq);
    }

    centerOn(x, y) {
        const [left, top] = positionRect(x, y, this.width, this.height);
        this.x = left;
        this.y = top;
        this.#calcCenter();
    }

    serialize() {
        return {
            type: this.type,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            radius: this.radius
        };
    }

    clone() {
        return createBuilding(this.type, this.x, this.y, this.width);
    }
}

export function createBuilding(type, x = 0, y = 0, w) {
    const template = buildingTemplates[type];
    if (!template) {
        return null;
    }
    let [width, height] = [template.w, template.h];
    if (w !== undefined && w != template.w) {
        [width, height] = [height, width];
    }
    const result = new Building(type, x, y, width, height, template.radius);
    result.effect = template.effect;
    result.affected = [...template.affected];

    if (template.color) {
        result.color = template.color;
    }

    if (template.listOrder) {
        result.listOrder = template.listOrder;
    }

    return result;
}
