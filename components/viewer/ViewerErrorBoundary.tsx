'use client';

import { Component, ReactNode } from 'react';
import { useViewerStore } from '@/store/viewerStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ViewerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch() {
    // Hide the loading spinner so it doesn't spin forever
    useViewerStore.getState().setLoading(false);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-950">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className="text-zinc-600"
          >
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-zinc-500 text-sm">Could not load 3D model</p>
          <p className="text-zinc-700 text-xs font-mono max-w-xs text-center break-all">
            {this.state.message}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
