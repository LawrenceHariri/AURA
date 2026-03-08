"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime, truncate } from "@/lib/utils";

interface Memory {
  id: string;
  transcript: string;
  summary: string;
  duration?: number | null;
  language: string;
  metadata: {
    people?: string[];
    places?: string[];
    ideas?: string[];
    topics?: string[];
    sentiment?: string;
  };
  createdAt: string;
  _count: { tasks: number; appointments: number };
}

export function MemoriesClient() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(debouncedSearch ? { q: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/memories?${params}`);
      const data = await res.json();
      setMemories(data.memories || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  async function deleteMemory(id: string) {
    if (!confirm("Delete this memory? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/memories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }

  const sentimentVariant = (s?: string) => {
    if (s === "positive") return "success";
    if (s === "negative") return "danger";
    return "default";
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search memories…"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500">No memories found.</p>
          {debouncedSearch && (
            <button
              onClick={() => setSearch("")}
              className="text-sm text-violet-400 hover:underline mt-2"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((memory) => (
            <Card key={memory.id} className="overflow-hidden">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs text-zinc-500">
                        {formatRelativeTime(memory.createdAt)}
                      </span>
                      {memory.metadata?.sentiment && (
                        <Badge variant={sentimentVariant(memory.metadata.sentiment)}>
                          {memory.metadata.sentiment}
                        </Badge>
                      )}
                      {memory._count.tasks > 0 && (
                        <Badge variant="success">
                          {memory._count.tasks} task{memory._count.tasks !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {memory._count.appointments > 0 && (
                        <Badge variant="warning">
                          {memory._count.appointments} event{memory._count.appointments !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-zinc-200 mb-2">{memory.summary}</p>

                    {/* Metadata tags */}
                    {(memory.metadata?.people?.length ||
                      memory.metadata?.places?.length ||
                      memory.metadata?.topics?.length) && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {memory.metadata.people?.slice(0, 3).map((p) => (
                          <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400">
                            <Tag className="w-2.5 h-2.5" /> {p}
                          </span>
                        ))}
                        {memory.metadata.places?.slice(0, 2).map((p) => (
                          <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400">
                            📍 {p}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expandable transcript */}
                    {expanded === memory.id && (
                      <div className="mt-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <p className="text-xs font-medium text-zinc-500 mb-2">
                          Full Transcript
                        </p>
                        <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {memory.transcript}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        setExpanded(expanded === memory.id ? null : memory.id)
                      }
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title="Toggle transcript"
                    >
                      {expanded === memory.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      disabled={deleting === memory.id}
                      className="p-1.5 rounded-lg hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-zinc-500 px-3">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
