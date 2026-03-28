import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Icon from '@/components/ui/icon';

interface AuthPageProps {
  onAuth: () => void;
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const { login, register } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email && !phone) { setError('Введите email или телефон'); return; }
    if (!password) { setError('Введите пароль'); return; }
    const id = email || phone;
    const user = await login(id, password);
    if (user) {
      onAuth();
    } else {
      setError('Неверные данные для входа');
    }
  };

  const handleSendSms = () => {
    if (!phone || phone.length < 10) { setError('Введите корректный номер телефона'); return; }
    setLoading(true);
    setTimeout(() => {
      setSmsSent(true);
      setLoading(false);
      setError('');
    }, 1000);
  };

  const handleRegister = async () => {
    setError('');
    if (!name) { setError('Введите имя'); return; }
    if (!email && !phone) { setError('Введите email или телефон'); return; }
    if (!password) { setError('Введите пароль'); return; }
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    if (smsSent && smsCode !== '1234') { setError('Неверный код из SMS (демо: 1234)'); return; }
    const user = await register(name, email, phone, password);
    if (user) {
      onAuth();
    } else {
      setError('Пользователь с таким email или телефоном уже существует');
    }
  };

  const handleOwnerLogin = async () => {
    const user = await login('owner@masterpytey.ru', 'owner123');
    if (user) onAuth();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Mystical background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(263 70% 58%), transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(213 90% 42%), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(43 96% 56%), transparent)' }} />
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }} />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10 fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center float-animation"
            style={{ background: 'linear-gradient(135deg, hsl(263 70% 50%), hsl(213 90% 42%))' }}>
            <Icon name="Sparkles" size={30} className="text-white" />
          </div>
          <h1 className="font-montserrat text-3xl font-black mystical-text">МАСТЕР ПУТЕЙ</h1>
          <p className="text-muted-foreground text-sm mt-1">Платформа управления квестами</p>
        </div>

        {/* Card */}
        <div className="card-glow rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden mb-6 bg-secondary/50 p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'btn-gold text-black' : 'text-muted-foreground hover:text-white'}`}
            >
              Войти
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === 'register' ? 'btn-gold text-black' : 'text-muted-foreground hover:text-white'}`}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email или телефон</label>
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="owner@questmaster.ru"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <button onClick={handleLogin} className="btn-gold w-full py-3 rounded-xl text-sm mt-2">
                Войти в систему
              </button>
              <button onClick={handleOwnerLogin} className="w-full py-2.5 rounded-xl text-xs border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-all">
                ✨ Войти как Владелец (демо)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Ваше имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ivan@mail.ru"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Телефон</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+7 999 123 45 67"
                    className="flex-1 px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                  />
                  <button
                    onClick={handleSendSms}
                    disabled={smsSent || loading}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${smsSent ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'btn-violet text-white'}`}
                  >
                    {loading ? '...' : smsSent ? '✓ SMS' : 'SMS'}
                  </button>
                </div>
                {smsSent && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={smsCode}
                      onChange={e => setSmsCode(e.target.value)}
                      placeholder="Код из SMS (демо: 1234)"
                      className="w-full px-4 py-2 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-green-500/30 outline-none transition-all"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Подтвердите пароль</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm text-white placeholder:text-muted-foreground border border-border focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                />
              </div>
              <button onClick={handleRegister} className="btn-gold w-full py-3 rounded-xl text-sm mt-2">
                Создать аккаунт
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Демо: owner@masterpytey.ru / owner123
        </p>
      </div>
    </div>
  );
}