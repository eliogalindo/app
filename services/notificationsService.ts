import { API_URL } from "@/constants";
import { INotificationsSearchParams } from "@/interfaces/searchParams";

class NotificationsService {
  public async findAll(
    searchParams: INotificationsSearchParams,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      const { pageSize, pageNumber, orderBy, desc, filter, includeRead } =
        searchParams;

      const query = `${API_URL}/api/v1/notifications?includeRead=${includeRead}&pageSize=${pageSize}&pageNumber=${pageNumber}&orderBy=${orderBy}&desc=${desc}&filter=${filter}`;

      return await fetch(query, {
        headers: {
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "GET",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async markAsRead(
    notificationId: string,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/notifications/${notificationId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "PATCH",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
  public async markAllAsRead(
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/notifications`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "PATCH",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
  public async delete(
    id: string,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/notifications/${id}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "DELETE",
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
  public async deleteMany(
    ids: string[],
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      return await fetch(`${API_URL}/api/v1/notifications`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "DELETE",
        body: JSON.stringify({ notificationIds: ids }),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
}
export const notificationsService = new NotificationsService();
