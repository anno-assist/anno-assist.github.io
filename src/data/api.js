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


const bacthLimit = 20;

function prepare(method, url, data) {
    const options = {
        method,
        path: url
    };

    if (data !== undefined) {
        options.body = data;
    }

    return options;
}

export const batchPost = prepare.bind(null, 'POST');
export const batchPut = prepare.bind(null, 'PUT');
export const batchDel = prepare.bind(null, 'DELETE');

export async function batch(...requests) {
    if (Array.isArray(requests[0]) && requests.length == 1) {
        requests = requests[0];
    }
    const pages = Math.ceil(requests.length / bacthLimit);
    const batches = new Array(pages);

    for (let i = 0; i < batches.length; i++) {
        batches[i] = requests.slice(i * bacthLimit, (i + 1) * bacthLimit);
    }

    const batchResult = [];
    const userData = getUserData();

    for (let batch of batches) {
        const options = {
            method: 'post',
            headers: {
                'X-Parse-Application-Id': appId,
                'X-Parse-JavaScript-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests: batch })
        };

        if (userData) {
            const token = userData.sessionToken;
            options.headers['X-Parse-Session-Token'] = token;
        }
    
        try {
            const response = await fetch(host + '/batch', options);
    
            let result;
            if (response.status != 204) {
                result = await response.json();
            }
    
            if (response.ok == false) {
                const error = result;
                throw {
                    message: error.error,
                    handled: false
                };
            }
    
            batchResult.push(result);
    
        } catch (err) {
            batchResult.push(err);
        }
    }

    return batchResult.flat();
}