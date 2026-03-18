"use client";

import React from "react";
import { Users, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArenaRoom } from "@/services/arena.service";
import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store/match-store/use-editor-store";

interface OpponentsPanelProps {
  room?: ArenaRoom | null;
  currentUserId?: string | null;
}

import { useShallow } from "zustand/react/shallow";

export const OpponentsPanel = React.memo(({
  room,
  currentUserId,
}: OpponentsPanelProps) => {
  const { theme } = useTheme();
  const [selectedOpponentId, setSelectedOpponentId] = React.useState<string | null>(null);
  
  // Use focused selector for opponent codes
  const opponentCodes = useEditorStore(
    useShallow((state) => state.opponentCodes)
  );

  const opponents = React.useMemo(() => {
    if (!room?.players) return [];
    return Object.values(room.players).filter((p) => p.userId !== currentUserId);
  }, [room?.players, currentUserId]);

  const selectedOpponent = React.useMemo(() => {
    if (!selectedOpponentId || !room?.players) return null;
    return room.players[selectedOpponentId];
  }, [selectedOpponentId, room?.players]);

  const selectedOpponentCode = selectedOpponentId 
    ? opponentCodes[selectedOpponentId] || "// Waiting for code updates..." 
    : "// No opponent selected";

  if (selectedOpponentId) {
    return (
      <div className="flex flex-col h-[500px] md:size-full bg-background/50 overflow-hidden">
        <div className="p-3 border-b border-border/40 flex items-center gap-3 shrink-0">
          <Button
            size="icon"
            onClick={() => setSelectedOpponentId(null)}
            className="p-1.5"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <img
              src={
                selectedOpponent?.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedOpponent?.username}`
              }
              className="size-6 rounded-full border border-border/40"
              alt={selectedOpponent?.username}
            />
            <span className="text-sm font-bold">
              {selectedOpponent?.username}'s  Code
            </span>
          </div>
        </div>
        <div className="flex-1 min-h-0 relative w-full">
          <Editor
            height="100%"
            theme={theme === "dark" ? "vs-dark" : "light"}
            language={room?.language || "java"}
            value={selectedOpponentCode}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: true,
              scrollBeyondLastLine: false,
              readOnly: true,
              automaticLayout: true,
              fontFamily: "var(--font-mono)",
              padding: { top: 16 },
              cursorSmoothCaretAnimation: "on",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              wordWrap: "on",
              wrappingIndent: "indent",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] md:h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="size-4 text-primary" />
            Battlefield ({opponents.length})
          </h3>
        </div>

        {opponents.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 grayscale">
            <Users className="size-12 mb-4" />
            <p className="text-sm">No opponents in the arena yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {opponents.map((player) => (
              <Card
                key={player.userId}
                className="p-3 border border-border/40 bg-muted/20 rounded-lg px-4 overflow-hidden transition-all data-[state=open]:border-primary/40 hover:border-primary/20 cursor-pointer group flex items-center justify-between"
                onClick={() => setSelectedOpponentId(player.userId)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        player.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`
                      }
                      className="size-10 rounded-full border border-border/40 shadow-sm"
                      alt={player.username}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{player.username}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className="text-[10px] px-2 h-6">
                        {player.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button className="px-3 py-1.5" size="sm">
                  Spectate
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
});
