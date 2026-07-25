import { api } from "@/lib/axios";
import { AdminUser } from "@/store/adminAuth.store";

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  admin_uuid: string;
  first_name: string;
  last_name: string;
}

export const adminLoginApi = async (data: { email: string; password: string }): Promise<AdminLoginResponse> => {
  const res = await api.post("/admin/auth/login", {
    email: data.email.toLowerCase().trim(),
    password: data.password,
  });
  return res.data;
};

export const getAdminMeApi = async (): Promise<AdminUser> => {
  const res = await api.get("/admin/auth/me");
  return res.data;
};

export const adminLogoutApi = async (): Promise<{ message: string }> => {
  const res = await api.post("/admin/auth/logout");
  return res.data;
};

export const adminRefreshApi = async (): Promise<{ access_token: string; token_type: string; role: string }> => {
  const res = await api.post("/admin/auth/refresh");
  return res.data;
};

export interface AdminChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export const adminChangePasswordApi = async (data: AdminChangePasswordPayload): Promise<{ message: string }> => {
  const res = await api.post("/admin/auth/change-password", {
    old_password: data.old_password,
    new_password: data.new_password,
  });
  return res.data;
};

