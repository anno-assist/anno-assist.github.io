import { html } from '../lib/lit-html.js';
import { createIsland, deleteIslandBatch, updateIsland } from '../data/islands.js';
import { createSubmitHandler, createUrl, to } from '../util.js';
import { updateGame } from '../data/games.js';
import { deleteAscensionBatch } from '../data/ascension.js';
import { deletePopulationBatch } from '../data/population.js';
import { batch } from '../data/api.js';


const islandsTemplate = (islands, popSummary, onCreate, onDelete, onRename, onMove) => html`
<h1>Islands Overview</h1>
<section class="main">
    <table>
        <thead>
            <tr>
                <th class="wide">Order</th>
                <th>Name</th>
                <th class="wide">Population</th>
                <th>Details</th>
                <th class="wide">Controls</th>
            </tr>
        </thead>
        <tbody>
            ${islands.map((i, index) => islandRow(index, i, popSummary[i.url], onDelete.bind(i), onRename.bind(i), onMove.bind(i)))}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5">
                    <form @submit=${onCreate}>
                        <input type="text" name="name">
                        <button class="btn"><i class="fa-solid fa-plus"></i> Create</button>
                    </form>
                </td>
            </tr>
        </tfoot>
    </table>
</section>`;


const islandRow = (index, island, popSummary, onDelete, onRename, onMove) => html`
<tr>
    <td class="wide">
        <div class="btn-grid">
            <button class="btn" @click=${onMove.bind(null, index)}><i class="fa-solid fa-arrow-up"></i></button>
            <button class="btn" @click=${onMove.bind(null, index + 2)}><i class="fa-solid fa-arrow-down"></i></button>
        </div>
    </td>
    <td>
        <span class="label prim">${island.name}</span>
        <span class="label sub narrow">Population:&nbsp;${popSummary}</span>
        <div class="grid narrow">
            <button class="btn" @click=${onMove}><i class="fa-solid fa-arrow-down-up-across-line"></i></button>
            <button class="btn" @click=${onRename}><i class="fa-solid fa-pencil"></i></button>
            <button class="btn" @click=${onDelete}><i class="fa-solid fa-trash-can"></i></button>
        </div>
    </td>
    <td class="wide"><span class="label prim">${popSummary}</span></td>
    <td>
        <div class="btn-grid">
            <a class="btn" href=${to(`/${island.url}/ascension`)}>Ascension</a>
            <a class="btn" href=${to(`/${island.url}/population`)}>Population</a>
            <a class="btn" href=${to(`/${island.url}/needs`)}>Needs</a>
        </div>
    </td>
    <td class="wide">
        <div class="btn-grid">
            <button @click=${onRename} class="btn">Rename</button>
            <button @click=${onDelete} class="btn">Delete</button>
        </div>
    </td>
</tr>`;

const noActiveGameTemplate = () => html`
<h1>Islands Overview</h1>
<section class="main">
    <div class="box">
        There is no game selected. Go to the settings page to <a class="link" href=${to('/settings')}>Load or Create a game.</a>
    </div>
</section>`;


export async function islandsView(ctx) {
    const popSettings = ctx.settings.population;
    const game = ctx.game;
    if (!game) {
        return ctx.render(noActiveGameTemplate());
    }

    const islands = ctx.islands;
    const popSummary = Object.fromEntries(islands.map(i => [i.url, 0]));

    for (let i in popSummary) {
        if (ctx.population[i]) {
            popSummary[i] = Object.keys(popSettings.ascension).map(k => ctx.population[i].data[k]).reduce((a, c) => a + c, 0);
        }
    }

    update();

    function update() {
        ctx.render(islandsTemplate(islands, popSummary, createSubmitHandler(onCreate), onDelete, onRename, onMove));
    }

    async function onCreate({ name }, form) {
        if (!name) {
            return;
        }

        const island = {
            game: ctx.game.objectId,
            name,
            url: createUrl(name)
        };

        const result = await createIsland(island);
        Object.assign(island, result);
        islands.push(island);
        game.islands.push(island.objectId);
        ctx.setIslands(islands);

        // NOTE: Async operation
        updateGame(game.objectId, game).then(() => ctx.setGame(game));

        form.reset();

        update();
    }

    async function onDelete() {
        const id = this.objectId;
        const index = islands.findIndex(i => id == i.objectId);
        if (index == -1) {
            return alert('Island not found, please reload game');
        }
        const choice = confirm(`Are you sure you want to delete ${islands[index].name}?`);

        if (choice) {
            const ascensionId = ctx.ascension[this.url]?.objectId;
            const populationId = ctx.population[this.url]?.objectId;
            const operations = [deleteIslandBatch(id)];
            if (ascensionId) {
                operations.push(deleteAscensionBatch(ascensionId));
            }
            if (populationId) {
                operations.push(deletePopulationBatch(populationId));
            }

            const result = await batch(operations);

            if (result.every(x => x.hasOwnProperty('success'))) {
                islands.splice(index, 1);
                game.islands.splice(index, 1);
                ctx.setIslands(islands);
                
                // NOTE: Async operation
                updateGame(game.objectId, game).then(() => ctx.setGame(game));
                
                update();
            } else {
                alert('An error occured. Please, reload the game and try again.');
            }
        }
    }

    async function onRename() {
        const id = this.objectId;
        const index = islands.findIndex(i => id == i.objectId);
        const island = islands[index];

        const newName = prompt(`Enter new name for ${island.name}`, island.name);

        if (newName) {
            island.name = newName;
            island.url = createUrl(newName);
            const result = await updateIsland(id, island);
            Object.assign(island, result);
            ctx.setIslands(islands);

            update();
        }
    }

    async function onMove(order) {
        const id = this.objectId;
        const oldIndex = islands.findIndex(i => id == i.objectId);
        const island = islands[oldIndex];

        if (typeof order != 'number') {
            const input = prompt('Enter new order', oldIndex + 1);
            order = Number(input);
            if (input == null || input == '' || Number.isInteger(order) == false) {
                return;
            }
        }

        const newIndex = order - 1;
        if (newIndex < 0) {
            newIndex = 0;
        }
        if (newIndex >= islands.length) {
            newIndex = islands.length - 1;
        }
        islands.splice(oldIndex, 1);
        islands.splice(newIndex, 0, island);
        game.islands = islands.map(i => i.objectId);

        await updateGame(game.objectId, game);
        ctx.setIslands(islands);
        ctx.setGame(game);

        update();
    }
}