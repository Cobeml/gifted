import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>By accessing or using Gifted ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
          <p>Gifted is an AI-powered gift curation service that provides personalized gift recommendations and purchasing options. The Service includes gift suggestions, purchasing capabilities, and related features.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the security of your account and password. The company cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are owned by Gifted and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. User Content</h2>
          <p>You retain your rights to any content you submit, post or display on or through the Service. By submitting content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute it.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Payment Terms</h2>
          <p>Certain aspects of the Service may be provided for a fee. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Service.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
          <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>In no event shall Gifted, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at support@gifted.ai</p>
          
          <div className="mt-8 pt-8 border-t">
            <p>By using Gifted, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.</p>
            <p className="mt-4">
              For more information about our privacy practices, please review our{" "}
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 