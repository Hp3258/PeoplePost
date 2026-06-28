"use client";

import { useEffect, useState, useRef } from "react";
import { supabaseClient } from "../data-service/supabaseClient";
import { BellIcon, XMarkIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { BellAlertIcon } from "@heroicons/react/24/solid";

const STATUS_CONFIG = {
  RESOLVED: {
    label: "Resolved ✅",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
    message: (title) => `Your report "${title}" has been resolved by the authorities!`,
  },
  IN_PROCESS: {
    label: "In Progress 🔄",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    message: (title) => `Your report "${title}" is now being worked on.`,
  },
  NEW: {
    label: "New 📋",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
    message: (title) => `Your report "${title}" status was updated to New.`,
  },
};

export default function CitizenNotifications() {
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const panelRef = useRef(null);
  const channelRef = useRef(null);

  // ── Auth: get current user ──────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (data?.user) setUserId(data.user.id);
    };
    init();

    const { data: listener } = supabaseClient.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  // ── Realtime subscription ───────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Clean up previous channel if any
    if (channelRef.current) {
      supabaseClient.removeChannel(channelRef.current);
    }

    const channel = supabaseClient
      .channel(`citizen-reports-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reports",
          // Use double-quoted column name for case-sensitive match
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;
          const title = payload.new?.title || "Your report";

          if (oldStatus && newStatus && oldStatus !== newStatus) {
            pushNotification(title, newStatus, oldStatus);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[PeoplePost] Realtime notifications active for user:", userId);
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("[PeoplePost] Realtime subscription issue:", status);
        }
      });

    channelRef.current = channel;

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [userId]);

  // ── Close panel on outside click ────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Push a new notification ─────────────────────────────────────────────
  const pushNotification = (title, newStatus, oldStatus) => {
    const cfg = STATUS_CONFIG[newStatus] || STATUS_CONFIG.NEW;
    const notif = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      newStatus,
      oldStatus,
      message: cfg.message(title),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [notif, ...prev].slice(0, 20)); // keep last 20
    setUnreadCount((c) => c + 1);
    showToast(notif);
  };

  // ── In-app toast pop-up ─────────────────────────────────────────────────
  const showToast = (notif) => {
    const id = notif.id;
    setToasts((prev) => [...prev, { ...notif, toastId: id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.toastId !== id));
    }, 5000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== id));
  };

  // ── Mark all as read ────────────────────────────────────────────────────
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Don't render for guests
  if (!userId) return null;

  return (
    <>
      {/* ── Floating Bell Button ─────────────────────────────────────── */}
      <div
        ref={panelRef}
        className="fixed top-4 right-4 z-[9999]"
        style={{ zIndex: 9999 }}
      >
        <button
          onClick={() => {
            setPanelOpen((o) => !o);
            if (!panelOpen) markAllRead();
          }}
          className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellAlertIcon className="w-6 h-6 text-indigo-600 animate-[wiggle_0.5s_ease-in-out]" />
          ) : (
            <BellIcon className="w-6 h-6 text-gray-500" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* ── Notification Panel ──────────────────────────────────────── */}
        {panelOpen && (
          <div className="absolute top-14 right-0 w-80 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setPanelOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <BellIcon className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs mt-1">Status updates will appear here.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const cfg = STATUS_CONFIG[n.newStatus] || STATUS_CONFIG.NEW;
                  return (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex gap-3 items-start transition ${
                        !n.read ? "bg-indigo-50/40" : "bg-white"
                      }`}
                    >
                      <span
                        className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${cfg.dot} ${
                          !n.read ? "ring-2 ring-white shadow" : "opacity-40"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">{n.message}</p>
                        <span
                          className={`inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                        >
                          {cfg.label}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {n.timestamp.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Toast Stack (bottom-right) ────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[9998]" style={{ zIndex: 9998 }}>
        {toasts.map((t) => {
          const cfg = STATUS_CONFIG[t.newStatus] || STATUS_CONFIG.NEW;
          return (
            <div
              key={t.toastId}
              className={`flex items-start gap-3 w-80 p-4 rounded-xl shadow-xl border ${cfg.bg} ${cfg.border} animate-[slideUp_0.3s_ease-out]`}
            >
              <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug">{t.message}</p>
              </div>
              <button
                onClick={() => dismissToast(t.toastId)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── CSS animations ───────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(-12deg); }
          75%       { transform: rotate(12deg); }
        }
      `}</style>
    </>
  );
}
