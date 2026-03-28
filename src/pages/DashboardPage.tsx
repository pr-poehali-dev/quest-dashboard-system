import { useApp } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

interface Props {
  onNavigate: (page: string) => void;
}

export default function DashboardPage({ onNavigate }: Props) {
  const { users, sites, userProgress, joinRequests, approveJoinRequest, rejectJoinRequest } = useApp();

  const totalQuests = sites.reduce((acc, s) => acc + s.quests.length, 0);
  const totalLevels = sites.reduce((acc, s) => acc + s.quests.reduce((a, q) => a + q.levels.length, 0), 0);
  const completedCount = userProgress.length;
  const pendingRequests = joinRequests.filter(r => r.status === 'pending');

  const stats = [
    { label: 'Участников', value: users.length, icon: 'Users', color: 'from-violet-600 to-violet-800', glow: 'rgba(109,40,217,0.4)' },
    { label: 'Сайтов', value: sites.length, icon: 'Globe', color: 'from-blue-600 to-blue-800', glow: 'rgba(37,99,235,0.4)' },
    { label: 'Путей', value: totalQuests, icon: 'Map', color: 'from-yellow-500 to-amber-700', glow: 'rgba(234,179,8,0.4)' },
    { label: 'Уровней пройдено', value: completedCount, icon: 'Trophy', color: 'from-green-600 to-green-800', glow: 'rgba(22,163,74,0.4)' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-montserrat text-2xl font-black text-white">Панель управления</h1>
        <div className="separator-glow mt-3" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card-glow rounded-xl p-4 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
              style={{ background: `radial-gradient(circle at center, ${stat.glow}, transparent)` }} />
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
              style={{ boxShadow: `0 4px 14px ${stat.glow}` }}>
              <Icon name={stat.icon} size={20} className="text-white" />
            </div>
            <div className="text-2xl font-black font-montserrat text-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending join requests */}
        <div className="card-glow rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-bold text-white flex items-center gap-2">
              <Icon name="UserPlus" size={18} className="text-yellow-400" />
              Запросы на участие
              {pendingRequests.length > 0 && (
                <span className="ml-1 bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </h2>
          </div>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Icon name="CheckCircle" size={32} className="mx-auto mb-2 text-green-500/50" />
              Нет новых запросов
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => {
                const questTitle = sites.flatMap(s => s.quests).find(q => q.id === req.quest_id)?.title;
                return (
                  <div key={req.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium text-white">{req.user_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {questTitle ? `Путь: ${questTitle}` : 'Запрос на вступление'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveJoinRequest(req.id)}
                        className="px-3 py-1.5 btn-gold rounded-lg text-xs font-semibold"
                      >
                        ✓ Принять
                      </button>
                      <button
                        onClick={() => rejectJoinRequest(req.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs hover:bg-red-500/30 transition-all"
                      >
                        ✗
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sites overview */}
        <div className="card-glow rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-montserrat font-bold text-white flex items-center gap-2">
              <Icon name="Globe" size={18} className="text-violet-400" />
              Сайты платформы
            </h2>
            <button
              onClick={() => onNavigate('sites')}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Управлять →
            </button>
          </div>
          {sites.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">Нет сайтов</div>
          ) : (
            <div className="space-y-3">
              {sites.map(site => (
                <div key={site.id} className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
                  <div>
                    <div className="text-sm font-medium text-white">{site.name}</div>
                    <div className="text-xs text-muted-foreground">{site.quests.length} путей</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${site.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => onNavigate('sites')}
            className="w-full mt-4 py-2.5 btn-gold rounded-xl text-xs font-semibold"
          >
            + Добавить сайт
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-montserrat font-bold text-white mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Новый Путь', icon: 'Plus', page: 'quests', color: 'btn-gold' },
            { label: 'Добавить участника', icon: 'UserPlus', page: 'members', color: 'btn-violet' },
            { label: 'Достижения', icon: 'Trophy', page: 'achievements', color: 'btn-violet' },
            { label: 'Сообщения', icon: 'MessageSquare', page: 'messages', color: 'btn-violet' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className={`${action.color} flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all`}
            >
              <Icon name={action.icon} size={16} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total levels info */}
      <div className="card-glow rounded-xl p-5">
        <h2 className="font-montserrat font-bold text-white mb-4 flex items-center gap-2">
          <Icon name="BarChart3" size={18} className="text-yellow-400" />
          Сводка по платформе
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black font-montserrat mystical-text">{totalLevels}</div>
            <div className="text-xs text-muted-foreground mt-1">Всего уровней</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black font-montserrat mystical-text">{completedCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Пройдено</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black font-montserrat mystical-text">
              {totalLevels > 0 ? Math.round((completedCount / (totalLevels * Math.max(users.length, 1))) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Общий прогресс</div>
          </div>
        </div>
      </div>
    </div>
  );
}
