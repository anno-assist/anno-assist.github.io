/**
 * @param {HTMLCanvasElement} canvas 
 */
export function bindContext(canvas) {
    const nodes = [];

    const camera = { x: 0, y: 0, scale: 2 };
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
        ctx.translate(canvas.width / 2 - camera.x,  canvas.height / 2 - camera.y);
        ctx.scale(camera.scale, camera.scale);
    }

    function endFrame() {
        ctx.restore();
    }

    function render() {
        clear();
        beginFrame();
        grid();
        endFrame();
    }

    function offsetCamera(x, y) {
        camera.x -= x;
        camera.y -= y;

        render();
    }

    function zoomCamera(delta) {
        camera.scale -= (delta * 0.1);
        if (camera.scale < 0.5) {
            camera.scale = 0.5;
        } else if (camera.scale > 3) {
            camera.scale = 3;
        }
        render();
    }

    function highlight(x, y) {
        [x, y] = screenToWorld(x, y);
        x = Math.floor(x / gridSize) * gridSize;
        y = Math.floor(y / gridSize) * gridSize;

        beginFrame();
        ctx.fillStyle = 'rgba(128,255,128,0.2)';
        ctx.fillRect(x, y, gridSize, gridSize);
        endFrame();
    }

    function screenToWorld(x, y) {
        return [
            (x - canvas.width / 2 + camera.x) / camera.scale,
            (y - canvas.height / 2 + camera.y) / camera.scale
        ];
    }

    return {
        camera,
        render,
        offsetCamera,
        zoomCamera,
        highlight
    };
}