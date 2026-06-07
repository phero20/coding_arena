
import { Code } from "lucide-react";

interface Feature {
  icon: string;
  title: string;
  content: string;
}

const POSITIONS = [
  // LEFT side
  { cx: "24%", cy: "15%" }, // Top Left
  { cx: "10%", cy: "50%" }, // Middle Left
  { cx: "24%", cy: "80%" }, // Bottom Left
  // RIGHT side
  { cx: "66%", cy: "12%" }, // Top Right
  { cx: "90%", cy: "40%" }, // Middle Right
  { cx: "76%", cy: "75%" }, // Bottom Right
];

export function SlugAboutFeatures({
  features = [],
  icon,
  language,
}: {
  features?: Feature[];
  icon?: string;
  language?: string;
}) {
  if (!features.length) return null;

  const slots = features.slice(0, 6);

  return (
    <section className="w-full ">
      <div className="mx-auto max-w-7xl px-4 border-t-2 border-border/50 pt-20 pb-0">
        
        {/* Section Heading */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Key Features of <span className="text-primary">{language || "the Language"}</span>
          </h2>
        </div>

        {/* Mobile Layout (Vertical Stack) */}
        <div className="grid grid-cols-1 md:grid-cols-2 justify-center gap-12 lg:hidden mx-auto">
          {slots.map((feat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 max-w-lg md:w-full mx-auto">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                <div 
                  className="h-10 w-10 bg-primary"
                  style={{
                    WebkitMaskImage: `url(/assets/key-features/${feat.icon}.svg)`,
                    WebkitMaskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskImage: `url(/assets/key-features/${feat.icon}.svg)`,
                    maskSize: "contain",
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-md font-bold text-foreground leading-tight mb-2">
                  {feat.title}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout (Circular) */}
        <div className="hidden lg:block relative mx-auto" style={{ width: "100%", maxWidth: 920, aspectRatio: "920/650" }}>

          {/* ── Center hex icon ─────────────────────────────────── */}
          <div
            className="absolute z-10 flex items-center justify-center"
            style={{
              width: "120px",
              height: "120px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            {icon ? (
              <img src={icon} alt="Track icon" className="w-full h-full object-contain relative z-10" />
            ) : (
              <Code className="w-full text-primary relative z-10" />
            )}
          </div>

          {/* ── Feature cards ────────────────────────────────────── */}
          {slots.map((feat, i) => {
            const pos = POSITIONS[i];
            return (
              <div
                key={i}
                className="absolute z-10 flex flex-col gap-2 justify-center items-center text-center"
                style={{
                  left: pos.cx,
                  top:  pos.cy,
                  width: "300px",
                  transform: "translate(-50%, -50%)"
                }}
              >
                <div className="">
                  <div 
                    className="h-10 w-10 bg-primary"
                    style={{
                      WebkitMaskImage: `url(/assets/key-features/${feat.icon}.svg)`,
                      WebkitMaskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskImage: `url(/assets/key-features/${feat.icon}.svg)`,
                      maskSize: "contain",
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                    }}
                  />
                </div>
                <p className="text-md font-bold text-foreground leading-tight">
                  {feat.title}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.content}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}