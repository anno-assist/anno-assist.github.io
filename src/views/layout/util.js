let camera = null;
let target = null;
let rate;
let callback = null;
let going = false;

export function smoothZoom(targetCamera, targetZoom, renderCallback) {
    camera = targetCamera;
    target = targetZoom;
    callback = renderCallback;
    rate = (targetZoom - camera.scale) / 10;

    if (!going) {
        going = true;
        transition();
    }
}

function transition() {
    camera.scale += rate;
    if ((camera.scale - target) * Math.sign(rate) > 0) {
        going = false;
        camera.scale = target;
    } else {
        requestAnimationFrame(transition);
    }
    callback();
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function positionRect(cx, cy, w, h) {
    const left = Math.round(cx - (w - 1) / 2);
    const top = Math.round(cy - (h - 1) / 2);
    return [left, top];
}