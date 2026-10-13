import PusherClient from "pusher-js";

declare global {
  var pusherClientInstance: PusherClient | undefined;
}

export function getPusherClient(): PusherClient {
  // pusher cloud
  // if (!global.pusherClientInstance) {
  //   global.pusherClientInstance = new PusherClient(
  //     process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  //     {
  //       channelAuthorization: {
  //         endpoint: "/api/pusher-auth",
  //         transport: "ajax",
  //       },
  //       cluster: process.env.PUSHER_CLUSTER || "eu",
  //     },
  //   );
  // }

  // Soketi
  if (!global.pusherClientInstance) {
    global.pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        channelAuthorization: {
          endpoint: "/api/pusher-auth",
          transport: "ajax",
        },
        cluster: "ap1",
        wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST,
        wsPort: parseInt(process.env.NEXT_PUBLIC_PUSHER_PORT || "6001"),
        forceTLS: process.env.NEXT_PUBLIC_PUSHER_USE_TLS === "true",
        disableStats: true,
        enabledTransports: ["ws", "wss"],
      },
    );
  }

  return global.pusherClientInstance;
}
