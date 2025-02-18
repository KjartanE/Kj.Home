import ThreeScene from "@/components/chladni/ThreeScene";

export default function Page() {
  return (
    <div className="relative mt-14 flex h-[calc(100vh-3.5rem)] flex-1 items-center justify-center overflow-hidden">
      <div className="h-[800px] w-[800px]">
        <ThreeScene />
      </div>
    </div>
  );
}
