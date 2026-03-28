import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Панель управления', icon: 'LayoutDashboard' },
  { id: 'sites', label: 'Управление сайтами', icon: 'Globe' },
  { id: 'quests', label: 'Редактор путей', icon: 'Map' },
  { id: 'members', label: 'Участники', icon: 'Users' },
  { id: 'achievements', label: 'Таблица достижений', icon: 'Trophy' },
  { id: 'messages', label: 'Сообщения', icon: 'MessageSquare' },
  { id: 'profile', label: 'Личный кабинет', icon: 'User' },
];

const memberNavItems = [
  { id: 'my-quests', label: 'Мои Пути', icon: 'Map' },
  { id: 'achievements', label: 'Достижения', icon: 'Trophy' },
  { id: 'messages', label: 'Сообщения', icon: 'MessageSquare' },
  { id: 'profile', label: 'Личный кабинет', icon: 'User' },
];

const roleLabel: Record<string, string> = {
  owner: 'Владелец',
  admin: 'Администратор',
  editor: 'Редактор',
  member: 'Участник',
  member_plus: 'Участник+',
  member_vip: 'Участник VIP',
};

const roleBadge: Record<string, string> = {
  owner: 'badge-role-owner',
  admin: 'badge-role-admin',
  editor: 'badge-role-editor',
  member: 'badge-role-member',
  member_plus: 'badge-role-member',
  member_vip: 'badge-role-owner',
};

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { currentUser, logout, messages } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin' || currentUser?.role === 'editor';
  const items = isAdmin ? navItems : memberNavItems;

  const unreadCount = messages.filter(m => m.to_user_id === currentUser?.id && !m.is_read).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-30 h-full w-64 flex-shrink-0
        bg-sidebar border-r border-sidebar-border
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(213 90% 42%))' }}>
              <Icon name="Sparkles" size={18} className="text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            </div>
            <div>
              <div className="font-montserrat font-800 text-sm text-white tracking-wide">МАСТЕР</div>
              <div className="font-montserrat text-[10px] text-yellow-400 tracking-widest -mt-0.5">ПУТЕЙ</div>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, hsl(263 70% 55%), hsl(213 90% 45%))' }}>
              {currentUser?.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-white truncate">{currentUser?.name}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${roleBadge[currentUser?.role || 'member']}`}>
                {roleLabel[currentUser?.role || 'member']}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto scroll-custom">
          <div className="space-y-1">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${currentPage === item.id ? 'active' : 'text-sidebar-foreground'}`}
              >
                <Icon name={item.icon} size={18} className={currentPage === item.id ? 'text-yellow-400' : 'text-muted-foreground'} />
                <span>{item.label}</span>
                {item.id === 'messages' && unreadCount > 0 && (
                  <span className="ml-auto bg-violet-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Icon name="LogOut" size={18} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-muted-foreground hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Icon name="Menu" size={22} />
          </button>

          <div className="flex-1">
            <h1 className="text-sm font-semibold text-muted-foreground">
              {items.find(i => i.id === currentPage)?.label || 'Платформа'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => onNavigate('messages')}
                className="relative text-muted-foreground hover:text-white transition-colors"
              >
                <Icon name="Bell" size={20} />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              </button>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
              style={{ background: 'linear-gradient(135deg, hsl(263 70% 55%), hsl(213 90% 45%))' }}
              onClick={() => onNavigate('profile')}>
              {currentUser?.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scroll-custom">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}