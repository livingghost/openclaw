import type { TtsConfig } from "../config/types.js";

const RESERVED_TTS_CONFIG_KEYS = new Set([
  "auto",
  "enabled",
  "mode",
  "provider",
  "summaryModel",
  "modelOverrides",
  "providers",
  "prefsPath",
  "maxTextLength",
  "timeoutMs",
]);

function asProviderConfig(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function collectLegacyProviderIds(raw: TtsConfig): string[] {
  const entries = raw as Record<string, unknown>;
  return Object.keys(entries)
    .filter((key) => !RESERVED_TTS_CONFIG_KEYS.has(key))
    .filter((key) => {
      const value = entries[key];
      return typeof value === "object" && value !== null && !Array.isArray(value);
    });
}

function collectProviderConfigs(raw: TtsConfig): Record<string, Record<string, unknown>> {
  const entries = raw as Record<string, unknown>;
  const merged: Record<string, Record<string, unknown>> = {};

  for (const providerId of collectLegacyProviderIds(raw)) {
    merged[providerId] = {
      ...merged[providerId],
      ...asProviderConfig(entries[providerId]),
    };
  }

  for (const [providerId, value] of Object.entries(raw.providers ?? {})) {
    merged[providerId] = {
      ...merged[providerId],
      ...asProviderConfig(value),
    };
  }

  return merged;
}

export function mergeTtsConfig(base: TtsConfig, override?: TtsConfig): TtsConfig {
  if (!override) {
    return base;
  }

  const baseProviders = collectProviderConfigs(base);
  const overrideProviders = collectProviderConfigs(override);
  const mergedProviders = Object.fromEntries(
    [...new Set([...Object.keys(baseProviders), ...Object.keys(overrideProviders)])].map(
      (providerId) => [
        providerId,
        {
          ...baseProviders[providerId],
          ...overrideProviders[providerId],
        },
      ],
    ),
  );
  const legacyProviderIds = [
    ...new Set([...collectLegacyProviderIds(base), ...collectLegacyProviderIds(override)]),
  ];
  const mergedLegacyProviders = Object.fromEntries(
    legacyProviderIds.map((providerId) => [providerId, mergedProviders[providerId] ?? {}]),
  );

  return {
    ...base,
    ...override,
    ...mergedLegacyProviders,
    modelOverrides: {
      ...base.modelOverrides,
      ...override.modelOverrides,
    },
    ...(Object.keys(mergedProviders).length === 0 ? {} : { providers: mergedProviders }),
  };
}
