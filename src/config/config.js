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