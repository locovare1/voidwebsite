export default function Loading() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-white">Loading debug test page...</p>
      </div>
    </div>
  );
}