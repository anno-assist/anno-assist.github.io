import { loadConfig } from '../../config/config.js';
import { chainsTemplate } from '../chains.js';


export async function chains2070View(ctx) {
    const chains = await loadConfig('production_2070');

    ctx.render(chainsTemplate(Object.entries(chains)));
}