import Link from 'next/link';

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const { email } = await searchParams;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Unsubscribed Successfully
          </h1>
          <div className="mb-6 text-gray-600">
            <p>
              {email
                ? `${email} has been unsubscribed from our newsletter.`
                : 'You have been unsubscribed from our newsletter.'}
            </p>
            <p className="mt-2">
              We&apos;re sorry to see you go! You can always subscribe again if you change your mind.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
} 