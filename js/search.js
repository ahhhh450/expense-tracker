import { db } from "./firebase.js";
import { collection, getDocs }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.searchByDate = async () => {
  const date = document.getElementById("searchDate").value;
  const list = document.getElementById("recordList");
  list.innerHTML = "";

  const snap = await getDocs(collection(db, "records"));
  snap.forEach(d => {
    if (d.data().date === date) {
      const li = document.createElement("li");
      li.className = "record-item";
      li.textContent = `${d.data().amount} ฿ ${d.data().note || ""}`;
      list.appendChild(li);
    }
  });
};
