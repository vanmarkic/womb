import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
	audioUrl: string;
	title: string;
}

export default function AudioPlayer({ audioUrl, title }: Props) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	// Prevent right-click on player
	const handleContextMenu = (e: Event) => {
		e.preventDefault();
		return false;
	};

	// Load audio via blob URL for protection
	useEffect(() => {
		setIsLoading(true);
		fetch(audioUrl)
			.then(res => res.blob())
			.then(blob => {
				const url = URL.createObjectURL(blob);
				if (audioRef.current) {
					audioRef.current.src = url;
					setIsLoading(false);
				}
			})
			.catch(err => {
				console.error('Failed to load audio:', err);
				setIsLoading(false);
			});

		return () => {
			if (audioRef.current?.src) {
				URL.revokeObjectURL(audioRef.current.src);
			}
		};
	}, [audioUrl]);

	const togglePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
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

	return (
		<div class="audio-player" onContextMenu={handleContextMenu}>
			<audio
				ref={audioRef}
				onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
				onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
				onEnded={() => setIsPlaying(false)}
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
`;

// Inject styles into document
if (typeof document !== 'undefined' && !document.getElementById('audio-player-styles')) {
	const styleTag = document.createElement('style');
	styleTag.id = 'audio-player-styles';
	styleTag.textContent = styles;
	document.head.appendChild(styleTag);
}