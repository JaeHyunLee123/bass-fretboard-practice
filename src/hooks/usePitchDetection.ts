import { useEffect, useState } from "react";
import useUserAudio from "@/hooks/useUserAudio"; // Custom hook to get user audio input

const FFT_SIZE = 2048;

function usePitchDetection() {
  const { stream, error: audioError } = useUserAudio();
  const [pitch, setPitch] = useState<number | null>(null); // Detected pitch in Hz

  useEffect(() => {
    if (!stream) return; // Exit if no audio stream

    // Create Web Audio API context
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    // Create an analyser node for frequency analysis
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = FFT_SIZE; // Set FFT size for resolution
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength); // Array to hold time-domain data

    // Function to continuously detect pitch
    function detectPitch() {
      analyser.getFloatTimeDomainData(dataArray); // Get waveform data
      const frequency = autoCorrelate(dataArray, audioContext.sampleRate); // Calculate pitch
      if (frequency) setPitch(frequency); // Update pitch state if detected
      requestAnimationFrame(detectPitch); // Loop for real-time detection
    }

    detectPitch();

    // Clean up AudioContext on component unmount
    return () => {
      audioContext.close();
    };
  }, [stream]);

  return { pitch, error: audioError };
}

/**
 * Auto-correlation based pitch detection
 * @param buffer Float32Array of audio samples
 * @param sampleRate Audio sample rate
 * @returns Detected frequency in Hz or null if no signal
 */
function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number
): number | null {
  let SIZE = buffer.length;
  let rms = 0;

  // Compute Root Mean Square to detect if signal is strong enough
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // Ignore very quiet signals

  // Find bounds where signal is significant
  let r1 = 0,
    r2 = SIZE - 1;
  for (let i = 0; i < SIZE / 2; i++)
    if (Math.abs(buffer[i]) < 0.02) {
      r1 = i;
      break;
    }
  for (let i = 1; i < SIZE / 2; i++)
    if (Math.abs(buffer[SIZE - i]) < 0.02) {
      r2 = SIZE - i;
      break;
    }

  buffer = buffer.slice(r1, r2);
  SIZE = buffer.length;

  // Auto-correlation: compare signal with delayed version of itself
  const c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE - i; j++) c[i] += buffer[j] * buffer[j + i];

  // Find the first minimum after correlation peak
  let d = 0;
  while (c[d] > c[d + 1]) d++;

  // Find the maximum correlation value after first minimum
  let maxval = -1,
    maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  const T0 = maxpos;

  // Convert period T0 to frequency in Hz
  return sampleRate / T0;
}

export default usePitchDetection;
