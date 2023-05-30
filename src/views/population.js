import { createPopulation, updatePopulation } from '../data/population.js';
import { html } from '../lib/lit-html.js';
import { createSubmitHandler, round, throttle, to } from '../util.js';
import { icon } from './partials.js';


const populationTemplate = (keysData, settings, onSubmit) => html`
<h1>Population</h1>
<section class="main">
    <form @submit=${onSubmit} @input=${onSubmit}>
        <table>
            <tbody>
                ${keysData.map(k => factionTable(k.name, k.data, settings))}
            </tbody>
        </table>
    </form>
</section>`;

const factionTable = (name, factionData, settings) => html`
<tr>
    <th colspan="3">${name}</th>
</tr>
<tr>
    <th>Level</th>
    <th>Residences</th>
    <th>Inhabitants</th>
</tr>
${factionData.map(([k, v]) => levelRow(settings, k, v))}`;

const levelRow = (settings, type, pop) => html`
<tr>
    <td>${icon(type, 'dist')}<span class="label wide">${settings[type].name}</span></td>
    <td class="input-cell">
        <input class="pop-input" name="${type}_houses" data-mode="houses" data-type=${type} .value=${pop.houses}
            inputmode="numeric">
    </td>
    <td class="input-cell">
        <input class="pop-input" name="${type}_pop" data-mode="pop" data-type=${type} .value=${pop.pop}
            inputmode="numeric">
    </td>
</tr>`;


export async function populationView(ctx) {
    const popSettings = ctx.settings.population;
    const islandUrl = ctx.selection.island;
    const island = ctx.islands.find(i => i.url == islandUrl);
    if (!island) {
        return ctx.page.redirect(to('/'));
    }
    if (ctx.population[islandUrl] == undefined || ctx.population[islandUrl].island.objectId != island.objectId) {
        const dataModel = Object.fromEntries(Object.keys(popSettings.ascension).map(k => [k, 0]));
        const model = {
            game: ctx.game.objectId,
            island: island.objectId,
            data: dataModel
        };

        const result = await createPopulation(model);
        Object.assign(model, result);
        ctx.population[islandUrl] = model;
        ctx.setPopulation(ctx.population);
    }
    const population = ctx.population[islandUrl];

    ctx.commit = throttle(updatePopulation, 5000);

    const factionKeys = popSettings.types.map(({ type, name }) => ({ type, name, keys: Object.entries(popSettings.ascension).filter(([k, { type: t }]) => t == type).map(([k]) => k) }));

    update();

    function update() {
        const keysData = factionKeys.map(faction => Object.assign({}, faction, { data: faction.keys.map(k => keysToPop(k, population.data, popSettings.ascension)) }));

        ctx.render(populationTemplate(keysData, popSettings.ascension, createSubmitHandler(onSubmit)));
    }

    function onSubmit(data, form, event) {
        const src = event.target;
        const mode = src.dataset.mode;
        const type = src.dataset.type;

        if (Number.isFinite(data[`${type}_houses`]) == false || Number.isInteger(data[`${type}_pop`]) == false) {
            return;
        }

        if (mode == 'houses') {
            const houses = data[`${type}_houses`];
            population.data[type] = round(houses * popSettings.ascension[type].capacity, 0);
        } else if (mode == 'pop') {
            const pop = data[`${type}_pop`];
            population.data[type] = pop;
        }

        ctx.setPopulation(ctx.population);
        ctx.commit(population.objectId, population, true);

        update();
    }
}

function keysToPop(key, population, settings) {
    return [key, {
        pop: population[key],
        houses: round(population[key] / settings[key].capacity, 1)
    }];
}