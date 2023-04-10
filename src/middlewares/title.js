export function title(value) {
    return function (ctx, next) {
        let currentValue = value;

        const name = ctx.islands?.find(i => i.url == ctx.selection?.island)?.name;
        if (name) {
            currentValue = currentValue.replace('$name', name);
        }
        ctx.customTitle = currentValue;

        document.title = [currentValue, 'Anno Assist'].filter(x => x).join(' | ');

        next();
    };
}