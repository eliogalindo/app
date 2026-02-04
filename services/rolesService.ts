import { API_URL } from "@/constants";
import { IRoleFormData } from "@/interfaces/role";
import { ISearchParams } from "@/interfaces/searchParams";

class RolesService {
  public async findAll(
    searchParams: ISearchParams,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      const { pageSize, pageNumber, orderBy, desc, filter } = searchParams;

      const query = `${API_URL}/api/v1/roles?pageSize=${pageSize}&pageNumber=${pageNumber}&orderBy=${orderBy}&desc=${desc}&filter=${filter}`;

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
      return await fetch(`${API_URL}/api/v1/roles/${id}`, {
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
    roleData: IRoleFormData,
    searchParams: ISearchParams,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      const { filter, allSelected } = searchParams;

      const query = `${API_URL}/api/v1/roles?filter=${filter}&allSelected=${allSelected}`;

      return await fetch(query, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(roleData),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }

  public async update(
    id: string,
    roleData: IRoleFormData,
    searchParams: ISearchParams,
    locale: string = "en-US",
  ): Promise<Response | undefined> {
    try {
      const { filter, allSelected } = searchParams;

      const query = `${API_URL}/api/v1/roles/${id}?filter=${filter}&allSelected=${allSelected}`;

      return await fetch(query, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "PUT",
        body: JSON.stringify(roleData),
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
      return await fetch(`${API_URL}/api/v1/roles/${id}`, {
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
      return await fetch(`${API_URL}/api/v1/roles`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Language": `${locale}`,
          "X-User-Locale": `${locale}`,
        },
        credentials: "include",
        method: "DELETE",
        body: JSON.stringify({ roleIds: ids }),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  }
}
export const rolesService = new RolesService();
