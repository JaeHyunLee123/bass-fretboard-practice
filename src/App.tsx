import { frequencyMap } from "@/constants/frequencyMap";

function App() {
  const frequency = frequencyMap["A4"];
  return (
    <div className="p-10 flex flex-col items-center">
      <span> Hello world!</span>
      <span>{`Frequency of A4 is ${frequency}`}</span>
    </div>
  );
}

export default App;
