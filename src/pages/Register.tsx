import { AxiosError } from "axios";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister, type RegisterData } from "../hooks/useAuth";

// --- ĐỊNH NGHĨA TYPES ---

interface ApiErrorResponse {
  message: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterData>({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  const { mutate: register, isPending, error } = useRegister();

  // Ép kiểu lỗi về AxiosError để truy xuất message an toàn
  const axiosError = error as AxiosError<ApiErrorResponse>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="py-6 px-4 w-full">
        <div className="grid lg:grid-cols-2 items-center gap-10 max-w-6xl w-full mx-auto">
          <div className="border border-slate-300 rounded-lg p-8 bg-white shadow-lg max-w-md mx-auto w-full">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="mb-6">
                <h1 className="text-slate-900 text-3xl font-bold">
                  Tạo tài khoản
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  Bắt đầu quản lý thiết bị của bạn ngay hôm nay.
                </p>
              </div>

              {/* THÔNG BÁO LỖI ĐĂNG KÝ */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in duration-300">
                  <AlertCircle size={18} />
                  <span>
                    {axiosError?.response?.data?.message ||
                      "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!"}
                  </span>
                </div>
              )}

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Họ và tên
                </label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full text-sm border border-slate-300 px-4 py-3 rounded-lg outline-blue-600 focus:border-blue-600 transition-all"
                  placeholder="Nhập họ và tên"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Tên đăng nhập
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  className="w-full text-sm border border-slate-300 px-4 py-3 rounded-lg outline-blue-600 focus:border-blue-600 transition-all"
                  placeholder="Nhập tên đăng nhập"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full text-sm border border-slate-300 px-4 py-3 rounded-lg outline-blue-600 focus:border-blue-600 transition-all"
                  placeholder="example@domain.com"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Mật khẩu
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full text-sm border border-slate-300 px-4 py-3 rounded-lg outline-blue-600 focus:border-blue-600 transition-all"
                  placeholder="Nhập mật khẩu"
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className={`w-full flex justify-center items-center mt-6 py-3 px-4 text-sm font-semibold rounded-lg text-white transition-all ${
                  isPending
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tạo tài khoản...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </button>

              <p className="text-sm text-center text-slate-600 mt-4">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:underline ml-1"
                >
                  Đăng nhập tại đây
                </Link>
              </p>
            </form>
          </div>

          <div className="max-lg:hidden">
            <img
              src="https://readymadeui.com/login-image.webp"
              className="w-full aspect-[71/50] object-cover rounded-2xl"
              alt="register img"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
