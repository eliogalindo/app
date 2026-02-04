import { ISearchParams } from "@/interfaces/searchParams";
import { API_URL } from "@/constants";

class TracesService {
  public async findAll(
    searchParams: ISearchParams,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      const { pageSize, pageNumber, orderBy, desc } = searchParams;

      const query = `${API_URL}/api/v1/traces?pageSize=${pageSize}&pageNumber=${pageNumber}&orderBy=${orderBy}&desc=${desc}`;

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
export const tracesService = new TracesService();
