/**
 * Real-time messaging client using Server-Sent Events (SSE).
 * Works on both local dev and Vercel production.
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

class RealtimeClient {
  private eventSource: EventSource | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private apiUrl = '';
  private token = '';
  private onConnectionChange?: (connected: boolean) => void;
  private _connected = false;

  get connected(): boolean {
    return this._connected;
  }

  /**
   * Connect to the SSE endpoint.
   */
  connect(options: RealtimeClientOptions): void {
    this.apiUrl = options.apiUrl;
    this.token = options.token;
    this.onConnectionChange = options.onConnectionChange;

    this.disconnect();
    this.createConnection();
  }

  /**
   * Disconnect and clean up.
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
    this.setConnected(false);
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

    // If already connected, add listener to existing EventSource
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

    const url = `${this.apiUrl}/messages/events?token=${encodeURIComponent(this.token)}`;
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('connected', () => {
      this.setConnected(true);
      this.reconnectDelay = 1000; // Reset backoff on successful connect
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

    // Auth failure from server — stop reconnecting
    this.eventSource.addEventListener('error', ((e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.message === 'unauthorized') {
          this.eventSource?.close();
          this.eventSource = null;
          this.setConnected(false);
          return; // Don't schedule reconnect for auth failures
        }
      } catch {
        // Not a JSON error event, ignore
      }
    }) as EventListener);

    this.eventSource.onerror = () => {
      this.setConnected(false);
      this.eventSource?.close();
      this.eventSource = null;
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.createConnection();
      // Exponential backoff with jitter
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
