const storageVersion = '2';
const userDataName = 'userData';


const userData = createStorage(userDataName);
export const getUserData = userData.get;
export const setUserData = userData.set;
export const clearUserData = userData.clear;

export function createStorage(name, defaultValue = null) {
    const path = name == userDataName ? name : name + getBase();
    if (path != userDataName && localStorage.getItem(`${path}_version`) != storageVersion) {
        localStorage.removeItem(path);
        localStorage.setItem(`${path}_version`, storageVersion);
    }
    let data;

    return {
        get: () => {
            if (data == undefined) {
                const value = localStorage.getItem(path);
                try {
                    data = JSON.parse(value);
                } catch (err) {
                    localStorage.removeItem(path);
                    data = null;
                }
            }
            return data || defaultValue;
        },
        set: (value) => {
            data = value;
            localStorage.setItem(path, JSON.stringify(value));
        },
        clear: () => {
            data = undefined;
            localStorage.removeItem(path);
        }
    };
}

export function createSubmitHandler(callback) {
    return function (event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        if (event.submitter) {
            formData.append(event.submitter.name, event.submitter.value);
        }
        const data = Object.fromEntries([...formData.entries()].map(([k, v]) => {
            v = v.trim();
            if (k != 'password' && k != 'repass') {
                const asNumber = Number(v);
                if (Number.isFinite(asNumber)) {
                    v = asNumber;
                }
            }
            return [k, v];
        }));

        callback(data, form, event);
    };
}

export function throttle(fn, delay) {
    let timer = null;

    const result = function (...params) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
            fn(...params);
        }, delay);

        result.commit = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
                fn(...params);
            }
        };
    };

    return result;
}

const urlPattern = /[^A-Za-z0-9]/g;

export function createUrl(name) {
    return name.replace(urlPattern, () => '-');
}

export function percent(value, rate) {
    return value * rate / 100;
}

export function popRate(value, rate) {
    return Math.floor(percent(value, rate));
}

export function round(value, precision) {
    return Math.round(value * 10 ** precision) / 10 ** precision;
}

export function ceil(value, precision) {
    return Math.ceil(value * 10 ** precision) / 10 ** precision;
}

export function outputToKgPerMin(output) {
    return (60 / output) * 1000;
}

/**
 * 
 * @param {number} output Seconds per ton produced
 * @param {string} input Input good
 * @param {number} rate Tons consumed per ton produced
 * @param {Object} settings Production config
 * @returns 
 */
export function getRate(output, input, rate, settings) {
    if (!input) {
        return null;
    }
    const consumable = settings[input];
    consumable.output / output * rate;

    return round(consumable.output / output * rate, 3);
}

export function deepClone(ref) {
    if (Array.isArray(ref)) {
        return ref.map(deepClone);
    } else if (typeof ref == 'object' && ref !== null) {
        return Object.fromEntries(Object.entries(ref).map(([k, v]) => [k, deepClone(v)]));
    } else {
        return ref;
    }
}

export function pretty(...refs) {
    refs.forEach(r => console.log(JSON.stringify(r, null, 2)));
}

let base = window.basePath || null;
delete window.basePath;
if (base == null) {
    alert('Application base path not configured');
}

export function setBase(value) {
    base = value;
}

export function getBase() {
    return base;
}

export function to(uri) {
    return base + uri;
}

export function getIslandRelations(islandId, ctx) {
    const island = ctx.islands.find(i => islandId == i.objectId);
    const ascensionId = ctx.ascension[island?.url]?.objectId;
    const populationId = ctx.population[island?.url]?.objectId;

    return {
        islandId,
        ascensionId,
        populationId
    };
}