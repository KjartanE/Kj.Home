import ThreeScene from "@/components/chladni/ThreeScene";

export default function Page() {
  return (
    <div className="relative flex-1 h-[calc(100vh-3.5rem)] overflow-hidden mt-14 flex items-center justify-center">
      <div className="w-[800px] h-[800px]">
        <ThreeScene />
      </div>
    </div>
  );
}
