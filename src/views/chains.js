import { html } from '../lib/lit-html.js';
import { getRate, round } from '../util.js';
import { icon } from './partials.js';


const chainsTemplate = (chains) => html`
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
    <td>${icon(type)}</td>
    <td><span class="label">${output}</span></td>
    ${inputCols(inputs[0], output, settings)}
    ${inputCols(inputs[1], output, settings)}
</tr>
${inputs.length > 0 ? html`<tr>
    <td colspan="8">${productionChain(type, settings)}</td>
</tr>` : null}`;

const inputCols = (input, output, settings) => input ? html`
<td>${icon(input.type)}</td>
<td><span class="label">${input.rate}</span></td>
<td><span class="label">${getRate(output, input.type, input.rate, settings)}</span></td>` : html`
<td colspan="3"></td>`;

const chainTable = (matrix) => html`
<table class="chain-table">
    ${matrix.map(chainRow)}
</table>`;

const chainRow = row => html`<tr>${row.map(chainCol)}</tr>`;

const chainCol = col => {
    if (col) {
        if (col.content == 'input') {
            return chainArrow(col);
        } else {
            return html`
            <td rowspan=${col.size}>
                ${col.content && html`
                <div class="ingredient">
                    ${icon(col.content)}
                    ${col.rate && html`<span class="label">${round(col.rate, 1)}</span>`}
                </div>`}
            </td>`;
        }
    }
};

const chainArrow = col => html`<td class="arrow ${col.position}" rowspan=${col.size}>
    <div></div>
</td>`;

export function productionChain(type, settings, rate = 1) {
    const matrix = chain(type, settings, 0, rate);

    const result = [];

    for (let i = 0; i < matrix.size; i++) {
        const row = [];
        for (let j = 0; j < matrix.levels; j++) {
            row[j] = null;
        }
        result[i] = row;
    }

    const output = parse(matrix);

    return chainTable(output);
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
    // const chains = await loadConfig('production2070');

    ctx.render(chainsTemplate(Object.entries(chains)));
}