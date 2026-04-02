const storage = (() => {
  try {
    const probeKey = "finedge-storage-probe";
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    return window.localStorage;
  } catch {
    const memoryStore = new Map();
    return {
      getItem(key) {
        return memoryStore.has(key) ? memoryStore.get(key) : null;
      },
      setItem(key, value) {
        memoryStore.set(key, String(value));
      },
      removeItem(key) {
        memoryStore.delete(key);
      },
    };
  }
})();

const STORAGE_KEYS = {
  transactions: "finedge-demo-transactions",
  role: "finedge-demo-role",
  theme: "finedge-demo-theme",
};

const openingBalance = 8400;
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});
const shortMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const defaultTransactions = [
  { id: "tx-001", date: "2026-01-03", amount: 6200, category: "Salary", type: "income", merchant: "Northstar Payroll", note: "Monthly salary" },
  { id: "tx-002", date: "2026-01-05", amount: 145, category: "Groceries", type: "expense", merchant: "FreshMart", note: "Pantry refill" },
  { id: "tx-003", date: "2026-01-06", amount: 1680, category: "Rent", type: "expense", merchant: "City Lofts", note: "Apartment rent" },
  { id: "tx-004", date: "2026-01-08", amount: 88, category: "Transport", type: "expense", merchant: "Metro Pass", note: "Monthly transit pass" },
  { id: "tx-005", date: "2026-01-11", amount: 240, category: "Freelance", type: "income", merchant: "Blue Finch Studio", note: "Landing page sprint" },
  { id: "tx-006", date: "2026-01-15", amount: 74, category: "Dining", type: "expense", merchant: "Cedar Cafe", note: "Team lunch" },
  { id: "tx-007", date: "2026-02-03", amount: 6200, category: "Salary", type: "income", merchant: "Northstar Payroll", note: "Monthly salary" },
  { id: "tx-008", date: "2026-02-07", amount: 132, category: "Subscriptions", type: "expense", merchant: "Streaming Bundle", note: "App bundle renewal" },
  { id: "tx-009", date: "2026-02-09", amount: 215, category: "Groceries", type: "expense", merchant: "FreshMart", note: "Weekly grocery run" },
  { id: "tx-010", date: "2026-02-14", amount: 420, category: "Travel", type: "expense", merchant: "Railway Express", note: "Weekend trip" },
  { id: "tx-011", date: "2026-02-18", amount: 320, category: "Freelance", type: "income", merchant: "Bloom Labs", note: "Brand audit" },
  { id: "tx-012", date: "2026-02-24", amount: 105, category: "Health", type: "expense", merchant: "CarePlus", note: "Pharmacy and vitamins" },
  { id: "tx-013", date: "2026-03-03", amount: 6200, category: "Salary", type: "income", merchant: "Northstar Payroll", note: "Monthly salary" },
  { id: "tx-014", date: "2026-03-05", amount: 159, category: "Dining", type: "expense", merchant: "Cedar Cafe", note: "Dinner out" },
  { id: "tx-015", date: "2026-03-08", amount: 1780, category: "Rent", type: "expense", merchant: "City Lofts", note: "Apartment rent" },
  { id: "tx-016", date: "2026-03-10", amount: 190, category: "Groceries", type: "expense", merchant: "FreshMart", note: "Weekend groceries" },
  { id: "tx-017", date: "2026-03-19", amount: 475, category: "Freelance", type: "income", merchant: "Northwind Commerce", note: "Monthly dashboard work" },
  { id: "tx-018", date: "2026-03-22", amount: 210, category: "Entertainment", type: "expense", merchant: "Aurora Cinema", note: "Movies and snacks" },
  { id: "tx-019", date: "2026-04-03", amount: 6200, category: "Salary", type: "income", merchant: "Northstar Payroll", note: "Monthly salary" },
  { id: "tx-020", date: "2026-04-04", amount: 168, category: "Utilities", type: "expense", merchant: "City Energy", note: "Electricity bill" },
  { id: "tx-021", date: "2026-04-06", amount: 95, category: "Transport", type: "expense", merchant: "RideShare", note: "Commute and errands" },
  { id: "tx-022", date: "2026-04-07", amount: 260, category: "Freelance", type: "income", merchant: "Studio North", note: "Analytics mockup" },
  { id: "tx-023", date: "2026-04-08", amount: 182, category: "Groceries", type: "expense", merchant: "FreshMart", note: "Weekly groceries" },
  { id: "tx-024", date: "2026-04-12", amount: 128, category: "Subscriptions", type: "expense", merchant: "Creative Cloud", note: "Annual plan split" },
  { id: "tx-025", date: "2026-04-14", amount: 86, category: "Dining", type: "expense", merchant: "Cedar Cafe", note: "Coffee and lunch" },
  { id: "tx-026", date: "2026-04-15", amount: 340, category: "Health", type: "expense", merchant: "WellSpring", note: "Checkup and prescriptions" },
];

const state = {
  role: loadRole(),
  theme: loadTheme(),
  transactions: loadTransactions(),
  filters: {
    search: "",
    type: "all",
    category: "all",
    sortBy: "date",
    sortOrder: "desc",
  },
  editingId: null,
};

const elements = {};

init();

function init() {
  cacheElements();
  bindEvents();
  applyTheme();
  syncRoleControls();
  syncFilterControls();
  renderAll();
}

function cacheElements() {
  elements.roleSelect = document.getElementById("roleSelect");
  elements.themeToggle = document.getElementById("themeToggle");
  elements.themeLabel = document.querySelector("[data-theme-label]");
  elements.addTransactionButton = document.getElementById("addTransactionButton");
  elements.roleActionButton = document.getElementById("roleActionButton");
  elements.exportJsonButton = document.getElementById("exportJsonButton");
  elements.exportCsvButton = document.getElementById("exportCsvButton");
  elements.summaryCards = document.getElementById("summaryCards");
  elements.trendChart = document.getElementById("trendChart");
  elements.breakdownList = document.getElementById("breakdownList");
  elements.breakdownTotal = document.getElementById("breakdownTotal");
  elements.transactionList = document.getElementById("transactionList");
  elements.transactionsMeta = document.getElementById("transactionsMeta");
  elements.visibleDataCopy = document.getElementById("visibleDataCopy");
  elements.insightList = document.getElementById("insightList");
  elements.roleHeading = document.getElementById("roleHeading");
  elements.rolePill = document.getElementById("rolePill");
  elements.roleDescription = document.getElementById("roleDescription");
  elements.searchInput = document.getElementById("searchInput");
  elements.typeFilter = document.getElementById("typeFilter");
  elements.categoryFilter = document.getElementById("categoryFilter");
  elements.sortBySelect = document.getElementById("sortBySelect");
  elements.sortOrderSelect = document.getElementById("sortOrderSelect");
  elements.resetFiltersButton = document.getElementById("resetFiltersButton");
  elements.categoryOptions = document.getElementById("categoryOptions");
  elements.transactionDialog = document.getElementById("transactionDialog");
  elements.transactionForm = document.getElementById("transactionForm");
  elements.dialogTitle = document.getElementById("dialogTitle");
  elements.transactionId = document.getElementById("transactionId");
  elements.transactionDate = document.getElementById("transactionDate");
  elements.transactionAmount = document.getElementById("transactionAmount");
  elements.transactionType = document.getElementById("transactionType");
  elements.transactionCategory = document.getElementById("transactionCategory");
  elements.transactionMerchant = document.getElementById("transactionMerchant");
  elements.transactionNote = document.getElementById("transactionNote");
  elements.formStatus = document.getElementById("formStatus");
  elements.closeDialogButton = document.getElementById("closeDialogButton");
  elements.cancelDialogButton = document.getElementById("cancelDialogButton");
  elements.announcement = document.getElementById("announcement");
}

function bindEvents() {
  elements.roleSelect.addEventListener("change", () => {
    state.role = elements.roleSelect.value;
    persistRole();
    syncRoleControls();
    announce(`Role changed to ${state.role}.`);
    renderAll();
  });

  elements.themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    persistTheme();
    applyTheme();
    renderAll();
    announce(`${state.theme === "dark" ? "Dark" : "Light"} theme activated.`);
  });

  elements.addTransactionButton.addEventListener("click", openCreateDialog);
  elements.roleActionButton.addEventListener("click", openCreateDialog);
  elements.exportJsonButton.addEventListener("click", () => exportTransactions("json"));
  elements.exportCsvButton.addEventListener("click", () => exportTransactions("csv"));

  [elements.searchInput, elements.typeFilter, elements.categoryFilter, elements.sortBySelect, elements.sortOrderSelect].forEach((control) => {
    control.addEventListener("input", syncFiltersFromUi);
    control.addEventListener("change", syncFiltersFromUi);
  });

  elements.resetFiltersButton.addEventListener("click", resetFilters);

  elements.closeDialogButton.addEventListener("click", closeDialog);
  elements.cancelDialogButton.addEventListener("click", closeDialog);

  elements.transactionDialog.addEventListener("close", () => {
    state.editingId = null;
    elements.transactionForm.reset();
    elements.formStatus.textContent = "";
  });

  elements.transactionForm.addEventListener("submit", handleTransactionSubmit);
}

function loadTransactions() {
  const saved = storage.getItem(STORAGE_KEYS.transactions);
  if (!saved) {
    return cloneTransactions(defaultTransactions);
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return cloneTransactions(defaultTransactions);
    }

    return parsed
      .map(normalizeTransaction)
      .filter(Boolean)
      .sort((left, right) => new Date(right.date) - new Date(left.date));
  } catch {
    return cloneTransactions(defaultTransactions);
  }
}

function loadRole() {
  return storage.getItem(STORAGE_KEYS.role) || "viewer";
}

function loadTheme() {
  return storage.getItem(STORAGE_KEYS.theme) || "light";
}

function cloneTransactions(items) {
  return items.map((item) => ({ ...item }));
}

function normalizeTransaction(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const amount = Number(item.amount);
  const type = item.type === "income" ? "income" : "expense";
  const category = typeof item.category === "string" ? item.category.trim() : "Uncategorized";
  const merchant = typeof item.merchant === "string" ? item.merchant.trim() : "Untitled transaction";
  const note = typeof item.note === "string" ? item.note.trim() : "";
  const date = typeof item.date === "string" ? item.date : "";

  if (!date || Number.isNaN(Date.parse(date)) || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : `tx-${cryptoRandomId()}`,
    date,
    amount: Number(amount.toFixed(2)),
    category: category || "Uncategorized",
    type,
    merchant,
    note,
  };
}

function cryptoRandomId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

function persistTransactions() {
  storage.setItem(STORAGE_KEYS.transactions, JSON.stringify(state.transactions));
}

function persistRole() {
  storage.setItem(STORAGE_KEYS.role, state.role);
}

function persistTheme() {
  storage.setItem(STORAGE_KEYS.theme, state.theme);
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  elements.themeLabel.textContent = state.theme === "dark" ? "Light mode" : "Dark mode";
}

function syncRoleControls() {
  elements.roleSelect.value = state.role;
  const adminMode = state.role === "admin";
  elements.addTransactionButton.disabled = !adminMode;
  elements.addTransactionButton.hidden = false;
  elements.roleActionButton.disabled = !adminMode;
  elements.roleHeading.textContent = adminMode ? "Admin mode" : "Viewer mode";
  elements.rolePill.textContent = adminMode ? "Can edit" : "Read only";
  elements.roleDescription.textContent = adminMode
    ? "Admin users can create or update transactions directly in the demo. Role changes persist for the next visit."
    : "Viewer users can inspect the dashboard and export data, but cannot add or edit transactions.";
  elements.roleActionButton.textContent = adminMode ? "Add transaction" : "Switch to admin to edit";
}

function syncFilterControls() {
  elements.searchInput.value = state.filters.search;
  elements.typeFilter.value = state.filters.type;
  elements.categoryFilter.value = state.filters.category;
  elements.sortBySelect.value = state.filters.sortBy;
  elements.sortOrderSelect.value = state.filters.sortOrder;
}

function renderAll() {
  const visibleTransactions = getVisibleTransactions();
  const allTransactions = cloneTransactions(state.transactions).sort((left, right) => new Date(left.date) - new Date(right.date));
  const categories = getCategories(allTransactions);

  renderSummaryCards(state.transactions);
  renderTrendChart(allTransactions);
  renderBreakdownChart(visibleTransactions);
  renderTransactionList(visibleTransactions);
  renderInsights(state.transactions);
  renderMeta(visibleTransactions);
  renderFilters(categories);
  updateVisibleCopy(visibleTransactions.length, state.transactions.length);
}

function renderSummaryCards(transactions) {
  const summary = computeSummary(transactions);
  const cards = [
    {
      label: "Total balance",
      value: formatMoney(summary.balance),
      meta: `Opening balance ${formatMoney(openingBalance)} included`,
    },
    {
      label: "Income",
      value: formatMoney(summary.income),
      meta: `${summary.incomeCount} income transaction${summary.incomeCount === 1 ? "" : "s"}`,
    },
    {
      label: "Expenses",
      value: formatMoney(summary.expenses),
      meta: `${summary.expenseCount} expense transaction${summary.expenseCount === 1 ? "" : "s"}`,
    },
    {
      label: "Net movement",
      value: summary.net >= 0 ? `+${formatMoney(summary.net)}` : `-${formatMoney(Math.abs(summary.net))}`,
      meta: summary.net >= 0 ? "Positive cash flow" : "Spending exceeded income",
    },
  ];

  elements.summaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <p class="label">${card.label}</p>
          <div class="value">${card.value}</div>
          <p class="meta">${card.meta}</p>
        </article>
      `,
    )
    .join("");
}

function computeSummary(transactions) {
  const summary = transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income") {
        summary.income += transaction.amount;
        summary.incomeCount += 1;
      } else {
        summary.expenses += transaction.amount;
        summary.expenseCount += 1;
      }

      return summary;
    },
    {
      income: 0,
      expenses: 0,
      incomeCount: 0,
      expenseCount: 0,
      net: 0,
      balance: openingBalance,
    },
  );

  summary.net = Number((summary.income - summary.expenses).toFixed(2));
  summary.balance = Number((openingBalance + summary.net).toFixed(2));
  return summary;
}

function renderTrendChart(transactions) {
  const points = buildMonthlyTrend(transactions);

  if (!points.length) {
    elements.trendChart.innerHTML = `<text x="40" y="70" class="chart-axis-label">No trend data available.</text>`;
    return;
  }

  const width = 960;
  const height = 320;
  const padding = { top: 28, right: 28, bottom: 42, left: 56 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#12746f";
  const accent2Color = getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim() || "#e58b3a";
  const values = points.map((point) => point.balance);
  const minValue = Math.min(...values, openingBalance);
  const maxValue = Math.max(...values, openingBalance);
  const range = Math.max(maxValue - minValue, 1);
  const stepX = points.length === 1 ? 0 : chartWidth / (points.length - 1);
  const coordinateSets = points.map((point, index) => {
    const x = padding.left + stepX * index;
    const y = padding.top + chartHeight - ((point.balance - minValue) / range) * chartHeight;
    return { ...point, x, y };
  });

  const linePath = coordinateSets
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const firstPoint = coordinateSets[0];
  const lastPoint = coordinateSets[coordinateSets.length - 1];
  const baseLine = padding.top + chartHeight;
  const areaPath = `${linePath} L ${lastPoint.x} ${baseLine} L ${firstPoint.x} ${baseLine} Z`;
  const gridLines = [0.2, 0.4, 0.6, 0.8].map((ratio) => {
    const y = padding.top + chartHeight * ratio;
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
  });
  const labelStep = Math.max(1, Math.ceil(points.length / 6));

  elements.trendChart.innerHTML = `
    <defs>
      <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.28" />
        <stop offset="100%" stop-color="${accent2Color}" stop-opacity="0.03" />
      </linearGradient>
    </defs>
    <g class="chart-grid">${gridLines.join("")}</g>
    <path class="chart-area" d="${areaPath}" />
    <path class="chart-line" d="${linePath}" />
    ${coordinateSets
      .map(
        (point, index) => `
          <g transform="translate(${point.x}, ${point.y})">
            <circle class="chart-point" r="7"></circle>
            <title>${point.label}: ${formatMoney(point.balance)}</title>
          </g>
          ${index % labelStep === 0 || index === coordinateSets.length - 1 ? `<text x="${point.x}" y="${height - 12}" text-anchor="middle" class="chart-axis-label">${point.label}</text>` : ""}
          <text x="${point.x}" y="${point.y - 14}" text-anchor="middle" class="chart-point-label">${formatMoney(point.balance)}</text>
        `,
      )
      .join("")}
    ${[
      { value: maxValue, y: padding.top + 6 },
      { value: (minValue + maxValue) / 2, y: padding.top + chartHeight / 2 },
      { value: minValue, y: padding.top + chartHeight },
    ]
      .map(
        (item) => `
          <text x="18" y="${item.y}" class="chart-axis-label">${formatMoney(item.value)}</text>
        `,
      )
      .join("")}
  `;
}

function buildMonthlyTrend(transactions) {
  const months = new Map();

  transactions.forEach((transaction) => {
    const key = transaction.date.slice(0, 7);
    if (!months.has(key)) {
      months.set(key, { income: 0, expenses: 0 });
    }

    const entry = months.get(key);
    if (transaction.type === "income") {
      entry.income += transaction.amount;
    } else {
      entry.expenses += transaction.amount;
    }
  });

  const orderedMonths = [...months.keys()].sort();
  let runningBalance = openingBalance;

  return orderedMonths.map((key) => {
    const entry = months.get(key);
    runningBalance += entry.income - entry.expenses;
    return {
      key,
      label: monthFormatter.format(new Date(`${key}-01T00:00:00`)),
      balance: Number(runningBalance.toFixed(2)),
      net: Number((entry.income - entry.expenses).toFixed(2)),
    };
  });
}

function renderBreakdownChart(transactions) {
  const breakdown = getExpenseBreakdown(transactions);
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
  elements.breakdownTotal.textContent = formatMoney(total);

  if (!breakdown.length) {
    elements.breakdownList.innerHTML = `<div class="breakdown-empty"><p>No expense data is available for the current view.</p></div>`;
    return;
  }

  const palette = ["#12746f", "#e58b3a", "#6b7cff", "#7ecf9f", "#f4c36b", "#c94f5a"];

  elements.breakdownList.innerHTML = breakdown
    .map((item, index) => {
      const percent = total === 0 ? 0 : (item.amount / total) * 100;
      const color = palette[index % palette.length];
      return `
        <div class="breakdown-item">
          <div class="breakdown-head">
            <span>${item.category}</span>
            <span>${formatMoney(item.amount)} (${percent.toFixed(0)}%)</span>
          </div>
          <div class="breakdown-track">
            <div class="breakdown-fill" style="width:${percent}%; background:${color}"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function getExpenseBreakdown(transactions) {
  const totals = new Map();

  transactions
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      totals.set(transaction.category, (totals.get(transaction.category) || 0) + transaction.amount);
    });

  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 6);
}

function renderTransactionList(transactions) {
  if (!transactions.length) {
    elements.transactionList.innerHTML = `
      <div class="transaction-empty">
        <h4>No matching transactions</h4>
        <p>Adjust the filters or reset them to reveal the full dataset.</p>
      </div>
    `;
    return;
  }

  elements.transactionList.innerHTML = transactions.map((transaction) => renderTransactionCard(transaction)).join("");

  if (state.role === "admin") {
    elements.transactionList.querySelectorAll("[data-edit]").forEach((button) => {
      button.addEventListener("click", () => openEditDialog(button.dataset.edit));
    });
  }
}

function renderTransactionCard(transaction) {
  const isIncome = transaction.type === "income";
  const amountLabel = `${isIncome ? "+" : "-"}${formatMoney(transaction.amount)}`;

  return `
    <article class="transaction-card">
      <div class="transaction-top">
        <div>
          <p class="transaction-date">${formatDate(transaction.date)}</p>
          <div class="transaction-merchant">${escapeHtml(transaction.merchant)}</div>
          <p class="transaction-note">${escapeHtml(transaction.note || "No note provided")}</p>
        </div>
        <div class="transaction-amount ${transaction.type}">${amountLabel}</div>
      </div>
      <div class="transaction-meta">
        <div class="meta-tags">
          <span class="pill ${isIncome ? "pill-income" : "pill-expense"}">${isIncome ? "Income" : "Expense"}</span>
          <span class="pill pill-muted">${escapeHtml(transaction.category)}</span>
        </div>
        ${state.role === "admin"
          ? `<button class="ghost-button" type="button" data-edit="${transaction.id}">Edit</button>`
          : ""}
      </div>
    </article>
  `;
}

function renderMeta(visibleTransactions) {
  const total = visibleTransactions.length;
  const firstVisible = total ? visibleTransactions[0] : null;
  elements.transactionsMeta.textContent = total
    ? `${total} transaction${total === 1 ? "" : "s"} shown${firstVisible ? `, starting with ${formatDate(firstVisible.date)}` : ""}`
    : "No transactions match the current filters.";
}

function updateVisibleCopy(visibleCount, totalCount) {
  elements.visibleDataCopy.textContent = `${visibleCount} of ${totalCount} transactions visible.`;
}

function renderInsights(transactions) {
  const summary = computeSummary(transactions);
  const breakdown = getExpenseBreakdown(transactions);
  const monthly = buildMonthlyComparison(transactions);
  const efficiency = summary.expenses === 0 ? 0 : summary.income / summary.expenses;
  const savingsRate = summary.income === 0 ? 0 : (summary.net / summary.income) * 100;

  const cards = [
    {
      title: "Highest spending category",
      text: breakdown.length
        ? `${breakdown[0].category} leads with ${formatMoney(breakdown[0].amount)} in expenses.`
        : "No expense categories are available in the current dataset.",
    },
    {
      title: "Monthly comparison",
      text: monthly
        ? monthly
        : "Not enough months are available yet to compare spending trends.",
    },
    {
      title: "Useful observation",
      text: summary.expenses === 0
        ? "There are no recorded expenses, so every incoming dollar becomes available cash flow."
        : `Income covers expenses by ${efficiency.toFixed(2)}x and the net margin sits at ${savingsRate.toFixed(1)}%.`,
    },
  ];

  elements.insightList.innerHTML = cards
    .map(
      (card) => `
        <article class="insight-card">
          <h4>${card.title}</h4>
          <p class="insight-copy">${card.text}</p>
        </article>
      `,
    )
    .join("");
}

function buildMonthlyComparison(transactions) {
  const months = new Map();

  transactions.forEach((transaction) => {
    const key = transaction.date.slice(0, 7);
    if (!months.has(key)) {
      months.set(key, { income: 0, expenses: 0 });
    }

    const entry = months.get(key);
    if (transaction.type === "income") {
      entry.income += transaction.amount;
    } else {
      entry.expenses += transaction.amount;
    }
  });

  const keys = [...months.keys()].sort();
  if (keys.length < 2) {
    return "Not enough monthly history yet to compare two periods.";
  }

  const latest = months.get(keys[keys.length - 1]);
  const previous = months.get(keys[keys.length - 2]);
  const currentLabel = monthFormatter.format(new Date(`${keys[keys.length - 1]}-01T00:00:00`));
  const previousLabel = monthFormatter.format(new Date(`${keys[keys.length - 2]}-01T00:00:00`));
  const delta = latest.expenses - previous.expenses;
  const deltaPercent = previous.expenses === 0 ? 0 : (Math.abs(delta) / previous.expenses) * 100;
  const direction = delta > 0 ? "higher" : delta < 0 ? "lower" : "flat";

  return `${currentLabel} spending is ${direction} than ${previousLabel} by ${formatMoney(Math.abs(delta))} (${deltaPercent.toFixed(1)}%).`;
}

function getVisibleTransactions() {
  const query = state.filters.search.trim().toLowerCase();

  return cloneTransactions(state.transactions)
    .filter((transaction) => {
      const matchesSearch = !query
        || [transaction.merchant, transaction.category, transaction.note, transaction.type]
          .some((value) => value.toLowerCase().includes(query));
      const matchesType = state.filters.type === "all" || transaction.type === state.filters.type;
      const matchesCategory = state.filters.category === "all" || transaction.category === state.filters.category;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((left, right) => sortTransactions(left, right, state.filters.sortBy, state.filters.sortOrder));
}

function sortTransactions(left, right, sortBy, sortOrder) {
  const direction = sortOrder === "asc" ? 1 : -1;
  let comparison = 0;

  if (sortBy === "amount") {
    comparison = left.amount - right.amount;
  } else if (sortBy === "category") {
    comparison = left.category.localeCompare(right.category);
  } else {
    comparison = new Date(left.date) - new Date(right.date);
  }

  return comparison * direction;
}

function getCategories(transactions) {
  return [...new Set(transactions.map((transaction) => transaction.category))].sort((left, right) => left.localeCompare(right));
}

function renderFilters(categories) {
  const previousCategory = state.filters.category;
  const options = [`<option value="all">All categories</option>`]
    .concat(categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`))
    .join("");
  elements.categoryFilter.innerHTML = options;

  elements.categoryOptions.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}"></option>`).join("");

  if (categories.includes(previousCategory)) {
    elements.categoryFilter.value = previousCategory;
  } else {
    state.filters.category = "all";
    elements.categoryFilter.value = "all";
  }
}

function syncFiltersFromUi() {
  state.filters = {
    search: elements.searchInput.value,
    type: elements.typeFilter.value,
    category: elements.categoryFilter.value,
    sortBy: elements.sortBySelect.value,
    sortOrder: elements.sortOrderSelect.value,
  };

  renderAll();
}

function resetFilters() {
  state.filters = {
    search: "",
    type: "all",
    category: "all",
    sortBy: "date",
    sortOrder: "desc",
  };
  syncFilterControls();
  renderAll();
  announce("Filters reset.");
}

function openCreateDialog() {
  if (state.role !== "admin") {
    announce("Switch to admin mode to add or edit transactions.");
    return;
  }

  state.editingId = null;
  elements.dialogTitle.textContent = "Add transaction";
  elements.transactionForm.reset();
  elements.transactionId.value = "";
  elements.transactionType.value = "expense";
  elements.transactionDate.value = new Date().toISOString().slice(0, 10);
  elements.formStatus.textContent = "";
  elements.transactionDialog.showModal();
}

function openEditDialog(transactionId) {
  if (state.role !== "admin") {
    return;
  }

  const transaction = state.transactions.find((item) => item.id === transactionId);
  if (!transaction) {
    return;
  }

  state.editingId = transaction.id;
  elements.dialogTitle.textContent = "Edit transaction";
  elements.transactionId.value = transaction.id;
  elements.transactionDate.value = transaction.date;
  elements.transactionAmount.value = transaction.amount;
  elements.transactionType.value = transaction.type;
  elements.transactionCategory.value = transaction.category;
  elements.transactionMerchant.value = transaction.merchant;
  elements.transactionNote.value = transaction.note;
  elements.formStatus.textContent = "";
  elements.transactionDialog.showModal();
}

function closeDialog() {
  if (elements.transactionDialog.open) {
    elements.transactionDialog.close();
  }
}

function handleTransactionSubmit(event) {
  event.preventDefault();

  if (state.role !== "admin") {
    elements.formStatus.textContent = "Switch to admin mode to save changes.";
    return;
  }

  const payload = {
    id: elements.transactionId.value || `tx-${cryptoRandomId()}`,
    date: elements.transactionDate.value,
    amount: Number(elements.transactionAmount.value),
    type: elements.transactionType.value,
    category: elements.transactionCategory.value.trim(),
    merchant: elements.transactionMerchant.value.trim(),
    note: elements.transactionNote.value.trim(),
  };

  if (!payload.date || !payload.category || !payload.merchant || !Number.isFinite(payload.amount) || payload.amount <= 0) {
    elements.formStatus.textContent = "Please complete the required fields with a valid amount.";
    return;
  }

  const normalized = normalizeTransaction(payload);
  if (!normalized) {
    elements.formStatus.textContent = "The transaction data could not be saved. Check the entered values.";
    return;
  }

  const existingIndex = state.transactions.findIndex((item) => item.id === normalized.id);
  if (existingIndex >= 0) {
    state.transactions.splice(existingIndex, 1, normalized);
  } else {
    state.transactions.unshift(normalized);
  }

  state.transactions.sort((left, right) => new Date(right.date) - new Date(left.date));
  persistTransactions();
  renderAll();
  closeDialog();
  announce(existingIndex >= 0 ? "Transaction updated." : "Transaction added.");
}

function exportTransactions(format) {
  const visibleTransactions = getVisibleTransactions();
  if (!visibleTransactions.length) {
    announce("No transactions are available to export for the current filter set.");
    return;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = `finedge-transactions-${stamp}.${format}`;
  let blob;

  if (format === "csv") {
    const rows = [
      ["Date", "Merchant", "Category", "Type", "Amount", "Note"],
      ...visibleTransactions.map((transaction) => [
        transaction.date,
        transaction.merchant,
        transaction.category,
        transaction.type,
        transaction.amount.toFixed(2),
        transaction.note,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  } else {
    blob = new Blob([JSON.stringify(visibleTransactions, null, 2)], { type: "application/json;charset=utf-8" });
  }

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  announce(`${format.toUpperCase()} export created.`);
}

function formatMoney(value) {
  return currencyFormatter.format(Number(value || 0));
}

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function announce(message) {
  elements.announcement.textContent = message;
}
