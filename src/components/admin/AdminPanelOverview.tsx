import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminPanelOverviewProps {
  project: any;
  siteSettings: {
    title: string;
    description: string;
  };
  handlePublish: () => void;
}

export const AdminPanelOverview = ({ project, siteSettings, handlePublish }: AdminPanelOverviewProps) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{siteSettings.title}</h1>
        <p className="text-muted-foreground">{siteSettings.description || 'Описание отсутствует'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
              <Icon name="Globe" className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Публикация</h3>
              <p className="text-sm text-muted-foreground">Опубликуйте сайт в интернет</p>
            </div>
          </div>
          <Button onClick={handlePublish} className="w-full gradient-primary text-white">
            <Icon name="Upload" className="mr-2" size={18} />
            Опубликовать сайт
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Icon name="Clock" className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Статус</h3>
              <p className="text-sm text-muted-foreground">Последнее обновление</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(project?.updated_at || Date.now()).toLocaleString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="flex flex-col h-auto py-4">
            <Icon name="Eye" className="mb-2" size={24} />
            <span className="text-sm">Предпросмотр</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-4">
            <Icon name="Share2" className="mb-2" size={24} />
            <span className="text-sm">Поделиться</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-4">
            <Icon name="Copy" className="mb-2" size={24} />
            <span className="text-sm">Дублировать</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-4">
            <Icon name="Archive" className="mb-2" size={24} />
            <span className="text-sm">Архивировать</span>
          </Button>
        </div>
      </Card>
    </>
  );
};
