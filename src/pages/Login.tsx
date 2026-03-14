import { useState } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  
  const { mutate: login, isPending, error } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    login(credentials);
  };

  const handleSocialLogin = (provider: 'Google' | 'Facebook') => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="py-6 px-4 w-full">
        <div className="grid lg:grid-cols-2 items-center gap-10 max-w-6xl w-full mx-auto">
          <div className="border border-slate-300 rounded-lg p-8 bg-white shadow-lg max-w-md mx-auto w-full">
            <form className="space-y-6" onSubmit={handleSignIn}>
              <div className="mb-10">
                <h1 className="text-slate-900 text-3xl font-bold">Đăng nhập</h1>
                <p className="text-slate-500 text-sm mt-4">Chào mừng quay trở lại! Vui lòng nhập thông tin của bạn.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in duration-300">
                  <AlertCircle size={18} />
                  <span>
                    {(error as any)?.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không chính xác!"}
                  </span>
                </div>
              )}

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">Tên đăng nhập</label>
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
                <label className="text-slate-900 text-sm font-medium mb-2 block">Mật khẩu</label>
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
                className={`w-full hover:bg-blue-700 cursor-pointer flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-lg text-white transition-all ${
                  isPending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : "Đăng nhập"}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase">Hoặc tiếp tục với</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center hover:bg-amber-50 cursor-pointer justify-center gap-2 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                  <span className="text-sm font-medium">Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center hover:bg-amber-50 cursor-pointer justify-center gap-2 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
                >
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="facebook" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
              </div>

              <p className="text-sm text-center text-slate-600">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline ml-1">
                  Đăng ký tại đây
                </Link>
              </p>
            </form>
          </div>

          <div className="max-lg:hidden">
            <img
              src="https://readymadeui.com/login-image.webp"
              className="w-full aspect-[71/50] object-cover rounded-2xl"
              alt="login img"
            />
          </div>
        </div>
      </div>
    </div>
  );
}