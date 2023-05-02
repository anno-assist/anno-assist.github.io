import { logout } from '../data/auth.js';

export async function logoutView(ctx) {
    await logout(ctx.user.sessionToken);
    ctx.page.redirect('/settings');
}
