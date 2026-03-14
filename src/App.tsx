import { useEffect } from "react";
import { useAppDispatch } from "./store/hooks";
import { setUser, setLoading } from "./store/slices/authSlice";
import AppRoutes from "./routes/AppRoutes";
import axiosClient from "./api/axiosClient";
import { Toaster } from "react-hot-toast";

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Gọi API /me để kiểm tra session hiện có trong Cookie
        const response = await axiosClient.get("/api/auth/me");
        if (response.data.result) {
          dispatch(setUser(response.data.result));
        }
      } catch {
        console.log("Chưa đăng nhập hoặc session hết hạn");
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right" // Vị trí hiển thị
        reverseOrder={false}
        toastOptions={{
          // Bạn có thể custom style cho đồng bộ với IAMS
          duration: 3000,
          style: {
            background: "#334155", // Slate-700
            color: "#fff",
            borderRadius: "10px",
          },
          success: {
            iconTheme: {
              primary: "#3b82f6", // Blue-500
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
};
