import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { Badge } from "@/components/ui/badge";

/* Modular Stats Cards */
import { IdentityCard } from "./stats-cards/IdentityCard";
import { TacticalLogCard } from "./stats-cards/TacticalLogCard";
import { SolveBreakdownCard } from "./stats-cards/SolveBreakdownCard";
import { ActivityHeatmapCard } from "./stats-cards/ActivityHeatmapCard";
import { StatHighlightsCard } from "./stats-cards/StatHighlightsCard";
import { SocialTabCard } from "./stats-cards/SocialTabCard";

const ease = [0.16, 1, 0.3, 1] as const;

export const Statistics = () => {
  return (
    <section className="relative py-40 overflow-hidden border-t border-border/20">
      <Container className="relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] max-w-xl">
                <span className="text-foreground">
                  Your journey, quantified in real-time.
                </span>
              </h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed border-l-2 border-border/40 pl-6">
              SlaveCode tracks every line you write and every battle you win to
              build your global developer identity.
            </p>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4  items-stretch">
          {/* Main Content: Left Column */}
          <div className="xl:col-span-4 flex flex-col gap-4 ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-full"
            >
              <IdentityCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TacticalLogCard />
            </motion.div>
          </div>

          {/* Main Content: Right Column */}
          <div className="xl:col-span-8 flex flex-col gap-4 ">
            {/* Top Row: Solve Breakdown + Social + Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 ">
              {/* Left Stack: Solve Breakdown & Social */}
              <div className="lg:col-span-7 flex flex-col gap-4 ">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <SocialTabCard />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex-1"
                >
                  <SolveBreakdownCard />
                </motion.div>
              </div>

              {/* Right: Stats Highlights (Full Height) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="lg:col-span-5 h-full"
              >
                <StatHighlightsCard />
              </motion.div>
            </div>

            {/* Bottom Row: Activity Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <ActivityHeatmapCard />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
};
