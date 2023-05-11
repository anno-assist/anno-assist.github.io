import { html } from '../../lib/lit-html.js';


export const detailsTemplate = (building) => html`
<h3>${building.type}</h3>
<p>X: ${building.x}</p>
<p>Y: ${building.y}</p>
`;