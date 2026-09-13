import { KnowledgePageEditor } from "../../_page-editor";

export default async function EditKnowledgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KnowledgePageEditor pageId={id} />;
}
