import { logout } from '../data/auth.js';

export async function logoutView(ctx) {
    try {
        await logout(ctx.user.sessionToken);
    } catch (err) {
        alert(err.message);
        err.handled = true;
    } finally {
        ctx.page.redirect('/settings');
    }
}