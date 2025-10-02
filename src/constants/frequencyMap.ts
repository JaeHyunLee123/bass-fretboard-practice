// Note name type definition
export type NoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

// Note name with octave (e.g., A4, C#3)
export type NoteWithOctave = `${NoteName}${number}`;

// Frequency mapping object type
export interface FrequencyMap {
  [note: string]: number;
}

/**
 * Frequency calculation based on 12-TET (12-tone equal temperament)
 * Reference: A4 = 440Hz
 */
function getFrequency(noteIndex: number): number {
  return 440 * Math.pow(2, (noteIndex - 49) / 12);
}

/**
 * Generate note-to-frequency mapping
 * A0 = index 1, A4 = index 49
 * Based on the full piano range (A0 ~ C8)
 */
export const frequencyMap: FrequencyMap = (() => {
  const notes: NoteName[] = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
  ];
  const map: FrequencyMap = {};

  let index = 1;
  for (let octave = 0; octave <= 8; octave++) {
    for (const note of notes) {
      if (index > 88) break; // limit to 88-key piano range
      const noteName: NoteWithOctave = `${note}${octave}`;
      map[noteName] = parseFloat(getFrequency(index).toFixed(2));
      index++;
    }
  }
  return map;
})();
