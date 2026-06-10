// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_FRAME, DEMO_SESSION_NAME, DEMO_SESSION_PHOTOS } from "@/lib/demo-session";
import { exportFramePngs } from "@/lib/export-png";

const mockCanvasContext = {
  save: vi.fn(),
  beginPath: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  drawImage: vi.fn(),
  restore: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
  textAlign: "start",
  font: "",
};

class MockImage {
  crossOrigin = "";
  naturalWidth = 900;
  naturalHeight = 1200;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

describe("exportFramePngs browser rendering path", () => {
  beforeEach(() => {
    vi.stubGlobal("Image", MockImage);
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:export"),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockCanvasContext as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback: BlobCallback) => {
      callback(new Blob(["png"], { type: "image/png" }));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders demo frame and writes the PNG blob to a directory handle", async () => {
    const written: { name: string; blob: Blob }[] = [];
    const outputDirectoryHandle = {
      async getFileHandle(name: string) {
        return {
          async createWritable() {
            return {
              async write(blob: Blob) {
                written.push({ name, blob });
              },
              async close() {},
            };
          },
        };
      },
    };

    const result = await exportFramePngs({
      frames: [{ frame: DEMO_FRAME, key: `${DEMO_FRAME.id}#1`, copy: 1, total: 1 }],
      slotMaps: {
        [`${DEMO_FRAME.id}#1`]: DEMO_FRAME.slotRects.map((_, i) => DEMO_SESSION_PHOTOS[i].id),
      },
      photos: DEMO_SESSION_PHOTOS,
      rotations: {},
      slotTransforms: {},
      sessionName: DEMO_SESSION_NAME,
      filenamePattern: "{sessionName}_Frame-{frameName}-{index}.png",
      outputDirectoryHandle,
    });

    expect(result).toEqual({
      files: ["Demo-Export-Local_Frame-Proof-Frame-4-Slot-01.png"],
      saveMode: "folder",
    });
    expect(written).toHaveLength(1);
    expect(written[0].name).toBe(result.files[0]);
    expect(written[0].blob.type).toBe("image/png");
  });

  it("falls back to browser download when direct folder write fails", async () => {
    const click = vi.fn();
    const appendChild = vi.spyOn(document.body, "appendChild");
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
      if (tagName === "a") {
        Object.defineProperty(element, "click", { value: click });
      }
      return element as HTMLElement;
    });
    const outputDirectoryHandle = {
      async getFileHandle() {
        throw new Error("permission lost");
      },
    };

    const result = await exportFramePngs({
      frames: [{ frame: DEMO_FRAME, key: `${DEMO_FRAME.id}#1`, copy: 1, total: 1 }],
      slotMaps: {
        [`${DEMO_FRAME.id}#1`]: DEMO_FRAME.slotRects.map((_, i) => DEMO_SESSION_PHOTOS[i].id),
      },
      photos: DEMO_SESSION_PHOTOS,
      rotations: {},
      slotTransforms: {},
      sessionName: DEMO_SESSION_NAME,
      filenamePattern: "{sessionName}_Frame-{frameName}-{index}.png",
      outputDirectoryHandle,
    });

    expect(result.saveMode).toBe("download");
    expect(result.files).toEqual(["Demo-Export-Local_Frame-Proof-Frame-4-Slot-01.png"]);
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});
