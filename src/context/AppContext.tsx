import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db } from '@/lib/db';

export type UserRole = 'owner' | 'admin' | 'editor' | 'member' | 'member_plus' | 'member_vip';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  access_token: string;
  created_at: string;
}

export interface Level {
  id: string;
  quest_id: string;
  title: string;
  riddle_type: 'text' | 'image' | 'video' | 'audio';
  riddle_content: string;
  riddle_media_url?: string;
  answer: string;
  hint?: string;
  order_index: number;
}

export interface Quest {
  id: string;
  site_id: string;
  title: string;
  description: string;
  cover_image?: string;
  is_active: boolean;
  order_index: number;
  levels: Level[];
  created_at: string;
}

export interface Site {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  integration_token: string;
  is_active: boolean;
  quests: Quest[];
  created_at: string;
}

export interface QuestAccess {
  user_id: string;
  quest_id: string;
  access_token: string;
  is_active: boolean;
}

export interface UserProgress {
  user_id: string;
  level_id: string;
  quest_id: string;
  completed_at: string;
  used_hint: boolean;
  attempts: number;
}

export interface JoinRequest {
  id: string;
  user_id: string;
  user_name: string;
  site_id: string;
  quest_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  site_id?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  sites: Site[];
  questAccess: QuestAccess[];
  userProgress: UserProgress[];
  joinRequests: JoinRequest[];
  messages: Message[];
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<User | null>;
  register: (name: string, email: string, phone: string, password: string) => Promise<User | null>;
  logout: () => void;
  reload: () => Promise<void>;
  addSite: (data: { name: string; description: string; owner_id: string; is_active: boolean }) => Promise<Site | null>;
  updateSite: (id: string, data: Partial<Site>) => Promise<void>;
  addQuest: (siteId: string, data: Omit<Quest, 'id' | 'levels' | 'created_at'>) => Promise<Quest | null>;
  updateQuest: (questId: string, data: Partial<Quest>) => Promise<void>;
  addLevel: (questId: string, data: Omit<Level, 'id'>) => Promise<Level | null>;
  updateLevel: (levelId: string, data: Partial<Level>) => Promise<void>;
  deleteLevel: (levelId: string) => Promise<void>;
  grantQuestAccess: (userId: string, questId: string) => Promise<void>;
  revokeQuestAccess: (userId: string, questId: string) => Promise<void>;
  completeLevel: (userId: string, levelId: string, questId: string, usedHint: boolean) => Promise<void>;
  addJoinRequest: (userId: string, userName: string, siteId: string, questId?: string) => Promise<void>;
  approveJoinRequest: (requestId: string) => Promise<void>;
  rejectJoinRequest: (requestId: string) => Promise<void>;
  sendMessage: (fromId: string, toId: string, content: string, siteId?: string) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  getUserProgress: (userId: string) => UserProgress[];
  getUserQuestAccess: (userId: string) => QuestAccess[];
  getQuestById: (questId: string) => Quest | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

const SESSION_KEY = 'master_putey_user_id';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [questAccess, setQuestAccess] = useState<QuestAccess[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const rows = await db.query('SELECT * FROM users ORDER BY created_at');
    return rows.map(r => ({ ...r, role: r.role as UserRole })) as User[];
  };

  const loadSites = async () => {
    const siteRows = await db.query('SELECT * FROM sites ORDER BY created_at');
    const questRows = await db.query('SELECT * FROM quests ORDER BY order_index, created_at');
    const levelRows = await db.query('SELECT * FROM levels WHERE is_hidden = false ORDER BY order_index, created_at');
    return siteRows.map(s => ({
      ...s,
      quests: questRows
        .filter(q => q.site_id === s.id)
        .map(q => ({
          ...q,
          levels: levelRows.filter(l => l.quest_id === q.id) as unknown as Level[],
        })) as unknown as Quest[],
    })) as unknown as Site[];
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usrs, sts, qa, up, jr, msgs] = await Promise.all([
        loadUsers(),
        loadSites(),
        db.query('SELECT * FROM quest_access'),
        db.query('SELECT * FROM user_progress'),
        db.query('SELECT u.name as user_name, jr.* FROM join_requests jr LEFT JOIN users u ON jr.user_id = u.id ORDER BY jr.created_at DESC'),
        db.query('SELECT * FROM messages ORDER BY created_at'),
      ]);
      setUsers(usrs);
      setSites(sts);
      setQuestAccess(qa as unknown as QuestAccess[]);
      setUserProgress(up as unknown as UserProgress[]);
      setJoinRequests(jr as unknown as JoinRequest[]);
      setMessages(msgs as unknown as Message[]);

      const savedId = sessionStorage.getItem(SESSION_KEY);
      if (savedId && !currentUser) {
        const u = usrs.find(u => u.id === savedId);
        if (u) setCurrentUser(u);
      }
    } catch (e) {
      console.warn('DB load error', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadAll();
  }, []);

  const login = async (emailOrPhone: string, password: string): Promise<User | null> => {
    const rows = await db.query(
      `SELECT * FROM users WHERE (email = '${emailOrPhone.replace(/'/g, "''")}' OR phone = '${emailOrPhone.replace(/'/g, "''")}') AND access_token = '${password.replace(/'/g, "''")}'`
    );
    if (rows.length > 0) {
      const user = { ...rows[0], role: rows[0].role as UserRole } as User;
      setCurrentUser(user);
      sessionStorage.setItem(SESSION_KEY, user.id);
      return user;
    }
    return null;
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<User | null> => {
    const existing = await db.query(
      `SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}' OR phone = '${phone.replace(/'/g, "''")}'`
    );
    if (existing.length > 0) return null;
    const row = await db.returning(
      `INSERT INTO users (name, email, phone, password_hash, role, access_token) VALUES ('${name.replace(/'/g, "''")}', '${email.replace(/'/g, "''")}', '${phone.replace(/'/g, "''")}', '${password.replace(/'/g, "''")}', 'member', '${password.replace(/'/g, "''")}') RETURNING *`
    );
    if (row) {
      const user = { ...row, role: row.role as UserRole } as User;
      setCurrentUser(user);
      sessionStorage.setItem(SESSION_KEY, user.id);
      setUsers(prev => [...prev, user]);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const reload = loadAll;

  const addSite = async (data: { name: string; description: string; owner_id: string; is_active: boolean }): Promise<Site | null> => {
    const row = await db.returning(
      `INSERT INTO sites (name, description, owner_id, is_active) VALUES ('${data.name.replace(/'/g, "''")}', '${data.description.replace(/'/g, "''")}', '${data.owner_id}', ${data.is_active}) RETURNING *`
    );
    if (row) {
      const site = { ...row, quests: [] } as unknown as Site;
      setSites(prev => [...prev, site]);
      return site;
    }
    return null;
  };

  const updateSite = async (id: string, data: Partial<Site>) => {
    const sets: string[] = [];
    if (data.name !== undefined) sets.push(`name = '${data.name.replace(/'/g, "''")}'`);
    if (data.description !== undefined) sets.push(`description = '${data.description.replace(/'/g, "''")}'`);
    if (data.is_active !== undefined) sets.push(`is_active = ${data.is_active}`);
    if (sets.length === 0) return;
    await db.execute(`UPDATE sites SET ${sets.join(', ')}, updated_at = NOW() WHERE id = '${id}'`);
    setSites(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const addQuest = async (siteId: string, data: Omit<Quest, 'id' | 'levels' | 'created_at'>): Promise<Quest | null> => {
    const row = await db.returning(
      `INSERT INTO quests (site_id, title, description, is_active, order_index) VALUES ('${siteId}', '${data.title.replace(/'/g, "''")}', '${(data.description || '').replace(/'/g, "''")}', ${data.is_active}, ${data.order_index}) RETURNING *`
    );
    if (row) {
      const quest = { ...row, levels: [] } as unknown as Quest;
      setSites(prev => prev.map(s => s.id === siteId ? { ...s, quests: [...s.quests, quest] } : s));
      return quest;
    }
    return null;
  };

  const updateQuest = async (questId: string, data: Partial<Quest>) => {
    const sets: string[] = [];
    if (data.title !== undefined) sets.push(`title = '${data.title.replace(/'/g, "''")}'`);
    if (data.description !== undefined) sets.push(`description = '${data.description.replace(/'/g, "''")}'`);
    if (data.is_active !== undefined) sets.push(`is_active = ${data.is_active}`);
    if (sets.length === 0) return;
    await db.execute(`UPDATE quests SET ${sets.join(', ')}, updated_at = NOW() WHERE id = '${questId}'`);
    setSites(prev => prev.map(s => ({ ...s, quests: s.quests.map(q => q.id === questId ? { ...q, ...data } : q) })));
  };

  const addLevel = async (questId: string, data: Omit<Level, 'id'>): Promise<Level | null> => {
    const row = await db.returning(
      `INSERT INTO levels (quest_id, title, riddle_type, riddle_content, riddle_media_url, answer, hint, order_index) VALUES ('${questId}', '${data.title.replace(/'/g, "''")}', '${data.riddle_type}', '${(data.riddle_content || '').replace(/'/g, "''")}', ${data.riddle_media_url ? `'${data.riddle_media_url.replace(/'/g, "''")}'` : 'NULL'}, '${data.answer.replace(/'/g, "''")}', ${data.hint ? `'${data.hint.replace(/'/g, "''")}'` : 'NULL'}, ${data.order_index}) RETURNING *`
    );
    if (row) {
      const level = row as unknown as Level;
      setSites(prev => prev.map(s => ({ ...s, quests: s.quests.map(q => q.id === questId ? { ...q, levels: [...q.levels, level] } : q) })));
      return level;
    }
    return null;
  };

  const updateLevel = async (levelId: string, data: Partial<Level>) => {
    const sets: string[] = [];
    if (data.title !== undefined) sets.push(`title = '${data.title.replace(/'/g, "''")}'`);
    if (data.riddle_type !== undefined) sets.push(`riddle_type = '${data.riddle_type}'`);
    if (data.riddle_content !== undefined) sets.push(`riddle_content = '${data.riddle_content.replace(/'/g, "''")}'`);
    if (data.riddle_media_url !== undefined) sets.push(`riddle_media_url = ${data.riddle_media_url ? `'${data.riddle_media_url.replace(/'/g, "''")}'` : 'NULL'}`);
    if (data.answer !== undefined) sets.push(`answer = '${data.answer.replace(/'/g, "''")}'`);
    if (data.hint !== undefined) sets.push(`hint = ${data.hint ? `'${data.hint.replace(/'/g, "''")}'` : 'NULL'}`);
    if (sets.length === 0) return;
    await db.execute(`UPDATE levels SET ${sets.join(', ')} WHERE id = '${levelId}'`);
    setSites(prev => prev.map(s => ({ ...s, quests: s.quests.map(q => ({ ...q, levels: q.levels.map(l => l.id === levelId ? { ...l, ...data } : l) })) })));
  };

  const deleteLevel = async (levelId: string) => {
    await db.execute(`UPDATE levels SET is_hidden = true WHERE id = '${levelId}'`);
    setSites(prev => prev.map(s => ({ ...s, quests: s.quests.map(q => ({ ...q, levels: q.levels.filter(l => l.id !== levelId) })) })));
  };

  const grantQuestAccess = async (userId: string, questId: string) => {
    await db.execute(
      `INSERT INTO quest_access (user_id, quest_id, is_active) VALUES ('${userId}', '${questId}', true) ON CONFLICT (user_id, quest_id) DO UPDATE SET is_active = true, granted_at = NOW()`
    );
    setQuestAccess(prev => {
      const existing = prev.find(a => a.user_id === userId && a.quest_id === questId);
      if (existing) return prev.map(a => a.user_id === userId && a.quest_id === questId ? { ...a, is_active: true } : a);
      return [...prev, { user_id: userId, quest_id: questId, access_token: '', is_active: true }];
    });
  };

  const revokeQuestAccess = async (userId: string, questId: string) => {
    await db.execute(`UPDATE quest_access SET is_active = false WHERE user_id = '${userId}' AND quest_id = '${questId}'`);
    setQuestAccess(prev => prev.map(a => a.user_id === userId && a.quest_id === questId ? { ...a, is_active: false } : a));
  };

  const completeLevel = async (userId: string, levelId: string, questId: string, usedHint: boolean) => {
    await db.execute(
      `INSERT INTO user_progress (user_id, level_id, quest_id, used_hint) VALUES ('${userId}', '${levelId}', '${questId}', ${usedHint}) ON CONFLICT (user_id, level_id) DO NOTHING`
    );
    setUserProgress(prev => {
      if (prev.some(p => p.user_id === userId && p.level_id === levelId)) return prev;
      return [...prev, { user_id: userId, level_id: levelId, quest_id: questId, used_hint: usedHint, attempts: 1, completed_at: new Date().toISOString() }];
    });
  };

  const addJoinRequest = async (userId: string, userName: string, siteId: string, questId?: string) => {
    const row = await db.returning(
      `INSERT INTO join_requests (user_id, site_id, quest_id, status) VALUES ('${userId}', '${siteId}', ${questId ? `'${questId}'` : 'NULL'}, 'pending') RETURNING *`
    );
    if (row) {
      setJoinRequests(prev => [...prev, { ...row, user_name: userName } as unknown as JoinRequest]);
    }
  };

  const approveJoinRequest = async (requestId: string) => {
    await db.execute(`UPDATE join_requests SET status = 'approved' WHERE id = '${requestId}'`);
    const req = joinRequests.find(r => r.id === requestId);
    if (req?.quest_id) await grantQuestAccess(req.user_id, req.quest_id);
    setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' as const } : r));
  };

  const rejectJoinRequest = async (requestId: string) => {
    await db.execute(`UPDATE join_requests SET status = 'rejected' WHERE id = '${requestId}'`);
    setJoinRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' as const } : r));
  };

  const sendMessage = async (fromId: string, toId: string, content: string, siteId?: string) => {
    const row = await db.returning(
      `INSERT INTO messages (from_user_id, to_user_id, site_id, content) VALUES ('${fromId}', '${toId}', ${siteId ? `'${siteId}'` : 'NULL'}, '${content.replace(/'/g, "''")}') RETURNING *`
    );
    if (row) setMessages(prev => [...prev, row as unknown as Message]);
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const sets: string[] = [];
    if (data.name !== undefined) sets.push(`name = '${data.name.replace(/'/g, "''")}'`);
    if (data.email !== undefined) sets.push(`email = '${data.email.replace(/'/g, "''")}'`);
    if (data.phone !== undefined) sets.push(`phone = '${data.phone.replace(/'/g, "''")}'`);
    if (data.role !== undefined) sets.push(`role = '${data.role}'`);
    if (data.access_token !== undefined) sets.push(`access_token = '${data.access_token.replace(/'/g, "''")}', password_hash = '${data.access_token.replace(/'/g, "''")}'`);
    if (sets.length === 0) return;
    await db.execute(`UPDATE users SET ${sets.join(', ')}, updated_at = NOW() WHERE id = '${id}'`);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (currentUser?.id === id) setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
  };

  const getUserProgress = (userId: string) => userProgress.filter(p => p.user_id === userId);
  const getUserQuestAccess = (userId: string) => questAccess.filter(a => a.user_id === userId && a.is_active);
  const getQuestById = (questId: string) => sites.flatMap(s => s.quests).find(q => q.id === questId);

  return (
    <AppContext.Provider value={{
      currentUser, users, sites, questAccess, userProgress, joinRequests, messages, loading,
      login, register, logout, reload,
      addSite, updateSite,
      addQuest, updateQuest,
      addLevel, updateLevel, deleteLevel,
      grantQuestAccess, revokeQuestAccess,
      completeLevel,
      addJoinRequest, approveJoinRequest, rejectJoinRequest,
      sendMessage,
      updateUser,
      getUserProgress, getUserQuestAccess, getQuestById,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};