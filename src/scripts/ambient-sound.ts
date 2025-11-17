// Ambient Sound Engine for WOMB

export class AmbientSoundEngine {
	private audioContext: AudioContext | null = null;
	private isInitialized = false;
	private soundTimers: NodeJS.Timeout[] = [];
	private reverb: ConvolverNode | null = null;
	private masterGain: GainNode | null = null;
	private isMuted = false;
	private audioFrequencyMultiplier = 1; // Default multiplier (corresponds to slider value 0.5)

	init() {
		if (this.isInitialized) return;

		// Initialize on first user interaction (browser autoplay policy)
		const initAudio = () => {
			this.audioContext = new AudioContext();
			this.createMasterGain();
			this.createCathedralReverb();
			this.isInitialized = true;
			this.startAmbientSounds();
			document.removeEventListener('click', initAudio);
			document.removeEventListener('touchstart', initAudio);
		};

		document.addEventListener('click', initAudio, { once: true });
		document.addEventListener('touchstart', initAudio, { once: true });
	}

	// Create master gain for global volume control
	private createMasterGain() {
		if (!this.audioContext) return;
		this.masterGain = this.audioContext.createGain();
		this.masterGain.gain.value = this.isMuted ? 0 : 1;
		this.masterGain.connect(this.audioContext.destination);
	}

	// Mute/unmute the sound engine
	setMuted(muted: boolean) {
		this.isMuted = muted;
		if (this.masterGain) {
			const targetValue = muted ? 0 : 1;
			this.masterGain.gain.linearRampToValueAtTime(
				targetValue,
				this.audioContext!.currentTime + 0.3
			);
		}
	}

	// Set audio frequency multiplier from slider value (0-1)
	setAudioFrequencyMultiplier(sliderValue: number) {
		// Convert slider value 0-1 to multiplier 1.5-0.3 (0=slowest, 1=fastest)
		this.audioFrequencyMultiplier = 1.5 - (sliderValue * 1.2);
	}

	// Create cathedral reverb impulse response
	private createCathedralReverb() {
		if (!this.audioContext) return;

		const sampleRate = this.audioContext.sampleRate;
		const length = sampleRate * 4; // 4 second reverb tail
		const impulse = this.audioContext.createBuffer(2, length, sampleRate);
		const leftChannel = impulse.getChannelData(0);
		const rightChannel = impulse.getChannelData(1);

		// Generate cathedral-like reverb with exponential decay
		for (let i = 0; i < length; i++) {
			const decay = Math.exp(-i / (sampleRate * 1.5));
			const noise = (Math.random() * 2 - 1) * decay;

			leftChannel[i] = noise * (1 + Math.sin(i / 500));
			rightChannel[i] = noise * (1 + Math.cos(i / 500));
		}

		this.reverb = this.audioContext.createConvolver();
		this.reverb.buffer = impulse;
		this.reverb.connect(this.masterGain!);
	}

	// Generate swoosh sound (mid-low frequency sweep)
	private createSwoosh() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 1.2 + Math.random() * 2.5; // Wider range: 1.2-3.7s

		// Random frequency range
		const startFreq = 140 + Math.random() * 100; // 140-240Hz
		const endFreq = 60 + Math.random() * 80; // 60-140Hz

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();
		const filter = this.audioContext.createBiquadFilter();
		const dryGain = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(startFreq, now);
		oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(900 + Math.random() * 600, now);
		filter.frequency.exponentialRampToValueAtTime(300 + Math.random() * 300, now + duration);

		// Base volume for low frequencies (140-240Hz range)
		const volume = 0.045 + Math.random() * 0.033; // Increased by 50%
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + 0.1 + Math.random() * 0.15);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		// Random reverb mix
		const wet = 0.5 + Math.random() * 0.4;
		dryGain.gain.value = 1 - wet;
		wetGain.gain.value = wet;

		oscillator.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(dryGain);
		gainNode.connect(wetGain);
		dryGain.connect(this.masterGain);
		wetGain.connect(this.reverb);

		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	// Generate sweesh sound (higher frequency with noise)
	private createSweesh() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 0.8 + Math.random() * 2; // Wider range: 0.8-2.8s

		// Variable noise amount
		const noiseAmount = 0.05 + Math.random() * 0.12; // 0.05-0.17
		const bufferSize = this.audioContext.sampleRate * duration;
		const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			data[i] = (Math.random() * 2 - 1) * noiseAmount;
		}

		const noiseSource = this.audioContext.createBufferSource();
		noiseSource.buffer = buffer;

		const filter = this.audioContext.createBiquadFilter();
		filter.type = 'bandpass';
		const startFreq = 2800 + Math.random() * 1500; // 2800-4300Hz
		const endFreq = 800 + Math.random() * 600; // 800-1400Hz
		filter.frequency.setValueAtTime(startFreq, now);
		filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
		filter.Q.value = 2 + Math.random() * 3; // Random Q: 2-5

		const gainNode = this.audioContext.createGain();
		const dryGain = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		// Frequency-dependent volume: 2800-4300Hz → much quieter
		const volume = 0.0075 + Math.random() * 0.006; // Increased by 50%
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + 0.05 + Math.random() * 0.1);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		// Random reverb mix
		const wet = 0.4 + Math.random() * 0.5;
		dryGain.gain.value = 1 - wet;
		wetGain.gain.value = wet;

		noiseSource.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(dryGain);
		gainNode.connect(wetGain);
		dryGain.connect(this.masterGain);
		wetGain.connect(this.reverb);

		noiseSource.start(now);
	}

	// Generate whisper sound (subtle breath-like noise)
	private createWhisper() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 1.5 + Math.random() * 2.5; // 1.5-4s

		const noiseAmount = 0.02 + Math.random() * 0.04;
		const bufferSize = this.audioContext.sampleRate * duration;
		const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			data[i] = (Math.random() * 2 - 1) * noiseAmount;
		}

		const noiseSource = this.audioContext.createBufferSource();
		noiseSource.buffer = buffer;

		const filter = this.audioContext.createBiquadFilter();
		filter.type = 'highpass';
		filter.frequency.setValueAtTime(1600 + Math.random() * 1000, now); // 1600-2600Hz

		const gainNode = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		// Frequency-dependent: 1600-2600Hz → quieter
		const volume = 0.006 + Math.random() * 0.006; // Increased by 50%
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + 0.2 + Math.random() * 0.3);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		wetGain.gain.value = 0.7 + Math.random() * 0.25;

		noiseSource.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(wetGain);
		wetGain.connect(this.reverb);

		noiseSource.start(now);
	}

	// Generate shimmer sound (high frequency bell-like tone)
	private createShimmer() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 2 + Math.random() * 2; // 2-4s

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		oscillator.type = 'sine';
		const startFreq = 700 + Math.random() * 400; // 700-1100Hz
		const endFreq = startFreq * (1.5 + Math.random()); // 1.5x-2.5x higher (1050-2750Hz)
		oscillator.frequency.setValueAtTime(startFreq, now);
		oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

		// Frequency-dependent: 700-2750Hz → moderate reduction
		const volume = 0.009 + Math.random() * 0.0075; // Increased by 50%
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + 0.08 + Math.random() * 0.15);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		wetGain.gain.value = 0.75 + Math.random() * 0.2;

		oscillator.connect(gainNode);
		gainNode.connect(wetGain);
		wetGain.connect(this.reverb);

		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	// Generate rumble sound (very low frequency)
	private createRumble() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 2.5 + Math.random() * 2.5; // 2.5-5s

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();
		const filter = this.audioContext.createBiquadFilter();
		const dryGain = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		oscillator.type = 'sine';
		const startFreq = 50 + Math.random() * 30; // 50-80Hz
		const endFreq = 25 + Math.random() * 20; // 25-45Hz
		oscillator.frequency.setValueAtTime(startFreq, now);
		oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

		filter.type = 'lowpass';
		filter.frequency.value = 120 + Math.random() * 80; // 120-200Hz

		const volume = 0.033 + Math.random() * 0.027; // Increased by 50%
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + 0.3 + Math.random() * 0.4);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		const wet = 0.3 + Math.random() * 0.4;
		dryGain.gain.value = 1 - wet;
		wetGain.gain.value = wet;

		oscillator.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(dryGain);
		gainNode.connect(wetGain);
		dryGain.connect(this.masterGain);
		wetGain.connect(this.reverb);

		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	// Generate drift sound (sweeping mid-range)
	private createDrift() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 1.8 + Math.random() * 2; // 1.8-3.8s

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();
		const filter = this.audioContext.createBiquadFilter();
		const wetGain = this.audioContext.createGain();

		oscillator.type = 'triangle';
		const startFreq = 250 + Math.random() * 150; // 250-400Hz
		const peakFreq = startFreq + 100 + Math.random() * 200; // Variable peak
		const endFreq = startFreq - 50 + Math.random() * 100; // Variable end
		oscillator.frequency.setValueAtTime(startFreq, now);
		oscillator.frequency.linearRampToValueAtTime(peakFreq, now + duration / 2);
		oscillator.frequency.linearRampToValueAtTime(endFreq, now + duration);

		filter.type = 'bandpass';
		filter.frequency.value = 400 + Math.random() * 300; // 400-700Hz
		filter.Q.value = 1.5 + Math.random() * 2; // 1.5-3.5

		// Frequency-dependent: 250-600Hz → mild reduction
		const volume = 0.021 + Math.random() * 0.015; // Increased by 50%
		gainNode.gain.setValueAtTime(0, now);
		gainNode.gain.linearRampToValueAtTime(volume, now + 0.15 + Math.random() * 0.25);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		wetGain.gain.value = 0.6 + Math.random() * 0.3;

		oscillator.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(wetGain);
		wetGain.connect(this.reverb);

		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	// Generate crack sound (short sharp glitch)
	private createCrack() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 0.03 + Math.random() * 0.07; // Very short: 30-100ms

		// Sharp noise burst
		const bufferSize = this.audioContext.sampleRate * duration;
		const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			// Exponential decay within the burst
			const decay = 1 - (i / bufferSize);
			data[i] = (Math.random() * 2 - 1) * decay * 0.3;
		}

		const noiseSource = this.audioContext.createBufferSource();
		noiseSource.buffer = buffer;

		const filter = this.audioContext.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.value = 800 + Math.random() * 2000; // 800-2800Hz
		filter.Q.value = 8 + Math.random() * 12; // Very resonant: 8-20

		const gainNode = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		// Softer attack, quick decay - INCREASED VOLUME with attack envelope
		const volume = 0.063 + Math.random() * 0.063; // Increased by 50%
		const attackTime = 0.008 + Math.random() * 0.012; // 8-20ms attack time
		gainNode.gain.setValueAtTime(0.001, now);
		gainNode.gain.exponentialRampToValueAtTime(volume, now + attackTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		wetGain.gain.value = 0.6 + Math.random() * 0.3;

		noiseSource.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(wetGain);
		wetGain.connect(this.reverb);

		noiseSource.start(now);
	}

	// Generate glitch sound (digital artifact)
	private createGlitch() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 0.05 + Math.random() * 0.15; // 50-200ms

		const oscillator = this.audioContext.createOscillator();
		const gainNode = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		// Random waveform for digital character
		const types: OscillatorType[] = ['square', 'sawtooth', 'triangle'];
		oscillator.type = types[Math.floor(Math.random() * types.length)];

		// Rapid frequency jump (glitchy)
		const freq1 = 200 + Math.random() * 1500;
		const freq2 = 200 + Math.random() * 1500;
		oscillator.frequency.setValueAtTime(freq1, now);
		oscillator.frequency.setValueAtTime(freq2, now + duration * 0.5);

		// Softer envelope - INCREASED VOLUME with attack envelope
		const volume = 0.045 + Math.random() * 0.045; // Increased by 50%
		const attackTime = 0.010 + Math.random() * 0.015; // 10-25ms attack time
		gainNode.gain.setValueAtTime(0.001, now);
		gainNode.gain.exponentialRampToValueAtTime(volume, now + attackTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		wetGain.gain.value = 0.5 + Math.random() * 0.3;

		oscillator.connect(gainNode);
		gainNode.connect(wetGain);
		wetGain.connect(this.reverb);

		oscillator.start(now);
		oscillator.stop(now + duration);
	}

	// Generate crackle sound (vinyl-like or fire crackle)
	private createCrackle() {
		if (!this.audioContext || !this.reverb || !this.masterGain) return;

		const now = this.audioContext.currentTime;
		const duration = 0.15 + Math.random() * 0.35; // 150-500ms

		// Create short bursts of noise with random gaps
		const bufferSize = this.audioContext.sampleRate * duration;
		const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
		const data = buffer.getChannelData(0);

		// Fill with crackling pattern
		for (let i = 0; i < bufferSize; i++) {
			// Random bursts with gaps (crackle effect)
			if (Math.random() > 0.7) { // 30% chance of sound per sample
				const decay = 1 - (i / bufferSize);
				data[i] = (Math.random() * 2 - 1) * decay * 0.4;
			} else {
				data[i] = 0;
			}
		}

		const noiseSource = this.audioContext.createBufferSource();
		noiseSource.buffer = buffer;

		const filter = this.audioContext.createBiquadFilter();
		filter.type = 'highpass';
		filter.frequency.value = 1500 + Math.random() * 2000; // 1500-3500Hz

		const gainNode = this.audioContext.createGain();
		const dryGain = this.audioContext.createGain();
		const wetGain = this.audioContext.createGain();

		// INCREASED VOLUME with softer attack
		const volume = 0.036 + Math.random() * 0.033; // Increased by 50%
		const attackTime = 0.015 + Math.random() * 0.020; // 15-35ms attack time for crackle
		gainNode.gain.setValueAtTime(0.001, now);
		gainNode.gain.exponentialRampToValueAtTime(volume, now + attackTime);
		gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

		// Less reverb for more intimate crackle
		dryGain.gain.value = 0.7;
		wetGain.gain.value = 0.3;

		noiseSource.connect(filter);
		filter.connect(gainNode);
		gainNode.connect(dryGain);
		gainNode.connect(wetGain);
		dryGain.connect(this.masterGain);
		wetGain.connect(this.reverb);

		noiseSource.start(now);
	}

	// Start ambient sound loops with randomness
	private startAmbientSounds() {
		const figureTimings = [
			{ baseDuration: 25000, soundType: 0 },  // figure-1: swoosh
			{ baseDuration: 30000, soundType: 1 },  // figure-2: sweesh
			{ baseDuration: 35000, soundType: 2 },  // figure-3: whisper
			{ baseDuration: 28000, soundType: 3 },  // figure-4: shimmer
			{ baseDuration: 32000, soundType: 4 },  // figure-5: rumble
			{ baseDuration: 40000, soundType: 5 },  // figure-6: drift
		];

		const soundFunctions = [
			() => this.createSwoosh(),
			() => this.createSweesh(),
			() => this.createWhisper(),
			() => this.createShimmer(),
			() => this.createRumble(),
			() => this.createDrift(),
		];

		const glitchFunctions = [
			() => this.createCrack(),
			() => this.createGlitch(),
			() => this.createCrackle(),
		];

		figureTimings.forEach((timing) => {
			// Random initial delay
			const randomInitialDelay = Math.random() * 15000;

			const scheduleNextSound = () => {
				// Play primary sound
				soundFunctions[timing.soundType]();

				// Reduced chance to layer additional sounds (10% chance)
				if (Math.random() < 0.1) {
					const randomSound = Math.floor(Math.random() * soundFunctions.length);
					setTimeout(() => {
						soundFunctions[randomSound]();
					}, 500 + Math.random() * 2000);
				}

				// Schedule next sound with random variation (±40% of base duration)
				const variation = (Math.random() - 0.5) * 0.8;
				const nextDelay = timing.baseDuration * (1 + variation) * this.audioFrequencyMultiplier;

				const timer = setTimeout(scheduleNextSound, nextDelay);
				this.soundTimers.push(timer);
			};

			// Start the chain
			const initialTimer = setTimeout(scheduleNextSound, randomInitialDelay);
			this.soundTimers.push(initialTimer);
		});

		// Add glitch/crack sounds on separate random schedule
		const scheduleGlitches = () => {
			// Random glitch type
			const glitchFunc = glitchFunctions[Math.floor(Math.random() * glitchFunctions.length)];
			glitchFunc();

			// Next glitch in 45-120 seconds (multiplied by frequency multiplier)
			const nextGlitchDelay = (45000 + Math.random() * 75000) * this.audioFrequencyMultiplier;
			const timer = setTimeout(scheduleGlitches, nextGlitchDelay);
			this.soundTimers.push(timer);
		};

		// Start glitch chain after initial delay
		const glitchInitialDelay = 20000 + Math.random() * 30000; // 20-50s
		const glitchTimer = setTimeout(scheduleGlitches, glitchInitialDelay);
		this.soundTimers.push(glitchTimer);
	}

	destroy() {
		this.soundTimers.forEach(timer => clearTimeout(timer));
		this.soundTimers = [];
		if (this.audioContext) {
			this.audioContext.close();
		}
	}
}

// Background audio manager
export class BackgroundAudioManager {
	private audio: HTMLAudioElement;
	private fadeInterval: number | null = null;

	constructor(audioElement: HTMLAudioElement) {
		this.audio = audioElement;
		this.audio.volume = 0.3; // Start at 30% volume
	}

	async play() {
		try {
			await this.audio.play();
			this.fadeIn();
		} catch (error) {
			// Autoplay might be blocked, will try again on user interaction
			console.log('Background audio autoplay blocked, waiting for user interaction');
		}
	}

	pause() {
		this.fadeOut(() => {
			this.audio.pause();
		});
	}

	setMuted(muted: boolean) {
		if (muted) {
			this.pause();
		} else {
			this.play();
		}
	}

	private fadeIn() {
		if (this.fadeInterval) clearInterval(this.fadeInterval);

		let volume = 0;
		const targetVolume = 0.3;
		const step = 0.01;

		this.fadeInterval = window.setInterval(() => {
			if (volume < targetVolume) {
				volume += step;
				this.audio.volume = Math.min(volume, targetVolume);
			} else {
				if (this.fadeInterval) clearInterval(this.fadeInterval);
			}
		}, 50);
	}

	private fadeOut(callback?: () => void) {
		if (this.fadeInterval) clearInterval(this.fadeInterval);

		let volume = this.audio.volume;
		const step = 0.02;

		this.fadeInterval = window.setInterval(() => {
			if (volume > 0) {
				volume -= step;
				this.audio.volume = Math.max(volume, 0);
			} else {
				if (this.fadeInterval) clearInterval(this.fadeInterval);
				if (callback) callback();
			}
		}, 50);
	}
}