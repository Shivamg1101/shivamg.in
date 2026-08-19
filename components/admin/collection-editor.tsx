"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Collection, Field } from "@/lib/admin-schema";

type Row = Record<string, unknown>;

const input =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary";

function emptyRow(c: Collection): Row {
  const r: Row = {};
  for (const f of c.fields) {
    r[f.key] =
      f.type === "list" ? [] : f.type === "bool" ? false : f.type === "number" ? 0 : "";
  }
  return r;
}

function FieldInput({
  field,
  value,
  onChange,
  disabled,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
}) {
  const id = `f-${field.key}`;

  if (field.type === "bool") {
    return (
      <label className="flex items-center gap-2.5 text-sm">
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[hsl(var(--primary))]"
        />
        <span className="font-medium">{field.label}</span>
      </label>
    );
  }

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {field.type === "select" ? (
        <select
          id={id}
          disabled={disabled}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={input}
        >
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "list" ? (
        <textarea
          id={id}
          disabled={disabled}
          rows={Math.max(3, (Array.isArray(value) ? value.length : 0) + 1)}
          value={Array.isArray(value) ? value.join("\n") : ""}
          onChange={(e) =>
            onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))
          }
          className={`${input} resize-y font-mono text-[13px]`}
        />
      ) : field.type === "textarea" || field.type === "markdown" ? (
        <textarea
          id={id}
          disabled={disabled}
          rows={field.type === "markdown" ? 10 : 4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={`${input} resize-y`}
        />
      ) : field.type === "number" ? (
        <input
          id={id}
          type="number"
          disabled={disabled}
          value={Number(value ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className={input}
        />
      ) : field.type === "date" ? (
        <input
          id={id}
          type="date"
          disabled={disabled}
          value={value ? String(value).slice(0, 10) : ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={input}
        />
      ) : (
        <input
          id={id}
          type="text"
          disabled={disabled}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={input}
        />
      )}

      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

export function CollectionEditor({ collection }: { collection: Collection }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await createClient()
      .from(collection.table)
      .select("*")
      .order(collection.orderBy.column, { ascending: collection.orderBy.ascending });
    if (error) setErr(error.message);
    else {
      setRows(data ?? []);
      if (collection.singleton && data?.[0]) setEditing(data[0]);
    }
  }, [collection]);

  useEffect(() => {
    // Fetching on mount: the setState happens after the await inside load(),
    // not synchronously in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    setBusy(true);
    setErr(null);
    setNote(null);

    const payload: Row = {};
    for (const f of collection.fields) payload[f.key] = editing[f.key];

    const supabase = createClient();
    const id = editing.id;
    const { error } = id
      ? await supabase.from(collection.table).update(payload).eq("id", id)
      : await supabase.from(collection.table).insert(payload);

    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setNote("Saved");
    if (!collection.singleton) setEditing(null);
    load();
  }

  async function remove(row: Row) {
    if (!confirm(`Delete "${String(row[collection.titleKey])}"? This cannot be undone.`)) return;
    setBusy(true);
    const { error } = await createClient().from(collection.table).delete().eq("id", row.id);
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setEditing(null);
      load();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      {/* list */}
      {!collection.singleton && (
        <aside className="grid content-start gap-2">
          {!collection.readOnly && (
            <button
              onClick={() => setEditing(emptyRow(collection))}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              + New {collection.label.replace(/s$/, "")}
            </button>
          )}
          <div className="grid gap-1.5">
            {rows.map((r) => (
              <button
                key={String(r.id)}
                onClick={() => setEditing(r)}
                className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                  editing?.id === r.id
                    ? "border-primary/50 bg-accent"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="truncate text-sm font-semibold">
                  {String(r[collection.titleKey] ?? "—")}
                </div>
                {collection.subtitleKey && (
                  <div className="truncate text-xs text-muted-foreground">
                    {String(r[collection.subtitleKey] ?? "")}
                  </div>
                )}
              </button>
            ))}
            {rows.length === 0 && (
              <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                Nothing here yet.
              </p>
            )}
          </div>
        </aside>
      )}

      {/* form */}
      <section>
        {editing ? (
          <div className="grid gap-4 rounded-md border border-border bg-card p-6">
            {collection.fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={editing[f.key]}
                disabled={collection.readOnly && f.key !== "read"}
                onChange={(v) => setEditing({ ...editing, [f.key]: v })}
              />
            ))}

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <button
                onClick={save}
                disabled={busy}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              {!collection.singleton && (
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
                >
                  Cancel
                </button>
              )}
              {!collection.singleton && editing.id != null && (
                <button
                  onClick={() => remove(editing)}
                  className="ml-auto rounded-md border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  Delete
                </button>
              )}
            </div>

            <p aria-live="polite" className="min-h-5 text-sm">
              {note && <span className="text-success">{note}</span>}
              {err && <span className="text-destructive">{err}</span>}
            </p>
          </div>
        ) : (
          <div className="grid place-items-center rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Select an entry on the left, or create a new one.
          </div>
        )}
      </section>
    </div>
  );
}
