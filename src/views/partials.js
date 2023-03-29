import { html } from '../lib/lit-html.js';
import { until } from '../lib/directives/until.js';
import { loadConfig } from '../config/config.js';


let config = null;

export function icon(name, ...classList) {
    return until(resolveIcon(46, name, classList), iconTemplate(46, 15, 13, classList, 'loading'));
}

export function smallIcon(name, ...classList) {
    return until(resolveIcon(23, name, ['small', ...classList]), iconTemplate(23, 15, 13, ['small', ...classList], 'loading'));
}

async function resolveIcon(gridSize, name, classList) {
    if (config == null) {
        config = loadConfig('icons');
    }

    let data = (await config)[name];

    if (!data) {
        data = (await config).missing;
    }

    return iconTemplate(gridSize, data[0], data[1], classList, name);
}

export const iconTemplate = (gridSize, x, y, classList, alt) => html`
<span alt=${alt} class="icon ${classList.join(' ')}" style="background-position: -${x * gridSize}px -${y * gridSize}px"></span>`;


const loader = document.createElement('div');
loader.className = 'spinner-overlay';
loader.innerHTML = `
<div class="spinner-container">
    <div class="lds-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>`;

export function mask() {
    document.body.appendChild(loader);
}

export function unmask() {
    loader.remove();
}