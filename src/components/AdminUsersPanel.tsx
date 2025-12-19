import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { AdminUsersSidebar } from '@/components/admin/users/AdminUsersSidebar';
import { UsersList } from '@/components/admin/users/UsersList';
import { UserSubscriptionModal } from '@/components/admin/users/UserSubscriptionModal';

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
      <AdminUsersSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        users={users}
        filteredUsers={filteredUsers}
        isLoading={isLoading}
        loadUsers={loadUsers}
        onClose={onClose}
      />

      <UsersList
        isLoading={isLoading}
        filteredUsers={filteredUsers}
        currentUser={currentUser}
        updateUserRole={updateUserRole}
        loadUserSubscription={loadUserSubscription}
        setSelectedUser={setSelectedUser}
        setShowSubscriptionModal={setShowSubscriptionModal}
        deleteUser={deleteUser}
        getRoleLabel={getRoleLabel}
        getRoleBadgeVariant={getRoleBadgeVariant}
      />

      {showSubscriptionModal && selectedUser && (
        <UserSubscriptionModal
          selectedUser={selectedUser}
          newPlanType={newPlanType}
          setNewPlanType={setNewPlanType}
          expiresInDays={expiresInDays}
          setExpiresInDays={setExpiresInDays}
          newTokens={newTokens}
          setNewTokens={setNewTokens}
          grantSubscription={grantSubscription}
          grantTokens={grantTokens}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminUsersPanel;
