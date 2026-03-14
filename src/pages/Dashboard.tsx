import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Loader2,
  Package,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { adminApi } from "../api/adminApi";
import { requestApi } from "../api/requestApi";

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  // State quản lý Modal từ chối
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  // 1. Fetch dữ liệu tổng hợp
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => adminApi.getSummary(),
  });

  // 2. Fetch danh sách yêu cầu chờ duyệt
  const { data: latestReqs, isLoading: isReqsLoading } = useQuery({
    queryKey: ["admin-pending-requests"],
    queryFn: () => requestApi.getRecentPending(0, 5),
  });

  // 3. Mutation xử lý Phê duyệt
  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveRequest(id),
    onSuccess: () => {
      toast.success("Đã phê duyệt yêu cầu!");
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-requests"] });
    },
  });

  // 4. Mutation xử lý Từ chối
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.rejectRequest(id, reason),
    onSuccess: () => {
      toast.success("Đã từ chối yêu cầu.");
      setRejectId(null);
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-requests"] });
    },
  });

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error("Vui lòng nhập lý do");
    if (rejectId) rejectMutation.mutate({ id: rejectId, reason });
  };

  const summary = summaryData?.result || {};
  const chartData = summary.chartData || [];
  const pendingList = latestReqs?.result?.content || [];

  if (isSummaryLoading || isReqsLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 font-sans">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
          Syncing Data...
        </p>
      </div>
    );

  console.log("🚀 ~ AdminDashboard ~ summary:", summary);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000 p-1 font-sans">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
            <div className="w-8 h-[2px] bg-blue-600"></div> Real-time Monitor
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Tổng thiết bị"
          value={summary.totalAssets}
          icon={<Package />}
          color="blue"
          trend="+2.4%"
        />
        <StatCard
          label="Chờ duyệt"
          value={summary.pendingRequests}
          icon={<Clock />}
          color="rose"
          trend="Action Needed"
          isAlert={summary.pendingRequests > 0}
        />
        <StatCard
          label="Đang mượn"
          value={summary.activeBorrowing}
          icon={<GitPullRequest />}
          color="emerald"
          trend="In Use"
        />
        <StatCard
          label="Báo lỗi"
          value={summary.brokenAssets || 0}
          icon={<AlertCircle />}
          color="amber"
          trend="Warning"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* --- MAIN CHART --- */}
        <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Xu hướng mượn máy
              </h3>
              <p className="text-sm text-slate-400 font-medium">
                Thống kê yêu cầu trong tuần qua
              </p>
            </div>
            <TrendingUp className="text-blue-500" />
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: "bold", fill: "#cbd5e1" }}
                  dy={15}
                />
                <Tooltip
                  cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: "24px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- RIGHT PANEL: REAL QUICK APPROVE --- */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-blue-900/40 flex-1 overflow-hidden relative">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2 relative z-10">
              <Activity size={18} className="text-blue-400" /> Phê duyệt nhanh
            </h3>

            <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {pendingList.length > 0 ? (
                pendingList.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-100">
                          {req.assetName}
                        </p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase">
                          User: {req.username}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => approveMutation.mutate(req.id)}
                          disabled={approveMutation.isPending}
                          className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setRejectId(req.id)} // THAY ĐỔI TẠI ĐÂY: Mở Modal
                          className="p-2 bg-rose-500/20 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
                  <CheckCircle2 size={48} className="opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Sạch bản tin!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Trạng thái kho
            </h3>
            <div className="space-y-5">
              <TypeProgress
                label="Sẵn sàng"
                value={
                  Math.round(
                    (summary.availableAssets / summary.totalAssets) * 100,
                  ) || 0
                }
                color="bg-emerald-500"
              />
              <TypeProgress
                label="Đang cho mượn"
                value={
                  Math.round(
                    (summary.activeBorrowing / summary.totalAssets) * 100,
                  ) || 0
                }
                color="bg-blue-500"
              />
              <TypeProgress
                label="Đã hỏng / thanh lý"
                value={(summary.brokenAssets / summary.totalAssets) * 100 || 0}
                color="bg-amber-500"
              />
              <TypeProgress
                label="Bảo trì"
                value={((summary.maintenanceAssets / summary.totalAssets) * 100).toFixed(2) || 0}
                color="bg-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL TỪ CHỐI (NEW) --- */}
      {rejectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
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
                Vui lòng cung cấp lý do để người dùng nắm rõ thông tin.
              </p>
              <form onSubmit={handleRejectSubmit} className="space-y-6">
                <textarea
                  autoFocus
                  className="w-full border-2 border-slate-100 rounded-[1.5rem] p-5 text-sm outline-none focus:border-rose-500/20 focus:ring-4 focus:ring-rose-500/5 transition-all min-h-[140px] font-medium"
                  placeholder="Lý do từ chối..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRejectId(null)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all text-xs uppercase"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={rejectMutation.isPending}
                    className="flex-1 py-4 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 text-xs uppercase"
                  >
                    {rejectMutation.isPending ? "Đang gửi..." : "Xác nhận"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatCard({ label, value, icon, trend, color, isAlert }: any) {
  const colorMap: any = {
    blue: "from-blue-500 to-blue-700 shadow-blue-200",
    rose: "from-rose-500 to-rose-700 shadow-rose-200",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-200",
    amber: "from-amber-500 to-amber-700 shadow-amber-200",
  };
  return (
    <div className="bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      <div className="p-6">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[color]} text-white flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:rotate-12`}
        >
          {icon}
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="flex items-end justify-between">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            {value || 0}
          </h2>
          <span
            className={`text-[10px] font-black px-2 py-1 rounded-lg ${isAlert ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}
          >
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}

function TypeProgress({ label, value, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
