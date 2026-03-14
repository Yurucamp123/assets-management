import { Camera, Mail, Save, Shield, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useUpdateProfile } from "../hooks/useAuth"; // Bình hãy tạo hook này nhé
import { useAppSelector } from "../store/hooks";

interface ProfileFormData {
  fullName: string;
  email: string;
}

export default function Profile() {
  const { user } = useAppSelector((state) => state.auth);
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>();

  // Load dữ liệu user vào form khi trang được mở
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Cập nhật thông tin thành công!");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
      }
    });
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Thông tin cá nhân</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Avatar & Vai trò */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
            <div className="relative inline-block group">
              <div className="w-32 h-32 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-md mx-auto">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-all text-slate-600">
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-slate-800">{user?.fullName}</h2>
            <p className="text-slate-500 text-sm italic">@{user?.username}</p>
            
            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              user?.role === 'ROLE_ADMIN' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
            }`}>
              <Shield size={14} />
              {user?.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Người dùng'}
            </div>
          </div>
        </div>

        {/* Cột phải: Form chỉnh sửa */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">Chỉnh sửa hồ sơ</h3>
              <p className="text-sm text-slate-500">Cập nhật thông tin liên lạc của bạn</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Họ và tên */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User size={16} className="text-slate-400" />
                    Họ và tên
                  </label>
                  <input
                    {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                    className={`w-full px-4 py-2 border rounded-lg outline-blue-600 transition-all text-sm ${
                      errors.fullName ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" />
                    Email
                  </label>
                  <input
                    {...register("email", { 
                      required: "Vui lòng nhập email",
                      pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" }
                    })}
                    className={`w-full px-4 py-2 border rounded-lg outline-blue-600 transition-all text-sm ${
                      errors.email ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              {/* Thông báo về Username (Không cho sửa) */}
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Lưu ý:</strong> Tên đăng nhập (username) và Vai trò được cấp định danh bởi hệ thống và không thể tự thay đổi. Vui lòng liên hệ IT để hỗ trợ nếu có sai sót.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isPending || !isDirty}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-md ${
                    isPending || !isDirty 
                    ? "bg-slate-300 cursor-not-allowed shadow-none" 
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}