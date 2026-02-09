"use client";

import {
  AlertTriangle,
  Ban,
  Clock,
  FileQuestion,
  RefreshCw,
  ServerCrash,
  ShieldX,
  WifiOff,
  FolderX,
  Lock,
  Construction,
  CircleSlash,
} from "lucide-react";
import { ReactNode } from "react";

// Error types
export type ErrorType =
  | "not_found"
  | "network"
  | "server"
  | "timeout"
  | "forbidden"
  | "unauthorized"
  | "bad_request"
  | "method_not_allowed"
  | "gone"
  | "rate_limit"
  | "maintenance"
  | "unknown"
  // HTTP status codes as strings
  | "400"
  | "401"
  | "403"
  | "404"
  | "405"
  | "408"
  | "410"
  | "429"
  | "500"
  | "501"
  | "502"
  | "503"
  | "504";

export interface ErrorConfig {
  icon: ReactNode;
  title: string;
  message: string;
  details?: string;
  color: string;
  canRetry: boolean;
}

// Error configurations
const errorConfigs: Record<string, ErrorConfig> = {
  // Named errors
  not_found: {
    icon: <FileQuestion className="w-16 h-16" />,
    title: "Not Found",
    message: "The resource you're looking for doesn't exist",
    details: "It may have been removed, renamed, or the link is incorrect.",
    color: "text-amber-500",
    canRetry: false,
  },
  network: {
    icon: <WifiOff className="w-16 h-16" />,
    title: "Connection Error",
    message: "Unable to connect to the server",
    details: "Please check your internet connection and try again.",
    color: "text-red-500",
    canRetry: true,
  },
  server: {
    icon: <ServerCrash className="w-16 h-16" />,
    title: "Server Error",
    message: "Something went wrong on our end",
    details: "Our servers are having issues. Please try again later.",
    color: "text-red-500",
    canRetry: true,
  },
  timeout: {
    icon: <Clock className="w-16 h-16" />,
    title: "Request Timeout",
    message: "The server took too long to respond",
    details: "Please try again or check back later.",
    color: "text-yellow-500",
    canRetry: true,
  },
  forbidden: {
    icon: <Ban className="w-16 h-16" />,
    title: "Access Forbidden",
    message: "You don't have permission to access this",
    details: "Contact the administrator if you believe this is a mistake.",
    color: "text-red-500",
    canRetry: false,
  },
  unauthorized: {
    icon: <Lock className="w-16 h-16" />,
    title: "Unauthorized",
    message: "Authentication required",
    details: "Please log in to access this content.",
    color: "text-orange-500",
    canRetry: false,
  },
  bad_request: {
    icon: <CircleSlash className="w-16 h-16" />,
    title: "Bad Request",
    message: "Invalid request",
    details: "The request could not be understood by the server.",
    color: "text-orange-500",
    canRetry: false,
  },
  method_not_allowed: {
    icon: <ShieldX className="w-16 h-16" />,
    title: "Method Not Allowed",
    message: "This action is not permitted",
    details: "The requested method is not supported.",
    color: "text-red-500",
    canRetry: false,
  },
  gone: {
    icon: <FolderX className="w-16 h-16" />,
    title: "Gone",
    message: "This content has been permanently removed",
    details: "The resource is no longer available.",
    color: "text-zinc-500",
    canRetry: false,
  },
  rate_limit: {
    icon: <Clock className="w-16 h-16" />,
    title: "Too Many Requests",
    message: "You're making requests too quickly",
    details: "Please wait a moment before trying again.",
    color: "text-yellow-500",
    canRetry: true,
  },
  maintenance: {
    icon: <Construction className="w-16 h-16" />,
    title: "Under Maintenance",
    message: "We're performing scheduled maintenance",
    details: "Please check back in a few minutes.",
    color: "text-blue-500",
    canRetry: true,
  },
  unknown: {
    icon: <AlertTriangle className="w-16 h-16" />,
    title: "Something Went Wrong",
    message: "An unexpected error occurred",
    details: "Please try again or refresh the page.",
    color: "text-zinc-400",
    canRetry: true,
  },

  // HTTP Status Codes
  "400": {
    icon: <CircleSlash className="w-16 h-16" />,
    title: "400 - Bad Request",
    message: "Invalid request",
    details: "The server could not understand your request.",
    color: "text-orange-500",
    canRetry: false,
  },
  "401": {
    icon: <Lock className="w-16 h-16" />,
    title: "401 - Unauthorized",
    message: "Authentication required",
    details: "Please log in to access this content.",
    color: "text-orange-500",
    canRetry: false,
  },
  "403": {
    icon: <Ban className="w-16 h-16" />,
    title: "403 - Forbidden",
    message: "Access denied",
    details: "You don't have permission to access this resource.",
    color: "text-red-500",
    canRetry: false,
  },
  "404": {
    icon: <FileQuestion className="w-16 h-16" />,
    title: "404 - Not Found",
    message: "Page not found",
    details: "The page you're looking for doesn't exist or has been moved.",
    color: "text-amber-500",
    canRetry: false,
  },
  "405": {
    icon: <ShieldX className="w-16 h-16" />,
    title: "405 - Method Not Allowed",
    message: "This action is not permitted",
    details: "The requested HTTP method is not supported for this resource.",
    color: "text-red-500",
    canRetry: false,
  },
  "408": {
    icon: <Clock className="w-16 h-16" />,
    title: "408 - Request Timeout",
    message: "The request timed out",
    details: "The server timed out waiting for your request.",
    color: "text-yellow-500",
    canRetry: true,
  },
  "410": {
    icon: <FolderX className="w-16 h-16" />,
    title: "410 - Gone",
    message: "Content permanently removed",
    details: "This resource has been permanently deleted.",
    color: "text-zinc-500",
    canRetry: false,
  },
  "429": {
    icon: <Clock className="w-16 h-16" />,
    title: "429 - Too Many Requests",
    message: "Rate limit exceeded",
    details: "You've made too many requests. Please wait before trying again.",
    color: "text-yellow-500",
    canRetry: true,
  },
  "500": {
    icon: <ServerCrash className="w-16 h-16" />,
    title: "500 - Internal Server Error",
    message: "Something went wrong",
    details: "Our servers encountered an unexpected error.",
    color: "text-red-500",
    canRetry: true,
  },
  "501": {
    icon: <Construction className="w-16 h-16" />,
    title: "501 - Not Implemented",
    message: "Feature not available",
    details: "This feature is not yet implemented.",
    color: "text-blue-500",
    canRetry: false,
  },
  "502": {
    icon: <ServerCrash className="w-16 h-16" />,
    title: "502 - Bad Gateway",
    message: "Server communication error",
    details: "The server received an invalid response from upstream.",
    color: "text-red-500",
    canRetry: true,
  },
  "503": {
    icon: <Construction className="w-16 h-16" />,
    title: "503 - Service Unavailable",
    message: "Service temporarily unavailable",
    details: "The server is currently overloaded or under maintenance.",
    color: "text-orange-500",
    canRetry: true,
  },
  "504": {
    icon: <Clock className="w-16 h-16" />,
    title: "504 - Gateway Timeout",
    message: "Server timeout",
    details: "The server didn't respond in time.",
    color: "text-yellow-500",
    canRetry: true,
  },
};

// Helper to get error config
export const getErrorConfig = (
  type: ErrorType | number | string,
): ErrorConfig => {
  const key = String(type);
  return errorConfigs[key] || errorConfigs.unknown;
};

// Helper to convert HTTP status to error type
export const statusToErrorType = (status: number): ErrorType => {
  const statusStr = String(status);
  if (statusStr in errorConfigs) {
    return statusStr as ErrorType;
  }

  // Map to named types for common ranges
  if (status >= 400 && status < 500) {
    if (status === 401) return "unauthorized";
    if (status === 403) return "forbidden";
    if (status === 404) return "not_found";
    if (status === 405) return "method_not_allowed";
    if (status === 408) return "timeout";
    if (status === 410) return "gone";
    if (status === 429) return "rate_limit";
    return "bad_request";
  }

  if (status >= 500) {
    if (status === 503) return "maintenance";
    return "server";
  }

  return "unknown";
};

// Props interface
export interface ErrorDisplayProps {
  // Error type or HTTP status code
  type?: ErrorType | number | string;

  // Custom overrides
  title?: string;
  message?: string;
  details?: string;
  icon?: ReactNode;

  // Actions
  onRetry?: () => void;
  onRefresh?: () => void;
  onBack?: () => void;

  // State
  retryCount?: number;
  maxRetries?: number;

  // Styling
  fullScreen?: boolean;
  className?: string;
  compact?: boolean;
}

export function ErrorDisplay({
  type = "unknown",
  title,
  message,
  details,
  icon,
  onRetry,
  onRefresh,
  onRetry: _,
  retryCount = 0,
  maxRetries = 3,
  fullScreen = true,
  className = "",
  compact = false,
  onBack,
}: ErrorDisplayProps) {
  const config = getErrorConfig(type);

  // Use custom values or fallback to config
  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const displayDetails = details ?? config.details;
  const canRetry = config.canRetry && retryCount < maxRetries;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-4 p-4 bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-white/5 shadow-2xl ${className}`}
      >
        <div className={`${config.color} shrink-0`}>
          <div className="w-8 h-8 [&>svg]:w-8 [&>svg]:h-8 drop-shadow-lg">{displayIcon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate tracking-wide">
            {displayTitle}
          </p>
          <p className="text-zinc-400 text-xs truncate">{displayMessage}</p>
        </div>
        {(canRetry || onRefresh) && (
          <div className="flex gap-2 shrink-0">
            {canRetry && onRetry && (
              <button
                onClick={onRetry}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                title="Try again"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const content = (
    <div className="text-center p-8 max-w-md mx-auto relative z-10">
      {/* Glow Effect */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      {/* Icon */}
      <div className={`${config.color} mx-auto mb-6 relative`}>
        <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-sm [&>svg]:w-10 [&>svg]:h-10">
          {displayIcon}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-white text-2xl font-bold mb-3 tracking-tight">{displayTitle}</h1>

      {/* Message */}
      <p className="text-zinc-400 text-lg mb-2 leading-relaxed">{displayMessage}</p>

      {/* Details */}
      {displayDetails && (
        <p className="text-zinc-500 text-sm mb-8 bg-zinc-900/50 inline-block px-4 py-2 rounded-lg border border-white/5">
          {displayDetails}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}

        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800/80 text-white font-medium rounded-xl hover:bg-zinc-700/80 transition-all border border-white/5 hover:border-white/10 backdrop-blur-sm"
        >
          Refresh Page
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-zinc-400 font-medium rounded-xl hover:text-white transition-colors"
          >
            Go Back
          </button>
        )}
      </div>

      {/* Retry exhausted message */}
      {retryCount >= maxRetries && config.canRetry && (
        <p className="text-zinc-600 text-xs mt-6">
          Multiple attempts failed. Please try again later.
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative ${className}`}
      >
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-950 to-black z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/2 rounded-full blur-3xl pointer-events-none" />

        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}

// Export a simpler version for common use cases
export function Error404(props: Omit<ErrorDisplayProps, "type">) {
  return <ErrorDisplay type="404" {...props} />;
}

export function Error500(props: Omit<ErrorDisplayProps, "type">) {
  return <ErrorDisplay type="500" {...props} />;
}

export function ErrorNetwork(props: Omit<ErrorDisplayProps, "type">) {
  return <ErrorDisplay type="network" {...props} />;
}

export function ErrorTimeout(props: Omit<ErrorDisplayProps, "type">) {
  return <ErrorDisplay type="timeout" {...props} />;
}

export default ErrorDisplay;
