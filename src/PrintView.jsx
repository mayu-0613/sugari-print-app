// src/PrintView.jsx
import React from "react";
import { LABELS, TEMPLATE_CONFIG } from "./templateFields";


// 空欄なら「行ごと非表示」にしてよいフィールド
const HIDE_IF_EMPTY_FIELDS = new Set([
  // 緊急連絡先②〜④
  "緊急連絡先②　氏名",
  "緊急連絡先②　続柄",
  "緊急連絡先②　住所",
  "緊急連絡先②　電話番号",
  "緊急連絡先②　メールアドレス",

  "緊急連絡先③　氏名",
  "緊急連絡先③　続柄",
  "緊急連絡先③　住所",
  "緊急連絡先③　電話番号",
  "緊急連絡先③　メールアドレス",

  // 入居者②〜④
  "入居者名②",
  "年齢②",
  "介護状況②",

  "入居者名③",
  "年齢③",
  "介護状況③",

  "入居者名④",
  "年齢④",
  "介護状況④",
]);

// ☑ / ☐ で表示したい項目
const CHECK_FIELDS = new Set([
  "平屋",
  "二階建",
  "三階建",
  "倉庫有",
  "庭有",
  "ガレージ有",
]);

const BUILDING_STRUCTURE_FIELDS = [
  "平屋",
  "二階建",
  "三階建",
  "倉庫有",
  "庭有",
  "ガレージ有",
];

function getStatusBadgeClass(status) {
  if (!status) return "badge badge-white";

  if (status.includes("現在居住") && !status.includes("別荘")) return "badge badge-orange";
  if (status.includes("完全空き家")) return "badge badge-yellow";
  if (status.includes("施設入居")) return "badge badge-lime";
  if (status.includes("倉庫")) return "badge badge-green";
  if (status.includes("飲食")) return "badge badge-pink";
  if (status.includes("商店")) return "badge badge-purple";
  if (status.includes("加工")) return "badge badge-cyan";
  if (status.includes("行政")) return "badge badge-blue";
  if (status.includes("別荘")) return "badge badge-beige";
  if (status.includes("神社") || status.includes("寺")) return "badge badge-lav";
  if (status.includes("撤去")) return "badge badge-white";
  if (status.includes("管理不全")) return "badge badge-gray";
  if (status.includes("特定")) return "badge badge-black";

  return "badge badge-white";
}



function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function displayLabel(key) {
  return LABELS[key] || key;
}

function isEmptyValue(v) {
  return v === null || v === undefined || String(v).trim() === "";
}

function shouldHideRow(key, value) {
  return HIDE_IF_EMPTY_FIELDS.has(key) && isEmptyValue(value);
}

function toChecked(value) {
  const v = String(value ?? "").trim().toLowerCase();

  // TRUE 系
  if (v === "true" || v === "1") return true;

  // FALSE / 空欄 / その他
  return false;
}


export default function PrintView({ type, data }) {
  const config = TEMPLATE_CONFIG[type];
  if (!config) return <div style={{ padding: 12 }}>テンプレが見つかりません</div>;

  const title = config.title;

  // 緊急テンプレでは「緊急連絡先① 電話番号」を強調
  const emergencyPrimaryPhone =
    type === "emergency" ? (data["緊急連絡先①　電話番号"] || "") : "";

  return (
    <div className="print-page">
      <div className="print-header">
        <div>
          <h1 className="print-title">{title}</h1>
          <div className="print-sub">
            <span>物件ID：{data["house_id"] || "-"}</span>
            <span>更新日：{formatDate(data["更新日"]) || "-"}</span>
            {(() => {
             const status = data["状態"] || "不明";
             return (
              <span>
                 状態：
               <span className={getStatusBadgeClass(status)}>
               {status}
               </span>
              </span>
              );
             })()}
          </div>
        </div>

        {type === "emergency" && !isEmptyValue(emergencyPrimaryPhone) && (
          <div className="emergency-box">
            <div className="emergency-label">緊急連絡先①（電話）</div>
            <div className="emergency-phone">{emergencyPrimaryPhone}</div>
          </div>
        )}
      </div>

      {config.sections.map((section) => {
        const showBuildingStructure =
         type === "house" &&
         section.title === "建物・設備";

         return (
          <div key={section.title} className="section">
           <div className="section-title">{section.title}</div>
           <table className="print-table">
            <tbody>
              {showBuildingStructure && (
               <tr>
                <th>建物構成</th>
                <td>
                  {BUILDING_STRUCTURE_FIELDS.map((key) => (
                    <span
                     key={key}
                     style={{ marginRight: "14px", whiteSpace: "nowrap" }}
                    >
                     {toChecked(data[key]) ? "☑" : "☐"} {key}
                    </span>
                  ))}
                </td>
               </tr>
              )}
              {section.fields.map((key) => {
                const value = data[key];
                // 建物構成は横並びで出すので個別行はスキップ
               if (BUILDING_STRUCTURE_FIELDS.includes(key)) {
                 return null;
                }
                // ★ 指定項目だけ、空欄なら非表示
                if (shouldHideRow(key, value)) {
                  return null;
                }

                // 写真の特別扱い
                if (key === "image_path1") {
                  if (isEmptyValue(value)) {
                    return (
                      <tr key={key}>
                        <th>{displayLabel(key)}</th>
                        <td>（なし）</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={key}>
                      <th>{displayLabel(key)}</th>
                      <td>
                        <img
                          src={String(value)}
                          alt="物件写真"
                          className="photo"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="small-note">※表示されない場合はURL（公開設定）をご確認ください</div>
                      </td>
                    </tr>
                  );
                }

                return (
                 <tr key={key}>
                 <th>{displayLabel(key)}</th>
                  <td>
                   {key === "更新日" ? (
                     formatDate(value)
                    ) : key === "状態" ? (
                  <span className={getStatusBadgeClass(value)}>
                    {value}
                  </span>
                  ) : CHECK_FIELDS.has(key) ? (
                    toChecked(value) ? "☑" : "☐"
                    ) : (
                    isEmptyValue(value) ? "" : String(value)
                    )}
                  </td>
                 </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
   })}
    </div>
  );
}