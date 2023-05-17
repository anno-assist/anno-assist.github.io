import { html, render } from '../../lib/lit-html.js';
import { createSubmitHandler } from '../../util.js';
import { icon } from '../partials.js';
import { buildings } from './catalog.js';
import { LayoutController } from './controller.js';
import { detailsTemplate } from './details.js';
import { listen, stop } from './eventBus.js';
import { summarize } from './util.js';


const builderTemplate = (canvas, layouts, activeLayout, list, onForm, onLayout) => html`<h1>Building Layout</h1>
<section class="canvas-main clear">
    <div id="canvas-container">
        ${canvas}
    </div>
    <div id="canvas-controls">
        <form @submit=${onLayout}>
            <select name="layout">
                ${layouts.map(l => html`<option value=${l}>${l}</option>`)}
            </select>
            <button name="action" value="load">Load</button>
            <input type="text" name="layoutName" .value=${activeLayout}>
            <button name="action" value="save">Save</button>
            <button name="action" value="clear">Clear</button>
        </form>
        <form @submit=${onForm} class="layout-controls">
            ${list.map(([i, img]) => html`<button type="submit" name="buildingType" value=${i}>${icon(img)}</button>`)}
        </form>
        <div id="building-details"></div>
    </div>
</section>`;

export function builderView(ctx) {
    let layouts = ctx.layoutStorage.get();
    let activeLayout = '';

    const controller = LayoutController.instance;
    const list = Object.entries(buildings);

    update();

    controller.activate();

    listen('select', onSelect);

    function onLayout({ action, layout, layoutName }) {
        if (action == 'load') {
            const layoutData = layouts[layout];
            activeLayout = layout;
            controller.load(layoutData);
            update();
        } else if (action == 'save') {
            const layoutData = controller.save();
            layouts[layoutName] = layoutData;
            ctx.layoutStorage.set(layouts);
            update();
        } else if (action == 'clear') {
            activeLayout = '';
            controller.load([]);
            update();
        }
    }

    function update() {
        ctx.render(builderTemplate(controller.canvas, Object.keys(layouts), activeLayout, list, createSubmitHandler(controller.onFormUpdate), createSubmitHandler(onLayout)));
    }
}

export function builderExit(ctx, next) {
    const controller = LayoutController.instance;
    controller.disable();
    stop('select', onSelect);
    next();
}

/**
 * 
 * @param {Array<import('./world.js').Building>?} buildings 
 */
function onSelect(buildings) {
    if (buildings?.length > 0) {
        let summary = [];
        if (buildings.length == 1) {
            summary = summarize([...buildings[0].summary.values()]);
        }
        render(detailsTemplate(buildings, summary), document.getElementById('building-details'));
    } else {
        render(null, document.getElementById('building-details'));
    }
}

