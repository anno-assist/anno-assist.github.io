import page from './lib/page.mjs';
import { html } from './lib/lit-html.js';
import { addRender } from './middlewares/render.js';
import { settingsView } from './views/settings.js';
import { islandsView } from './views/islands.js';


page(addRender);
page('/index.html', '/');
page('/', islandsView);
page('/settings', settingsView);

page.start();