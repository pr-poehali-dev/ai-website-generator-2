import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface AdminUsersPanelProps {
  currentUser: any;
  onClose: () => void;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  last_login: string | null;
  projects_count?: number;
  subscription?: {
    plan_type: string;
    tokens_balance: number;
    tokens_used: number;
    expires_at: string | null;
  };
}

const AdminUsersPanel = ({ currentUser, onClose }: AdminUsersPanelProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [newPlanType, setNewPlanType] = useState<string>('light');
  const [newTokens, setNewTokens] = useState<number>(0);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  const PROJECTS_URL = 'https://functions.poehali.dev/4ef398d9-5866-48b8-bb87-02031e02a875';
  const PAYMENT_URL = 'https://functions.poehali.dev/5115d138-6d8d-4005-9614-0f7ca0ff4245';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(PROJECTS_URL);
      const data = await response.json();
      
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'admin@example.com',
          name: 'Администратор',
          role: 'admin',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          projects_count: 15
        },
        {
          id: 2,
          email: 'toshokk@mail.ru',
          name: 'Лабкович Антон Игоревич',
          role: 'user',
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          last_login: new Date().toISOString(),
          projects_count: data.projects?.filter((p: any) => p.user_id === 2).length || 0
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`Роль пользователя обновлена на ${getRoleLabel(newRole)}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Ошибка обновления роли');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Вы уверены что хотите удалить этого пользователя?')) return;
    
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Пользователь удалён');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Ошибка удаления пользователя');
    }
  };

  const loadUserSubscription = async (userId: number) => {
    try {
      const response = await fetch(`${PAYMENT_URL}?action=admin_get_subscription&user_id=${userId}`, {
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      
      if (data.has_subscription) {
        return data.subscription;
      }
      return null;
    } catch (error) {
      console.error('Error loading subscription:', error);
      return null;
    }
  };

  const grantSubscription = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=admin_grant_subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          plan_type: newPlanType,
          expires_in_days: expiresInDays
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка выдачи подписки');
      }
      
      toast.success(`Подписка ${newPlanType === 'light' ? 'Light' : 'Pro'} выдана пользователю ${selectedUser.name}`);
      setShowSubscriptionModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error granting subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка выдачи подписки');
    }
  };

  const grantTokens = async () => {
    if (!selectedUser || newTokens <= 0) {
      toast.error('Укажите корректное количество токенов');
      return;
    }
    
    try {
      const response = await fetch(`${PAYMENT_URL}?action=admin_grant_tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          tokens: newTokens
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка выдачи токенов');
      }
      
      toast.success(`${newTokens.toLocaleString()} токенов выдано пользователю ${selectedUser.name}`);
      setShowSubscriptionModal(false);
      setSelectedUser(null);
      setNewTokens(0);
      loadUsers();
    } catch (error) {
      console.error('Error granting tokens:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка выдачи токенов');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Администратор',
      moderator: 'Модератор',
      user: 'Пользователь'
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'admin') return 'default';
    if (role === 'moderator') return 'secondary';
    return 'outline';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md">
          <Icon name="ShieldAlert" className="mx-auto mb-4 text-red-600" size={64} />
          <h2 className="text-2xl font-bold mb-2">Доступ запрещён</h2>
          <p className="text-muted-foreground mb-6">
            Только администраторы могут управлять пользователями
          </p>
          <Button onClick={onClose} variant="outline">
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            Назад
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon name="Shield" className="text-red-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Управление</h2>
                <p className="text-xs text-muted-foreground">Пользователи</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Input
                placeholder="Поиск пользователей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Фильтр по роли" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="admin">Администраторы</SelectItem>
                  <SelectItem value="moderator">Модераторы</SelectItem>
                  <SelectItem value="user">Пользователи</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">
              Найдено: {filteredUsers.length} из {users.length}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-xs text-muted-foreground">Админов</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'moderator').length}
                </div>
                <div className="text-xs text-muted-foreground">Модераторов</div>
              </Card>
              <Card className="p-3 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {users.filter(u => u.role === 'user').length}
                </div>
                <div className="text-xs text-muted-foreground">Пользователей</div>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={loadUsers}
            disabled={isLoading}
          >
            <Icon name={isLoading ? "Loader2" : "RefreshCw"} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={18} />
            Обновить
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Пользователи системы</h3>
              <p className="text-muted-foreground">
                Управление ролями и правами доступа
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" className="mx-auto animate-spin text-primary mb-4" size={48} />
                <p className="text-muted-foreground">Загрузка пользователей...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="Users" className="mx-auto mb-4 text-muted-foreground" size={64} />
                <h3 className="text-xl font-bold mb-2">Пользователи не найдены</h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить параметры поиска
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">{user.name}</h4>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            {user.id === currentUser.id && (
                              <Badge variant="outline" className="text-xs">
                                Это вы
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {user.email}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Icon name="Calendar" size={12} />
                              Зарегистрирован: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                            </div>
                            {user.last_login && (
                              <div className="flex items-center gap-1">
                                <Icon name="Clock" size={12} />
                                Последний вход: {new Date(user.last_login).toLocaleDateString('ru-RU')}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Icon name="FolderOpen" size={12} />
                              Проектов: {user.projects_count || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-48">
                          <Label className="text-xs mb-1">Роль пользователя</Label>
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value as any)}
                            disabled={user.id === currentUser.id}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Icon name="Shield" size={14} className="text-red-600" />
                                  Администратор
                                </div>
                              </SelectItem>
                              <SelectItem value="moderator">
                                <div className="flex items-center gap-2">
                                  <Icon name="ShieldCheck" size={14} className="text-blue-600" />
                                  Модератор
                                </div>
                              </SelectItem>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <Icon name="User" size={14} className="text-gray-600" />
                                  Пользователь
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const subscription = await loadUserSubscription(user.id);
                            setSelectedUser({ ...user, subscription });
                            setShowSubscriptionModal(true);
                          }}
                        >
                          <Icon name="CreditCard" className="mr-1" size={14} />
                          Подписка
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteUser(user.id)}
                          disabled={user.id === currentUser.id}
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-4">
                <Icon name="Info" className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold mb-2">Информация о ролях</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Icon name="Shield" size={14} className="text-red-600 mt-0.5" />
                      <div>
                        <strong>Администратор</strong> - полный доступ ко всем функциям, управление пользователями и проектами
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="ShieldCheck" size={14} className="text-blue-600 mt-0.5" />
                      <div>
                        <strong>Модератор</strong> - может просматривать и редактировать проекты других пользователей
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="User" size={14} className="text-gray-600 mt-0.5" />
                      <div>
                        <strong>Пользователь</strong> - доступ только к собственным проектам
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {showSubscriptionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl glass-effect p-8 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Управление подпиской</h2>
                <p className="text-sm text-muted-foreground">
                  Пользователь: <span className="font-medium">{selectedUser.name}</span> ({selectedUser.email})
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setShowSubscriptionModal(false);
                setSelectedUser(null);
              }}>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPanel;