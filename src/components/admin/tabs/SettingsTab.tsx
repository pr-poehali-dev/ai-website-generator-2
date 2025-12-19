import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SiteSettings {
  title: string;
  description: string;
  favicon: string;
  animations: boolean;
  darkMode: boolean;
}

interface SettingsTabProps {
  siteSettings: SiteSettings;
  updateSetting: (key: keyof SiteSettings, value: any) => void;
}

export const SettingsTab = ({ siteSettings, updateSetting }: SettingsTabProps) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Основные настройки</h2>
      
      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="site-title">Название сайта</Label>
            <Input
              id="site-title"
              value={siteSettings.title}
              onChange={(e) => updateSetting('title', e.target.value)}
              placeholder="Мой сайт"
            />
          </div>
          
          <div>
            <Label htmlFor="site-description">Описание</Label>
            <Textarea
              id="site-description"
              value={siteSettings.description}
              onChange={(e) => updateSetting('description', e.target.value)}
              placeholder="Краткое описание вашего сайта"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="site-favicon">Favicon URL</Label>
            <Input
              id="site-favicon"
              value={siteSettings.favicon}
              onChange={(e) => updateSetting('favicon', e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Дополнительно</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Анимации</Label>
              <p className="text-sm text-muted-foreground">Включить анимации на сайте</p>
            </div>
            <Switch
              checked={siteSettings.animations}
              onCheckedChange={(checked) => updateSetting('animations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Тёмная тема</Label>
              <p className="text-sm text-muted-foreground">Включить тёмный режим</p>
            </div>
            <Switch
              checked={siteSettings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>
        </div>
      </Card>
    </>
  );
};
