import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"

/* ===== Firebase 配置（用你自己的完整配置） ===== */
const firebaseConfig = {
  apiKey: "你的",
  authDomain: "你的",
  projectId: "你的",
  storageBucket: "你的",
  messagingSenderId: "你的",
  appId: "你的"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/* ===== DOM ===== */
const listEl = document.getElementById('list')
const monthBalanceEl = document.getElementById('monthBalance')
const dayBalanceEl = document.getElementById('dayBalance')
const queryListEl = document.getElementById('queryList')
const queryTotalEl = document.getElementById('queryTotal')

const dailyLimit = 500
let records = []

const today = new Date()
const todayKey = today.toISOString().slice(0, 10)
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

/* ===== 页面切换 ===== */
window.showPage = (id) => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}

/* ===== 立即渲染一条（关键优化） ===== */
function renderRecord(data, id = null) {
  const li = document.createElement('li')
  li.textContent = `${data.amount}฿  ${data.note || ''}`

  let startX = 0
  li.addEventListener('touchstart', e => startX = e.touches[0].clientX)
  li.addEventListener('touchend', async e => {
    if (startX - e.changedTouches[0].clientX > 80 && id) {
      await deleteDoc(doc(db, 'records', id))
      li.remove()
    }
  })

  listEl.prepend(li)
}

/* ===== 记账（秒显示） ===== */
window.addRecord = async () => {
  const amountInput = document.getElementById('amount')
  const noteInput = document.getElementById('note')

  const amount = Number(amountInput.value)
  const note = noteInput.value
  if (!amount) return

  const record = {
    amount,
    note,
    date: new Date().toISOString()
  }

  // ✅ ① 立刻清空输入框（关键）
  amountInput.value = ''
  noteInput.value = ''

  // ✅ ② 立刻渲染到页面
  renderRecord(record)
  records.push(record)
  calculate()

  // ✅ ③ 后台同步 Firestore
  try {
    await addDoc(collection(db, 'records'), record)
  } catch (e) {
    alert('同步失败，请检查网络')
  }
}


/* ===== 初始加载（只一次） ===== */
async function load() {
  const snap = await getDocs(collection(db, 'records'))
  records = []
  listEl.innerHTML = ''

  snap.forEach(d => {
    const data = d.data()
    records.push(data)

    if (data.date.slice(0,10) === todayKey) {
      renderRecord(data, d.id)
    }
  })

  calculate()
}

/* ===== 余额计算 ===== */
function calculate() {
  let spentMonth = 0
  let spentToday = 0

  records.forEach(r => {
    const d = r.date.slice(0,10)
    spentMonth += r.amount
    if (d === todayKey) spentToday += r.amount
  })

  const daysPassed = Math.floor((today - monthStart) / 86400000) + 1
  const totalLimit = daysPassed * dailyLimit
  const balance = totalLimit - spentMonth

  monthBalanceEl.textContent = `${balance}฿`
  dayBalanceEl.textContent = `${balance}฿`

  const color = balance < 0 ? 'red' : '#000'
  monthBalanceEl.style.color = color
  dayBalanceEl.style.color = color
}

/* ===== 查询 ===== */
window.queryByDate = async () => {
  const date = document.getElementById('queryDate').value
  if (!date) return

  queryListEl.innerHTML = ''
  let total = 0

  records.forEach(r => {
    if (r.date.slice(0,10) === date) {
      total += r.amount
      const li = document.createElement('li')
      li.textContent = `${r.amount}฿  ${r.note || ''}`
      queryListEl.appendChild(li)
    }
  })

  queryTotalEl.textContent = total
}

load()
