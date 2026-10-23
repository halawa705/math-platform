/**
 * @file supabase-realtime-submissions-channel.ts
 * @description قناة البث اللحظي عبر WebSocket (Supabase Realtime `postgres_changes` + BroadcastChannel)
 * لبث تسليمات الاختبارات (`exam_submissions`) والاختبارات المنشورة (`electronic_exams`) وتسجيلات الطلاب (`students`)
 * في نفس الجزء من الثانية دون انتظار دورة الجلب التلقائي (١٥ ثانية).
 * @invariant ملف ذري مستقل باسم فريد عالمياً وفق دستور المنصة (AGENTS.md) (< 185 سطراً).
 */

export const MODULE_ID_SUPABASE_REALTIME_SUBMISSIONS_CHANNEL =
  "supabase_realtime_submissions_channel" as const;

export const SUPABASE_REALTIME_POSTGRES_EVENT =
  "math-platform-realtime-postgres-change" as const;

const SUPABASE_HTTP_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ribcyosvoiwtrpynyzjp.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_-_NDzAmrswsChgitYYrIKw_iEmWYIqD";

export type RealtimeWatchedTable =
  | "exam_submissions"
  | "electronic_exams"
  | "students";

export interface SupabaseRealtimeChangePayload {
  readonly table: RealtimeWatchedTable;
  readonly eventType: "INSERT" | "UPDATE" | "DELETE" | "BROADCAST";
  readonly timestampIso: string;
}

export function buildSupabaseRealtimeWebSocketUrl(): string {
  const wsBase = SUPABASE_HTTP_URL.replace(/^http/i, "ws");
  return `${wsBase}/realtime/v1/websocket?apikey=${encodeURIComponent(SUPABASE_ANON_KEY)}&vsn=1.0.0`;
}

/**
 * يفتح اشتراك WebSocket حي مع خادم Supabase Realtime لرصد تغييرات الجداول (`postgres_changes`)
 * في جزء من الثانية، ويعيد دالة تنظيف (`unsubscribe`) عند إغلاق المكون.
 */
export function subscribeToSupabaseRealtimeTables(callbacks: {
  readonly onExamSubmissionsChanged?: () => void;
  readonly onPublishedExamsChanged?: () => void;
  readonly onStudentsChanged?: () => void;
  readonly onConnectionStatusChange?: (isConnected: boolean) => void;
}): () => void {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    return () => undefined;
  }

  let socket: WebSocket | null = null;
  let heartbeatTimer: number | null = null;
  let reconnectTimer: number | null = null;
  let isDisposed = false;
  let msgRefCounter = 1;

  const localBus =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel("math_platform_realtime_bus")
      : null;

  const dispatchTableUpdate = (table: RealtimeWatchedTable) => {
    if (table === "exam_submissions") callbacks.onExamSubmissionsChanged?.();
    if (table === "electronic_exams") callbacks.onPublishedExamsChanged?.();
    if (table === "students") callbacks.onStudentsChanged?.();
    window.dispatchEvent(
      new CustomEvent<SupabaseRealtimeChangePayload>(SUPABASE_REALTIME_POSTGRES_EVENT, {
        detail: { table, eventType: "INSERT", timestampIso: new Date().toISOString() },
      })
    );
  };

  if (localBus) {
    localBus.onmessage = (ev: MessageEvent<{ table?: RealtimeWatchedTable }>) => {
      if (ev.data?.table) dispatchTableUpdate(ev.data.table);
    };
  }

  const connectWebSocket = () => {
    if (isDisposed) return;
    try {
      socket = new WebSocket(buildSupabaseRealtimeWebSocketUrl());
    } catch {
      callbacks.onConnectionStatusChange?.(false);
      return;
    }

    socket.onopen = () => {
      if (isDisposed || !socket) return;
      callbacks.onConnectionStatusChange?.(true);
      socket.send(
        JSON.stringify({
          topic: "realtime:public:math_platform_live",
          event: "phx_join",
          payload: {
            config: {
              broadcast: { ack: false, self: false },
              presence: { key: "" },
              postgres_changes: [
                { event: "*", schema: "public", table: "exam_submissions" },
                { event: "*", schema: "public", table: "electronic_exams" },
                { event: "*", schema: "public", table: "students" },
              ],
            },
            access_token: SUPABASE_ANON_KEY,
          },
          ref: String(msgRefCounter++),
        })
      );

      heartbeatTimer = window.setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              topic: "phoenix",
              event: "heartbeat",
              payload: {},
              ref: String(msgRefCounter++),
            })
          );
        }
      }, 25_000);
    };

    socket.onmessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      try {
        const parsed = JSON.parse(event.data) as {
          readonly event?: string;
          readonly payload?: { readonly data?: { readonly table?: string }; readonly table?: string };
        };
        if (parsed.event === "postgres_changes" || parsed.event === "broadcast") {
          const table = (parsed.payload?.data?.table || parsed.payload?.table) as RealtimeWatchedTable | undefined;
          if (table === "exam_submissions" || table === "electronic_exams" || table === "students") {
            dispatchTableUpdate(table);
          } else {
            callbacks.onExamSubmissionsChanged?.();
          }
        }
      } catch {
        // ignore non-json frames
      }
    };

    socket.onclose = () => {
      callbacks.onConnectionStatusChange?.(false);
      if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
      if (!isDisposed) reconnectTimer = window.setTimeout(connectWebSocket, 4000);
    };
  };

  connectWebSocket();

  return () => {
    isDisposed = true;
    if (heartbeatTimer !== null) window.clearInterval(heartbeatTimer);
    if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
    if (socket && socket.readyState === WebSocket.OPEN) socket.close();
    localBus?.close();
  };
}

export function notifyRealtimeTableUpdated(table: RealtimeWatchedTable): void {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  try {
    const bus = new BroadcastChannel("math_platform_realtime_bus");
    bus.postMessage({ table, timestampIso: new Date().toISOString() });
    bus.close();
  } catch {
    // ignore
  }
}
