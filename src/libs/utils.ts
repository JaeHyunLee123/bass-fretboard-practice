import { frequencyMap, type NoteWithOctave } from "@/constants/frequencyMap";

const sortedFrequencies = Object.entries(frequencyMap)
  .map(([note, freq]) => ({ note: note as NoteWithOctave, freq }))
  .sort((a, b) => a.freq - b.freq);

/**
 * Find the closest note using binary search
 */
export function getClosestNote(frequency: number): NoteWithOctave {
  let left = 0;
  let right = sortedFrequencies.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midFreq = sortedFrequencies[mid].freq;

    if (midFreq === frequency) return sortedFrequencies[mid].note;
    else if (midFreq < frequency) left = mid + 1;
    else right = mid - 1;
  }

  const leftDiff =
    left < sortedFrequencies.length
      ? Math.abs(sortedFrequencies[left].freq - frequency)
      : Infinity;
  const rightDiff =
    right >= 0 ? Math.abs(sortedFrequencies[right].freq - frequency) : Infinity;

  return leftDiff < rightDiff
    ? sortedFrequencies[left].note
    : sortedFrequencies[right].note;
}
