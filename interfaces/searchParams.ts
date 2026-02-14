import { NotificationType } from "@/enums/notificationType";

export interface ISearchParams {
  pageSize?: number;
  pageNumber?: number;
  orderBy?: string;
  desc?: boolean;
  filter?: string;
  allSelected?: boolean;
}
export interface INotificationsSearchParams extends ISearchParams {
  NotificationType?: NotificationType;
  includeRead: boolean;
}

export interface IRolesSearchParams extends ISearchParams {
  enabledOnly?: boolean;
}
