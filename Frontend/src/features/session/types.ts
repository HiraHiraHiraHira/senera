export type ConfirmationIntent = {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "danger" | "neutral";
  details: string[];
  onConfirm: () => void;
};

export type SessionMenuAction = {
  id: string;
  label: string;
  icon: JSX.Element;
  destructive?: boolean;
  disabled?: boolean;
  shortcut?: string;
  onSelect: () => void;
};

export type SessionMenuSection = {
  section: string;
  items: readonly SessionMenuAction[];
};

export const preferenceSections = [
  {
    id: "layout",
    title: "界面",
    items: [
      {
        id: "defaultSidebarCollapsed",
        title: "默认收起左侧栏",
        description: "下次启动或进入宽屏布局时，左侧栏先以窄栏显示。",
      },
      {
        id: "defaultRightPanelCollapsed",
        title: "默认收起思维面板",
        description: "下次启动或进入宽屏布局时，思维面板先以窄栏显示。",
      },
    ],
  },
] as const;

export type LayoutPreferenceId = (typeof preferenceSections)[number]["items"][number]["id"];

export const motionLevelOptions = [
  {
    id: "full",
    title: "完整",
    description: "结构变化、列表插入和轻触反馈都启用。",
  },
  {
    id: "reduced",
    title: "轻量",
    description: "保留淡入淡出，关闭位移和缩放。",
  },
  {
    id: "none",
    title: "关闭",
    description: "关闭 Motion 和 CSS 动画。",
  },
] as const;
