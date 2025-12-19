import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  last_login: string | null;
  projects_count?: number;
}

interface UsersListProps {
  isLoading: boolean;
  filteredUsers: User[];
  currentUser: any;
  updateUserRole: (userId: number, newRole: 'admin' | 'moderator' | 'user') => void;
  loadUserSubscription: (userId: number) => Promise<any>;
  setSelectedUser: (user: any) => void;
  setShowSubscriptionModal: (show: boolean) => void;
  deleteUser: (userId: number) => void;
  getRoleLabel: (role: string) => string;
  getRoleBadgeVariant: (role: string) => any;
}

export const UsersList = ({
  isLoading,
  filteredUsers,
  currentUser,
  updateUserRole,
  loadUserSubscription,
  setSelectedUser,
  setShowSubscriptionModal,
  deleteUser,
  getRoleLabel,
  getRoleBadgeVariant
}: UsersListProps) => {
  return (
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
  );
};
