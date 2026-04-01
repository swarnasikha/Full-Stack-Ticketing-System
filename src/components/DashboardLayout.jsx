import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import {
  HiOutlineViewGrid,
  HiOutlineTicket,
  HiOutlineUserGroup,
  HiOutlineChatAlt2,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineQuestionMarkCircle,
  HiOutlineCog,
  HiPlus
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard',                icon: <HiOutlineViewGrid size={20} />, label: 'Dashboard'     },
  { to: '/dashboard/tickets',        icon: <HiOutlineTicket  size={20} />, label: 'Tickets'        },
  { to: '/dashboard/agents',         icon: <HiOutlineUserGroup size={20}/>, label: 'Agents'        },
  { to: '/dashboard/feedback',       icon: <HiOutlineChatAlt2 size={20}/>, label: 'Feedback'       },
  { to: '/dashboard/notifications',  icon: <HiOutlineBell size={20} />,    label: 'Notifications'  },
];

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex-shrink-0 w-[var(--sidebar-width)] sidebar-premium
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">TicketService</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">SteamPRO Console</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-link-premium ${isActive ? 'active shadow-lg shadow-blue-500/20' : ''}`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {item.label}
              {item.to === '/dashboard/notifications' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Area */}
       
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 flex-shrink-0 flex items-center px-8 gap-8 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900">
            <HiOutlineMenu size={24} />
          </button>

          {/* Spacer to push everything to the right */}
          <div className="flex-1" />

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-slate-900 leading-none">{user?.name || 'Administrator'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Console Session</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
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
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-7xl mx-auto px-8 py-4 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}