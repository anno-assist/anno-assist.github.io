import { html } from '../lib/lit-html.js';
import { classMap } from '../lib/directives/class-map.js';
import { to } from '../util.js';
import { icon } from './partials.js';


export const layoutTemplate = (tab, islands, current, mode = 'population', onChange, content) => html`
<header>
    <nav class="main-nav">
        <div class="nav-left">
            <a href=${to('/settings')} class=${classMap({ nav: true, tab: true, active: tab=='/settings'  })}>
                ${icon('settings')}
            </a>
        </div>
        <div class="nav-left">
            <a href=${to('/')} class=${classMap({ nav: true, tab: true, active: tab=='/'  })}>
                ${icon('islands')}
            </a>
        </div>
        <div class="nav-section">
            <select @change=${onChange} class="nav select tab ${current ? 'active' : ''}" .value=${current}>

            ${!current ? html`<option value="null" style="font-style: italic" selected>-- Select Island
                    --</option>` : null}

                ${islands.map(i => html`<option value=${i.url} ?selected=${current == i.url}>${i.name}</option>`)}
            </select>

            ${islands.map(i => html`
            <a
                class="nav island-nav tab ${current == i.url ? 'active' : ''}"
                href=${to(`/${i.url}/${mode}`)}>
                <span class="nav-label">${i.name}</span>
            </a>`)}
        </div>
    </nav>

    ${current ? html`<nav class="sub-nav">
        <a class=${mode == 'ascension' ? 'active' : ''} href=${to(`/${current}/ascension`)}>Ascension</a>
        <a class=${mode == 'population' ? 'active' : ''} href=${to(`/${current}/population`)}>Population</a>
        <a class=${mode == 'needs' ? 'active' : ''} href=${to(`/${current}/needs`)}>Needs</a>
    </nav>` : null}
    
</header>
<main>
    ${content}
</main>`;