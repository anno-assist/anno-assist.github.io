import { html } from '../lib/lit-html.js';
import { deepClone, outputToKgPerMin, pretty, round } from '../util.js';
import { productionChain } from './chains.js';
import { icon, smallIcon } from './partials.js';
import { productionSection } from './production.js';


const needsTemplate = (sections) => html`
<h1>Needs</h1>
<section class="main">
    ${sections}
</section>`;

const needsSection = ({ civIndex, needsIndex, needsByGroup, summary }, productionSettings) => html`
<table>
    <thead class="wide">
        <tr>
            <th>Goods</th>
            <th>Total</th>
            ${civIndex.map(type => html`<th>${icon(type)}</th>`)}
            <th>Production Chains</th>
        </tr>
    </thead>
    <tbody>
        ${needsIndex.map(n => needsRow(n, summary.get(n), needsByGroup, productionSettings))}
    </tbody>
</table>`;

const needsRow = (needType, { required, chains }, needsByGroup, productionSettings) => {
    let visible = false;
    const details = productionSettings[needType].inputs.length ? html`
    <tr data-need=${needType} style="display: none">
        <td colspan="3">${productionChain(needType, productionSettings, chains)}</td>
    </tr>` : null;

    const toggle = details && smallIcon('process', 'toggle', 'narrow');

    return !required ? null : html`
    <tr>
        <td class="wide">${icon(needType, 'dist')}</td>
        <td class="narrow" @click=${toggleDetails} style="position: relative">${icon(needType, 'dist')}${toggle}</td>
        <td>
            ${needsCell({ required, chains })}
        </td>

        ${Object.values(needsByGroup).map(p => html`<td class="wide">
            ${needsCell(p.needs[needType])}
        </td>`)}

        <td class="narrow">
            <div class="needs-grid">
                ${Object.values(needsByGroup).map(p => narrowCell(p.type, p.needs[needType]?.required,
        p.needs[needType]?.chains))}
            </div>
        </td>

        <td class="wide" style="position: relative">
            ${productionChain(needType, productionSettings, chains, true)}
            ${details && smallIcon('process', 'toggle')}
        </td>
    </tr>
    ${details}`;

    function toggleDetails() {
        if (details) {
            if (visible) {
                visible = false;
                document.querySelector(`tr[data-need="${needType}"]`).style.display = 'none';
            } else {
                visible = true;
                document.querySelector(`tr[data-need="${needType}"]`).removeAttribute('style');
            }
        }
    }
};

const needsCell = (need) => !need ? null : html`
<span class="chains">${round(need.chains, 1)}</span>
<span class="label sub">${round(need.required / 1000, 1)}&nbsp;t/min</span>`;

const narrowCell = (type, required, chains) => !required ? null : html`
    ${smallIcon(type)}
    <span class="label">${round(chains, 1)}</span>
    <span class="label sub">(${round(required / 1000, 1)}&nbsp;t/min)</span>`;

export function needsView(ctx) {
    const popSettings = ctx.settings.population;
    const consumption = ctx.settings.consumption;
    const production = ctx.settings.production;
    const islandUrl = ctx.selection.island;
    const population = ctx.population[islandUrl];

    const occident = Object.fromEntries(Object.entries(popSettings.ascension).filter(([k, { type }]) => type == 'occident').map(([k]) => [k, population[k]]));
    const orient = Object.fromEntries(Object.entries(popSettings.ascension).filter(([k, { type }]) => type == 'orient').map(([k]) => [k, population[k]]));

    const sections = [];
    if (population) {
        const occidentSummary = summarizeNeeds(occident, consumption, production);
        const orientSummary = summarizeNeeds(orient, consumption, production);

        sections.push(occidentSummary && needsSection(occidentSummary, production));
        sections.push(orientSummary && needsSection(orientSummary, production));
    }

    ctx.render(needsTemplate(sections));
}

function summarizeNeeds(pop, consumption, production) {
    const civIndex = Object.keys(pop);
    const needsByGroup = addNeeds(pop, consumption);
    Object.values(needsByGroup).forEach(group => calcNeeds(group, production));
    const summary = summarize(needsByGroup);

    if (summary.get('total').required == 0) {
        return null;
    } else {
        const needsIndex = [...summary.keys()].slice(1);     // Omit first item (total)
        return { civIndex, needsIndex, needsByGroup, summary };
    }
}

function addNeeds(civ, config) {
    return Object.fromEntries(Object.entries(civ)
        .map(([type, pop]) => [
            type,
            {
                type,
                pop,
                needs: Object.fromEntries(config[type].map(n => [n.key, deepClone(n)]))
            }
        ]));
}

/**
 * 
 * @param {{ type: string, pop: number, needs: PopNeed[]}} group 
 */
function calcNeeds(group, production) {
    Object.values(group.needs).forEach(n => {
        n.required = n.kgPerMinute * group.pop;
        n.chains = n.required / outputToKgPerMin(production[n.key].output);
        n.name = production[n.key].name;
    });
}

function summarize(needsByGroup) {
    const total = { required: 0 };
    const summary = new Map([['total', total]]);

    for (const { key, required, chains } of Object.values(needsByGroup).flatMap(g => Object.values(g.needs))) {
        if (summary.has(key) == false) {
            summary.set(key, {
                required: 0,
                chains: 0
            });
        }
        const entry = summary.get(key);
        entry.required += required;
        entry.chains += chains;
        total.required += required;
    }

    return summary;
}

/**
 * @typedef {Object} PopNeed
 * @property {string} key
 * @property {number} kgPerMinute
 * @property {number?} required
 * @property {number?} chains
 */