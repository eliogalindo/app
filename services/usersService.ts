import { API_URL } from "@/constants";
import { ISearchParams } from "@/interfaces/searchParams";

class UsersService {
  public async findAll(
    searchParams: ISearchParams,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      const { pageSize, pageNumber, orderBy, desc, filter } = searchParams;

      const query = `${API_URL}/api/v1/users?pageSize=${pageSize}&pageNumber=${pageNumber}&orderBy=${orderBy}&desc=${desc}&filter=${filter}`;

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

  public async findOne(id: string, locale: string = "en-US") {
    try {
      return await fetch(`${API_URL}/api/v1/users/${id}`, {
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

  public async create(
    formData: FormData,
    searchParams: ISearchParams,
    locale: string = "en-US",
  ) {
    try {
      const { filter, allSelected } = searchParams;

      const query = `${API_URL}/api/v1/users?filter=${filter}&allSelected=${allSelected}`;

      return await fetch(query, {
        headers: {
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: formData,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
  public async update(
    id: string,
    formData: FormData,
    searchParams: ISearchParams,
    locale: string = "en-US",
  ) {
    try {
      const { filter, allSelected } = searchParams;

      const query = `${API_URL}/api/v1/users/${id}?filter=${filter}&allSelected=${allSelected}`;

      return await fetch(query, {
        headers: {
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "PATCH",
        body: formData,
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
      return await fetch(`${API_URL}/api/v1/users/${id}`, {
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
      return await fetch(`${API_URL}/api/v1/users`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "DELETE",
        body: JSON.stringify({ userIds: ids }),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
}
export const usersService = new UsersService();
