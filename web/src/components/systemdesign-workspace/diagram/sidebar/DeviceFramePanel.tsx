import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, AppWindow, PanelTop, Laptop, SquareTerminal } from "lucide-react";
import { createShapeId } from "tldraw";

interface DeviceFramePanelProps {
  editor: any;
}

const DEVICES = [
  { id: "phone", label: "Phone", icon: Smartphone },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "desktop", label: "Desktop", icon: AppWindow },
  { id: "browser", label: "Browser", icon: PanelTop },
  { id: "laptop", label: "Laptop", icon: Laptop },
  { id: "terminal", label: "Terminal", icon: SquareTerminal },
];

export function DeviceFramePanel({ editor }: DeviceFramePanelProps) {
  const handleInsertDevice = (deviceId: string) => {
    if (!editor) return;
    const viewportCenter = editor.getViewportPageBounds().center;
    let width = 400;
    let height = 300;
    let name = "Frame";

    switch (deviceId) {
      case "phone":
        width = 150;
        height = 320;
        name = "Phone";
        break;
      case "tablet":
        width = 300;
        height = 400;
        name = "Tablet";
        break;
      case "desktop":
        width = 560;
        height = 360;
        name = "Desktop";
        break;
      case "browser":
        width = 480;
        height = 320;
        name = "Browser";
        break;
      case "laptop":
        width = 520;
        height = 320;
        name = "Laptop";
        break;
      case "terminal":
        width = 420;
        height = 280;
        name = "Terminal";
        break;
    }

    editor.run(() => {
      const id = createShapeId();
      editor.createShapes([
        {
          id,
          type: "device-frame",
          x: viewportCenter.x - width / 2,
          y: viewportCenter.y - height / 2,
          props: {
            w: width,
            h: height,
            deviceType: deviceId,
          },
        },
      ]);
      editor.select(id);
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3">
        <div className="text-[11px] font-semibold text-muted-foreground mb-3 px-1 uppercase tracking-wider">
          Mockups & Frames
        </div>
        <div className="flex flex-col gap-2">
          {DEVICES.map((device) => (
            <Button
              key={device.id}
              variant="outline"
              className="w-full h-auto p-3 flex justify-start items-center gap-4 hover:border-primary/50 hover:bg-primary/5 group transition-all"
              onClick={() => handleInsertDevice(device.id)}
            >
              <device.icon className="size-5 shrink-0 stroke-[1.5] text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{device.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
