import React from "react";
import { TEMPLATE_FIELDS } from "./templateFields";

export default function PrintView({ type, data }) {
  const fields = TEMPLATE_FIELDS[type] ?? [];

  return (
    <div className="print-page">
      <h1 className="print-title">
        {type === "emergency" && "緊急連絡先シート"}
        {type === "owner" && "所有者情報シート"}
        {type === "house" && "住居情報シート"}
      </h1>

      <div className="print-meta">
        <div>house_id：{data["house_id"] || "-"}</div>
        <div>更新日：{data["更新日"] || "-"}</div>
      </div>

      <table className="print-table">
        <tbody>
          {fields.map((key) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{data[key] || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
