import { pointInRect, positionRect, rectInRect } from './util.js';

export class World {
    /** @type {Building[]} */
    buildings = [];

    place(building) {
        this.buildings.push(building);
    }

    demolish(building) {
        const index = this.buildings.indexOf(building);
        this.buildings.splice(index, 1);
    }

    tryHover(x, y) {
        for (let building of this.buildings) {
            building.hover = building.pointInside(x, y);
        }
    }

    trySelect(x, y, x1, y1) {
        const [left, top] = [Math.min(x, x1), Math.min(y, y1)];
        const [width, height] = [Math.abs(x - x1), Math.abs(y - y1)];

        const selected = [];

        if (width > 0.1 && height > 0.1) {
            for (let building of this.buildings) {
                const value = rectInRect({ x: building.x - 0.5, y: building.y - 0.5, width: building.width, height: building.height }, { x: left, y: top, width, height });
                building.selected = value;
                building.showInfluence = false;
                if (value) {
                    selected.push(building);
                }
            }
        } else {
            for (let building of this.buildings) {
                const value = building.pointInside(x, y);
                building.selected = value;
                building.showInfluence = value;
                if (value) {
                    selected.push(building);
                }
            }
            for (let building of this.buildings) {
                if (selected.length > 0) {
                    if (building == selected[0]) {
                        continue;
                    }
                    building.influenced = selected[0].hasInfluence(building) || building.hasInfluence(selected[0]);
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
        const data = value.map(b => createBuilding(b.type, b.x, b.y, b.width));
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

    clone() {
        return createBuilding(this.type, this.x, this.y, this.width);
    }
}

export function createBuilding(type, x = 0, y = 0, w) {
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

export const buildings = {
    Market: 'market',
    Activity: 'activity',
    Information: 'information',
    Participation: 'participation',
    Residence_L1: 'tycoon_worker',
    Residence_L2: 'tycoon_employee',
    Residence_L3: 'tycoon_engineer',
    Residence_L4: 'tycoon_executive',
    Firestation: 'firestation',
    Hospital: 'hospital',
    Police: 'police',
};

const influences = {
    Company: Symbol('company_influence'),
    Activity: Symbol('activity_influence'),
    Information: Symbol('information_influence'),
    Participation: Symbol('participation_influence'),
    Firestation: Symbol('firestation_influence'),
    Hospital: Symbol('hospital_influence'),
    Police: Symbol('police_influence'),
};

const buildingTemplates = {
    [buildings.Market]: {
        w: 6,
        h: 8,
        radius: 25,
        effect: influences.Company,
        affected: [influences.Firestation]
    },
    [buildings.Activity]: {
        w: 6,
        h: 5,
        radius: 20,
        effect: influences.Activity,
        affected: [influences.Firestation]
    },
    [buildings.Information]: {
        w: 6,
        h: 6,
        radius: 26,
        effect: influences.Information,
        affected: [influences.Firestation]
    },
    [buildings.Participation]: {
        w: 7,
        h: 9,
        radius: 24,
        effect: influences.Participation,
        affected: [influences.Firestation]
    },
    [buildings.Residence_L1]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ]
    },
    [buildings.Residence_L2]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Information,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ]
    },
    [buildings.Residence_L3]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Information,
            influences.Participation,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ]
    },
    [buildings.Residence_L4]: {
        w: 3,
        h: 3,
        radius: 0,
        effect: null,
        affected: [
            influences.Company,
            influences.Activity,
            influences.Information,
            influences.Participation,
            influences.Firestation,
            influences.Hospital,
            influences.Police,
        ]
    },
    [buildings.Firestation]: {
        w: 3,
        h: 6,
        radius: 22,
        effect: influences.Firestation,
        affected: [influences.Firestation]
    },
    [buildings.Hospital]: {
        w: 4,
        h: 6,
        radius: 22,
        effect: influences.Hospital,
        affected: [influences.Firestation]
    },
    [buildings.Police]: {
        w: 5,
        h: 5,
        radius: 22,
        effect: influences.Police,
        affected: [influences.Firestation]
    },
};
