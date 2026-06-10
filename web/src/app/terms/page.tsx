import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service and usage rules for SlaveCode.",
  alternates: { canonical: "/terms" },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-2">Terms of Service</h1>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Last Updated: June 10, 2026</p>
        </div>

        <p className="text-foreground leading-relaxed">
          Welcome to SlaveCode. By accessing or using our website, you agree to be bound by these Terms of Service.
          If you disagree with any part of these terms, you may not access the service.
        </p>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. Educational Use & Disclaimers</h2>
          <p className="text-muted-foreground leading-relaxed">
            SlaveCode is an educational platform designed to help software engineers practice and prepare for interviews.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Third-Party Content:</strong> Certain coding problems, system design diagrams, and datasets available
              on the platform are aggregated from open-source repositories (such as GitHub, Exercism) or are inspired by
              standard industry interview questions. All third-party trademarks, product names, and company names or logos
              cited herein are the property of their respective owners.
            </li>
            <li>
              <strong className="text-foreground">No Endorsement:</strong> SlaveCode is not affiliated with, endorsed by, or sponsored by any of the
              companies mentioned in our problem sets (e.g., LeetCode, Google, Meta, Amazon).
            </li>
            <li>
              <strong className="text-foreground">As-Is Service:</strong> The platform and its content are provided on an "as-is" basis without any
              warranties, expressed or implied. We do not guarantee the accuracy or completeness of any problem descriptions.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Acceptable Use Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to use the Service in any way that is unlawful, illegal, fraudulent, or harmful. Specifically,
            you must not:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>Use automated bots, scripts, or scrapers to access, solve, or submit solutions to our compilers.</li>
            <li>Intentionally submit malicious code, infinite loops, or server-crashing scripts to our code execution engine.</li>
            <li>Spam, cheat, or harass other users in the real-time Coding Arena or multiplayer matches.</li>
            <li>Attempt to reverse-engineer, decompile, or bypass any security measures of the platform.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. Account Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for
            any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to
            use the Service will cease immediately.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. User Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            By submitting code, comments, or other content to SlaveCode, you grant us a worldwide, non-exclusive,
            royalty-free license to use, reproduce, adapt, publish, and display such content in connection with the
            operation of the platform. You are solely responsible for the content you submit and ensure it does not violate
            any third-party rights.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to
            access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </div>
      </div>
    </div>
  );
}
