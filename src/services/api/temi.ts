import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { temiClient } from "../clients/temi";

export interface TemiMessage {
  role: string;
  content: string;
}

export interface TemiChatRequest {
  message: string;
  history?: TemiMessage[];
}

export interface TemiChatResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Send a chat message to the Temi AI agent
 */
async function sendChatMessage(
  data: TemiChatRequest
): Promise<TemiChatResponse> {
  try {
    const response = await temiClient.post<TemiChatResponse>(`/chat`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to send message to Temi"
      );
    }
    throw error;
  }
}

/**
 * React hook for sending chat messages to Temi AI agent
 */
export function useTemiChat() {
  return useMutation({
    mutationFn: sendChatMessage,
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });
}
