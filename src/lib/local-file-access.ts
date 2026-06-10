import type { StudioPhoto } from "@/lib/studio-store";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

type LocalFileHandle = {
  kind: "file";
  name: string;
  getFile: () => Promise<File>;
};

type LocalDirectoryHandle = {
  kind: "directory";
  name: string;
  entries: () => AsyncIterable<[string, LocalFileHandle | LocalDirectoryHandle]>;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: {
    mode?: "read" | "readwrite";
  }) => Promise<LocalDirectoryHandle>;
};

export type LocalPhotoReadResult = {
  rootName: string;
  photos: StudioPhoto[];
  ignored: number;
  failed: number;
};

export function supportsLocalDirectoryPicker() {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function isSupportedImageFile(name: string) {
  return IMAGE_EXTENSIONS.test(name);
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

export async function pickLocalPhotoDirectory(): Promise<LocalPhotoReadResult> {
  const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
  if (!picker) {
    throw new Error("Browser belum mendukung akses folder lokal langsung");
  }

  const root = await picker({ mode: "read" });
  return readLocalPhotoDirectory(root);
}

export async function readLocalPhotoDirectory(
  root: LocalDirectoryHandle,
): Promise<LocalPhotoReadResult> {
  const entries: { file: File; relativePath: string }[] = [];
  let ignored = 0;
  let failed = 0;

  async function walk(dir: LocalDirectoryHandle, prefix: string) {
    for await (const [, handle] of dir.entries()) {
      const relativePath = prefix ? `${prefix}/${handle.name}` : handle.name;
      if (handle.kind === "directory") {
        await walk(handle, relativePath);
        continue;
      }
      if (!isSupportedImageFile(handle.name)) {
        ignored += 1;
        continue;
      }
      try {
        const file = await handle.getFile();
        entries.push({ file, relativePath });
      } catch {
        failed += 1;
      }
    }
  }

  await walk(root, "");

  entries.sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  return {
    rootName: root.name,
    photos: createStudioPhotos(entries),
    ignored,
    failed,
  };
}

export function createStudioPhotos(entries: { file: File; relativePath: string }[]): StudioPhoto[] {
  const sorted = [...entries].sort((a, b) =>
    a.relativePath.localeCompare(b.relativePath, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  return sorted.map(({ file, relativePath }, i) => ({
    id: `LOCAL_${String(i + 1).padStart(4, "0")}`,
    name: file.name,
    fileName: file.name,
    relativePath,
    url: URL.createObjectURL(file),
    source: "local",
  }));
}
