import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="void-button">
            Return Home
          </Link>
          <Link 
            href="/contact" 
            className="void-button bg-transparent border-2 border-[#8A2BE2] hover:bg-[#8A2BE2]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
} 