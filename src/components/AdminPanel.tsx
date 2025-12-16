import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

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

  const [analytics, setAnalytics] = useState({
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

      <div className="flex-1 bg-gray-50 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-8 max-w-4xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Обзор проекта</h3>
                  <p className="text-muted-foreground">Основная информация и быстрые действия</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name="Eye" className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Статус</p>
                        <p className="text-xl font-bold">
                          {project?.status === 'published' ? '🌐 Опубликован' : '📝 Черновик'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon name="Clock" className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Обновлено</p>
                        <p className="text-xl font-bold">
                          {project?.updated_at ? new Date(project.updated_at).toLocaleDateString('ru-RU') : 'Сегодня'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h4 className="font-bold mb-4">Быстрые действия</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handlePublish} className="gradient-primary text-white">
                      <Icon name="Globe" className="mr-2" size={18} />
                      Опубликовать
                    </Button>
                    <Button variant="outline">
                      <Icon name="Eye" className="mr-2" size={18} />
                      Предпросмотр
                    </Button>
                    <Button variant="outline">
                      <Icon name="Copy" className="mr-2" size={18} />
                      Дублировать
                    </Button>
                    <Button variant="outline">
                      <Icon name="Share2" className="mr-2" size={18} />
                      Поделиться
                    </Button>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-bold mb-4">Информация о проекте</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID проекта:</span>
                      <span className="font-mono">{project?.id || 'N/A'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Создан:</span>
                      <span>
                        {project?.created_at ? new Date(project.created_at).toLocaleString('ru-RU') : 'N/A'}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Размер кода:</span>
                      <span>{project?.current_code ? `${(project.current_code.length / 1024).toFixed(1)} KB` : 'N/A'}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Основные настройки</h3>
                  <p className="text-muted-foreground">Название, описание и метаданные сайта</p>
                </div>

                <Card className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="site-title">Название сайта</Label>
                    <Input
                      id="site-title"
                      value={siteSettings.title}
                      onChange={(e) => updateSetting('title', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="site-description">Описание</Label>
                    <Textarea
                      id="site-description"
                      value={siteSettings.description}
                      onChange={(e) => updateSetting('description', e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="site-favicon">Favicon URL</Label>
                    <Input
                      id="site-favicon"
                      value={siteSettings.favicon}
                      onChange={(e) => updateSetting('favicon', e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                      className="mt-1"
                    />
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <h4 className="font-bold">Дополнительные параметры</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Анимации</Label>
                      <p className="text-sm text-muted-foreground">Включить плавные переходы</p>
                    </div>
                    <Switch
                      checked={siteSettings.animations}
                      onCheckedChange={(checked) => updateSetting('animations', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Темная тема</Label>
                      <p className="text-sm text-muted-foreground">Поддержка темного режима</p>
                    </div>
                    <Switch
                      checked={siteSettings.darkMode}
                      onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                    />
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Дизайн и стили</h3>
                  <p className="text-muted-foreground">Настройте внешний вид сайта</p>
                </div>

                <Card className="p-6 space-y-6">
                  <div>
                    <h4 className="font-bold mb-4">Цветовая схема</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Основной цвет</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={siteSettings.primaryColor}
                            onChange={(e) => updateSetting('primaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={siteSettings.primaryColor}
                            onChange={(e) => updateSetting('primaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Второстепенный</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={siteSettings.secondaryColor}
                            onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={siteSettings.secondaryColor}
                            onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Акцентный</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={siteSettings.accentColor}
                            onChange={(e) => updateSetting('accentColor', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={siteSettings.accentColor}
                            onChange={(e) => updateSetting('accentColor', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-bold mb-4">Типографика</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Шрифт</Label>
                        <select
                          value={siteSettings.fontFamily}
                          onChange={(e) => updateSetting('fontFamily', e.target.value)}
                          className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Lato">Lato</option>
                        </select>
                      </div>

                      <div>
                        <Label>Базовый размер шрифта: {siteSettings.fontSize}px</Label>
                        <Slider
                          value={[siteSettings.fontSize]}
                          onValueChange={([value]) => updateSetting('fontSize', value)}
                          min={12}
                          max={24}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-bold mb-4">Радиус границ</h4>
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
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Управление секциями</h3>
                  <p className="text-muted-foreground">Настройте видимость и порядок блоков</p>
                </div>

                <Card className="p-6">
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon name="GripVertical" className="text-muted-foreground cursor-move" size={20} />
                          <div>
                            <p className="font-medium">{section.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{section.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={section.visible}
                            onCheckedChange={() => toggleSection(section.id)}
                          />
                          <Button variant="ghost" size="icon">
                            <Icon name="Settings" size={18} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-4">
                    <Icon name="Plus" className="mr-2" size={18} />
                    Добавить секцию
                  </Button>
                </Card>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">SEO оптимизация</h3>
                  <p className="text-muted-foreground">Настройте метаданные для поисковых систем</p>
                </div>

                <Card className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="meta-title">Meta Title</Label>
                    <Input
                      id="meta-title"
                      value={siteSettings.title}
                      onChange={(e) => updateSetting('title', e.target.value)}
                      className="mt-1"
                      placeholder="Оптимальная длина 50-60 символов"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {siteSettings.title.length}/60 символов
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta-description">Meta Description</Label>
                    <Textarea
                      id="meta-description"
                      value={siteSettings.description}
                      onChange={(e) => updateSetting('description', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Оптимальная длина 150-160 символов"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {siteSettings.description.length}/160 символов
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta-keywords">Ключевые слова</Label>
                    <Input
                      id="meta-keywords"
                      placeholder="веб-дизайн, разработка, AI"
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="og-image">Open Graph изображение</Label>
                    <Input
                      id="og-image"
                      placeholder="https://example.com/og-image.jpg"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Рекомендуемый размер: 1200x630px
                    </p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h4 className="font-bold mb-4">SEO чек-лист</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="Check" className="text-green-600" size={14} />
                      </div>
                      <span className="text-sm">Meta title заполнен</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="Check" className="text-green-600" size={14} />
                      </div>
                      <span className="text-sm">Meta description заполнен</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Icon name="AlertCircle" className="text-yellow-600" size={14} />
                      </div>
                      <span className="text-sm">Добавьте Open Graph изображение</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Аналитика</h3>
                  <p className="text-muted-foreground">Статистика посещений и активности</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="Eye" className="text-blue-600" size={20} />
                      <span className="text-sm text-muted-foreground">Просмотры</span>
                    </div>
                    <p className="text-3xl font-bold">{analytics.views.toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1">↗ +12.5% за неделю</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="Users" className="text-purple-600" size={20} />
                      <span className="text-sm text-muted-foreground">Посетители</span>
                    </div>
                    <p className="text-3xl font-bold">{analytics.visitors.toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1">↗ +8.3% за неделю</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="Clock" className="text-orange-600" size={20} />
                      <span className="text-sm text-muted-foreground">Среднее время</span>
                    </div>
                    <p className="text-3xl font-bold">{analytics.avgTime}</p>
                    <p className="text-sm text-green-600 mt-1">↗ +15 сек за неделю</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="TrendingDown" className="text-red-600" size={20} />
                      <span className="text-sm text-muted-foreground">Показатель отказов</span>
                    </div>
                    <p className="text-3xl font-bold">{analytics.bounceRate}%</p>
                    <p className="text-sm text-green-600 mt-1">↘ -2.1% за неделю</p>
                  </Card>
                </div>

                <Card className="p-6">
                  <h4 className="font-bold mb-4">График посещений</h4>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[45, 52, 38, 65, 72, 58, 80].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">AI Настройки</h3>
                  <p className="text-muted-foreground">Выберите AI-провайдера для генерации кода</p>
                </div>

                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold">Выбор AI-провайдера</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Выберите, какую модель использовать для генерации кода сайтов
                      </p>
                      
                      <div className="space-y-3">
                        <div 
                          onClick={() => updateSetting('aiProvider', 'deepseek')}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            siteSettings.aiProvider === 'deepseek' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                              siteSettings.aiProvider === 'deepseek'
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}>
                              {siteSettings.aiProvider === 'deepseek' && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base">DeepSeek V3</div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Современная модель от DeepSeek. Быстрая и эффективная для веб-разработки.
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Быстрая</span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Экономичная</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div 
                          onClick={() => updateSetting('aiProvider', 'openai')}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            siteSettings.aiProvider === 'openai' 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 mt-0.5 ${
                              siteSettings.aiProvider === 'openai'
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}>
                              {siteSettings.aiProvider === 'openai' && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-base">OpenAI GPT-4</div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Проверенная модель от OpenAI. Высокое качество генерации кода.
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Мощная</span>
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">Популярная</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <Icon name="Info" className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 mb-1">Информация о настройке</p>
                          <p className="text-blue-700">
                            Для работы выбранного провайдера необходим соответствующий API-ключ.
                            {siteSettings.aiProvider === 'deepseek' 
                              ? ' Убедитесь, что добавлен DEEPSEEK_API_KEY в секретах проекта.'
                              : ' Убедитесь, что добавлен OPENAI_API_KEY в секретах проекта.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Экспорт проекта</h3>
                  <p className="text-muted-foreground">Скачайте или интегрируйте с платформами</p>
                </div>

                <div className="grid gap-4">
                  <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => handleExport('html')}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon name="FileCode" className="text-blue-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">Скачать HTML</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Единый HTML файл с встроенными стилями
                        </p>
                        <Button size="sm">
                          <Icon name="Download" className="mr-2" size={16} />
                          Скачать HTML
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => handleExport('zip')}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon name="FolderArchive" className="text-purple-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">Скачать ZIP архив</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Полный проект с разделенными файлами HTML, CSS, JS
                        </p>
                        <Button size="sm" variant="outline">
                          <Icon name="Download" className="mr-2" size={16} />
                          Скачать ZIP
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => handleExport('github')}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon name="Github" className="text-gray-800" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">Отправить в GitHub</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Создать репозиторий и отправить код в GitHub
                        </p>
                        <Button size="sm" variant="outline">
                          <Icon name="Github" className="mr-2" size={16} />
                          Подключить GitHub
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon name="Server" className="text-green-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">Опубликовать на хостинге</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Разместите сайт на нашем хостинге с бесплатным SSL
                        </p>
                        <Button size="sm" onClick={handlePublish} className="gradient-primary text-white">
                          <Icon name="Globe" className="mr-2" size={16} />
                          Опубликовать
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminPanel;