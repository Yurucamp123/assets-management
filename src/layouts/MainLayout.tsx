import { FileText, LogOut, Package, User } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAppSelector } from '../store/hooks';

export default function MainLayout() {
  const { mutate: logout } = useLogout();
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation(); // Lấy URL hiện tại để check thủ công

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { icon: <Package size={20} />, label: 'Danh sách thiết bị', path: '/' },
    { icon: <FileText size={20} />, label: 'Yêu cầu của tôi', path: '/my-requests' },
    { icon: <User size={20} />, label: 'Hồ sơ cá nhân', path: '/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm sticky top-0 h-screen">
        <div className="p-6">
          <h2 className="text-blue-600 text-2xl font-bold tracking-tight">IAMS</h2>
          <p className="text-slate-400 text-xs font-medium uppercase mt-1">Bảng người dùng</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            // Kiểm tra thủ công: Nếu đang ở "/" và item là "/assets" thì cho nó active luôn
            const isDefaultActive = location.pathname === '/' && item.path === '/assets';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    (isActive || isDefaultActive) 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                  }`
                }
              >
                {item.icon}
                <span className="text-[15px]">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
          >
            <LogOut size={20} />
            <span className="text-[15px]">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="text-right">
                <div className="text-sm font-bold text-slate-700 leading-none">
                    {user?.fullName || "Người dùng IAMS"}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Nhân viên</div>
            </div>
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-blue-400 text-white rounded-full flex items-center justify-center font-bold shadow-md">
              {user?.fullName?.charAt(0) || "U"}
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}