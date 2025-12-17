import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { AdminPanelSidebar } from '@/components/admin/AdminPanelSidebar';
import { AdminPanelOverview } from '@/components/admin/AdminPanelOverview';
import { AdminPanelSettings } from '@/components/admin/AdminPanelSettings';

interface AdminPanelProps {
  project: any;
  onClose: () => void;
  onSave: (updates: any) => void;
  onPublish: () => void;
  onDelete: () => void;
}

interface PageSection {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'gallery' | 'contact' | 'footer' | 'custom';
  visible: boolean;
  order: number;
  content: any;
}

interface SiteSettings {
  title: string;
  description: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  animations: boolean;
  darkMode: boolean;
  aiProvider: 'openai' | 'deepseek';
}

const AdminPanel = ({ project, onClose, onSave, onPublish, onDelete }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    title: project?.name || 'Новый сайт',
    description: project?.description || '',
    favicon: '',
    primaryColor: '#9b87f5',
    secondaryColor: '#D946EF',
    accentColor: '#0EA5E9',
    fontFamily: 'Inter',
    fontSize: 16,
    borderRadius: 8,
    animations: true,
    darkMode: false,
    aiProvider: 'deepseek'
  });

  const [sections, setSections] = useState<PageSection[]>([
    { id: '1', name: 'Главный блок', type: 'hero', visible: true, order: 1, content: {} },
    { id: '2', name: 'Возможности', type: 'features', visible: true, order: 2, content: {} },
    { id: '3', name: 'Галерея', type: 'gallery', visible: false, order: 3, content: {} },
    { id: '4', name: 'Контакты', type: 'contact', visible: true, order: 4, content: {} },
    { id: '5', name: 'Подвал', type: 'footer', visible: true, order: 5, content: {} },
  ]);

  const [analytics] = useState({
    views: 1247,
    visitors: 843,
    avgTime: '2:34',
    bounceRate: 32.5
  });

  const updateSetting = (key: keyof SiteSettings, value: any) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
    setIsEditing(true);
  };

  const toggleSection = (id: string) => {
    setSections(prev => 
      prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
    );
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave({
      name: siteSettings.title,
      description: siteSettings.description,
      settings: siteSettings,
      sections: sections
    });
    setIsEditing(false);
    toast.success('Изменения сохранены!');
  };

  const handlePublish = () => {
    onPublish();
    toast.success('🌐 Сайт опубликован!');
  };

  const handleExport = (format: 'html' | 'zip' | 'github') => {
    if (format === 'html') {
      const blob = new Blob([project.current_code || ''], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${siteSettings.title.replace(/\s+/g, '-')}.html`;
      a.click();
      toast.success('HTML файл скачан');
    } else if (format === 'zip') {
      toast.info('Экспорт в ZIP в разработке');
    } else {
      toast.info('Интеграция с GitHub в разработке');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      <AdminPanelSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isEditing={isEditing}
        handleSave={handleSave}
        onClose={onClose}
        onDelete={onDelete}
      />

      <div className="flex-1 bg-gray-50 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-4xl mx-auto">
            {activeTab === 'overview' && (
              <AdminPanelOverview
                project={project}
                siteSettings={siteSettings}
                handlePublish={handlePublish}
              />
            )}

            {activeTab !== 'overview' && (
              <AdminPanelSettings
                activeTab={activeTab}
                siteSettings={siteSettings}
                updateSetting={updateSetting}
                sections={sections}
                toggleSection={toggleSection}
                analytics={analytics}
                handleExport={handleExport}
              />
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminPanel;
