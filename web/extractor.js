
import {
  Play,
  RotateCcw,
  HelpCircle,
  Code,
  Settings2,
  Layout,
  Sliders,
  Code2,
  ArrowRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import dagre from "@dagrejs/dagre";
import { resolveDiagramAsset } from "@/utils/diagram-asset-matcher";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Editor from "@monaco-editor/react";
import { Input } from "@/components/ui/input";

interface CodeDiagramPanelProps {
  editor: any;
}

const TEMPLATE_CODE = `title Architecture Diagram
direction right

API gateway [icon: aws-api-gateway]
Lambda [icon: aws-lambda]
S3 [icon: aws-simple-storage-service]

VPC Subnet [icon: aws-vpc] {
  Main Server {
    Server [icon: aws-ec2]
    Data [icon: aws-rds]
  }

  Queue [icon: aws-auto-scaling]

  Compute Nodes {
    Worker1 [icon: aws-ec2]
    Worker2 [icon: aws-ec2]
    Worker3 [icon: aws-ec2]
  }
}

Analytics [icon: aws-redshift]

API gateway > Lambda > Server > Data
Server > Queue
Queue > Worker1, Worker2, Worker3
S3 < Data
Compute Nodes > Analytics`;

export function CodeDiagramPanel({ editor }: CodeDiagramPanelProps) {
  const [code, setCode] = useState(TEMPLATE_CODE);
  const [direction, setDirection] = useState<"vertical" | "horizontal">(
    "horizontal",
  );
  const [spacing, setSpacing] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleEditorDidMount = (editorInstance: any, monaco: any) => {
    monaco.languages.register({ id: "system-diagram" });

    monaco.languages.setMonarchTokensProvider("system-diagram", {
      tokenizer: {
        root: [
          [/\/\/.*$/, "comment"],
          [/->/, "keyword"],
          [/\[/, { token: "delimiter.bracket", next: "@attributes" }],
          [/[a-zA-Z0-9_-]+/, "type.identifier"],
        ],
        attributes: [
          [/\]/, { token: "delimiter.bracket", next: "@pop" }],
          [/[a-zA-Z0-9_-]+(?=\s*:)/, "attribute.name"],
          [/:/, "delimiter"],
          [/"[^"]*"/, "string"],
          [/[a-zA-Z0-9_-]+/, "attribute.value"],
          [/,/, "delimiter"],
        ],
      },
    });

    monaco.editor.defineTheme("diagram-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "type.identifier", foreground: "4fc1ff", fontStyle: "bold" },
        { token: "attribute.name", foreground: "dcdcaa" },
        { token: "attribute.value", foreground: "9cdcfe" },
        { token: "string", foreground: "ce9178" },
      ],
      colors: {
        "editor.background": "#121214",
        "editor.lineHighlightBackground": "#ffffff0a",
      },
    });

    monaco.editor.setTheme("diagram-theme");
  };

