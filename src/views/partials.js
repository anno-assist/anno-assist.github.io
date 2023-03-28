import { html } from '../lib/lit-html.js';
import { until } from '../lib/directives/until.js';
import { loadConfig } from '../config/config.js';


let config = null;

export function icon(name, ...classList) {
    return until(resolveIcon(46, name, classList), iconTemplate(46, 15, 13, classList));
}

export function smallIcon(name, ...classList) {
    return until(resolveIcon(23, name, ['small', ...classList]), iconTemplate(23, 15, 13, ['small', ...classList]));
}

async function resolveIcon(gridSize, name, classList) {
    if (config == null) {
        config = loadConfig('icons');
    }

    let data = (await config)[name];

    if (!data) {
        data = (await config).missing;
    }

    return iconTemplate(gridSize, data[0], data[1], classList);
}

const iconTemplate = (gridSize, x, y, classList) => html`
<span class="icon ${classList.join(' ')}" style="background-position: -${x * gridSize}px -${y * gridSize}px"></span>`;