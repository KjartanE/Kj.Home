import ThreeScene from "@/components/geometry/ThreeScene";
import ProjectPageLayout from "@/components/projects/ProjectPageLayout";

export default function Page() {
  return (
    <ProjectPageLayout slug="geometry">
      <ThreeScene />
    </ProjectPageLayout>
  );
}
