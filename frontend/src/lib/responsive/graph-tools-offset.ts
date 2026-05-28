import { isDesktopWidth, isTabletWidth } from "./breakpoints";

const GRAPH_TOOL_OFFSETS = {
  logs: 130,
  widgets: 50,
} as const;

// Tablet panels open from the bottom — shift graph center up to fill the
// remaining visible area above the panel.
const TABLET_TOOL_Y_OFFSETS = {
  logs: -170,
  widgets: -70,
} as const;

export function graphToolsOffsetPx(logsOpen: boolean, widgetsOpen: boolean): number {
  return (logsOpen ? GRAPH_TOOL_OFFSETS.logs : 0) + (widgetsOpen ? GRAPH_TOOL_OFFSETS.widgets : 0);
}

export function desktopGraphToolsOffsetPx(
  width: number,
  logsOpen: boolean,
  widgetsOpen: boolean,
  scale = 1
): number {
  return isDesktopWidth(width) ? graphToolsOffsetPx(logsOpen, widgetsOpen) * scale : 0;
}

export function tabletGraphToolsYOffsetPx(
  width: number,
  logsOpen: boolean,
  widgetsOpen: boolean,
): number {
  if (!isTabletWidth(width)) return 0;
  return (logsOpen ? TABLET_TOOL_Y_OFFSETS.logs : 0) + (widgetsOpen ? TABLET_TOOL_Y_OFFSETS.widgets : 0);
}
