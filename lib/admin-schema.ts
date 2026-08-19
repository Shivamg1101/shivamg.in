/**
 * Field definitions that drive the generic admin editor.
 * Adding a column here is all it takes to expose it in the CMS.
 */

export type FieldType = "text" | "textarea" | "markdown" | "list" | "bool" | "number" | "date" | "select";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  help?: string;
  options?: string[];
  required?: boolean;
};

export type Collection = {
  table: string;
  label: string;
  /** Column rendered as the row title in the list view. */
  titleKey: string;
  /** Column rendered as the row subtitle. */
  subtitleKey?: string;
  /** Ordering applied in the list view. */
  orderBy: { column: string; ascending: boolean };
  singleton?: boolean;
  readOnly?: boolean;
  fields: Field[];
};

export const COLLECTIONS: Record<string, Collection> = {
  profile: {
    table: "profile",
    label: "Profile",
    titleKey: "name",
    subtitleKey: "headline",
    orderBy: { column: "id", ascending: true },
    singleton: true,
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "headline", label: "Headline", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "textarea" },
      { key: "bio", label: "Bio paragraphs", type: "list", help: "One paragraph per line" },
      { key: "location", label: "Location", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "github_url", label: "GitHub URL", type: "text" },
      { key: "linkedin_url", label: "LinkedIn URL", type: "text" },
      { key: "resume_url", label: "Résumé URL", type: "text" },
      { key: "available", label: "Open to roles", type: "bool" },
      { key: "available_text", label: "Availability label", type: "text" },
    ],
  },

  experience: {
    table: "experience",
    label: "Experience",
    titleKey: "title",
    subtitleKey: "company",
    orderBy: { column: "sort_order", ascending: false },
    fields: [
      { key: "title", label: "Job title", type: "text", required: true },
      { key: "company", label: "Company", type: "text", required: true },
      { key: "location", label: "Location", type: "text" },
      { key: "start_date", label: "Start date", type: "date", required: true },
      { key: "end_date", label: "End date", type: "date", help: "Leave blank if current" },
      { key: "is_current", label: "Current role", type: "bool" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "metrics", label: "Metric chips", type: "list", help: "One per line" },
      { key: "tags", label: "Tech tags", type: "list", help: "One per line" },
      { key: "achievements", label: "Key achievements", type: "list", help: "One per line" },
      { key: "sort_order", label: "Sort order", type: "number", help: "Higher shows first" },
    ],
  },

  projects: {
    table: "projects",
    label: "Projects",
    titleKey: "title",
    subtitleKey: "summary",
    orderBy: { column: "sort_order", ascending: false },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true, help: "URL-safe, unique" },
      { key: "summary", label: "Summary", type: "textarea", required: true },
      { key: "body", label: "Detail", type: "markdown" },
      { key: "stack", label: "Stack", type: "list", help: "One per line" },
      { key: "live_url", label: "Live URL", type: "text" },
      { key: "repo_url", label: "Repo URL", type: "text" },
      { key: "kind", label: "Kind", type: "select", options: ["project", "case-study"] },
      { key: "featured", label: "Featured", type: "bool" },
      { key: "published", label: "Published", type: "bool" },
      { key: "sort_order", label: "Sort order", type: "number" },
    ],
  },

  automations: {
    table: "automations",
    label: "Automations",
    titleKey: "name",
    subtitleKey: "trigger",
    orderBy: { column: "sort_order", ascending: true },
    fields: [
      { key: "name", label: "Workflow name", type: "text", required: true },
      { key: "trigger", label: "Trigger", type: "text", required: true },
      { key: "systems", label: "Systems", type: "list", help: "One per line" },
      { key: "status", label: "Status", type: "select", options: ["live", "paused", "draft"] },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort order", type: "number", help: "Lower shows first" },
    ],
  },

  posts: {
    table: "posts",
    label: "Write-ups",
    titleKey: "title",
    subtitleKey: "excerpt",
    orderBy: { column: "created_at", ascending: false },
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "excerpt", label: "Excerpt", type: "textarea" },
      { key: "body", label: "Body", type: "markdown" },
      { key: "tags", label: "Tags", type: "list", help: "One per line" },
      { key: "published", label: "Published", type: "bool" },
      { key: "published_at", label: "Publish date", type: "date" },
    ],
  },

  messages: {
    table: "messages",
    label: "Messages",
    titleKey: "name",
    subtitleKey: "email",
    orderBy: { column: "created_at", ascending: false },
    readOnly: true,
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "read", label: "Read", type: "bool" },
    ],
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS);
