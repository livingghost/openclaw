import { describe, expect, it } from "vitest";
import { resolveConfiguredSignalSenderAgentIds } from "./accounts.js";

describe("resolveConfiguredSignalSenderAgentIds", () => {
  it("maps configured phone numbers and UUIDs to senderAgentId", () => {
    const ids = resolveConfiguredSignalSenderAgentIds({
      channels: {
        signal: {
          accounts: {
            ops: {
              account: "+15550002222",
              accountUuid: "123e4567-e89b-12d3-a456-426614174000",
            },
          },
        },
      },
      bindings: [
        {
          agentId: "ops-agent",
          match: { channel: "signal", accountId: "ops" },
        },
      ],
    } as never);

    expect(ids.get("+15550002222")).toBe("ops-agent");
    expect(ids.get("uuid:123e4567-e89b-12d3-a456-426614174000")).toBe("ops-agent");
  });
});
