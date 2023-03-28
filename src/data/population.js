import { del, get, post, put } from './api.js';
import { filter, addOwner, islandPointer, gamePointer } from './queries.js';


const endpoints = {
    catalog: '/classes/Population',
    byGameId: gameId => `/classes/Population?${filter('game', gamePointer(gameId))}`,
    byId: '/classes/Population/'
};

export async function getPopulation(gameId) {
    const data = await get(endpoints.byGameId(gameId));
    return data.results;
}

export async function createPopulation(population) {
    addOwner(population);
    population.game = gamePointer(population.game);
    population.island = islandPointer(population.island);
    return post(endpoints.catalog, population);
}

export async function updatePopulation(id, population, dontMask = false) {
    if (typeof population.owner == 'string') {
        addOwner(population);
    }
    if (typeof population.game == 'string') {
        population.game = gamePointer(population.game);
    }
    if (typeof population.island == 'string') {
        population.island = islandPointer(population.island);
    }
    delete population.createdAt;
    delete population.updatedAt;
    return put(endpoints.byId + id, population, dontMask);
}

export async function deletePopulation(id) {
    return del(endpoints.byId + id);
}