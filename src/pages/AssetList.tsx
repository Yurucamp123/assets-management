import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Search,
  Calendar,
  Info,
  Loader2,
  X,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { assetApi } from "../api/assetApi";
import { requestApi } from "../api/requestApi";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

// --- DEFINING TYPES ---

interface Asset {
  id: number;
  assetName: string;
  assetTag: string;
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "BROKEN";
  category?: string;
}

interface AssetResponse {
  content: Asset[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface BorrowRequestPayload {
  assetId: number;
  borrowDate: string;
  returnDate: string;
  note: string;
}

interface ApiErrorResponse {
  message: string;
}

export default function AssetList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Khởi tạo form khớp hoàn toàn với Backend BorrowRequest
  const [formData, setFormData] = useState({
    borrowDate: new Date().toISOString().split("T")[0], // Mặc định là hôm nay
    returnDate: "",
    note: "",
  });

  // 1. Lấy danh sách thiết bị (Đã thêm Type)
  const { data, isLoading } = useQuery<AssetResponse>({
    queryKey: ["assets"],
    queryFn: () => assetApi.getAll(0, 50),
  });

  // 2. Mutation gửi yêu cầu mượn (Đã thêm Type cho payload và error)
  const borrowMutation = useMutation({
    mutationFn: (payload: BorrowRequestPayload) =>
      requestApi.createBorrowRequest(payload),
    onSuccess: () => {
      toast.success("Gửi yêu cầu thành công! Vui lòng đợi phê duyệt.");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      handleCloseModal();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error.response?.data?.message || "Lỗi hệ thống, thử lại sau.";
      toast.error(msg);
    },
  });

  // 3. Xử lý logic Form
  const handleCloseModal = () => {
    setSelectedAsset(null);
    setFormData({
      borrowDate: new Date().toISOString().split("T")[0],
      returnDate: "",
      note: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    // Validation cơ bản tại Front-end
    if (new Date(formData.returnDate) <= new Date(formData.borrowDate)) {
      toast.error("Ngày trả phải sau ngày mượn!");
      return;
    }

    borrowMutation.mutate({
      assetId: selectedAsset.id,
      borrowDate: formData.borrowDate,
      returnDate: formData.returnDate,
      note: formData.note,
    });
  };

  // Lọc tìm kiếm (Đã thêm Type cho tham số 'a')
  const filteredAssets = useMemo(() => {
    return (
      data?.content
        ?.filter((a: Asset) => a.status === "AVAILABLE")
        .filter(
          (a: Asset) =>
            a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()),
        ) || []
    );
  }, [data, searchTerm]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">
          Đang tải danh sách thiết bị...
        </p>
      </div>
    );

  return (
    <div className="p-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Thiết bị khả dụng
          </h1>
          <p className="text-slate-500">
            Yêu cầu mượn công cụ làm việc nhanh chóng tại đây.
          </p>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm theo tên, Serial Number..."
            className="w-full md:w-96 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAssets.map((asset: Asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 flex flex-col group relative overflow-hidden"
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <div
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  asset.status === "AVAILABLE"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {asset.status === "AVAILABLE" ? "Online" : "In Use"}
              </div>
            </div>

            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-6">
              <Package size={28} />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                {asset.assetName}
              </h3>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                  TAG
                </span>
                {asset.assetTag}
              </div>
            </div>

            <button
              onClick={() => setSelectedAsset(asset)}
              disabled={asset.status !== "AVAILABLE"}
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 disabled:bg-slate-50 disabled:text-slate-300 transition-all flex items-center justify-center gap-2 group/btn"
            >
              {asset.status === "AVAILABLE" ? (
                <>
                  Đăng ký mượn{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </>
              ) : (
                "Đang được mượn"
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Modal mượn thiết bị - Redesigned */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={handleCloseModal}
          />

          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">
                  Chi tiết yêu cầu
                </h2>
                <p className="text-slate-500 text-sm italic">
                  Thiết bị: {selectedAsset.assetName}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                    <Calendar size={14} className="text-blue-500" /> Ngày bắt
                    đầu
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    value={formData.borrowDate}
                    onChange={(e) =>
                      setFormData({ ...formData, borrowDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                    <Calendar size={14} className="text-red-500" /> Ngày dự kiến
                    trả
                  </label>
                  <input
                    type="date"
                    required
                    min={formData.borrowDate}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    value={formData.returnDate}
                    onChange={(e) =>
                      setFormData({ ...formData, returnDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 ml-1">
                  <Info size={14} className="text-slate-500" /> Ghi chú (Lý do
                  mượn)
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập lý do sử dụng thiết bị này..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 flex gap-3 items-start border border-amber-100/50">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  Yêu cầu sẽ được chuyển đến người quản lý. Bạn chịu trách nhiệm
                  bảo quản thiết bị trong suốt thời gian sử dụng.
                </p>
              </div>

              <button
                type="submit"
                disabled={borrowMutation.isPending}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
              >
                {borrowMutation.isPending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                GỬI YÊU CẦU PHÊ DUYỆT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
