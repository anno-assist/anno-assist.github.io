import { html } from '../../lib/lit-html.js';
import { canvas, gfx } from './canvas.js';


const layoutTemplate = () => html`<h1>Building Layout</h1>
<section class="canvas-main clear">
    <div id="canvas-container">
        ${canvas}
    </div>
    <div id="canvas-controls">
        <form class="layout-controls">
            Dimensions
            <label>Width <input name="width">
            <label>Height <input name="height">
            <label>Influence <input name="radius">
        </form>
    </div>
</section>`;

export function layoutView(ctx) {
    ctx.render(layoutTemplate());
}