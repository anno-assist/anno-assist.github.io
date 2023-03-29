import page from './lib/page.mjs';

import { addSelection } from './middlewares/selection.js';
import { addSession } from './middlewares/session.js';
import { addStorage } from './middlewares/storage.js';
import { addRender } from './middlewares/render.js';
import { addConfig } from './middlewares/config.js';
import { addCommit } from './middlewares/commit.js';
import { hasGame } from './middlewares/guards.js';

import { settingsView } from './views/settings.js';
import { islandsView } from './views/islands.js';
import { loginView } from './views/login.js';
import { registerView } from './views/register.js';
import { ascensionView } from './views/ascension.js';
import { populationView } from './views/population.js';
import { needsView } from './views/needs.js';
import { productionView } from './views/production.js';
import { iconsView } from './views/icons.js';


page('/:island/:mode', addSelection);
page(addSession);
page(addConfig);
page(addStorage);
page(addRender);
page(addCommit);
page('/index.html', '/');
page('/', islandsView);
page('/settings', settingsView);
page('/login', loginView);
page('/register', registerView);
page('/:island/ascension', hasGame, ascensionView);
page('/:island/population', hasGame, populationView);
page('/:island/needs', hasGame, needsView);
page('/production', productionView);
page('/icons', iconsView);

page.start();