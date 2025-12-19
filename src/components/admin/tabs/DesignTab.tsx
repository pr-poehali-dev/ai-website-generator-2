import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
}

interface DesignTabProps {
  siteSettings: SiteSettings;
  updateSetting: (key: keyof SiteSettings, value: any) => void;
}

export const DesignTab = ({ siteSettings, updateSetting }: DesignTabProps) => {
  return (
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
  );
};
