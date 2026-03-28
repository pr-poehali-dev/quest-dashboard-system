import { useState } from 'react';
import { useApp, Site } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

export default function SitesPage() {
  const { sites, currentUser, addSite, updateSite } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editSite, setEditSite] = useState<Site | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showIntegration, setShowIntegration] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    addSite({ name, description, owner_id: currentUser!.id, is_active: true });
    setName('');
    setDescription('');
    setShowAdd(false);
  };

  const handleEdit = (site: Site) => {
    setEditSite(site);
    setName(site.name);
    setDescription(site.description);
  };

  const handleSaveEdit = () => {
    if (!editSite || !name.trim()) return;
    updateSite(editSite.id, { name, description });
    setEditSite(null);
    setName('');
    setDescription('');
  };

  const handleCopyIntegration = (token: string) => {
    const integrationData = `
=== ДАННЫЕ ИНТЕГРАЦИИ МАСТЕР ПУТЕЙ ===
INTEGRATION_TOKEN: ${token}
API_BASE_URL: https://functions.poehali.dev/2449e2d8-177c-4a8d-a469-0cbab180de83
PLATFORM: Мастер путей v1.0

Инструкция по интеграции:
1. Скопируйте эти данные
2. Вставьте в промпт ИИ-генератора при создании нового сайта
3. ИИ автоматически создаст сайт с подключением к платформе
4. Участники нового сайта смогут подавать заявки в квесты
5. Владелец управляет доступом из главной панели

Пример промпта для ИИ:
"Создай сайт квеста. Данные интеграции: INTEGRATION_TOKEN=${token}"
=====================================
    `.trim();

    navigator.clipboard.writeText(integrationData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat text-2xl font-black text-white">Управление сайтами</h1>
          <div className="separator-glow mt-2" />
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-gold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <Icon name="Plus" size={16} />
          Добавить сайт
        </button>
      </div>

      {/* Add/Edit modal */}
      {(showAdd || editSite) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-md fade-in">
            <h2 className="font-montserrat font-bold text-white text-lg mb-5">
              {editSite ? 'Редактировать сайт' : 'Новый сайт'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Название сайта</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Мой портал квестов"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Описание</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Описание платформы..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAdd(false); setEditSite(null); setName(''); setDescription(''); }}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-white hover:border-violet-500/50 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={editSite ? handleSaveEdit : handleAdd}
                className="flex-1 btn-gold py-2.5 rounded-xl text-sm"
              >
                {editSite ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integration instruction modal */}
      {showIntegration && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-glow rounded-2xl p-6 w-full max-w-lg fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-montserrat font-bold text-white text-lg flex items-center gap-2">
                <Icon name="Link" size={20} className="text-yellow-400" />
                Данные интеграции
              </h2>
              <button onClick={() => setShowIntegration(null)} className="text-muted-foreground hover:text-white">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 mb-4 border border-violet-500/20">
              <div className="text-xs text-violet-300 font-mono mb-2">TOKEN:</div>
              <div className="text-sm font-mono text-yellow-300 break-all">{showIntegration}</div>
            </div>

            <div className="bg-secondary/30 rounded-xl p-4 mb-5 text-xs text-muted-foreground space-y-2">
              <div className="font-semibold text-white mb-2">📋 Инструкция:</div>
              <div>1. Нажмите кнопку «Скопировать данные»</div>
              <div>2. Откройте ИИ-генератор (Поехали.dev или другой)</div>
              <div>3. Вставьте скопированные данные в начало промпта</div>
              <div>4. Опишите, какой сайт нужно создать</div>
              <div>5. ИИ создаст сайт с интеграцией в вашу платформу</div>
            </div>

            <button
              onClick={() => handleCopyIntegration(showIntegration)}
              className="w-full btn-gold py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <Icon name={copied ? 'CheckCircle' : 'Copy'} size={18} />
              {copied ? '✓ Скопировано!' : 'Скопировать данные интеграции'}
            </button>
          </div>
        </div>
      )}

      {/* Sites list */}
      {sites.length === 0 ? (
        <div className="card-glow rounded-xl p-12 text-center">
          <Icon name="Globe" size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Нет добавленных сайтов</p>
          <button onClick={() => setShowAdd(true)} className="mt-4 btn-gold px-6 py-2.5 rounded-xl text-sm">
            Создать первый сайт
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sites.map(site => (
            <div key={site.id} className="card-glow rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-montserrat font-bold text-white text-lg">{site.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${site.is_active ? 'bg-green-400' : 'bg-gray-500'}`} />
                    {site.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        Активен
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{site.description || 'Нет описания'}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Map" size={12} />
                      {site.quests.length} путей
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={12} />
                      {new Date(site.created_at).toLocaleDateString('ru')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => setShowIntegration(site.integration_token)}
                    title="Данные интеграции"
                    className="w-9 h-9 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 flex items-center justify-center transition-all"
                  >
                    <Icon name="Link" size={16} />
                  </button>
                  <button
                    onClick={() => handleEdit(site)}
                    title="Редактировать"
                    className="w-9 h-9 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-white hover:border-violet-500/50 flex items-center justify-center transition-all"
                  >
                    <Icon name="Settings" size={16} />
                  </button>
                  <button
                    onClick={() => updateSite(site.id, { is_active: !site.is_active })}
                    title={site.is_active ? 'Деактивировать' : 'Активировать'}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${site.is_active ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'}`}
                  >
                    <Icon name={site.is_active ? 'EyeOff' : 'Eye'} size={16} />
                  </button>
                </div>
              </div>

              {/* Quests list */}
              {site.quests.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2 font-semibold">ПУТИ:</div>
                  <div className="flex flex-wrap gap-2">
                    {site.quests.map(quest => (
                      <span key={quest.id} className="px-3 py-1 rounded-full text-xs bg-violet-500/15 border border-violet-500/30 text-violet-300">
                        ✦ {quest.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}