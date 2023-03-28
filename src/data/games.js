import { del, get, post, put } from './api.js';
import { addOwner } from './queries.js';


const endpoints = {
    catalog: '/classes/Game',
    byId: '/classes/Game/'
};

export async function getGames() {
    return (await get(endpoints.catalog)).results;
}

export async function create(game) {
    addOwner(game);
    return post(endpoints.catalog, game);
}

export async function deleteGame(id) {
    return del(endpoints.byId + id);
}

export async function updateGame(id, game) {
    if (typeof game.owner == 'string') {
        addOwner(game);
    }
    delete game.createdAt;
    delete game.updatedAt;
    delete game.active;

    return put(endpoints.byId + id, game);
}