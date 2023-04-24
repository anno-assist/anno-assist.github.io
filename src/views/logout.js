import { logout } from '../data/auth.js';
import { clearUserData } from '../util.js';

export async function logoutView(ctx) {
    try {
        await logout(ctx.user.sessionToken);
    } catch (err) {
        clearUserData();
        err.handled = true;
    } finally {
        ctx.page.redirect('/settings');
    }
}