import { setUserData } from '../util.js';
import { post } from './api.js';

const endpoints = {
    sessionByToken: (token) => `/sessions${filter('sessionToken', token)}`,
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

export async function logout(ctx, next) {
    const user = getUserData();
    const [session] = (await get(endpoints.sessionByToken(user.sessionToken)))
        .results;

    await del(endpoints.sessionById(session.objectId));
    clearUserData();

    ctx.page.redirect('/settings');
    next();
}