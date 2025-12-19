import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';

interface SiteSettings {
  title: string;
  description: string;
  aiProvider: 'openai' | 'deepseek';
}

interface OtherTabsProps {
  activeTab: string;
  siteSettings: SiteSettings;
  updateSetting: (key: keyof SiteSettings, value: any) => void;
  analytics: {
    views: number;
    visitors: number;
    avgTime: string;
    bounceRate: number;
  };
  handleExport: (format: 'html' | 'zip' | 'github') => void;
}

export const OtherTabs = ({ 
  activeTab, 
  siteSettings, 
  updateSetting, 
  analytics, 
  handleExport 
}: OtherTabsProps) => {
  return (
    <>
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
