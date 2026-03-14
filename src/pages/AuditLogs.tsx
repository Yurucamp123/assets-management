import { useQuery } from "@tanstack/react-query";
import {
  Download,
  FileSpreadsheet,
  RefreshCcw,
  Search,
  Terminal,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { adminApi } from "../api/adminApi";

export default function AuditLogs() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 10;

  // 1. Fetch dữ liệu
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => adminApi.getLogs(page, pageSize),
    placeholderData: (previousData) => previousData,
  });

  const logs = data?.content || [];

  // 2. Logic Lọc an toàn (Sửa lỗi .includes)
  const filteredLogs = logs.filter((log: any) => {
    // Ép kiểu về string trống nếu dữ liệu null/undefined để tránh lỗi .includes
    const action = log?.action || "";
    const username = log?.username || "";
    const details = log?.details || "";
    const timestamp = log?.timestamp ? new Date(log.timestamp) : null;

    const matchesSearch =
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      actionFilter === "ALL" || action.includes(actionFilter);

    // Lọc theo ngày
    let matchesDate = true;
    if (timestamp) {
      if (startDate)
        matchesDate = matchesDate && timestamp >= new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // Bao gồm cả ngày kết thúc
        matchesDate = matchesDate && timestamp <= end;
      }
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  // 3. Export CSV chuẩn hóa
  const handleExport = async (exportAll: boolean) => {
    try {
      setIsExporting(true);
      const dataToExport = exportAll
        ? (await adminApi.getLogs(0, 9999)).content
        : filteredLogs;

      if (!dataToExport || dataToExport.length === 0) return;

      const headers = [
        "ID",
        "Thời gian",
        "ID Người dùng",
        "Hành động",
        "Chi tiết",
      ];
      const csvRows = dataToExport.map((log: any) =>
        [
          log.id,
          `"${new Date(log.timestamp).toLocaleString("vi-VN")}"`,
          `"${log.userId || ""}"`,
          `"${log.action || ""}"`,
          `"${(log.details || "").replace(/"/g, '""')}"`,
        ].join(","),
      );

      const BOM = "\uFEFF";
      const csvString = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([BOM + csvString], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Audit_Logs_${new Date().getTime()}.csv`;
      link.click();
    } catch (error) {
      console.error("Export error", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getActionColor = (action: string) => {
    const act = action?.toUpperCase() || "";
    if (act.includes("DELETE"))
      return "text-red-400 border-red-500/20 bg-red-500/10";
    if (act.includes("UPDATE") || act.includes("CHANGE"))
      return "text-amber-400 border-amber-500/20 bg-amber-500/10";
    if (act.includes("CREATE"))
      return "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
    return "text-blue-400 border-blue-500/20 bg-blue-500/10";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Terminal className="text-blue-600" />
          Nhật ký hệ thống
        </h2>

        {/* Thanh công cụ lọc đa năng */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex items-end gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="User, chi tiết..."
                className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-full lg:w-48 outline-none focus:ring-2 focus:ring-blue-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Hành động
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full lg:w-40 px-3 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="CHANGE">Thay đổi</option>
              <option value="CREATE">Tạo mới</option>
              <option value="DELETE">Xóa</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full lg:w-40 px-3 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none"
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full lg:w-40 px-3 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 ml-auto">
            {/* Dropdown Xuất dữ liệu - Đã sửa lỗi mất hover */}
            <div className="relative group">
              <button
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Xuất dữ liệu
              </button>

              {/* Lớp phủ tàng hình giúp giữ hover không bị mất khi di chuyển chuột xuống */}
              <div className="absolute right-0 top-full h-2 w-full bg-transparent group-hover:block hidden" />

              {/* Menu Tooltip */}
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-2xl py-2 hidden group-hover:block z-[100] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-3 py-1.5 border-b border-slate-50 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tùy chọn xuất
                  </span>
                </div>

                <button
                  onClick={() => handleExport(false)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet size={14} /> Trang hiện tại (
                  {filteredLogs.length})
                </button>

                <button
                  onClick={() => handleExport(true)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 font-bold transition-colors"
                >
                  <RefreshCcw size={14} className="text-blue-500" /> Toàn bộ hệ
                  thống
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal UI Table */}
      <div className="bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Principal</th>
                <th className="p-4">Action</th>
                <th className="p-4">Execution Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-mono text-[12px]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-20 text-center text-slate-500 animate-pulse"
                  >
                    Loading secure logs...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log: any) => (
                  <tr
                    key={log.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-slate-700 text-center">{log.id}</td>
                    <td className="p-4 text-slate-500 whitespace-nowrap italic">
                      {new Date(log.timestamp).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-4 text-slate-300 font-bold">
                      {log.username || "system"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 border rounded text-[10px] font-black ${getActionColor(log.action)}`}
                      >
                        {log.action || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {log.details || "No details provided"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-20 text-center text-slate-600 italic"
                  >
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Console Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center font-mono">
          <div className="text-[10px] text-slate-600">
            PAGE_{page + 1}_OF_{data?.totalPages || 1}
          </div>
          <div className="flex gap-4">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs text-slate-500 hover:text-blue-400 disabled:opacity-0 transition-colors"
            >
              PREV
            </button>
            <button
              disabled={page >= (data?.totalPages || 1) - 1}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs text-slate-500 hover:text-blue-400 disabled:opacity-0 transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
