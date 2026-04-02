import { describe, expect, it } from "vitest";
import { mergeTtsConfig } from "./merge-config.js";

describe("mergeTtsConfig", () => {
  it("coalesces edge and microsoft provider configs without runtime registry state", () => {
    const merged = mergeTtsConfig(
      {
        edge: {
          apiKey: "edge-key",
        },
      },
      {
        providers: {
          microsoft: {
            voice: "en-US-JennyNeural",
          },
        },
      },
    );

    expect(merged.providers?.microsoft).toMatchObject({
      apiKey: "edge-key",
      voice: "en-US-JennyNeural",
    });
    expect((merged as Record<string, unknown>).microsoft).toMatchObject({
      apiKey: "edge-key",
      voice: "en-US-JennyNeural",
    });
    expect((merged as Record<string, unknown>).edge).toBeUndefined();
  });
});
