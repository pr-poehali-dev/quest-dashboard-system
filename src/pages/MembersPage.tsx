import { useState } from 'react';
import { useApp, User, UserRole } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

const ROLES: UserRole[] = ['owner', 'admin', 'editor', 'member', 'member_plus', 'member_vip'];
const roleLabels: Record<UserRole, string> = {
  owner: 'Владелец', admin: 'Администратор', editor: 'Редактор',
  member: 'Участник', member_plus: 'Участник+', member_vip: 'Участник VIP',
};
const roleBadge: Record<string, string> = {
  owner: 'badge-role-owner', admin: 'badge-role-admin', editor: 'badge-role-editor',
  member: 'badge-role-member', member_plus: 'badge-role-member', member_vip: 'badge-role-owner',
};

export default function MembersPage() {
  const { users, sites, updateUser, grantQuestAccess, revokeQuestAccess, questAccess, sendMessage, currentUser } = useApp();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [showInvite, setShowInvite] = useState<'telegram' | 'vk' | 'sms' | null>(null);
  const [inviteContact, setInviteContact] = useState('');
  const [showAccessModal, setShowAccessModal] = useState<User | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('member');
  const [editPassword, setEditPassword] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [search, setSearch] = useState('');

  const allQuests = sites.flatMap(s => s.quests);

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setEditPassword('');
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    const updates: Partial<User> = { name: editName, email: editEmail, phone: editPhone, role: editRole };
    if (editPassword) updates.access_token = editPassword;
    updateUser(editUser.id, updates);
    setEditUser(null);
  };

  const handleSendInvite = () => {
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setShowInvite(null); setInviteContact(''); }, 2000);
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !showMessageModal || !currentUser) return;
    sendMessage(currentUser.id, showMessageModal.id, messageText);
    setMessageText('');
    setShowMessageModal(null);
  };

  const getUserAccess = (userId: string) => questAccess.filter(a => a.user_id === userId && a.is_active).map(a => a.quest_id);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const inviteLink = `${window.location.origin}?join=true`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat text-2xl font-black text-white">Управление участниками</h1>
          <div className="separator-glow mt-2" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInvite('telegram')} className="btn-gold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <span>✈</span> Telegram
          </button>
          <button onClick={() => setShowInvite('vk')} className="btn-violet px-3 py-2 rounded-xl text-xs flex items-center gap-1.5">
            <span>ВК</span>
          </button>
          <button onClick={() => setShowInvite('sms')} className="px-3 py-2 rounded-xl text-xs border border-border text-muted-foreground hover:text-white hover:border-violet-500/50 transition-all flex items-center gap-1.5">
            <Icon name="Smartphone" size={12} />
            SMS
          </button>
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-montserrat font-bold text-white">
                {showInvite === 'telegram' ? '✈ Пригласить через Telegram' : showInvite === 'vk' ? 'ВКонтакте' : '📱 Пригласить по SMS'}
              </h2>
              <button onClick={() => { setShowInvite(null); setInviteContact(''); }} className="text-muted-foreground hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  {showInvite === 'telegram' ? 'Username в Telegram (@username)' : showInvite === 'vk' ? 'Ссылка ВКонтакте' : 'Номер телефона'}
                </label>
                <input value={inviteContact} onChange={e => setInviteContact(e.target.value)}
                  placeholder={showInvite === 'telegram' ? '@username' : showInvite === 'vk' ? 'https://vk.com/user' : '+7 999 000 00 00'}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 border border-violet-500/20">
                <div className="text-xs text-muted-foreground mb-1">Ссылка приглашения:</div>
                <a href={inviteLink} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:text-violet-300 underline break-all">
                  {inviteLink}
                </a>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowInvite(null); setInviteContact(''); }}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                Отмена
              </button>
              <button onClick={handleSendInvite}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${inviteSent ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'btn-gold'}`}>
                {inviteSent ? '✓ Отправлено!' : 'Отправить ссылку'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <h2 className="font-montserrat font-bold text-white text-lg mb-5">Редактировать участника</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Имя</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Телефон</label>
                <input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Роль</label>
                <select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none">
                  {ROLES.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Новый пароль (оставьте пустым чтобы не менять)</label>
                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                Отмена
              </button>
              <button onClick={handleSaveEdit} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-montserrat font-bold text-white text-lg">Доступ к путям — {showAccessModal.name}</h2>
              <button onClick={() => setShowAccessModal(null)} className="text-muted-foreground hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>
            {allQuests.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">Нет доступных путей</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto scroll-custom">
                {allQuests.map(quest => {
                  const hasAccess = getUserAccess(showAccessModal.id).includes(quest.id);
                  return (
                    <div key={quest.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <span className="text-sm text-white">{quest.title}</span>
                      <button
                        onClick={() => hasAccess ? revokeQuestAccess(showAccessModal.id, quest.id) : grantQuestAccess(showAccessModal.id, quest.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${hasAccess ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' : 'btn-gold'}`}>
                        {hasAccess ? '× Закрыть' : '✓ Открыть'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => setShowAccessModal(null)} className="w-full mt-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Message modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-montserrat font-bold text-white">Сообщение — {showMessageModal.name}</h2>
              <button onClick={() => setShowMessageModal(null)} className="text-muted-foreground hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>
            <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={4} placeholder="Текст сообщения..."
              className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowMessageModal(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                Отмена
              </button>
              <button onClick={handleSendMessage} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск участников..."
          className="w-full pl-9 pr-4 py-2.5 bg-card rounded-xl text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
      </div>

      {/* Users table */}
      <div className="card-glow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Участник</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Контакт</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Роль</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Доступ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map(user => {
                const accessCount = getUserAccess(user.id).length;
                return (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, hsl(263 70% 55%), hsl(213 90% 45%))' }}>
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      <div className="text-xs text-muted-foreground">{user.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${roleBadge[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <button onClick={() => setShowAccessModal(user)}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                        {accessCount} путей →
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleOpenEdit(user)} title="Редактировать"
                          className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-violet-500/50 flex items-center justify-center transition-all">
                          <Icon name="Pencil" size={13} />
                        </button>
                        <button onClick={() => setShowAccessModal(user)} title="Доступ к путям"
                          className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-yellow-400 hover:border-yellow-500/50 flex items-center justify-center transition-all">
                          <Icon name="Key" size={13} />
                        </button>
                        <button onClick={() => setShowMessageModal(user)} title="Отправить сообщение"
                          className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-violet-400 hover:border-violet-500/50 flex items-center justify-center transition-all">
                          <Icon name="MessageSquare" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
