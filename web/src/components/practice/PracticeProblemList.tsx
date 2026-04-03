"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Problem } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useProblems } from "@/hooks/use-problems";
import { useProblemSelection } from "@/hooks/use-problem-selection";
import { Loader2, Swords } from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "../ui/button-group";

const difficultyColor: Record<string, string> = {
  Easy: "text-emerald-400",
  Medium: "text-amber-400",
  Hard: "text-rose-400",
};

const difficultyBg: Record<string, string> = {
  Easy: "bg-emerald-400/10 border-emerald-500/30",
  Medium: "bg-amber-400/10 border-amber-500/30",
  Hard: "bg-rose-400/10 border-rose-500/30",
};

type DifficultyFilter = "All" | "Easy" | "Medium" | "Hard";

interface PracticeProblemListProps {
  isSelectPage?: boolean;
  roomId?: string;
}

export const PracticeProblemList: React.FC<PracticeProblemListProps> = ({
  isSelectPage = false,
  roomId,
}) => {
  const [page, setPage] = useState(1);
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("All");

  const { handleSelect, selectingId, isLoading: isSelectionLoading } = useProblemSelection({ roomId });

  const { problems, meta, isLoading, error } = useProblems(page, 20);

  const filteredProblems = useMemo(() => {
    let list = problems;

    if (difficultyFilter !== "All") {
      list = list.filter((p) => p.difficulty === difficultyFilter);
    }

    if (topicFilter.trim()) {
      const t = topicFilter.toLowerCase();
      list = list.filter((p) =>
        p.topics.some((topic) => topic.toLowerCase().includes(t)),
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.problem_slug.toLowerCase().includes(q),
      );
    }

    return list;
  }, [problems, difficultyFilter, topicFilter, search]);

  const renderBody = () => {
    if (isLoading) {
      return (
        <TableBody>
          {Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="animate-pulse">
              <TableCell className="px-4 py-3">
                <div className="h-3 w-12 rounded-full bg-muted" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="h-3 w-40 rounded-full bg-muted" />
              </TableCell>
              <TableCell className="px-4 py-3">
                <div className="h-6 w-16 rounded-full bg-muted" />
              </TableCell>
              <TableCell className="px-4 py-3 hidden md:table-cell">
                <div className="h-3 w-32 rounded-full bg-muted" />
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (error) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-10 text-center text-sm text-destructive"
            >
              Failed to load problems: {error.message}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    if (!filteredProblems.length) {
      return (
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={5}
              className="py-10 text-center text-sm text-muted-foreground"
            >
              No problems found{" "}
              {topicFilter ? `for topic "${topicFilter}"` : ""} with current
              filters.
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {filteredProblems.map((problem) => (
          <ProblemRow
            key={problem.problem_id}
            problem={problem}
            isSelectPage={isSelectPage}
            onSelect={() => handleSelect(problem)}
            isHosting={isSelectionLoading && selectingId === problem.problem_id}
          />
        ))}
      </TableBody>
    );
  };

  return (
    <section className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            {isSelectPage && (
              <div className="mb-6 flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Swords className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">
                      Arena Selection Mode
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      Choose a problem to host your coding battle.
                    </p>
                  </div>
                </div>
                <Link href="/arena">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-bold border-border/40 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            )}
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isSelectPage ? "Select Problem" : "Practice"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-balance">
              {isSelectPage
                ? "Browse and select a challenge for your arena match."
                : "Solve curated problems to sharpen your skills before entering the arena."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2">
              <ButtonGroup>
                {(["All", "Easy", "Medium", "Hard"] as DifficultyFilter[]).map(
                  (d) => (
                    <Button
                      key={d}
                      variant={difficultyFilter === d ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDifficultyFilter(d)}
                      className="rounded-lg px-3 py-1 text-xs font-semibold h-8"
                    >
                      {d}
                    </Button>
                  ),
                )}
              </ButtonGroup>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1 flex gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or slug"
              className="h-10 flex-1  border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              placeholder="Topic (e.g. Array)"
              className="h-10 w-40  border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button
              type="button"
              variant="outline"
              className=" h-10"
              onClick={() => {
                setPage(1);
                setSearch("");
                setDifficultyFilter("All");
                setTopicFilter("");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </header>

      <Card className="border rounded-lg border-border/60 bg-card/70 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table className="table-fixed">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="pl-4 pr-0 md:pr-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-12">
                  ID
                </TableHead>
                <TableHead className="px-4 md:px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest">
                  Title
                </TableHead>
                <TableHead className="px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-20 sm:w-32">
                  Difficulty
                </TableHead>
                <TableHead className="px-4 py-3 h-12 text-left font-bold text-xs uppercase tracking-widest w-40 hidden md:table-cell">
                  Topics
                </TableHead>
                <TableHead className="px-4 py-3 h-12 text-right font-bold text-xs uppercase tracking-widest w-24 sm:w-28">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            {renderBody()}
          </Table>
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">
            Page <span className="text-foreground">{page}</span> of{" "}
            {meta.totalPages}
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4  border-border/40 font-bold transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30 "
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4  border-border/40 font-bold transition-all hover:border-primary/50 hover:text-primary disabled:opacity-30 "
              onClick={() => {
                setPage((p) => Math.min(meta.totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page === meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

interface ProblemRowProps {
  problem: Problem;
  isSelectPage: boolean;
  onSelect: () => void;
  isHosting: boolean;
}

const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  isSelectPage,
  onSelect,
  isHosting,
}) => {
  return (
    <TableRow className="group border-t border-border/40 hover:bg-primary/3 transition-colors">
      <TableCell className="pl-4 pr-0 md:pr-4 py-3 align-middle text-xs text-muted-foreground">
        {problem.problem_id}
      </TableCell>
      <TableCell className="px-0 md:px-4 py-3 align-middle min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="text-sm truncate font-bold text-foreground group-hover:text-primary transition-colors">
            <Link href={`/practice/problem/${problem.problem_slug}`}>
              {" "}
              <Button className="p-0" variant="link">
                {problem.title}
              </Button>
            </Link>
          </div>
          <span className="mt-0.5 truncate text-[10px] uppercase font-bold tracking-tight text-muted-foreground/60 hidden sm:block">
            {problem.problem_slug}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <span
          className={cn(
            "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
            difficultyBg[problem.difficulty],
            difficultyColor[problem.difficulty],
            "border-transparent",
          )}
        >
          {problem.difficulty}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-[11px] text-muted-foreground hidden md:table-cell">
        <div className="flex flex-wrap gap-1.5">
          {problem.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-right whitespace-nowrap">
        {isSelectPage ? (
          <Button
            key={problem.problem_id}
            size="sm"
            onClick={onSelect}
            disabled={isHosting}
            className="text-xs font-medium h-8 px-3  transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 bg-primary/90 hover:bg-primary"
          >
            {isHosting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>SELECT</>
            )}
          </Button>
        ) : (
          <Link href={`/practice/problem/${problem.problem_slug}`}>
            <Button
              key={problem.problem_id}
              size="sm"
              className=" text-xs h-8 px-4 font-black transition-all  hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              SOLVE
            </Button>
          </Link>
        )}
      </TableCell>
    </TableRow>
  );
};
