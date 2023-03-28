import { clearUserData, getUserData } from '../util.js';
import { mask, unmask } from '../views/partials.js';


const host = 'https://parseapi.back4app.com';
const appId = 'spy3L6x5hQksLMOD485zCcPCH26RkOQBBuFURAsY';
const apiKey = 'Oyy8cEdfraQpN651RGHoXoB3YVTrneykuc2g6DwI';

let inFlight = 0;

async function request(method, url, data, dontMask) {
    const options = {
        method,
        headers: {
            'X-Parse-Application-Id': appId,
            'X-Parse-JavaScript-Key': apiKey
        }
    };

    const userData = getUserData();
    if (userData) {
        const token = userData.sessionToken;
        options.headers['X-Parse-Session-Token'] = token;
    }

    if (data !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    }

    try {
        if (!dontMask) {
            inFlight++;
            mask();
        }
        const response = await fetch(host + url, options);

        let result;
        if (response.status != 204) {
            result = await response.json();
        }

        if (response.ok == false) {
            if (result.code == 209) {
                clearUserData();
            }
            const error = result;
            throw {
                message: error.error,
                handled: false
            };
        }

        return result;

    } catch (err) {
        handleError(err);
        throw err;
    } finally {
        if (!dontMask) {
            inFlight--;
            if (inFlight <= 0) {
                inFlight = 0;
                unmask();
            }
        }
    }
}

async function handleError(error) {
    await new Promise(r => setTimeout(r, 50));

    if (!error.handled) {
        alert(error.message);
    }
}

export const get = request.bind(null, 'get');
export const post = request.bind(null, 'post');
export const put = request.bind(null, 'put');
export const del = request.bind(null, 'delete');