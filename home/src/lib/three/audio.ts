import * as THREE from "three";

export class AudioAnalyzer {
  public audioContext: AudioContext | null = null;
  private leftAnalyser: AnalyserNode | null = null;
  private rightAnalyser: AnalyserNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private source: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private fftSize: number;
  private previousLeftData: Float32Array | null = null;
  private previousRightData: Float32Array | null = null;
  private interpolationFactor = 0.3; // Adjust this value between 0 and 1 for different smoothing levels
  private frequencyDataLeft: Float32Array | null = null;
  private frequencyDataRight: Float32Array | null = null;

  constructor(fftSize: number = 2048) {
    this.fftSize = fftSize;
  }

  private initialize() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      
      // Create stereo channel splitter
      this.splitter = this.audioContext.createChannelSplitter(2);
      
      // Create analyzers for both channels
      this.leftAnalyser = this.audioContext.createAnalyser();
      this.rightAnalyser = this.audioContext.createAnalyser();
      
      // Configure both analyzers
      [this.leftAnalyser, this.rightAnalyser].forEach(analyser => {
        if (analyser) {
          analyser.fftSize = this.fftSize;
          analyser.smoothingTimeConstant = 0.65;
          analyser.minDecibels = -90;
          analyser.maxDecibels = -10;
        }
      });

      // Connect splitter to analyzers
      this.splitter.connect(this.leftAnalyser, 0);  // Left channel
      this.splitter.connect(this.rightAnalyser, 1); // Right channel
    }
  }

  public async initializeSystemAudio(): Promise<void> {
    try {
      this.initialize();
      if (!this.audioContext || !this.splitter) throw new Error("Audio context not initialized");

      try {
        // Method 1: Try getDisplayMedia with explicit stereo
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          audio: {
            channelCount: 2,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          },
          video: true
        });
      } catch (displayError) {
        console.error("Error getting display media:", displayError);
        try {
          // Method 2: Fallback to getUserMedia with stereo settings
          this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 2,
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            },
            video: true
          });
        } catch (userMediaError) {
          console.error("Error getting user media:", userMediaError);
        }
      }

      // Stop any video tracks if they exist
      this.stream?.getVideoTracks().forEach((track) => track.stop());

      if (!this.stream?.getAudioTracks().length) {
        throw new Error("No audio track available. Please make sure audio is enabled.");
      }

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.splitter);
    } catch (error) {
      console.error("Error accessing system audio:", error);
      throw error;
    }
  }

  public getWaveformData(): { left: Float32Array; right: Float32Array } {
    if (!this.leftAnalyser || !this.rightAnalyser) throw new Error("Analyzers not initialized");
    
    const leftData = new Float32Array(this.leftAnalyser.frequencyBinCount);
    const rightData = new Float32Array(this.rightAnalyser.frequencyBinCount);
    
    this.leftAnalyser.getFloatTimeDomainData(leftData);
    this.rightAnalyser.getFloatTimeDomainData(rightData);
    
    return { left: leftData, right: rightData };
  }

  public createWaveformGeometry(): THREE.BufferGeometry {
    if (!this.leftAnalyser || !this.rightAnalyser) throw new Error("Analyzers not initialized");
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.leftAnalyser.frequencyBinCount * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }

  public updateWaveformGeometry(leftGeometry: THREE.BufferGeometry, rightGeometry: THREE.BufferGeometry): void {
    if (!this.leftAnalyser || !this.rightAnalyser) return;
    
    const leftPositions = leftGeometry.attributes.position.array as Float32Array;
    const rightPositions = rightGeometry.attributes.position.array as Float32Array;
    const { left: leftData, right: rightData } = this.getWaveformData();

    // Initialize previous data if needed
    if (!this.previousLeftData) {
      this.previousLeftData = new Float32Array(leftData);
      this.previousRightData = new Float32Array(rightData);
    }

    // Update both channels
    [
      { data: leftData, prev: this.previousLeftData!, positions: leftPositions, xOffset: -0.02, yOffset: 0 },
      { data: rightData, prev: this.previousRightData!, positions: rightPositions, xOffset: 0.02, yOffset: 0.1 } // More noticeable offset
    ].forEach(({ data, prev, positions, xOffset, yOffset }) => {
      for (let i = 0; i < data.length; i++) {
        const currentValue = data[i];
        const previousValue = prev[i] || 0;
        const interpolatedValue = previousValue + (currentValue - previousValue) * this.interpolationFactor;
        const smoothedValue = interpolatedValue * 0.8;

        const x = (i / data.length) * 2 - 1;
        positions[i * 3] = x + xOffset;  // Add X offset
        positions[i * 3 + 1] = smoothedValue + yOffset;  // Add Y offset
        positions[i * 3 + 2] = 0;

        prev[i] = interpolatedValue;
      }
    });

    leftGeometry.attributes.position.needsUpdate = true;
    rightGeometry.attributes.position.needsUpdate = true;
  }

  public getFrequencyData(): { left: Float32Array; right: Float32Array } {
    if (!this.leftAnalyser || !this.rightAnalyser) throw new Error("Analyzers not initialized");
    
    if (!this.frequencyDataLeft || !this.frequencyDataRight) {
      this.frequencyDataLeft = new Float32Array(this.leftAnalyser.frequencyBinCount);
      this.frequencyDataRight = new Float32Array(this.rightAnalyser.frequencyBinCount);
    }
    
    this.leftAnalyser.getFloatFrequencyData(this.frequencyDataLeft);
    this.rightAnalyser.getFloatFrequencyData(this.frequencyDataRight);
    
    return { 
      left: this.frequencyDataLeft,
      right: this.frequencyDataRight 
    };
  }

  public createFrequencyGeometry(): THREE.BufferGeometry {
    if (!this.leftAnalyser || !this.rightAnalyser) throw new Error("Analyzers not initialized");
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.leftAnalyser.frequencyBinCount * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }

  public updateFrequencyGeometry(
    leftGeometry: THREE.BufferGeometry,
    rightGeometry: THREE.BufferGeometry,
    colorCallback?: (normalizedValue: number, index: number) => void
  ): void {
    if (!this.leftAnalyser || !this.rightAnalyser) return;
    
    const leftPositions = leftGeometry.attributes.position.array as Float32Array;
    const rightPositions = rightGeometry.attributes.position.array as Float32Array;
    const { left: leftData, right: rightData } = this.getFrequencyData();

    // Update both channels
    [
      { data: leftData, positions: leftPositions, xOffset: -0.02, yOffset: -0.5 },
      { data: rightData, positions: rightPositions, xOffset: 0.02, yOffset: -0.5 }
    ].forEach(({ data, positions, xOffset, yOffset }) => {
      for (let i = 0; i < data.length; i++) {
        // Convert dB to normalized value (typically -100 to 0 range to 0 to 1)
        const normalizedValue = (data[i] + 100) / 100;
        const value = Math.max(0, Math.min(1, normalizedValue)) * 0.5; // Scale to reasonable height

        const x = (i / data.length) * 2 - 1;
        positions[i * 3] = x + xOffset;
        positions[i * 3 + 1] = value + yOffset;
        positions[i * 3 + 2] = 0;

        // Update colors if callback is provided
        if (colorCallback) {
          colorCallback(normalizedValue, i);
        }
      }
    });

    leftGeometry.attributes.position.needsUpdate = true;
    rightGeometry.attributes.position.needsUpdate = true;
  }

  public dispose(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.source?.disconnect();
    this.leftAnalyser?.disconnect();
    this.rightAnalyser?.disconnect();
    this.splitter?.disconnect();
    this.audioContext?.close();
  }
}
