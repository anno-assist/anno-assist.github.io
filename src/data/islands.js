import { get, post } from './api.js';
import { filter, addOwner, gamePointer } from './queries.js';


const endpoints = {
    catalog: '/classes/Island',
    byGameId: gameId => `/classes/Island?${filter('game', gamePointer(gameId))}`,
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