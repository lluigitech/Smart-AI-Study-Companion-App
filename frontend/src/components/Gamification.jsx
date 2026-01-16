import { useEffect, useState } from "react";

export default function Gamification({ studentId }) {
  const [data, setData] = useState({ points: 0, badges: [] });

  useEffect(() => {
    fetch(`http://localhost:5000/api/gamification/${studentId}`)
      .then(res => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then(res => setData(res))
      .catch(err => {
        console.error(err);
        setData({ points: 0, badges: [] }); // fallback
      });
  }, [studentId]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow space-y-3">
      <h2 className="font-medium">🎮 Gamification</h2>
      <p className="text-sm text-gray-600">Points: <strong>{data?.points || 0}</strong></p>
      <div className="flex flex-wrap gap-2">
        {data?.badges?.length === 0
          ? <span className="text-gray-400 text-sm">No badges yet</span>
          : data.badges.map((b, idx) => (
              <span key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">{b}</span>
            ))}
      </div>
    </div>
  );
}
