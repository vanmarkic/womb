import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Settings, loadSettings, saveSettings } from '../scripts/settings';
import './VerticalSliders.css';

interface VerticalSlidersProps {
	onSettingsChange?: (settings: Settings) => void;
}

export default function VerticalSliders({ onSettingsChange }: VerticalSlidersProps) {
	// Only load settings on client-side, not during SSR
	const [settings, setSettings] = useState<Settings>(() => {
		if (typeof window === 'undefined') {
			return { audioFrequency: 0.5, visualIntensity: 0.5 };
		}
		return loadSettings();
	});
	const [isMinimized, setIsMinimized] = useState(false);

	useEffect(() => {
		saveSettings(settings);
		onSettingsChange?.(settings);

		// Dispatch custom event for BaseLayout to listen to
		const event = new CustomEvent('settings-changed', {
			detail: settings,
			bubbles: true,
		});
		window.dispatchEvent(event);
	}, [settings, onSettingsChange]);

	const handleAudioChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const value = parseFloat(target.value);
		setSettings(prev => ({ ...prev, audioFrequency: value }));
	};

	const handleVisualChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const value = parseFloat(target.value);
		setSettings(prev => ({ ...prev, visualIntensity: value }));
	};

	const audioPercentage = Math.round(settings.audioFrequency * 100);
	const visualPercentage = Math.round(settings.visualIntensity * 100);

	return (
		<div class={`vertical-sliders ${isMinimized ? 'minimized' : ''}`} data-testid="vertical-sliders">
			<button
				class="slider-toggle"
				onClick={() => setIsMinimized(!isMinimized)}
				aria-label="Toggle sliders panel"
				title={isMinimized ? 'Expand' : 'Minimize'}
			>
				⚙
			</button>

			{!isMinimized && (
				<div class="sliders-panel">
					<div class="slider-group">
						<label htmlFor="audio-slider" class="slider-label">
							<span class="slider-icon">🔊</span>
							<span class="slider-title">Audio</span>
						</label>
						<input
							id="audio-slider"
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={settings.audioFrequency}
							onChange={handleAudioChange}
							class="slider-input"
							data-testid="audio-slider"
						/>
						<span class="slider-value">{audioPercentage}%</span>
					</div>

					<div class="slider-group">
						<label htmlFor="visual-slider" class="slider-label">
							<span class="slider-icon">✨</span>
							<span class="slider-title">Visual</span>
						</label>
						<input
							id="visual-slider"
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={settings.visualIntensity}
							onChange={handleVisualChange}
							class="slider-input"
							data-testid="visual-slider"
						/>
						<span class="slider-value">{visualPercentage}%</span>
					</div>
				</div>
			)}
		</div>
	);
}
