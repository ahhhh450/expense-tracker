import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===== 原有逻辑（不动） ===== */
const input = document.getElementById("dailyLimitInput");
input.value = localStorage.getItem("dailyLimit") || 500;

window.saveDailyLimit = () => {
  localStorage.setItem("dailyLimit", input.value);
  alert("已保存");
};

/* ===== 新增：导出 CSV ===== */
window.exportRecords = async () => {
  const snap = await getDocs(collection(db, "records"));

  if (snap.empty) {
    alert("没有可导出的记录");
    return;
  }

  const rows = [
    ["日期", "金额(THB)", "金额(CNY)", "备注"]
  ];

  snap.forEach(d => {
    const r = d.data();
    rows.push([
      r.date,
      r.amount,
      r.cny ?? "",
      r.note ?? ""
    ]);
  });

  const csvContent = rows
    .map(row =>
      row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + csvContent], // 防中文乱码
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `记账记录_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();

  URL.revokeObjectURL(url);
};
