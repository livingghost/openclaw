import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveConfiguredWhatsAppSenderAgentIds } from "./accounts.js";

describe("resolveConfiguredWhatsAppSenderAgentIds", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("maps configured self identities to senderAgentId", () => {
    const authDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-wa-sender-agent-"));
    tempDirs.push(authDir);
    fs.writeFileSync(
      path.join(authDir, "creds.json"),
      JSON.stringify({ me: { id: "15550002222@s.whatsapp.net" } }),
      "utf-8",
    );

    const ids = resolveConfiguredWhatsAppSenderAgentIds({
      channels: {
        whatsapp: {
          accounts: {
            ops: { authDir },
          },
        },
      },
      bindings: [
        {
          agentId: "ops-agent",
          match: { channel: "whatsapp", accountId: "ops" },
        },
      ],
    } as never);

    expect(ids.get("+15550002222")).toBe("ops-agent");
    expect(ids.get("15550002222@s.whatsapp.net")).toBe("ops-agent");
  });
});
