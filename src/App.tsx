import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppProvider, useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import SitesPage from '@/pages/SitesPage';
import QuestsPage from '@/pages/QuestsPage';
import MembersPage from '@/pages/MembersPage';
import AchievementsPage from '@/pages/AchievementsPage';
import ProfilePage from '@/pages/ProfilePage';
import MessagesPage from '@/pages/MessagesPage';
import MyQuestsPage from '@/pages/MyQuestsPage';

function AppInner() {
  const { currentUser } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page: string) => setCurrentPage(page);
  const handleAuth = () => setCurrentPage('dashboard');

  if (!currentUser) {
    return <AuthPage onAuth={handleAuth} />;
  }

  const isAdmin = currentUser.role === 'owner' || currentUser.role === 'admin' || currentUser.role === 'editor';

  const renderPage = () => {
    if (currentPage.startsWith('quest:')) {
      return <MyQuestsPage onNavigate={handleNavigate} />;
    }
    switch (currentPage) {
      case 'dashboard': return isAdmin ? <DashboardPage onNavigate={handleNavigate} /> : <MyQuestsPage onNavigate={handleNavigate} />;
      case 'sites': return isAdmin ? <SitesPage /> : <MyQuestsPage onNavigate={handleNavigate} />;
      case 'quests': return isAdmin ? <QuestsPage /> : <MyQuestsPage onNavigate={handleNavigate} />;
      case 'members': return isAdmin ? <MembersPage /> : <ProfilePage onNavigate={handleNavigate} />;
      case 'achievements': return <AchievementsPage />;
      case 'messages': return <MessagesPage />;
      case 'profile': return <ProfilePage onNavigate={handleNavigate} />;
      case 'my-quests': return <MyQuestsPage onNavigate={handleNavigate} />;
      default: return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
}

const App = () => (
  <AppProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppInner />
    </TooltipProvider>
  </AppProvider>
);

export default App;
