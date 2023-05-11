import { html } from '../../lib/lit-html.js';
import { emit } from './eventBus.js';


export const detailsTemplate = (buildings) => html`
${buildings?.length == 1 ? html`
<h3>${buildings[0].type}</h3>
<p>X: ${buildings[0].x}</p>
<p>Y: ${buildings[0].y}</p>` : html`<p>Selected ${buildings.length}</p>`}

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
