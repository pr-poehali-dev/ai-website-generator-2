import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  currentUser: any;
  onClose: () => void;
  onSubscriptionUpdate?: () => void;
}

const SubscriptionModal = ({ currentUser, onClose, onSubscriptionUpdate }: SubscriptionModalProps) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'tokens'>('plans');
  const [subscription, setSubscription] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [tokensAmount, setTokensAmount] = useState<number>(1000);
  const [isLoading, setIsLoading] = useState(false);

  const PAYMENT_URL = 'https://functions.poehali.dev/5115d138-6d8d-4005-9614-0f7ca0ff4245';

  useEffect(() => {
    loadSubscription();
    loadPayments();
  }, []);

  const loadSubscription = async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=subscription`, {
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      
      if (data.has_subscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const loadPayments = async () => {
    if (!currentUser?.id) return;
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=payments`, {
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const createPayment = async (paymentType: string, tokensAmount?: number) => {
    if (!currentUser?.id) {
      toast.error('Требуется авторизация');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=create_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          payment_type: paymentType,
          tokens_amount: tokensAmount || 0
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }

      window.open(data.payment_url, '_blank');
      toast.success('Откроется страница оплаты Robokassa');
      
      setTimeout(() => {
        loadSubscription();
        loadPayments();
        if (onSubscriptionUpdate) {
          onSubscriptionUpdate();
        }
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка создания платежа');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'light',
      name: 'Light',
      price: 999,
      tokens: 50000,
      features: [
        '50,000 токенов в месяц',
        'Базовая генерация сайтов',
        'Визуальный редактор',
        'Экспорт HTML',
        'Email поддержка'
      ],
      color: 'from-blue-400 to-cyan-600',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 1999,
      tokens: 200000,
      features: [
        '200,000 токенов в месяц',
        'Продвинутая генерация',
        'Все инструменты редактора',
        'Приоритетная генерация',
        'GitHub интеграция',
        'SEO оптимизация',
        'Приоритетная поддержка'
      ],
      color: 'from-purple-400 to-pink-600',
      popular: true
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { label: 'В обработке', variant: 'secondary' },
      completed: { label: 'Завершён', variant: 'default' },
      failed: { label: 'Ошибка', variant: 'destructive' }
    };
    return variants[status] || variants.pending;
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      subscription_light: 'Подписка Light',
      subscription_pro: 'Подписка Pro',
      tokens: 'Покупка токенов'
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto bg-white">
        <div className="sticky top-0 bg-white border-b z-10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Подписки и токены</h2>
              <p className="text-muted-foreground">
                Выберите план или купите токены для генерации сайтов
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={24} />
            </Button>
          </div>

          {subscription && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon name="Sparkles" className="text-primary" size={24} />
                  <div>
                    <p className="font-bold text-lg">
                      Активная подписка: {subscription.plan_type === 'light' ? 'Light' : subscription.plan_type === 'pro' ? 'Pro' : 'Токены'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Осталось токенов: <strong className="text-foreground">{subscription.tokens_balance.toLocaleString()}</strong>
                      {subscription.expires_at && ` • До ${new Date(subscription.expires_at).toLocaleDateString('ru-RU')}`}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="text-sm">
                  Активна
                </Badge>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="plans">
                <Icon name="CreditCard" className="mr-2" size={16} />
                Подписки
              </TabsTrigger>
              <TabsTrigger value="tokens">
                <Icon name="Coins" className="mr-2" size={16} />
                Токены
              </TabsTrigger>
              <TabsTrigger value="history">
                <Icon name="History" className="mr-2" size={16} />
                История
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative overflow-hidden hover:shadow-2xl transition-all ${
                      plan.popular ? 'border-2 border-primary' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-4 right-4">
                        <Badge className="gradient-primary text-white">
                          Популярный
                        </Badge>
                      </div>
                    )}

                    <div className={`h-32 bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                      <h3 className="text-4xl font-bold text-white">{plan.name}</h3>
                    </div>

                    <div className="p-6">
                      <div className="text-center mb-6">
                        <div className="text-5xl font-bold gradient-text mb-2">
                          {plan.price.toLocaleString()} ₽
                        </div>
                        <p className="text-muted-foreground">в месяц</p>
                        <p className="text-sm text-primary font-medium mt-1">
                          {plan.tokens.toLocaleString()} токенов
                        </p>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icon name="Check" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${plan.popular ? 'gradient-primary text-white' : ''}`}
                        size="lg"
                        onClick={() => createPayment(`subscription_${plan.id}`)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                            Создание...
                          </>
                        ) : (
                          <>
                            <Icon name="CreditCard" className="mr-2" size={18} />
                            Оформить {plan.name}
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-4">
                  <Icon name="Info" className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold mb-2">Что такое токены?</h4>
                    <p className="text-sm text-muted-foreground">
                      Токены используются для генерации сайтов через AI. Один токен = один символ в запросе или ответе. 
                      В среднем, создание среднего сайта занимает 2000-5000 токенов.
                      Light подписка позволит создать около 10-25 сайтов в месяц, Pro - 40-100 сайтов.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-6">
              <Card className="p-8">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <Icon name="Coins" className="mx-auto mb-4 text-primary" size={64} />
                    <h3 className="text-2xl font-bold mb-2">Купить токены</h3>
                    <p className="text-muted-foreground">
                      Покупайте токены без подписки. 1 токен = 1 рубль
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="tokens-amount" className="text-lg mb-2">
                        Количество токенов
                      </Label>
                      <div className="relative">
                        <Input
                          id="tokens-amount"
                          type="number"
                          value={tokensAmount}
                          onChange={(e) => setTokensAmount(Math.max(100, parseInt(e.target.value) || 100))}
                          min={100}
                          step={100}
                          className="text-2xl h-16 pr-16"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                          токенов
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[1000, 5000, 10000, 25000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => setTokensAmount(amount)}
                          className={tokensAmount === amount ? 'border-primary bg-primary/5' : ''}
                        >
                          {amount.toLocaleString()}
                        </Button>
                      ))}
                    </div>

                    <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Сумма к оплате:</span>
                        <span className="text-3xl font-bold gradient-text">
                          {tokensAmount.toLocaleString()} ₽
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground text-right">
                        Вы получите {tokensAmount.toLocaleString()} токенов
                      </p>
                    </div>

                    <Button
                      className="w-full gradient-primary text-white"
                      size="lg"
                      onClick={() => createPayment('tokens', tokensAmount)}
                      disabled={isLoading || tokensAmount < 100}
                    >
                      {isLoading ? (
                        <>
                          <Icon name="Loader2" className="mr-2 animate-spin" size={18} />
                          Создание...
                        </>
                      ) : (
                        <>
                          <Icon name="CreditCard" className="mr-2" size={18} />
                          Купить за {tokensAmount.toLocaleString()} ₽
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-yellow-50 border-yellow-200">
                <div className="flex items-start gap-4">
                  <Icon name="AlertCircle" className="text-yellow-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold mb-2">Рекомендация</h4>
                    <p className="text-sm text-muted-foreground">
                      Подписка выгоднее! За 999₽ вы получаете 50,000 токенов в месяц (экономия 98%), 
                      а за 1999₽ - 200,000 токенов (экономия 90%).
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {payments.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icon name="Receipt" className="mx-auto mb-4 text-muted-foreground" size={64} />
                  <h3 className="text-xl font-bold mb-2">История платежей пуста</h3>
                  <p className="text-muted-foreground">
                    Здесь будут отображаться ваши платежи и покупки
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <Icon name="Receipt" className="text-white" size={24} />
                          </div>
                          <div>
                            <p className="font-bold">
                              {getPaymentTypeLabel(payment.payment_type)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(payment.created_at).toLocaleString('ru-RU')}
                            </p>
                            {payment.tokens_amount > 0 && (
                              <p className="text-xs text-primary">
                                +{payment.tokens_amount.toLocaleString()} токенов
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {payment.amount.toLocaleString()} ₽
                          </p>
                          <Badge variant={getStatusBadge(payment.status).variant}>
                            {getStatusBadge(payment.status).label}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Shield" size={16} />
              Безопасная оплата через Robokassa
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Lock" size={16} />
              SSL шифрование
            </div>
            <div className="flex items-center gap-2">
              <Icon name="CreditCard" size={16} />
              Все способы оплаты
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionModal;