// @/components/settings/index.ts

/**
 * Composant principal de la vue Settings
 */
export { SettingsView } from './SettingsView';

/**
 * Sous-composants spécifiques (si vous décidez de les séparer dans des fichiers distincts plus tard)
 */
export { ProfileSettings } from './ProfileSetting';
export { SecuritySettings } from './SecuritySetting';
export { FeesSettings } from './FeesSettings';

/**
 * Si vous avez un composant AdminManagement dans le même dossier
 */
export { default as AdminManagement } from './AdminManagement';

