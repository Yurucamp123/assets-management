import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Clock, CheckCircle2, XCircle, RotateCcw, 
  Package, Calendar, ChevronLeft, ChevronRight, Loader2, 
  AlertCircle, ArrowUpRight, Hash, MessageSquare
} from "lucide-react";
import { useState } from "react";
import { requestApi } from "../api/requestApi";
import { toast } from "react-hot-toast";

export default function RequestList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const pageSize = 6; // Giảm số lượng mỗi trang để card to và đẹp hơn

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["my-requests", page],
    queryFn: () => requestApi.getMyHistory(page, pageSize),
  });

  const requests = data?.result?.content || [];
  const totalPages = data?.result?.totalPages || 1;

  const returnMutation = useMutation({
    mutationFn: requestApi.requestReturn,
    onSuccess: () => {
      toast.success("Gửi yêu cầu trả thành công!");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi yêu cầu trả.");
    }
  });

  // Render Status Badge theo style xịn
  const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
      PENDING: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock size={12}/>, label: "Đang chờ" },
      APPROVED: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={12}/>, label: "Đang mượn" },
      REJECTED: { color: "bg-rose-100 text-rose-700 border-rose-200", icon: <XCircle size={12}/>, label: "Từ chối" },
      RETURN_PENDING: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: <RotateCcw size={12}/>, label: "Đang trả" },
      RETURNED: { color: "bg-slate-100 text-slate-500 border-slate-200", icon: <Package size={12}/>, label: "Đã trả" },
    };
    const s = config[status] || { color: "bg-slate-100", icon: null, label: status };
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${s.color}`}>
        {s.icon} {s.label}
      </div>
    );
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <Loader2 className="animate-spin text-blue-600" size={48} strokeWidth={1} />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600">IAM</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lịch sử yêu cầu</h1>
          <p className="text-slate-500 font-medium">Theo dõi và quản lý các thiết bị bạn đang sử dụng.</p>
        </div>
        <div className="hidden md:block">
            <div className="px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-tighter">Hệ thống thời gian thực</span>
            </div>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.length > 0 ? (
          requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group relative">
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                    <Package size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                      {req.assetName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash size={12} className="text-slate-300" />
                      <span className="text-xs font-mono text-slate-400">REQ-{req.id.toString().padStart(5, '0')}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                     <Calendar size={12} className="text-blue-500" /> Ngày mượn
                   </p>
                   <p className="text-sm font-black text-slate-700">{new Date(req.borrowDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                     <Calendar size={12} className="text-rose-500" /> Hạn trả
                   </p>
                   <p className="text-sm font-black text-slate-700">{new Date(req.returnDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {req.note && (
                <div className="flex items-start gap-3 mb-8 px-1">
                  <MessageSquare size={16} className="text-slate-300 mt-1 shrink-0" />
                  <p className="text-sm text-slate-500 italic line-clamp-2 leading-relaxed">
                    "{req.note}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                   Cập nhật: {new Date().toLocaleDateString()}
                </div>
                
                {req.status === 'APPROVED' ? (
                  <button 
                    onClick={() => returnMutation.mutate(req.id)}
                    disabled={returnMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-blue-600 shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {returnMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                    YÊU CẦU TRẢ MÁY
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    XEM CHI TIẾT <ArrowUpRight size={14} />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
             <AlertCircle size={64} strokeWidth={1} className="mb-4 opacity-20" />
             <p className="font-bold text-lg">Hộp thư yêu cầu đang trống</p>
             <p className="text-sm">Hãy đăng ký mượn thiết bị để bắt đầu công việc.</p>
          </div>
        )}
      </div>

      {/* Pagination Modern */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
          className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-white hover:border-blue-500 hover:text-blue-500 disabled:opacity-20 transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="px-6 py-3 bg-white rounded-2xl border border-slate-200 text-xs font-black text-slate-600 shadow-sm">
          {page + 1} <span className="text-slate-300 mx-2">/</span> {totalPages}
        </div>

        <button
          disabled={page >= totalPages - 1}
          onClick={() => setPage(p => p + 1)}
          className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-white hover:border-blue-500 hover:text-blue-500 disabled:opacity-20 transition-all shadow-sm"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}