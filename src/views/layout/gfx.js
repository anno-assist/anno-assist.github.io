import { positionRect, smoothZoom } from './util.js';


/**
 * @param {HTMLCanvasElement} canvas 
 */
export function bindContext(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '6px, sans-serif';
    const gridSize = 20;

    const camera = { x: 0, y: 0, scale: zoomFactors[currentZoom] };
    const cursor = { x: 0, y: 0, w: 1, h: 1, r: 0 };

    let valid = false;

    let debugText = '';

    function clear() {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    function grid() {
        ctx.save();
        ctx.lineWidth = 1;

        const left = (camera.x - canvas.width / 2) / camera.scale;
        const right = (camera.x + canvas.width / 2) / camera.scale;
        const top = (camera.y - canvas.height / 2) / camera.scale;
        const bottom = (camera.y + canvas.height / 2) / camera.scale;
        ctx.strokeStyle = 'rgba(255,0,0,1)';
        ctx.beginPath();
        ctx.moveTo(left + 10, 0);
        ctx.lineTo(right - 10, 0);
        ctx.moveTo(0, top + 10);
        ctx.lineTo(0, bottom - 10);
        ctx.stroke();
        ctx.closePath();

        const l = (Math.floor(left / gridSize) - 0.5) * gridSize;
        const r = (Math.ceil(right / gridSize) + 0.5) * gridSize;

        const t = (Math.floor(top / gridSize) - 0.5) * gridSize;
        const b = (Math.ceil(bottom / gridSize) + 0.5) * gridSize;

        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        for (let y = t; y < b; y += gridSize) {
            ctx.moveTo(l, y);
            ctx.lineTo(r, y);
        }
        for (let x = l; x < r; x += gridSize) {
            ctx.moveTo(x, t);
            ctx.lineTo(x, b);
        }
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    function beginFrame() {
        ctx.save();
        ctx.translate(canvas.width / 2 - camera.x, canvas.height / 2 - camera.y);
        ctx.scale(camera.scale, camera.scale);
    }

    function endFrame() {
        ctx.restore();
    }

    function offsetCamera(x, y) {
        camera.x -= x;
        camera.y -= y;

        invalidate();
    }

    function zoomCamera(delta) {
        currentZoom += delta;
        if (currentZoom < 0) {
            currentZoom = 0;
        } else if (currentZoom > zoomFactors.length - 1) {
            currentZoom = zoomFactors.length - 1;
        }
        smoothZoom(camera, zoomFactors[currentZoom], invalidate);

        invalidate();
    }

    function highlight(x, y, w, h) {
        [x, y] = screenToWorld(x, y);
        if (cursor.x != x || cursor.y != y) {
            cursor.x = x;
            cursor.y = y;
            if (w !== undefined && h !== undefined) {
                cursor.w = w;
                cursor.h = h;
            }

            invalidate();
        }
    }

    function preview(w, h, r = 0) {
        cursor.w = w;
        cursor.h = h;
        cursor.r = r;
        invalidate();
    }

    function rect(x, y, w = 1, h = 1, style = 'rgba(128,255,128,0.25)') {
        ctx.save();
        ctx.fillStyle = style;
        ctx.translate((x - 0.5) * gridSize, (y - 0.5) * gridSize);
        ctx.fillRect(0, 0, w * gridSize, h * gridSize);
        ctx.restore();
    }

    function circle(x, y, r, style = 'rgba(128,255,128,0.25)') {
        const ox = x - Math.floor(x);
        const offsetY = Math.floor(r + y) - y;

        for (let row = offsetY; row > 0; row--) {
            const rawOffsetX = Math.sqrt(r ** 2 - row ** 2);
            const left = Math.floor(ox + rawOffsetX);
            const offsetX = left - ox;
            rect(x - offsetX, y - row, offsetX * 2 + 1, 1, style);
            rect(x - offsetX, y + row, offsetX * 2 + 1, 1, style);
        }
        if (y == Math.floor(y)) {
            const left = Math.floor(ox + r);
            const offsetX = left - ox;
            rect(x - offsetX, y, offsetX * 2 + 1, 1, style);
        }

        /*
        ctx.save();
        ctx.fillStyle = style;
        ctx.translate(x * gridSize, y * gridSize);
        ctx.beginPath();
        ctx.arc(0, 0, r * gridSize, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        */
    }

    function text(text, x, y) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillText(text, (x - 0.5) * gridSize, (y - 0.5) * gridSize + 7);
        ctx.restore();
    }

    function screenToWorld(x, y) {
        return [
            (x - canvas.width / 2 + camera.x) / camera.scale / gridSize,
            (y - canvas.height / 2 + camera.y) / camera.scale / gridSize
        ];
    }

    function invalidate() {
        valid = false;
    }

    /**
     * @param {import('./world.js').World} world 
     */
    function render(world) {
        clear();
        beginFrame();
        grid();

        for (let building of world.buildings) {
            renderBuilding(building);
        }

        renderCursor();

        endFrame();

        ctx.fillText(debugText, 10, 16);

        valid = true;
    }

    function renderCursor() {
        const [left, top] = positionRect(cursor.x, cursor.y, cursor.w, cursor.h);
        if (cursor.r) {
            // TODO use logic matching equivalent building center
            circle(Math.round(cursor.x * 2) / 2, Math.round(cursor.y * 2) / 2, cursor.r);
        }
        rect(left, top, cursor.w, cursor.h);
    }

    function renderBuilding(building) {
        rect(building.x, building.y, building.width, building.height, 'rgb(128, 128, 128)');
        text(`${building.cx},${building.cy}`, building.x, building.y);
    }

    const result = {
        camera,
        screenToWorld,
        render,
        offsetCamera,
        zoomCamera,
        highlight,
        preview,
        invalidate,
        isValid() {
            return valid;
        },
        set debug(value) {
            debugText = value;
            invalidate();
        }
    };

    return result;
}

let currentZoom = 4;
const zoomFactors = [
    3.0,
    2.0,
    1.5,
    1.25,
    1.0,
    0.8,
    0.6,
    0.5,
    0.4,
    0.3,
    0.25,
    0.20,
    0.15,
    0.10,
];