import { html } from '../lib/lit-html.js';
import { getRate } from '../util.js';
import { icon } from './partials.js';


const productionTemplate = (production) => html`
<h1>Production and Consumption Rates</h1>
<section class="main">
    <style>th { position: sticky; top: 0; }</style>
    <table>
        <thead>
            <tr>
                <th>Good</th>
                <th>Input A</th>
                <th>Rate A</th>
                <th>Chains A</th>
                <th>Input B</th>
                <th>Rate B</th>
                <th>Chains B</th>
                <th>Output</th>
            </tr>
        </thead>
        <tbody>
            ${production.map(data => productionRow(data, production))}
        </tbody>
    </table>
</section>`;

const productionRow = ([type, { output, input_A, rate_A, input_B, rate_B }], settings) => html`
<tr>
    <td>${icon(type)}</td>
    <td>${input_A && icon(input_A)}</td>
    <td><span class="label">${rate_A}</span></td>
    <td><span class="label">${getRate(output, input_A, rate_A, settings)}</span></td>
    <td>${input_B && icon(input_B)}</td>
    <td><span class="label">${rate_B}</span></td>
    <td><span class="label">${getRate(output, input_B, rate_B, settings)}</span></td>
    <td><span class="label">${output}</span></td>
</tr>`;

export function productionView(ctx) {
    const production = ctx.settings.production;

    ctx.render(productionTemplate(Object.entries(production)));
}
