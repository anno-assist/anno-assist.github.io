export function addSelection(ctx, next) {
    ctx.selection = {
        island: ctx.params.island,
        mode: ctx.params.mode
    };

    next();
}