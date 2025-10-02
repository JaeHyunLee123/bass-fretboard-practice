import { useEffect, useState } from "react";

function useUserAudio(selectedDeviceId?: string) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAudio() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : true,
        });
        setStream(mediaStream);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("unknown error");
        }
      }
    }

    initAudio();

    // 컴포넌트 언마운트 시 스트림 해제
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [stream, selectedDeviceId]);

  return { stream, error };
}

export default useUserAudio;
