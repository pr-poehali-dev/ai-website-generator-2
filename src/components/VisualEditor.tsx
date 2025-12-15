import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface VisualEditorProps {
  initialCode: string;
  onClose: () => void;
  onSave: (code: string) => void;
}

interface Element {
  id: string;
  type: 'heading' | 'text' | 'button' | 'image' | 'container' | 'card';
  content: string;
  styles: {
    fontSize?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    width?: string;
  };
}

const VisualEditor = ({ initialCode, onClose, onSave }: VisualEditorProps) => {
  const [elements, setElements] = useState<Element[]>([
    {
      id: '1',
      type: 'heading',
      content: 'Заголовок сайта',
      styles: { fontSize: '48px', color: '#9b87f5', padding: '20px' }
    },
    {
      id: '2',
      type: 'text',
      content: 'Описание вашего сайта. Редактируйте элементы или добавляйте новые.',
      styles: { fontSize: '18px', color: '#666', padding: '10px' }
    }
  ]);
  
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [draggedElement, setDraggedElement] = useState<Element | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const addElement = (type: Element['type']) => {
    const newElement: Element = {
      id: Date.now().toString(),
      type,
      content: type === 'heading' ? 'Новый заголовок' :
               type === 'text' ? 'Новый текст' :
               type === 'button' ? 'Кнопка' :
               type === 'image' ? 'https://via.placeholder.com/400x300' :
               type === 'card' ? 'Содержимое карточки' :
               'Контейнер',
      styles: {
        fontSize: type === 'heading' ? '32px' : '16px',
        padding: '15px',
        margin: '10px',
        borderRadius: type === 'card' ? '12px' : '4px',
        backgroundColor: type === 'button' ? '#9b87f5' : 
                         type === 'card' ? '#ffffff' : 'transparent',
        color: type === 'button' ? '#ffffff' : '#333333'
      }
    };
    
    setElements([...elements, newElement]);
    toast.success(`Добавлен элемент: ${type}`);
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
    toast.success('Элемент удалён');
  };

  const handleDragStart = (element: Element) => {
    setDraggedElement(element);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedElement) return;

    const draggedIndex = elements.findIndex(el => el.id === draggedElement.id);
    const targetIndex = elements.findIndex(el => el.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newElements = [...elements];
    const [removed] = newElements.splice(draggedIndex, 1);
    newElements.splice(targetIndex, 0, removed);

    setElements(newElements);
    setDraggedElement(null);
  };

  const generateHTML = () => {
    const elementsHTML = elements.map(el => {
      const styleString = Object.entries(el.styles)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join('; ');

      if (el.type === 'heading') {
        return `<h1 style="${styleString}">${el.content}</h1>`;
      } else if (el.type === 'text') {
        return `<p style="${styleString}">${el.content}</p>`;
      } else if (el.type === 'button') {
        return `<button style="${styleString}">${el.content}</button>`;
      } else if (el.type === 'image') {
        return `<img src="${el.content}" style="${styleString}" alt="Image" />`;
      } else if (el.type === 'card') {
        return `<div style="border: 1px solid #e5e7eb; ${styleString}">${el.content}</div>`;
      } else {
        return `<div style="${styleString}">${el.content}</div>`;
      }
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Сгенерированный сайт</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #f5f3ff 0%, #fce7f3 50%, #dbeafe 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="container">
    ${elementsHTML}
  </div>
</body>
</html>`;
  };

  const handleSave = () => {
    const html = generateHTML();
    onSave(html);
    toast.success('Изменения сохранены!');
  };

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Icon name="Palette" className="text-primary" size={24} />
            <h2 className="text-2xl font-bold">Визуальный редактор</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Icon name="Monitor" size={16} />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <Icon name="Tablet" size={16} />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Icon name="Smartphone" size={16} />
              </Button>
            </div>
            
            <Button variant="outline" onClick={() => setShowCode(!showCode)}>
              <Icon name="Code2" className="mr-2" size={16} />
              {showCode ? 'Дизайн' : 'Код'}
            </Button>
            
            <Button onClick={handleSave} className="gradient-primary text-white">
              <Icon name="Save" className="mr-2" size={16} />
              Сохранить
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r overflow-y-auto p-4 bg-gray-50">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Icon name="Plus" size={18} />
              Добавить элементы
            </h3>
            
            <div className="space-y-2 mb-6">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addElement('heading')}
              >
                <Icon name="Heading" className="mr-2" size={16} />
                Заголовок
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addElement('text')}
              >
                <Icon name="Type" className="mr-2" size={16} />
                Текст
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addElement('button')}
              >
                <Icon name="Square" className="mr-2" size={16} />
                Кнопка
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addElement('image')}
              >
                <Icon name="Image" className="mr-2" size={16} />
                Изображение
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addElement('card')}
              >
                <Icon name="Square" className="mr-2" size={16} />
                Карточка
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addElement('container')}
              >
                <Icon name="Layout" className="mr-2" size={16} />
                Контейнер
              </Button>
            </div>

            {selectedElement && (
              <>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Icon name="Settings" size={18} />
                  Свойства
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Содержимое</Label>
                    <Textarea
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Размер шрифта</Label>
                    <Input
                      value={selectedElement.styles.fontSize || '16px'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, fontSize: e.target.value }
                      })}
                      className="mt-1"
                      placeholder="16px"
                    />
                  </div>

                  <div>
                    <Label>Цвет текста</Label>
                    <Input
                      type="color"
                      value={selectedElement.styles.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, color: e.target.value }
                      })}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label>Фон</Label>
                    <Input
                      type="color"
                      value={selectedElement.styles.backgroundColor || '#ffffff'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, backgroundColor: e.target.value }
                      })}
                      className="mt-1 h-10"
                    />
                  </div>

                  <div>
                    <Label>Отступы (padding)</Label>
                    <Input
                      value={selectedElement.styles.padding || '10px'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, padding: e.target.value }
                      })}
                      className="mt-1"
                      placeholder="10px"
                    />
                  </div>

                  <div>
                    <Label>Радиус границ</Label>
                    <Input
                      value={selectedElement.styles.borderRadius || '4px'}
                      onChange={(e) => updateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, borderRadius: e.target.value }
                      })}
                      className="mt-1"
                      placeholder="4px"
                    />
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => deleteElement(selectedElement.id)}
                  >
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Удалить элемент
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-hidden bg-gray-100">
            {showCode ? (
              <div className="h-full overflow-auto p-6 bg-gray-900">
                <pre className="text-sm text-green-400 font-mono">
                  <code>{generateHTML()}</code>
                </pre>
              </div>
            ) : (
              <div className="h-full overflow-auto p-8 flex justify-center">
                <div
                  ref={canvasRef}
                  style={{
                    width: viewportWidths[viewMode],
                    maxWidth: '100%',
                    transition: 'width 0.3s ease'
                  }}
                  className="bg-white rounded-lg shadow-2xl min-h-full p-6"
                >
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={() => handleDragStart(element)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, element.id)}
                      onClick={() => setSelectedElement(element)}
                      className={`relative group cursor-move transition-all ${
                        selectedElement?.id === element.id ? 'ring-2 ring-primary' : ''
                      } hover:ring-2 hover:ring-primary/50`}
                      style={element.styles}
                    >
                      {element.type === 'image' ? (
                        <img src={element.content} alt="Element" className="max-w-full" />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: element.content }} />
                      )}
                      
                      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(element.id);
                          }}
                        >
                          <Icon name="X" size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VisualEditor;