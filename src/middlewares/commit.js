let currentFn = null;

export function addCommit(ctx, next) {
    if (typeof currentFn == 'function' && typeof currentFn.commit == 'function') {
        currentFn.commit();
        currentFn = null;
    }

    Object.defineProperty(ctx, 'commit', {
        set: (fn) => {
            currentFn = fn;
        },
        get: () => currentFn
    });

    next();
}