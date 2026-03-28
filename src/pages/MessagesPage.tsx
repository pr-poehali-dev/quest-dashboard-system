import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

export default function MessagesPage() {
  const { currentUser, messages, users, sendMessage } = useApp();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [text, setText] = useState('');

  if (!currentUser) return null;

  const myMessages = messages.filter(
    m => m.from_user_id === currentUser.id || m.to_user_id === currentUser.id
  );

  const conversationPartners = [...new Set(myMessages.map(m =>
    m.from_user_id === currentUser.id ? m.to_user_id : m.from_user_id
  ))];

  const getUser = (id: string) => users.find(u => u.id === id);

  const selectedConversation = selectedUserId
    ? myMessages.filter(m =>
        (m.from_user_id === currentUser.id && m.to_user_id === selectedUserId) ||
        (m.from_user_id === selectedUserId && m.to_user_id === currentUser.id)
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  const handleSend = () => {
    if (!text.trim() || !selectedUserId) return;
    sendMessage(currentUser.id, selectedUserId, text);
    setText('');
  };

  const getUnread = (partnerId: string) =>
    myMessages.filter(m => m.from_user_id === partnerId && m.to_user_id === currentUser.id && !m.is_read).length;

  const admins = users.filter(u => u.role === 'owner' || u.role === 'admin');
  const allPartners = [...new Set([...conversationPartners, ...admins.map(a => a.id)])].filter(id => id !== currentUser.id);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-montserrat text-2xl font-black text-white">Сообщения</h1>
        <div className="separator-glow mt-2" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[60vh]">
        {/* Contacts */}
        <div className="card-glow rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-white text-sm">Контакты</h3>
          </div>
          <div className="flex-1 overflow-y-auto scroll-custom">
            {allPartners.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Нет диалогов</div>
            ) : (
              allPartners.map(partnerId => {
                const partner = getUser(partnerId);
                if (!partner) return null;
                const unread = getUnread(partnerId);
                const lastMsg = myMessages
                  .filter(m => (m.from_user_id === partnerId || m.to_user_id === partnerId))
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                return (
                  <button key={partnerId} onClick={() => setSelectedUserId(partnerId)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 text-left ${selectedUserId === partnerId ? 'bg-secondary/50' : ''}`}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, hsl(263 70% 55%), hsl(213 90% 45%))' }}>
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{partner.name}</div>
                      {lastMsg && <div className="text-xs text-muted-foreground truncate">{lastMsg.content}</div>}
                    </div>
                    {unread > 0 && (
                      <span className="bg-violet-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 card-glow rounded-xl overflow-hidden flex flex-col">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Выберите диалог</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, hsl(263 70% 55%), hsl(213 90% 45%))' }}>
                  {getUser(selectedUserId)?.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{getUser(selectedUserId)?.name}</div>
                  <div className="text-xs text-muted-foreground">{getUser(selectedUserId)?.role}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scroll-custom p-4 space-y-3">
                {selectedConversation.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">Нет сообщений</div>
                ) : (
                  selectedConversation.map(msg => {
                    const isMe = msg.from_user_id === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMe
                            ? 'bg-violet-600 text-white rounded-br-sm'
                            : 'bg-secondary text-white rounded-bl-sm'
                        }`}>
                          <div>{msg.content}</div>
                          <div className={`text-[10px] mt-1 ${isMe ? 'text-violet-200' : 'text-muted-foreground'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-border flex gap-3">
                <input value={text} onChange={e => setText(e.target.value)}
                  placeholder="Написать сообщение..."
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-2.5 bg-secondary rounded-xl text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
                <button onClick={handleSend} className="btn-gold w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Send" size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
