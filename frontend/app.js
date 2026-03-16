// ------------------------------------
// Базова адреса API
// ------------------------------------
const API = "http://localhost:3000/api";

// ------------------------------------
// Поточний стан сторінки
// ------------------------------------
const state = {
  currentEntity: "users",   // Поточна сутність
  editId: null,             // ID запису, який редагується
  searchQuery: "",          // Пошуковий рядок
};

// ------------------------------------
// Конфігурація сутностей
// Тут описано:
// - заголовки
// - поля форми
// - колонки таблиці
// - маршрути API
// ------------------------------------
const entityConfig = {
  users: {
    formTitleCreate: "Новий користувач",
    formTitleEdit: "Редагувати користувача",
    tableTitle: "Журнал користувачів",
    formSubhint: "Створення та редагування користувачів.",
    tableSubhint: "Перегляд, пошук, редагування та видалення користувачів.",
    endpoint: "users",

    fields: [
      { name: "fullName", label: "ПІБ", type: "text" },

      {
        name: "role",
        label: "Роль",
        type: "select",
        options: [
          { value: "student", text: "Студент" },
          { value: "teacher", text: "Викладач" }
        ]
      },

      {
        name: "isActive",
        label: "Активний",
        type: "select",
        options: [
          { value: "true", text: "Так" },
          { value: "false", text: "Ні" }
        ]
      }
    ],

    columns: [
      { key: "id", label: "#" },
      { key: "fullName", label: "ПІБ" },
      { key: "role", label: "Роль" },
      { key: "isActive", label: "Активний" }
    ]
  },

  passes: {
    formTitleCreate: "Новий пропуск",
    formTitleEdit: "Редагувати пропуск",
    tableTitle: "Журнал пропусків",
    formSubhint: "Створення та редагування пропусків.",
    tableSubhint: "Перегляд, пошук, редагування та видалення пропусків.",
    endpoint: "passes",

    fields: [
      { name: "userId", label: "ID користувача", type: "number" },
      { name: "validFrom", label: "Дата початку", type: "date" },
      { name: "validTo", label: "Дата завершення", type: "date" },
      {
        name: "status",
        label: "Статус",
        type: "select",
        options: [
          { value: "active", text: "Активний" },
          { value: "finished", text: "Завершений" },
          { value: "canceled", text: "Скасований" }
        ]
      }
    ],

    columns: [
      { key: "id", label: "#" },
      { key: "userId", label: "User ID" },
      { key: "validFrom", label: "Дата початку" },
      { key: "validTo", label: "Дата завершення" },
      { key: "status", label: "Статус" }
    ]
  },

  reasons: {
    formTitleCreate: "Нова причина",
    formTitleEdit: "Редагувати причину",
    tableTitle: "Журнал причин",
    formSubhint: "Створення та редагування причин.",
    tableSubhint: "Перегляд, пошук, редагування та видалення причин.",
    endpoint: "reasons",

    fields: [
      {
        name: "title",
        label: "Назва",
        type: "select",
        options: [
          { value: "practice", text: "Практична робота" },
          { value: "lab", text: "Лабораторна робота" },
          { value: "self", text: "Самостійна робота" },
          { value: "exam", text: "Екзамен" },
          { value: "test", text: "Тестування" },
          { value: "other", text: "Інше" }
        ]
      },

      {
        name: "description",
        label: "Опис",
        type: "textarea"
      }
    ],

    columns: [
      { key: "id", label: "#" },
      { key: "title", label: "Назва" },
      { key: "description", label: "Опис" }
    ]
  },

  logs: {
    formTitleCreate: "Новий лог",
    formTitleEdit: "Редагувати лог",
    tableTitle: "Журнал логів",
    formSubhint: "Створення та редагування логів.",
    tableSubhint: "Перегляд, пошук, редагування та видалення логів.",
    endpoint: "logs",

    fields: [
      { name: "userId", label: "ID користувача", type: "number" },
      { name: "passId", label: "ID пропуску", type: "number" },
      {
        name: "action",
        label: "Дія",
        type: "select",
        options: [
          { value: "create", text: "Створено" },
          { value: "update", text: "Оновлено" },
          { value: "delete", text: "Видалено" }
        ]
      },
      { name: "createdAt", label: "Дата створення", type: "datetime-local" }
    ],

    columns: [
      { key: "id", label: "#" },
      { key: "userId", label: "User ID" },
      { key: "passId", label: "Pass ID" },
      { key: "action", label: "Дія" },
      { key: "createdAt", label: "Дата створення" }
    ]
  }
};

// ------------------------------------
// Посилання на DOM-елементи
// ------------------------------------
const dom = {
  tabs: document.querySelectorAll(".tab-btn"),
  formTitle: document.getElementById("formTitle"),
  formSubhint: document.getElementById("formSubhint"),
  tableTitle: document.getElementById("tableTitle"),
  tableSubhint: document.getElementById("tableSubhint"),
  formFields: document.getElementById("formFields"),
  entityForm: document.getElementById("entityForm"),
  submitBtn: document.getElementById("submitBtn"),
  resetBtn: document.getElementById("resetBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  formMsg: document.getElementById("formMsg"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  emptyState: document.getElementById("emptyState"),
  itemsTableHead: document.getElementById("itemsTableHead"),
  itemsTableBody: document.getElementById("itemsTableBody"),
};

// ------------------------------------
// Безпечне екранування HTML
// ------------------------------------
function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ------------------------------------
// Отримати конфіг поточної сутності
// ------------------------------------
function getCurrentConfig() {
  return entityConfig[state.currentEntity];
}

// ------------------------------------
// Показати текстове повідомлення під формою
// ------------------------------------
function setFormMessage(message) {
  dom.formMsg.textContent = message;
}

// ------------------------------------
// Намалювати поля форми
// ------------------------------------
function renderFormFields(item = null) {
  const config = getCurrentConfig();

  if (!dom.formFields) {
    console.error("Елемент #formFields не знайдено в HTML");
    return;
  }

  dom.formFields.innerHTML = config.fields.map((field) => {
    const value = item ? (item[field.name] ?? "") : "";

    if (field.type === "textarea") {
      return `
        <div class="field">
          <label for="${field.name}">${field.label}</label>
          <textarea id="${field.name}" rows="4">${esc(value)}</textarea>
          <p class="error-text" id="${field.name}Error"></p>
        </div>
      `;
    }

    if (field.type === "select") {
      return `
        <div class="field">
          <label for="${field.name}">${field.label}</label>
          <select id="${field.name}">
            ${field.options.map(option => `
              <option value="${esc(option.value)}" ${String(value) === option.value ? "selected" : ""}>
                ${esc(option.text)}
              </option>
            `).join("")}
          </select>
          <p class="error-text" id="${field.name}Error"></p>
        </div>
      `;
    }

    return `
      <div class="field">
        <label for="${field.name}">${field.label}</label>
        <input id="${field.name}" type="${field.type}" value="${esc(value)}" />
        <p class="error-text" id="${field.name}Error"></p>
      </div>
    `;
  }).join("");
}

// ------------------------------------
// Намалювати шапку таблиці
// ------------------------------------
function renderTableHead() {
  const config = getCurrentConfig();

  dom.itemsTableHead.innerHTML = `
    <tr>
      ${config.columns.map(col => `<th>${esc(col.label)}</th>`).join("")}
      <th>Дії</th>
    </tr>
  `;
}

// ------------------------------------
// Намалювати таблицю
// ------------------------------------
function renderTable(items) {
  const config = getCurrentConfig();

  dom.emptyState.style.display = items.length === 0 ? "block" : "none";

  dom.itemsTableBody.innerHTML = items.map((item) => `
    <tr>
      ${config.columns.map(col => `<td>${esc(item[col.key])}</td>`).join("")}
      <td>
        <button type="button" class="edit-btn" data-id="${esc(item.id)}">Редагувати</button>
        <button type="button" class="delete-btn danger" data-id="${esc(item.id)}">Видалити</button>
      </td>
    </tr>
  `).join("");
}

// ------------------------------------
// Оновити заголовки залежно від сутності
// ------------------------------------
function updateTitles() {
  const config = getCurrentConfig();

  dom.formTitle.textContent = state.editId ? config.formTitleEdit : config.formTitleCreate;
  dom.formSubhint.textContent = config.formSubhint;
  dom.tableTitle.textContent = config.tableTitle;
  dom.tableSubhint.textContent = config.tableSubhint;
}

// ------------------------------------
// Прочитати форму і зібрати payload
// ------------------------------------
function readFormData() {
  const config = getCurrentConfig();
  const dto = {};

  config.fields.forEach((field) => {
    const el = document.getElementById(field.name);
    if (!el) return;

    if (field.type === "number") {
      dto[field.name] = Number(el.value);
    } else if (field.name === "isActive") {
      dto[field.name] = el.value === "true";
    } else if (field.type === "datetime-local") {
      dto[field.name] = el.value === "" ? new Date().toISOString() : el.value;
    } else {
      dto[field.name] = el.value;
    }
  });

  return dto;
}

// ------------------------------------
// Очистити форму
// ------------------------------------
function resetForm() {
  state.editId = null;
  renderFormFields();
  updateTitles();
  dom.cancelEditBtn.style.display = "none";
  setFormMessage("");
}

// ------------------------------------
// Завантажити список із сервера
// ------------------------------------
async function loadItems() {
  const config = getCurrentConfig();

  try {
    const response = await fetch(`${API}/${config.endpoint}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    let items = Array.isArray(result.data) ? result.data : [];

    const q = state.searchQuery.trim().toLowerCase();
    if (q) {
      items = items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(q)
      );
    }

    renderTable(items);
    setFormMessage("");
  } catch (error) {
    console.error("Помилка завантаження:", error);
    dom.itemsTableBody.innerHTML = "";
    dom.emptyState.style.display = "block";
    setFormMessage("Не вдалося завантажити дані із сервера.");
  }
}

// ------------------------------------
// Перемкнути сутність
// ------------------------------------
function switchEntity(entityName) {
  state.currentEntity = entityName;
  state.editId = null;
  state.searchQuery = "";

  dom.searchInput.value = "";
  dom.cancelEditBtn.style.display = "none";

  dom.tabs.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.entity === entityName);
  });

  renderFormFields();
  renderTableHead();
  updateTitles();
  setFormMessage("");
  loadItems();
}

// ------------------------------------
// Створити новий запис
// ------------------------------------
async function createItem(dto) {
  const config = getCurrentConfig();

  const response = await fetch(`${API}/${config.endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dto)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || "Помилка створення запису");
  }
}

// ------------------------------------
// Оновити запис
// ------------------------------------
async function updateItem(id, dto) {
  const config = getCurrentConfig();

  const response = await fetch(`${API}/${config.endpoint}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dto)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || "Помилка оновлення запису");
  }
}

// ------------------------------------
// Отримати один запис по id
// ------------------------------------
async function getItemById(id) {
  const config = getCurrentConfig();

  const response = await fetch(`${API}/${config.endpoint}/${id}`);

  if (!response.ok) {
    throw new Error("Не вдалося отримати запис");
  }

  return await response.json();
}

// ------------------------------------
// Видалити запис
// ------------------------------------
async function deleteItem(id) {
  const config = getCurrentConfig();

  const response = await fetch(`${API}/${config.endpoint}/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message || "Помилка видалення запису");
  }
}

// ------------------------------------
// Обробка submit форми
// ------------------------------------
async function onFormSubmit(event) {
  event.preventDefault();

  try {
    const dto = readFormData();

    if (state.editId) {
      await updateItem(state.editId, dto);
      setFormMessage("Запис успішно оновлено.");
    } else {
      await createItem(dto);
      setFormMessage("Запис успішно створено.");
    }

    resetForm();
    await loadItems();
  } catch (error) {
    console.error(error);
    setFormMessage(error.message || "Сталася помилка.");
  }
}

// ------------------------------------
// Обробка кліків у таблиці
// ------------------------------------
async function onTableClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLElement)) return;

  const id = target.dataset.id;
  if (!id) return;

  try {
    if (target.classList.contains("edit-btn")) {
      const item = await getItemById(id);

      state.editId = id;
      renderFormFields(item);
      updateTitles();
      dom.cancelEditBtn.style.display = "inline-block";
      setFormMessage("Режим редагування.");
      return;
    }

    if (target.classList.contains("delete-btn")) {
      await deleteItem(id);
      setFormMessage("Запис видалено.");
      await loadItems();
    }
  } catch (error) {
    console.error(error);
    setFormMessage(error.message || "Сталася помилка.");
  }
}

// ------------------------------------
// Ініціалізація
// ------------------------------------
function init() {
  dom.tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      switchEntity(btn.dataset.entity);
    });
  });

  dom.entityForm.addEventListener("submit", onFormSubmit);

  dom.resetBtn.addEventListener("click", () => {
    resetForm();
  });

  dom.cancelEditBtn.addEventListener("click", () => {
    resetForm();
    setFormMessage("Редагування скасовано.");
  });

  dom.searchInput.addEventListener("input", () => {
    state.searchQuery = dom.searchInput.value;
    loadItems();
  });

  dom.clearSearchBtn.addEventListener("click", () => {
    state.searchQuery = "";
    dom.searchInput.value = "";
    loadItems();
  });

  dom.itemsTableBody.addEventListener("click", onTableClick);

  switchEntity("users");
}

init();
