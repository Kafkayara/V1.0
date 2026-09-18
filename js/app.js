const STORAGE_KEY = "mahasiswa_expense_tracker_data";

// --- 1. State / Data Store ---
let expenses = [];

function createExpenseItem(name, amount, date, category) {
  return {
    id: Date.now(),
    name: name.trim(),
    amount: Number(amount),
    date: date,
    category: category
  };
}

function addExpenseItem(item) {
  expenses.unshift(item);
  saveExpensesToStorage();
  renderApp();
  return item;
}

function updateExpenseItem(id, updatedFields) {
  const index = expenses.findIndex((item) => item.id === Number(id));
  if (index !== -1) {
    expenses[index] = {
      ...expenses[index],
      ...updatedFields,
      amount: Number(updatedFields.amount)
    };
    saveExpensesToStorage();
    renderApp();
    return expenses[index];
  }
  return null;
}

function deleteExpenseItem(id) {
  expenses = expenses.filter((item) => item.id !== Number(id));
  saveExpensesToStorage();
  renderApp();
}

// --- 2. Integrasi localStorage ---
function saveExpensesToStorage() {
  try {
    const serializedData = JSON.stringify(expenses);
    localStorage.setItem(STORAGE_KEY, serializedData);
  } catch (error) {
    console.error("Gagal menyimpan data ke localStorage:", error);
  }
}

function loadExpensesFromStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      expenses = [];
      return;
    }
    const parsedData = JSON.parse(savedData);
    expenses = Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error("Data localStorage rusak atau gagal dimuat:", error);
    expenses = [];
  }
}

// --- 3. Seleksi Elemen DOM ---
const expenseForm = document.getElementById("expenseForm");
const expenseIdInput = document.getElementById("expenseId");
const expenseNameInput = document.getElementById("expenseName");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseDateInput = document.getElementById("expenseDate");
const expenseCategoryInput = document.getElementById("expenseCategory");

const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const nameError = document.getElementById("nameError");
const amountError = document.getElementById("amountError");
const dateError = document.getElementById("dateError");
const categoryError = document.getElementById("categoryError");

const feedbackMessage = document.getElementById("feedbackMessage");
const expenseListContainer = document.getElementById("expenseList");
const emptyStateContainer = document.getElementById("emptyState");

// Elemen Dashboard / Ringkasan
const totalExpenseOutput = document.getElementById("totalExpense");
const monthlyExpenseOutput = document.getElementById("monthlyExpense");
const totalTransactionsOutput = document.getElementById("totalTransactions");

// --- 4. Fungsi Format Utility ---
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

function formatDateIndo(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(dateObj);
}

// --- 5. Kalkulasi Ringkasan / Dashboard ---
function updateSummaryMetrics() {
  // 1. Total seluruh pengeluaran
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Pengeluaran bulan berjalan
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentMonthPrefix = `${currentYear}-${currentMonth}`;

  const currentMonthTotal = expenses
    .filter((item) => item.date.startsWith(currentMonthPrefix))
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Jumlah seluruh transaksi
  const totalCount = expenses.length;

  // Refleksikan ke elemen DOM
  totalExpenseOutput.textContent = formatRupiah(totalAmount);
  monthlyExpenseOutput.textContent = formatRupiah(currentMonthTotal);
  totalTransactionsOutput.textContent = totalCount.toString();
}

// --- 6. Render Tampilan Riwayat Pengeluaran ---
function renderExpenses() {
  expenseListContainer.innerHTML = "";

  if (expenses.length === 0) {
    emptyStateContainer.classList.remove("hidden");
    return;
  }

  emptyStateContainer.classList.add("hidden");

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedExpenses.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "expense-item";
    itemEl.setAttribute("data-id", item.id);

    itemEl.innerHTML = `
      <div class="item-left">
        <span class="item-name">${item.name}</span>
        <div class="item-meta">
          <span class="item-category-badge">${item.category}</span>
          <span class="item-date">${formatDateIndo(item.date)}</span>
        </div>
      </div>
      <div class="item-right">
        <span class="item-amount">${formatRupiah(item.amount)}</span>
        <div class="item-actions">
          <button type="button" class="btn-action edit" data-id="${item.id}" aria-label="Edit pengeluaran ${item.name}">Edit</button>
          <button type="button" class="btn-action delete" data-id="${item.id}" aria-label="Hapus pengeluaran ${item.name}">Hapus</button>
        </div>
      </div>
    `;

    expenseListContainer.appendChild(itemEl);
  });
}

// Fungsi orkestrasi untuk merender list dan statistik secara bersamaan
function renderApp() {
  updateSummaryMetrics();
  renderExpenses();
}

// --- 7. Form, Edit, & Feedback Logic ---
function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  expenseDateInput.value = today;
}

function clearErrors() {
  nameError.textContent = "";
  amountError.textContent = "";
  dateError.textContent = "";
  categoryError.textContent = "";
}

function resetFormState() {
  expenseForm.reset();
  expenseIdInput.value = "";
  formTitle.textContent = "Catat Pengeluaran";
  submitBtn.textContent = "Simpan Transaksi";
  cancelEditBtn.classList.add("hidden");
  clearErrors();
  setDefaultDate();
}

function showFeedback(message) {
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback-message success";

  setTimeout(() => {
    feedbackMessage.className = "feedback-message hidden";
    feedbackMessage.textContent = "";
  }, 3000);
}

function startEditingExpense(id) {
  const targetExpense = expenses.find((item) => item.id === Number(id));
  if (!targetExpense) return;

  expenseIdInput.value = targetExpense.id;
  expenseNameInput.value = targetExpense.name;
  expenseAmountInput.value = targetExpense.amount;
  expenseDateInput.value = targetExpense.date;
  expenseCategoryInput.value = targetExpense.category;

  formTitle.textContent = "Edit Pengeluaran";
  submitBtn.textContent = "Perbarui Transaksi";
  cancelEditBtn.classList.remove("hidden");
  clearErrors();

  expenseForm.scrollIntoView({ behavior: "smooth", block: "start" });
  expenseNameInput.focus();
}

expenseNameInput.addEventListener("input", () => (nameError.textContent = ""));
expenseAmountInput.addEventListener("input", () => (amountError.textContent = ""));
expenseDateInput.addEventListener("change", () => (dateError.textContent = ""));
expenseCategoryInput.addEventListener("change", () => (categoryError.textContent = ""));

cancelEditBtn.addEventListener("click", () => {
  resetFormState();
});

function validateForm(name, amount, date, category) {
  let isValid = true;
  clearErrors();

  if (!name.trim()) {
    nameError.textContent = "Nama pengeluaran wajib diisi.";
    isValid = false;
  }

  if (isNaN(amount) || amount <= 0) {
    amountError.textContent = "Nominal harus lebih besar dari Rp0.";
    isValid = false;
  }

  if (!date) {
    dateError.textContent = "Tanggal wajib diisi.";
    isValid = false;
  }

  if (!category) {
    categoryError.textContent = "Kategori wajib dipilih.";
    isValid = false;
  }

  return isValid;
}

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = expenseNameInput.value;
  const amount = Number(expenseAmountInput.value);
  const date = expenseDateInput.value;
  const category = expenseCategoryInput.value;

  const isValid = validateForm(name, amount, date, category);
  if (!isValid) return;

  const currentId = expenseIdInput.value;

  if (currentId) {
    updateExpenseItem(currentId, {
      name: name.trim(),
      amount: amount,
      date: date,
      category: category
    });
    showFeedback("Pengeluaran berhasil diperbarui.");
  } else {
    const newItem = createExpenseItem(name, amount, date, category);
    addExpenseItem(newItem);
    showFeedback("Pengeluaran berhasil ditambahkan.");
  }

  resetFormState();
});

// --- 8. Event Delegation untuk List Transaksi ---
expenseListContainer.addEventListener("click", (event) => {
  const target = event.target;
  const id = target.getAttribute("data-id");
  if (!id) return;

  if (target.classList.contains("edit")) {
    startEditingExpense(id);
    return;
  }

  if (target.classList.contains("delete")) {
    const targetItem = expenses.find((item) => item.id === Number(id));
    if (!targetItem) return;

    const confirmDelete = window.confirm(
      `Apakah kamu yakin ingin menghapus "${targetItem.name}" (${formatRupiah(targetItem.amount)})?`
    );

    if (confirmDelete) {
      if (expenseIdInput.value === String(targetItem.id)) {
        resetFormState();
      }

      deleteExpenseItem(id);
      showFeedback("Pengeluaran berhasil dihapus.");
    }
  }
});

// --- 9. Inisialisasi Awal Aplikasi ---
function initApp() {
  loadExpensesFromStorage();
  resetFormState();
  renderApp();
}

initApp();