import { render } from '../lib/lit-html.js';


const root = document.getElementById('content');

export function addRender(ctx, next) {
    ctx.render = renderView;

    next();
}

function renderView(content) {
    render(content, root);
}