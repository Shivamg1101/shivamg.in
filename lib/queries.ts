import { createClient } from "@/lib/supabase/server";
import type { Automation, Experience, Post, Profile, Project } from "@/lib/types";

/**
 * Public reads. RLS already filters unpublished rows, but the explicit
 * ordering here is what the pages rely on.
 */

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profile").select("*").eq("id", 1).maybeSingle();
  return data;
}

export async function getExperience(): Promise<Experience[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experience")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("start_date", { ascending: false });
  return data ?? [];
}

export async function getProjects(kind?: "project" | "case-study"): Promise<Project[]> {
  const supabase = await createClient();
  let q = supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (kind) q = q.eq("kind", kind);
  const { data } = await q;
  return data ?? [];
}

export async function getProject(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function getAutomations(): Promise<Automation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("automations")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

export async function getPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).maybeSingle();
  return data;
}
