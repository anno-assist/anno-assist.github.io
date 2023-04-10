import { html } from '../lib/lit-html.js';
import { getRate } from '../util.js';
import { icon } from './partials.js';


const ratesTemplate = (rates) => html`
<h1>Production and Consumption Rates</h1>
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
            ${rates.map(data => ratesRow(data, Object.fromEntries(rates)))}
        </tbody>
    </table>
</section>`;

const ratesRow = ([type, { output, inputs }], settings) => html`
<tr>
    <td>${icon(type)}</td>
    <td><span class="label">${output}</span></td>
    ${inputCols(inputs[0], output, settings)}
    ${inputCols(inputs[1], output, settings)}
</tr>`;

const inputCols = (input, output, settings) => input ? html`
<td>${icon(input.type)}</td>
<td><span class="label">${input.rate}</span></td>
<td><span class="label">${getRate(output, input.type, input.rate, settings)}</span></td>` : html`
<td colspan="3"></td>`;

export function ratesView(ctx) {
    const rates = ctx.settings.production;

    ctx.render(ratesTemplate(Object.entries(rates)));
}
