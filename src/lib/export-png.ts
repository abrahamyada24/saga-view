import { type Frame, type StudioPhoto } from "@/lib/studio-store";

type ExportFrameInstance = {
  frame: Frame;
  key: string;
  copy: number;
  total: number;
};

type ExportInput = {
  frames: ExportFrameInstance[];
  slotMaps: Record<string, (string | null)[]>;
  photos: StudioPhoto[];
  rotations: Record<string, number>;
  slotTransforms: Record<string, { scale: number; x: number; y: number }>;
  sessionName: string;
  filenamePattern: string;
  outputDirectoryHandle?: unknown | null;
};

export type ExportPngResult = {
  files: string[];
  saveMode: "folder" | "download";
};

const EXPORT_SIZE = {
  width: 1800,
  height: 2400,
};

export async function exportFramePngs({
  frames,
  slotMaps,
  photos,
  rotations,
  slotTransforms,
  sessionName,
  filenamePattern,
  outputDirectoryHandle,
}: ExportInput) {
  const files: string[] = [];
  let saveMode: ExportPngResult["saveMode"] = "folder";

  for (let i = 0; i < frames.length; i++) {
    const inst = frames[i];
    const fileName = prepareExportFileName({
      filenamePattern,
      sessionName,
      frameName: inst.frame.name,
      index: i + 1,
    });
    const blob = await renderFrameToPng({
      frame: inst.frame,
      slotMap: slotMaps[inst.key] ?? [],
      photos,
      rotations,
      slotTransforms,
      instanceKey: inst.key,
    });
    const fileSaveMode = await saveBlob(blob, fileName, outputDirectoryHandle);
    if (fileSaveMode === "download") saveMode = "download";
    files.push(fileName);
  }

  return { files, saveMode };
}

async function renderFrameToPng({
  frame,
  slotMap,
  photos,
  rotations,
  slotTransforms,
  instanceKey,
}: {
  frame: Frame;
  slotMap: (string | null)[];
  photos: StudioPhoto[];
  rotations: Record<string, number>;
  slotTransforms: Record<string, { scale: number; x: number; y: number }>;
  instanceKey: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE.width;
  canvas.height = EXPORT_SIZE.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas export tidak tersedia");

  paintFrameBackground(ctx, frame, canvas.width, canvas.height);

  for (let i = 0; i < frame.slotRects.length; i++) {
    const photoId = slotMap[i];
    if (!photoId) continue;
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) {
      throw new Error(`Foto untuk slot ${i + 1} tidak ditemukan di folder lokal aktif`);
    }
    const img = await loadImage(photo.url);
    const rect = frame.slotRects[i];
    const x = (rect.x / 100) * canvas.width;
    const y = (rect.y / 100) * canvas.height;
    const w = (rect.w / 100) * canvas.width;
    const h = (rect.h / 100) * canvas.height;
    const rotation = rotations[`${instanceKey}:${i}`] ?? 0;
    const transform = slotTransforms[`${instanceKey}:${i}`] ?? { scale: 1, x: 0, y: 0 };
    drawPhotoCover(ctx, img, x, y, w, h, rotation, transform);
  }

  if (frame.image) {
    try {
      const overlay = await loadImage(frame.image);
      ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
    } catch (error) {
      console.warn("Frame overlay tidak tersedia, memakai frame CSS fallback", error);
      paintGeneratedFrameLabel(ctx, frame, canvas.width, canvas.height);
    }
  } else {
    paintGeneratedFrameLabel(ctx, frame, canvas.width, canvas.height);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Gagal membuat PNG"));
    }, "image/png");
  });
  return blob;
}

function drawPhotoCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation: number,
  transform: { scale: number; x: number; y: number },
) {
  const coverScale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * transform.scale;
  const dw = img.naturalWidth * coverScale;
  const dh = img.naturalHeight * coverScale;
  const ox = (transform.x / 100) * w;
  const oy = (transform.y / 100) * h;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.translate(x + w / 2 + ox, y + h / 2 + oy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
}

function paintFrameBackground(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  width: number,
  height: number,
) {
  if (frame.image) {
    ctx.clearRect(0, 0, width, height);
    return;
  }
  ctx.fillStyle = normalizeCssColor(frame.bg) ?? "#FAF7F2";
  ctx.fillRect(0, 0, width, height);
  ctx.lineWidth = 42;
  ctx.strokeStyle = frame.border ?? "#E7E1D8";
  ctx.strokeRect(21, 21, width - 42, height - 42);
}

function paintGeneratedFrameLabel(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  width: number,
  height: number,
) {
  if (!frame.accent) return;
  ctx.save();
  ctx.fillStyle = frame.accent;
  ctx.textAlign = "center";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText(frame.name.toUpperCase(), width / 2, height - 80);
  ctx.restore();
}

function normalizeCssColor(value?: string) {
  if (!value || value.includes("gradient")) return undefined;
  return value;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal membaca gambar: ${src.slice(0, 80)}`));
    img.src = src;
  });
}

async function saveBlob(
  blob: Blob,
  fileName: string,
  outputDirectoryHandle?: unknown | null,
): Promise<ExportPngResult["saveMode"]> {
  if (outputDirectoryHandle) {
    try {
      const dir = outputDirectoryHandle as {
        getFileHandle: (
          name: string,
          options: { create: boolean },
        ) => Promise<{
          createWritable: () => Promise<{
            write: (blob: Blob) => Promise<void>;
            close: () => Promise<void>;
          }>;
        }>;
      };
      const fileHandle = await dir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return "folder";
    } catch (error) {
      console.warn("Gagal simpan ke folder output, fallback download", error);
    }
  }
  downloadBlob(blob, fileName);
  return "download";
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function prepareExportFileName({
  filenamePattern,
  sessionName,
  frameName,
  index,
}: {
  filenamePattern: string;
  sessionName: string;
  frameName: string;
  index: number;
}) {
  return safeFileName(
    filenamePattern
      .replace("{sessionName}", sessionName || "Customer-001")
      .replace("{frameName}", frameName.replace(/\s+/g, "-"))
      .replace("{index}", String(index).padStart(2, "0")),
  );
}

export function safeFileName(value: string) {
  const cleaned = value.replace(/[\\/:*?"<>|]/g, "_").trim();
  return cleaned.toLowerCase().endsWith(".png") ? cleaned : `${cleaned}.png`;
}
