import { html } from '../lib/lit-html.js';
import { getIslands } from '../data/islands.js';


const islandsTemplate = (islands) => html`
<h1>Islands Page</h1>
<ul>
    ${islands.map(i => html`<li>${i.name}</li>`)}
</ul>`;


export async function islandsView(ctx) {
    const game = ctx.game;
    if (!game) {
        ctx.page.redirect('/settings');
    }
    const islands = await getIslands(game.objectId);
    ctx.render(islandsTemplate(islands));
}