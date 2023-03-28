const itemName = 'userData';

const userData = createStorage(itemName);

export const getUserData = userData.get;
export const setUserData = userData.set;
export const clearUserData = userData.clear;

export function createStorage(name) {
    let data;

    return {
        get: () => {
            if (data == undefined) {
                const value = localStorage.getItem(name);
                try {
                    data = JSON.parse(value);
                } catch (err) {
                    localStorage.removeItem(name);
                    data = null;
                }
            }
            return data;
        },
        set: (value) => {
            data = value;
            localStorage.setItem(name, JSON.stringify(value));
        },
        clear: () => {
            data = undefined;
            localStorage.removeItem(name);
        }
    };
}

export function createSubmitHandler(callback) {
    return function (event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, v.trim()]));

        callback(data, form);
    };
}

const urlPattern = /[^A-Za-z0-9]/g;

export function createUrl(name) {
    return name.replace(urlPattern, () => '-');
}