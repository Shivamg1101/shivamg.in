export type Profile = {
  id: number;
  name: string;
  headline: string;
  tagline: string | null;
  bio: string[];
  location: string | null;
  email: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  available: boolean;
  available_text: string | null;
  updated_at: string;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  summary: string | null;
  metrics: string[];
  tags: string[];
  achievements: string[];
  sort_order: number;
  created_at: string;
};

export type ProjectKind = "project" | "case-study";

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string | null;
  stack: string[];
  live_url: string | null;
  repo_url: string | null;
  cover_url: string | null;
  highlight: string | null;
  features: string[];
  category: string | null;
  role: string | null;
  metrics: string[];
  kind: ProjectKind;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type AutomationStatus = "live" | "paused" | "draft";

export type Automation = {
  id: string;
  name: string;
  trigger: string;
  systems: string[];
  status: AutomationStatus;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

/** Formats a date range the way the timeline displays it. */
export function formatRange(start: string, end: string | null, isCurrent: boolean) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return `${fmt(start)} – ${isCurrent || !end ? "Present" : fmt(end)}`;
}

/** Metric tiles are stored as "value | label"; split them for rendering. */
export function parseMetric(raw: string): { value: string; label: string } {
  const [value, ...rest] = raw.split("|");
  return { value: value.trim(), label: rest.join("|").trim() };
}
