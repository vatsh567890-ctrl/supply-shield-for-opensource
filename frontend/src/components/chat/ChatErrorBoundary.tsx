"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

export class ChatErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === "development") {
      console.error("ChatWidget error caught by boundary:", error, errorInfo);
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed bottom-6 right-6 z-40 p-3 rounded-lg bg-white border border-[#F0DCE2] shadow-sm text-xs text-[#6E6268]">
          <span className="text-[#A3213F] font-medium">Assistant unavailable</span>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="ml-2 underline text-[#B8556B] hover:opacity-80"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

