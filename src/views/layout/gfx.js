import { smoothZoom } from './util.js';
import { World } from './world.js';

/**
 * @param {HTMLCanvasElement} canvas 
 * @param {import('./world.js').World} world
 */
export function bindContext(canvas, world) {
    const camera = { x: 0, y: 0, scale: 2 };
    const target = { x: 0, y: 0 };
    const gridSize = 20;

    const ctx = canvas.getContext('2d');

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

        const l = Math.floor(left / gridSize) * gridSize;
        const r = Math.ceil(right / gridSize) * gridSize;

        const t = Math.floor(top / gridSize) * gridSize;
        const b = Math.ceil(bottom / gridSize) * gridSize;

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

    function render() {
        clear();
        beginFrame();
        grid();

        for (let building of world.buildings) {
            rect(building.x, building.y, building.width, building.height, 'rgb(128, 128, 128)');
        }

        rect(target.x, target.y);
        endFrame();
    }

    function offsetCamera(x, y) {
        camera.x -= x;
        camera.y -= y;

        render();
    }

    function zoomCamera(delta) {
        currentZoom += delta;
        if (currentZoom < 0) {
            currentZoom = 0;
        } else if (currentZoom > zoomFactors.length - 1) {
            currentZoom = zoomFactors.length - 1;
        }
        smoothZoom(camera, zoomFactors[currentZoom], render);
        render();
    }

    function highlight(x, y) {
        [x, y] = screenToWorld(x, y);
        target.x = x;
        target.y = y;
        render();
    }
    
    function rect(x, y, w = 1, h = 1, style = 'rgba(128,255,128,0.2)') {
        ctx.save();
        ctx.fillStyle = style;
        ctx.translate(x * gridSize, y * gridSize);
        ctx.fillRect(0, 0, w * gridSize, h * gridSize);
        ctx.restore();
    }

    function screenToWorld(x, y) {
        return [
            Math.floor((x - canvas.width / 2 + camera.x) / camera.scale / gridSize),
            Math.floor((y - canvas.height / 2 + camera.y) / camera.scale / gridSize)
        ];
    }

    return {
        camera,
        screenToWorld,
        render,
        offsetCamera,
        zoomCamera,
        highlight
    };
}

let currentZoom = 3;
const zoomFactors = [
    3.0,
    2.0,
    1.5,
    1.25,
    1.0,
    0.8,
    0.6,
    0.5,
];