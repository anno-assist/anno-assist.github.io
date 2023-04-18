import { loadConfig } from '../../config/config.js';
import { html } from '../../lib/lit-html.js';
import { iconTemplate } from '../partials.js';


const iconsTemplate = () => html`
<h1>Icons</h1>
<section class="main">
    <div class="clear">
        <table class="left">
            ${(new Array(22)).fill(0).map(row)}
        </table>
        <div>
            <p id="next-item">
                ${items[0]}
            </p>
            <textarea class="left" id="output"></textarea>
        </div>
    </div>
</section>`;

const row = (_, y) => html`
<tr>
    ${(new Array(22)).fill(0).map((_, x) => col(x, y))}
</tr>`;

const col = (x, y) => Object.values(icons).find(([x1, y1]) => x1 == x && y1 == y) ? html`
<td><span class="sub">${x},${y}</span>${iconTemplate(46, x, y, ['icon-2070', 'found'])}
</td>` : html`
<td @click=${onClick} data-x=${x} data-y=${y}><span class="sub">${x},${y}</span>${iconTemplate(46, x, y, ['icon-2070'])}
</td>`;

let items = [];
let icons = [];
let ctx = null;

export async function icons2070View(ctxIn) {
    const config = await loadConfig('production_2070');
    icons = await loadConfig('icons_2070');
    items = Object.keys(config).filter(k => icons[k] == undefined);

    ctx = ctxIn;
    update();
}

function update() {
    ctx.render(iconsTemplate());
}

function onClick({ target }) {
    while (target.tagName != 'TD') {
        target = target.parentElement;
    }
    const x = target.dataset.x;
    const y = target.dataset.y;
    const name = items.shift();

    icons[name] = [x, y];
    document.getElementById('output').value += `"${name}": [${x},${y}],\n`;
    document.getElementById('next-item').textContent = items[0];
    update();
}