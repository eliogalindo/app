import { create } from "zustand";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

import {
  INotificationsSummary,
  INotificationState,
} from "@/interfaces/notification";
import { API_URL } from "@/constants";
import { ConnectionStatus } from "@/enums/connectionStatus";
export const useNotificationStore = create<INotificationState>()(
  (set, get) => ({
    notificationsSummary: null,
    connection: null,
    connectionStatus: ConnectionStatus.disconnected,

    setNotificationsSummary: (notificationsSummary) =>
      set({ notificationsSummary: notificationsSummary }),

    initializeConnection: async (locale: string) => {
      const hubUrl = `${API_URL}/signalR/notificationhub?locale=${locale}`;

      const hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          withCredentials: true,
          headers: {
            "Accept-Language": `${locale}`,
            "X-User-Locale": `${locale}`,
          },
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      set({
        connection: hubConnection,
        connectionStatus: ConnectionStatus.connecting,
      });

      hubConnection.onreconnecting(() => {
        set({ connectionStatus: ConnectionStatus.reconnecting });
      });

      hubConnection.onreconnected(() => {
        set({ connectionStatus: ConnectionStatus.connected });
      });

      hubConnection.onclose(() => {
        set({
          connection: null,
          connectionStatus: ConnectionStatus.disconnected,
        });
      });

      hubConnection.on(
        "ReceiveNotificationSummary",
        (notificationsSummary: INotificationsSummary) => {
          set({ notificationsSummary: notificationsSummary });
        },
      );

      try {
        await hubConnection.start();
        set({
          connection: hubConnection,
          connectionStatus: ConnectionStatus.connected,
        });
      } catch (error) {
        await hubConnection.stop();
        set({
          connection: null,
          connectionStatus: ConnectionStatus.disconnected,
        });
        if (error instanceof Error) {
          throw new Error(`${error} ${LogLevel.Error}`);
        }
      }
    },

    disconnectConnection: async () => {
      const { connection } = get();

      if (connection) {
        await connection.stop();
      }
    },
  }),
);
