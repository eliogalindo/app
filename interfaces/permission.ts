export interface IPermissionTranslation {
  id: string;
  permissionId: string;
  locale: string;
  denomination: string;
  description: string;
}

export interface IPermission {
  id: string;
  code: string;
  group: number; // 0: administrative, 1: standard
  action: number; // 0: read, 1: write, 2: delete
  createdAt: string;
  translations: IPermissionTranslation[];
}
