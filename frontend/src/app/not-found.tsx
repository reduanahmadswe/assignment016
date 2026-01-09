import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 text-primary-600 mb-6">
          <FileQuestion className="w-12 h-12" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center justify-center">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
          <Link href="/events" className="btn-secondary inline-flex items-center justify-center">
            <Search className="w-4 h-4 mr-2" />
            Browse Events
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Looking for something specific?{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
