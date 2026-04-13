import ThreeScene from "@/components/chladni/ThreeScene";
import ProjectPageLayout from "@/components/projects/ProjectPageLayout";

export default function Page() {
  return (
    <ProjectPageLayout slug="chladni">
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-[min(800px,100vmin)] w-[min(800px,100vmin)]">
          <ThreeScene />
        </div>
      </div>
    </ProjectPageLayout>
  );
}
