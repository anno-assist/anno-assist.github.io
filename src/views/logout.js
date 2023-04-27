import { logout } from '../data/auth.js';

export async function logoutView(ctx) {
    try {
        await logout(ctx.user.sessionToken);
    } finally {
        ctx.page.redirect('/settings');
    }
}
