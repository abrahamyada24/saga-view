import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSupportedImageFile, readLocalPhotoDirectory } from "@/lib/local-file-access";

type TestFileHandle = Parameters<typeof readLocalPhotoDirectory>[0] extends {
  entries: () => AsyncIterable<[string, infer Handle]>;
}
  ? Extract<Handle, { kind: "file" }>
  : never;

type TestDirectoryHandle = Parameters<typeof readLocalPhotoDirectory>[0];
type TestHandle = TestFileHandle | TestDirectoryHandle;

function fileHandle(name: string, shouldFail = false): TestFileHandle {
  return {
    kind: "file",
    name,
    async getFile() {
      if (shouldFail) throw new Error("unreadable");
      return new File(["photo"], name, { type: "image/jpeg" });
    },
  };
}

function directoryHandle(name: string, handles: TestHandle[]): TestDirectoryHandle {
  return {
    kind: "directory",
    name,
    async *entries() {
      for (const handle of handles) {
        yield [handle.name, handle];
      }
    },
  };
}

describe("local file access helpers", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn((file: File) => `blob:${file.name}`),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects supported image file extensions", () => {
    expect(isSupportedImageFile("IMG_001.JPG")).toBe(true);
    expect(isSupportedImageFile("frame.png")).toBe(true);
    expect(isSupportedImageFile("preview.webp")).toBe(true);
    expect(isSupportedImageFile("notes.txt")).toBe(false);
  });

  it("reads nested photo directories with natural sorting and counters", async () => {
    const root = directoryHandle("Customer Folder", [
      fileHandle("IMG_10.jpg"),
      fileHandle("notes.txt"),
      directoryHandle("sub", [fileHandle("IMG_2.jpg"), fileHandle("broken.png", true)]),
      fileHandle("IMG_1.webp"),
    ]);

    const result = await readLocalPhotoDirectory(root);

    expect(result.rootName).toBe("Customer Folder");
    expect(result.ignored).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.photos.map((photo) => photo.name)).toEqual([
      "IMG_1.webp",
      "IMG_10.jpg",
      "IMG_2.jpg",
    ]);
    expect(result.photos.map((photo) => photo.url)).toEqual([
      "blob:IMG_1.webp",
      "blob:IMG_10.jpg",
      "blob:IMG_2.jpg",
    ]);
  });
});
