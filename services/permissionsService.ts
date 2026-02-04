import { API_URL } from "@/constants";
import { ISearchParams } from "@/interfaces/searchParams";

class PermissionsService {
  public async findAll(
    searchParams: ISearchParams,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      const { pageSize, pageNumber, orderBy, desc, filter } = searchParams;

      const query = `${API_URL}/api/v1/permissions?pageSize=${pageSize}&pageNumber=${pageNumber}&orderBy=${orderBy}&desc=${desc}&filter=${filter}`;

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
}
export const permissionsService = new PermissionsService();
