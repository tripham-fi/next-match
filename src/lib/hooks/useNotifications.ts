"use client";

import { Channel } from "pusher-js";
import { useEffect, useRef } from "react";
import { getPusherClient } from "../pusher-client";

export const useNotifications = (userId: string | null) => {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (!channelRef.current) {
      channelRef.current = getPusherClient().subscribe(`private-${userId}`);
    }

    return () => {
      if (channelRef.current && channelRef.current.subscribed) {
        channelRef.current.unsubscribe();
        channelRef.current.unbind_all();
        channelRef.current = null;
      }
    };
  }, [userId]);
};
