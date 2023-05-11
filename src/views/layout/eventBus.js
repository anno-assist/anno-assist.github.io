/** @type {Map<string, Set>} */
const listeners = new Map();


export function emit(type, data) {
    const group = listeners.get(type);
    if (group) {
        for (let callback of group) {
            callback(data);
        }
    }
}

export function listen(type, callback) {
    if (listeners.has(type) == false) {
        listeners.set(type, new Set());
    }
    const group = listeners.get(type);
    group.add(callback);
}

export function stop(type, callback) {
    const group = listeners.get(type);
    if (group && group.has(callback)) {
        group.delete(callback);
    }
}