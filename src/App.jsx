import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import PrintView from "./PrintView";

const API_URL = import.meta.env.VITE_GAS_API_URL;
  // ✅ ここならreturnできる（コンポーネント内）
  if (!API_URL) {
    return (
      <div style={{ padding: 20 }}>
        VITE_GAS_API_URL が未設定です（.env または Netlify環境変数）
      </div>
    );
  }


export default function App() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [template, setTemplate] = useState("emergency");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setRows(data);
        setSelectedId(data[0]?.house_id ?? "");
      })
      .catch(err => {
        console.error("データ取得エラー", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return rows;

    const keysToSearch = [
      "届出者　氏名",
      "届出者　住所",
      "所有者　氏名",
      "所有者　住所",
      "緊急連絡先①　氏名",
      "緊急連絡先①　住所",
      "緊急連絡先②　氏名",
      "緊急連絡先②　住所",
      "緊急連絡先③　氏名",
      "緊急連絡先③　住所",
      "house_id",
      "須賀利No",
    ];

    return rows.filter(row =>
      keysToSearch.some(k => String(row[k] || "").includes(q))
    );
  }, [query, rows]);

  const selected =
    filtered.find(r => r.house_id === selectedId) || filtered[0];

  if (loading) {
    return <div style={{ padding: 20 }}>読み込み中...</div>;
  }

  return (
    <div className="container">
      <header className="top">
        <h2>須賀利 物件リスト（印刷）</h2>
      </header>

      <div className="controls">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="名前 / 住所 / house_id などで検索"
        />

        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          {filtered.map(r => (
            <option key={r.house_id} value={r.house_id}>
              {r.house_id} / {r["届出者　氏名"] || "-"} /{" "}
              {r["届出者　住所"] || "-"}
            </option>
          ))}
        </select>

        <select value={template} onChange={e => setTemplate(e.target.value)}>
          <option value="emergency">緊急連絡先</option>
          <option value="owner">所有者</option>
          <option value="house">住居情報</option>
        </select>

        <button onClick={() => window.print()}>A4で印刷</button>
      </div>

      {selected ? (
        <PrintView type={template} data={selected} />
      ) : (
        <div style={{ padding: 16 }}>該当データがありません。</div>
      )}
    </div>
  );
}
