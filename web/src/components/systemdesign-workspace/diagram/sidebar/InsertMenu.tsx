import {
  Sparkles,
  Shapes,
  Smartphone,
  Frame,
  Braces,
  Image,
  ChevronRight,
  Code2,
  LayoutTemplate,
  ImageIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const MENU_CATEGORIES = [
  { id: "ai-chat", label: "AI Chat", desc: "Generate diagrams with AI", icon: Sparkles },
  { id: "code-diagram", label: "Diagram as Code", desc: "Create diagrams using code", icon: Code2 },
  { id: "templates", label: "Diagram Catalog", desc: "A catalog of 100+ templates", icon: LayoutTemplate },
  { id: "shapes", label: "Shape", desc: "Explore our various shapes", icon: Shapes },
  { id: "icons", label: "Icon", desc: "3,900+ icons available", icon: ImageIcon },
  { id: "devices", label: "Device Frame", desc: "Phone, tablet, browser frames", icon: Smartphone },
];

const QUICK_ACTIONS = [
  { id: "figure", label: "Figure", icon: Frame },
  { id: "code-block", label: "Code Block", icon: Braces },
];

interface InsertMenuProps {
  onNavigate: (view: string) => void;
  onUploadClick: () => void;
}

export function InsertMenu({ onNavigate, onUploadClick }: InsertMenuProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-3">
        <div className="text-[11px] font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
          All Categories
        </div>

        <div className="space-y-2">
          {MENU_CATEGORIES.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="w-full justify-start h-auto p-3 gap-4 group hover:border-primary/40 hover:bg-primary/5 transition-all"
              onClick={() => onNavigate(item.id)}
            >
              <item.icon className="size-12 shrink-0 text-muted-foreground group-hover:text-primary transition-colors stroke-[1.5]" />
              <div className="flex flex-col items-start flex-1 overflow-hidden">
                <span className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">{item.label}</span>
                <span className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1">
                  {item.desc}
                </span>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </Button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="h-auto flex-col gap-2 py-4 px-2 group hover:border-primary/40 hover:bg-primary/5 transition-all"
              onClick={() => onNavigate(item.id)}
            >
              <item.icon className="size-6 text-muted-foreground stroke-[1.5] group-hover:text-primary transition-colors" />
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
            </Button>
          ))}
          {/* Image Upload has a unique onClick handler */}
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 py-4 px-2 group hover:border-primary/40 hover:bg-primary/5 transition-all"
            onClick={onUploadClick}
          >
            <Image className="size-6 text-muted-foreground stroke-[1.5] group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">Image</span>
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
