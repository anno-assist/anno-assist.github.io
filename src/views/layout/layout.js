import { html } from '../../lib/lit-html.js';
import { canvas } from './canvas.js';


const layoutTemplate = () => html`<h1>Building Layout</h1>
${canvas}`;

export function layoutView(ctx) {
    ctx.render(layoutTemplate());
}