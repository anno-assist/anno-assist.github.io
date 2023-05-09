export class World {
    /** @type {Building[]} */
    buildings = [];

    place(x, y, w, h) {
        const left = x - Math.floor(w / 2);
        const top = y - Math.floor(h / 2);
        const building = new Building(left, top, w, h);
        this.buildings.push(building);
    }
}

class Building {
    /** @type {number} */
    cx;
    /** @type {number} */
    cy;
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    width;
    /** @type {number} */
    height;
    /** @type {number} */
    radius;

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} w Width
     * @param {number} h Height
     */
    constructor(x, y, w = 4, h = 3, r = 0) {
        // TODO pull size and influence radius from catalog via provided type
        this.x = x;
        this.y = y;

        this.width = w;
        this.height = h;

        this.radius = r;

        this.cx = x + (w - 1) / 2;
        this.cy = y + (h - 1) / 2;
    }
}