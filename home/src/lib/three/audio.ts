import * as THREE from "three";

export class AudioAnalyzer {
  public audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private fftSize: number;

  constructor(fftSize: number = 2048) {
    this.fftSize = fftSize;
  }

  private initialize() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.smoothingTimeConstant = 0.8;
    }
  }

  public async initializeSystemAudio(): Promise<void> {
    try {
      this.initialize();
      if (!this.audioContext || !this.analyser) throw new Error("Audio context not initialized");

      // Try different methods to capture system audio
      try {
        // Method 1: Try getDisplayMedia first (Chrome/Edge)
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: true
        });
      } catch (displayError) {
        console.error("Error getting display media:", displayError);
        try {
          // Method 2: Try getUserMedia with system audio (Some browsers)
          this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              mandatory: {
                chromeMediaSource: 'desktop'
              }
            } as MediaTrackConstraints
          });
        } catch (userMediaError) {
          console.error("Error getting user media:", userMediaError);
          // Method 3: Fallback to basic audio input
          this.stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
        }
      }

      // Stop any video tracks if they exist
      this.stream.getVideoTracks().forEach(track => track.stop());

      if (!this.stream.getAudioTracks().length) {
        throw new Error("No audio track available. Please make sure audio is enabled.");
      }

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
    } catch (error) {
      console.error("Error accessing system audio:", error);
      throw error;
    }
  }

  public getWaveformData(): Float32Array {
    if (!this.analyser) throw new Error("Analyzer not initialized");
    const dataArray = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatTimeDomainData(dataArray);
    return dataArray;
  }

  public createWaveformGeometry(): THREE.BufferGeometry {
    if (!this.analyser) throw new Error("Analyzer not initialized");
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.analyser.frequencyBinCount * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }

  public updateWaveformGeometry(geometry: THREE.BufferGeometry): void {
    if (!this.analyser) return;
    const positions = geometry.attributes.position.array as Float32Array;
    const waveformData = this.getWaveformData();

    for (let i = 0; i < waveformData.length; i++) {
      const value = waveformData[i]; // Already normalized to [-1, 1]
      positions[i * 3] = (i / waveformData.length) * 2 - 1; // X coordinate
      positions[i * 3 + 1] = value; // Y coordinate
      positions[i * 3 + 2] = 0; // Z coordinate
    }

    geometry.attributes.position.needsUpdate = true;
  }

  public dispose(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.audioContext?.close();
  }
}
