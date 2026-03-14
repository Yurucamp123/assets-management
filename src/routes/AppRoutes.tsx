import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register"; // Bổ sung trang Register
import RequestList from "../pages/RequestList";
import { useAppSelector } from "../store/hooks";
import Loader from "../components/Loader";
import AssetList from "../pages/AssetList";
import Profile from "../pages/Profile";
import SocialRedirect from "../components/SocialRedirect";
import ManageAssets from "../pages/ManageAssets";
import ApproveRequests from "../pages/ApproveRequests";
import ManageUsers from "../pages/ManageUsers";
import AuditLogs from "../pages/AuditLogs";

// Component bảo vệ Route
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: "ROLE_ADMIN" | "ROLE_USER";
}> = ({ children, allowedRole }) => {
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth,
  );

  if (loading) return <Loader />;

  // 1. Chưa đăng nhập -> đá về login
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  // 2. Sai Role -> đá về trang mặc định của Role đó
  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate to={user.role === "ROLE_ADMIN" ? "/admin" : "/"} replace />
    );
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- 1. PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- 2. USER ROUTES (MainLayout) --- */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRole="ROLE_USER">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<AssetList />} />
          <Route path="my-requests" element={<RequestList />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/oauth2/callback" element={<SocialRedirect />} />
        {/* --- 3. ADMIN ROUTES (AdminLayout) --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ROLE_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Path: /admin */}
          <Route index element={<Dashboard />} />

          {/* Path: /admin/manage-assets */}
          <Route path="manage-assets" element={<ManageAssets />} />

          {/* Path: /admin/approve-requests */}
          <Route path="approve-requests" element={<ApproveRequests />} />

          {/* Path: /admin/users */}
          <Route path="users" element={<ManageUsers />} />

          {/* Path: /admin/logs */}
          <Route path="logs" element={<AuditLogs />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* --- 4. CATCH ALL --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
