export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
