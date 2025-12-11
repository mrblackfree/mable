"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 p-6 text-white">
          <div className="max-w-lg text-center">
            <h1 className="mb-4 text-4xl">⚠️ 오류 발생</h1>
            <p className="mb-6 text-zinc-400">
              게임 로딩 중 오류가 발생했습니다.
            </p>
            
            {/* 에러 정보 표시 */}
            <div className="mb-6 rounded-lg bg-red-900/50 p-4 text-left">
              <p className="mb-2 font-bold text-red-400">Error:</p>
              <pre className="overflow-x-auto text-sm text-red-300">
                {this.state.error?.message}
              </pre>
              
              {this.state.error?.stack && (
                <>
                  <p className="mb-2 mt-4 font-bold text-red-400">Stack:</p>
                  <pre className="max-h-40 overflow-auto text-xs text-red-300">
                    {this.state.error.stack}
                  </pre>
                </>
              )}
            </div>

            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-cyan-500 px-6 py-3 font-bold text-black hover:bg-cyan-400"
            >
              🔄 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

