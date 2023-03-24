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