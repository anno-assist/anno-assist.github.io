import { html } from '../lib/lit-html.js';
import { round } from '../util.js';
import { icon, smallIcon } from './partials.js';


const needsTemplate = (sections) => html`
<h1>Needs</h1>
<section class="main">
    ${sections}
</section>`;

const needsSection = (index, needs, summary, production, goods) => html`
<table class="wide">
    <thead>
        <tr>
            <th>Level</th>
            ${index.map(n => html`<th><abbr title=${goods[n].name}>${icon(n, 'dist')}</abbr></th>`)}
        </tr>
    </thead>
    <tbody>
        ${needs.map(needsRow.bind(null, index, production))}
    </tbody>
    <tfoot>
        <th>Total</th>
        ${index.map(n => html`<th>${needsCell(summary.get(n), production[n])}</th>`)}
    </tfoot>
</table>
<table class="narrow">
    <tbody>
        ${index.map(n => narrowRow(n, summary.get(n), production[n], needs))}
    </tbody>
</table>`;

const needsRow = (index, production, pop) => html`
<tr>
    <td>${icon(pop.type, 'dist')}<span class="label sub">${pop.pop}</span></td>
    ${index.map(n => html`<td>${needsCell(pop.index[n], production[n])}</td>`)}
</tr>`;

const needsCell = (value, rate) => !value ? null : html`
<span class="chains">${round(value / rate, 1)}</span>
<span class="label sub">${round(value / 1000, 1)} t/min</span>`;

const narrowRow = (name, total, rate, pop) => !total ? null : html`
<tr>
    <td>${icon(name, 'dist')}</td>
    <td>
        ${needsCell(total, rate)}
    </td>
    <td>
        <div class="needs-grid">
            ${pop.map(p => [p.type, p.index[name]]).map(([type, value]) => narrowCell(type, value, rate))}
        </div>
    </td>
</tr>`;

const narrowCell = (type, value, rate) => !value ? null : html`
    ${smallIcon(type)}
    <span class="label">${round(value / rate, 1)}</span>
    <span class="label sub">(${round(value / 1000, 1)} t/min)</span>`;

export function needsView(ctx) {
    const popSettings = ctx.settings.population;
    const consumption = ctx.settings.consumption;
    const production = ctx.settings.production;
    const goods = ctx.settings.goods;
    const islandUrl = ctx.selection.island;
    const population = ctx.population[islandUrl];

    const occident = Object.fromEntries(Object.entries(popSettings.ascension).filter(([k, { type }]) => type == 'occident').map(([k]) => [k, population[k]]));
    const orient = Object.fromEntries(Object.entries(popSettings.ascension).filter(([k, { type }]) => type == 'orient').map(([k]) => [k, population[k]]));

    const sections = [];
    if (population) {
        sections.push(summarizeNeeds(occident, consumption, production, goods));
        sections.push(summarizeNeeds(orient, consumption, production, goods));
    }

    ctx.render(needsTemplate(sections));
}

function summarizeNeeds(pop, consumption, production, goods) {
    const needs = getNeeds(pop, consumption);
    needs.forEach(calcNeeds);
    const summary = summarize(needs);
    needs.forEach(n => n.index = Object.fromEntries(n.needs.map(x => [x.key, x.total])));

    if (summary.get('total') == 0) {
        return null;
    } else {
        const index = [...summary.keys()].slice(1);     // Omit first item (total)

        return needsSection(index, needs, summary, production, goods);
    }
}

function getNeeds(group, config) {
    return Object.entries(group)
        .map(([type, pop]) => ({ type, pop, needs: config[type] }));
}

/**
 * 
 * @param {{ type: string, pop: number, needs: PopNeed[]}} group 
 */
function calcNeeds(group) {
    group.needs.forEach(n => n.total = n.kgPerMinute * group.pop);
}

function summarize(pop) {
    const summary = new Map([['total', 0]]);

    for (const { key, total } of pop.flatMap(g => g.needs)) {
        if (summary.has(key) == false) {
            summary.set(key, 0);
        }
        summary.set(key, summary.get(key) + total);
        summary.set('total', summary.get('total') + total);
    }

    return summary;
}

/**
 * @typedef {Object} PopNeed
 * @property {string} key
 * @property {number} kgPerMinute
 * @property {number?} total
 */