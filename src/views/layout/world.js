import { pointInRect, positionRect } from './util.js';

export class World {
    /** @type {Building[]} */
    buildings = [];

    place(building) {
        this.buildings.push(building);
    }

    tryHover(x, y) {
        for (let building of this.buildings) {
            building.hover = building.pointInside(x, y);
        }
    }

    trySelect(x, y) {
        let selected = null;
        for (let building of this.buildings) {
            const value = building.pointInside(x, y);
            building.selected = value;
            building.showInfluence = value;
            selected = value ? building : selected;
        }
        for (let building of this.buildings) {
            if (selected) {
                if (building == selected) {
                    continue;
                }
                building.influenced = selected.hasInfluence(building) || building.hasInfluence(selected);
            } else {
                building.influenced = false;
            }
        }
        return selected;
    }

    createBuilding(type, x = 0, y = 0, w) {
        const template = buildingTemplates[type];
        let [width, height] = [template.w, template.h];
        if (w !== undefined && w != template.w) {
            [width, height] = [height, width];
        }
        const result = new Building(type, x, y, width, height, template.radius);
        result.effect = template.effect;
        result.affected = [...template.affected];

        return result;
    }

    serialize() {
        return this.buildings.map(b => b.serialize());
    }

    deserialize(value) {
        const data = value.map(b => this.createBuilding(b.type, b.x, b.y, b.width));
        this.buildings = data;
    }
}

export class Building {
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

    /** @type {boolean} */
    hover = false;
    /** @type {boolean} */
    selected = false;
    /** @type {boolean} */
    showInfluence = false;
    /** @type {boolean} */
    influenced = false;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} w Width
     * @param {number} h Height
     */
    constructor(type, left, top, w, h, r = 0) {
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
}

export const buildings = {
    Market: 'market',
    Residence: 'residence',
    Activity: 'activity',
};

const influences = {
    Company: Symbol('company_influence'),
    Activity: Symbol('activity_influence'),
};

const buildingTemplates = {
    [buildings.Market]: {
        w: 6,
        h: 8,
        radius: 25,
        effect: influences.Company,
        affected: []
    },
    [buildings.Activity]: {
        w: 6,
        h: 5,
        radius: 20,
        effect: influences.Activity,
        affected: []
    },
    [buildings.Residence]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [influences.Company, influences.Activity]
    }
};
