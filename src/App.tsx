import { frequencyMap } from "@/constants/frequencyMap";
import { getClosestNote } from "@/libs/utils";
import { useState } from "react";

function App() {
  const [frequency, setFrequency] = useState(440);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    setFrequency(Number(e.target.value));
  };

  return (
    <div className="p-10 flex flex-col gap-2">
      <label>Enter frequency</label>
      <input
        type="number"
        value={frequency}
        onChange={handleInputChange}
        className="border p-1"
      />
      <span>{`Frequency of ${frequency} is ${getClosestNote(frequency)}`}</span>
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
