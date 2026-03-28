import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface AppState {
  currentUser: User | null;
  users: User[];
  sites: Site[];
  questAccess: QuestAccess[];
  userProgress: UserProgress[];
  joinRequests: JoinRequest[];
  messages: Message[];
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User | null) => void;
  login: (emailOrPhone: string, password: string) => User | null;
  register: (name: string, email: string, phone: string, password: string) => User | null;
  logout: () => void;
  addSite: (site: Omit<Site, 'id' | 'integration_token' | 'quests' | 'created_at'>) => Site;
  updateSite: (id: string, data: Partial<Site>) => void;
  addQuest: (siteId: string, quest: Omit<Quest, 'id' | 'levels' | 'created_at'>) => Quest;
  updateQuest: (questId: string, data: Partial<Quest>) => void;
  addLevel: (questId: string, level: Omit<Level, 'id'>) => Level;
  updateLevel: (levelId: string, data: Partial<Level>) => void;
  deleteLevel: (levelId: string) => void;
  grantQuestAccess: (userId: string, questId: string) => void;
  revokeQuestAccess: (userId: string, questId: string) => void;
  completeLevel: (userId: string, levelId: string, questId: string, usedHint: boolean) => void;
  addJoinRequest: (userId: string, userName: string, siteId: string, questId?: string) => void;
  approveJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  sendMessage: (fromId: string, toId: string, content: string, siteId?: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  getUserProgress: (userId: string) => UserProgress[];
  getUserQuestAccess: (userId: string) => QuestAccess[];
  getLevelById: (levelId: string) => Level | undefined;
  getQuestById: (questId: string) => Quest | undefined;
}

const STORAGE_KEY = 'questmaster_data';

const genId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
const genToken = () => Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);

const defaultOwner: User = {
  id: 'owner_1',
  name: 'Владелец Платформы',
  email: 'owner@questmaster.ru',
  phone: '+70000000000',
  role: 'owner',
  access_token: genToken(),
  created_at: new Date().toISOString(),
};

const demoSite: Site = {
  id: 'site_demo',
  name: 'Главный Портал',
  description: 'Основная платформа квестов',
  owner_id: 'owner_1',
  integration_token: 'INTEGRATION_TOKEN_DEMO_12345',
  is_active: true,
  created_at: new Date().toISOString(),
  quests: [
    {
      id: 'quest_1',
      site_id: 'site_demo',
      title: 'Путь Искателя',
      description: 'Первый квест для начинающих путников. Раскройте тайны древнего замка.',
      is_active: true,
      order_index: 0,
      created_at: new Date().toISOString(),
      levels: [
        {
          id: 'level_1',
          quest_id: 'quest_1',
          title: 'Врата Начала',
          riddle_type: 'text',
          riddle_content: 'Я есть у каждого, но нельзя потрогать. Меня можно потерять, но нельзя найти на земле. Что это?',
          answer: 'имя',
          hint: 'Родители дают это при рождении',
          order_index: 0,
        },
        {
          id: 'level_2',
          quest_id: 'quest_1',
          title: 'Тёмный коридор',
          riddle_type: 'text',
          riddle_content: 'Чем больше берёшь — тем больше становится. Что это?',
          answer: 'яма',
          hint: 'Подумай о земле',
          order_index: 1,
        }
      ]
    }
  ]
};

const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.users || parsed.users.length === 0) {
        parsed.users = [defaultOwner];
      }
      if (!parsed.sites || parsed.sites.length === 0) {
        parsed.sites = [demoSite];
      }
      return parsed;
    }
  } catch (e) {
    console.warn('State load error', e);
  }
  return {
    currentUser: null,
    users: [defaultOwner],
    sites: [demoSite],
    questAccess: [],
    userProgress: [],
    joinRequests: [],
    messages: [],
  };
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    const { currentUser, ...toSave } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...toSave, currentUser }));
  }, [state]);

  const setCurrentUser = (user: User | null) => setState(s => ({ ...s, currentUser: user }));

  const login = (emailOrPhone: string, password: string): User | null => {
    const user = state.users.find(u =>
      (u.email === emailOrPhone || u.phone === emailOrPhone) && u.access_token === password
        ? false
        : (u.email === emailOrPhone || u.phone === emailOrPhone)
    );
    if (user) {
      setState(s => ({ ...s, currentUser: user }));
      return user;
    }
    return null;
  };

  const register = (name: string, email: string, phone: string, password: string): User | null => {
    const exists = state.users.find(u => u.email === email || u.phone === phone);
    if (exists) return null;
    const newUser: User = {
      id: genId(),
      name,
      email,
      phone,
      role: 'member',
      access_token: genToken(),
      created_at: new Date().toISOString(),
    };
    setState(s => ({ ...s, users: [...s.users, newUser], currentUser: newUser }));
    return newUser;
  };

  const logout = () => setState(s => ({ ...s, currentUser: null }));

  const addSite = (data: Omit<Site, 'id' | 'integration_token' | 'quests' | 'created_at'>): Site => {
    const site: Site = {
      ...data,
      id: genId(),
      integration_token: genToken(),
      quests: [],
      created_at: new Date().toISOString(),
    };
    setState(s => ({ ...s, sites: [...s.sites, site] }));
    return site;
  };

  const updateSite = (id: string, data: Partial<Site>) => {
    setState(s => ({
      ...s,
      sites: s.sites.map(site => site.id === id ? { ...site, ...data } : site)
    }));
  };

  const addQuest = (siteId: string, data: Omit<Quest, 'id' | 'levels' | 'created_at'>): Quest => {
    const quest: Quest = {
      ...data,
      id: genId(),
      levels: [],
      created_at: new Date().toISOString(),
    };
    setState(s => ({
      ...s,
      sites: s.sites.map(site =>
        site.id === siteId
          ? { ...site, quests: [...site.quests, quest] }
          : site
      )
    }));
    return quest;
  };

  const updateQuest = (questId: string, data: Partial<Quest>) => {
    setState(s => ({
      ...s,
      sites: s.sites.map(site => ({
        ...site,
        quests: site.quests.map(q => q.id === questId ? { ...q, ...data } : q)
      }))
    }));
  };

  const addLevel = (questId: string, data: Omit<Level, 'id'>): Level => {
    const level: Level = { ...data, id: genId() };
    setState(s => ({
      ...s,
      sites: s.sites.map(site => ({
        ...site,
        quests: site.quests.map(q =>
          q.id === questId ? { ...q, levels: [...q.levels, level] } : q
        )
      }))
    }));
    return level;
  };

  const updateLevel = (levelId: string, data: Partial<Level>) => {
    setState(s => ({
      ...s,
      sites: s.sites.map(site => ({
        ...site,
        quests: site.quests.map(q => ({
          ...q,
          levels: q.levels.map(l => l.id === levelId ? { ...l, ...data } : l)
        }))
      }))
    }));
  };

  const deleteLevel = (levelId: string) => {
    setState(s => ({
      ...s,
      sites: s.sites.map(site => ({
        ...site,
        quests: site.quests.map(q => ({
          ...q,
          levels: q.levels.filter(l => l.id !== levelId)
        }))
      }))
    }));
  };

  const grantQuestAccess = (userId: string, questId: string) => {
    const existing = state.questAccess.find(a => a.user_id === userId && a.quest_id === questId);
    if (existing) {
      setState(s => ({
        ...s,
        questAccess: s.questAccess.map(a =>
          a.user_id === userId && a.quest_id === questId ? { ...a, is_active: true } : a
        )
      }));
    } else {
      setState(s => ({
        ...s,
        questAccess: [...s.questAccess, {
          user_id: userId,
          quest_id: questId,
          access_token: genToken(),
          is_active: true,
        }]
      }));
    }
  };

  const revokeQuestAccess = (userId: string, questId: string) => {
    setState(s => ({
      ...s,
      questAccess: s.questAccess.map(a =>
        a.user_id === userId && a.quest_id === questId ? { ...a, is_active: false } : a
      )
    }));
  };

  const completeLevel = (userId: string, levelId: string, questId: string, usedHint: boolean) => {
    const existing = state.userProgress.find(p => p.user_id === userId && p.level_id === levelId);
    if (!existing) {
      setState(s => ({
        ...s,
        userProgress: [...s.userProgress, {
          user_id: userId,
          level_id: levelId,
          quest_id: questId,
          completed_at: new Date().toISOString(),
          used_hint: usedHint,
          attempts: 1,
        }]
      }));
    }
  };

  const addJoinRequest = (userId: string, userName: string, siteId: string, questId?: string) => {
    const req: JoinRequest = {
      id: genId(),
      user_id: userId,
      user_name: userName,
      site_id: siteId,
      quest_id: questId,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setState(s => ({ ...s, joinRequests: [...s.joinRequests, req] }));
  };

  const approveJoinRequest = (requestId: string) => {
    const req = state.joinRequests.find(r => r.id === requestId);
    if (req && req.quest_id) {
      grantQuestAccess(req.user_id, req.quest_id);
    }
    setState(s => ({
      ...s,
      joinRequests: s.joinRequests.map(r => r.id === requestId ? { ...r, status: 'approved' } : r)
    }));
  };

  const rejectJoinRequest = (requestId: string) => {
    setState(s => ({
      ...s,
      joinRequests: s.joinRequests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r)
    }));
  };

  const sendMessage = (fromId: string, toId: string, content: string, siteId?: string) => {
    const msg: Message = {
      id: genId(),
      from_user_id: fromId,
      to_user_id: toId,
      site_id: siteId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setState(s => ({ ...s, messages: [...s.messages, msg] }));
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === id ? { ...u, ...data } : u),
      currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...data } : s.currentUser,
    }));
  };

  const getUserProgress = (userId: string) => state.userProgress.filter(p => p.user_id === userId);

  const getUserQuestAccess = (userId: string) => state.questAccess.filter(a => a.user_id === userId && a.is_active);

  const getLevelById = (levelId: string): Level | undefined => {
    for (const site of state.sites) {
      for (const quest of site.quests) {
        const level = quest.levels.find(l => l.id === levelId);
        if (level) return level;
      }
    }
    return undefined;
  };

  const getQuestById = (questId: string): Quest | undefined => {
    for (const site of state.sites) {
      const quest = site.quests.find(q => q.id === questId);
      if (quest) return quest;
    }
    return undefined;
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setCurrentUser,
      login,
      register,
      logout,
      addSite,
      updateSite,
      addQuest,
      updateQuest,
      addLevel,
      updateLevel,
      deleteLevel,
      grantQuestAccess,
      revokeQuestAccess,
      completeLevel,
      addJoinRequest,
      approveJoinRequest,
      rejectJoinRequest,
      sendMessage,
      updateUser,
      getUserProgress,
      getUserQuestAccess,
      getLevelById,
      getQuestById,
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