import { useState } from 'react';
import { useApp, Quest, Level } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

export default function QuestsPage() {
  const { sites, currentUser, addQuest, updateQuest, addLevel, updateLevel, deleteLevel } = useApp();
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showAddQuest, setShowAddQuest] = useState(false);
  const [showAddLevel, setShowAddLevel] = useState(false);
  const [editLevel, setEditLevel] = useState<Level | null>(null);
  const [editQuestData, setEditQuestData] = useState<Quest | null>(null);

  const [questTitle, setQuestTitle] = useState('');
  const [questDesc, setQuestDesc] = useState('');

  const [levelTitle, setLevelTitle] = useState('');
  const [riddleType, setRiddleType] = useState<Level['riddle_type']>('text');
  const [riddleContent, setRiddleContent] = useState('');
  const [riddleMediaUrl, setRiddleMediaUrl] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  const resetLevelForm = () => {
    setLevelTitle(''); setRiddleType('text'); setRiddleContent('');
    setRiddleMediaUrl(''); setAnswer(''); setHint('');
    setEditLevel(null);
  };

  const handleAddQuest = () => {
    if (!questTitle.trim() || !selectedSiteId) return;
    const quest = addQuest(selectedSiteId, {
      title: questTitle, description: questDesc,
      site_id: selectedSiteId, is_active: true, order_index: 0,
    });
    setSelectedQuest(quest);
    setQuestTitle(''); setQuestDesc(''); setShowAddQuest(false);
  };

  const handleSaveEditQuest = () => {
    if (!editQuestData || !questTitle.trim()) return;
    updateQuest(editQuestData.id, { title: questTitle, description: questDesc });
    setEditQuestData(null); setQuestTitle(''); setQuestDesc('');
  };

  const handleSaveLevel = () => {
    if (!levelTitle.trim() || !answer.trim()) return;
    const data = { quest_id: selectedQuest!.id, title: levelTitle, riddle_type: riddleType, riddle_content: riddleContent, riddle_media_url: riddleMediaUrl, answer: answer.toLowerCase().trim(), hint, order_index: (selectedQuest?.levels.length || 0) };
    if (editLevel) {
      updateLevel(editLevel.id, data);
    } else {
      addLevel(selectedQuest!.id, data);
    }
    resetLevelForm();
    setShowAddLevel(false);
    const updatedSite = sites.find(s => s.quests.some(q => q.id === selectedQuest?.id));
    const updatedQuest = updatedSite?.quests.find(q => q.id === selectedQuest?.id);
    if (updatedQuest) setSelectedQuest({ ...updatedQuest });
  };

  const handleEditLevel = (level: Level) => {
    setEditLevel(level);
    setLevelTitle(level.title);
    setRiddleType(level.riddle_type);
    setRiddleContent(level.riddle_content);
    setRiddleMediaUrl(level.riddle_media_url || '');
    setAnswer(level.answer);
    setHint(level.hint || '');
    setShowAddLevel(true);
  };

  const currentSiteQuests = selectedSite?.quests || [];
  const currentLevels = selectedQuest?.levels || sites.flatMap(s => s.quests).find(q => q.id === selectedQuest?.id)?.levels || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-montserrat text-2xl font-black text-white">Редактор путей</h1>
        <div className="separator-glow mt-2" />
      </div>

      {/* Level form modal */}
      {showAddLevel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-lg fade-in max-h-[90vh] overflow-y-auto scroll-custom">
            <h2 className="font-montserrat font-bold text-white text-lg mb-5">
              {editLevel ? 'Редактировать уровень' : 'Новый уровень'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название уровня</label>
                <input value={levelTitle} onChange={e => setLevelTitle(e.target.value)} placeholder="Врата замка"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Тип загадки</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['text', 'image', 'video', 'audio'] as const).map(t => (
                    <button key={t} onClick={() => setRiddleType(t)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-all ${riddleType === t ? 'btn-gold border-transparent' : 'border-border text-muted-foreground hover:text-white hover:border-violet-500/50'}`}>
                      {t === 'text' ? '📝 Текст' : t === 'image' ? '🖼 Фото' : t === 'video' ? '🎬 Видео' : '🎵 Аудио'}
                    </button>
                  ))}
                </div>
              </div>
              {riddleType === 'text' ? (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Загадка (текст)</label>
                  <textarea value={riddleContent} onChange={e => setRiddleContent(e.target.value)} rows={3}
                    placeholder="Введите текст загадки..."
                    className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all resize-none" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    {riddleType === 'image' ? 'URL изображения' : riddleType === 'video' ? 'URL видео' : 'URL аудио'}
                  </label>
                  <input value={riddleMediaUrl} onChange={e => setRiddleMediaUrl(e.target.value)}
                    placeholder={`https://...`}
                    className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Дополнительный текст (необязательно)</label>
                    <textarea value={riddleContent} onChange={e => setRiddleContent(e.target.value)} rows={2}
                      placeholder="Описание или вопрос к медиа..."
                      className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all resize-none" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Правильный ответ (одно слово)</label>
                <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Введите ответ..."
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Подсказка (необязательно)</label>
                <input value={hint} onChange={e => setHint(e.target.value)} placeholder="Подсказка снижает результат..."
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddLevel(false); resetLevelForm(); }}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                Отмена
              </button>
              <button onClick={handleSaveLevel} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
                {editLevel ? 'Сохранить' : 'Добавить уровень'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest edit modal */}
      {(showAddQuest || editQuestData) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <h2 className="font-montserrat font-bold text-white text-lg mb-5">
              {editQuestData ? 'Редактировать Путь' : 'Новый Путь'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название пути</label>
                <input value={questTitle} onChange={e => setQuestTitle(e.target.value)} placeholder="Путь Искателя"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Описание</label>
                <textarea value={questDesc} onChange={e => setQuestDesc(e.target.value)} rows={3}
                  placeholder="Описание квеста..."
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddQuest(false); setEditQuestData(null); setQuestTitle(''); setQuestDesc(''); }}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                Отмена
              </button>
              <button onClick={editQuestData ? handleSaveEditQuest : handleAddQuest} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
                {editQuestData ? 'Сохранить' : 'Создать Путь'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Sites + Quests */}
        <div className="space-y-4">
          {/* Site selector */}
          <div className="card-glow rounded-xl p-4">
            <label className="block text-xs font-medium text-muted-foreground mb-2">Выберите сайт</label>
            <select value={selectedSiteId} onChange={e => { setSelectedSiteId(e.target.value); setSelectedQuest(null); }}
              className="w-full px-3 py-2 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none">
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Quests list */}
          <div className="card-glow rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-montserrat font-bold text-white text-sm">Пути</h3>
              {selectedSiteId && (
                <button onClick={() => { setShowAddQuest(true); setQuestTitle(''); setQuestDesc(''); }}
                  className="w-7 h-7 rounded-lg btn-gold flex items-center justify-center">
                  <Icon name="Plus" size={14} />
                </button>
              )}
            </div>
            {currentSiteQuests.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-xs">Нет путей</div>
            ) : (
              <div className="space-y-2">
                {currentSiteQuests.map(quest => (
                  <div key={quest.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${selectedQuest?.id === quest.id ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-border hover:border-violet-500/30 hover:bg-violet-500/5'}`}
                    onClick={() => setSelectedQuest(quest)}>
                    <div>
                      <div className="text-sm font-medium text-white">{quest.title}</div>
                      <div className="text-xs text-muted-foreground">{quest.levels.length} уровней</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={e => { e.stopPropagation(); setEditQuestData(quest); setQuestTitle(quest.title); setQuestDesc(quest.description); }}
                        className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                        <Icon name="Pencil" size={12} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); updateQuest(quest.id, { is_active: !quest.is_active }); }}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${quest.is_active ? 'text-green-400' : 'text-gray-500'}`}>
                        <Icon name="Power" size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Levels editor */}
        <div className="lg:col-span-2">
          {!selectedQuest ? (
            <div className="card-glow rounded-xl p-12 text-center h-full flex flex-col items-center justify-center">
              <Icon name="Map" size={48} className="text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Выберите путь для редактирования уровней</p>
            </div>
          ) : (
            <div className="card-glow rounded-xl p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-montserrat font-bold text-white text-lg">{selectedQuest.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedQuest.description}</p>
                </div>
                <button onClick={() => { resetLevelForm(); setShowAddLevel(true); }}
                  className="btn-gold px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                  <Icon name="Plus" size={14} />
                  Добавить уровень
                </button>
              </div>

              {currentLevels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Icon name="Layers" size={32} className="mx-auto mb-2 text-muted-foreground/30" />
                  Нет уровней. Добавьте первый!
                </div>
              ) : (
                <div className="space-y-3">
                  {currentLevels.map((level, idx) => (
                    <div key={level.id} className="bg-secondary/50 rounded-xl p-4 border border-border hover:border-violet-500/30 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(213 90% 42%))' }}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-white">{level.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                level.riddle_type === 'text' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                level.riddle_type === 'image' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                level.riddle_type === 'video' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              }`}>
                                {level.riddle_type === 'text' ? '📝' : level.riddle_type === 'image' ? '🖼' : level.riddle_type === 'video' ? '🎬' : '🎵'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{level.riddle_content || level.riddle_media_url}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-green-400">✓ Ответ: <span className="text-white">{level.answer}</span></span>
                              {level.hint && <span className="text-[10px] text-yellow-400">💡 Подсказка</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => handleEditLevel(level)}
                            className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:text-white hover:border-violet-500/50 flex items-center justify-center transition-all">
                            <Icon name="Pencil" size={13} />
                          </button>
                          <button onClick={() => deleteLevel(level.id)}
                            className="w-7 h-7 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all">
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
