import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveUserPath } from "../utils.js";

const hoisted = vi.hoisted(() => ({
  resolveRuntimePluginRegistry: vi.fn(),
}));

vi.mock("../plugins/loader.js", () => ({
  resolveRuntimePluginRegistry: hoisted.resolveRuntimePluginRegistry,
}));

describe("ensureRuntimePluginsLoaded", () => {
  beforeEach(() => {
    hoisted.resolveRuntimePluginRegistry.mockReset();
    hoisted.resolveRuntimePluginRegistry.mockReturnValue(undefined);
    vi.resetModules();
  });

  it("does not reactivate plugins when a process already has an active registry", async () => {
    const { ensureRuntimePluginsLoaded } = await import("./runtime-plugins.js");
    hoisted.resolveRuntimePluginRegistry.mockReturnValue({});

    ensureRuntimePluginsLoaded({
      config: {} as never,
      workspaceDir: "/tmp/workspace",
      allowGatewaySubagentBinding: true,
    });

    expect(hoisted.resolveRuntimePluginRegistry).toHaveBeenCalledTimes(1);
  });

  it("resolves runtime plugins through the shared runtime helper", async () => {
    const { ensureRuntimePluginsLoaded } = await import("./runtime-plugins.js");

    ensureRuntimePluginsLoaded({
      config: {} as never,
      workspaceDir: "/tmp/workspace",
      allowGatewaySubagentBinding: true,
    });

    expect(hoisted.resolveRuntimePluginRegistry).toHaveBeenCalledWith({
      config: {} as never,
      workspaceDir: resolveUserPath("/tmp/workspace"),
      runtimeOptions: {
        allowGatewaySubagentBinding: true,
      },
    });
  });

  it("inherits shared runtime options when gateway binding is unspecified", async () => {
    const { ensureRuntimePluginsLoaded } = await import("./runtime-plugins.js");

    ensureRuntimePluginsLoaded({
      config: {} as never,
      workspaceDir: "/tmp/workspace",
    });

    expect(hoisted.resolveRuntimePluginRegistry).toHaveBeenCalledWith({
      config: {} as never,
      workspaceDir: resolveUserPath("/tmp/workspace"),
      inheritSharedRuntimeOptions: true,
    });
  });

  it("does not inherit shared runtime options when gateway subagent binding is explicitly false", async () => {
    const { ensureRuntimePluginsLoaded } = await import("./runtime-plugins.js");

    ensureRuntimePluginsLoaded({
      config: {} as never,
      workspaceDir: "/tmp/workspace",
      allowGatewaySubagentBinding: false,
    });

    expect(hoisted.resolveRuntimePluginRegistry).toHaveBeenCalledWith({
      config: {} as never,
      workspaceDir: resolveUserPath("/tmp/workspace"),
    });
  });
});
