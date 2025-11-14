import en from './en.json';
import fr from './fr.json';

export const translations = { en, fr };

export type Language = 'en' | 'fr';

export function getTranslation(lang: Language, path: string): string {
	const keys = path.split('.');
	let value: any = translations[lang];

	for (const key of keys) {
		value = value?.[key];
	}

	return value || path;
}