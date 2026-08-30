import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your account is authenticated, but you do not have permission to access the Command Center.
        </p>
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium">
            &larr; Return to public site
          </Link>
        </div>
      </div>
    </div>
  );
}
