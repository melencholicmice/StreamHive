import React, { useRef, useEffect } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-http-source-selector";

interface VideoPlayerProps {
  videoSource: string;
  onVideoEnd?: () => void; // Add callback for video end
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const { videoSource, onVideoEnd } = props;

  const videoPlayerOptions = {
    fluid: true,
    controls: true,
    autoplay: true,
    playbackRates: [0.5, 1, 1.5, 2],
    controlBar: {
      playToggle: true,
      volumePanel: {
        inline: false,
      },
      fullscreenToggle: true,
      currentTimeDisplay: true,
      timeDivider: true,
      durationDisplay: true,
      remainingTimeDisplay: true,
      progressControl: {
        seekBar: true
      }
    },
    plugins: {
      httpSourceSelector: { default: 'auto' },
    },
    sources: [
      {
        src: videoSource,
        type: "application/x-mpegURL",
      },
    ],
  };

  const handlePlayerReady = (player: VideoJsPlayer) => {
    playerRef.current = player;

    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });

    player.on("ended", () => {
      videojs.log("video ended");
      if (onVideoEnd) {
        onVideoEnd();
      }
    });

    player.on("loadedmetadata", () => {
      player.duration(); // This ensures duration is properly loaded
    });
  };

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      if (videoRef.current) {
        videoRef.current.appendChild(videoElement);
      }

      const player = (playerRef.current = videojs(videoElement, videoPlayerOptions, () => {
        videojs.log("player is ready");
        handlePlayerReady(player);
      }));
    } else {
      const player = playerRef.current;

      player.autoplay(videoPlayerOptions.autoplay);
      player.src(videoPlayerOptions.sources);
    }
  }, [videoSource]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player>
      <div ref={videoRef} style={{ width: '100%' }} />
    </div>
  );
};

export default VideoPlayer;