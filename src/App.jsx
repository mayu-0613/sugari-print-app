import { useEffect, useMemo, useState } from "react";
import "./App.css";
import PrintView from "./PrintView";

export default function App() {
  const apiUrl = import.meta.env.VITE_GAS_API_URL;

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [template, setTemplate] = useState("emergency");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [districtFilter, setDistrictFilter] = useState("ALL");



  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      setLoadError("VITE_GAS_API_URL が未設定です（.env または Netlify環境変数）");
      return;
    }

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setRows(Array.isArray(data) ? data : []);
        setSelectedId(Array.isArray(data) ? (data[0]?.house_id ?? "") : "");
      })
      .catch((err) => {
        console.error(err);
        setLoadError("データ取得に失敗しました（GASの公開設定やURLを確認）");
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

 const statusOptions = useMemo(() => {
   const set = new Set(
     rows.map((r) => String(r?.["状態"] ?? "").trim()).filter(Boolean)
   );
   return ["ALL", ...Array.from(set)];
  }, [rows]);


 const districtOptions = useMemo(() => {
   const set = new Set(
     rows.map((r) => String(r?.["所属する地区"] ?? "").trim()).filter(Boolean)
   );
   return ["ALL", ...Array.from(set)];
 }, [rows]);


 const filtered = useMemo(() => {
    const q = query.trim();
     // まず状態で絞り込み
     let base = rows;

      if (statusFilter !== "ALL") {
       base = base.filter((row) => String(row?.["状態"] ?? "") === statusFilter);
      }
    // ② 地区で絞り込み
      if (districtFilter !== "ALL") {
       base = base.filter((row) => String(row?.["所属する地区"] ?? "") === districtFilter);
      }

    // ③ 検索で絞り込み
      if (!q) return base;

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

    return base.filter((row) =>
      keysToSearch.some((k) => String(row?.[k] ?? "").includes(q))
    );
  }, [query, rows, statusFilter, districtFilter]);

 useEffect(() => {
   if (!filtered.some((r) => r.house_id === selectedId)) {
     setSelectedId(filtered[0]?.house_id ?? "");
   }
 }, [filtered, selectedId]);




  const selected = filtered.find((r) => r.house_id === selectedId) || filtered[0];

  if (loading) {
    return <div style={{ padding: 20 }}>読み込み中...</div>;
  }

  if (loadError) {
    return <div style={{ padding: 20 }}>{loadError}</div>;
  }

  return (
    <div className="container">
      <header className="top">
        <h2>須賀利 物件リスト（印刷）</h2>
      </header>

      <div className="controls">
    {/* 1段目：絞り込み */}
       <div className="filter-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="名前 / 住所 / house_id などで検索"
       />

      <select
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
         >
        <option value="ALL">状態：すべて</option>
         {statusOptions
          .filter((s) => s !== "ALL")
          .map((s) => (
          <option key={s} value={s}>
            状態：{s}
          </option>
        ))}
      </select>

      <select
         value={districtFilter}
         onChange={(e) => setDistrictFilter(e.target.value)}
      >
         <option value="ALL">地区：すべて</option>
         {districtOptions
          .filter((d) => d !== "ALL")
          .map((d) => (
          <option key={d} value={d}>
            地区：{d}
          </option>
          ))}
      </select>
    </div>

  <div className="active-filters">
      {query.trim() && (
        <span className="chip">
         検索：{query.trim()}
        <button
          className="chip-x"
          type="button"
          onClick={() => setQuery("")}
          aria-label="検索をクリア"
        >
        </button>
      </span>
      )}

    {statusFilter !== "ALL" && (
      <span className="chip">
        状態：{statusFilter}
        <button
          className="chip-x"
          type="button"
          onClick={() => setStatusFilter("ALL")}
          aria-label="状態フィルタを解除"
        >
        </button>
      </span>
      )}

    {districtFilter !== "ALL" && (
       <span className="chip">
         地区：{districtFilter}
         <button
          className="chip-x"
          type="button"
          onClick={() => setDistrictFilter("ALL")}
          aria-label="地区フィルタを解除"
         >
         </button>
       </span>
     )}

   {/* 何も条件がないとき */}
     {!query.trim() && statusFilter === "ALL" && districtFilter === "ALL" && (
       <span className="chip chip-muted">絞り込み：なし</span>
     )}

  {/* まとめて解除 */}
    {(query.trim() || statusFilter !== "ALL" || districtFilter !== "ALL") && (
        <button
          type="button"
          className="chip-clear"
          onClick={() => {
           setQuery("");
           setStatusFilter("ALL");
           setDistrictFilter("ALL");
         }}
        >
     すべて解除
     </button>
    )}
 </div>



  {/* 2段目：物件選択＋テンプレ＋印刷 */}
    <div className="action-row">
      <select
        className="house-select"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
      >
      {filtered.map((r) => (
        <option key={r.house_id} value={r.house_id}>
          {r.house_id} / {r["地番"] || "-"} / {r["所有者　氏名"] || "-"}
        </option>
       ))}
      </select>

      <select value={template} onChange={(e) => setTemplate(e.target.value)}>
        <option value="ownerResident">所有者・居住者情報</option>
        <option value="emergency">緊急連絡先情報</option>
        <option value="house">建屋状況</option>
      </select>

      <button className="print-btn" onClick={() => window.print()}>
        A4で印刷
      </button>
    </div>
  </div>


      {selected ? (
        <PrintView type={template} data={selected} />
      ) : (
        <div style={{ padding: 16 }}>該当データがありません。</div>
      )}
    </div>
  );
}
