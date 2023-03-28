import { html } from '../lib/lit-html.js';
import { createSubmitHandler } from '../util.js';
import { register } from '../data/auth.js';


const registerTemplate = (onRegister, formData = {}, error) => html`
<h1>Register</h1>
<section class="main">
    <form @submit=${onRegister}>
        ${error ? html`<p class="error">${error}</p>` : null}
        <div class="layout">
            <label for="username">Username</label>
            <input id="username" type="text" name="username" .value=${formData.username || ''}>
            <label for="password">Password</label>
            <input id="password" type="password" name="password">
            <label for="repass">Repeat</label>
            <input id="repass" type="password" name="repass">
        </div>
        <button class="btn form-row action">Sign Up</button>
    </form>
    <div class="box label">
        Already have an account? <a class="link" href="/login">Sign in here</a>
    </div>
</section>`;


export function registerView(ctx) {
    update();

    function update(formData, error) {
        ctx.render(registerTemplate(createSubmitHandler(onRegister), formData, error));
    }

    async function onRegister({ username, password, repass }, form) {
        try {
            if (username == '' || password == '') {
                throw {
                    message: 'All fields are required'
                };
            }
            if (password != repass) {
                throw {
                    message: 'Passwords don\'t match'
                };
            }
            await register(username, password);
            ctx.page.redirect('/settings');
        } catch (err) {
            update({ username }, err.message);
            err.handled = true;
        }
    }
}