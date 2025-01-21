import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>This Privacy Policy explains how Gifted (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and protects your personal information when you use our service. We respect your privacy and are committed to protecting your personal data.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <p>We collect several types of information for various purposes to provide and improve our Service to you:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Personal Data: email address, name, profile information</li>
            <li>Authentication Data: when you sign in with Google or email</li>
            <li>Usage Data: how you interact with our service</li>
            <li>Gift Preferences and History</li>
            <li>Payment Information (processed securely by our payment provider)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use the collected data for various purposes:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To provide analysis or valuable information to improve the Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To personalize gift recommendations</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
          <p>We implement appropriate security measures to protect your personal information. Your data is stored securely in AWS data centers, and we use industry-standard encryption for data transmission.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Third-Party Services</h2>
          <p>We may employ third-party companies and individuals for:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Payment processing (Stripe)</li>
            <li>Analytics</li>
            <li>Email delivery</li>
            <li>Authentication services (Google Sign-In)</li>
          </ul>
          <p className="mt-4">These third parties have access to your Personal Data only to perform specific tasks and are obligated not to disclose or use it for any other purpose.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Data Protection Rights</h2>
          <p>You have the following data protection rights:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>The right to access your personal data</li>
            <li>The right to update or correct your personal data</li>
            <li>The right to delete your personal data</li>
            <li>The right to restrict processing of your personal data</li>
            <li>The right to object to processing of your personal data</li>
            <li>The right to data portability</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies and Tracking</h2>
          <p>We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children&apos;s Privacy</h2>
          <p>Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>By email: privacy@gifted.ai</li>
            <li>By visiting our website: gifted.ai/contact</li>
          </ul>
          
          <div className="mt-8 pt-8 border-t">
            <p>By using Gifted, you agree to the collection and use of information in accordance with this Privacy Policy.</p>
            <p className="mt-4">
              Please also review our{" "}
              <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 