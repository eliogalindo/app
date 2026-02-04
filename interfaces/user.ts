import { UserStatus } from "@/enums/userStatus";

export interface IUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  status: UserStatus; // 0: enabled, 1: disabled, 2: pending
  avatar: string;
  createdAt: string;
}

export interface IUserFormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password?: string; // Optional for updates
  passwordConfirmation?: string; // Optional for updates
  status: UserStatus; // 0: enabled, 1: disabled, 2: pending
  avatar?: File | null; // Optional for updates
  roles: string[]; // Array of role IDs
}
