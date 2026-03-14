import axiosClient from "./axiosClient";

export const assetApi = {
  // 1. Lấy tất cả (User/Admin)
  getAll: (page = 0, size = 10) =>
    axiosClient
      .get(`/api/assets?page=${page}&size=${size}`)
      .then((res) => res.data.result),

  // 2. Lấy thiết bị rảnh (User dùng để chọn máy mượn)
  getAvailable: (page = 0, size = 10) =>
    axiosClient
      .get(`/api/assets/available?page=${page}&size=${size}`)
      .then((res) => res.data.result),

  // 3. Lấy chi tiết 1 thiết bị
  getOne: (id: number) =>
    axiosClient
      .get(`/api/assets/${id}`)
      .then((res) => res.data.result),

  // 4. Admin: Thêm mới
  create: (data: any) =>
    axiosClient
      .post("/api/assets", data)
      .then((res) => res.data.result),

  // 5. Admin: Cập nhật thông tin
  update: (id: number, data: any) =>
    axiosClient
      .put(`/api/assets/${id}`, data)
      .then((res) => res.data.result),

  // 6. Admin: Xóa thiết bị
  delete: (id: number) =>
    axiosClient
      .delete(`/api/assets/${id}`)
      .then((res) => res.data.result),
};