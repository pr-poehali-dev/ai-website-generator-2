import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const AUTH_URL = 'https://functions.poehali.dev/c95db439-6603-4112-8601-bfd6d41a6551';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${AUTH_URL}?action=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register' 
            ? { email, password, name: name || email.split('@')[0] }
            : { email, password }
        )
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      toast.success(mode === 'register' ? '🎉 Регистрация успешна!' : '👋 Добро пожаловать!');
      onSuccess(data.user, data.token);
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка авторизации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md glass-effect p-8 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'login' 
                ? 'Войдите чтобы сохранять проекты' 
                : 'Создайте аккаунт для работы с платформой'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              required
              minLength={6}
            />
            {mode === 'register' && (
              <p className="text-xs text-muted-foreground mt-1">
                Минимум 6 символов
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                Загрузка...
              </>
            ) : (
              <>
                <Icon name={mode === 'login' ? 'LogIn' : 'UserPlus'} className="mr-2" size={18} />
                {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === 'login' ? (
              <>
                Нет аккаунта? <span className="text-primary font-medium">Зарегистрируйтесь</span>
              </>
            ) : (
              <>
                Уже есть аккаунт? <span className="text-primary font-medium">Войдите</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Продолжая, вы соглашаетесь с условиями использования платформы
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthModal;
