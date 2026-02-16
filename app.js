const STORAGE_KEY = "lr1_variant8_passes";

const state = {
  passes: [], 
  ui: {
    searchUserName: "",
    filterReason: "All",
    sortMode: "dateDesc"
  }
};

const dom = {
  form: document.getElementById("passForm"),
  formTitle: document.getElementById("formTitle"),
  submitBtn: document.getElementById("submitBtn"),
  resetBtn: document.getElementById("resetBtn"),

  editingId: document.getElementById("editingId"),
  userNameInput: document.getElementById("userNameInput"),
  reasonSelect: document.getElementById("reasonSelect"),
  validDateInput: document.getElementById("validDateInput"),
  commentInput: document.getElementById("commentInput"),
  issuerInput: document.getElementById("issuerInput"),

  formError: document.getElementById("formError"),
  userNameError: document.getElementById("userNameError"),
  reasonError: document.getElementById("reasonError"),
  validDateError: document.getElementById("validDateError"),
  commentError: document.getElementById("commentError"),
  issuerError: document.getElementById("issuerError"),

  tbody: document.getElementById("passesTbody"),
  emptyState: document.getElementById("emptyState"),

  searchInput: document.getElementById("searchInput"),
  filterReason: document.getElementById("filterReason"),
  sortSelect: document.getElementById("sortSelect"),
  clearAllBtn: document.getElementById("clearAllBtn")
};

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.passes));
}

function loadFromStorage() {
  const json = localStorage.getItem(STORAGE_KEY);
  if (json === null) return [];
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function computeNextId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map(x => x.id)) + 1;
}

function readForm() {
  return {
    editingId: dom.editingId.value.trim(), 
    userName: dom.userNameInput.value.trim(),
    reason: dom.reasonSelect.value,
    validDate: dom.validDateInput.value,
    comment: dom.commentInput.value.trim(),
    issuer: dom.issuerInput.value.trim()
  };
}

function clearFieldError(input, errEl) {
  input.classList.remove("invalid");
  errEl.textContent = "";
}

function setFieldError(input, errEl, msg) {
  input.classList.add("invalid");
  errEl.textContent = msg;
}

function clearAllErrors() {
  dom.formError.textContent = "";
  clearFieldError(dom.userNameInput, dom.userNameError);
  clearFieldError(dom.reasonSelect, dom.reasonError);
  clearFieldError(dom.validDateInput, dom.validDateError);
  clearFieldError(dom.commentInput, dom.commentError);
  clearFieldError(dom.issuerInput, dom.issuerError);
}

function validate(dto) {
  clearAllErrors();
  let ok = true;

  if (dto.userName === "") { setFieldError(dom.userNameInput, dom.userNameError, "Ім'я та прізвище обов’язкові."); ok = false; }
  else if (dto.userName.length < 3 || dto.userName.length > 30) { setFieldError(dom.userNameInput, dom.userNameError, "Ім'я та прізвище 3–30 символів."); ok = false; }

  if (dto.reason === "") { setFieldError(dom.reasonSelect, dom.reasonError, "Оберіть причину."); ok = false; }

  if (dto.validDate === "") { setFieldError(dom.validDateInput, dom.validDateError, "Вкажіть дату."); ok = false; }
  else {
    const today = new Date();
    const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      .toISOString().slice(0, 10);
    if (dto.validDate < todayStr) { setFieldError(dom.validDateInput, dom.validDateError, "Дата не може бути в минулому."); ok = false; }
  }

  if (dto.issuer === "") { setFieldError(dom.issuerInput, dom.issuerError, "Хто допустив обов’язковий."); ok = false; }
  else if (dto.issuer.length < 2 || dto.issuer.length > 30) { setFieldError(dom.issuerInput, dom.issuerError, "Хто допустив 2–30 символів."); ok = false; }

  if (dto.comment !== "" && dto.comment.length < 5) { setFieldError(dom.commentInput, dom.commentError, "Коментар або порожній, або ≥ 5 символів."); ok = false; }

  if (!ok) dom.formError.textContent = "Є помилки. Виправ поля.";
  return ok;
}

function addPass(dto) {
  state.passes.push({
    id: computeNextId(state.passes),
    userName: dto.userName,
    reason: dto.reason,
    validDate: dto.validDate,
    comment: dto.comment,
    issuer: dto.issuer
  });
}

function updatePass(id, dto) {
  const target = state.passes.find(x => x.id === id);
  if (!target) return false;
  target.userName = dto.userName;
  target.reason = dto.reason;
  target.validDate = dto.validDate;
  target.comment = dto.comment;
  target.issuer = dto.issuer;
  return true;
}

function deletePass(id) {
  state.passes = state.passes.filter(x => x.id !== id);
}

function selectVisiblePasses() {
  const q = state.ui.searchUserName.trim().toLowerCase();

  let items = state.passes.filter(p => p.userName.toLowerCase().includes(q));

  if (state.ui.filterReason !== "All") {
    items = items.filter(p => p.reason === state.ui.filterReason);
  }

  return [...items].sort((a, b) => {
    if (state.ui.sortMode === "dateAsc") return a.validDate.localeCompare(b.validDate);
    return b.validDate.localeCompare(a.validDate);
  });
}

function render() {
  const visible = selectVisiblePasses();
  dom.emptyState.style.display = visible.length === 0 ? "block" : "none";

  dom.tbody.innerHTML = visible.map((p, index) => {
    const c = p.comment === "" ? "—" : p.comment;
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${p.userName}</td>
        <td>${p.reason}</td>
        <td>${p.validDate}</td>
        <td>${p.issuer}</td>
        <td>${c}</td>
        <td class="actions">
          <button type="button" class="edit-btn" data-id="${p.id}">Редагувати</button>
          <button type="button" class="delete-btn" data-id="${p.id}">Видалити</button>
        </td>
      </tr>
    `;
  }).join("");
}

function resetForm() {
  dom.editingId.value = "";
  dom.userNameInput.value = "";
  dom.reasonSelect.value = "";
  dom.validDateInput.value = "";
  dom.commentInput.value = "";
  dom.issuerInput.value = "";

  dom.formTitle.textContent = "Додати пропуск";
  dom.submitBtn.textContent = "Додати";

  clearAllErrors();
  dom.userNameInput.focus();
}

function startEdit(id) {
  const pass = state.passes.find(x => x.id === id);
  if (!pass) return;

  dom.editingId.value = String(pass.id);
  dom.userNameInput.value = pass.userName;
  dom.reasonSelect.value = pass.reason;
  dom.validDateInput.value = pass.validDate;
  dom.commentInput.value = pass.comment;
  dom.issuerInput.value = pass.issuer;

  dom.formTitle.textContent = `Редагувати пропуск #${pass.id}`;
  dom.submitBtn.textContent = "Зберегти";

  clearAllErrors();
  dom.userNameInput.focus();
}

function onSubmit(e) {
  e.preventDefault();

  const dto = readForm();
  if (!validate(dto)) return;

  const isEditing = dto.editingId !== "";

  if (isEditing) {
    const id = Number(dto.editingId);
    const ok = updatePass(id, dto);
    if (!ok) {
      dom.formError.textContent = "Не знайшов запис для оновлення, його могли видалити.";
      return;
    }
  } else {
    const dup = state.passes.some(p =>
      p.userName.toLowerCase() === dto.userName.toLowerCase() &&
      p.validDate === dto.validDate
    );
    if (dup) {
      dom.formError.textContent = "Такий пропуск вже існує (UserName + ValidDate).";
      return;
    }
    addPass(dto);
  }

  saveToStorage();
  render();
  resetForm();
}

function onToolbarChange() {
  state.ui.searchUserName = dom.searchInput.value;
  state.ui.filterReason = dom.filterReason.value;
  state.ui.sortMode = dom.sortSelect.value;
  render();
}

function onClearAll() {
  const sure = confirm("Точно очистити всі записи? Це видалить і з localStorage.");
  if (!sure) return;
  state.passes = [];
  saveToStorage();
  render();
  resetForm();
}

function onTableClick(e) {
  const t = e.target;

  if (t.classList.contains("delete-btn")) {
    const id = Number(t.dataset.id);
    deletePass(id);
    saveToStorage();
    render();
    if (dom.editingId.value === String(id)) resetForm();
    return;
  }

  if (t.classList.contains("edit-btn")) {
    startEdit(Number(t.dataset.id));
    return;
  }
}

function init() {
  state.passes = loadFromStorage();

  dom.form.addEventListener("submit", onSubmit);
  dom.resetBtn.addEventListener("click", resetForm);

  dom.searchInput.addEventListener("input", onToolbarChange);
  dom.filterReason.addEventListener("change", onToolbarChange);
  dom.sortSelect.addEventListener("change", onToolbarChange);

  dom.clearAllBtn.addEventListener("click", onClearAll);

  dom.tbody.addEventListener("click", onTableClick);

  render();
  resetForm();
}

init();
