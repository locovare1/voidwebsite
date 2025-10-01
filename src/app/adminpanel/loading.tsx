export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F0F0F]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FFFFFF] mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading Admin Panel</h2>
        <p className="text-gray-400">Please wait while we prepare your dashboard...</p>
      </div>
    </div>
  );
}