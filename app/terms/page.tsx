import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | 1775 Gaming LLC",
  description:
    "Terms of Service for Omniverse: Ascension and 1775 Gaming LLC services.",
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

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="text-gold flex-shrink-0 mt-0.5">—</span>
          <span className="font-body text-silver/70 text-sm leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div className="bg-marine-black min-h-screen">
      {/* Header */}
      <div className="border-b border-white/8 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-4">
            Legal
          </p>
          <h1 className="font-heading text-6xl lg:text-7xl text-white tracking-wide mb-4">
            TERMS OF SERVICE
          </h1>
          <p className="font-body text-silver/45 text-sm">
            Effective Date: April 26, 2026 &nbsp;·&nbsp; 1775 Gaming LLC |
            Omniverse: Ascension
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Intro */}
        <div className="mb-12 p-6 border border-gold/20 bg-gold/5">
          <P>
            Welcome to Omniverse: Ascension. These Terms of Service constitute a
            legally binding agreement between you and 1775 Gaming LLC regarding
            your use of our mobile application and related AI-driven RPG
            services.
          </P>
        </div>

        <Section number="1." title="ACCEPTANCE OF TERMS">
          <P>
            By downloading, installing, or using Omniverse: Ascension, you agree
            to be bound by these Terms. If you do not agree, you must immediately
            cease all use of the application. These Terms apply to all users,
            including those on the Citizen free tier through Super Group
            subscribers.
          </P>
        </Section>

        <Section number="2." title="ELIGIBILITY AND ACCOUNT SECURITY">
          <P>
            You must be at least 13 years of age to use this service. You are
            responsible for maintaining the security of your account and for all
            activities that occur under your credentials. 1775 Gaming LLC is not
            liable for any loss resulting from unauthorized access to your
            account.
          </P>
        </Section>

        <Section number="3." title="SUBSCRIPTION TIERS AND BILLING">
          <P>
            Omniverse: Ascension utilizes a tiered subscription model: Citizen,
            Household Hero, Neighborhood Hero, Superhero, and Super Group.
            Payments are managed through the Google Play Store billing system.
          </P>
          <BulletList
            items={[
              <>
                <span className="text-white font-semibold">
                  Automatic Renewal:
                </span>{" "}
                Subscriptions renew automatically unless canceled via Google Play
                settings at least 24 hours before the end of the billing cycle.
              </>,
              <>
                <span className="text-white font-semibold">Refunds:</span>{" "}
                Refund requests are governed by Google Play Store policies.
              </>,
              <>
                <span className="text-white font-semibold">Modifications:</span>{" "}
                We reserve the right to modify tier benefits or pricing with 30
                days notice.
              </>,
            ]}
          />
        </Section>

        <Section number="4." title="AI-DRIVEN GAMEPLAY AND RULES">
          <P>
            The game experience is generated dynamically by Large Language Models
            and a proprietary State-Machine Engine.
          </P>
          <BulletList
            items={[
              <>
                <span className="text-white font-semibold">Game Mechanics:</span>{" "}
                Outcomes are determined by the Mutants &amp; Masterminds d20
                system. Total = d20 + Modifiers. Results are final.
              </>,
              <>
                <span className="text-white font-semibold">AI Output:</span>{" "}
                While we strive for consistency, AI responses are
                non-deterministic. We are not responsible for narrative
                hallucinations or minor continuity errors.
              </>,
              <>
                <span className="text-white font-semibold">
                  Content Restrictions:
                </span>{" "}
                Users may not use prompts to generate illegal, sexually explicit,
                or hate speech content. 1775 Gaming LLC reserves the right to
                terminate access for jailbreaking or bypassing AI safety
                protocols.
              </>,
            ]}
          />
        </Section>

        <Section number="5." title="BIOMETRIC AND VISUAL DATA">
          <P>
            For tiers supporting Face-to-Character features, you grant 1775
            Gaming LLC permission to process uploaded images to create game
            assets. Raw images are deleted immediately after AI character
            generation. We do not store raw biometric data beyond the duration
            of the asset generation process.
          </P>
          <P>
            <span className="text-white font-semibold">
              Physical Activity Data (Heroic Momentum):
            </span>{" "}
            With your explicit consent, Omniverse: Ascension may read step count
            and workout data from Google Health Connect. This data is used solely
            to calculate in-game rewards. We do not sell, share, or transmit this
            data to third parties. You may revoke Health Connect permissions at
            any time through device settings.
          </P>
        </Section>

        <Section number="5a." title="LOCATION DATA">
          <P>
            You may voluntarily provide your home city and state. This is used
            exclusively for narrative immersion — the AI Game Master may
            reference regional weather, landmarks, or local events. No GPS
            coordinates are collected. You may hide or override your location at
            any time via{" "}
            <span className="text-silver font-semibold">
              Settings → Account → Campaign Location
            </span>
            .
          </P>
        </Section>

        <Section number="6." title="INTELLECTUAL PROPERTY">
          <P>
            All software, state-machine logic, trademarked names including
            Omniverse: Ascension, and pre-rendered assets are the property of
            1775 Gaming LLC. You may not reverse-engineer the AI engine or
            redistribute game assets.
          </P>
        </Section>

        <Section number="7." title="DISCLAIMER OF WARRANTIES">
          <P>
            The service is provided <span className="text-white">AS IS</span>{" "}
            and <span className="text-white">AS AVAILABLE</span>. We disclaim all
            warranties, express or implied. We do not warrant that the AI GM will
            be available at all times or that game sessions will be free of
            technical interruptions.
          </P>
        </Section>

        <Section number="8." title="LIMITATION OF LIABILITY">
          <P>
            To the maximum extent permitted by law, 1775 Gaming LLC shall not be
            liable for any indirect, incidental, or consequential damages,
            including loss of data or emotional distress resulting from game
            narratives.
          </P>
        </Section>

        <Section number="9." title="GOVERNING LAW">
          <P>
            These Terms are governed by the laws of the State of Missouri. Any
            legal action shall be brought exclusively in the courts of Platte
            County, Missouri.
          </P>
        </Section>

        {/* Copyright */}
        <div className="border-t border-white/8 pt-8 mt-4 mb-12">
          <p className="font-body text-silver/35 text-xs">
            © 2026 1775 Gaming LLC. All rights reserved.
          </p>
        </div>

        {/* OGL */}
        <div className="border border-gold/20 bg-gold/5 p-8">
          <h2 className="font-heading text-2xl text-gold tracking-wide mb-5">
            OPEN GAME LICENSE
          </h2>
          <div className="space-y-4">
            <P>
              This game uses content from the Mutants &amp; Masterminds
              roleplaying game system, published by Green Ronin Publishing.
              Mutants &amp; Masterminds is a trademark of Green Ronin Publishing,
              LLC. All rights reserved. Game design by Steve Kenson.
            </P>
            <P>
              OMNIVERSE: Ascension is an independent product and is not
              affiliated with, endorsed, sponsored, or specifically approved by
              Green Ronin Publishing, LLC.
            </P>
          </div>
        </div>
      </div>
    </div>
  );
}
