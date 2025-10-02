import { useEffect, useState } from "react";

function useUserAudio() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAudio() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
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
  }, [stream]);

  return { stream, error };
}

export default useUserAudio;
