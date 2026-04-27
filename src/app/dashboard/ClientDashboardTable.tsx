"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Minimal type for what we need from the sessions
type DashboardSession = {
  id: string;
  status: string;
  recruiterDecision: string;
  candidate: { name: string; email: string };
  job: { title: string };
  evaluation: { overallScore: number } | null;
};

export function ClientDashboardTable({ sessions }: { sessions: DashboardSession[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const toggleAll = () => {
    if (selectedIds.length === sessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sessions.map((s) => s.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected report(s)?`)) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/dashboard/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      
      setSelectedIds([]);
      router.refresh(); // Refresh the page to get new data
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected reports.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Interviews</h2>
        {selectedIds.length > 0 && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === sessions.length}
                  onChange={toggleAll}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                />
              </th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Candidate</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Role</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Decision</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Score</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(session.id)}
                    onChange={() => toggleOne(session.id)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{session.candidate.name}</div>
                  <div className="text-sm text-slate-400">{session.candidate.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
                    <Briefcase size={14} />
                    {session.job.title}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {session.status === "COMPLETED" && <span className="text-green-400 text-sm font-medium">Completed</span>}
                  {session.status === "IN_PROGRESS" && <span className="text-indigo-400 text-sm font-medium">In Progress</span>}
                  {session.status === "PENDING" && <span className="text-amber-400 text-sm font-medium">Pending</span>}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      session.recruiterDecision === "SHORTLISTED"
                        ? "bg-green-500/20 text-green-300"
                        : session.recruiterDecision === "REJECTED"
                          ? "bg-red-500/20 text-red-300"
                          : session.recruiterDecision === "HOLD"
                            ? "bg-amber-500/20 text-amber-300"
                            : session.recruiterDecision === "PENDING"
                              ? "bg-amber-500/20 text-amber-300" // map pending to hold color visually
                              : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {session.recruiterDecision === "PENDING" ? "HOLD" : session.recruiterDecision}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {session.evaluation ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${
                        session.evaluation.overallScore >= 80 ? "text-green-400" : "text-amber-400"
                      }`}>
                        {session.evaluation.overallScore}
                      </span>
                      <span className="text-slate-500 text-sm">/ 100</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link 
                    href={`/dashboard/${session.id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  No interviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
