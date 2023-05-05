import { throttle } from '../../util.js';
import { bindContext } from './gfx.js';
import { World } from './world.js';


const world = new World();
const canvas = document.createElement('canvas');
canvas.id = 'layout-canvas';
canvas.style.backgroundColor = 'black';
const gfx = bindContext(canvas, world);
setupDragging();

resize();
const onResize = throttle(resize, 50);
window.addEventListener('resize', onResize);


function setupDragging() {
    let dragging = false;
    let lastX;
    let lastY;

    canvas.addEventListener('mousedown', onClick);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onDragEnd);
    canvas.addEventListener('mouseleave', onDragEnd);

    canvas.addEventListener('wheel', onScroll);

    function onClick(event) {
        if (event.buttons == 4) {
            onDragStart(event);
        } else if (event.buttons == 1) {
            onPlace(event);
        }
    }

    function onPlace(event) {
        const [x, y] = gfx.screenToWorld(event.offsetX, event.offsetY);
        world.place(x, y);
        gfx.render();
    }

    function onMove(event) {
        if (dragging) {
            onDrag(event);
        } else {
            gfx.highlight(event.offsetX, event.offsetY);
        }
    }

    function onDragStart(event) {
        event.preventDefault();
        dragging = true;
        lastX = event.offsetX;
        lastY = event.offsetY;
    }

    function onDrag(event) {
        if (dragging) {
            const currentX = event.offsetX;
            const currentY = event.offsetY;

            const deltaX = currentX - lastX;
            const deltaY = currentY - lastY;

            gfx.offsetCamera(deltaX, deltaY);

            lastX = currentX;
            lastY = currentY;
        }
    }

    function onDragEnd() {
        dragging = false;
    }

    function onScroll(event) {
        gfx.zoomCamera(Math.sign(event.deltaY));
    }
}


function resize() {
    const root = document.getElementById('content');
    if (root) {
        const size = root.getBoundingClientRect();
        canvas.width = size.width - 208;
        canvas.height = size.height - 98;

        gfx.render();
    }
}


export { canvas, gfx };