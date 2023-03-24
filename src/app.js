import page from './lib/page.mjs';

import { addRender } from './middlewares/render.js';

import { settingsView } from './views/settings.js';
import { islandsView } from './views/islands.js';
import { loginView } from './views/login.js';
import { addSession } from './middlewares/session.js';
import { addStorage } from './middlewares/storage.js';


page(addSession);
page(addStorage);
page(addRender);
page('/index.html', '/');
page('/', islandsView);
page('/settings', settingsView);
page('/login', loginView);

page.start();