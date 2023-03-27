import { createStorage } from '../util.js';


export function addStorage(ctx, next) {
    ctx.game = gameStorage.get();
    ctx.islands = islandStorage.get();
    ctx.setGame = setActiveGame.bind(ctx);
    ctx.setIslands = setIslands.bind(ctx);

    next();
}

const gameStorage = createStorage('activeGame');
const islandStorage = createStorage('islands');

function setActiveGame(game) {
    this.game = game;
    gameStorage.set(game);
}

function setIslands(islands) {
    this.islands = islands;
    islandStorage.set(islands);
}


/*
  Model structure
*/
const island = {
    objectId: 'string',
    game: 'ObjectId',
    name: 'string',
    // population: 'number'
};

const population = {
    island: 'ObjectId',
    peasant: 0,
    citizen: 0,
    patrician: 0,
    noble: 0,
    beggar: 0,
    nomad: 0,
    envoy: 0
};