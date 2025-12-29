/**
 * Recording utilities for streak submission
 */

export interface RecordingConfig {
  maxDuration: number; // in milliseconds
  minDuration: number; // in milliseconds
  mimeType?: string;
}

const DEFAULT_CONFIG: RecordingConfig = {
  maxDuration: 5000, // 5 seconds
  minDuration: 2000, // 2 seconds
  mimeType: "video/webm;codecs=vp8", // Video only, no audio codec
};

export interface MediaItem {
  id: string;
  blob: Blob;
  url: string;
  mimeType: string;
  duration?: number;
}

/**
 * Start recording from a media stream
 */
export function startRecording(
  stream: MediaStream,
  config: RecordingConfig = DEFAULT_CONFIG
): {
  mediaRecorder: MediaRecorder;
  chunks: Blob[];
} {
  const chunks: Blob[] = [];
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: config.mimeType || DEFAULT_CONFIG.mimeType,
  });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.start(100);
  return { mediaRecorder, chunks };
}

/**
 * Process recorded chunks and create media item
 * This should be called from within the onstop handler
 */
export function processRecording(
  chunks: Blob[],
  minDuration: number = DEFAULT_CONFIG.minDuration
): Promise<MediaItem> {
  return new Promise((resolve, reject) => {
    const blob = new Blob(chunks, { type: "video/webm" });

    if (blob.size === 0) {
      reject(new Error("The recorded video is empty. Please try again."));
      return;
    }

    const url = URL.createObjectURL(blob);
    const mimeType = blob.type || "video/webm";
    const mediaId = `media-${Date.now()}-${Math.random()}`;

    // Calculate video duration
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => {
      const durationMs = video.duration * 1000;
      if (durationMs < minDuration) {
        URL.revokeObjectURL(url);
        reject(
          new Error(
            `Video must be at least ${
              minDuration / 1000
            } seconds long. Please record again.`
          )
        );
        return;
      }

      resolve({
        id: mediaId,
        blob,
        url,
        mimeType,
        duration: video.duration,
      });
    };
    video.onerror = () => {
      // Still resolve with media item even if duration can't be calculated
      resolve({
        id: mediaId,
        blob,
        url,
        mimeType,
      });
    };
  });
}

/**
 * Stop recording and create media item
 * Note: The onstop handler must be set BEFORE calling this function
 * @deprecated Use processRecording instead when handling onstop event
 */
export function stopRecording(
  mediaRecorder: MediaRecorder,
  chunks: Blob[],
  minDuration: number = DEFAULT_CONFIG.minDuration
): Promise<MediaItem> {
  return new Promise((resolve, reject) => {
    // Set handler BEFORE stopping
    mediaRecorder.onstop = async () => {
      try {
        const mediaItem = await processRecording(chunks, minDuration);
        resolve(mediaItem);
      } catch (error) {
        reject(error);
      }
    };

    if (mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    } else {
      // If already stopped, resolve immediately with empty result
      reject(new Error("MediaRecorder is already stopped"));
    }
  });
}
