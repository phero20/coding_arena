"use client";

import React from "react";
import { formatValue } from "@/lib/test-case";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function safeJsonParse(raw: any) {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function getTableFormat(obj: any): "leetcode" | "row-based" | "columnar" | null {
  if (!obj || typeof obj !== "object") return null;

  // 1. LeetCode Format: { headers: [...], data/values: [...] }
  if (!Array.isArray(obj)) {
    const hasHeaders = "headers" in obj && (Array.isArray(obj.headers) || typeof obj.headers === "object");
    const hasData = "data" in obj && Array.isArray(obj.data);
    const hasValues = "values" in obj && Array.isArray(obj.values);
    if (hasHeaders && (hasData || hasValues)) return "leetcode";
  }

  // 2. Row-based: [{ col1: val1, col2: val2 }]
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null) {
    return "row-based";
  }
  
  // 3. Columnar: { col1: [val1, val2], col2: [val1, val2] }
  // MUST have at least 2 columns and all columns must be the exact same length to avoid false positives with algorithm params!
  if (!Array.isArray(obj)) {
    const keys = Object.keys(obj);
    if (keys.length >= 2) {
      const values = Object.values(obj);
      if (values.every(Array.isArray)) {
        const firstLen = values[0].length;
        if (values.every(arr => arr.length === firstLen)) {
          return "columnar";
        }
      }
    }
  }

  return null;
}

export const DataFrameRenderer: React.FC<{ data: any }> = ({ data }) => {
  const format = getTableFormat(data);
  let headers: string[] = [];
  let rows: any[][] = [];

  if (format === "leetcode") {
    headers = Array.isArray(data.headers) ? data.headers : Object.keys(data.headers);
    rows = data.data || data.values || [];
  } else if (format === "row-based") {
    if (data.length > 0) {
      headers = Object.keys(data[0]);
      rows = data.map((row: any) => headers.map(h => row[h]));
    }
  } else if (format === "columnar") {
    headers = Object.keys(data);
    const maxLen = Math.max(...headers.map(h => data[h].length));
    for (let i = 0; i < maxLen; i++) {
      rows.push(headers.map(h => data[h][i]));
    }
  }

  try {
    return (
      <div className="rounded-md border border-border/50 bg-background/50 overflow-hidden my-2">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {headers.map((h: string, i: number) => (
                <TableHead key={i} className="h-8 py-1 px-3 text-xs font-semibold text-foreground/80">
                  {String(h)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: any[], rIdx: number) => (
              <TableRow key={rIdx} className="border-border/30 hover:bg-muted/30">
                {Array.isArray(row) ? row.map((cell: any, cIdx: number) => (
                  <TableCell key={cIdx} className="py-1.5 px-3 text-xs text-muted-foreground">
                    {formatValue(cell)}
                  </TableCell>
                )) : (
                  <TableCell className="py-1.5 px-3 text-xs text-muted-foreground">
                    {formatValue(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(headers.length, 1)} className="h-10 text-center text-xs text-muted-foreground/50">
                  Empty table
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  } catch (err: any) {
    return (
      <div className="p-3 text-destructive border border-destructive/20 rounded-md bg-destructive/5 text-xs">
        <p className="font-bold mb-2">DataFrame Render Error:</p>
        <pre>{err.message}</pre>
        <pre className="mt-2 text-muted-foreground">{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }
};

export const MultiTableRenderer: React.FC<{ value: any }> = ({ value }) => {
  const parsed = safeJsonParse(value);
  
  if (getTableFormat(parsed)) {
    return <DataFrameRenderer data={parsed} />;
  }
  
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    const entries = Object.entries(parsed);
    const tableEntries = entries.filter(([_, val]) => getTableFormat(safeJsonParse(val)) !== null);
    
    if (tableEntries.length > 0) {
      return (
        <div className="flex flex-col gap-3 w-full">
          {entries.map(([key, rawVal]) => {
            const val = safeJsonParse(rawVal);
            return (
              <div key={key} className="flex flex-col">
                <span className="text-xs font-semibold text-primary/80 mb-1">{key}:</span>
                {getTableFormat(val) ? (
                  <DataFrameRenderer data={val} />
                ) : (
                  <span className="text-xs text-muted-foreground">{formatValue(val)}</span>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  }
  
  return (
    <div className="p-3 text-xs text-muted-foreground border border-border rounded-md bg-muted/50">
      <p className="font-bold mb-1 text-primary">Fallback Raw Data:</p>
      <pre className="whitespace-pre-wrap">{formatValue(value)}</pre>
    </div>
  );
};
