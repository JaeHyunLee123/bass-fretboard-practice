import { frequencyMap } from "@/constants/frequencyMap";

function App() {
  return (
    <div className="p-10 flex flex-col gap-2">
      <span> Hello world!</span>
      <ol className="flex flex-col gap-1">
        {Object.entries(frequencyMap).map(([key, value], i) => (
          <li key={i}>{`Frequency of ${key} is ${value}Hz`}</li>
        ))}
      </ol>
    </div>
  );
}

export default App;
