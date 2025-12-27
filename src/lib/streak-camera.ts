/**
 * Camera utilities for streak submission
 */

export interface CameraConfig {
  facingMode?: "user" | "environment";
  width?: { ideal: number };
  height?: { ideal: number };
  zoom?: number;
}

const DEFAULT_ZOOM = 0.5;

/**
 * Initialize camera with specified configuration
 */
export async function initCamera(
  videoElement: HTMLVideoElement | null,
  config: CameraConfig = {}
): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: config.facingMode || "environment",
        width: config.width || { ideal: 1080 },
        height: config.height || { ideal: 1920 },
      },
      audio: true,
    });

    // Set zoom
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack && videoTrack.getCapabilities) {
      const capabilities = videoTrack.getCapabilities() as Record<
        string,
        unknown
      >;
      if (capabilities.zoom) {
        try {
          const zoomValue = config.zoom ?? DEFAULT_ZOOM;
          await videoTrack.applyConstraints({
            advanced: [{ zoom: zoomValue } as unknown as MediaTrackConstraints],
          });
        } catch (zoomError) {
          console.warn(
            `Could not set zoom to ${config.zoom ?? DEFAULT_ZOOM}x:`,
            zoomError
          );
        }
      }
    }

    if (videoElement) {
      videoElement.srcObject = stream;
      // Ensure video is set to play
      videoElement.muted = true;
      videoElement.playsInline = true;
      try {
        await videoElement.play();
      } catch (playError) {
        console.warn("Video play error:", playError);
        // Try to play again after a short delay
        setTimeout(() => {
          videoElement.play().catch(console.error);
        }, 100);
      }
    }

    return stream;
  } catch (error) {
    console.error("Error initializing camera:", error);
    throw error;
  }
}

/**
 * Stop camera stream and clean up
 */
export function stopCamera(stream: MediaStream | null): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}
