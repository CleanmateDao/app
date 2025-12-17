import { PinataSDK, UploadOptions } from "pinata";

// Pinata configuration from environment variables
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";
const PINATA_GATEWAY =
  import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";

// Initialize Pinata SDK
let pinata: PinataSDK | null = null;

function getPinataClient(): PinataSDK {
  if (!PINATA_JWT) {
    throw new Error(
      "Pinata JWT token is not configured. Please set VITE_PINATA_JWT environment variable."
    );
  }

  if (!pinata) {
    pinata = new PinataSDK({
      pinataJwt: PINATA_JWT,
      pinataGateway: PINATA_GATEWAY,
    });
  }

  return pinata;
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param data - The data object to upload as JSON
 * @param name - Optional name for the file
 * @returns IPFS hash (CID)
 */
export async function uploadJSONToIPFS(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  name?: string
): Promise<string> {
  try {
    const client = getPinataClient();

    const options: UploadOptions = {
      metadata: {
        name: name || `data-${Date.now()}`,
      },
    };

    const result = await client.upload.public.json(data, options);

    // Return the IPFS hash (CID)
    return result.cid;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw new Error(
      `Failed to upload JSON to IPFS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Upload a file to IPFS via Pinata
 * @param file - The file to upload
 * @param name - Optional name for the file
 * @returns IPFS hash (CID)
 */
export async function uploadFileToIPFS(
  file: File,
  name?: string
): Promise<string> {
  try {
    const client = getPinataClient();

    const options: UploadOptions = {
      metadata: {
        name: name || file.name,
      },
    };

    const result = await client.upload.public.file(file, options);

    // Return the IPFS hash (CID)
    return result.cid;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error(
      `Failed to upload file to IPFS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Upload multiple files to IPFS via Pinata
 * @param files - Array of files to upload
 * @returns Array of IPFS hashes (CIDs) in the same order as input files
 */
export async function uploadFilesToIPFS(files: File[]): Promise<string[]> {
  try {
    const client = getPinataClient();

    const uploadPromises = files.map((file) => uploadFileToIPFS(file));
    const results = await Promise.all(uploadPromises);

    return results;
  } catch (error) {
    console.error("Error uploading files to IPFS:", error);
    throw new Error(
      `Failed to upload files to IPFS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Convert an IPFS CID or ipfs:// URI to a HTTP gateway URL using the configured Pinata gateway.
 */
export function toIPFSGatewayUrl(ipfsHashOrUri: string): string {
  const input = ipfsHashOrUri.trim();
  if (!input) return "";
  const hash = input.replace(/^ipfs:\/\//, "");
  // If the user already stored an http(s) URL, just return it.
  if (/^https?:\/\//i.test(hash)) return hash;
  return `https://${PINATA_GATEWAY}/ipfs/${hash}`;
}

/**
 * Upload participant ratings as JSON to IPFS
 * This is specifically for proof of work submissions
 * @param ratings - Array of participant ratings
 * @param cleanupId - The cleanup ID this rating belongs to
 * @returns IPFS hash (CID) of the ratings JSON
 */
export interface ParticipantRating {
  participantId: string;
  participantAddress: string;
  participantName: string;
  rating: number;
  ratedAt: string;
  ratedBy?: string; // Address of the person who rated
}

export async function uploadParticipantRatingsToIPFS(
  ratings: ParticipantRating[],
  cleanupId: string
): Promise<string> {
  const ratingsData = {
    cleanupId,
    ratings,
    uploadedAt: new Date().toISOString(),
    version: "1.0",
  };

  return uploadJSONToIPFS(ratingsData, `cleanup-${cleanupId}-ratings`);
}

/**
 * Retrieve JSON data from IPFS via Pinata gateway
 * @param ipfsHash - The IPFS hash (CID) to retrieve
 * @returns The parsed JSON data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getJSONFromIPFS<T = any>(ipfsHash: string): Promise<T> {
  try {
    // Remove ipfs:// prefix if present
    const hash = ipfsHash.replace(/^ipfs:\/\//, "");

    const url = `https://${PINATA_GATEWAY}/ipfs/${hash}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error retrieving JSON from IPFS:", error);
    throw new Error(
      `Failed to retrieve JSON from IPFS: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
