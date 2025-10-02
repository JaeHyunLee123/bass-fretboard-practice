import { useEffect, useState, useRef } from "react";
import useUserAudio from "@/hooks/useUserAudio"; // Custom hook to get user audio input

const FFT_SIZE = 2048; // Size of the FFT for analyser
const SAMPLE_WINDOW_MS = 300; // Time window to average pitch in milliseconds

function usePitchDetection(selectedDeviceId?: string) {
  // Reuse useUserAudio hook to get MediaStream from selected device
  const { stream, error: audioError } = useUserAudio(selectedDeviceId);
  const [pitch, setPitch] = useState<number | null>(null); // Detected pitch in Hz

  // Ref to store pitch samples collected during the averaging window
  const bufferRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(Date.now()); // Timestamp of last pitch update

  useEffect(() => {
    if (!stream) return; // Exit if no audio stream available

    // Create an AudioContext for Web Audio API processing
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);

    // Create an AnalyserNode to extract waveform data for pitch detection
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength); // Array to hold time-domain audio samples

    // Function to continuously detect pitch in real-time
    function detectPitch() {
      analyser.getFloatTimeDomainData(dataArray); // Fill dataArray with current waveform
      const frequency = autoCorrelate(dataArray, audioContext.sampleRate); // Estimate pitch

      if (frequency) {
        bufferRef.current.push(frequency); // Store pitch sample for averaging
      }

      const now = Date.now();
      if (now - lastUpdateRef.current >= SAMPLE_WINDOW_MS) {
        // If the sample window duration has passed, compute the average pitch
        if (bufferRef.current.length > 0) {
          const sum = bufferRef.current.reduce((a, b) => a + b, 0); // Sum all collected frequencies
          setPitch(sum / bufferRef.current.length); // Update pitch state with the average
          bufferRef.current = []; // Clear buffer for next window
        }
        lastUpdateRef.current = now; // Update timestamp
      }

      requestAnimationFrame(detectPitch); // Continue real-time detection
    }

    detectPitch(); // Start detection loop

    // Clean up AudioContext when component unmounts
    return () => {
      audioContext.close();
    };
  }, [stream]);

  return { pitch, error: audioError };
}

/**
 * Auto-correlation based pitch detection algorithm
 * Converts time-domain audio samples into estimated frequency
 *
 * @param buffer Float32Array containing waveform samples
 * @param sampleRate AudioContext's sample rate
 * @returns Estimated frequency in Hz, or null if no significant signal detected
 */
function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number
): number | null {
  let SIZE = buffer.length;
  let rms = 0;

  // Compute root mean square (RMS) to measure signal strength
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // Ignore very quiet signals

  // Find the first and last index where signal is above noise threshold
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

  buffer = buffer.slice(r1, r2); // Keep only significant part of the signal
  SIZE = buffer.length;

  // Auto-correlation: compare signal with delayed copies of itself
  const c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE - i; j++) c[i] += buffer[j] * buffer[j + i];

  // Find the first minimum after the initial correlation peak
  let d = 0;
  while (c[d] > c[d + 1]) d++;

  // Find the maximum correlation value after first minimum (fundamental period)
  let maxval = -1,
    maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  const T0 = maxpos; // Estimated period of the waveform

  // Convert period to frequency in Hz
  return sampleRate / T0;
}

export default usePitchDetection;
