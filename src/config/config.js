import { getBase } from '../util.js';


export async function loadConfig(name) {
    try {
        // TODO use environment base to select file version
        const request = await fetch(`/src/config${getBase()}/${name}.json`);
        const data = await request.json();

        return data;

    } catch (err) {
        alert ('Could not load config file: ' + name);
        throw new Error('Could not load config file: ' + name);
    }
}

export async function loadImage(name) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = `/static/${name}`;
        image.addEventListener('load', resolve(image));
        image.addEventListener('error', reject(new Error('Could not load file: ' + name)));
    });
}

const iconPath = {
    '/1404': 'icons_1404.webp',
    '/2070': 'icons_2070.png',
};

export async function loadIcons() {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = `/static/${iconPath[getBase()]}`;
        image.addEventListener('load', resolve(image));
        image.addEventListener('error', reject(new Error('Could not load file: ' + name)));
    });
}