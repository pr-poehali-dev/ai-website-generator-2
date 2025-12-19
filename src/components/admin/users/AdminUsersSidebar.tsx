import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  role: 'admin' | 'moderator' | 'user';
}

interface AdminUsersSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;
  loadUsers: () => void;
  onClose: () => void;
}

export const AdminUsersSidebar = ({
  searchQuery,
  setSearchQuery,
  filterRole,
  setFilterRole,
  users,
  filteredUsers,
  isLoading,
  loadUsers,
  onClose
}: AdminUsersSidebarProps) => {
  return (
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
  );
};
