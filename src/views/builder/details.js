import { html } from '../../lib/lit-html.js';
import { emit } from './eventBus.js';


export const detailsTemplate = (buildings, summary) => html`
${buildings?.length == 1 ? html`
<h3>${buildings[0].type}</h3>
${summary.map(([k,v]) => html`<p>${k}: <strong>${v}</strong></p>`)}` : html`<p>Selected ${buildings.length}</p>`}

<div>
    <button ?disabled=${buildings.length == 0} @click=${() => onCopy(buildings)}>Copy</button>
    <button ?disabled=${buildings.length == 0} @click=${() => onMove(buildings)}>Move</button>
    <button ?disabled=${buildings.length == 0} @click=${() => onDemolish(buildings)}>Demolish</button>
    <button ?disabled=${buildings.length == 0} @click=${() => onReplace(buildings)}>Replace</button>
</div>
`;

function onCopy(buildings) {
    emit('copy', buildings);
}

function onMove(buildings) {
    emit('move', buildings);
}

function onDemolish(buildings) {
    emit('demolish', buildings);
}

function onReplace(buildings) {
    emit('replace', buildings);
}
