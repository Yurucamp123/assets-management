import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  Package,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { adminApi } from "../api/adminApi";
import { AxiosError } from "axios";

// --- ĐỊNH NGHĨA TYPES ---

// Định nghĩa các trạng thái yêu cầu có thể có
export type RequestStatusType =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED"
  | "WAITING_FOR_RETURN";

// Interface cho một đối tượng yêu cầu (Request)
interface AssetRequest {
  id: number;
  userId?: number;
  username: string;
  assetId: number;
  assetName: string;
  assetTag: string;
  status: RequestStatusType;
  createdAt: string;
  returnDate: string;
}

// Interface cho phản hồi phân trang từ API
interface RequestResponse {
  content: AssetRequest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Interface cho cấu trúc lỗi trả về từ Backend
interface ApiErrorResponse {
  message: string;
}

export default function ApproveRequests() {
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");
  const [returnId, setReturnId] = useState<number | null>(null);

  // Ép kiểu cho object label để an toàn khi truy xuất theo key
  const requestStatusLabels: Record<RequestStatusType, string> = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Đã từ chối",
    RETURNED: "Đã trả",
    WAITING_FOR_RETURN: "Chờ duyệt trả",
  };

  // 1. Lấy danh sách yêu cầu (Đã thêm Type cho useQuery)
  const { data, isLoading } = useQuery<RequestResponse>({
    queryKey: ["admin-requests"],
    queryFn: () => adminApi.getRequests(),
  });

  // 2. Mutation Phê duyệt
  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      toast.success("Thao tác thành công!");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error?.response?.data?.message || "Không thể thực hiện");
    },
  });

  // 3. Mutation Từ chối
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setRejectId(null);
      setReason("");
      toast.success("Đã từ chối yêu cầu");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error?.response?.data?.message || "Lỗi khi từ chối");
    },
  });

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do từ chối");
    if (rejectId) {
      rejectMutation.mutate({ id: rejectId, reason });
    }
  };

  if (isLoading)
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 animate-pulse">
          Đang đồng bộ dữ liệu hệ thống...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Xử lý yêu cầu
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Phê duyệt cấp phát và thu hồi thiết bị
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-2">
            <Clock size={12} />{" "}
            {data?.content?.filter((r: AssetRequest) => r.status === "PENDING")
              .length || 0}{" "}
            Chờ duyệt
          </span>
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-2">
            <Package size={12} /> {data?.totalElements || 0} Tổng lượt
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Người mượn
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Thiết bị
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Thời gian mượn
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Thời gian trả
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  Trạng thái
                </th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!data || data.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <CheckCircle size={48} />
                      <p className="font-bold uppercase tracking-widest text-sm">
                        Danh sách trống
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.content.map((req: AssetRequest) => (
                  <tr
                    key={req.id}
                    className="hover:bg-blue-50/30 transition-all duration-300 group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm group-hover:scale-110 transition-transform">
                          {req.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 text-sm">
                            {req.username}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Employee ID: #00{req.userId || req.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-2 text-slate-700">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <Package size={14} />
                        </div>
                        <span className="font-bold text-sm tracking-tight">
                          {req.assetName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">
                        TAG: {req.assetTag || "N/A"}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <Clock size={12} className="text-blue-400" />
                          {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                        {req.status === "APPROVED" && (
                          <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                            <Check size={10} /> Đang sử dụng
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <Clock size={12} className="text-blue-400" />
                          {new Date(req.returnDate).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-xl text-[10px] font-black border ${
                          req.status === "PENDING"
                            ? "bg-amber-50 text-amber-600 border-amber-200 animate-pulse"
                            : req.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-rose-50 text-rose-600 border-rose-200"
                        }`}
                      >
                        {requestStatusLabels[req.status] || req.status}
                      </span>
                    </td>

                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-2">
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(req.id)}
                              disabled={approveMutation.isPending}
                              className="p-2.5 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-100 shadow-sm hover:shadow-emerald-200"
                              title="Phê duyệt"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => setRejectId(req.id)}
                              className="p-2.5 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all border border-rose-100 shadow-sm hover:shadow-rose-200"
                              title="Từ chối"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}

                        {(req.status === "APPROVED" || req.status === "WAITING_FOR_RETURN") && (
                          <button
                            onClick={() => setReturnId(req.id)}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-100 font-bold text-[11px] shadow-sm"
                            title="Xác nhận trả máy"
                          >
                            <RotateCcw size={14} /> XÁC NHẬN TRẢ
                          </button>
                        )}

                        {req.status === "REJECTED" && (
                          <span className="text-[10px] text-slate-300 font-bold uppercase italic tracking-widest">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REJECT MODAL --- */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300 border border-white">
            <div className="p-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="p-2 bg-rose-50 rounded-xl">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Từ chối
                  </h3>
                </div>
                <button
                  onClick={() => setRejectId(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                Hành động này sẽ hủy yêu cầu của{" "}
                <span className="text-slate-900 font-bold">người dùng</span>.
                Vui lòng cung cấp lý do cụ thể để họ nắm rõ thông tin.
              </p>

              <form onSubmit={handleRejectSubmit} className="space-y-6">
                <textarea
                  autoFocus
                  className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 text-sm outline-none focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 transition-all min-h-[140px] font-medium placeholder:text-slate-300"
                  placeholder="Lý do từ chối (ví dụ: Máy đang bảo trì, thông tin không hợp lệ...)"
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setReason(e.target.value)
                  }
                  required
                />

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setRejectId(null)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={rejectMutation.isPending}
                    className="flex-1 py-4 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 disabled:opacity-50 text-xs uppercase tracking-widest"
                  >
                    {rejectMutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- RETURN CONFIRMATION MODAL --- */}
      {returnId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-300 border border-white">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RotateCcw size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">
                Xác nhận thu hồi?
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Bạn đang xác nhận thiết bị đã được người dùng hoàn trả nguyên
                vẹn về kho.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setReturnId(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    approveMutation.mutate(returnId);
                    setReturnId(null);
                  }}
                  disabled={approveMutation.isPending}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 text-xs uppercase tracking-widest"
                >
                  Xác nhận trả
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
