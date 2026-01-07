import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import {
  getFirestore, collection, addDoc, getDocs,
  deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

/* 🔴 换成你自己的 Firebase 配置 */
const firebaseConfig = {
  apiKey: "AIzaSyCx3hx9kuenBtdN1KBJJnPwc2H9BjH2SZI",
  authDomain: "my-account-book-b4635.firebaseapp.com",
  projectId: "my-account-book-b4635",
  storageBucket: "my-account-book-b4635.firebasestorage.app",
  messagingSenderId: "1044755389880",
  appId: "1:1044755389880:web:50dfe83f8ad363988b834d",
  measurementId: "G-6H58C7HDQX"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const amountInput = document.getElementById('amountInput')
const noteInput = document.getElementById('noteInput')
const recordList = document.getElementById('recordList')

let allRecords = []

async function getRate() {
  const r = await fetch('https://open.er-api.com/v6/latest/THB')
  const d = await r.json()
  return d.rates.CNY
}

export async function addRecord() {
  const amount = Number(amountInput.value)
  if (!amount) return alert('请输入金额')

  const rate = await getRate()
  const cny = +(amount * rate).toFixed(2)
  const date = new Date().toISOString().slice(0,10)

  await addDoc(collection(db,'records'),{
    amount, cny, rate,
    note: noteInput.value,
    date,
    timestamp: serverTimestamp()
  })

  amountInput.value = ''
  noteInput.value = ''
}

window.deleteRecord = async id => {
  if (!confirm('确定删除？')) return
  await deleteDoc(doc(db,'records',id))
  document.getElementById(`r-${id}`)?.remove()
}

async function loadRecords() {
  const snap = await getDocs(collection(db,'records'))
  allRecords = []
  recordList.innerHTML = ''
  snap.forEach(d=>{
    allRecords.push(d.data())
    render(d.id,d.data())
  })
}

function render(id,d){
  const li=document.createElement('li')
  li.className='record-item'
  li.id=`r-${id}`
  li.innerHTML=`
    <div>
      <div class="record-amount">฿ ${d.amount}</div>
      <div class="record-cny">≈ ¥ ${d.cny}</div>
      <div>${d.date} ${d.note||''}</div>
    </div>
    <button class="delete-btn" onclick="deleteRecord('${id}')">删除</button>
  `
  recordList.appendChild(li)
}

window.saveDailyLimit=()=>{
  localStorage.setItem('dailyLimit',dailyLimitInput.value)
  alert('已保存')
}

window.exportExcel=()=>{
  const ws=XLSX.utils.json_to_sheet(allRecords)
  const wb=XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb,ws,'账单')
  XLSX.writeFile(wb,'account.xlsx')
}

if(recordList) loadRecords()

