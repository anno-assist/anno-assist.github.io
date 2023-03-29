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

const ratesRow = ([type, { output, input_A, rate_A, input_B, rate_B }], settings) => html`
<tr>
    <td>${icon(type)}</td>
    <td><span class="label">${output}</span></td>
    <td>${input_A && icon(input_A)}</td>
    <td><span class="label">${rate_A}</span></td>
    <td><span class="label">${getRate(output, input_A, rate_A, settings)}</span></td>
    <td>${input_B && icon(input_B)}</td>
    <td><span class="label">${rate_B}</span></td>
    <td><span class="label">${getRate(output, input_B, rate_B, settings)}</span></td>
</tr>`;

export function ratesView(ctx) {
    const rates = ctx.settings.production;

    ctx.render(ratesTemplate(Object.entries(rates)));
}
