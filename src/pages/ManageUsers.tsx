import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Mail,
  Search,
  Shield,
  ToggleLeft,
  ToggleRight,
  UserMinus,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { adminApi } from "../api/adminApi";

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Bổ sung state cho bộ lọc
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 1. Fetch danh sách (BE trả về Page<UserResponse>)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(),
  });

  // 2. Mutation Change Role (PATCH /{id}/role?role=...)
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(res.message || "Đã cập nhật quyền hạn");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Lỗi cập nhật quyền"),
  });

  // 3. Mutation Change Status (PATCH /{id}/status?isEnabled=...)
  const statusMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: number; isEnabled: boolean }) =>
      adminApi.updateUserStatus(id, isEnabled),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(res.message || "Đã cập nhật trạng thái");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Lỗi cập nhật trạng thái"),
  });

  // 4. Mutation Delete (DELETE /{id})
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(res.message || "Đã xóa người dùng");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Không thể xóa người dùng"),
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Xác nhận xóa vĩnh viễn người dùng: ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
        <p className="text-slate-500 font-medium">
          Đang tải danh sách nhân sự...
        </p>
      </div>
    );

  const users = data?.result?.content || [];

  // Logic lọc dữ liệu kết hợp Search + Role + Status
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" ? u.enabled === true : u.enabled === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Quản lý người dùng
          </h2>
          <p className="text-sm text-slate-500">
            Phê duyệt quyền hạn và trạng thái tài khoản hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bộ lọc Role */}
          <div className="relative flex items-center">
            <Filter
              size={14}
              className="absolute left-3 text-slate-400 pointer-events-none"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Tất cả quyền</option>
              <option value="ROLE_ADMIN">Quản trị viên</option>
              <option value="ROLE_USER">Người dùng</option>
            </select>
          </div>

          {/* Bộ lọc Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="DISABLED">Đã khóa</option>
          </select>

          {/* Ô Tìm kiếm */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-full md:w-64 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Nhân sự
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                  ID
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                  Vai trò
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                  Hoạt động
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                  Gỡ bỏ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${user.enabled ? "bg-blue-500" : "bg-slate-400"}`}
                        >
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700 flex items-center gap-2">
                            {user.fullName}
                            {!user.enabled && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                Banned
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${user.role === "ROLE_ADMIN" ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-600 border border-slate-100"}`}
                        >
                          {user.id}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${user.role === "ROLE_ADMIN" ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-600 border border-slate-100"}`}
                        >
                          <Shield size={12} />
                          {user.role}
                        </div>
                        <select
                          value={user.role}
                          disabled={roleMutation.isPending}
                          onChange={(e) =>
                            roleMutation.mutate({
                              id: user.id,
                              role: e.target.value,
                            })
                          }
                          className="mt-2 text-[11px] border-none bg-transparent font-bold text-blue-600 underline cursor-pointer outline-none"
                        >
                          <option value="ROLE_USER">Gán USER</option>
                          <option value="ROLE_ADMIN">Gán ADMIN</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: user.id,
                            isEnabled: !user.enabled,
                          })
                        }
                        className="inline-flex flex-col items-center group/toggle"
                      >
                        {user.enabled ? (
                          <ToggleRight
                            size={38}
                            className="text-green-500 group-hover/toggle:scale-110 transition-transform"
                          />
                        ) : (
                          <ToggleLeft
                            size={38}
                            className="text-slate-300 group-hover/toggle:scale-110 transition-transform"
                          />
                        )}
                        <span
                          className={`text-[10px] font-bold ${user.enabled ? "text-green-600" : "text-slate-400"}`}
                        >
                          {user.enabled ? "ENABLED" : "DISABLED"}
                        </span>
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(user.id, user.fullName)}
                        disabled={deleteMutation.isPending}
                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                      >
                        <UserMinus size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-10 text-center text-slate-400 italic"
                  >
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
