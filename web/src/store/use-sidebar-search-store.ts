import { create } from "zustand";
import { DIAGRAM_ASSETS } from "@/constants/diagram-assets";
import { PREBUILT_TEMPLATES, PrebuiltTemplate } from "@/constants/diagram-templates";

export interface SearchableShape {
  id: string;
  label: string;
  tool: string;
  geo?: string;
  iconName: string;
}

export interface SearchableDevice {
  id: string;
  label: string;
  iconName: string;
}

export interface SearchableFeature {
  id: string;
  label: string;
  desc: string;
  iconName: string;
  type: "category" | "action";
}

export const SEARCHABLE_DEVICES: SearchableDevice[] = [
  { id: "phone", label: "Phone Mockup", iconName: "Smartphone" },
  { id: "tablet", label: "Tablet Mockup", iconName: "Tablet" },
  { id: "desktop", label: "Desktop Screen", iconName: "AppWindow" },
  { id: "browser", label: "Browser Frame", iconName: "PanelTop" },
  { id: "laptop", label: "Laptop Screen", iconName: "Laptop" },
  { id: "terminal", label: "CLI Terminal Frame", iconName: "SquareTerminal" },
];

export const SEARCHABLE_SHAPES: SearchableShape[] = [
  { id: "select", label: "Select Pointer", tool: "select", iconName: "MousePointer2" },
  { id: "hand", label: "Pan Hand", tool: "hand", iconName: "Hand" },
  { id: "eraser", label: "Eraser", tool: "eraser", iconName: "Eraser" },
  { id: "text", label: "Text tool", tool: "text", iconName: "Type" },
  { id: "draw", label: "Draw Pencil", tool: "draw", iconName: "Pencil" },
  { id: "highlight", label: "Highlight Marker", tool: "highlight", iconName: "Highlighter" },
  { id: "laser", label: "Laser Pointer", tool: "laser", iconName: "Wand2" },
  { id: "line", label: "Line Connector", tool: "line", iconName: "Minus" },
  { id: "arrow", label: "Line Arrow", tool: "arrow", iconName: "MoveUpRight" },
  { id: "rectangle", label: "Rectangle Shape", tool: "geo", geo: "rectangle", iconName: "Square" },
  { id: "ellipse", label: "Ellipse / Circle Shape", tool: "geo", geo: "ellipse", iconName: "Circle" },
  { id: "triangle", label: "Triangle Shape", tool: "geo", geo: "triangle", iconName: "Triangle" },
  { id: "diamond", label: "Diamond Decision", tool: "geo", geo: "diamond", iconName: "Diamond" },
  { id: "hexagon", label: "Hexagon Shape", tool: "geo", geo: "hexagon", iconName: "Hexagon" },
  { id: "octagon", label: "Octagon Shape", tool: "geo", geo: "octagon", iconName: "Octagon" },
  { id: "pentagon", label: "Pentagon Shape", tool: "geo", geo: "pentagon", iconName: "Pentagon" },
  { id: "star", label: "Star Shape", tool: "geo", geo: "star", iconName: "Star" },
  { id: "cloud", label: "Cloud Shape", tool: "geo", geo: "cloud", iconName: "Cloud" },
  { id: "heart", label: "Heart Shape", tool: "geo", geo: "heart", iconName: "Heart" },
  { id: "oval", label: "Oval Shape", tool: "geo", geo: "oval", iconName: "Disc" },
  { id: "rhombus", label: "Rhombus Shape", tool: "geo", geo: "rhombus", iconName: "RectangleHorizontal" },
  { id: "trapezoid", label: "Trapezoid Shape", tool: "geo", geo: "trapezoid", iconName: "SquareDashed" },
  { id: "x-box", label: "X-Box Container", tool: "geo", geo: "x-box", iconName: "SquareX" },
  { id: "check-box", label: "Check-Box Container", tool: "geo", geo: "check-box", iconName: "SquareCheck" },
  { id: "arrow-left", label: "Block Arrow Left", tool: "geo", geo: "arrow-left", iconName: "ArrowLeft" },
  { id: "arrow-up", label: "Block Arrow Up", tool: "geo", geo: "arrow-up", iconName: "ArrowUp" },
  { id: "arrow-down", label: "Block Arrow Down", tool: "geo", geo: "arrow-down", iconName: "ArrowDown" },
  { id: "arrow-right", label: "Block Arrow Right", tool: "geo", geo: "arrow-right", iconName: "ArrowRight" },
  { id: "note", label: "Sticky Note", tool: "note", iconName: "StickyNote" },
  { id: "frame", label: "Frame Container", tool: "frame", iconName: "Frame" },
];

export const SEARCHABLE_FEATURES: SearchableFeature[] = [
  { id: "ai-chat", label: "AI Chat", desc: "Open AI Chat sidebar", iconName: "Sparkles", type: "category" },
  { id: "code-diagram", label: "Diagram as Code", desc: "Create diagrams using code", iconName: "Code2", type: "category" },
  { id: "templates", label: "Diagram Catalog", desc: "A catalog of 100+ templates", iconName: "LayoutGrid", type: "category" },
  { id: "shapes", label: "Shape", desc: "Explore our various shapes", iconName: "Shapes", type: "category" },
  { id: "icons", label: "Icon", desc: "3,900+ icons available", iconName: "Smile", type: "category" },
  { id: "devices", label: "Device Frame", desc: "Phone, tablet, browser frames", iconName: "Smartphone", type: "category" },
  { id: "figure", label: "Figure", desc: "Insert architectural block figure", iconName: "Frame", type: "action" },
  { id: "code-block", label: "Code Block", desc: "Insert formatted code layout", iconName: "Braces", type: "action" },
  { id: "image", label: "Image", desc: "Upload and insert image asset", iconName: "Image", type: "action" },
];

export interface SearchResults {
  generalIcons: typeof DIAGRAM_ASSETS;
  techLogos: typeof DIAGRAM_ASSETS;
  awsIcons: typeof DIAGRAM_ASSETS;
  gcpIcons: typeof DIAGRAM_ASSETS;
  templates: PrebuiltTemplate[];
  shapes: SearchableShape[];
  devices: SearchableDevice[];
  features: SearchableFeature[];
}

interface SidebarSearchStore {
  searchQuery: string;
  isSearching: boolean;
  searchResults: SearchResults;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

export const useSidebarSearchStore = create<SidebarSearchStore>((set) => ({
  searchQuery: "",
  isSearching: false,
  searchResults: {
    generalIcons: [],
    techLogos: [],
    awsIcons: [],
    gcpIcons: [],
    templates: [],
    shapes: [],
    devices: [],
    features: [],
  },
  setSearchQuery: (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      set({
        searchQuery: query,
        isSearching: false,
        searchResults: {
          generalIcons: [],
          techLogos: [],
          awsIcons: [],
          gcpIcons: [],
          templates: [],
          shapes: [],
          devices: [],
          features: [],
        },
      });
      return;
    }

    const q = trimmed.toLowerCase();

    // 1. Filter General Icons (generic names like "circle", "arrow", "database", etc.)
    const generalIcons = DIAGRAM_ASSETS.filter(
      (asset) =>
        !asset.id.startsWith("aws-") &&
        !asset.id.startsWith("gcp-") &&
        !asset.id.startsWith("azure-") &&
        !asset.id.startsWith("brand-") &&
        (asset.name.toLowerCase().includes(q) || asset.id.toLowerCase().includes(q))
    ).slice(0, 12);

    // 2. Filter Tech Logos / Brands
    const techLogos = DIAGRAM_ASSETS.filter(
      (asset) =>
        asset.id.startsWith("brand-") &&
        (asset.name.toLowerCase().includes(q) || asset.id.toLowerCase().includes(q))
    ).slice(0, 8);

    // 3. Filter AWS Icons specifically
    const awsIcons = DIAGRAM_ASSETS.filter(
      (asset) =>
        asset.id.startsWith("aws-") &&
        (asset.name.toLowerCase().includes(q) || asset.id.toLowerCase().includes(q))
    );

    // 4. Filter GCP Icons specifically
    const gcpIcons = DIAGRAM_ASSETS.filter(
      (asset) =>
        asset.id.startsWith("gcp-") &&
        (asset.name.toLowerCase().includes(q) || asset.id.toLowerCase().includes(q))
    );

    // 5. Filter Templates catalog
    const templates = PREBUILT_TEMPLATES.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q)
    ).slice(0, 6);

    // 6. Filter Searchable Shapes
    const shapes = SEARCHABLE_SHAPES.filter(
      (shp) =>
        shp.label.toLowerCase().includes(q) ||
        shp.id.toLowerCase().includes(q) ||
        (shp.geo && shp.geo.toLowerCase().includes(q))
    ).slice(0, 6);

    // 7. Filter Searchable Devices
    const devices = SEARCHABLE_DEVICES.filter(
      (dev) =>
        dev.label.toLowerCase().includes(q) ||
        dev.id.toLowerCase().includes(q)
    ).slice(0, 6);

    // 8. Filter Searchable Features
    const features = SEARCHABLE_FEATURES.filter(
      (feat) =>
        feat.label.toLowerCase().includes(q) ||
        feat.desc.toLowerCase().includes(q) ||
        feat.id.toLowerCase().includes(q)
    );

    set({
      searchQuery: query,
      isSearching: true,
      searchResults: {
        generalIcons,
        techLogos,
        awsIcons,
        gcpIcons,
        templates,
        shapes,
        devices,
        features,
      },
    });
  },
  clearSearch: () =>
    set({
      searchQuery: "",
      isSearching: false,
      searchResults: {
        generalIcons: [],
        techLogos: [],
        awsIcons: [],
        gcpIcons: [],
        templates: [],
        shapes: [],
        devices: [],
        features: [],
      },
    }),
}));
