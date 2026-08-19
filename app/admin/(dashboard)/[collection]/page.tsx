import { notFound } from "next/navigation";
import { COLLECTIONS } from "@/lib/admin-schema";
import { CollectionEditor } from "@/components/admin/collection-editor";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const config = COLLECTIONS[collection];
  if (!config) notFound();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{config.label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {config.readOnly
            ? "Read-only — incoming messages from the contact form."
            : `Edit the ${config.label.toLowerCase()} shown on the public site.`}
        </p>
      </div>
      <CollectionEditor collection={config} />
    </>
  );
}
