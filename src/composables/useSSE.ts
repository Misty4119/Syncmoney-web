/**
 * SSE composable — re-exports from useWebSocket for semantic correctness.
 *
 * BUG-016: The composable is actually SSE, not WebSocket.
 * New code should import { useSSE } from this file.
 */
export { useWebSocket as useSSE } from './useWebSocket'
