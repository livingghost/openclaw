import { describe, expect, it } from "vitest";
import { resolveReplyRootId, resolveReplyRootIdFromContext } from "./reply-root-dedupe.js";

describe("resolveReplyRootId", () => {
  it("prefers explicit reply targets before thread roots", () => {
    expect(
      resolveReplyRootId({
        rootMessageId: "thread-root",
        replyToId: "reply-target",
        messageId: "current-message",
      }),
    ).toBe("reply-target");
  });

  it("falls back to the thread root when reply-to metadata is unavailable", () => {
    expect(
      resolveReplyRootId({
        rootMessageId: "thread-root",
        messageId: "current-message",
      }),
    ).toBe("thread-root");
  });
});

describe("resolveReplyRootIdFromContext", () => {
  it("prefers ReplyToIdFull before RootMessageId", () => {
    expect(
      resolveReplyRootIdFromContext({
        RootMessageId: "thread-root",
        ReplyToId: "reply-short",
        ReplyToIdFull: "reply-full",
        MessageSid: "message-short",
        MessageSidFull: "message-full",
      }),
    ).toBe("reply-full");
  });
});
