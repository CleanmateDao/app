import { createContext, useContext, useState, ReactNode } from "react";

interface RecordingContextType {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(
  undefined
);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <RecordingContext.Provider value={{ isRecording, setIsRecording }}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    // Return default values if used outside provider (shouldn't happen, but safe fallback)
    return { isRecording: false, setIsRecording: () => {} };
  }
  return context;
}

