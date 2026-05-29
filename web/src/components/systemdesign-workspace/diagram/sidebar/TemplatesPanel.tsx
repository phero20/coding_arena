"use client";

import { useState, useMemo } from "react";
import {

  LayoutGrid,
  Search,
  ArrowLeft,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Cpu,
  Layers,
  Database,
  Terminal,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PREBUILT_TEMPLATES,
  PrebuiltTemplate,
} from "@/constants/diagram-templates";
import { Card } from "@/components/ui/card";
import { generateTemplateShapes } from "./utils/template-generator";

interface TemplatesPanelProps {
  editor: any;
  onNavigateBack: () => void;
}

export function TemplatesPanel({
  editor,
  onNavigateBack,
}: TemplatesPanelProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [injectingId, setInjectingId] = useState<string | null>(null);

  const categories = [
    "All",
    "Data Model",
    "Flow Diagram",
    "Architecture Diagram",
    "Sequence Diagram",
  ];

  const filteredTemplates = useMemo(() => {
    return PREBUILT_TEMPLATES.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "All" || template.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const handleInsertTemplate = async (template: PrebuiltTemplate) => {
    if (!editor) return;
    setInjectingId(template.id);

    try {
      await generateTemplateShapes(template, editor);
    } catch (e) {
      console.error("Failed to inject prebuilt template:", e);
    } finally {
      setInjectingId(null);
    }
  };



  const isSearching = search.trim() !== "";

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Category header tabs */}
      <div className="px-4 py-3 flex flex-col gap-3.5 border-b shrink-0 bg-card">
        <div className="flex items-center gap-2 min-h-[28px] pb-1">
          {activeCategory !== "All" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 -ml-1.5"
              onClick={() => setActiveCategory("All")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Elegant left-aligned title */}
          {activeCategory === "All" ? (
            <div className="flex flex-col items-start justify-center select-none text-left">
              <span className="text-xs font-semibold leading-tight text-foreground">
                Diagram Catalog
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                Pre-built interactive templates
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-foreground font-semibold select-none text-left">
              <span className="font-bold text-foreground">
                {activeCategory} Examples
              </span>
            </div>
          )}
        </div>

        {/* Real-time search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-xs bg-background"
          />
        </div>
      </div>

      {/* Grid Templates List or Category Selector */}
      <div className="flex-1 overflow-y-auto">
        {activeCategory === "All" && !isSearching ? (
          <div className="w-[264px] mx-auto py-3 space-y-2">
            {[
              {
                id: "Data Model",
                title: "Data Model Examples",
                subtitle: "10+ data model examples",
                icon: Database,
              },
              {
                id: "Flow Diagram",
                title: "Flow Diagram Examples",
                subtitle: "10+ flow diagram examples",
                icon: Layers,
              },
              {
                id: "Architecture Diagram",
                title: "Architecture Diagram Examples",
                subtitle: "30+ architecture diagram examples",
                icon: Cpu,
              },
              {
                id: "Sequence Diagram",
                title: "Sequence Diagram Examples",
                subtitle: "10+ sequence diagram examples",
                icon: Terminal,
              },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant="outline"
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full h-auto p-3 flex justify-start items-center gap-3.5 hover:border-primary/50 hover:bg-primary/5 group transition-all whitespace-normal"
                >
                  <Icon className="size-5 shrink-0 stroke-[1.5] text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {cat.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium group-hover:text-primary/70 transition-colors mt-0.5 leading-normal">
                      {cat.subtitle}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="py-3 px-2 space-y-3">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="p-4 hover:border-primary/45 transition-colors flex flex-col gap-3 min-w-0 bg-background shadow-none"
                >
                  <div className="flex flex-col gap-1 overflow-hidden w-full">
                    <h3 className="text-sm font-bold tracking-tight text-foreground truncate w-0 min-w-full block">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  </div>

                  {/* Elegant minimalist icon previews */}
                  <div className="flex flex-wrap gap-1">
                    {template.icons.map((ic) => (
                      <span
                        key={ic}
                        className="text-[9px] font-medium text-muted-foreground/90 bg-muted/40 px-1.5 py-0.5 rounded border border-muted-foreground/5 capitalize"
                      >
                        {ic
                          .replace(/^(aws|azure|gcp|brand)-/, "")
                          .replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>

                  {/* Clean standard button */}
                  <Button
                    size="sm"
                    className="w-full text-xs font-semibold gap-2 mt-1"
                    onClick={() => handleInsertTemplate(template)}
                    disabled={injectingId !== null}
                  >
                    Insert to Canvas
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40 stroke-[1.5]" />
                <p className="text-xs font-medium text-muted-foreground mt-2">
                  No templates matched your search.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
