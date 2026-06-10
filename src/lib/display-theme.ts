export type DisplayThemeId = "studio" | "retro" | "macos" | "brutalism" | "bachelor";

export type DisplayTheme = {
  presetId: DisplayThemeId;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  accent: string;
  accentText: string;
  primaryButton: string;
  primaryButtonText: string;
  secondaryButton: string;
  secondaryButtonText: string;
  sidebar: string;
  sidebarText: string;
  sidebarAccent: string;
  sidebarAccentText: string;
  sidebarBorder: string;
  decorativeA: string;
  decorativeB: string;
  decorativeC: string;
  headingFont: string;
  bodyFont: string;
  panelRadius: number;
  buttonRadius: number;
};

export type DisplayThemePreset = {
  id: DisplayThemeId;
  name: string;
  description: string;
  mood: string;
  theme: DisplayTheme;
};

export const DISPLAY_THEME_PRESETS: DisplayThemePreset[] = [
  {
    id: "studio",
    name: "Studio Soft",
    description: "Bawaan yang tenang untuk operasional self-photo studio.",
    mood: "Clean, warm, safe",
    theme: {
      presetId: "studio",
      background: "#faf8f3",
      surface: "#ffffff",
      text: "#2f3632",
      mutedText: "#6f766f",
      border: "#e7e1d8",
      accent: "#d9a7a1",
      accentText: "#2f3632",
      primaryButton: "#5f7f71",
      primaryButtonText: "#ffffff",
      secondaryButton: "#f2eee7",
      secondaryButtonText: "#2f3632",
      sidebar: "#ffffff",
      sidebarText: "#2f3632",
      sidebarAccent: "#edf3ef",
      sidebarAccentText: "#2f3632",
      sidebarBorder: "#e7e1d8",
      decorativeA: "#d9a7a1",
      decorativeB: "#e7eee8",
      decorativeC: "#f3d899",
      headingFont: "Playfair Display",
      bodyFont: "Inter",
      panelRadius: 14,
      buttonRadius: 8,
    },
  },
  {
    id: "retro",
    name: "Retro Fun",
    description: "Diambil dari UI Retro Lovable: mint canvas, cream panel, outline tegas.",
    mood: "Playful, nostalgic, friendly",
    theme: {
      presetId: "retro",
      background: "#bde6c3",
      surface: "#fdf6e3",
      text: "#202020",
      mutedText: "#706a5f",
      border: "#202020",
      accent: "#bcdaea",
      accentText: "#202020",
      primaryButton: "#202020",
      primaryButtonText: "#fff9e8",
      secondaryButton: "#f7c8c8",
      secondaryButtonText: "#202020",
      sidebar: "#fdf6e3",
      sidebarText: "#202020",
      sidebarAccent: "#f7c8c8",
      sidebarAccentText: "#202020",
      sidebarBorder: "#202020",
      decorativeA: "#f7c8c8",
      decorativeB: "#bcdaea",
      decorativeC: "#f6d94f",
      headingFont: "DM Serif Display",
      bodyFont: "Work Sans",
      panelRadius: 18,
      buttonRadius: 14,
    },
  },
  {
    id: "macos",
    name: "macOS Clean",
    description: "Diambil dari UI macOS Lovable: surface putih, hairline, system blue.",
    mood: "Sharp, modern, familiar",
    theme: {
      presetId: "macos",
      background: "#f7f8fb",
      surface: "#ffffff",
      text: "#30343b",
      mutedText: "#747b87",
      border: "#e2e6ee",
      accent: "#edf4ff",
      accentText: "#1d56b3",
      primaryButton: "#1473e6",
      primaryButtonText: "#ffffff",
      secondaryButton: "#f0f2f6",
      secondaryButtonText: "#30343b",
      sidebar: "#f4f5f8",
      sidebarText: "#30343b",
      sidebarAccent: "#eaf2ff",
      sidebarAccentText: "#155eb8",
      sidebarBorder: "#e2e6ee",
      decorativeA: "#ff605c",
      decorativeB: "#ffbd44",
      decorativeC: "#00ca4e",
      headingFont: "Inter",
      bodyFont: "Inter",
      panelRadius: 12,
      buttonRadius: 10,
    },
  },
  {
    id: "brutalism",
    name: "Modern Brutalism",
    description: "Diambil dari UI Brutalism Lovable: charcoal canvas, orange CTA, acid accent.",
    mood: "Bold, punchy, high contrast",
    theme: {
      presetId: "brutalism",
      background: "#242427",
      surface: "#303033",
      text: "#f5f5f2",
      mutedText: "#aaaab1",
      border: "#5d5d63",
      accent: "#b7ff3d",
      accentText: "#202020",
      primaryButton: "#ff7a1a",
      primaryButtonText: "#202020",
      secondaryButton: "#414146",
      secondaryButtonText: "#f5f5f2",
      sidebar: "#1b1b1e",
      sidebarText: "#f5f5f2",
      sidebarAccent: "#b7ff3d",
      sidebarAccentText: "#202020",
      sidebarBorder: "#5d5d63",
      decorativeA: "#ff7a1a",
      decorativeB: "#b7ff3d",
      decorativeC: "#7a5cff",
      headingFont: "Archivo Black",
      bodyFont: "Work Sans",
      panelRadius: 8,
      buttonRadius: 6,
    },
  },
  {
    id: "bachelor",
    name: "Bachelor Mono",
    description: "Diambil dari UI Bachelor Lovable: editorial paper, mono rail, minimalist.",
    mood: "Mono, editorial, premium",
    theme: {
      presetId: "bachelor",
      background: "#f5f3ee",
      surface: "#fbfaf7",
      text: "#2b2b2b",
      mutedText: "#777068",
      border: "#ddd7cc",
      accent: "#e8e4dd",
      accentText: "#111111",
      primaryButton: "#111111",
      primaryButtonText: "#f7f4ee",
      secondaryButton: "#e8e4dd",
      secondaryButtonText: "#2b2b2b",
      sidebar: "#111111",
      sidebarText: "#f2eee7",
      sidebarAccent: "#2f2f2f",
      sidebarAccentText: "#f7f4ee",
      sidebarBorder: "#3d3d3d",
      decorativeA: "#111111",
      decorativeB: "#d7d0c4",
      decorativeC: "#f5f3ee",
      headingFont: "Instrument Serif",
      bodyFont: "Work Sans",
      panelRadius: 6,
      buttonRadius: 24,
    },
  },
];

export const DEFAULT_DISPLAY_THEME = DISPLAY_THEME_PRESETS[1].theme;

export function getDisplayPreset(id: DisplayThemeId) {
  return DISPLAY_THEME_PRESETS.find((preset) => preset.id === id) ?? DISPLAY_THEME_PRESETS[0];
}

export function normalizeDisplayTheme(theme?: Partial<DisplayTheme> | null): DisplayTheme {
  return {
    ...DEFAULT_DISPLAY_THEME,
    ...(theme ?? {}),
  };
}

export function applyDisplayTheme(theme: DisplayTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const vars: Record<string, string> = {
    "--background": theme.background,
    "--foreground": theme.text,
    "--card": theme.surface,
    "--card-foreground": theme.text,
    "--popover": theme.surface,
    "--popover-foreground": theme.text,
    "--primary": theme.primaryButton,
    "--primary-foreground": theme.primaryButtonText,
    "--secondary": theme.secondaryButton,
    "--secondary-foreground": theme.secondaryButtonText,
    "--muted": theme.secondaryButton,
    "--muted-foreground": theme.mutedText,
    "--accent": theme.accent,
    "--accent-foreground": theme.accentText,
    "--border": theme.border,
    "--input": theme.border,
    "--ring": theme.primaryButton,
    "--sidebar": theme.sidebar,
    "--sidebar-foreground": theme.sidebarText,
    "--sidebar-primary": theme.primaryButton,
    "--sidebar-primary-foreground": theme.primaryButtonText,
    "--sidebar-accent": theme.sidebarAccent,
    "--sidebar-accent-foreground": theme.sidebarAccentText,
    "--sidebar-border": theme.sidebarBorder,
    "--sidebar-ring": theme.primaryButton,
    "--retro-mint": theme.background,
    "--retro-pink": theme.decorativeA,
    "--retro-sky": theme.decorativeB,
    "--retro-cream": theme.surface,
    "--retro-sun": theme.decorativeC,
    "--retro-ink": theme.text,
    "--radius": `${theme.panelRadius}px`,
    "--app-button-radius": `${theme.buttonRadius}px`,
    "--font-sans": fontStack(theme.bodyFont),
    "--font-display": fontStack(theme.headingFont),
  };

  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  root.dataset.displayTheme = theme.presetId;
}

export function fontStack(font: string) {
  const quoted = font.includes(" ") ? `"${font}"` : font;
  if (/serif|georgia|times/i.test(font)) {
    return `${quoted}, ui-serif, Georgia, "Times New Roman", serif`;
  }
  if (/mono/i.test(font)) {
    return `${quoted}, ui-monospace, SFMono-Regular, Menlo, monospace`;
  }
  return `${quoted}, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
}

export function isValidHexColor(value: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}
