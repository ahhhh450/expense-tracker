const input = document.getElementById("dailyLimitInput");
input.value = localStorage.getItem("dailyLimit") || 500;

window.saveDailyLimit = () => {
  localStorage.setItem("dailyLimit", input.value);
  alert("已保存");
};
