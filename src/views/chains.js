import { html } from '../lib/lit-html.js';
import { getRate, round } from '../util.js';
import { icon } from './partials.js';


export const chainsTemplate = (chains) => html`
<h1>Production and Consumption chains</h1>
<section class="main">
    <style>th { position: sticky; top: 0; }</style>
    <table>
        <thead>
            <tr>
                <th>Good</th>
                <th>Output</th>
                <th>Input A</th>
                <th>Rate A</th>
                <th>Chains A</th>
                <th>Input B</th>
                <th>Rate B</th>
                <th>Chains B</th>
            </tr>
        </thead>
        <tbody>
            ${chains.map(data => chainsRow(data, Object.fromEntries(chains)))}
        </tbody>
    </table>
</section>`;

const chainsRow = ([type, { output, inputs }], settings) => html`
<tr>
    <td><abbr title=${type}>${icon(type, 'dist')}</abbr><span class="label">${type}</span></td>
    <td><span class="label">${output}</span></td>
    ${inputCols(inputs[0], output, settings)}
    ${inputCols(inputs[1], output, settings)}
</tr>
${inputs.length > 0 ? html`<tr>
    <td colspan="8">${productionChain(type, settings)}</td>
</tr>` : null}`;

const inputCols = (input, output, settings) => input ? html`
<td>${icon(input.type, 'dist')}<span class="label">${input.type}</span></td>
<td><span class="label">${input.rate}</span></td>
<td><span class="label">${getRate(output, input.type, input.rate, settings)}</span></td>` : html`
<td colspan="3"></td>`;

const chainTable = (matrix, type, visible, toggle) => html`
<table @click=${toggle} class="chain-table" data-type=${type} data-role="chain" style=${!visible ? 'display: none' : ''}>
    ${matrix.map(chainRow)}
</table>`;

const chainRow = row => html`<tr>${row.map(chainCol)}</tr>`;

const chainCol = col => {
    if (col) {
        if (col.content == 'input') {
            return chainArrow(col);
        } else {
            return html`
            <td rowspan=${col.size} class="chain-cell">
                ${col.content && ingredient(col.content, col.rate)}
            </td>`;
        }
    }
};

const chainArrow = col => html`<td class="arrow ${col.position}" rowspan=${col.size}>
    <div></div>
</td>`;

const ingredient = (name, rate, ...classList) => html`
<div class=${['ingredient', ...classList].join(' ')}>
    <abbr title=${name}>
        ${icon(name)}
    </abbr>
    ${rate && html`<span class="label">${round(rate, 2)}</span>`}
</div>`;

export function productionChain(type, settings, rate = 1, hasToggle) {
    let detailed = true;

    const matrix = chain(type, settings, 0, rate);
    const output = parse(matrix);

    const result = [];

    if (hasToggle) {
        detailed = false;
        result.push(flat(matrix, type, toggle));
    }
    result.push(chainTable(output, type, detailed, toggle));

    return result;

    function toggle() {
        if (!hasToggle) {
            return;
        }

        if (detailed) {
            detailed = false;
            document.querySelector(`table[data-type="${type}"][data-role="chain"]`).style.display = 'none';
            document.querySelector(`div[data-type="${type}"][data-role="flat"]`).removeAttribute('style');
        } else {
            detailed = true;
            document.querySelector(`table[data-type="${type}"][data-role="chain"]`).removeAttribute('style');
            document.querySelector(`div[data-type="${type}"][data-role="flat"]`).style.display = 'none';
        }
    }
}

function flat(data, type, toggle) {
    const queue = [data];
    const result = [];

    while (queue.length > 0) {
        const item = queue.shift();
        queue.push(...item.inputs);

        result.push(ingredient(item.content, item.rate, 'inline'));
    }

    return html`<div @click=${toggle} data-type=${type} data-role="flat">${result}</div>`;
}

function parse(data) {
    const size = data.size;
    const levels = data.levels;
    const queue = [data];
    const result = [];
    for (let i = 0; i < levels; i++) {
        result.push([]);
    }

    while (queue.length > 0) {
        const item = queue.shift();
        if (item.inputs.length == 0 && (item.depth + 1) < levels) {
            queue.push(cell(null, item.depth + 1));
        } else {
            queue.push(...item.inputs);
        }

        const row = result[item.depth];
        row.push(...[item, ...(new Array(item.size - 1).fill(null))]);
    }

    const transposed = [];
    for (let i = 0; i < size; i++) {
        transposed.push([]);
    }

    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].length; j++) {
            transposed[j][i] = result[i][j];
        }
    }

    return transposed.map(i => i.flatMap((item, index, arr) => {
        const grid = [item];

        if (index != 0) {
            if (item && item.content) {
                const arrow = cell('input', item.depth + 1, null, item.position);
                arrow.size = item.size;
                grid.unshift(arrow);
            } else {
                grid.unshift(item && cell(null, item.depth + 1));
            }
        }

        if (index < arr.length - 1) {
            if (item && item.inputs.length > 0) {
                const arrow = cell('input', item.depth + 1, null, 'mid');
                arrow.size = item.size;
                grid.push(arrow);
            } else {
                grid.push(item && cell(null, item.depth + 1));
            }
        }


        return grid;
    }));
}

function chain(type, settings, depth, rate = 1, position = null) {
    const chainData = settings[type];
    const result = cell(type, depth, rate, position);

    const inputCells = chainData.inputs.map(({ type: inputType, rate: inputRate }, index) => chain(
        inputType,
        settings,
        depth + 1,
        getRate(chainData.output / rate, inputType, inputRate, settings),
        chainData.inputs.length == 2 ? (index == 0 ? 'top' : 'bottom') : 'mid'
    ));

    result.size = inputCells.map(c => c.size).reduce((a, c) => a + c, 0) || 1;
    result.levels = 1 + Math.max(0, ...inputCells.map(i => i.levels));
    result.inputs = inputCells;

    return result;
}

function cell(content, depth, rate, position) {
    return {
        content,
        depth,
        rate,
        position,
        size: 1,
        levels: 1,
        inputs: []
    };
}

export async function chainsView(ctx) {
    const chains = ctx.settings.production;

    ctx.render(chainsTemplate(Object.entries(chains)));
}