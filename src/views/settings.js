import { getAscension } from '../data/ascension.js';
import { create, deleteGame, getGames } from '../data/games.js';
import { getIslands } from '../data/islands.js';
import { getPopulation } from '../data/population.js';
import { html } from '../lib/lit-html.js';
import { createSubmitHandler } from '../util.js';
import { icon, smallIcon } from './partials.js';


const settingsTemplate = (games, user, onCreate, onDelete, onLoad, error) => html`
<h1>Settings Page</h1>
<section class="main">
    ${!user ? html`
    <div class="box label">
        <a class="link" href="/login">Sign in</a> to enable cloud sync
    </div>` : html`
    <div class="box">
        <i class="fa-solid fa-user-check"></i> Logged in as ${user.username}. <a class="link" href="/logout">Logout</a>
    </div>
    <table>
        <thead>
            <tr>
                <th>Game Name</th>
                <th>Controls</th>
            </tr>
        </thead>
        <tbody>
            ${games.length == 0 ? html`
            <tr>
                <td colspan="2">No games are recorded</td>
            </tr>` : games.map((g, i) => gameRow(g, onDelete.bind(null, i), onLoad.bind(null, i)))}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2">
                    <form @submit=${onCreate}>
                        ${error ? html`<p class="error">${error}</p>` : null}
                        <input type="text" name="name" placeholder="Game Name">
                        <button class="btn"><i class="fa-solid fa-plus"></i> Create</button>
                    </form>
                </td>
            </tr>
        </tfoot>
    </table>`}

</section>`;

const gameRow = (game, onDelete, onLoad) => html`
<tr>
    <td>
        ${game.active ? smallIcon('arrow', 'left') : null}<span class="label left">${game.name}</span>
    </td>
    <td>
        <button @click=${onLoad} class="btn"><i class="fa-solid fa-download"></i> Load</button>
        <button @click=${onDelete} class="btn"><i class="fa-solid fa-trash-can"></i> Delete</button>
    </td>
</tr>`;


export async function settingsView(ctx) {
    const games = ctx.user ? await getGames() : [];

    update();

    function update(error) {
        if (ctx.game) {
            for (let game of games) {
                if (game.objectId == ctx.game.objectId) {
                    game.active = true;
                } else {
                    game.active = false;
                }
            }
        }

        ctx.render(settingsTemplate(games, ctx.user, createSubmitHandler(onCreate), onDelete, onLoad, error));
    }

    async function onCreate({ name }, form) {
        try {
            if (name == '') {
                throw { message: 'Name is required' };
            }

            const gameData = { name, islands: [] };

            const result = await create(gameData);
            Object.assign(gameData, result);
            games.push(gameData);

            form.reset();

            update();
        } catch (err) {
            update(err.message);
            err.handled = true;
        }
    }

    async function onDelete(index) {
        const game = games[index];

        const choice = confirm(`Are you sure you want to delete "${game.name}"?`);

        if (choice) {
            await deleteGame(game.objectId);
            games.splice(index, 1);
            update();
        }
    }

    async function onLoad(index) {
        const game = games[index];

        ctx.setGame(game);

        const [islandData, ascensionData, populationData] = await Promise.all([
            getIslands(game.objectId),
            getAscension(game.objectId),
            getPopulation(game.objectId)
        ]);
        const islandIndex = Object.fromEntries(islandData.map(i => [i.objectId, i]));
        const islands = game.islands.map(id => islandIndex[id]);
        ctx.setIslands(islands);
        const ascension = Object.fromEntries(ascensionData.map(a => [islandIndex[a.island.objectId].url, a]));
        ctx.setAscension(ascension);
        const population = Object.fromEntries(populationData.map(a => [islandIndex[a.island.objectId].url, a]));
        ctx.setPopulation(population);

        update();
    }
}