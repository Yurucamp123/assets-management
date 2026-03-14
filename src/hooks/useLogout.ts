import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { logoutSuccess } from "../store/slices/authSlice";
import axiosClient from "../api/axiosClient";

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // Gọi API logout để Backend xóa Set-Cookie
      return await axiosClient.post("/api/auth/logout");
    },
    onSuccess: () => {
      // 1. Xóa dữ liệu trong Redux
      dispatch(logoutSuccess());
      // 2. Đẩy về trang login
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      console.error("Logout lỗi nhưng vẫn xóa state:", error);
      // Dù API lỗi vẫn nên xóa sạch ở Client cho an toàn
      dispatch(logoutSuccess());
      navigate("/login");
    },
  });
};
