import { html } from '../lib/lit-html.js';
import { repeat } from '../lib/directives/repeat.js';
import { createAscension, updateAscension } from '../data/ascension.js';
import { createSubmitHandler, popRate, throttle } from '../util.js';
import { icon } from './partials.js';


const ascensionTemplate = (islandId, occident, orient, data, onSubmit) => html`
<h1>Ascension Pyramid</h1>
<section class="main">
    <form @submit=${onSubmit} @input=${onSubmit}>

        <section>
            <h3>Occident</h3>
            ${occident(html`
            <tr>
                <td>${icon('peasant_house', 'dist')}</td>
                <td colspan="4"><input class="pop-input" name="occident" inputmode="number" .value=${data.occident}>
                </td>
            </tr>
            <tr>
                <td>${icon('beggar', 'dist')}</td>
                <td colspan="4">
                    <div class="multi-input">
                        <input class="pop-input" name="beggars" inputmode="number" .value=${data.beggars}>
                    </div>
                    <div class="multi-level">
                        <label class="label">Beggar Prince</label>
                        <div class="label">
                            ${radioLvl(islandId, 'beggarLvl', data.beggarLvl)}
                        </div>
                    </div>
                </td>
            </tr>
            </tr>
            <tr>
                <td>${icon('envoy', 'dist')}</td>
                <td colspan="4">
                    <div class="multi-input">
                        <input class="pop-input" name="envoys" inputmode="number" .value=${data.envoys}>
                    </div>
                    <div class="multi-level">
                        <label class="label">Envoy's Favour</label>
                        <div class="label">
                            ${radioLvl(islandId, 'envoyLvl', data.envoyLvl)}
                        </div>
                    </div>
                </td>
            </tr>`)}
        </section>

        <section>
            <h3>Orient</h3>
            ${orient(html`
            <tr>
                <td>${icon('nomad_house', 'dist')}</td>
                <td colspan="2"><input class="pop-input" name="orient" inputmode="number" .value=${data.orient}></td>
            </tr>`)}
        </section>
    </form>
</section>`;

const radioLvl = (islandId, name, lvl) => repeat([0, 1, 2, 3], () => Math.random(), n => html`
<input data-island=${islandId} name=${name} type="radio" value=${n} ?checked=${lvl==n}>`);

const ascensionSection = (distribution) => (form) => html`
<table>
    <thead>
        ${form}
        <tr class="wide">
            <th></th>
            ${distribution.map((_, i, { length: l }) => html`<th>Level ${l - i}</th>`)}
        </tr>
    </thead>
    <tbody>
        ${distribution.map(ascensionRow)}
    </tbody>
</table>
<tr>

</tr>`;

const ascensionRow = ({ key, name, dist }) => html`
<tr>
    <td>${icon(key, 'dist')}</td>
    ${[...dist].reverse().map((v, i) => html`<td class=${i > 0 ? 'wide' : ''}>
        ${v.houses ? html`
        <span class="label">${v.houses}</span>
        <span class="label sub">${v.pop} ${name}</span>` : null}
    </td>`)}
</tr>`;

export async function ascensionView(ctx) {
    const popSettings = ctx.settings.population;
    const islandUrl = ctx.selection.island;
    const island = ctx.islands.find(i => i.url == islandUrl);
    if (!island) {
        return ctx.page.redirect('/');
    }
    if (ctx.ascension[islandUrl] == undefined) {
        const model = {
            game: ctx.game.objectId,
            island: island.objectId,
            occident: 0,
            orient: 0,
            beggars: 0,
            beggarLvl: 0,
            envoys: 0,
            envoyLvl: 0
        };
        const result = await createAscension(model);
        Object.assign(model, result);
        ctx.ascension[islandUrl] = model;
        ctx.setAscension(ctx.ascension);
    }
    const ascension = ctx.ascension[islandUrl];

    ctx.commit = throttle(updateAscension, 5000);

    update();

    function update() {
        const occident = calcAscension(popSettings, 'occident', ascension);
        const orient = calcAscension(popSettings, 'orient', ascension);

        ctx.render(ascensionTemplate(island.objectId, ascensionSection(occident), ascensionSection(orient), ascension, createSubmitHandler(onSubmit)));
    }

    function onSubmit(data, form) {
        const { occident, orient, beggars, beggarLvl, envoys, envoyLvl } = data;
        ascension.occident = occident;
        ascension.orient = orient;
        ascension.beggars = beggars;
        ascension.beggarLvl = beggarLvl;
        ascension.envoys = envoys;
        ascension.envoyLvl = envoyLvl;

        ctx.setAscension(ctx.ascension);
        ctx.commit(ascension.objectId, ascension, true);

        update();
    }
}

function calcAscension(popSettings, selectedType, ascension) {
    const selected = Object
        .entries(popSettings.ascension)
        .filter(([_, g]) => g.type == selectedType && g.level >= 0)
        .sort((a, b) => a[1].level - b[1].level);
    const index = Object.fromEntries(selected);
    const keys = selected.map(([n]) => n);
    const levels = keys.length;

    const matrix = [];

    const bonusCitizenships = Math.floor(ascension.beggars / popSettings.bonuses.beggarLvl[ascension.beggarLvl]);
    const bonusLicenses = Math.floor(ascension.envoys / popSettings.bonuses.envoyLvl[ascension.envoyLvl]);

    for (let level = 0; level < levels; level++) {
        const current = [];

        for (let popLevel = 0; popLevel < levels; popLevel++) {
            let value = null;
            if (popLevel <= level) {
                if (popLevel == 0) {
                    value = ascension[selectedType];
                } else {
                    value = popRate(current[popLevel - 1], index[keys[popLevel]].rate);
                    if (selectedType == 'occident') {
                        if (popLevel == 1) {
                            value += bonusCitizenships || 0;
                        } else if (popLevel == 2) {
                            value += bonusLicenses || 0;
                        }
                        if (current[popLevel - 1] - value < 0) {
                            value = current[popLevel - 1];
                        }
                    }
                    current[popLevel - 1] -= value;
                }
            }
            current[popLevel] = value;
        }
        matrix[level] = current.map((v, i) => ({ houses: v, pop: v && v * index[keys[i]].capacity }));
    }

    const distribution = keys.map(key => ({ key, name: index[key].name, dist: [] }));
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            distribution[j].dist[i] = matrix[i][j];
        }
    }

    return distribution;
}