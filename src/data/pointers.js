import { getUserData } from '../util.js';


export function addOwner(obj) {
    const userData = getUserData();

    if (userData == null) {
        throw new ReferenceError('User is not logged in');
    }

    const id = userData.objectId;

    obj.owner = {
        __type: 'Pointer',
        className: '_User',
        objectId: id
    };

    return obj;
}