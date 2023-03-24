import { html } from '../lib/lit-html.js';
import { get } from '../data/api.js';


const islandsTemplate = (onClick) => html`
<h1>Islands Page</h1>
<button @click=${onClick}>Make Request</button>`;


export function islandsView(ctx) {
    ctx.render(islandsTemplate(onClick));

    async function onClick() {
        get('/classes/Game');
    }
}