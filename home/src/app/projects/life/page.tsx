import LifeCanvas from "@/components/life/LifeCanvas";
import ProjectPageLayout from "@/components/projects/ProjectPageLayout";

export default function Page() {
  return (
    <ProjectPageLayout slug="life">
      <LifeCanvas />
    </ProjectPageLayout>
  );
}
