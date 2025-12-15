import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const BACKEND_URL = 'https://functions.poehali.dev/624157f9-f3b7-442a-a963-2794f8de10bc';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCodeView, setShowCodeView] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Введите описание сайта');
      return;
    }

    setIsGenerating(true);
    setGeneratedCode(null);
    setShowCodeView(false);
    toast.info('🤖 ИИ генерирует ваш сайт...');

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      setGeneratedPreview(prompt);
      setGeneratedCode(data.code);
      toast.success('✨ Сайт успешно создан!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при генерации сайта');
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = [
    {
      id: 1,
      name: 'Лендинг для кофейни',
      category: 'Бизнес',
      preview: '☕',
      color: 'from-amber-400 to-orange-600'
    },
    {
      id: 2,
      name: 'Портфолио дизайнера',
      category: 'Креатив',
      preview: '🎨',
      color: 'from-purple-400 to-pink-600'
    },
    {
      id: 3,
      name: 'SaaS продукт',
      category: 'Технологии',
      preview: '🚀',
      color: 'from-blue-400 to-cyan-600'
    },
    {
      id: 4,
      name: 'Интернет-магазин',
      category: 'E-commerce',
      preview: '🛍️',
      color: 'from-green-400 to-emerald-600'
    }
  ];

  const projects = [
    {
      id: 1,
      name: 'Coffee House Landing',
      description: 'Лендинг для премиальной кофейни',
      date: '2 часа назад',
      status: 'published'
    },
    {
      id: 2,
      name: 'Portfolio Website',
      description: 'Креативное портфолио для дизайнера',
      date: '1 день назад',
      status: 'draft'
    },
    {
      id: 3,
      name: 'SaaS Dashboard',
      description: 'Админ-панель для SaaS платформы',
      date: '3 дня назад',
      status: 'published'
    }
  ];

  const features = [
    {
      icon: 'Sparkles',
      title: 'ИИ-генерация',
      description: 'Создавайте сайты из текстового описания за секунды'
    },
    {
      icon: 'Code2',
      title: 'Чистый код',
      description: 'Получайте готовый HTML, CSS и JavaScript код'
    },
    {
      icon: 'Layout',
      title: 'Визуальный редактор',
      description: 'Редактируйте сайт в режиме реального времени'
    },
    {
      icon: 'Zap',
      title: 'Быстрый экспорт',
      description: 'Скачивайте проект или публикуйте мгновенно'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <nav className="glass-effect sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center animate-pulse-slow">
                <Icon name="Sparkles" className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold gradient-text">AI Site Builder</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {['home', 'editor', 'projects', 'templates', 'profile', 'support'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`text-sm font-medium transition-all capitalize ${
                    activeSection === section
                      ? 'text-primary scale-105'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section === 'home' ? 'Главная' : 
                   section === 'editor' ? 'Редактор' :
                   section === 'projects' ? 'Проекты' :
                   section === 'templates' ? 'Шаблоны' :
                   section === 'profile' ? 'Профиль' : 'Поддержка'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Icon name="Bell" size={20} />
              </Button>
              <Button className="gradient-primary text-white font-medium hover:opacity-90 transition-opacity">
                Войти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {activeSection === 'home' && (
        <main className="container mx-auto px-4 py-16">
          <section className="text-center mb-20 animate-fade-in">
            <Badge className="mb-6 px-4 py-2 text-sm gradient-primary text-white">
              <Icon name="Zap" size={16} className="mr-2" />
              Создавайте сайты с помощью ИИ
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text leading-tight">
              Сайт мечты
              <br />
              за минуты
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Опишите свою идею — искусственный интеллект создаст полноценный сайт
              с кодом, дизайном и анимациями
            </p>

            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary blur-xl opacity-30 animate-pulse-slow"></div>
                <div className="relative glass-effect rounded-2xl p-6 shadow-2xl">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Опишите свой сайт: «Лендинг для IT-стартапа с анимациями»"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        className="h-14 text-lg border-0 bg-white/50 focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="h-14 px-8 gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-opacity"
                    >
                      {isGenerating ? (
                        <>
                          <Icon name="Loader2" className="mr-2 animate-spin" size={20} />
                          Создаю...
                        </>
                      ) : (
                        <>
                          <Icon name="Sparkles" className="mr-2" size={20} />
                          Создать сайт
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {generatedPreview && (
              <div className="max-w-5xl mx-auto animate-scale-in">
                <Card className="glass-effect p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">✨ Ваш сайт готов!</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowCodeView(!showCodeView)}
                      >
                        <Icon name={showCodeView ? "Eye" : "Code2"} className="mr-2" size={16} />
                        {showCodeView ? 'Превью' : 'Код'}
                      </Button>
                      <Button 
                        className="gradient-primary text-white" 
                        size="sm"
                        onClick={() => {
                          if (generatedCode) {
                            const blob = new Blob([generatedCode], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'website.html';
                            a.click();
                            toast.success('Сайт скачан!');
                          }
                        }}
                        disabled={!generatedCode}
                      >
                        <Icon name="Download" className="mr-2" size={16} />
                        Скачать HTML
                      </Button>
                    </div>
                  </div>
                  
                  {showCodeView ? (
                    <div className="bg-gray-900 rounded-xl p-6 overflow-auto max-h-[500px]">
                      <pre className="text-sm text-green-400 font-mono">
                        <code>{generatedCode || 'Загрузка кода...'}</code>
                      </pre>
                    </div>
                  ) : (
                    <>
                      {generatedCode ? (
                        <div className="bg-white rounded-xl border-2 border-purple-200 overflow-hidden">
                          <iframe
                            srcDoc={generatedCode}
                            className="w-full h-[600px] border-0"
                            title="Generated Website Preview"
                            sandbox="allow-scripts"
                          />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-12 border-2 border-dashed border-purple-300">
                          <div className="text-center space-y-4">
                            <Icon name="FileCode" size={64} className="mx-auto text-primary" />
                            <p className="text-lg font-medium text-muted-foreground">
                              Сгенерирован сайт: <span className="font-bold text-foreground">«{generatedPreview}»</span>
                            </p>
                            <div className="flex gap-2 justify-center flex-wrap">
                              <Badge>HTML</Badge>
                              <Badge>CSS</Badge>
                              <Badge>Tailwind</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </Card>
              </div>
            )}
          </section>

          <section className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">Возможности платформы</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="glass-effect p-6 hover:scale-105 transition-transform cursor-pointer group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:animate-pulse-slow">
                    <Icon name={feature.icon as any} className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Начните с шаблона</h2>
              <p className="text-lg text-muted-foreground">
                Или выберите готовый шаблон и доработайте под себя
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template, index) => (
                <Card
                  key={template.id}
                  className="group overflow-hidden hover:scale-105 transition-all cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`h-48 bg-gradient-to-br ${template.color} flex items-center justify-center text-8xl group-hover:scale-110 transition-transform`}>
                    {template.preview}
                  </div>
                  <div className="p-5">
                    <Badge className="mb-3">{template.category}</Badge>
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    <Button className="w-full gradient-primary text-white mt-3">
                      Использовать
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </main>
      )}

      {activeSection === 'projects' && (
        <main className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Мои проекты</h1>
              <p className="text-muted-foreground">Управляйте своими сайтами</p>
            </div>
            <Button className="gradient-primary text-white font-medium">
              <Icon name="Plus" className="mr-2" size={20} />
              Новый проект
            </Button>
          </div>

          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="glass-effect p-6 hover:scale-[1.02] transition-transform cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                      {project.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                      {project.status === 'published' ? '🌐 Опубликован' : '📝 Черновик'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Icon name="MoreVertical" size={20} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      )}

      {activeSection === 'templates' && (
        <main className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Библиотека шаблонов</h1>
            <p className="text-lg text-muted-foreground">
              Профессиональные шаблоны для быстрого старта
            </p>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="glass-effect">
              <TabsTrigger value="all">Все шаблоны</TabsTrigger>
              <TabsTrigger value="business">Бизнес</TabsTrigger>
              <TabsTrigger value="creative">Креатив</TabsTrigger>
              <TabsTrigger value="tech">Технологии</TabsTrigger>
              <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <Card
                key={template.id}
                className="group overflow-hidden hover:scale-105 transition-all cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-56 bg-gradient-to-br ${template.color} flex items-center justify-center text-9xl group-hover:scale-110 transition-transform`}>
                  {template.preview}
                </div>
                <div className="p-5">
                  <Badge className="mb-3">{template.category}</Badge>
                  <h3 className="font-bold text-lg mb-3">{template.name}</h3>
                  <div className="flex gap-2">
                    <Button className="flex-1 gradient-primary text-white">
                      Использовать
                    </Button>
                    <Button variant="outline" size="icon">
                      <Icon name="Eye" size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      )}

      {activeSection === 'profile' && (
        <main className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-effect p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  AI
                </div>
                <h2 className="text-2xl font-bold mb-2">AI Builder User</h2>
                <p className="text-muted-foreground">ai.builder@example.com</p>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-4">Статистика</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 glass-effect rounded-xl">
                      <div className="text-3xl font-bold gradient-text">12</div>
                      <div className="text-sm text-muted-foreground mt-1">Проектов</div>
                    </div>
                    <div className="text-center p-4 glass-effect rounded-xl">
                      <div className="text-3xl font-bold gradient-text">47</div>
                      <div className="text-sm text-muted-foreground mt-1">Генераций</div>
                    </div>
                    <div className="text-center p-4 glass-effect rounded-xl">
                      <div className="text-3xl font-bold gradient-text">5</div>
                      <div className="text-sm text-muted-foreground mt-1">Опубликовано</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-4">Настройки аккаунта</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="User" className="mr-3" size={20} />
                      Редактировать профиль
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="CreditCard" className="mr-3" size={20} />
                      Подписка и платежи
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Icon name="Settings" className="mr-3" size={20} />
                      Настройки
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      )}

      {activeSection === 'support' && (
        <main className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center">
            <Icon name="Headphones" size={64} className="mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Центр поддержки</h1>
            <p className="text-lg text-muted-foreground mb-12">
              Мы здесь, чтобы помочь вам создавать лучшие сайты
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="glass-effect p-6 hover:scale-105 transition-transform cursor-pointer">
                <Icon name="BookOpen" className="mx-auto mb-4 text-primary" size={40} />
                <h3 className="font-bold mb-2">Документация</h3>
                <p className="text-sm text-muted-foreground">Гайды и туториалы</p>
              </Card>
              <Card className="glass-effect p-6 hover:scale-105 transition-transform cursor-pointer">
                <Icon name="MessageCircle" className="mx-auto mb-4 text-primary" size={40} />
                <h3 className="font-bold mb-2">Чат поддержки</h3>
                <p className="text-sm text-muted-foreground">Онлайн-консультация</p>
              </Card>
              <Card className="glass-effect p-6 hover:scale-105 transition-transform cursor-pointer">
                <Icon name="Mail" className="mx-auto mb-4 text-primary" size={40} />
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-sm text-muted-foreground">support@aibuilder.dev</p>
              </Card>
            </div>

            <Card className="glass-effect p-8">
              <h3 className="text-xl font-bold mb-6">Часто задаваемые вопросы</h3>
              <div className="space-y-4 text-left">
                <div className="p-4 bg-white/50 rounded-xl">
                  <h4 className="font-bold mb-2">Как работает AI-генерация?</h4>
                  <p className="text-sm text-muted-foreground">
                    Наш ИИ анализирует ваше описание и создает структуру сайта, подбирает дизайн и генерирует чистый код.
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <h4 className="font-bold mb-2">Могу ли я редактировать код?</h4>
                  <p className="text-sm text-muted-foreground">
                    Да! Вы получаете полный доступ к HTML, CSS и JavaScript коду с возможностью ручного редактирования.
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <h4 className="font-bold mb-2">Как экспортировать проект?</h4>
                  <p className="text-sm text-muted-foreground">
                    Скачайте ZIP-архив, отправьте в GitHub или опубликуйте на нашем хостинге одним кликом.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      )}

      <footer className="glass-effect border-t border-white/20 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Icon name="Sparkles" className="text-white" size={18} />
                </div>
                <span className="font-bold text-lg">AI Site Builder</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Создавайте сайты будущего с помощью искусственного интеллекта
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Продукт</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Возможности</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Шаблоны</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Цены</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Ресурсы</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Документация</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Блог</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Сообщество</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Changelog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Компания</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">О нас</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Карьера</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Контакты</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Партнеры</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 AI Site Builder. Все права защищены.
            </p>
            <div className="flex gap-4">
              <Icon name="Github" className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" size={20} />
              <Icon name="Twitter" className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" size={20} />
              <Icon name="Linkedin" className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" size={20} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;