import axiosClient from "./axiosClient";

export const adminApi = {
  updateAssetStatus: (id: number, status: string) =>
    axiosClient.patch(`/api/admin/assets/${id}/status?newStatus=${status}`),

  // Quản lý Request
  getRequests: (page = 0, size = 10) =>
    axiosClient
      .get(`/api/admin/requests?page=${page}&size=${size}`)
      .then((res) => res.data.result),
  approveRequest: (id: number) =>
    axiosClient
      .post(`/api/admin/requests/${id}/approve`)
      .then((res) => res.data.result),
  rejectRequest: (id: number, reason: string) =>
    axiosClient
      .post(`/api/admin/requests/${id}/reject`, { reason })
      .then((res) => res.data.result),
  confirmReturn: (id: number) =>
    axiosClient
      .post(`/api/admin/requests/${id}/return`)
      .then((res) => res.data.result),

  // Quản lý Users
  getUsers: (page = 0, size = 10) =>
    axiosClient
      .get(`/api/users`, { params: { page, size } })
      .then((res) => res.data),
  updateUserRole: (id: number, role: string) =>
    axiosClient
      .patch(`/api/users/${id}/role`, null, { params: { role } })
      .then((res) => res.data),
  updateUserStatus: (id: number, isEnabled: boolean) =>
    axiosClient
      .patch(`/api/users/${id}/status`, null, { params: { isEnabled } })
      .then((res) => res.data),
  deleteUser: (id: number) =>
    axiosClient.delete(`/api/users/${id}`).then((res) => res.data),

  getLogs: (page = 0, size = 10) =>
    axiosClient
      .get(`/api/admin/logs`, { params: { page, size } })
      .then((res) => res.data),
  getSummary: async () => {
    const response = await axiosClient.get("/api/admin/dashboard/summary");
    return response.data; // Trả về ApiResponse chứa Map dữ liệu
  },
};
