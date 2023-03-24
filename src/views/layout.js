import { html } from '../lib/lit-html.js';
import {classMap} from '../lib/directives/class-map.js';


export const layoutTemplate = (tab, content) => html`
<header>
    <nav class="main-nav">
        <div class="nav-left">
            <a href="/settings" class=${classMap({nav: true, tab: true, active: tab == '/settings'})}>
                <span class="icon" style="background-position: -368px -736px"></span>
            </a>
        </div>
        <div class="nav-left">
            <a href="/" class=${classMap({nav: true, tab: true, active: tab == '/'})}>
                <span class="icon" style="background-position: -828px -736px"></span>
            </a>
        </div>
        <div class="nav-section">
            <select class="nav select tab ">

                <option value="null" style="font-style: italic" selected="">-- Select Island
                    --</option>

                <!-- Options for islands -->
                <!-- <option value="Wolf-s-Haven">Wolf's Haven</option>
                <option value="Ku-Raast">Ku'Raast</option>
                <option value="Blackrock">Blackrock</option> -->
            </select>

            <!-- Links to island -->
            <!-- <a class="nav island-nav tab " href="/population.html">
                <span class="nav-label">Wolf's Haven</span>
            </a>
            <a class="nav island-nav tab " href="/needs-orient.html">
                <span class="nav-label">Ku'Raast</span>
            </a>
            <a class="nav island-nav tab " href="/population.html">
                <span class="nav-label">Blackrock</span>
            </a> -->
        </div>
    </nav>
</header>
<main>
    ${content}
</main>`;