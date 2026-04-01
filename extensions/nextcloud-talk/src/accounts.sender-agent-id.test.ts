import { describe, expect, it } from "vitest";
import { resolveConfiguredNextcloudTalkSenderAgentIds } from "./accounts.js";

describe("resolveConfiguredNextcloudTalkSenderAgentIds", () => {
  it("maps configured api users to senderAgentId", () => {
    const ids = resolveConfiguredNextcloudTalkSenderAgentIds({
      bindings: [
        { agentId: "ops-agent", match: { channel: "nextcloud-talk", accountId: "ops" } },
      ],
      channels: {
        "nextcloud-talk": {
          accounts: {
            ops: {
              enabled: true,
              baseUrl: "https://cloud.example.com",
              botSecret: "secret",
              apiUser: "bot-user",
            },
          },
        },
      },
    });

    expect(ids.get("bot-user")).toBe("ops-agent");
  });
});
