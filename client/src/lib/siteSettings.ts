export interface SiteSettings {
  siteTitle: string;
  instagramHandle: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "Max's Top Picks",
  instagramHandle: "@MaxTheBlue21",
};

export function getSiteSettings(): SiteSettings {
  try {
    const saved = localStorage.getItem("siteSettings");
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSiteSettings(settings: Partial<SiteSettings>) {
  const current = getSiteSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem("siteSettings", JSON.stringify(updated));
  return updated;
}
