export async function loadConfig(name) {
    try {
        const request = await fetch(`/src/config/${name}.json`);
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