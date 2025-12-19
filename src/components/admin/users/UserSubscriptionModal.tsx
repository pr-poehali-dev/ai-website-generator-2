import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  name: string;
  email: string;
  subscription?: {
    plan_type: string;
    tokens_balance: number;
    tokens_used: number;
    expires_at: string | null;
  };
}

interface UserSubscriptionModalProps {
  selectedUser: User;
  newPlanType: string;
  setNewPlanType: (type: string) => void;
  expiresInDays: number;
  setExpiresInDays: (days: number) => void;
  newTokens: number;
  setNewTokens: (tokens: number) => void;
  grantSubscription: () => void;
  grantTokens: () => void;
  onClose: () => void;
}

export const UserSubscriptionModal = ({
  selectedUser,
  newPlanType,
  setNewPlanType,
  expiresInDays,
  setExpiresInDays,
  newTokens,
  setNewTokens,
  grantSubscription,
  grantTokens,
  onClose
}: UserSubscriptionModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-effect p-8 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Управление подпиской</h2>
            <p className="text-sm text-muted-foreground">
              Пользователь: <span className="font-medium">{selectedUser.name}</span> ({selectedUser.email})
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {selectedUser.subscription && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Icon name="Info" size={18} className="text-blue-600" />
              Текущая подписка
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">План</p>
                <p className="font-bold">
                  {selectedUser.subscription.plan_type === 'light' ? '💡 Light' : 
                   selectedUser.subscription.plan_type === 'pro' ? '⭐ Pro' : '🪙 Токены'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Токены</p>
                <p className="font-bold">{selectedUser.subscription.tokens_balance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Истекает</p>
                <p className="font-bold">
                  {selectedUser.subscription.expires_at 
                    ? new Date(selectedUser.subscription.expires_at).toLocaleDateString('ru-RU')
                    : '—'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Icon name="Gift" size={18} />
              Выдать подписку
            </h3>
            <div className="space-y-4">
              <div>
                <Label>План подписки</Label>
                <Select value={newPlanType} onValueChange={setNewPlanType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">💡 Light (50,000 токенов)</SelectItem>
                    <SelectItem value="pro">⭐ Pro (200,000 токенов)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Срок действия (дней)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                  className="mt-1"
                  placeholder="30"
                />
              </div>
              
              <Button
                className="w-full gradient-primary text-white"
                onClick={grantSubscription}
              >
                <Icon name="Gift" className="mr-2" size={18} />
                Выдать подписку {newPlanType === 'light' ? 'Light' : 'Pro'}
              </Button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Icon name="Coins" size={18} />
              Добавить токены
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Количество токенов</Label>
                <Input
                  type="number"
                  min="1"
                  value={newTokens || ''}
                  onChange={(e) => setNewTokens(parseInt(e.target.value) || 0)}
                  className="mt-1"
                  placeholder="1000"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Токены будут добавлены к текущему балансу пользователя
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTokens(1000)}
                >
                  +1,000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTokens(10000)}
                >
                  +10,000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTokens(50000)}
                >
                  +50,000
                </Button>
              </div>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={grantTokens}
                disabled={newTokens <= 0}
              >
                <Icon name="Plus" className="mr-2" size={18} />
                Добавить {newTokens > 0 ? newTokens.toLocaleString() : ''} токенов
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Icon name="AlertTriangle" className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-medium mb-1">Внимание</p>
              <p className="text-muted-foreground text-xs">
                Выдача подписки и токенов - это административное действие. 
                Убедитесь, что вы действительно хотите предоставить доступ данному пользователю.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
