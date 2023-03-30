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
import { ratesView } from './views/rates.js';
import { iconsView } from './views/icons.js';
import { title } from './middlewares/title.js';
import { chainsView } from './views/chains.js';


page('/:island/:mode', addSelection);
page(addSession);
page(addConfig);
page(addStorage);
page(addRender);
page(addCommit);
page('/index.html', '/');
page('/', title('Islands'), islandsView);
page('/settings', title('Settings'), settingsView);
page('/login', title('Login'), loginView);
page('/register', title('Register'), registerView);
page('/:island/ascension', hasGame, title('$name | Ascnesion'), ascensionView);
page('/:island/population', hasGame, title('$name | Population'), populationView);
page('/:island/needs', hasGame, title('$name | Needs'), needsView);
page('/rates', title('Production'), ratesView);
page('/icons', title('Icons'), iconsView);
page('/chains', title('Production Chains'), chainsView);

page.start();