export function title(value) {
    return function (ctx, next) {
        const name = ctx.islands?.find(i => i.url == ctx.selection?.island)?.name;
        if (name) {
            value = value.replace('$name', name);
        }
        ctx.customTitle = value;
        next();
    };
}