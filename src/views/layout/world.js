export class World {
    /** @type {Building[]} */
    buildings = [];

    place(x, y) {
        const building = new Building(x, y);
        this.buildings.push(building);
    }
}

class Building {
    /** @type {number} */
    x;
    /** @type {number} */
    y;
    /** @type {number} */
    width;
    /** @type {number} */
    height;

    /** @type {boolean} */
    portrait = false;

    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        // TODO pull size and influence radius from catalog via provided type
        this.x = x;
        this.y = y;

        this.width = 4;
        this.height = 3;
    }
}