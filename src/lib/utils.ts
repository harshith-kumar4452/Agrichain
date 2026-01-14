import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";
import type { TraceEvent } from "@/lib/supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateBatchId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BATCH-${timestamp}-${random}`.toUpperCase();
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(d);
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "recalled":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getEventTypeIcon(eventType: string): string {
  switch (eventType) {
    case "harvest":
      return "🌾";
    case "transport":
      return "🚚";
    case "processing":
      return "🏭";
    case "storage":
      return "🏪";
    case "retail":
      return "🛒";
    default:
      return "📍";
  }
}

// Deterministic JSON stringify: stable key order, no locale-specific formatting
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
      .join(",") +
    "}"
  );
}

// Serialize trace events deterministically for hashing
export function serializeTraceEvents(events: TraceEvent[]): string {
  const normalized = [...events]
    .sort((a, b) => {
      const ta = new Date(a.timestamp).getTime();
      const tb = new Date(b.timestamp).getTime();
      if (ta !== tb) return ta - tb;
      // tiebreaker for stability
      return (a.id || "").localeCompare(b.id || "");
    })
    .map((e) => ({
      event_type: e.event_type,
      actor_id: e.actor_id,
      actor_role: e.actor_role,
      location: e.location,
      // normalize timestamp to ISO string
      timestamp: new Date(e.timestamp).toISOString(),
      // include optional numeric fields as-is; omit if undefined
      ...(typeof e.temperature === "number"
        ? { temperature: e.temperature }
        : {}),
      ...(typeof e.humidity === "number" ? { humidity: e.humidity } : {}),
      ...(e.notes ? { notes: e.notes } : {}),
    }));

  return stableStringify(normalized);
}

// Compute SHA-256 hash over the serialized events string
export function computeTraceEventsSha256(events: TraceEvent[]): string {
  const serialized = serializeTraceEvents(events);
  return ethers.sha256(ethers.toUtf8Bytes(serialized));
}
