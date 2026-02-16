const STORAGE_KEY = "passes_v1";

const state = {
  items: [],
  editId: null,
  isSubmitting: false,

  searchQuery: "",
  sortMode: "dateAsc", 
};

function createId() {
  return (crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : "id_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    if (Array.isArray(parsed.items)) state.items = parsed.items;
    if (typeof parsed.searchQuery === "string") state.searchQuery = parsed.searchQuery;
    if (typeof parsed.sortMode === "string") state.sortMode = parsed.sortMode;
  } catch (_) {
  }
}

function saveState() {
  const payload = {
    items: state.items,
    searchQuery: state.searchQuery,
    sortMode: state.sortMode,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}


const dom = {
  form: document.getElementById("createForm"),

  formTitle: document.getElementById("formTitle"),
  formMsg: document.getElementById("formMsg"),

  userNameInput: document.getElementById("userNameInput"),
  reasonSelect: document.getElementById("reasonSelect"),
  validDateInput: document.getElementById("validDateInput"),
  commentInput: document.getElementById("commentInput"),
  issuerInput: document.getElementById("issuerInput"),

  userNameError: document.getElementById("userNameError"),
  reasonError: document.getElementById("reasonError"),
  validDateError: document.getElementById("validDateError"),
  commentError: document.getElementById("commentError"),
  issuerError: document.getElementById("issuerError"),

  submitBtn: document.getElementById("submitBtn"),
  resetBtn: document.getElementById("resetBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),

  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),

  emptyState: document.getElementById("emptyState"),
  tbody: document.getElementById("itemsTableBody"),
};


function esc(v) {
  return String(v)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getViewItems() {
  const q = state.searchQuery.trim().toLowerCase();
  let list = state.items;

  if (q) {
    list = list.filter(x => (x.userName || "").toLowerCase().includes(q));
  }

  const sorted = [...list];

  sorted.sort((a, b) => {
    const mode = state.sortMode;

    if (mode === "userAsc" || mode === "userDesc") {
      const av = (a.userName || "").toLowerCase();
      const bv = (b.userName || "").toLowerCase();
      const cmp = av.localeCompare(bv, "uk");
      return mode === "userAsc" ? cmp : -cmp;
    }

    const ad = a.validDate || "";
    const bd = b.validDate || "";
    const cmp = ad.localeCompare(bd);
    return mode === "dateAsc" ? cmp : -cmp;
  });

  return sorted;
}

function render() {
  const isEdit = state.editId !== null;
  dom.formTitle.textContent = isEdit ? "Редагувати пропуск" : "Новий пропуск";
  dom.submitBtn.textContent = isEdit ? "Зберегти зміни" : "Зберегти";
  dom.cancelEditBtn.style.display = isEdit ? "inline-block" : "none";
  dom.submitBtn.disabled = state.isSubmitting;

  dom.searchInput.value = state.searchQuery;
  dom.sortSelect.value = state.sortMode;

  const view = getViewItems();

  dom.emptyState.style.display = view.length === 0 ? "block" : "none";

  dom.tbody.innerHTML = view.map((x, i) => `
    <tr data-row-id="${esc(x.id)}">
      <td>${i + 1}</td>
      <td>${esc(x.userName)}</td>
      <td>${esc(x.reason)}</td>
      <td>${esc(x.validDate)}</td>
      <td>${esc(x.issuer)}</td>
      <td>${esc(x.comment)}</td>
      <td>
        <button type="button" class="edit-btn" data-id="${esc(x.id)}">Редагувати</button>
        <button type="button" class="delete-btn danger" data-id="${esc(x.id)}">Видалити</button>
      </td>
    </tr>
  `).join("");
}


function setFormMessage(msg) {
  dom.formMsg.textContent = msg;
}

function showError(control, errorEl, msg) {
  control.classList.add("invalid");
  errorEl.textContent = msg;
}

function clearErrors() {
  [
    dom.userNameInput,
    dom.reasonSelect,
    dom.validDateInput,
    dom.commentInput,
    dom.issuerInput,
  ].forEach(el => el.classList.remove("invalid"));

  [
    dom.userNameError,
    dom.reasonError,
    dom.validDateError,
    dom.commentError,
    dom.issuerError,
  ].forEach(el => (el.textContent = ""));
}

function readForm() {
  return {
    userName: dom.userNameInput.value,
    reason: dom.reasonSelect.value,
    validDate: dom.validDateInput.value,
    comment: dom.commentInput.value,
    issuer: dom.issuerInput.value,
  };
}

function validate(dto) {
  let ok = true;

  if (dto.userName.trim() === "") {
    showError(dom.userNameInput, dom.userNameError, "Вкажіть ім’я.");
    ok = false;
  }
  if (dto.reason === "") {
    showError(dom.reasonSelect, dom.reasonError, "Оберіть причину.");
    ok = false;
  }
  if (dto.validDate === "") {
    showError(dom.validDateInput, dom.validDateError, "Оберіть дату.");
    ok = false;
  }
  if (dto.comment.trim().length < 3) {
    showError(dom.commentInput, dom.commentError, "Коментар має бути хоча б 3 символи.");
    ok = false;
  }
  if (dto.issuer.trim() === "") {
    showError(dom.issuerInput, dom.issuerError, "Вкажіть, хто видав.");
    ok = false;
  }

  return ok;
}


function addItem(dto) {
  state.items.push({
    id: createId(),
    userName: dto.userName.trim(),
    reason: dto.reason,
    validDate: dto.validDate,
    comment: dto.comment.trim(),
    issuer: dto.issuer.trim(),
  });
}

function updateItem(id, dto) {
  const idx = state.items.findIndex(x => x.id === id);
  if (idx === -1) return false;

  state.items[idx] = {
    ...state.items[idx],
    userName: dto.userName.trim(),
    reason: dto.reason,
    validDate: dto.validDate,
    comment: dto.comment.trim(),
    issuer: dto.issuer.trim(),
  };
  return true;
}

function removeItem(id) {
  const before = state.items.length;
  state.items = state.items.filter(x => x.id !== id);
  if (state.editId === id) state.editId = null;
  return state.items.length !== before;
}

function startEdit(id) {
  const item = state.items.find(x => x.id === id);
  if (!item) return;

  state.editId = id;

  dom.userNameInput.value = item.userName;
  dom.reasonSelect.value = item.reason;
  dom.validDateInput.value = item.validDate;
  dom.commentInput.value = item.comment;
  dom.issuerInput.value = item.issuer;

  clearErrors();
  setFormMessage("Режим редагування.");
  dom.userNameInput.focus();
  render();
}

function cancelEdit() {
  state.editId = null;
  dom.form.reset();
  clearErrors();
  setFormMessage("Редагування скасовано.");
  dom.userNameInput.focus();
  render();
}


function onSubmit(e) {
  e.preventDefault();
  if (state.isSubmitting) return;

  clearErrors();
  setFormMessage("");

  const dto = readForm();
  if (!validate(dto)) {
    setFormMessage("Виправте помилки у формі.");
    return;
  }

  state.isSubmitting = true;
  render();

  try {
    if (state.editId === null) {
      addItem(dto);
      setFormMessage("Запис додано.");
    } else {
      const ok = updateItem(state.editId, dto);
      setFormMessage(ok ? "Зміни збережено." : "Запис не знайдено.");
      state.editId = null;
    }

    saveState();

    dom.form.reset();
    dom.userNameInput.focus();
    clearErrors();
  } finally {
    state.isSubmitting = false;
    render();
  }
}

function onReset() {
  dom.form.reset();
  clearErrors();
  setFormMessage("");
  dom.userNameInput.focus();
}

function onTableClick(e) {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains("delete-btn")) {
    const removed = removeItem(id);
    if (removed) {
      saveState();
      setFormMessage("Запис видалено.");
      render();
    }
    return;
  }

  if (target.classList.contains("edit-btn")) {
    startEdit(id);
    return;
  }
}

function onSearchInput() {
  state.searchQuery = dom.searchInput.value;
  saveState();
  render();
}

function onClearSearch() {
  state.searchQuery = "";
  dom.searchInput.value = "";
  saveState();
  render();
  dom.searchInput.focus();
}

function onSortChange() {
  state.sortMode = dom.sortSelect.value;
  saveState();
  render();
}



(function init() {
  loadState();

  dom.form.addEventListener("submit", onSubmit);
  dom.resetBtn.addEventListener("click", onReset);
  dom.cancelEditBtn.addEventListener("click", cancelEdit);

  dom.tbody.addEventListener("click", onTableClick);

  dom.searchInput.addEventListener("input", onSearchInput);
  dom.clearSearchBtn.addEventListener("click", onClearSearch);
  dom.sortSelect.addEventListener("change", onSortChange);

  render();
  dom.userNameInput.focus();
})();
