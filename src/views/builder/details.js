import { html } from '../../lib/lit-html.js';
import { emit } from './eventBus.js';


export const detailsTemplate = (buildings, summary) => html`
${buildings?.length == 1 ? html`<h3>${buildings[0].type}</h3>` : html`<p>Selected ${buildings.length}</p>`}
<div>
    <button ?disabled=${buildings.length == 0} @click=${onCopy}>Copy</button>
    <button ?disabled=${buildings.length == 0} @click=${onMove}>Move</button>
    <button ?disabled=${buildings.length == 0} @click=${onDemolish}>Demolish</button>
    <button ?disabled=${buildings.length == 0} @click=${onReplace}>Replace</button>
</div>
${buildings?.length == 1 ? summary.map(([k,v]) => html`<p>${k}: <strong>${v}</strong></p>`) : html`<p>Selected ${buildings.length}</p>`}`;

function onCopy() {
    emit('copy');
}

function onMove() {
    emit('move');
}

function onDemolish() {
    emit('demolish');
}

function onReplace() {
    emit('replace');
}
