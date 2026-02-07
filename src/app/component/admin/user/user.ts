import { Model } from "@/types/core/model";
import { IPaginateResponse } from "@/types/core/api";
import { IUser, IStaff } from "./type";
import { useMutation } from "@tanstack/react-query";

export class User extends Model {
  static queryKeys = {
    list: (page: number, perPage: number, search = "") =>
      ["USER", "LIST", page, perPage, search] as const,
  };

  // ======== USERS ========
  static getUsers(params: { page: number; perPage: number; search?: string }) {
    const { page, perPage, search } = params;
    return {
      queryKey: this.queryKeys.list(page, perPage, search),
      queryFn: async (): Promise<IPaginateResponse<IUser[]>> => {
        const res = await this.api.get<IPaginateResponse<IUser[]>>({
          url: "/users/customers",
          params: { page, perPage, search },
        });
        return res.data; // res.data là IPaginateResponse<IUser[]>
      },
    };
  }

  // ======== STAFF ========
  static getStaffs(params: { page: number; perPage: number; search?: string }) {
    const { page, perPage, search } = params;
    return {
      queryKey: this.queryKeys.list(page, perPage, search),
      queryFn: async (): Promise<IPaginateResponse<IStaff[]>> => {
        const res = await this.api.get<IPaginateResponse<IStaff[]>>({
          url: "/users/staffs",
          params: { page, perPage, search },
        });
        return res.data;
      },
    };
  }

  static createStaff(payload: FormData) {
    return this.api.post<IUser>({ url: "/users/manage", data: payload });
  }

  static updateStaff(id: number, payload: FormData) {
    return this.api.put<IUser>({ url: `/users/manage/${id}`, data: payload });
  }

  // ======== LOCK/UNLOCK ========
  static lockUser(id: number) {
    return this.api.put<IUser>({ url: `/users/${id}/lock` });
  }
  static unlockUser(id: number) {
    return this.api.put<IUser>({ url: `/users/${id}/unlock` });
  }

  static lockStaff(id: number) {
    return this.api.put<IUser>({ url: `/users/manage/${id}/lock` });
  }
  static unlockStaff(id: number) {
    return this.api.put<IUser>({ url: `/users/manage/${id}/unlock` });
  }
}

User.setup();

// ======= REACT QUERY HOOKS =======
export function useLockUserMutation() {
  return useMutation<IUser, Error, number>({
    mutationFn: (id) => User.lockUser(id).then((res) => res.data),
  });
}

export function useUnlockUserMutation() {
  return useMutation<IUser, Error, number>({
    mutationFn: (id) => User.unlockUser(id).then((res) => res.data),
  });
}

export function useLockStaffMutation() {
  return useMutation<IUser, Error, number>({
    mutationFn: (id) => User.lockStaff(id).then((res) => res.data),
  });
}

export function useUnlockStaffMutation() {
  return useMutation<IUser, Error, number>({
    mutationFn: (id) => User.unlockStaff(id).then((res) => res.data),
  });
}

// ======= QUERY HOOKS =======
export function useGetUsersQuery(
  page: number,
  perPage: number,
  search?: string,
) {
  return User.getUsers({ page, perPage, search });
}

export function useGetStaffsQuery(
  page: number,
  perPage: number,
  search?: string,
) {
  return User.getStaffs({ page, perPage, search });
}

export function useCreateStaffMutation() {
  return useMutation<IUser, Error, FormData>({
    mutationFn: (payload) => User.createStaff(payload).then((res) => res.data),
  });
}

export function useUpdateStaffMutation() {
  return useMutation<IUser, Error, { id: number; payload: FormData }>({
    mutationFn: ({ id, payload }) =>
      User.updateStaff(id, payload).then((res) => res.data),
  });
}
