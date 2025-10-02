import { frequencyMap } from "@/constants/frequencyMap";
import usePitchDetection from "@/hooks/usePitchDetection";
import { getClosestNote } from "@/libs/utils";

function App() {
  const { pitch } = usePitchDetection();

  return (
    <div className="p-10 flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Frequency</h3>
      <span>{`Detected frequency: ${pitch}`}</span>
      <span>{`Detected note: ${pitch ? getClosestNote(pitch) : "none"}`}</span>

      <h3 className="text-lg font-semibold">All frequency</h3>
      <ol className="flex flex-col gap-1">
        {Object.entries(frequencyMap).map(([key, value], i) => (
          <li key={i}>{`Frequency of ${key} is ${value}Hz`}</li>
        ))}
      </ol>
    </div>
  );
}

export default App;
