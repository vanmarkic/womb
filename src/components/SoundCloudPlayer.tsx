import { useEffect, useRef, useState } from 'preact/hooks';

interface Props {
	soundcloudUrl: string;
	title: string;
	autoPlay?: boolean;
	visual?: boolean; // Whether to show visual (artwork) or just waveform
}

export default function SoundCloudPlayer({ soundcloudUrl, title, autoPlay = false, visual = false }: Props) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [isReady, setIsReady] = useState(false);

	// Extract track ID from SoundCloud URL or use full URL
	const getSoundCloudEmbedUrl = (url: string): string => {
		// If it's already a full URL, encode it
		if (url.startsWith('http')) {
			const encodedUrl = encodeURIComponent(url);
			return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23333333&auto_play=${autoPlay}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=${visual}`;
		}

		// If it's a path like /wombambient/track-name, construct full URL
		const fullUrl = encodeURIComponent(`https://soundcloud.com${url}`);
		return `https://w.soundcloud.com/player/?url=${fullUrl}&color=%23333333&auto_play=${autoPlay}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=${visual}`;
	};

	useEffect(() => {
		// Listen for SoundCloud widget ready event
		const handleMessage = (event: MessageEvent) => {
			if (event.data === 'ready') {
				setIsReady(true);
			}
		};

		window.addEventListener('message', handleMessage);
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	// Handle play/pause coordination with other players
	useEffect(() => {
		const handleOtherPlayerStart = (e: CustomEvent) => {
			// Pause SoundCloud player when other audio starts
			if (iframeRef.current && isReady) {
				const widget = (window as any).SC?.Widget(iframeRef.current);
				if (widget) {
					widget.pause();
				}
			}
		};

		window.addEventListener('recording-play-request', handleOtherPlayerStart as EventListener);

		return () => {
			window.removeEventListener('recording-play-request', handleOtherPlayerStart as EventListener);
		};
	}, [isReady]);

	return (
		<div class="soundcloud-player">
			<iframe
				ref={iframeRef}
				width="100%"
				height={visual ? "300" : "166"}
				scrolling="no"
				frameborder="no"
				allow="autoplay"
				src={getSoundCloudEmbedUrl(soundcloudUrl)}
				title={title}
				loading="lazy"
			/>
		</div>
	);
}

// Styles
const styles = `
.soundcloud-player {
	margin: 1rem 0;
	border-radius: 8px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.03);
}

.soundcloud-player iframe {
	display: block;
	border: none;
}

@media (max-width: 768px) {
	.soundcloud-player {
		margin: 0.75rem 0;
	}
}
`;

// Inject styles into document
if (typeof document !== 'undefined' && !document.getElementById('soundcloud-player-styles')) {
	const styleTag = document.createElement('style');
	styleTag.id = 'soundcloud-player-styles';
	styleTag.textContent = styles;
	document.head.appendChild(styleTag);
}

// Load SoundCloud Widget API
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
	if (!(window as any).SC) {
		const script = document.createElement('script');
		script.src = 'https://w.soundcloud.com/player/api.js';
		script.async = true;
		document.head.appendChild(script);
	}
}
