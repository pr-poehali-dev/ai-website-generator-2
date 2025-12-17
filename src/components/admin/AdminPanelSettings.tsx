import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';

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

interface PageSection {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'gallery' | 'contact' | 'footer' | 'custom';
  visible: boolean;
  order: number;
  content: any;
}

interface AdminPanelSettingsProps {
  activeTab: string;
  siteSettings: SiteSettings;
  updateSetting: (key: keyof SiteSettings, value: any) => void;
  sections: PageSection[];
  toggleSection: (id: string) => void;
  analytics: {
    views: number;
    visitors: number;
    avgTime: string;
    bounceRate: number;
  };
  handleExport: (format: 'html' | 'zip' | 'github') => void;
}

export const AdminPanelSettings = ({ 
  activeTab, 
  siteSettings, 
  updateSetting, 
  sections, 
  toggleSection, 
  analytics, 
  handleExport 
}: AdminPanelSettingsProps) => {
  return (
    <>
      {activeTab === 'settings' && (
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
      )}

      {activeTab === 'design' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Дизайн и стили</h2>
          
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Цветовая схема</h3>
            <div className="space-y-4">
              <div>
                <Label>Основной цвет</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={siteSettings.primaryColor}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={siteSettings.primaryColor}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Вторичный цвет</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={siteSettings.secondaryColor}
                    onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={siteSettings.secondaryColor}
                    onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Акцентный цвет</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={siteSettings.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={siteSettings.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Типографика</h3>
            <div className="space-y-4">
              <div>
                <Label>Шрифт</Label>
                <Input
                  value={siteSettings.fontFamily}
                  onChange={(e) => updateSetting('fontFamily', e.target.value)}
                  placeholder="Inter, Arial, sans-serif"
                />
              </div>

              <div>
                <Label>Размер шрифта: {siteSettings.fontSize}px</Label>
                <Slider
                  value={[siteSettings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={12}
                  max={24}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Скругление углов: {siteSettings.borderRadius}px</Label>
                <Slider
                  value={[siteSettings.borderRadius]}
                  onValueChange={([value]) => updateSetting('borderRadius', value)}
                  min={0}
                  max={24}
                  step={2}
                  className="mt-2"
                />
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'sections' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Управление секциями</h2>
          
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Включайте и отключайте секции вашего сайта
            </p>
            
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      name={section.type === 'hero' ? 'Sparkles' : 
                            section.type === 'features' ? 'Grid' : 
                            section.type === 'gallery' ? 'Image' : 
                            section.type === 'contact' ? 'Mail' : 
                            section.type === 'footer' ? 'Layers' : 'Square'} 
                      size={20} 
                    />
                    <div>
                      <p className="font-medium">{section.name}</p>
                      <p className="text-sm text-muted-foreground">Порядок: {section.order}</p>
                    </div>
                  </div>
                  
                  <Switch
                    checked={section.visible}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {activeTab === 'seo' && (
        <>
          <h2 className="text-2xl font-bold mb-6">SEO настройки</h2>
          
          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={siteSettings.title}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  placeholder="Заголовок для поисковых систем"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Оптимально: 50-60 символов
                </p>
              </div>

              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={siteSettings.description}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  placeholder="Описание для поисковых систем"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Оптимально: 150-160 символов
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Open Graph</h3>
            <div className="space-y-4">
              <div>
                <Label>OG Title</Label>
                <Input
                  value={siteSettings.title}
                  onChange={(e) => updateSetting('title', e.target.value)}
                  placeholder="Заголовок для соцсетей"
                />
              </div>

              <div>
                <Label>OG Description</Label>
                <Textarea
                  value={siteSettings.description}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  placeholder="Описание для соцсетей"
                  rows={2}
                />
              </div>

              <div>
                <Label>OG Image</Label>
                <Input
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'analytics' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Аналитика</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Icon name="Eye" className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Просмотры</p>
                  <p className="text-2xl font-bold">{analytics.views.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Icon name="Users" className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Посетители</p>
                  <p className="text-2xl font-bold">{analytics.visitors.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Среднее время</p>
                  <p className="text-2xl font-bold">{analytics.avgTime}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingDown" className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Отказы</p>
                  <p className="text-2xl font-bold">{analytics.bounceRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              <Icon name="BarChart" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Подробная аналитика появится после публикации сайта</p>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'export' && (
        <>
          <h2 className="text-2xl font-bold mb-6">Экспорт проекта</h2>
          
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Icon name="FileCode" className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">HTML файл</h3>
                  <p className="text-sm text-muted-foreground">
                    Скачать готовый HTML файл вашего сайта
                  </p>
                </div>
              </div>
              <Button onClick={() => handleExport('html')} variant="outline" className="w-full">
                <Icon name="Download" className="mr-2" size={18} />
                Скачать HTML
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Icon name="Archive" className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">ZIP архив</h3>
                  <p className="text-sm text-muted-foreground">
                    Скачать полный проект в ZIP архиве
                  </p>
                </div>
              </div>
              <Button onClick={() => handleExport('zip')} variant="outline" className="w-full">
                <Icon name="Download" className="mr-2" size={18} />
                Скачать ZIP
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Icon name="Github" className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">GitHub</h3>
                  <p className="text-sm text-muted-foreground">
                    Экспортировать в GitHub репозиторий
                  </p>
                </div>
              </div>
              <Button onClick={() => handleExport('github')} variant="outline" className="w-full">
                <Icon name="Github" className="mr-2" size={18} />
                Экспорт в GitHub
              </Button>
            </Card>
          </div>
        </>
      )}

      {activeTab === 'ai' && (
        <>
          <h2 className="text-2xl font-bold mb-6">AI Настройки</h2>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Выбор AI провайдера</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Выберите модель искусственного интеллекта для генерации сайтов
            </p>

            <RadioGroup
              value={siteSettings.aiProvider}
              onValueChange={(value) => updateSetting('aiProvider', value as 'openai' | 'deepseek')}
              className="space-y-4"
            >
              <Card className={`p-4 cursor-pointer transition-all ${siteSettings.aiProvider === 'openai' ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="openai" id="openai" className="mt-1" />
                  <label htmlFor="openai" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Sparkles" size={20} className="text-primary" />
                      <h4 className="font-semibold">OpenAI GPT-4</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Продвинутая модель с высокой точностью и качеством генерации. 
                      Отлично подходит для сложных проектов и детальных требований.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Высокое качество</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Быстрая работа</span>
                    </div>
                  </label>
                </div>
              </Card>

              <Card className={`p-4 cursor-pointer transition-all ${siteSettings.aiProvider === 'deepseek' ? 'ring-2 ring-primary' : ''}`}>
                <div className="flex items-start gap-4">
                  <RadioGroupItem value="deepseek" id="deepseek" className="mt-1" />
                  <label htmlFor="deepseek" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Zap" size={20} className="text-purple-600" />
                      <h4 className="font-semibold">DeepSeek V3</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Экономичная модель с хорошим балансом качества и скорости.
                      Идеально для быстрых прототипов и стандартных задач.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Экономично</span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Хорошее качество</span>
                    </div>
                  </label>
                </div>
              </Card>
            </RadioGroup>
          </Card>
        </>
      )}
    </>
  );
};
