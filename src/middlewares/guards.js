export function hasGame(ctx, next) {
    if (!ctx.game) {
        ctx.page.redirect('/settings');
    } else {
        next();
    }
}