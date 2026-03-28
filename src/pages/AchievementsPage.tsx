import { useApp } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

export default function AchievementsPage() {
  const { users, sites, userProgress } = useApp();

  const allQuests = sites.flatMap(s => s.quests);
  const allLevels = allQuests.flatMap(q => q.levels);

  const getUserStats = (userId: string) => {
    const progress = userProgress.filter(p => p.user_id === userId);
    const completed = progress.length;
    const totalWithHints = progress.filter(p => p.used_hint).length;
    const score = completed * 100 - totalWithHints * 20;
    const questIds = [...new Set(progress.map(p => p.quest_id))];
    return { completed, totalWithHints, score: Math.max(0, score), questsCompleted: questIds.length };
  };

  const leaderboard = users
    .map(user => ({ user, ...getUserStats(user.id) }))
    .sort((a, b) => b.score - a.score);

  const totalCompletions = userProgress.length;
  const hintUsages = userProgress.filter(p => p.used_hint).length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-montserrat text-2xl font-black text-white">Таблица достижений</h1>
        <div className="separator-glow mt-2" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Участников', value: users.length, icon: 'Users', color: 'text-violet-400' },
          { label: 'Всего уровней', value: allLevels.length, icon: 'Layers', color: 'text-blue-400' },
          { label: 'Пройдено', value: totalCompletions, icon: 'CheckCircle', color: 'text-green-400' },
          { label: 'Подсказок', value: hintUsages, icon: 'Lightbulb', color: 'text-yellow-400' },
        ].map(stat => (
          <div key={stat.label} className="card-glow rounded-xl p-4 text-center">
            <Icon name={stat.icon} size={24} className={`mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-black font-montserrat text-white">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card-glow rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Icon name="Trophy" size={20} className="text-yellow-400" />
          <h2 className="font-montserrat font-bold text-white">Рейтинг участников</h2>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Нет данных</div>
        ) : (
          <div className="divide-y divide-border">
            {leaderboard.map(({ user, completed, totalWithHints, score, questsCompleted }, idx) => (
              <div key={user.id} className={`px-5 py-4 flex items-center gap-4 hover:bg-secondary/20 transition-colors ${idx === 0 ? 'bg-yellow-500/5' : idx === 1 ? 'bg-gray-500/5' : idx === 2 ? 'bg-amber-700/5' : ''}`}>
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  idx === 0 ? 'bg-yellow-500 text-black' :
                  idx === 1 ? 'bg-gray-400 text-black' :
                  idx === 2 ? 'bg-amber-700 text-white' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {idx === 0 ? '👑' : idx + 1}
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(263 70% 55%), hsl(213 90% 45%))' }}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
                  <div>
                    <div className="text-sm font-bold text-white">{completed}</div>
                    <div className="text-[10px] text-muted-foreground">уровней</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{questsCompleted}</div>
                    <div className="text-[10px] text-muted-foreground">путей</div>
                  </div>
                  <div>
                    <div className="text-xs text-yellow-400">-{totalWithHints * 20}</div>
                    <div className="text-[10px] text-muted-foreground">подсказки</div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-xl font-black font-montserrat ${idx === 0 ? 'mystical-text' : 'text-white'}`}>
                    {score}
                  </div>
                  <div className="text-[10px] text-muted-foreground">очков</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-quest stats */}
      {allQuests.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-montserrat font-bold text-white flex items-center gap-2">
            <Icon name="Map" size={18} className="text-violet-400" />
            Прогресс по путям
          </h2>
          <div className="grid gap-4">
            {allQuests.map(quest => {
              const questProgress = userProgress.filter(p => p.quest_id === quest.id);
              const uniqueUsers = [...new Set(questProgress.map(p => p.user_id))];
              const totalLevelsInQuest = quest.levels.length;
              const avgProgress = uniqueUsers.length > 0
                ? Math.round(questProgress.length / Math.max(uniqueUsers.length, 1))
                : 0;

              return (
                <div key={quest.id} className="card-glow rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">{quest.title}</h3>
                    <span className="text-xs text-muted-foreground">{totalLevelsInQuest} уровней</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Участников: </span>
                      <span className="text-white font-semibold">{uniqueUsers.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Ср. уровень: </span>
                      <span className="text-white font-semibold">{avgProgress}</span>
                    </div>
                  </div>
                  {totalLevelsInQuest > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Общий прогресс</span>
                        <span className="text-violet-400">{Math.round((questProgress.length / (totalLevelsInQuest * Math.max(users.length, 1))) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (questProgress.length / (totalLevelsInQuest * Math.max(users.length, 1))) * 100)}%`,
                            background: 'linear-gradient(90deg, hsl(263 70% 58%), hsl(43 96% 56%))'
                          }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
