import { HubConnection } from "@microsoft/signalr";

import { ConnectionStatus } from "@/enums/connectionStatus";
import { NotificationType } from "@/enums/notificationType";
import { TraceAction } from "@/enums/traceAction";

export interface INotificationState {
  notificationsSummary: INotificationsSummary | null;
  connection: HubConnection | null;
  connectionStatus: ConnectionStatus;
  setNotificationsSummary: (
    notificationsSummary: INotificationsSummary,
  ) => void;
  initializeConnection: (locale: string) => Promise<void>;
  disconnectConnection: () => Promise<void>;
}

export interface INotificationsSummary {
  unreadCount: number;
  recentNotifications: INotification[];
}
export interface INotification {
  id: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
export interface ITrace {
  id: string;
  description: string;
  action: TraceAction;
  ip: string;
  createdAt: string;
}
