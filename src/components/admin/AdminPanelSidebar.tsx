import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface AdminPanelSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isEditing: boolean;
  handleSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}

export const AdminPanelSidebar = ({ 
  activeTab, 
  setActiveTab, 
  isEditing, 
  handleSave, 
  onClose, 
  onDelete 
}: AdminPanelSidebarProps) => {
  return (
    <div className="w-80 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Icon name="Settings" className="text-white" size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Админ-панель</h2>
              <p className="text-xs text-muted-foreground">Управление сайтом</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {isEditing && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} className="flex-1 gradient-primary text-white">
              <Icon name="Save" className="mr-1" size={14} />
              Сохранить
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="space-y-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <Icon name="LayoutDashboard" className="mr-2" size={18} />
              Обзор
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Icon name="Settings" className="mr-2" size={18} />
              Настройки
            </Button>
            <Button
              variant={activeTab === 'design' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('design')}
            >
              <Icon name="Palette" className="mr-2" size={18} />
              Дизайн
            </Button>
            <Button
              variant={activeTab === 'sections' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('sections')}
            >
              <Icon name="Layout" className="mr-2" size={18} />
              Секции
            </Button>
            <Button
              variant={activeTab === 'seo' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('seo')}
            >
              <Icon name="Search" className="mr-2" size={18} />
              SEO
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('analytics')}
            >
              <Icon name="BarChart" className="mr-2" size={18} />
              Аналитика
            </Button>
            <Button
              variant={activeTab === 'export' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('export')}
            >
              <Icon name="Download" className="mr-2" size={18} />
              Экспорт
            </Button>
            <Button
              variant={activeTab === 'ai' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('ai')}
            >
              <Icon name="Brain" className="mr-2" size={18} />
              AI Настройки
            </Button>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Icon name="Trash2" className="mr-2" size={18} />
          Удалить проект
        </Button>
      </div>
    </div>
  );
};
