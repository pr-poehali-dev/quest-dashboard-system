import { useState } from 'react';
import { useApp, Quest, Level } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

interface Props { onNavigate: (page: string) => void; }

export default function MyQuestsPage({ onNavigate }: Props) {
  const { currentUser, sites, getUserQuestAccess, getUserProgress, completeLevel, addJoinRequest } = useApp();
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [activeLevelIdx, setActiveLevelIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestQuestId, setRequestQuestId] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  if (!currentUser) return null;

  const myAccess = getUserQuestAccess(currentUser.id);
  const myProgress = getUserProgress(currentUser.id);
  const allQuests = sites.flatMap(s => s.quests);
  const accessibleQuests = allQuests.filter(q => myAccess.some(a => a.quest_id === q.id) && q.is_active);
  const allQuestsActive = allQuests.filter(q => q.is_active);

  const isLevelCompleted = (levelId: string) => myProgress.some(p => p.level_id === levelId);

  const activeQuest = accessibleQuests.find(q => q.id === activeQuestId);
  const currentLevel: Level | undefined = activeQuest?.levels[activeLevelIdx];

  const handleAnswer = () => {
    if (!currentLevel || !activeQuest) return;
    if (answer.toLowerCase().trim() === currentLevel.answer.toLowerCase().trim()) {
      completeLevel(currentUser.id, currentLevel.id, activeQuest.id, usedHint);
      setAnswerResult('correct');
      setShowPortal(true);
      setTimeout(() => {
        setShowPortal(false);
        setAnswer('');
        setAnswerResult('idle');
        setShowHint(false);
        setUsedHint(false);
        if (activeLevelIdx < activeQuest.levels.length - 1) {
          setActiveLevelIdx(activeLevelIdx + 1);
        } else {
          setActiveQuestId(null);
          setActiveLevelIdx(0);
        }
      }, 2500);
    } else {
      setAnswerResult('wrong');
      setTimeout(() => setAnswerResult('idle'), 1200);
    }
  };

  const handleRequestAccess = () => {
    if (!requestQuestId) return;
    addJoinRequest(currentUser.id, currentUser.name, sites[0]?.id || '', requestQuestId);
    setRequestSent(true);
    setTimeout(() => { setRequestSent(false); setShowRequestModal(false); setRequestQuestId(''); }, 2000);
  };

  if (activeQuest && currentLevel) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center relative">
        {/* Portal animation */}
        {showPortal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center scale-in">
              <div className="text-6xl mb-4 float-animation">🔮</div>
              <button className="portal-open-btn btn-gold px-8 py-4 rounded-2xl text-xl font-black glow-gold">
                ✦ ПРОХОД ОТКРЫТ ✦
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => { setActiveQuestId(null); setActiveLevelIdx(0); setAnswer(''); setAnswerResult('idle'); }}
              className="w-8 h-8 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-white flex items-center justify-center transition-all">
              <Icon name="ArrowLeft" size={16} />
            </button>
            <div>
              <div className="text-xs text-muted-foreground">Путь: {activeQuest.title}</div>
              <div className="text-sm font-semibold text-white">Уровень {activeLevelIdx + 1} из {activeQuest.levels.length}</div>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-secondary rounded-full mb-6 overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${(activeLevelIdx / activeQuest.levels.length) * 100}%`,
                background: 'linear-gradient(90deg, hsl(263 70% 58%), hsl(43 96% 56%))'
              }} />
          </div>

          {/* Level card */}
          <div className="card-glow rounded-2xl p-6 fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(213 90% 42%))' }}>
                {activeLevelIdx + 1}
              </div>
              <h2 className="font-montserrat font-bold text-white">{currentLevel.title}</h2>
              {isLevelCompleted(currentLevel.id) && (
                <span className="text-green-400 text-xs">✓ Пройден</span>
              )}
            </div>

            {/* Riddle */}
            <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-violet-500/20">
              {currentLevel.riddle_type === 'text' && (
                <p className="text-white text-lg leading-relaxed font-medium">{currentLevel.riddle_content}</p>
              )}
              {currentLevel.riddle_type === 'image' && (
                <div>
                  <img src={currentLevel.riddle_media_url} alt="Загадка" className="w-full rounded-lg mb-3 max-h-64 object-cover" />
                  {currentLevel.riddle_content && <p className="text-white">{currentLevel.riddle_content}</p>}
                </div>
              )}
              {currentLevel.riddle_type === 'video' && (
                <div>
                  <video src={currentLevel.riddle_media_url} controls className="w-full rounded-lg mb-3" />
                  {currentLevel.riddle_content && <p className="text-white">{currentLevel.riddle_content}</p>}
                </div>
              )}
              {currentLevel.riddle_type === 'audio' && (
                <div>
                  <audio src={currentLevel.riddle_media_url} controls className="w-full mb-3" />
                  {currentLevel.riddle_content && <p className="text-white">{currentLevel.riddle_content}</p>}
                </div>
              )}
            </div>

            {/* Hint */}
            {currentLevel.hint && (
              <div className="mb-4">
                {!showHint ? (
                  <button onClick={() => { setShowHint(true); setUsedHint(true); }}
                    className="flex items-center gap-2 text-sm text-yellow-400/70 hover:text-yellow-400 transition-colors">
                    <Icon name="Lightbulb" size={16} />
                    Показать подсказку <span className="text-xs text-muted-foreground">(-20 очков)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
                    <Icon name="Lightbulb" size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span className="text-yellow-200 text-sm">{currentLevel.hint}</span>
                  </div>
                )}
              </div>
            )}

            {/* Answer input */}
            <div className="flex gap-3">
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                placeholder="Введите ответ..."
                disabled={answerResult === 'correct'}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border outline-none transition-all ${
                  answerResult === 'correct' ? 'bg-green-500/20 border-green-500 text-green-300' :
                  answerResult === 'wrong' ? 'bg-red-500/20 border-red-500 text-white animate-pulse' :
                  'bg-secondary border-border text-white focus:border-violet-500'
                }`}
              />
              <button onClick={handleAnswer} disabled={answerResult === 'correct'}
                className="btn-gold px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <Icon name="ArrowRight" size={16} />
                Ответить
              </button>
            </div>
            {answerResult === 'wrong' && (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <Icon name="X" size={12} /> Неверно, попробуйте ещё раз
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-montserrat text-2xl font-black text-white">Мои Пути</h1>
        <div className="separator-glow mt-2" />
      </div>

      {/* Request access modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <h2 className="font-montserrat font-bold text-white text-lg mb-5">Запросить доступ к Пути</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Выберите Путь</label>
                <select value={requestQuestId} onChange={e => setRequestQuestId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white border border-border focus:border-violet-500 outline-none">
                  <option value="">Выберите...</option>
                  {allQuestsActive.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                </select>
              </div>
            </div>
            {requestSent ? (
              <div className="mt-4 p-3 text-center text-green-400 text-sm">
                <Icon name="CheckCircle" size={20} className="mx-auto mb-1" />
                Запрос отправлен! Ожидайте одобрения.
              </div>
            ) : (
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
                  Отмена
                </button>
                <button onClick={handleRequestAccess} className="flex-1 btn-gold py-2.5 rounded-xl text-sm">
                  Отправить запрос
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {accessibleQuests.length === 0 ? (
        <div className="card-glow rounded-xl p-12 text-center">
          <div className="text-5xl mb-4 float-animation">🔮</div>
          <h2 className="font-montserrat font-bold text-white text-lg mb-2">Пути ещё закрыты</h2>
          <p className="text-muted-foreground text-sm mb-6">Владелец должен открыть вам доступ к квестам</p>
          <button onClick={() => setShowRequestModal(true)} className="btn-gold px-6 py-3 rounded-xl text-sm font-bold">
            ✦ Запросить доступ к Пути
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {accessibleQuests.map(quest => {
            const questProgress = myProgress.filter(p => p.quest_id === quest.id);
            const totalLevels = quest.levels.length;
            const pct = totalLevels > 0 ? Math.round((questProgress.length / totalLevels) * 100) : 0;
            const nextLevelIdx = questProgress.length;
            const isCompleted = questProgress.length >= totalLevels && totalLevels > 0;

            return (
              <div key={quest.id} className="card-glow rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-montserrat font-bold text-white text-lg">{quest.title}</h3>
                      {isCompleted && <span className="text-yellow-400 text-sm">👑 Завершён</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{quest.description}</p>
                  </div>
                  <button
                    onClick={() => { setActiveQuestId(quest.id); setActiveLevelIdx(nextLevelIdx < totalLevels ? nextLevelIdx : 0); }}
                    className="portal-open-btn btn-gold px-5 py-2.5 rounded-xl text-sm font-bold ml-4 flex-shrink-0">
                    {isCompleted ? '↺ Заново' : questProgress.length > 0 ? '▶ Продолжить' : '✦ Начать Путь'}
                  </button>
                </div>

                {/* Levels */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {quest.levels.map((level, idx) => {
                    const done = isLevelCompleted(level.id);
                    return (
                      <div key={level.id}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-black' : 'bg-secondary border border-border text-muted-foreground'}`}>
                        {done ? '✓' : idx + 1}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{questProgress.length}/{totalLevels} уровней</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, hsl(263 70% 58%), hsl(43 96% 56%))'
                    }} />
                </div>
              </div>
            );
          })}

          <button onClick={() => setShowRequestModal(true)}
            className="btn-violet w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <Icon name="Plus" size={16} />
            Запросить доступ к новому Пути
          </button>
        </div>
      )}
    </div>
  );
}
