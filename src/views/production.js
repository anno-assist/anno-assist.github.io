import { html } from '../lib/lit-html.js';
import { getRate, pretty, round } from '../util.js';
import { productionChain } from './chains.js';
import { icon, smallIcon } from './partials.js';


const productionTemplate = (type, chains, requirements) => html`
<div class="chain">
    <div class="member reqs">${requirements.map((r, i, a) => requirementTemplate(r, (a.length == 2) && (i == 0 ?
    'top-req' : 'bot-req')))}</div>
    <div class="member">${icon(type)}<span class="label">${round(chains, 1)}</span></div>
</div>`;

const requirementTemplate = (content, ...dir) => html`
<div class="input">${content}${smallIcon('input', ...['left', 'narrow', ...dir])}${icon('input', ...['left', 'wide',
    ...dir])}</div>`;

/**
 * 
 * @param {Object} settings 
 * @param {{civIndex: [], needsIndex: [], needsByGroup: Object, summary: Map}} summary 
 * @returns {[]}
 */
export function productionSection(settings, summary) {
    if (!summary) {
        return null;
    }
    // const chain = settings[type];

    return html`
    <div class="clear wide">
        ${summary.needsIndex.map(n => html`
        <div class="product">
            ${productionChain(n, settings, summary.summary.get(n).chains)}
        </div>`)}
    </div>`;
}

/*
export function productionRow(settings, type, chains) {
    return html`
        <div class="product">
            ${productionChain(settings, type, chains)}
        </div>`;
}
*/

/*
function productionChain(settings, type, chains) {
    const chain = settings[type];

    const requirements = chain.inputs.map(({type: inputType, rate}) => {
        const required = getRate(chain.output, inputType, rate, settings) * chains;
        return productionChain(settings, inputType, required);
    });

    return productionTemplate(type, chains, requirements);
}
*/