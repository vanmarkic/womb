/**
 * Settings Management Module
 * Handles slider settings persistence with local storage
 *
 * BASELINE PARAMETERS:
 * - Audio: intervals 25s-40s (slider 0 = baseline, 1 = 3x more frequent)
 * - Visual: durations 12s-20s (slider 0 = baseline, 1 = 15s max, 3x faster fade-in, 5s fade-out)
 */

export interface Settings {
	audioFrequency: number;  // 0-1: controls sound trigger frequency
	visualIntensity: number; // 0-1: controls shape animation parameters
}

const DEFAULT_SETTINGS: Settings = {
	audioFrequency: 0.5,
	visualIntensity: 0.5,
};

const STORAGE_KEY = 'womb_settings';

/**
 * Load settings from local storage with fallback to defaults
 */
export function loadSettings(): Settings {
	try {
		// Guard against SSR/non-browser environments
		if (typeof localStorage === 'undefined') {
			return { ...DEFAULT_SETTINGS };
		}
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				audioFrequency: Math.max(0, Math.min(1, parsed.audioFrequency ?? DEFAULT_SETTINGS.audioFrequency)),
				visualIntensity: Math.max(0, Math.min(1, parsed.visualIntensity ?? DEFAULT_SETTINGS.visualIntensity)),
			};
		}
	} catch (e) {
		console.warn('Failed to load settings from storage', e);
	}
	return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to local storage
 */
export function saveSettings(settings: Settings): void {
	try {
		// Guard against SSR/non-browser environments
		if (typeof localStorage === 'undefined') {
			return;
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch (e) {
		console.warn('Failed to save settings to storage', e);
	}
}

/**
 * Calculate audio interval multiplier from slider value
 * 0 = baseline, 1 = 3x more frequent
 * Range: 0.3 (slowest) to 1.5 (fastest)
 */
export function getAudioFrequencyMultiplier(sliderValue: number): number {
	// Map 0-1 slider to 1.5-0.3 multiplier (inverted: higher slider = faster sounds)
	const normalized = Math.max(0, Math.min(1, sliderValue));
	return 1.5 - normalized * 1.2; // At 0: 1.5x slower, at 1: 0.3x slower (3.3x faster)
}

/**
 * Calculate visual parameters from slider value
 * slider: 0 = baseline, 1 = max effect
 */
export function getVisualParameters(sliderValue: number, baselineDuration: number, baselineFadeIn: number, baselineFadeOut: number) {
	const s = Math.max(0, Math.min(1, sliderValue));

	const duration = baselineDuration + (15000 - baselineDuration) * s;
	const fadeIn = baselineFadeIn / (1 + 2 * s);
	const fadeOut = 5000 + (baselineFadeOut - 5000) * (1 - s);

	return { duration, fadeIn, fadeOut };
}

/**
 * Create a CSS animation string for a background figure
 * Used to dynamically generate animations based on slider values
 */
export function createFigureAnimation(
	figureIndex: number,
	duration: number,
	fadeIn: number,
	fadeOut: number,
	delay: number
): string {
	const peakStart = fadeIn / duration;
	const peakEnd = 1 - (fadeOut / duration);

	return `
		@keyframes figure-${figureIndex}-animate {
			0% {
				opacity: 0;
				transform: translate(0, 0) scale(0.95);
			}
			${(peakStart * 100).toFixed(2)}% {
				opacity: 0.6;
				transform: translate(${20 - 40 * Math.random()}px, ${25 - 50 * Math.random()}px) scale(1.05);
			}
			${(peakEnd * 100).toFixed(2)}% {
				opacity: 0.6;
				transform: translate(${20 - 40 * Math.random()}px, ${25 - 50 * Math.random()}px) scale(1.05);
			}
			100% {
				opacity: 0;
				transform: translate(0, 0) scale(0.95);
			}
		}

		#figure-${figureIndex} {
			animation: figure-${figureIndex}-animate ${duration}ms ease-in-out ${delay}ms infinite !important;
		}
	`;
}
