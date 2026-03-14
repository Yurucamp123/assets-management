import { Outlet, NavLink } from 'react-router-dom'; // Chuyển Link thành NavLink
import { ShieldCheck, Box, Users, ClipboardCheck, Settings, LogOut, User } from 'lucide-react';
import { useLogout } from '../hooks/useLogout';

export default function AdminLayout() {
  const { mutate: logout } = useLogout();
  
  const handleLogout = () => {
    logout();
  };

  const adminMenu = [
    { icon: <ShieldCheck size={20} />, label: 'Thống kê Admin', path: '/admin' },
    { icon: <Box size={20} />, label: 'Quản lý thiết bị', path: '/admin/manage-assets' },
    { icon: <ClipboardCheck size={20} />, label: 'Duyệt yêu cầu', path: '/admin/approve-requests' },
    { icon: <Users size={20} />, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: <User size={20} />, label: 'Hồ sơ cá nhân', path: '/admin/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white text-2xl font-bold tracking-tight">IAMS <span className="text-blue-500">PRO</span></h2>
          <div className="mt-2 inline-block px-2 py-0.5 bg-blue-600 text-[10px] text-white rounded uppercase font-bold">
            Quản trị viên
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {adminMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              // Thêm logic đổi class khi active cho Admin (Slate -> Blue)
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium border-l-4 ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border-blue-500 shadow-inner" 
                    : "border-transparent hover:bg-slate-800 hover:text-white text-slate-400"
                }`
              }
              end={item.path === '/admin'} // Tránh active nhầm trang chủ admin
            >
              {item.icon}
              <span className="text-[15px]">{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-800">
             <NavLink 
                to="/admin/logs" 
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 transition-all text-sm font-medium ${isActive ? "text-blue-400" : "text-slate-400 hover:text-blue-400"}`
                }
             >
                <Settings size={18} />
                Cấu hình hệ thống
             </NavLink>
          </div>
        </nav>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 transition-all font-medium group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[15px]">Đăng xuất Admin</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}