import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===== DOM ===== */
const amountInput = document.getElementById("amountInput");
const noteInput = document.getElementById("noteInput");
const recordList = document.getElementById("recordList");

/* ===== 日期基础 ===== */
const now = new Date();
const todayStr = now.toISOString().slice(0, 10);   // YYYY-MM-DD
const monthStr = todayStr.slice(0, 7);             // YYYY-MM
const year = now.getFullYear();
const monthIndex = now.getMonth();
const todayDate = now.getDate();                    // 今天是几号

/* ===== 配置 ===== */
function getDailyLimit() {
  return Number(localStorage.getItem("dailyLimit")) || 500;
}

/* ===== 汇率 ===== */
async function getRate() {
  const r = await fetch("https://open.er-api.com/v6/latest/THB");
  const d = await r.json();
  return d.rates.CNY;
}

/* ===== 新增记录 ===== */
window.addRecord = async () => {
  const amount = Number(amountInput.value);
  if (!amount) {
    alert("请输入金额");
    return;
  }

  const rate = await getRate();

  await addDoc(collection(db, "records"), {
    amount,
    note: noteInput.value || "",
    date: todayStr,
    cny: +(amount * rate).toFixed(2),
    timestamp: serverTimestamp()
  });

  amountInput.value = "";
  noteInput.value = "";
  loadRecords();
};

/* ===== 删除记录 ===== */
window.deleteRecord = async (id) => {
  if (!confirm("确定删除？")) return;
  await deleteDoc(doc(db, "records", id));
  loadRecords();
};

/* ===== 主逻辑 ===== */
async function loadRecords() {
  const snap = await getDocs(collection(db, "records"));
  recordList.innerHTML = "";

  let todaySpent = 0;
  let monthSpent = 0;

  snap.forEach(d => {
    const r = d.data();

    // 今日支出
    if (r.date === todayStr) {
      todaySpent += r.amount;
    }

    // 当月累计支出
    if (r.date.startsWith(monthStr)) {
      monthSpent += r.amount;
    }

    // 渲染列表
    const li = document.createElement("li");
    li.className = "record-item";
    li.innerHTML = `
      <div class="amount">฿ ${r.amount}</div>
      <div class="sub">${r.date} ${r.note || ""}</div>
      <button onclick="deleteRecord('${d.id}')">删除</button>
    `;
    recordList.appendChild(li);
  });

  /* ===== 额度计算（你确认的最终模型） ===== */

  const dailyLimit = getDailyLimit();

  // 已过天数（从 1 号开始）
  const daysPassed = todayDate;

  // 当月总天数
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // ✅ 今日额度 = 累计基础额度 - 当月累计支出
  const todayLimit =
    daysPassed * dailyLimit - monthSpent;

  // ✅ 当月额度 = 当月总额度 - 当月累计支出
  const monthLimit =
    daysInMonth * dailyLimit - monthSpent;

  /* ===== 写入页面 ===== */
  document.getElementById("todayLimit").textContent = todayLimit;
  document.getElementById("todaySpent").textContent = todaySpent;
  document.getElementById("monthLimit").textContent = monthLimit;
  document.getElementById("monthSpent").textContent = monthSpent;
}

/* ===== 初始化 ===== */
loadRecords();
