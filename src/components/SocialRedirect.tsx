import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../store/slices/authSlice";
import axiosClient from "../api/axiosClient";
import Loader from "../components/Loader";

export default function SocialRedirect() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosClient.get("/api/auth/me");
        if (response.data.result) {
          const user = response.data.result;
          dispatch(setUser(user));
          if (user.role === "ROLE_ADMIN") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Social login check failed", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [dispatch, navigate]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <Loader />
      <p className="mt-4 text-slate-500">Đang đồng bộ tài khoản...</p>
    </div>
  );
}
