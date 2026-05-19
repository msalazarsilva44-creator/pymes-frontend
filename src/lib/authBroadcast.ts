/**
 * BroadcastChannel para sincronizar logout entre pestañas.
 * Si el usuario hace logout en una pestaña, las demás se enteran.
 */
const channel = new BroadcastChannel('mercarof_auth')

export function broadcastLogout() {
  channel.postMessage({ type: 'logout' })
}

export function onLogoutBroadcast(handler: () => void) {
  channel.addEventListener('message', (e) => {
    if (e.data?.type === 'logout') handler()
  })
}
