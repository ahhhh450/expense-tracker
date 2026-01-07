import { db } from './firebase.js'
import {
  collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

document.getElementById('date').onchange = async e => {
  const date = e.target.value
  const ul = document.getElementById('result')
  ul.innerHTML = ''

  const snap = await getDocs(collection(db, 'records'))
  snap.forEach(d => {
    if (d.data().date.startsWith(date)) {
      const li = document.createElement('li')
      li.textContent = `${d.data().amount}฿ ${d.data().note || ''}`
      ul.appendChild(li)
    }
  })
}
