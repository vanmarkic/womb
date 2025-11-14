import { useState, useEffect } from 'preact/hooks';
import AudioPlayer from './AudioPlayer';

interface Recording {
	id: string;
	data: {
		title: string;
		artist: string;
		audioFile: string;
		date: Date;
		duration: number;
	};
}

interface Props {
	recordings: Recording[];
	lang: string;
}

export default function RecordingsPlaylist({ recordings, lang }: Props) {
	const [currentIndex, setCurrentIndex] = useState<number | null>(null);
	const [isPlaylistMode, setIsPlaylistMode] = useState(false);

	// Format duration from seconds to mm:ss
	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleRecordingEnd = (index: number) => {
		// Auto-play next recording if there is one
		if (index < recordings.length - 1) {
			setCurrentIndex(index + 1);
		} else {
			// Playlist ended
			setCurrentIndex(null);
			setIsPlaylistMode(false);
		}
	};

	const startPlaylist = (index: number) => {
		setCurrentIndex(index);
		setIsPlaylistMode(true);
	};

	// Listen for manual play events to track current playing
	useEffect(() => {
		const handlePlayEvent = () => {
			// If a recording is playing manually, enable playlist mode
			if (!isPlaylistMode) {
				setIsPlaylistMode(true);
			}
		};

		window.addEventListener('recording-playing', handlePlayEvent);
		return () => {
			window.removeEventListener('recording-playing', handlePlayEvent);
		};
	}, [isPlaylistMode]);

	return (
		<div className="recordings-list">
			{recordings.map((recording, index) => (
				<div key={recording.id} className={`recording-item ${currentIndex === index ? 'now-playing' : ''}`}>
					<AudioPlayer
						audioUrl={recording.data.audioFile}
						title={`${recording.data.artist} - ${recording.data.title}`}
						onEnded={() => handleRecordingEnd(index)}
						autoPlay={isPlaylistMode && currentIndex === index}
						playlistIndex={index}
					/>
					<div className="recording-details">
						<p className="recording-meta">
							{new Date(recording.data.date).toLocaleDateString(lang, {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
							<span className="separator">•</span>
							{formatDuration(recording.data.duration)}
						</p>
						<a href={`/womb/${lang}/recordings/${recording.id.replace('.md', '')}`} className="view-details">
							{lang === 'en' ? 'View details' : 'Voir les détails'} →
						</a>
					</div>
				</div>
			))}
		</div>
	);
}

// Add styles for the playlist and now-playing indicator
const styles = `
.recordings-list {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
	max-width: 800px;
	margin: 0 auto;
}

.recording-item {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	transition: all 0.3s ease;
}

.recording-item.now-playing {
	background: rgba(255, 255, 255, 0.02);
	border-radius: 8px;
	padding: 1rem;
	margin: -1rem;
	position: relative;
}

.recording-item.now-playing::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 3px;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
	border-radius: 3px 0 0 3px;
}

.recording-details {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1rem;
	flex-wrap: wrap;
	gap: 1rem;
}

.recording-meta {
	color: rgba(255, 255, 255, 0.5);
	font-size: 0.9rem;
	letter-spacing: 0.05em;
	margin: 0;
}

.separator {
	margin: 0 0.5rem;
}

.view-details {
	color: rgba(255, 255, 255, 0.7);
	text-decoration: none;
	font-size: 0.9rem;
	letter-spacing: 0.05em;
	transition: color 0.3s;
	white-space: nowrap;
}

.view-details:hover {
	color: rgba(255, 255, 255, 1);
}

@media (max-width: 768px) {
	.recording-details {
		flex-direction: column;
		align-items: flex-start;
	}
}
`;

// Inject styles into document
if (typeof document !== 'undefined' && !document.getElementById('recordings-playlist-styles')) {
	const styleTag = document.createElement('style');
	styleTag.id = 'recordings-playlist-styles';
	styleTag.textContent = styles;
	document.head.appendChild(styleTag);
}