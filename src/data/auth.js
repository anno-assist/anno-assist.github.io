import { setUserData } from '../util.js';
import { post } from './api.js';

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

export async function logout() {
    
}