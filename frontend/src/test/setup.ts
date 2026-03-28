import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { MockWebSocket } from './mockWebSocket';

// Stub WebSocket globally — hooks and components never hit a real server
vi.stubGlobal('WebSocket', MockWebSocket);

// Stub fetch globally — hooks never make real network calls
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => [],
}));

afterEach(() => {
  cleanup();
  MockWebSocket.reset();
});
