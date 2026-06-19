import { describe, expect, it } from "vitest";
import {
  defaultResponsiveQueryMatches,
  deriveResponsiveMode,
  type ResponsiveQueryMatches,
} from "../shared/responsive";
import { readAppShellRenderPlan, readAppShellSurfacePlan, readWorkflowPanelWidth } from "./AppShell";

function matches(overrides: Partial<ResponsiveQueryMatches>): ResponsiveQueryMatches {
  return { ...defaultResponsiveQueryMatches, ...overrides };
}

describe("readAppShellSurfacePlan", () => {
  it("uses one transient drawer semantic for all non-persistent panels", () => {
    expect(readAppShellSurfacePlan(deriveResponsiveMode(matches({})))).toEqual({
      session: "drawer",
      workflow: "drawer",
    });

    expect(readAppShellSurfacePlan(deriveResponsiveMode(matches({ tabletUp: true })))).toEqual({
      session: "drawer",
      workflow: "drawer",
    });
  });

  it("keeps workflow transient until the wide dual-panel capability exists", () => {
    expect(readAppShellSurfacePlan(deriveResponsiveMode(matches({ tabletUp: true, desktopUp: true })))).toEqual({
      session: "drawer",
      workflow: "drawer",
    });

    expect(
      readAppShellSurfacePlan(deriveResponsiveMode(matches({ tabletUp: true, desktopUp: true, wideUp: true }))),
    ).toEqual({
      session: "persistent",
      workflow: "persistent",
    });
  });
});

describe("readAppShellRenderPlan", () => {
  it("does not mount hidden persistent panels on mobile", () => {
    expect(readAppShellRenderPlan(deriveResponsiveMode(matches({})))).toMatchObject({
      showSessionRail: false,
      showSessionPersistentPanel: false,
      showWorkflowPersistentPanel: false,
      showSessionDrawer: true,
      showWorkflowDrawer: true,
    });
  });

  it("mounts only visible shell slots for each breakpoint", () => {
    expect(readAppShellRenderPlan(deriveResponsiveMode(matches({ tabletUp: true })))).toMatchObject({
      showSessionRail: true,
      showSessionPersistentPanel: false,
      showWorkflowPersistentPanel: false,
      showSessionDrawer: true,
      showWorkflowDrawer: true,
    });

    expect(readAppShellRenderPlan(deriveResponsiveMode(matches({ tabletUp: true, desktopUp: true })))).toMatchObject({
      showSessionRail: true,
      showSessionPersistentPanel: false,
      showWorkflowPersistentPanel: false,
      showSessionDrawer: true,
      showWorkflowDrawer: true,
    });

    expect(
      readAppShellRenderPlan(deriveResponsiveMode(matches({ tabletUp: true, desktopUp: true, wideUp: true }))),
    ).toMatchObject({
      showSessionRail: false,
      showSessionPersistentPanel: true,
      showWorkflowPersistentPanel: true,
      showSessionDrawer: false,
      showWorkflowDrawer: false,
    });
  });

  it("keeps chat drawer entry actions in the shell plan", () => {
    expect(readAppShellRenderPlan(deriveResponsiveMode(matches({})))).toMatchObject({
      showChatSessionPanelAction: true,
      showChatWorkflowPanelAction: true,
    });

    expect(readAppShellRenderPlan(deriveResponsiveMode(matches({ tabletUp: true })))).toMatchObject({
      showChatSessionPanelAction: false,
      showChatWorkflowPanelAction: true,
    });

    expect(readAppShellRenderPlan(deriveResponsiveMode(matches({ tabletUp: true, desktopUp: true })))).toMatchObject({
      showChatSessionPanelAction: false,
      showChatWorkflowPanelAction: true,
    });

    expect(
      readAppShellRenderPlan(deriveResponsiveMode(matches({ tabletUp: true, desktopUp: true, wideUp: true }))),
    ).toMatchObject({
      showChatSessionPanelAction: false,
      showChatWorkflowPanelAction: false,
    });
  });
});

describe("readWorkflowPanelWidth", () => {
  it("keeps workflow width helpers stable for persistent layouts", () => {
    expect(readWorkflowPanelWidth(deriveResponsiveMode(matches({ tabletUp: true, desktopUp: true })))).toBe(360);
    expect(readWorkflowPanelWidth(deriveResponsiveMode(matches({
      tabletUp: true,
      desktopUp: true,
      wideUp: true,
    })))).toBe(460);
  });
});
