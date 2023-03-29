import { loadConfig } from '../config/config.js';
import { deepClone } from '../util.js';


let initialized = false;
const settings = {
    population: undefined,
    consumption: undefined,
    production: undefined,
    goods: undefined,
    icons: undefined,
};

export async function addConfig(ctx, next) {
    if (!initialized) {
        const requests = Object.keys(settings).map(key => [key, loadConfig(key)]);
        for (let entry of requests) {
            entry[1] = await entry[1];
        }
        Object.assign(settings, Object.fromEntries(requests));

        initialized = true;
    }

    ctx.settings = deepClone(settings);

    next();
}