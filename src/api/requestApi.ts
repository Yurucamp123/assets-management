import axiosClient from "./axiosClient";

export interface BorrowRequest {
  assetId: number;
  borrowDate: string;
  returnDate: string;
  note?: string;
}

export const requestApi = {
  createBorrowRequest: (data: BorrowRequest) => 
    axiosClient.post('/api/user/requests/borrow', data).then(res => res.data),
  getMyHistory: (page: number, size: number) => 
    axiosClient.get(`/api/user/requests/history?page=${page}&size=${size}`).then(res => res.data),
  requestReturn: (id: number) => 
    axiosClient.put(`/api/user/requests/${id}/return`).then(res => res.data),
  getRecentPending: (page: number, size: number) =>
    axiosClient.get(`/api/admin/requests/pending?page=${page}&size=${size}`).then(res => res.data),
};

