export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "1775 Gaming LLC",
    url: "https://www.1775gaming.com",
    logo: "https://www.1775gaming.com/images/Logo.png",
    description:
      "Disabled Veteran-owned independent mobile game studio specializing in AI-powered gaming, augmented reality, and health integration.",
    founder: {
      "@type": "Person",
      name: "Darin Oehlke",
    },
    foundingLocation: {
      "@type": "Place",
      name: "Weatherby Lake, Missouri, USA",
    },
    knowsAbout: [
      "Mobile Gaming",
      "Artificial Intelligence",
      "Augmented Reality",
      "Health Gamification",
      "Tabletop RPG",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function VideoGameSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Omniverse: Ascension",
    description:
      "An AI-powered mobile RPG built on the Mutants & Masterminds 3e framework. Battle in augmented reality, track real-world health stats to power your hero, and experience a living game world driven by intelligent AI.",
    genre: ["RPG", "Action", "Adventure", "Superhero"],
    gamePlatform: ["iOS", "Android"],
    operatingSystem: ["iOS", "Android"],
    applicationCategory: "Game",
    publisher: {
      "@type": "Organization",
      name: "1775 Gaming LLC",
      url: "https://www.1775gaming.com",
    },
    author: {
      "@type": "Person",
      name: "Darin Oehlke",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description:
        "Free to play with optional subscription tiers: Citizen, Household Hero, Neighborhood Hero, Superhero, Super Group",
    },
    featureList: [
      "AI Game Master",
      "Augmented Reality Combat",
      "Health and Fitness Integration",
      "Mutants and Masterminds 3e ruleset",
      "AI-generated hero portraits",
      "Persistent narrative consequences",
      "Real-world geolocation integration",
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostSchema({
  title,
  description,
  publishedDate,
  slug,
}: {
  title: string;
  description: string;
  publishedDate: string;
  slug: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    datePublished: publishedDate,
    author: {
      "@type": "Person",
      name: "Darin Oehlke",
    },
    publisher: {
      "@type": "Organization",
      name: "1775 Gaming LLC",
      logo: {
        "@type": "ImageObject",
        url: "https://www.1775gaming.com/images/Logo.png",
      },
    },
    url: `https://www.1775gaming.com/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.1775gaming.com/blog/${slug}`,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
