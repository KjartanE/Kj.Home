import MandelbrotBackground from "@/components/mandelbrot/MandelbrotBackground";
import ProjectPageLayout from "@/components/projects/ProjectPageLayout";

export default function MandelbrotPage() {
  return (
    <ProjectPageLayout slug="mandelbrot">
      <MandelbrotBackground />
    </ProjectPageLayout>
  );
}
