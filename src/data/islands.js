import { del, get, post, put } from './api.js';
import { filter, addOwner, gamePointer } from './queries.js';


const endpoints = {
    catalog: '/classes/Island',
    byGameId: gameId => `/classes/Island?${filter('game', gamePointer(gameId))}`,
    byId: '/classes/Island/'
};

export async function getIslands(gameId) {
    const islands = await get(endpoints.byGameId(gameId));
    return islands.results;
}

export async function createIsland(island) {
    addOwner(island);
    island.game = gamePointer(island.game);
    return post(endpoints.catalog, island);
}

export async function deleteIsland(id) {
    return del(endpoints.byId + id);
}

export async function updateIsland(id, island) {
    if (typeof island.owner == 'string') {
        addOwner(island);
    }
    if (typeof island.game == 'string') {
        island.game = gamePointer(island.game);
    }
    delete island.createdAt;
    delete island.updatedAt;
    return put(endpoints.byId + id, island);
}