import { clearUserData, getUserData } from '../util.js';


const host = 'https://parseapi.back4app.com';
const appId = 'spy3L6x5hQksLMOD485zCcPCH26RkOQBBuFURAsY';
const apiKey = 'Oyy8cEdfraQpN651RGHoXoB3YVTrneykuc2g6DwI';


async function request(method, url, data) {
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