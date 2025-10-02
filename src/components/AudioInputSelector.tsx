import usePitchDetection from "@/hooks/usePitchDetection";
import { getClosestNote } from "@/libs/utils";
import { useEffect, useState } from "react";

export default function AudioInputSelector() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(
    undefined
  );

  // Get all available audio input devices
  useEffect(() => {
    async function fetchDevices() {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices.filter((d) => d.kind === "audioinput"));
      if (allDevices.length > 0 && !selectedDevice) {
        const firstDevice = allDevices.find((d) => d.kind === "audioinput");
        if (firstDevice) setSelectedDevice(firstDevice.deviceId);
      }
    }
    fetchDevices();
  }, [selectedDevice]);
  const { pitch, error: audioError } = usePitchDetection(selectedDevice);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Select Audio Input</h2>

      <select
        value={selectedDevice}
        onChange={(e) => setSelectedDevice(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Device ${device.deviceId}`}
          </option>
        ))}
      </select>

      <div className="mt-6 text-center">
        {audioError && <p className="text-red-500 mb-2">Error: {audioError}</p>}
        <p className="text-lg font-medium">
          Current Pitch: {pitch ? pitch.toFixed(2) + " Hz" : "Listening..."}
        </p>
        <p className="text-lg font-medium">
          Current Note: {pitch ? getClosestNote(pitch) : "Listening..."}
        </p>
      </div>
    </div>
  );
}
