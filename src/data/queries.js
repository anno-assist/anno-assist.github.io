import { getUserData } from '../util.js';


export function addOwner(obj) {
    const userData = getUserData();

    if (userData == null) {
        throw new ReferenceError('User is not logged in');
    }

    const id = userData.objectId;

    obj.owner = pointer('_User', id);

    return obj;
}

export function pointer(className, objectId) {
    return {
        __type: 'Pointer',
        className,
        objectId
    };
}

export const gamePointer = pointer.bind(null, 'Game');
export const islandPointer = pointer.bind(null, 'Island');

export function filter(fieldName, value) {
    const query = JSON.stringify({[fieldName]: value});

    return `where=${encodeURIComponent(query)}`;
}