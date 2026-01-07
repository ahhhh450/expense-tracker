import { db } from "./firebase.js"
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

const amountInput = document.getElementById('amountInput')
const noteInput = document.getElementById('noteInput')
const recordList = document.getElementById('recordList')

let allRecords = []

async function getRate() {
  const r = await fetch('https://open.er-api.com/v6/latest/THB')
  const d = await r.json()
  return d.rates.CNY
}

/* ===== 记账 ===== */
async function addRecord() {
  const amount = Number(amountInput.value)
  if (!amount) return alert('请输入金额')

  const rate = await getRate()
  const cny = +(amount * rate).toFixed(2)
  const date = new Date().toISOString().slice(0, 10)

  await addDoc(collection(db, 'records'), {
    amount,
    cny,
    rate,
    note: noteInput.value,
    date,
    timestamp: serverTimestamp()
  })

  amountInput.value = ''
  noteInput.value = ''
  loadRecords()
}
window.addRecord = addRecord   // ⭐ 关键：给 HTML onclick 用

/* ===== 删除 ===== */
window.deleteRecord = async (id) => {
  if (!confirm('确定删除？')) return
  await deleteDoc(doc(db, 'records', id))
  document.getElementById(`r-${id}`)?.remove()
}

/* ===== 读取 ===== */
async function loadRecords() {
  const snap = await getDocs(collection(db, 'records'))
  allRecords = []
  recordList.innerHTML = ''
  snap.forEach(d => {
    allRecords.push(d.data())
    render(d.id, d.data())
  })
}

/* ===== 渲染 ===== */
function render(id, d) {
  const li = document.createElement('li')
  li.className = 'record-item'
  li.id = `r-${id}`
  li.innerHTML = `
    <div>
      <div class="record-amount">฿ ${d.amount}</div>
      <div class="record-cny">≈ ¥ ${d.cny}</div>
      <div>${d.date} ${d.note || ''}</div>
    </div>
    <button class="delete-btn" onclick="deleteRecord('${id}')">删除</button>
  `
  recordList.appendChild(li)
}

/* ===== 初始化 ===== */
if (recordList) {
  loadRecords()
}
