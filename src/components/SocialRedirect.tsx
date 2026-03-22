import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Thêm useSearchParams
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../store/slices/authSlice";
import axiosClient from "../api/axiosClient";
import Loader from "../components/Loader";

export default function SocialRedirect() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams(); // Hook để đọc query string (?token=...)

  useEffect(() => {
    const handleAuthExchange = async () => {
      const token = searchParams.get("token");

      if (!token) {
        console.error("Không tìm thấy token trên URL");
        navigate("/login");
        return;
      }

      try {
        await axiosClient.get(`/api/auth/social-set-cookie?token=${token}`);
        setTimeout(async () => {
          const response = await axiosClient.get("/api/auth/me");

          if (response.data.result) {
            const user = response.data.result;

            dispatch(setUser(user));
            setTimeout(() => {
              const target = user.role === "ROLE_ADMIN" ? "/admin" : "/";
              navigate(target, { replace: true });
            }, 100);
          }
        }, 3000);
      } catch (error) {
        console.error("Đồng bộ tài khoản thất bại", error);
        navigate("/login");
      }
    };

    handleAuthExchange();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <Loader />
      <p className="mt-4 text-slate-500 font-medium">
        Đang xác thực tài khoản an toàn...
      </p>
      <p className="text-xs text-slate-400 mt-2">
        Quá trình này chỉ diễn ra trong giây lát
      </p>
    </div>
  );
}
