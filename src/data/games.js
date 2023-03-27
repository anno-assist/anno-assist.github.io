import { del, get, post } from './api.js';
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