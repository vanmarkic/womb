import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
	audioUrl: string;
	title: string;
	onEnded?: () => void;
	autoPlay?: boolean;
	playlistIndex?: number;
	qualityLevels?: {
		high?: string;  // Original WAV quality
		medium?: string; // 320kbps MP3
		low?: string;    // 128kbps MP3
	};
}

export default function AudioPlayer({ audioUrl, title, onEnded, autoPlay = false, playlistIndex, qualityLevels }: Props) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoading, setIsLoading] = useState(false); // Start with false since we lazy load
	const [currentQuality, setCurrentQuality] = useState<'high' | 'medium' | 'low'>('low'); // Default to 128k
	const [showQualityMenu, setShowQualityMenu] = useState(false);
	const [isInFadeOut, setIsInFadeOut] = useState(false);
	const originalVolumeRef = useRef<number>(1.0); // Store original volume
	const fadeOutDuration = 10; // 10 seconds fade out

	// Prevent right-click on player
	const handleContextMenu = (e: Event) => {
		e.preventDefault();
		return false;
	};

	// Track if audio source has been initialized
	const [audioInitialized, setAudioInitialized] = useState(false);

	// Handle fade-out effect
	useEffect(() => {
		if (!audioRef.current || !duration || !isPlaying) return;

		const timeUntilEnd = duration - currentTime;

		// Check if we should start or stop fade-out
		if (timeUntilEnd <= fadeOutDuration && timeUntilEnd > 0) {
			// Start fade-out if not already fading
			if (!isInFadeOut) {
				setIsInFadeOut(true);
				originalVolumeRef.current = audioRef.current.volume;
			}

			// Calculate fade-out volume
			const fadeProgress = timeUntilEnd / fadeOutDuration; // 1 to 0 as we approach the end
			const targetVolume = originalVolumeRef.current * fadeProgress;

			// Apply smooth volume transition
			if (audioRef.current.volume !== targetVolume) {
				audioRef.current.volume = Math.max(0, Math.min(1, targetVolume));
			}
		} else if (isInFadeOut) {
			// Reset fade-out when seeking back or starting new track
			setIsInFadeOut(false);
			if (audioRef.current) {
				audioRef.current.volume = originalVolumeRef.current;
			}
		}
	}, [currentTime, duration, isPlaying, fadeOutDuration, isInFadeOut]);

	// Detect connection speed and select appropriate quality
	const detectConnectionQuality = (): 'high' | 'medium' | 'low' => {
		// Check if Network Information API is available
		const connection = (navigator as any).connection ||
			(navigator as any).mozConnection ||
			(navigator as any).webkitConnection;

		if (connection) {
			const effectiveType = connection.effectiveType;
			const downlink = connection.downlink; // Mbps
			const saveData = connection.saveData; // User preference for reduced data

			// If user has data saver enabled, always use low quality
			if (saveData) {
				return 'low';
			}

			// For WAV files, be more conservative - only serve on very fast connections
			const isWavFile = audioUrl.toLowerCase().endsWith('.wav');

			if (isWavFile) {
				// WAV files need very fast connections
				if (effectiveType === '4g' && downlink && downlink > 15) {
					return 'high'; // WAV needs 15+ Mbps
				} else if (effectiveType === '4g' && (!downlink || downlink > 5)) {
					return 'medium'; // 320k needs 5+ Mbps
				} else {
					return 'low'; // 128k for slower connections
				}
			} else {
				// For non-WAV files, adjust thresholds for higher bitrates
				if (effectiveType === '4g' && (!downlink || downlink > 10)) {
					return 'high';
				} else if (effectiveType === '4g' || (downlink && downlink > 2)) {
					return 'medium'; // 320k needs decent connection
				} else {
					return 'low'; // 128k for slower connections
				}
			}
		}

		// Default to low (128k) if API not available - good quality with reasonable bandwidth
		return 'low';
	};

	// Get the appropriate audio URL based on quality
	const getAudioUrl = (quality: 'high' | 'medium' | 'low'): string => {
		// If no quality levels provided, use the single audioUrl for all qualities
		if (!qualityLevels) {
			return audioUrl;
		}

		// Use quality levels if available, fallback to lower quality or original
		if (quality === 'high' && qualityLevels.high) {
			return qualityLevels.high;
		} else if (quality === 'medium' && qualityLevels.medium) {
			return qualityLevels.medium;
		} else if (quality === 'low' && qualityLevels.low) {
			return qualityLevels.low;
		}

		// Fallback chain: medium -> low -> original
		return qualityLevels.medium || qualityLevels.low || audioUrl;
	};

	// Initialize audio only when first played (lazy loading)
	const initializeAudio = () => {
		if (!audioInitialized && audioRef.current) {
			setIsLoading(true);
			// Auto-detect quality if not manually set
			const quality = detectConnectionQuality();
			setCurrentQuality(quality);

			// Use direct URL for streaming with selected quality
			const selectedUrl = getAudioUrl(quality);
			audioRef.current.src = selectedUrl;
			audioRef.current.preload = 'none'; // Don't preload anything

			// Set loading to false once metadata is loaded
			audioRef.current.addEventListener('loadedmetadata', () => {
				setIsLoading(false);
			}, { once: true });

			setAudioInitialized(true);
		}
	};

	useEffect(() => {
		// Listen for other players starting
		const handleOtherPlayerStart = (e: CustomEvent) => {
			// Only skip pausing if this is the same player or part of the same playlist auto-play sequence
			// For manual plays, always stop other players
			if (e.detail.player === audioRef.current) {
				return; // Don't pause self
			}
			
			// Only allow continuation if both are in the same playlist AND it's an auto-play transition
			// (auto-play transitions are handled via onEnded callback, not this event)
			// For all other cases, stop this player
			if (audioRef.current && isPlaying) {
				audioRef.current.pause();
				setIsPlaying(false);
			}
		};

		window.addEventListener('recording-play-request', handleOtherPlayerStart as EventListener);

		return () => {
			window.removeEventListener('recording-play-request', handleOtherPlayerStart as EventListener);
			// No need to revoke URL since we're using direct streaming
		};
	}, [playlistIndex, isPlaying]);

	// Reset initialization when audio URL changes
	useEffect(() => {
		setAudioInitialized(false);
		setIsLoading(false);
		setIsInFadeOut(false);
		if (audioRef.current) {
			audioRef.current.src = '';
			// Reset volume for new track
			audioRef.current.volume = originalVolumeRef.current || 1.0;
		}
	}, [audioUrl]);

	// Handle auto-play
	useEffect(() => {
		if (autoPlay && audioRef.current) {
			initializeAudio();
			// Small delay to ensure audio is initialized
			setTimeout(() => {
				if (audioRef.current) {
					audioRef.current.play()
						.then(() => setIsPlaying(true))
						.catch(err => console.error('Auto-play failed:', err));
				}
			}, 100);
		}
	}, [autoPlay]);

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
				// Dispatch custom event when pausing
				window.dispatchEvent(new CustomEvent('recording-paused'));
			} else {
				// Initialize audio on first play (lazy loading)
				initializeAudio();
				// Pause all other audio players
				window.dispatchEvent(new CustomEvent('recording-play-request', {
					detail: { player: audioRef.current, playlistIndex }
				}));

				// Small delay to ensure audio is ready
				setTimeout(() => {
					if (audioRef.current) {
						audioRef.current.play()
							.then(() => {
								// Dispatch custom event when playing
								window.dispatchEvent(new CustomEvent('recording-playing'));
							})
							.catch(err => console.error('Play failed:', err));
					}
				}, audioInitialized ? 0 : 100); // Only delay on first play
			}
			setIsPlaying(!isPlaying);
		}
	};

	const handleSeek = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement;
		const time = parseFloat(target.value);
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	};

	const formatTime = (seconds: number): string => {
		if (!isFinite(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	// Switch audio quality
	const switchQuality = (quality: 'high' | 'medium' | 'low') => {
		const wasPlaying = isPlaying;
		const currentTimePosition = currentTime;

		// Pause current playback
		if (audioRef.current && wasPlaying) {
			audioRef.current.pause();
		}

		// Reset fade-out state when switching quality
		setIsInFadeOut(false);

		// Update quality and reinitialize
		setCurrentQuality(quality);
		if (audioRef.current) {
			// Reset volume to original before switching
			audioRef.current.volume = originalVolumeRef.current || 1.0;

			const selectedUrl = getAudioUrl(quality);
			audioRef.current.src = selectedUrl;
			audioRef.current.currentTime = currentTimePosition;

			// Resume playback if was playing
			if (wasPlaying) {
				audioRef.current.play()
					.then(() => setIsPlaying(true))
					.catch(err => console.error('Resume after quality switch failed:', err));
			}
		}

		setShowQualityMenu(false);
	};

	return (
		<div class="audio-player" onContextMenu={handleContextMenu}>
			<audio
				ref={audioRef}
				onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
				onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
				onEnded={() => {
					setIsPlaying(false);
					setIsInFadeOut(false);
					// Reset volume after fade-out completes
					if (audioRef.current) {
						audioRef.current.volume = originalVolumeRef.current || 1.0;
					}
					// Dispatch custom event when recording ends
					window.dispatchEvent(new CustomEvent('recording-ended'));
					// Call the onEnded callback if provided
					if (onEnded) {
						onEnded();
					}
				}}
				controlsList="nodownload"
			/>

			<div class="player-content">
				<button
					class="play-button"
					onClick={togglePlay}
					disabled={isLoading}
					aria-label={isPlaying ? 'Pause' : 'Play'}
				>
					{isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
				</button>

				<div class="player-info">
					<span class="title">{title}</span>
					<div class="progress-container">
						<span class="time">{formatTime(currentTime)}</span>
						<input
							type="range"
							class="progress-bar"
							min="0"
							max={duration || 0}
							value={currentTime}
							onInput={handleSeek}
							disabled={isLoading}
						/>
						<span class="time">{formatTime(duration)}</span>
					</div>
				</div>

				{/* Quality selector - always show for manual quality control */}
				<div class="quality-selector">
						<button
							class="quality-button"
							onClick={() => setShowQualityMenu(!showQualityMenu)}
							aria-label="Select quality"
							title={`Quality: ${currentQuality}`}
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
								<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
							</svg>
						</button>
						{showQualityMenu && (
							<div class="quality-menu">
								{!qualityLevels ? (
									// Show single quality message when no quality levels are configured
									<div class="quality-message">
										<span class="quality-label">Single Quality</span>
										<span class="quality-details">Multiple qualities not available</span>
									</div>
								) : (
									// Show quality options when available
									<>
										<button
											class={`quality-option ${currentQuality === 'low' ? 'active' : ''}`}
											onClick={() => switchQuality('low')}
										>
											<span class="quality-label">Low</span>
											<span class="quality-details">128k stereo • ~1 MB/min</span>
										</button>
										<button
											class={`quality-option ${currentQuality === 'medium' ? 'active' : ''}`}
											onClick={() => switchQuality('medium')}
										>
											<span class="quality-label">Medium</span>
											<span class="quality-details">320k stereo • ~2.5 MB/min</span>
										</button>
										<button
											class={`quality-option ${currentQuality === 'high' ? 'active' : ''}`}
											onClick={() => switchQuality('high')}
										>
											<span class="quality-label">High</span>
											<span class="quality-details">HQ WAV • ~10 MB/min</span>
										</button>
									</>
								)}
							</div>
						)}
					</div>
			</div>
		</div>
	);
}

// Add this style tag at the end of the component (outside the return)
const styles = `
.audio-player {
	background: rgba(255, 255, 255, 0.03);
	border-radius: 8px;
	padding: 1.5rem;
	margin: 1rem 0;
	user-select: none;
}

.player-content {
	display: flex;
	gap: 1.5rem;
	align-items: center;
}

.play-button {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: #e0e0e0;
	font-size: 1.2rem;
	cursor: pointer;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.play-button:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.3);
}

.play-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.player-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.title {
	font-size: 1rem;
	letter-spacing: 0.05em;
	color: #d0d0d0;
}

.progress-container {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.time {
	font-size: 0.85rem;
	color: rgba(255, 255, 255, 0.5);
	font-variant-numeric: tabular-nums;
	min-width: 3rem;
}

.progress-bar {
	flex: 1;
	height: 4px;
	-webkit-appearance: none;
	appearance: none;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 2px;
	outline: none;
	cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: #e0e0e0;
	cursor: pointer;
	transition: background 0.3s;
}

.progress-bar::-moz-range-thumb {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: #e0e0e0;
	cursor: pointer;
	border: none;
	transition: background 0.3s;
}

.progress-bar:hover::-webkit-slider-thumb {
	background: #fff;
}

.progress-bar:hover::-moz-range-thumb {
	background: #fff;
}

.progress-bar:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

@media (max-width: 768px) {
	.player-content {
		gap: 1rem;
	}

	.play-button {
		width: 44px;
		height: 44px;
	}

	.title {
		font-size: 0.9rem;
	}
}

.quality-selector {
	position: relative;
	margin-left: auto;
}

.quality-button {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.3);
	background: rgba(255, 255, 255, 0.08);
	color: #ffffff;
	cursor: pointer;
	transition: all 0.3s;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.1rem;
}

.quality-button:hover {
	background: rgba(255, 255, 255, 0.15);
	border-color: rgba(255, 255, 255, 0.5);
	transform: scale(1.05);
}

.quality-button svg {
	opacity: 0.9;
	width: 20px;
	height: 20px;
}

.quality-menu {
	position: absolute;
	bottom: 100%;
	right: 0;
	margin-bottom: 0.5rem;
	background: rgba(0, 0, 0, 0.95);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	padding: 0.5rem;
	min-width: 180px;
	z-index: 100;
	backdrop-filter: blur(10px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.quality-option {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: transparent;
	border: none;
	color: rgba(255, 255, 255, 0.7);
	text-align: left;
	cursor: pointer;
	transition: all 0.2s;
	font-size: 0.85rem;
	letter-spacing: 0.02em;
	gap: 0.25rem;
}

.quality-label {
	font-weight: 500;
}

.quality-details {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	letter-spacing: 0.03em;
}

.quality-option:hover {
	background: rgba(255, 255, 255, 0.05);
}

.quality-option:hover .quality-label {
	color: rgba(255, 255, 255, 0.95);
}

.quality-option:hover .quality-details {
	color: rgba(255, 255, 255, 0.7);
}

.quality-option.active {
	background: rgba(255, 255, 255, 0.1);
}

.quality-option.active .quality-label {
	color: white;
}

.quality-option.active .quality-details {
	color: rgba(255, 255, 255, 0.8);
}

.quality-message {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: 0.5rem 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	font-size: 0.85rem;
	letter-spacing: 0.02em;
	gap: 0.25rem;
}

.quality-message .quality-label {
	font-weight: 500;
	color: rgba(255, 255, 255, 0.7);
}

.quality-message .quality-details {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.4);
	font-style: italic;
}

@media (max-width: 768px) {
	.quality-selector {
		/* Keep quality selector visible on mobile for user control */
		position: relative;
		margin-left: 0.5rem;
	}

	.quality-dropdown {
		right: auto;
		left: 50%;
		transform: translateX(-50%);
		min-width: 160px;
	}
}
`;

// Inject styles into document
if (typeof document !== 'undefined' && !document.getElementById('audio-player-styles')) {
	const styleTag = document.createElement('style');
	styleTag.id = 'audio-player-styles';
	styleTag.textContent = styles;
	document.head.appendChild(styleTag);
}