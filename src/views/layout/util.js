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

/*
rate > 0 (sign = 1)
scale + rate ^^^ ? scale > target
(scale - target) * 1 > 0

rate < 0 (sign = -1)
scale + rate ___ ? scale < target
(scale - target) * -1 > 0
*/