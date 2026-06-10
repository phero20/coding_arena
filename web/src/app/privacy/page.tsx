import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and data collection practices for SlaveCode.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Last Updated: June 10, 2026</p>
        </div>

        <p className="text-foreground leading-relaxed">
          Welcome to SlaveCode. We are committed to protecting your personal information and your right to privacy.
          If you have any questions or concerns about our policy, or our practices with regards to your personal
          information, please contact us.
        </p>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. What Information Do We Collect?</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Personal Information Provided by You:</strong> We collect email addresses, passwords (hashed),
            usernames, and social login data when you register for an account. We use <strong className="text-foreground">Clerk</strong> as our
            secure authentication provider. We do not store your raw passwords on our servers.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Usage Data:</strong> We automatically collect certain information when you visit, use or navigate the
            Platform. This information does not reveal your specific identity but may include device and usage information,
            such as your IP address, browser and device characteristics, referring URLs, and information about how and when
            you use our platform.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Third-Party Analytics and Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use <strong className="text-foreground">Google Analytics</strong> and <strong className="text-foreground">Vercel Analytics</strong> to monitor and analyze the use
            of our Service. These services use cookies and similar tracking technologies to track activity on our platform
            and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie
            is being sent.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. Will Your Information Be Shared With Anyone?</h2>
          <p className="text-muted-foreground leading-relaxed">
            We only share information with the following third parties:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li><strong className="text-foreground">Clerk:</strong> For user authentication and identity management.</li>
            <li><strong className="text-foreground">Google Analytics:</strong> For anonymous website traffic analysis.</li>
            <li><strong className="text-foreground">Sentry:</strong> For application error tracking and stability monitoring.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell, rent, or trade your personal information with third parties for their promotional purposes.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. User Generated Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            Any code, comments, or solutions you submit to the SlaveCode platform (including the Arena, Academy, and
            System Design Workspaces) may be stored on our servers to provide the service. You retain ownership of your
            original code, but grant us a license to store, execute, and display it within the platform.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. How Long Do We Keep Your Information?</h2>
          <p className="text-muted-foreground leading-relaxed">
            We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy
            unless otherwise required by law. You may request the deletion of your account and associated personal data at
            any time.
          </p>
        </div>
      </div>
    </div>
  );
}
