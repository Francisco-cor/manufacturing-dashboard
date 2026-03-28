import { vi } from 'vitest';

/**
 * Controllable WebSocket stand-in for unit tests.
 * Use the trigger* helpers to simulate server events.
 */
export class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  readyState = 0; // CONNECTING
  onopen:    ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent<string>) => void) | null = null;
  onclose:   ((e: CloseEvent) => void) | null = null;
  onerror:   ((e: Event) => void) | null = null;
  send = vi.fn<[string], void>();

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.readyState = 3;
    this.onclose?.(new CloseEvent('close'));
  }

  // --- test helpers ---

  triggerOpen() {
    this.readyState = 1;
    this.onopen?.(new Event('open'));
  }

  triggerMessage(data: string) {
    this.onmessage?.(new MessageEvent('message', { data }));
  }

  triggerError() {
    this.onerror?.(new Event('error'));
  }

  triggerClose() {
    this.close();
  }

  static latest(): MockWebSocket {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  }

  static reset() {
    MockWebSocket.instances = [];
  }
}
