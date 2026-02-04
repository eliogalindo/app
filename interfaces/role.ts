export interface IRole {
  id: string;
  denomination: string;
  description: string;
  enabled: boolean; // true or false
  createdAt: string;
}

export interface IRoleFormData {
  denomination: string;
  description: string;
  enabled: boolean; // true or false
  permissions: string[]; // Array of permission IDs
}
