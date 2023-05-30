import { getBase } from '../util.js';
import { del, get, post, put } from './api.js';
import { addOwner, filter } from './queries.js';


const endpoints = {
    catalog: version => `/classes/Game?${filter('version', version)}`,
    create: '/classes/Game',
    byId: '/classes/Game/'
};

export async function getGames() {
    const version = getBase();
    return (await get(endpoints.catalog(version))).results;
}

export async function create(game) {
    addOwner(game);
    game.version = getBase();
    return post(endpoints.create, game);
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