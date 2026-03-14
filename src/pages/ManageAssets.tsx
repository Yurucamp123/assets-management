import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast"; // Khuyên dùng để báo thành công/lỗi
import { adminApi } from "../api/adminApi";
import { assetApi } from "../api/assetApi";

export default function ManageAssets() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const assetTypes = [
    { value: "LAPTOP", label: "Laptop" },
    { value: "SMARTPHONE", label: "Điện thoại" },
    { value: "ACCESSORY", label: "Phụ kiện" },
    { value: "OTHER", label: "Khác" },
  ];
  const { data } = useQuery({
    queryKey: ["admin-assets"],
    queryFn: () => assetApi.getAll(0, 50),
  });

  const createMutation = useMutation({
    mutationFn: assetApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      closeModal();
      toast.success("Thêm thiết bị thành công!");
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        "Không thể thêm thiết bị. Vui lòng kiểm tra lại!";
      toast.error(msg);
    },
  });

  // 2. Mutation Cập nhật thông tin (Modal)
  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; data: any }) =>
      assetApi.update(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      closeModal();
      toast.success("Cập nhật thông tin thành công!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Cập nhật thất bại!";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: assetApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      toast.success("Đã xóa thiết bị thành công!");
      closeDeleteModal();
    },
    onError: (err: any) => {
      const errorMsg =
        err.response?.data?.message || "Không thể xóa thiết bị này!";
      toast.error(errorMsg);
      closeDeleteModal();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminApi.updateAssetStatus(id, status),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-assets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Lỗi cập nhật"),
  });

  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingId(null);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  // 3. Handlers
  const handleEdit = (asset: any) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    console.log(payload);

    if (editingAsset) {
      updateMutation.mutate({ id: editingAsset.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý kho thiết bị
          </h1>
          <p className="text-sm text-slate-500">
            Thêm, sửa hoặc xóa các thiết bị trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus size={18} /> Thêm thiết bị
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto p-2">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                ID
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                Tên thiết bị
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                Serial Number
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                Loại
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">
                Trạng thái
              </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-center">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.content?.map((asset: any) => (
              <tr
                key={asset.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="p-4 font-medium text-slate-700">{asset.id}</td>
                <td className="p-4 font-medium text-slate-700">
                  {asset.assetName}
                </td>
                <td className="p-4 text-slate-600">{asset.assetTag}</td>
                <td className="p-4 text-slate-600">
                  {assetTypes.find((t) => t.value === asset.category)?.label}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={asset.status}
                    // Khóa select nếu đang mượn hoặc đã hỏng
                    disabled={
                      asset.status === "BROKEN" || asset.status === "ASSIGNED"
                    }
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        id: asset.id,
                        status: e.target.value,
                      })
                    }
                    className={`
                      px-3 py-1.5 rounded-xl font-bold text-[11px] border-none outline-none ring-2 ring-transparent transition-all cursor-pointer
                      ${asset.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-600 focus:ring-emerald-200" : ""}
                      ${asset.status === "MAINTENANCE" ? "bg-amber-50 text-amber-600 focus:ring-amber-200" : ""}
                      ${asset.status === "BROKEN" ? "bg-rose-50 text-rose-600 opacity-80 cursor-not-allowed" : ""}
                      ${asset.status === "ASSIGNED" ? "bg-blue-50 text-blue-600 opacity-80 cursor-not-allowed" : ""}
                    `}
                  >
                    <option
                      value="AVAILABLE"
                      disabled={asset.status === "BROKEN"}
                    >
                      Có sẵn
                    </option>
                    <option
                      value="MAINTENANCE"
                      disabled={asset.status === "BROKEN"}
                    >
                      Bảo trì
                    </option>
                    <option value="BROKEN">Đã hỏng/Thanh lý</option>
                    {asset.status === "ASSIGNED" && (
                      <option value="ASSIGNED">Đang mượn</option>
                    )}
                  </select>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(asset)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(asset.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM (Phần 2 trọng tâm) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingAsset ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên thiết bị
                </label>
                <input
                  name="assetName"
                  defaultValue={editingAsset?.assetName}
                  required
                  placeholder="VD: Laptop Dell Latitude"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Asset Tag (Serial)
                </label>
                <input
                  name="assetTag"
                  defaultValue={editingAsset?.assetTag}
                  required
                  placeholder="VD: SN-12345"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Loại thiết bị
                </label>
                <select
                  name="category"
                  defaultValue={editingAsset?.category || "LAPTOP"}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="LAPTOP">Laptop</option>
                  <option value="SMARTPHONE">Điện thoại</option>
                  <option value="ACCESSORY">Phụ kiện</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:bg-blue-300"
                >
                  {editingAsset ? "Lưu thay đổi" : "Tạo thiết bị"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Xác nhận xóa?
              </h3>
              <p className="text-slate-500 mb-6">
                Hành động này không thể hoàn tác. Thiết bị sẽ bị xóa vĩnh viễn
                khỏi hệ thống.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-sm shadow-red-200 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Vâng, Xóa ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
