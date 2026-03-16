import { createDedupeCache } from "../../infra/dedupe.js";
import { resolveGlobalSingleton } from "../../shared/global-singleton.js";
import type { FinalizedMsgContext, MsgContext, TemplateContext } from "../templating.js";
import type { FollowupRun } from "./queue/types.js";

const RECENT_SENT_REPLY_ROOTS_KEY = Symbol.for("openclaw.recentSentReplyRoots");
const RECENT_SENT_REPLY_ROOTS = resolveGlobalSingleton(RECENT_SENT_REPLY_ROOTS_KEY, () =>
  createDedupeCache({
    ttlMs: 2 * 60 * 1000,
    maxSize: 10_000,
  }),
);

type ReplyRootIdentityParams = {
  rootMessageId?: string;
  replyToId?: string;
  replyToIdFull?: string;
  messageId?: string;
  messageIdFull?: string;
};

type ReplyRootRouteKeyParams = {
  scopeKey?: string;
  agentId?: string;
  channel?: string;
  to?: string;
  accountId?: string;
  threadId?: string | number | null;
  replyRootId?: string;
};

function clean(value: string | undefined | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function resolveReplyRootId(params: ReplyRootIdentityParams): string | undefined {
  return (
    clean(params.replyToIdFull) ??
    clean(params.replyToId) ??
    clean(params.rootMessageId) ??
    clean(params.messageIdFull) ??
    clean(params.messageId)
  );
}

export function resolveReplyRootIdFromContext(
  ctx: Pick<
    MsgContext | TemplateContext | FinalizedMsgContext,
    "RootMessageId" | "ReplyToId" | "ReplyToIdFull" | "MessageSid" | "MessageSidFull"
  >,
): string | undefined {
  return resolveReplyRootId({
    rootMessageId: ctx.RootMessageId,
    replyToId: ctx.ReplyToId,
    replyToIdFull: ctx.ReplyToIdFull,
    messageId: ctx.MessageSid,
    messageIdFull: ctx.MessageSidFull,
  });
}

export function buildRecentSentReplyRootKey(params: ReplyRootRouteKeyParams): string | undefined {
  const replyRootId = clean(params.replyRootId);
  if (!replyRootId) {
    return undefined;
  }
  return JSON.stringify([
    "sent-reply-root",
    params.scopeKey ?? "",
    params.agentId ?? "",
    params.channel ?? "",
    params.to ?? "",
    params.accountId ?? "",
    params.threadId == null ? "" : String(params.threadId),
    replyRootId,
  ]);
}

export function buildRecentSentReplyRootKeyForRun(
  run: Pick<
    FollowupRun,
    | "originatingChannel"
    | "originatingTo"
    | "originatingAccountId"
    | "originatingThreadId"
    | "replyRootId"
    | "run"
  >,
): string | undefined {
  return buildRecentSentReplyRootKey({
    scopeKey: run.run.sessionKey ?? run.run.sessionId,
    agentId: run.run.agentId,
    channel: run.originatingChannel,
    to: run.originatingTo,
    accountId: run.originatingAccountId,
    threadId: run.originatingThreadId,
    replyRootId: run.replyRootId,
  });
}

export function hasRecentSentReplyRoot(key: string | undefined): boolean {
  return Boolean(key && RECENT_SENT_REPLY_ROOTS.peek(key));
}

export function markRecentSentReplyRoot(key: string | undefined): void {
  if (!key) {
    return;
  }
  RECENT_SENT_REPLY_ROOTS.check(key);
}

export function resetRecentSentReplyRootDedupe(): void {
  RECENT_SENT_REPLY_ROOTS.clear();
}
