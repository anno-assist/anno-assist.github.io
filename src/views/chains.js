import { loadConfig } from '../config/config.js';
import { html } from '../lib/lit-html.js';
import { getRate } from '../util.js';
import { icon } from './partials.js';
import { productionRow } from './production.js';


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

const chainsRow = ([type, { output, input_A, rate_A, input_B, rate_B }], settings) => html`
<tr>
    <td>${icon(type)}</td>
    <td><span class="label">${output}</span></td>
    <td>${input_A && icon(input_A)}</td>
    <td><span class="label">${rate_A}</span></td>
    <td><span class="label">${getRate(output, input_A, rate_A, settings)}</span></td>
    <td>${input_B && icon(input_B)}</td>
    <td><span class="label">${rate_B}</span></td>
    <td><span class="label">${getRate(output, input_B, rate_B, settings)}</span></td>
</tr>
${input_A != null ? html`<tr><td colspan="8">${productionRow(settings, type, 1)}</td></tr>` : null}`;

export async function chainsView(ctx) {
    const chains = ctx.settings.production;
    // const chains = await loadConfig('production2070');

    ctx.render(chainsTemplate(Object.entries(chains)));
}
