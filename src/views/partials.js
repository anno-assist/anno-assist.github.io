import { html } from '../lib/lit-html.js';
import { until } from '../lib/directives/until.js';
import { loadConfig } from '../data/config.js';


let config = null;

export function icon(name, ...classList) {


    return until(resolveIcon(name, classList), iconTemplate(15, 13, classList));
}

async function resolveIcon(name, classList) {
    if (config == null) {
        config = loadConfig('icons');
    }

    let data = (await config)[name];

    if (!data) {
        data = (await config).missing;
    }

    return iconTemplate(data[0], data[1], classList);
}

const iconTemplate = (x, y, classList) => html`
<span class="icon ${classList.join(' ')}" style="background-position: -${x * 46}px -${y * 46}px"></span>`;