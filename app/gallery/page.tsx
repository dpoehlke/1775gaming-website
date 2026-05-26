import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Concept art, character designs, and animated previews from Omniverse: Ascension — 1775 Gaming's AI-powered superhero RPG.",
  openGraph: {
    title: "Gallery | 1775 Gaming",
    description:
      "Concept art and animated previews from Omniverse: Ascension.",
    images: [{ url: "/gallery/axiom_sheet.png" }],
  },
};

const IMAGES = [
  {
    src: "/gallery/smash.png",
    alt: 'SMASH — hero delivering a rune-powered punch',
    caption: "SMASH",
    wide: true,
  },
  {
    src: "/gallery/axiom_kneeling.png",
    alt: "Axiom kneeling in the ruins of a destroyed city",
    caption: "The Weight of Victory",
    wide: false,
  },
  {
    src: "/gallery/axiom_sheet.png",
    alt: "Axiom character reference sheet — The Omniverse's Prime Guardian",
    caption: "AXIOM — Character Sheet",
    wide: false,
  },
  {
    src: "/gallery/comic_panels.png",
    alt: "Comic panels: fire heroine, slime villain, and fleeing civilians",
    caption: "Origin Sequence",
    wide: true,
  },
];

const VIDEOS = [
  {
    src: "/gallery/mucha_style.mp4",
    caption: "Art Nouveau Style",
    label: "Concept Reel",
  },
  {
    src: "/gallery/mp_.mp4",
    caption: "Omniverse: Ascension",
    label: "Concept Reel",
  },
];

export default function GalleryPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative flex items-center justify-center min-h-[40vh] py-24 px-4 bg-marine-black overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(184,134,11,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <p className="font-body text-xs text-gold tracking-[0.45em] uppercase mb-5">
            Omniverse: Ascension
          </p>
          <h1 className="font-heading text-8xl lg:text-[9rem] text-white tracking-wide mb-6">
            GALLERY
          </h1>
          <p className="font-body text-silver/70 text-lg leading-relaxed">
            Concept art, character designs, and animated previews from
            the world of Omniverse: Ascension
          </p>
        </div>
      </section>

      {/* ─── IMAGES ─── */}
      <section className="py-16 px-4 bg-marine-black border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <span className="font-body text-xs text-gold tracking-[0.35em] uppercase">
              Concept Art
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {IMAGES.map((img) => (
              <div
                key={img.src}
                className={`group relative overflow-hidden bg-charcoal border border-white/5 hover:border-gold/30 transition-all duration-300 ${
                  img.wide ? "md:col-span-2" : "md:col-span-1"
                }`}
              >
                <div
                  className={`relative w-full ${
                    img.wide ? "aspect-[16/7]" : "aspect-[3/4]"
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes={
                      img.wide
                        ? "(max-width: 768px) 100vw, 66vw"
                        : "(max-width: 768px) 100vw, 33vw"
                    }
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-marine-black/0 group-hover:bg-marine-black/40 transition-colors duration-300" />
                </div>
                {/* Caption bar */}
                <div className="px-4 py-3 border-t border-white/5">
                  <p className="font-heading text-sm text-silver/80 tracking-wider uppercase">
                    {img.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VIDEOS ─── */}
      <section className="py-16 px-4 bg-charcoal border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <span className="font-body text-xs text-gold tracking-[0.35em] uppercase">
              Animated Previews
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VIDEOS.map((vid) => (
              <div
                key={vid.src}
                className="group relative overflow-hidden bg-marine-black border border-white/5 hover:border-gold/30 transition-all duration-300"
              >
                {/* Badge */}
                <div className="absolute top-3 left-3 z-10 bg-gold px-2.5 py-1">
                  <span className="font-body text-[10px] font-bold uppercase tracking-widest text-marine-black">
                    {vid.label}
                  </span>
                </div>

                <div className="aspect-video">
                  <video
                    src={vid.src}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                </div>

                {/* Caption bar */}
                <div className="px-4 py-3 border-t border-white/5">
                  <p className="font-heading text-sm text-silver/80 tracking-wider uppercase">
                    {vid.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
