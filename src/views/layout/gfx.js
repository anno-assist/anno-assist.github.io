import { loadResources, modes, rgb, rgba, smoothZoom } from './util.js';


/**
 * @param {HTMLCanvasElement} canvas 
 */
export function bindContext(canvas) {
    const resources = loadResources();
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '6px, sans-serif';
    const gridSize = 20;

    const camera = { x: 0, y: 0, scale: zoomFactors[currentZoom] };
    const cursor = { x: 0, y: 0, x1: 0, y1: 0, preview: [], mode: modes.Default };
    const overlay = [];

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
        ctx.strokeStyle = rgba(255, 0, 0, 1);
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

        ctx.strokeStyle = rgba(0, 0, 0, 0.2);
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

    function setCursor(x, y, x1, y1) {
        if (cursor.x != x || cursor.y != y) {
            cursor.x = x;
            cursor.y = y;
            if (x1 != undefined && y1 != undefined) {
                cursor.mode = modes.Selection;
                cursor.x1 = x1;
                cursor.y1 = y1;
            } else if (cursor.mode == modes.Selection) {
                cursor.mode = modes.Default;
            }
            invalidate();
        }
    }

    /**
     * 
     * @param {import('./world.js').Building} building 
     * @param {boolean} showPreview 
     */
    function preview(buildings, showPreview) {
        cursor.preview = buildings;
        cursor.mode = showPreview ? modes.Preview : modes.Default;
        invalidate();
    }

    function rect(x, y, w = 1, h = 1, style = rgba(128, 255, 128, 0.25)) {
        ctx.save();
        ctx.fillStyle = style;
        ctx.translate((x - 0.5) * gridSize, (y - 0.5) * gridSize);
        ctx.fillRect(0, 0, w * gridSize, h * gridSize);
        ctx.restore();
    }

    function frame(x, y, w = 1, h = 1, thickness = 1) {
        ctx.save();
        ctx.strokeStyle = rgb(255, 255, 128);
        ctx.lineWidth = thickness;
        ctx.translate((x - 0.5) * gridSize, (y - 0.5) * gridSize);
        ctx.strokeRect(0, 0, w * gridSize, h * gridSize);
        ctx.restore();
    }

    function circle(x, y, r, style = rgba(128, 255, 128, 0.1)) {
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
        ctx.fillText(text, (x - 0.5) * gridSize + 3, (y - 0.5) * gridSize + 10);
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

        overlay.forEach(o => o());
        overlay.length = 0;

        if (cursor.mode == modes.Preview) {
            renderPreview();
        }

        if (cursor.mode == modes.Selection) {
            renderSelection();
        }

        endFrame();

        ctx.fillText(debugText, 10, 16);

        valid = true;
    }

    function renderPreview() {
        if (cursor.preview.length == 1 && cursor.preview[0].radius) {
            const building = cursor.preview[0];

            if (building.radius) {
                circle(building.cx, building.cy, building.radius);
            }
        }
        for (let building of cursor.preview) {
            rect(building.x + 0.1, building.y + 0.1, building.width - 0.2, building.height - 0.2, rgba(128, 128, 128, 0.5));
            renderIcon(building.type, building.cx, building.cy);
        }
    }

    function renderSelection() {
        const left = Math.min(cursor.x, cursor.x1) + 0.5;
        const top = Math.min(cursor.y, cursor.y1) + 0.5;
        const w = Math.abs(cursor.x - cursor.x1);
        const h = Math.abs(cursor.y - cursor.y1);

        frame(left, top, w, h, 2);
    }

    /** @param {import('./world.js').Building} building */
    function renderBuilding(building) {
        let style = rgb(128, 128, 128);
        rect(building.x + 0.1, building.y + 0.1, building.width - 0.2, building.height - 0.2, style);
        renderIcon(building.type, building.cx, building.cy);

        if (building.influenced) {
            rect(building.x, building.y, building.width, building.height, rgba(128, 255, 128, 0.5));
        }
        if (building.showInfluence && building.radius) {
            overlay.push(circle.bind(null, building.cx, building.cy, building.radius));
        }
        if (building.selected) {
            overlay.push(rect.bind(null, building.x, building.y, building.width, building.height, style));
            overlay.push(renderIcon.bind(null, building.type, building.cx, building.cy));
            overlay.push(frame.bind(null, building.x, building.y, building.width, building.height, 5));
        } else if (building.hover && cursor.mode == modes.Default) {
            frame(building.x, building.y, building.width, building.height, 3);
        }

        text(`${building.cx},${building.cy}`, building.x, building.y);
    }

    function renderIcon(name, cx, cy) {
        if (resources.ready) {
            const data = resources.config[name];

            if (data) {
                let [offsetX, offsetY] = data;
                [offsetX, offsetY] = [offsetX * 46, offsetY * 46];
                ctx.drawImage(resources.icons, offsetX, offsetY, 46, 46, (cx - 1) * gridSize, (cy - 1) * gridSize, 2 * gridSize, 2 * gridSize);
            }
        }
    }

    const result = {
        camera,
        screenToWorld,
        render,
        offsetCamera,
        zoomCamera,
        setCursor,
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