import { PawPrint } from "lucide-react";

export function PawLoadingOverlay({ text = "Loading PawPal..." }: { text?: string }) {
  return (
    <div className="loading-indicator" role="status" aria-live="polite" aria-label={text}>
      <div className="paw-container">
        <PawPrint className="paw-icon" />
        <div className="loading-text">{text}</div>
      </div>
    </div>
  );
}

