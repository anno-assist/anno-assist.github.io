import { html } from '../lib/lit-html.js';
import { createIsland, deleteIsland, updateIsland } from '../data/islands.js';
import { createSubmitHandler, createUrl } from '../util.js';


const islandsTemplate = (islands, onCreate, onDelete, onRename, onMove) => html`
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
            ${islands.map(i => islandRow(i, onDelete.bind(i), onRename.bind(i), onMove.bind(i)))}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5">
                    <form @submit=${onCreate}>
                        <input type="text" name="name">
                        <button class="btn">Create</button>
                    </form>
                </td>
            </tr>
        </tfoot>
    </table>
</section>`;


const islandRow = (island, onDelete, onRename, onMove) => html`
<tr>
    <td class="wide">
        <div class="btn-grid">
            <button class="btn" @click=${onMove}><i class="fa-solid fa-arrow-down-up-across-line"></i></button>
            <span class="label">${island.order}</span>
        </div>
    </td>
    <td>
        <span class="label prim">${island.name}</span>
        <span class="label sub narrow">Population:&nbsp;12061</span>
        <div class="grid narrow">
            <button class="btn" @click=${onMove}><i class="fa-solid fa-arrow-down-up-across-line"></i></button>
            <button class="btn" @click=${onRename}><i class="fa-solid fa-pencil"></i></button>
            <button class="btn" @click=${onDelete}><i class="fa-solid fa-trash-can"></i></button>
        </div>
    </td>
    <td class="wide"><span class="label prim">12061</span></td>
    <td>
        <div class="btn-grid">
            <a class="btn" href="/${island.url}/ascension">Ascension</a>
            <a class="btn" href="/${island.url}/population">Population</a>
            <a class="btn" href="/${island.url}/needs">Needs</a>
            <!-- <a href="/lit$398638298$/industry">Industry</a> -->
        </div>
    </td>
    <td class="wide">
        <div class="btn-grid">
            <button @click=${onRename} class="btn">Rename</button>
            <button @click=${onDelete} class="btn">Delete</button>
        </div>
    </td>
</tr>`;


export async function islandsView(ctx) {
    const game = ctx.game;
    if (!game) {
        ctx.page.redirect('/settings');
    }

    const islands = ctx.islands;

    update();

    function update() {
        ctx.render(islandsTemplate(islands, createSubmitHandler(onCreate), onDelete, onRename, onMove));
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
        ctx.setIslands(islands);

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
            await deleteIsland(id);
            islands.splice(index, 1);
            ctx.setIslands(islands);

            update();
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

    async function onMove() {
        const id = this.objectId;
        const oldIndex = islands.findIndex(i => id == i.objectId);
        const island = islands[oldIndex];

        const input = prompt('Enter new order', island.order);
        const order = Number(input);
        if (input == null || input == '' || Number.isInteger(order) == false) {
            return;
        }

        island.order = order;
        const result = await updateIsland(id, island);
        Object.assign(island, result);
        islands.sort((a, b) => a.order - b.order);
        ctx.setIslands(islands);

        update();
    }
}