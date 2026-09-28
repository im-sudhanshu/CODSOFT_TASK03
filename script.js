let txs = JSON.parse(localStorage.getItem("txs")) || [];
let editId = null;

const form = document.getElementById("txForm");
const desc = document.getElementById("desc");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const btn = document.getElementById("submitBtn");
const error = document.getElementById("error");
const filter = document.getElementById("filter");
const list = document.getElementById("txList");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

const save = () => localStorage.setItem("txs", JSON.stringify(txs));
const fmt = n => "₹" + n.toFixed(2);

form.addEventListener("submit", e => {
  e.preventDefault();
  const d = desc.value.trim();
  const a = parseFloat(amount.value);

  if (!d) return (error.textContent = "Description cannot be empty.");
  if (isNaN(a) || a <= 0) return (error.textContent = "Enter a valid amount.");
  error.textContent = "";

  if (editId) {
    txs = txs.map(t => t.id === editId
      ? { ...t, desc: d, amount: a, type: type.value, category: category.value }
      : t);
    editId = null;
    btn.textContent = "Add";
  } else {
    txs.push({
      id: Date.now(),
      desc: d,
      amount: a,
      type: type.value,
      category: category.value,
      date: new Date().toLocaleDateString()
    });
  }

  desc.value = "";
  amount.value = "";
  save();
  render();
});

function render() {
  const f = filter.value;
  list.innerHTML = "";

  txs
    .filter(t => f === "all" || t.category === f)
    .slice().reverse()
    .forEach(t => {
      const li = document.createElement("li");

      const info = document.createElement("div");
      info.className = "info";
      info.innerHTML = `${t.desc} <small>${t.category} · ${t.date}</small>`;

      const amt = document.createElement("span");
      amt.className = `amt ${t.type}`;
      amt.textContent = (t.type === "income" ? "+" : "-") + fmt(t.amount);

      const edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.style.background = "#2563eb";
      edit.onclick = () => {
        desc.value = t.desc;
        amount.value = t.amount;
        type.value = t.type;
        category.value = t.category;
        editId = t.id;
        btn.textContent = "Save";
      };

      const del = document.createElement("button");
      del.textContent = "Delete";
      del.onclick = () => {
        txs = txs.filter(x => x.id !== t.id);
        if (editId === t.id) { editId = null; btn.textContent = "Add"; }
        save();
        render();
      };

      li.append(info, amt, edit, del);
      list.append(li);
    });

  const income = txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  totalIncomeEl.textContent = fmt(income);
  totalExpenseEl.textContent = fmt(expense);
  balanceEl.textContent = fmt(income - expense);
}

filter.addEventListener("change", render);
render();