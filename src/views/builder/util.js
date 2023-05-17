import { loadConfig, loadIcons } from '../../config/config.js';
import { influences } from './catalog.js';

let camera = null;
let target = null;
let rate;
let callback = null;
let going = false;

export const modes = {
    Default: Symbol('default'),
    PreviewPlacement: Symbol('preview'),
    Selection: Symbol('selection'),
};

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

export function pointInRect(x, y, rect) {
    return x > rect.x
        && x < rect.x + rect.width
        && y > rect.y
        && y < rect.y + rect.height;
}

export function rectInRect(a, b) {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

export function rgb(r, g, b) {
    return `rgb(${r},${g},${b})`;
}

export function rgba(r, g, b, a) {
    return `rgb(${r},${g},${b},${a})`;
}

/**
 * 
 * @param {Array<Building>} buildings 
 */
export function createCluster(buildings, dontClone) {
    const left = Math.min(...buildings.map(b => b.cx));
    const right = Math.max(...buildings.map(b => b.cx));
    const top = Math.min(...buildings.map(b => b.cy));
    const bottom = Math.max(...buildings.map(b => b.cy));

    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;

    return {
        cx, cy,
        buildings: buildings.map(ref => ({
            offsetX: ref.cx - cx,
            offsetY: ref.cy - cy,
            ref: dontClone ? ref : ref.clone()
        }))
    };
}

export function loadResources() {
    const configPromise = loadConfig('icons');
    const iconsPromise = loadIcons();

    const result = {
        ready: false,
        config: null,
        icons: null
    };

    Promise.all([configPromise, iconsPromise]).then(([config, icons]) => {
        result.ready = true;
        result.config = config;
        result.icons = icons;
    });

    return result;
}

/**
 * 
 * @param {Array<Building>} buildings 
 */
export function summarize(buildings) {
    let residences = 0;

    const summary = Object.entries(
        buildings
            .sort((a, b) => (a.listOrder || 0) - (b.listOrder || 0))
            .map(b => {
                if (b.effect == influences.Residence) {
                    residences++;
                }
                return b.type;
            })
            .reduce((a, c) => Object.assign(a, { [c]: (a[c] || 0) + 1 }), {})
    );

    summary.push(['Total residences', residences]);

    return summary;
}

export function uuid() {
    return 'xxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
}

/**
 * @typedef {import('./world.js').Building} Building
 */