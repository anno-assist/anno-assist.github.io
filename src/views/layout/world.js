export class World {
    /** @type {Building[]} */
    buildings = [
        new Building(0, 0, 2, 3, 8),
    ];

    place(left, top, w, h) {
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
    constructor(left, top, w = 4, h = 3, r = 0) {
        // TODO pull size and influence radius from catalog via provided type
        this.x = left;
        this.y = top;

        this.width = w;
        this.height = h;

        this.radius = r;

        this.cx = left + (w - 1) / 2;
        this.cy = top + (h - 1) / 2;
    }
}