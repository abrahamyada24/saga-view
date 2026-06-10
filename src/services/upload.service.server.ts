import { mkdirSync, existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

// ─── Constants ──────────────────────────────────────────────────────────────

const UPLOAD_BASE = "data/uploads/frames";

// ─── Service Functions ──────────────────────────────────────────────────────

export function getUploadDir(): string {
  return UPLOAD_BASE;
}

export async function saveFrameImage(
  frameId: string,
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  // Ensure upload directory exists
  if (!existsSync(UPLOAD_BASE)) {
    mkdirSync(UPLOAD_BASE, { recursive: true });
  }

  const ext = extname(originalName) || ".png";
  const timestamp = Date.now();
  const filename = `${frameId}_${timestamp}${ext}`;
  const filePath = join(UPLOAD_BASE, filename);

  writeFileSync(filePath, buffer);

  // Return relative path for storage in DB
  return filePath.replace(/\\/g, "/");
}

export async function deleteFrameImage(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch {
    // File may have already been deleted
  }
}
