export function addStorage(ctx, next) {
    ctx.game = getActiveGame();
    ctx.setGame = setActiveGame.bind(ctx);

    next();
}

function setActiveGame(game) {
    this.game = game;
    localStorage.setItem('activeGame', JSON.stringify(game));
}

function getActiveGame() {
    return JSON.parse(localStorage.getItem('activeGame'));
}

function removeActiveGame() {
    localStorage.removeItem('activeGame');
}

const island = {
    objectId: 'string',
    name: 'string',
    // population: 'number'
};

const population = {
    peasant: 0,
    citizen: 0,
    patrician: 0,
    noble: 0,
    beggar: 0,
    nomad: 0,
    envoy: 0
};