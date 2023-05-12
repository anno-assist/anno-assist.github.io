import { logout } from '../data/auth.js';
import { to } from '../util.js';

export async function logoutView(ctx) {
    await logout(ctx.user.sessionToken);
    ctx.page.redirect(to('/settings'));
}
