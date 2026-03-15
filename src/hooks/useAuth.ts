import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAppDispatch } from "../store/hooks";
import { setUser } from "../store/slices/authSlice";

interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  [key: string]: string;
}

interface AuthError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await axiosClient.post("/api/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(setUser(data.result)); // Lưu vào Redux
      navigate(data.result.role === "ROLE_ADMIN" ? "/admin" : "/");
    },
    onError: (error: AuthError) => {
      console.log("Login error:", error);
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      return axiosClient.post("/api/auth/register", data);
    },
    onSuccess: () => {
      navigate("/login");
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
    },
    onError: () => {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    },
  });
};

interface UpdateProfileRequest {
  fullName: string;
  email: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      // Gọi API PUT đã làm ở BE
      const response = await axiosClient.put("/api/auth/me", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (data.result) {
        dispatch(setUser(data.result));
      }
    },
  });
};
