import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  data: {
    src: string;
  };
  className?: string;
  [key: string]: any;
}

export default function VideoPlayer({ data, className = '', ...props }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualities, setQualities] = useState<{ height: number; level: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);

  useEffect(() => {
    const config = {
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      manifestLoadingMaxRetry: 3,
      manifestLoadingRetryDelay: 1000,
      manifestLoadingMaxRetryTimeout: 64000,
      startLevel: -1,
      maxBufferSize: 60 * 1000 * 1000,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
    };

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls(config);
      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (_event: string, data: any) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels.map((level: any, index: number) => ({
          height: level.height,
          level: index
        }));
        setQualities(levels);
        setCurrentQuality(hls.currentLevel);
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(data.src);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        setCurrentQuality(data.level);
      });

      if (videoRef.current) {
        hls.attachMedia(videoRef.current);
      }

    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = data.src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [data.src]);

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        controls
        playsInline
        {...props}
        className={className}
      />
      {qualities.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <select
            value={currentQuality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
          >
            <option value={-1}>Auto</option>
            {qualities.map((quality) => (
              <option key={quality.level} value={quality.level}>
                {quality.height}p
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}