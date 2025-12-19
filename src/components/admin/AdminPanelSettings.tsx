import { SettingsTab } from './tabs/SettingsTab';
import { DesignTab } from './tabs/DesignTab';
import { SectionsTab } from './tabs/SectionsTab';
import { OtherTabs } from './tabs/OtherTabs';

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
        <SettingsTab
          siteSettings={siteSettings}
          updateSetting={updateSetting}
        />
      )}

      {activeTab === 'design' && (
        <DesignTab
          siteSettings={siteSettings}
          updateSetting={updateSetting}
        />
      )}

      {activeTab === 'sections' && (
        <SectionsTab
          sections={sections}
          toggleSection={toggleSection}
        />
      )}

      {(activeTab === 'seo' || activeTab === 'analytics' || activeTab === 'export' || activeTab === 'ai') && (
        <OtherTabs
          activeTab={activeTab}
          siteSettings={siteSettings}
          updateSetting={updateSetting}
          analytics={analytics}
          handleExport={handleExport}
        />
      )}
    </>
  );
};
