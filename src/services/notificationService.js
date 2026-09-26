import apiFetch from './api';
export function listNotifications() { return apiFetch('/Notificacao/minhas'); }
export function markNotificationRead(id) { return apiFetch(`/Notificacao/${id}/lida`, { method: 'PATCH' }); }
export function markAllNotificationsRead() { return apiFetch('/Notificacao/lidas/todas', { method: 'PATCH' }); }
export function deleteNotification(id) { return apiFetch(`/Notificacao/${id}`, { method: 'DELETE' }); }
export function activeNotificationsCount() { return apiFetch('/Notificacao/Ativas'); }
