import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  const AUTH_URL = 'https://functions.poehali.dev/c95db439-6603-4112-8601-bfd6d41a6551';

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Авторизация отменена');
        navigate('/');
        return;
      }

      if (!code) {
        toast.error('Ошибка авторизации: код не получен');
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`${AUTH_URL}?action=google_callback&code=${encodeURIComponent(code)}`, {
          method: 'GET'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка авторизации через Google');
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);

        toast.success('🎉 Вход через Google выполнен успешно!');
        
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error) {
        console.error('Google callback error:', error);
        toast.error(error instanceof Error ? error.message : 'Ошибка авторизации');
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect p-12 text-center">
        {isProcessing ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <Icon name="Loader2" className="w-16 h-16 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Авторизация...</h2>
            <p className="text-muted-foreground">
              Подождите, мы завершаем вход через Google
            </p>
          </>
        ) : (
          <>
            <Icon name="CheckCircle" className="mx-auto mb-4 text-green-600" size={64} />
            <h2 className="text-2xl font-bold mb-2">Успешно!</h2>
            <p className="text-muted-foreground">
              Перенаправляем на главную страницу...
            </p>
          </>
        )}
      </Card>
    </div>
  );
};

export default GoogleCallback;
