import { createPopulation, updatePopulation } from '../data/population.js';
import { html } from '../lib/lit-html.js';
import { createSubmitHandler, round, throttle } from '../util.js';
import { icon } from './partials.js';


const populationTemplate = (data, settings, onSubmit) => html`
<h1>Population</h1>
<section class="main">
    <form @submit=${onSubmit} @input=${onSubmit}>
        <table>
            <tbody>
                <tr>
                    <th colspan="3">Occident</th>
                </tr>
                <tr>
                    <th>Level</th>
                    <th>Residences</th>
                    <th>Inhabitants</th>
                </tr>
                ${Object.entries(data.occident).map(([k, v]) => levelRow(settings, k, v))}
                <tr>
                    <th colspan="3">Orient</th>
                </tr>
                <tr>
                    <th>Level</th>
                    <th>Residences</th>
                    <th>Inhabitants</th>
                </tr>
                ${Object.entries(data.orient).map(([k, v]) => levelRow(settings, k, v))}
            </tbody>
        </table>
    </form>
</section>`;

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
        return ctx.page.redirect('/');
    }
    if (ctx.population[islandUrl] == undefined) {
        const model = {
            game: ctx.game.objectId,
            island: island.objectId,
            peasant: 0,
            citizen: 0,
            patrician: 0,
            noble: 0,
            beggar: 0,
            nomad: 0,
            envoy: 0,
        };

        const result = await createPopulation(model);
        Object.assign(model, result);
        ctx.population[islandUrl] = model;
        ctx.setPopulation(ctx.population);
    }
    const population = ctx.population[islandUrl];

    ctx.commit = throttle(updatePopulation, 5000);

    const occidentKeys = Object.entries(popSettings.ascension).filter(([k, { type }]) => type == 'occident').map(([k]) => k);
    const orientKeys = Object.entries(popSettings.ascension).filter(([k, { type }]) => type == 'orient').map(([k]) => k);

    update();

    function update() {
        const data = {
            occident: Object.fromEntries(occidentKeys.map(k => keysToPop(k, population, popSettings.ascension))),
            orient: Object.fromEntries(orientKeys.map(k => keysToPop(k, population, popSettings.ascension))),
        };
        ctx.render(populationTemplate(data, popSettings.ascension, createSubmitHandler(onSubmit)));
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
            population[type] = round(houses * popSettings.ascension[type].capacity, 0);
        } else if (mode == 'pop') {
            const pop = data[`${type}_pop`];
            population[type] = pop;
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