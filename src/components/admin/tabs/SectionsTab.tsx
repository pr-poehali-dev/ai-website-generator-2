import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface PageSection {
  id: string;
  name: string;
  type: 'hero' | 'features' | 'gallery' | 'contact' | 'footer' | 'custom';
  visible: boolean;
  order: number;
  content: any;
}

interface SectionsTabProps {
  sections: PageSection[];
  toggleSection: (id: string) => void;
}

export const SectionsTab = ({ sections, toggleSection }: SectionsTabProps) => {
  return (
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
  );
};
