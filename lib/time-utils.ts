// Time formatting utilities

export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = `${hours}h`;
    if (minutes > 0) result += ` ${minutes}m`;
    if (remainingSeconds > 0) result += ` ${remainingSeconds}s`;
    
    return result;
  }
}

export function formatProcessingTime(seconds: number, isProcessing: boolean): string {
  if (isProcessing && seconds === 0) {
    return "Starting...";
  }
  
  if (isProcessing) {
    return `Processing... ${formatTime(seconds)}`;
  }
  
  if (seconds === 0) {
    return "";
  }
  
  return `Completed in ${formatTime(seconds)}`;
}