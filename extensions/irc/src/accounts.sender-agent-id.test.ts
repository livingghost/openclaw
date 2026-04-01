import { describe, expect, it } from "vitest";
import { resolveConfiguredIrcSenderAgentIdsByNick } from "./accounts.js";

describe("resolveConfiguredIrcSenderAgentIdsByNick", () => {
  it("maps configured nicknames to senderAgentId", () => {
    const ids = resolveConfiguredIrcSenderAgentIdsByNick({
      channels: {
        irc: {
          accounts: {
            ops: {
              host: "irc.example.test",
              nick: "OpenClawOps",
            },
          },
        },
      },
      bindings: [
        {
          agentId: "ops-agent",
          match: { channel: "irc", accountId: "ops" },
        },
      ],
    } as never);

    expect(ids.get("openclawops")).toBe("ops-agent");
  });
});
