import { describe, expect, it } from "vitest";
import { prepareExportFileName, safeFileName } from "@/lib/export-png";

describe("export filename helpers", () => {
  it("replaces export tokens and keeps PNG extension", () => {
    expect(
      prepareExportFileName({
        filenamePattern: "{sessionName}_Frame-{frameName}-{index}.png",
        sessionName: "Alya Rafi",
        frameName: "Proof Frame 4 Slot",
        index: 3,
      }),
    ).toBe("Alya Rafi_Frame-Proof-Frame-4-Slot-03.png");
  });

  it("sanitizes characters that are invalid for Windows filenames", () => {
    expect(safeFileName('Customer:01/Frame*Proof?"A"')).toBe("Customer_01_Frame_Proof__A_.png");
  });
});
