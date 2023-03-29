import { html } from '../lib/lit-html.js';
import { deepClone, outputToKgPerMin, pretty, round } from '../util.js';
import { icon, smallIcon } from './partials.js';


const needsTemplate = (sections) => html`
<h1>Needs</h1>
<section class="main">
    ${sections}
</section>`;

const needsSection = (civIndex, needsIndex, needsByGroup, summary) => html`
<table class="wide">
    <thead>
        <tr>
            <th>Level</th>
            ${needsIndex.map(n => html`<th>${icon(n, 'dist')}</th>`)}
        </tr>
    </thead>
    <tbody>
        ${civIndex.map(type => needsRow(needsIndex, needsByGroup[type]))}
    </tbody>
    <tfoot>
        <th>Total</th>
        ${needsIndex.map(n => html`<th>${needsCell(summary.get(n))}</th>`)}
    </tfoot>
</table>
<table class="narrow">
    <tbody>
        ${needsIndex.map(n => narrowRow(n, summary.get(n), needsByGroup))}
    </tbody>
</table>`;

const needsRow = (needsIndex, pop) => html`
<tr>
    <td>${icon(pop.type, 'dist')}<span class="label sub">${pop.pop}</span></td>
    ${needsIndex.map(needType => html`<td>${needsCell(pop.needs[needType])}</td>`)}
</tr>`;

const needsCell = (need) => !need ? null : html`
<span class="chains">${round(need.chains, 1)}</span>
<span class="label sub">${round(need.required / 1000, 1)}&nbsp;t/min</span>`;

const narrowRow = (needType, { required, chains }, needsByGroup) => !required ? null : html`
<tr>
    <td>${icon(needType, 'dist')}</td>
    <td>
        ${needsCell({ required, chains })}
    </td>
    <td>
        <div class="needs-grid">
            ${Object.values(needsByGroup).map(p => narrowCell(p.type, p.needs[needType]?.required, p.needs[needType]?.chains))}
        </div>
    </td>
</tr>`;

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
        sections.push(summarizeNeeds(occident, consumption, production));
        sections.push(summarizeNeeds(orient, consumption, production));
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
        return needsSection(civIndex, needsIndex, needsByGroup, summary);
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