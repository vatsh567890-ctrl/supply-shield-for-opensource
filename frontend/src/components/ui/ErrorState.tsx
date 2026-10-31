import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "An error occurred",
  message,
  onRetry,
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`p-6 rounded-[12px] border border-[#A3213F]/20 bg-[#A3213F]/5 text-center shadow-[0_1px_2px_rgba(30,26,28,0.04)] ${className}`}
    >
      <div className="w-10 h-10 mx-auto mb-2.5 rounded-full bg-[#A3213F]/10 border border-[#A3213F]/20 flex items-center justify-center text-[#A3213F]">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-medium text-[#1E1A1C] mb-1">
        {title}
      </h4>
      <p className="text-xs text-[#6E6268] mb-4 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try again</span>
        </Button>
      )}
    </div>
  );
};
