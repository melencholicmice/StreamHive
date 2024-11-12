import Hls from "hls.js";
import { useEffect, useRef } from "react";

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

  useEffect(() => {
    // Configuration for HLS
    const config = {
      debug: true,
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      manifestLoadingMaxRetry: 3,
      manifestLoadingRetryDelay: 1000,
      manifestLoadingMaxRetryTimeout: 64000,
      startLevel: -1,
      defaultAudioCodec: undefined,
      // Adjust buffer size settings
      maxBufferSize: 60 * 1000 * 1000, // 60MB
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
    };

    if (Hls.isSupported()) {
      // Cleanup previous instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      // Create new instance
      const hls = new Hls(config);
      hlsRef.current = hls;

      // Error handling
      hls.on(Hls.Events.ERROR, (event: string, data: any) => {
        console.error('HLS Error:', event, data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error encountered, trying to recover...');
              hls.startLoad();
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error encountered, trying to recover...');
              // handleMediaError(hls);
              break;
              
            default:
              console.log('Fatal error, cannot recover');
              hls.destroy();
              break;
          }
        }
      });

      // Loading handlers
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('Manifest loaded successfully');
      });

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('Media attached successfully');
        hls.loadSource(data.src);
      });

      // Attach media
      if (videoRef.current) {
        hls.attachMedia(videoRef.current);
      }

    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // For browsers that support HLS natively (Safari)
      videoRef.current.src = data.src;
    } else {
      console.error('HLS is not supported in this browser');
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [data.src]);

  // Helper function to handle media errors


  return (
    <video
      ref={videoRef}
      controls
      playsInline // Better mobile support
      {...props}
      className={className}
    />
  );
}