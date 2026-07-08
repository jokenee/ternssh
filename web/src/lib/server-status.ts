export interface ServerStatusMetrics {
  load1: number | null;
  load5: number | null;
  load15: number | null;
  cpuCount: number | null;
  cpuUsedPercent: number | null;
  memoryTotal: number | null;
  memoryAvailable: number | null;
  memoryUsedPercent: number | null;
  diskTotal: number | null;
  diskUsed: number | null;
  diskAvailable: number | null;
  diskUsedPercent: number | null;
  uptimeSeconds: number | null;
  osInfo: string | null;
  netRxBytes: number | null;
  netTxBytes: number | null;
  netRxRate: number | null;
  netTxRate: number | null;
  netInterfaces: NetInterfaceMetrics[];
  processCount: number | null;
  topProcesses: ProcessMetrics[];
}

export interface ProcessMetrics {
  pid: number;
  user: string;
  cpuPercent: number;
  memPercent: number;
  rssKb: number;
  stat: string;
  command: string;
}

export interface NetInterfaceMetrics {
  name: string;
  rxBytes: number;
  txBytes: number;
  rxRate: number | null;
  txRate: number | null;
}

export interface SessionStatusResponse {
  serverId: string;
  collectedAt: string;
  metrics: ServerStatusMetrics;
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "-";
  const total = Math.floor(seconds);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}天 ${hours}小时`;
  if (hours > 0) return `${hours}小时 ${minutes}分钟`;
  return `${minutes}分钟`;
}

export function formatLoad(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "-";
  return value.toFixed(2);
}

/** Map load average to ring fill percent using CPU count (fallback: 4 cores). */
export function loadToPercent(
  load: number | null,
  cpuCount: number | null,
): number | null {
  if (load === null || !Number.isFinite(load)) return null;
  const cores = cpuCount && cpuCount > 0 ? cpuCount : 4;
  return Math.min(100, Math.round((load / cores) * 1000) / 10);
}

export function formatBitrate(bytesPerSec: number | null): string {
  if (bytesPerSec === null || !Number.isFinite(bytesPerSec)) return "-";
  return `${formatBytes(bytesPerSec)}/s`;
}

export function formatPercent(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return "-";
  return `${value.toFixed(digits)}%`;
}

export function normalizeProcessCpuPercent(
  cpuPercent: number,
  cpuCount: number | null,
): number {
  if (cpuCount === null || cpuCount <= 0) return cpuPercent;
  return Math.min(100, Math.round((cpuPercent / cpuCount) * 10) / 10);
}

export function computeNetRates(
  netRxBytes: number | null,
  netTxBytes: number | null,
  lastSample: { rxBytes: number; txBytes: number; at: number } | null,
  now = Date.now(),
): {
  netRxRate: number | null;
  netTxRate: number | null;
  sample: { rxBytes: number; txBytes: number; at: number } | null;
} {
  if (netRxBytes == null || netTxBytes == null) {
    return { netRxRate: null, netTxRate: null, sample: lastSample };
  }

  const sample = { rxBytes: netRxBytes, txBytes: netTxBytes, at: now };

  if (!lastSample) {
    return { netRxRate: null, netTxRate: null, sample };
  }

  const elapsedSec = (now - lastSample.at) / 1000;
  if (elapsedSec <= 0) {
    return { netRxRate: null, netTxRate: null, sample };
  }

  const deltaRx =
    netRxBytes >= lastSample.rxBytes
      ? netRxBytes - lastSample.rxBytes
      : netRxBytes;
  const deltaTx =
    netTxBytes >= lastSample.txBytes
      ? netTxBytes - lastSample.txBytes
      : netTxBytes;

  return {
    netRxRate: deltaRx / elapsedSec,
    netTxRate: deltaTx / elapsedSec,
    sample,
  };
}
