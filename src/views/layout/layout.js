import { html } from '../../lib/lit-html.js';
import { createSubmitHandler } from '../../util.js';
import { LayoutController } from './controller.js';


const layoutTemplate = (canvas, onForm) => html`<h1>Building Layout</h1>
<section class="canvas-main clear">
    <div id="canvas-container">
        ${canvas}
    </div>
    <div id="canvas-controls">
        <form @submit=${onForm} class="layout-controls">
            Dimensions
            <label>Width <input name="width" value="1">
            <label>Height <input name="height" value="1">
            <label>Influence <input name="radius" value="5">
            <button name="place">Place</button>
        </form>
    </div>
</section>`;

export function layoutView(ctx) {
    const controller = LayoutController.instance;

    ctx.render(layoutTemplate(controller.canvas, createSubmitHandler(controller.onFormUpdate)));

    controller.activate();
}

export function layoutExit(ctx, next) {
    const controller = LayoutController.instance;
    controller.disable();
    next();
}