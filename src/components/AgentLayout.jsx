import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineTicket, HiOutlineLogout, HiOutlineBriefcase
} from 'react-icons/hi';

export default function AgentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Premium Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <HiOutlineBriefcase size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none">TicketFlow</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Field Operations</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center">
              <NavLink
                to="/agent"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <HiOutlineTicket size={18} />
                My Assignments
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 pr-6 border-r border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-900 leading-none">{user?.name || 'Field Agent'}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Personnel ID: {user?.uid?.slice(-6)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm">
                {initial}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
              title="Sign out"
            >
              <HiOutlineLogout size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}