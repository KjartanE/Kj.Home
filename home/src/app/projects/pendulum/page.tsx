import PendulumScene from "@/components/pendulum/PendulumScene";
import ProjectPageLayout from "@/components/projects/ProjectPageLayout";

export default function Page() {
  return (
    <ProjectPageLayout slug="pendulum">
      <PendulumScene />
    </ProjectPageLayout>
  );
}
