import { html } from '../../lib/lit-html.js';
import { emit } from './eventBus.js';


export const detailsTemplate = (buildings, summary) => html`
${buildings?.length == 1 ? html`
<h3>${buildings[0].type}</h3>
${summary.map(([k,v]) => html`<p>${k}: <strong>${v}</strong></p>`)}` : html`<p>Selected ${buildings.length}</p>`}

<div>
    <button @click=${() => onCopy(buildings)}>Copy</button>
    <button @click=${() => onMove(buildings)}>Move</button>
    <button @click=${() => onDemolish(buildings)}>Demolish</button>
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
