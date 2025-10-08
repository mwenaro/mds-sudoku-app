"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type RecordRow = {
  id: number;
  name: string;
  difficulty: string;
  time_seconds: number;
  mistakes: number;
  created_at: string;
};

export default function Leaderboard() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetch("/api/records")
      .then((r) => r.json())
      .then((j) => {
        if (!ignore) {
          if (j.ok) setRows(j.data);
          else setError(j.error ?? "Failed to fetch");
        }
      })
      .catch((e) => !ignore && setError(String(e)))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">Name</th>
                  <th className="py-2 pr-2">Difficulty</th>
                  <th className="py-2 pr-2">Time (s)</th>
                  <th className="py-2 pr-2">Mistakes</th>
                  <th className="py-2 pr-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-2">{i + 1}</td>
                    <td className="py-2 pr-2">{r.name}</td>
                    <td className="py-2 pr-2 capitalize">{r.difficulty}</td>
                    <td className="py-2 pr-2">{r.time_seconds}</td>
                    <td className="py-2 pr-2">{r.mistakes}</td>
                    <td className="py-2 pr-2">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-gray-500" colSpan={6}>
                      No records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
