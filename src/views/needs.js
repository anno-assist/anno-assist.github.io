import { html } from '../lib/lit-html.js';


export function needsView(ctx) {
    ctx.render(html`<h1>Needs</h1>`);
}