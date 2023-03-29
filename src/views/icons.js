import { html } from '../lib/lit-html.js';
import { iconTemplate } from './partials.js';


const iconsTemplate = () => html`
<h1>Icons</h1>
<section class="main">
    <div class="clear">
        <table class="left">
            ${(new Array(22)).fill(0).map(row)}
        </table>
        <textarea class="left" id="output"></textarea>
    </div>
</section>`;

const row = (_, y) => html`
<tr>
    ${(new Array(22)).fill(0).map((_, x) => col(x, y))}
</tr>`;

const col = (x, y) => html`
<td @click=${onClick} data-x=${x} data-y=${y}><span class="sub">${x},${y}</span>${iconTemplate(46, x, y, [])}</td>`;

export function iconsView(ctx) {
    ctx.render(iconsTemplate());
}

function onClick({ target }) {
    while (target.tagName != 'TD') {
        target = target.parentElement;
    }
    const x = target.dataset.x;
    const y = target.dataset.y;
    const name = prompt('Provide name');

    document.getElementById('output').value += `"${name}": [${x},${y}],\n`;
}