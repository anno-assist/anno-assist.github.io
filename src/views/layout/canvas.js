import { throttle } from '../../util.js';
import { bindContext } from './gfx.js';


const canvas = document.createElement('canvas');
canvas.id = 'layout-canvas';
canvas.style.backgroundColor = 'black';
const gfx = bindContext(canvas);
setupEvents();

resize();
const onResize = throttle(resize, 50);
window.addEventListener('resize', onResize);
window.addEventListener('keydown', onKeyPress);

const handlers = {
    onClick: null,
    onCancel: null,
    onRotate: null,
    onMove: null,
    onSelectionStart: null
};


function setupEvents() {
    let dragging = false;
    let dragMode = null;
    let lastX;
    let lastY;

    canvas.addEventListener('mousedown', onClick);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onDragEnd);
    canvas.addEventListener('mouseleave', onDragEnd);

    canvas.addEventListener('wheel', onScroll);

    function onClick(event) {
        if (event.buttons == 4) {
            dragMode = 'camera';
            onDragStart(event);
        } else if (event.buttons == 1) {
            dragMode = 'selection';
            if (typeof handlers.onSelectionStart == 'function') {
                let [x, y] = gfx.screenToWorld(event.offsetX, event.offsetY);
                handlers.onSelectionStart(x, y);
            }
        }
    }

    function onPlace(event) {
        if (typeof handlers.onClick == 'function') {
            let [x, y] = gfx.screenToWorld(event.offsetX, event.offsetY);
            handlers.onClick(x, y);
            gfx.invalidate();
        }
    }

    function onMove(event) {
        if (dragging) {
            onDrag(event);
        } else if (typeof handlers.onMove == 'function') {
            let [x, y] = gfx.screenToWorld(event.offsetX, event.offsetY);
            handlers.onMove(x, y);
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

            if (dragMode == 'camera') {
                gfx.offsetCamera(deltaX, deltaY);
            }

            lastX = currentX;
            lastY = currentY;
        }
    }

    function onDragEnd(event) {
        dragging = false;
        if (dragMode == 'selection') {
            onPlace(event);
        }
        dragMode = null;
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

        gfx.invalidate();
    }
}

/**
 * 
 * @param {KeyboardEvent} event 
 */
function onKeyPress(event) {
    if (event.code == 'Escape' && typeof handlers.onCancel == 'function') {
        handlers.onCancel();
    } else if ((event.code == 'Comma' || event.code == 'Period') && typeof handlers.onRotate == 'function') {
        handlers.onRotate();
    }
}


export { canvas, gfx, handlers };