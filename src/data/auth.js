import { clearUserData, setUserData } from '../util.js';
import { get, post, del } from './api.js';
import { filter } from './queries.js';

const endpoints = {
    sessionByToken: (token) => `/sessions?${filter('sessionToken', token)}`,
    sessionById: (id) => `/sessions/${id}`,
};

export async function register(username, password) {
    const { objectId, sessionToken } = await post('/users', { username, password });

    setUserData({
        username,
        objectId,
        sessionToken
    });
}

export async function login(username, password) {
    const { objectId, sessionToken } = await post('/login', { username, password });

    setUserData({
        username,
        objectId,
        sessionToken
    });
}

export async function logout(sessionToken) {
    const [session] = (await get(endpoints.sessionByToken(sessionToken)))
        .results;

    await del(endpoints.sessionById(session.objectId));
    clearUserData();
}