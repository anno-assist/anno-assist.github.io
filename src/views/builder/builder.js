import { html, render } from '../../lib/lit-html.js';
import { createSubmitHandler } from '../../util.js';
import { LayoutController } from './controller.js';
import { detailsTemplate } from './details.js';
import { listen, stop } from './eventBus.js';
import { buildings } from './world.js';


const builderTemplate = (canvas, list, onForm, onSave) => html`<h1>Building Layout</h1>
<section class="canvas-main clear">
    <div id="canvas-container">
        ${canvas}
    </div>
    <div id="canvas-controls">
        <form @submit=${onForm} class="layout-controls">
            ${list.map(i => html`<button type="submit" name="buildingType" value=${i}>${i}</button>`)}
        </form>
        <button @click=${onSave}>Save</button>
        <div id="building-details"></div>
    </div>
</section>`;

export function builderView(ctx) {
    const controller = LayoutController.instance;
    const list = Object.keys(buildings);

    ctx.render(builderTemplate(controller.canvas, list, createSubmitHandler(controller.onFormUpdate), onSave));

    controller.activate(ctx.layoutStorage);
    controller.load();

    listen('select', onSelect);
}

export function builderExit(ctx, next) {
    const controller = LayoutController.instance;
    controller.disable();
    stop('select', onSelect);
    next();
}

function onSave() {
    const controller = LayoutController.instance;
    controller.save();
}

function onSelect(building) {
    if (building) {
        render(detailsTemplate(building), document.getElementById('building-details'));
    } else {
        render(null, document.getElementById('building-details'));
    }
}

