import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

const roleLabels: Record<string, string> = {
  owner: 'Владелец', admin: 'Администратор', editor: 'Редактор',
  member: 'Участник', member_plus: 'Участник+', member_vip: 'Участник VIP',
};
const roleBadge: Record<string, string> = {
  owner: 'badge-role-owner', admin: 'badge-role-admin', editor: 'badge-role-editor',
  member: 'badge-role-member', member_plus: 'badge-role-member', member_vip: 'badge-role-owner',
};

interface Props { onNavigate: (page: string) => void; }

export default function ProfilePage({ onNavigate }: Props) {
  const { currentUser, updateUser, getUserQuestAccess, getUserProgress, sites, sendMessage, users } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [saved, setSaved] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [smsConfirm, setSmsConfirm] = useState(false);

  if (!currentUser) return null;

  const myAccess = getUserQuestAccess(currentUser.id);
  const myProgress = getUserProgress(currentUser.id);
  const allQuests = sites.flatMap(s => s.quests);
  const accessibleQuests = allQuests.filter(q => myAccess.some(a => a.quest_id === q.id));
  const completedLevels = myProgress.length;
  const hintsUsed = myProgress.filter(p => p.used_hint).length;
  const myScore = Math.max(0, completedLevels * 100 - hintsUsed * 20);

  const owner = users.find(u => u.role === 'owner');

  const handleSave = () => {
    if (newPassword && newPassword !== confirmPassword) return;
    if (newPassword && !smsConfirm) { setSmsConfirm(true); return; }
    const updates: Record<string, string> = { name, email, phone };
    if (newPassword) updates.access_token = newPassword;
    updateUser(currentUser.id, updates);
    setSaved(true);
    setEditMode(false);
    setSmsConfirm(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !owner) return;
    sendMessage(currentUser.id, owner.id, messageText);
    setMsgSent(true);
    setMessageText('');
    setTimeout(() => { setMsgSent(false); setShowMessage(false); }, 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-montserrat text-2xl font-black text-white">Личный кабинет</h1>
        <div className="separator-glow mt-2" />
      </div>

      {/* Profile card */}
      <div className="card-glow rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
              style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(213 90% 42%))' }}>
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-montserrat font-black text-xl text-white">{currentUser.name}</h2>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge[currentUser.role]}`}>
                {roleLabels[currentUser.role]}
              </span>
              <div className="text-xs text-muted-foreground mt-1">Участник с {new Date(currentUser.created_at).toLocaleDateString('ru')}</div>
            </div>
          </div>
          <div className="flex gap-2">
            {!editMode && (
              <button onClick={() => { setEditMode(true); setName(currentUser.name); setEmail(currentUser.email); setPhone(currentUser.phone); }}
                className="btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                <Icon name="Pencil" size={14} />
                Редактировать
              </button>
            )}
          </div>
        </div>

        {saved && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/15 border border-green-500/30 text-green-300 text-sm flex items-center gap-2">
            <Icon name="CheckCircle" size={16} /> Данные сохранены
          </div>
        )}

        {editMode ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Имя</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Телефон</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Текущий пароль</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Для подтверждения"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Новый пароль</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Оставьте пустым если не менять"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Подтвердите пароль</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Повторите новый пароль"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
            </div>
            {smsConfirm && (
              <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-lg text-sm text-blue-300">
                📱 SMS с кодом подтверждения отправлено на {currentUser.phone} (демо режим)
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={() => { setEditMode(false); setSmsConfirm(false); }}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                Отмена
              </button>
              <button onClick={handleSave} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
                {smsConfirm ? 'Подтвердить изменение' : 'Сохранить'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Email: </span><span className="text-white">{currentUser.email}</span></div>
            <div><span className="text-muted-foreground">Телефон: </span><span className="text-white">{currentUser.phone}</span></div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-glow rounded-xl p-4 text-center">
          <div className="text-2xl font-black font-montserrat mystical-text">{myScore}</div>
          <div className="text-xs text-muted-foreground mt-1">Очков</div>
        </div>
        <div className="card-glow rounded-xl p-4 text-center">
          <div className="text-2xl font-black font-montserrat text-white">{completedLevels}</div>
          <div className="text-xs text-muted-foreground mt-1">Уровней пройдено</div>
        </div>
        <div className="card-glow rounded-xl p-4 text-center">
          <div className="text-2xl font-black font-montserrat text-yellow-400">{hintsUsed}</div>
          <div className="text-xs text-muted-foreground mt-1">Подсказок</div>
        </div>
      </div>

      {/* My Quests */}
      <div className="card-glow rounded-xl p-5">
        <h2 className="font-montserrat font-bold text-white mb-4 flex items-center gap-2">
          <Icon name="Map" size={18} className="text-violet-400" />
          Мои Пути
        </h2>
        {accessibleQuests.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="Lock" size={32} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">У вас нет доступных путей</p>
            <button onClick={() => onNavigate('my-quests')}
              className="btn-violet px-4 py-2 rounded-xl text-sm">
              Запросить доступ
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {accessibleQuests.map(quest => {
              const questLevelsCompleted = myProgress.filter(p => p.quest_id === quest.id).length;
              const totalLevels = quest.levels.length;
              const pct = totalLevels > 0 ? Math.round((questLevelsCompleted / totalLevels) * 100) : 0;
              return (
                <div key={quest.id} className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-white">{quest.title}</div>
                      <div className="text-xs text-muted-foreground">{questLevelsCompleted}/{totalLevels} уровней</div>
                    </div>
                    <button
                      onClick={() => onNavigate(`quest:${quest.id}`)}
                      className="portal-open-btn btn-gold px-4 py-2 rounded-xl text-sm font-bold">
                      Начать Путь ✦
                    </button>
                  </div>
                  <div className="h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, hsl(263 70% 58%), hsl(43 96% 56%))'
                      }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Оплата */}
        <a href="https://yoomoney.ru/to/410017253212598/0" target="_blank" rel="noreferrer"
          className="card-glow rounded-xl p-5 text-center hover:border-yellow-500/40 transition-all group block">
          <Icon name="CreditCard" size={28} className="mx-auto text-yellow-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-montserrat font-bold text-white">Оплата</div>
          <div className="text-xs text-muted-foreground mt-1">ЮMoney — нажмите для оплаты</div>
        </a>

        {/* Сообщить */}
        <button onClick={() => setShowMessage(true)}
          className="card-glow rounded-xl p-5 text-center hover:border-violet-500/40 transition-all group w-full">
          <Icon name="MessageSquare" size={28} className="mx-auto text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="font-montserrat font-bold text-white">Сообщить</div>
          <div className="text-xs text-muted-foreground mt-1">Написать администратору</div>
        </button>
      </div>

      {/* Message modal */}
      {showMessage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-montserrat font-bold text-white">Сообщение администратору</h2>
              <button onClick={() => setShowMessage(false)} className="text-muted-foreground hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>
            {msgSent ? (
              <div className="py-6 text-center text-green-400">
                <Icon name="CheckCircle" size={32} className="mx-auto mb-2" />
                Сообщение отправлено!
              </div>
            ) : (
              <>
                <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={4}
                  placeholder="Опишите вопрос или проблему..."
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all resize-none" />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowMessage(false)}
                    className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                    Отмена
                  </button>
                  <button onClick={handleSendMessage} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
                    Отправить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
