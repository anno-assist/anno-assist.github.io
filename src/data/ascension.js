import { del, get, post, put } from './api.js';
import { filter, addOwner, islandPointer } from './queries.js';


const endpoints = {
    catalog: '/classes/Ascension',
    byIslandId: islandId => `/classes/Ascension?${filter('island', islandPointer(islandId))}`,
    byId: '/classes/Ascension/'
};

export async function getAscension(islandId) {
    const data = await get(endpoints.byIslandId(islandId));
    return data.results;
}

export async function createAscension(ascension) {
    addOwner(ascension);
    ascension.island = islandPointer(ascension.island);
    return post(endpoints.catalog, ascension);
}

export async function updateAscension(id, ascension, dontMask = false) {
    if (typeof ascension.owner == 'string') {
        addOwner(ascension);
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