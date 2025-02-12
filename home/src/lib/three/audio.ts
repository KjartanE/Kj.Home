import * as THREE from "three";

export class AudioAnalyzer {
  public audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private fftSize: number;
  private previousWaveformData: Float32Array | null = null;
  private interpolationFactor = 0.3; // Adjust this value between 0 and 1 for different smoothing levels

  constructor(fftSize: number = 2048) {
    this.fftSize = fftSize;
  }

  private initialize() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.65; // Increased for smoother transitions
      this.analyser.minDecibels = -90; // Adjusted for better dynamic range
      this.analyser.maxDecibels = -10;
      this.previousWaveformData = new Float32Array(this.analyser.frequencyBinCount);
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
                chromeMediaSource: "desktop"
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
      this.stream.getVideoTracks().forEach((track) => track.stop());

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
    const currentWaveformData = this.getWaveformData();

    // Initialize previous data if needed
    if (!this.previousWaveformData) {
      this.previousWaveformData = new Float32Array(currentWaveformData);
    }

    for (let i = 0; i < currentWaveformData.length; i++) {
      // Interpolate between previous and current values
      const currentValue = currentWaveformData[i];
      const previousValue = this.previousWaveformData[i];
      const interpolatedValue = previousValue + (currentValue - previousValue) * this.interpolationFactor;

      // Apply additional smoothing for high-frequency changes
      const smoothedValue = interpolatedValue * 0.8;

      // Update positions
      const x = (i / currentWaveformData.length) * 2 - 1;
      positions[i * 3] = x;
      positions[i * 3 + 1] = smoothedValue;
      positions[i * 3 + 2] = 0;

      // Store the interpolated value for next frame
      this.previousWaveformData[i] = interpolatedValue;
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
