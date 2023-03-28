import { del, get, post, put } from './api.js';
import { filter, addOwner, islandPointer, gamePointer } from './queries.js';


const endpoints = {
    catalog: '/classes/Ascension',
    byGameId: gameId => `/classes/Ascension?${filter('game', gamePointer(gameId))}`,
    byId: '/classes/Ascension/'
};

export async function getAscension(gameId) {
    const data = await get(endpoints.byGameId(gameId));
    return data.results;
}

export async function createAscension(ascension) {
    addOwner(ascension);
    ascension.game = gamePointer(ascension.game);
    ascension.island = islandPointer(ascension.island);
    return post(endpoints.catalog, ascension);
}

export async function updateAscension(id, ascension, dontMask = false) {
    if (typeof ascension.owner == 'string') {
        addOwner(ascension);
    }
    if (typeof ascension.game == 'string') {
        ascension.game = gamePointer(ascension.game);
    }
    if (typeof ascension.island == 'string') {
        ascension.island = islandPointer(ascension.island);
    }
    delete ascension.createdAt;
    delete ascension.updatedAt;
    return put(endpoints.byId + id, ascension, dontMask);
}

export async function deleteAscension(id) {
    return del(endpoints.byId + id);
}