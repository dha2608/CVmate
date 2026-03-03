/**
 * Real-time messaging client using Server-Sent Events (SSE).
 * Falls back to polling when SSE is unavailable (e.g. Render free tier).
 * Auto-reconnects on connection drop.
 */

type EventHandler = (data: unknown) => void;

interface RealtimeClientOptions {
  /** Base API URL (e.g. http://localhost:5001/api) */
  apiUrl: string;
  /** Auth token for SSE connection */
  token: string;
  /** Called when connection state changes */
  onConnectionChange?: (connected: boolean) => void;
}

const MAX_SSE_FAILURES = 3;
const POLL_INTERVAL = 5000; // 5s for messaging (more real-time feel)

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private sseFailCount = 0;
  private usingPolling = false;
  private apiUrl = '';
  private token = '';
  private onConnectionChange?: (connected: boolean) => void;
  private _connected = false;

  get connected(): boolean {
    return this._connected;
  }

  /**
   * Connect to the SSE endpoint (or fall back to polling).
   */
  connect(options: RealtimeClientOptions): void {
    this.apiUrl = options.apiUrl;
    this.token = options.token;
    this.onConnectionChange = options.onConnectionChange;

    this.disconnect();
    this.createConnection();
  }

  /**
   * Disconnect and clean up everything.
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.stopPolling();
    this.setConnected(false);
    this.sseFailCount = 0;
    this.reconnectDelay = 1000;
  }

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function.
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // If already connected via SSE, add listener to existing EventSource
    if (this.eventSource) {
      this.eventSource.addEventListener(event, ((e: MessageEvent) => {
        try {
          handler(JSON.parse(e.data));
        } catch {
          handler(e.data);
        }
      }) as EventListener);
    }

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  /**
   * Send a typing notification via REST (not SSE — SSE is server-to-client only).
   */
  async sendTyping(recipientId: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/messages/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ recipientId }),
      });
    } catch {
      // Typing notifications are best-effort
    }
  }

  private createConnection(): void {
    if (!this.token || !this.apiUrl) return;

    // If SSE has failed too many times, go straight to polling
    if (this.sseFailCount >= MAX_SSE_FAILURES) {
      if (!this.usingPolling) {
        console.info('[messaging] SSE unavailable, using polling fallback');
        this.startPolling();
      }
      return;
    }

    const url = `${this.apiUrl}/messages/events?token=${encodeURIComponent(this.token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('connected', () => {
      this.setConnected(true);
      this.reconnectDelay = 1000;
      this.sseFailCount = 0; // Reset on successful connection
      this.stopPolling(); // Stop polling if it was active
    });

    // Register all existing handlers
    for (const [event, handlerSet] of this.handlers) {
      for (const handler of handlerSet) {
        this.eventSource.addEventListener(event, ((e: MessageEvent) => {
          try {
            handler(JSON.parse(e.data));
          } catch {
            handler(e.data);
          }
        }) as EventListener);
      }
    }

    // Auth failure from server — stop reconnecting entirely
    this.eventSource.addEventListener('error', ((e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.message === 'unauthorized') {
          this.eventSource?.close();
          this.eventSource = null;
          this.setConnected(false);
          return;
        }
      } catch {
        // Not a JSON error event, ignore
      }
    }) as EventListener);

    this.eventSource.onerror = () => {
      this.setConnected(false);
      this.eventSource?.close();
      this.eventSource = null;
      this.sseFailCount++;

      if (this.sseFailCount >= MAX_SSE_FAILURES) {
        console.info('[messaging] SSE failed %d times, switching to polling', this.sseFailCount);
        this.startPolling();
      } else {
        this.scheduleReconnect();
      }
    };
  }

  private startPolling(): void {
    if (this.pollingTimer) return;
    this.usingPolling = true;
    this.setConnected(true); // "connected" via polling

    // Poll by emitting a synthetic event that messageStore can handle
    this.pollingTimer = setInterval(() => {
      this.emit('poll_tick', {});
    }, POLL_INTERVAL);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.usingPolling = false;
  }

  /** Emit an event to registered handlers */
  private emit(event: string, data: unknown): void {
    const handlerSet = this.handlers.get(event);
    if (handlerSet) {
      for (const handler of handlerSet) {
        handler(data);
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.createConnection();
      this.reconnectDelay = Math.min(
        this.reconnectDelay * 2 + Math.random() * 500,
        this.maxReconnectDelay
      );
    }, this.reconnectDelay);
  }

  private setConnected(value: boolean): void {
    if (this._connected !== value) {
      this._connected = value;
      this.onConnectionChange?.(value);
    }
  }
}

/** Singleton instance */
export const realtimeClient = new RealtimeClient();
