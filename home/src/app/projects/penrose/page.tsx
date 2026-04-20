import PenrosePlayground from "@/components/penrose/playground/PenrosePlayground";
import ProjectPageLayout from "@/components/projects/ProjectPageLayout";

export default function Page() {
  return (
    <ProjectPageLayout slug="penrose">
      <PenrosePlayground />
    </ProjectPageLayout>
  );
}
