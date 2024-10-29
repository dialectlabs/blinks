export const BLINK_CLIENT_KEY_HEADER = 'x-blink-client-key';

export let clientKey: string | null = null;

export function setClientKey(key: string): void {
  if (!key) {
    console.warn('[@dialectlabs/blinks] client key is not set');
    clientKey = null;
    return;
  }
  clientKey = key;
}
