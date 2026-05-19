import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | 1775 Gaming LLC",
  description:
    "Privacy Policy for 1775 Gaming LLC and Omniverse: Ascension.",
};

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-heading text-2xl text-gold tracking-wider flex-shrink-0">
          {number}
        </span>
        <h2 className="font-heading text-2xl text-white tracking-wide">
          {title}
        </h2>
      </div>
      <div className="pl-10 space-y-3">{children}</div>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-silver/70 text-sm leading-relaxed">{children}</p>
  );
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-gold/30 pl-4 py-1">
      <p className="font-body text-white text-sm font-semibold mb-1">{label}</p>
      <p className="font-body text-silver/65 text-sm leading-relaxed">
        {children}
      </p>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-marine-black min-h-screen">
      {/* Header */}
      <div className="border-b border-white/8 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-4">
            Legal
          </p>
          <h1 className="font-heading text-6xl lg:text-7xl text-white tracking-wide mb-4">
            PRIVACY POLICY
          </h1>
          <p className="font-body text-silver/45 text-sm">
            Last Updated: April 26, 2026 &nbsp;·&nbsp; 1775 Gaming LLC
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-0">

        <Section number="1." title="DATA COLLECTION: THE POWER LIMITS">
          <P>We only collect data necessary to facilitate your Heroic Journey.</P>
          <div className="space-y-5 mt-4">
            <DataRow label="Identity Data">
              Email and account credentials for tier verification.
            </DataRow>
            <DataRow label="Biometric & Visual Data">
              For the Face-to-Character feature, images are processed to generate
              AI portraits. Raw images are deleted immediately after the AI
              character model is generated. We do not store your actual face — we
              store only the appearance weights of your character.
            </DataRow>
            <DataRow label="Physical Activity Data (Heroic Momentum)">
              With your explicit permission via Google Health Connect, we read
              step count and workout duration data. This data is used exclusively
              to calculate in-game rewards. Only anonymized reward totals are
              stored on our servers. Raw biometric activity data is never
              retained. You may revoke access at any time through device settings.
            </DataRow>
            <DataRow label="Location Data (Optional)">
              You may voluntarily provide a home city and state, used solely by
              the AI Game Master to add geographic immersion. No GPS coordinates
              are collected. Location data may be hidden or overridden at any
              time in account settings.
            </DataRow>
            <DataRow label="Game State Data">
              We track your character sheets, inventory, and Degrees of Success
              to ensure persistence across sessions.
            </DataRow>
          </div>
        </Section>

        <Section number="2." title="AI & MACHINE LEARNING PROCESSING">
          <div className="space-y-4">
            <DataRow label="Narrative Inputs">
              Your prompts are processed via Large Language Models. These are
              anonymized and not used to train public models.
            </DataRow>
            <DataRow label="Automated Decision Making">
              Our State-Machine Engine uses automated logic to determine game
              outcomes. By playing, you acknowledge that The Oracle has final say
              on your Critical Successes and Failures.
            </DataRow>
          </div>
        </Section>

        <Section number="3." title="THIRD-PARTY DATA SHARING">
          <P>
            1775 Gaming LLC does not sell your data. We only share information
            with:
          </P>
          <ul className="space-y-2 mt-3">
            {[
              <>
                <span className="text-white font-semibold">
                  Google Play Billing:
                </span>{" "}
                To manage subscriptions.
              </>,
              <>
                <span className="text-white font-semibold">API Providers:</span>{" "}
                Secure, encrypted transmission to our AI inference servers.
              </>,
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-gold flex-shrink-0 mt-0.5">—</span>
                <span className="font-body text-silver/70 text-sm leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section number="4." title="SUBSCRIPTION & MONETIZATION">
          <P>
            Payment information is handled exclusively by Google Play. We never
            see or store your credit card or banking details.
          </P>
        </Section>

        <Section number="5." title="DATA RETENTION & DELETION">
          <div className="space-y-4">
            <DataRow label="Citizen Accounts">
              Inactive data is purged after 12 months of non-use.
            </DataRow>
            <DataRow label="The Right to Forget">
              You may request a full Character Wipe at any time through app
              settings. This deletes all lore, portraits, and state-machine
              history associated with your account.
            </DataRow>
          </div>
        </Section>

        <Section number="6." title="CONTACT & LEGAL">
          <P>
            For data inquiries contact:{" "}
            <a
              href="mailto:legal@1775gaming.com"
              className="text-gold hover:text-gold/80 transition-colors underline underline-offset-2"
            >
              legal@1775gaming.com
            </a>
          </P>
        </Section>

        {/* Footer */}
        <div className="border-t border-white/8 pt-8 mt-4">
          <p className="font-body text-silver/35 text-xs">
            © 2026 1775 Gaming LLC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
