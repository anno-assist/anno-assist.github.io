import page from './lib/page.mjs';

import { addSelection } from './middlewares/selection.js';
import { addSession } from './middlewares/session.js';
import { addStorage } from './middlewares/storage.js';
import { addRender } from './middlewares/render.js';

import { settingsView } from './views/settings.js';
import { islandsView } from './views/islands.js';
import { loginView } from './views/login.js';
import { registerView } from './views/register.js';
import { ascensionView } from './views/ascension.js';
import { populationView } from './views/population.js';
import { needsView } from './views/needs.js';

import * as api from './data/islands.js';
window.api = api;


page('/:island/:mode', addSelection);
page(addSession);
page(addStorage);
page(addRender);
page('/index.html', '/');
page('/', islandsView);
page('/settings', settingsView);
page('/login', loginView);
page('/register', registerView);
page('/:island/ascension', ascensionView);
page('/:island/population', populationView);
page('/:island/needs', needsView);

page.start();