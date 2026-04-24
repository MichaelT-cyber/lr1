// ------------------------------------
// Адреса бекенду
// Сюди фронтенд буде відправляти всі GET / POST / PUT / DELETE запити
// ------------------------------------
const API = "http://127.0.0.1:3000/api/v1";

// універсальний клієнт для API
async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Помилка API");
  }

  return data;
}

// ------------------------------------
// Стан сторінки
// currentEntity - яка вкладка зараз активна
// editId - id запису, який зараз редагується
// searchQuery - текст із поля пошуку
// ------------------------------------
const state = {
  currentEntity: "users",
  editId: null,
  searchQuery: "",
  statusFilter: "",
};

// ------------------------------------
// Конфігурація всіх сутностей
// Тут описано:
// - заголовки
// - endpoint для API
// - поля форми
// - колонки таблиці
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
    listEndpoint: "passes/full",

    fields: [
      { name: "userId", label: "ID користувача", type: "number" },
      { name: "date", label: "Дата", type: "date" },
      {
        name: "status",
        label: "Статус",
        type: "select",
        options: [
          { value: "approved", text: "Погоджено" },
          { value: "pending", text: "Очікує" },
          { value: "rejected", text: "Відхилено" }
        ]
      }
    ],

    columns: [
      { key: "id", label: "#" },
      { key: "userId", label: "ID користувача" },
      { key: "date", label: "Дата" },
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
    label: "Причина",
    type: "select",
    options: [
      { value: "Лабораторна", text: "Лабораторна" },
      { value: "Іспит", text: "Іспит" },
      { value: "Консультація", text: "Консультація" }
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
      { name: "action", label: "Дія", type: "text" },
      { name: "entity", label: "Сутність", type: "text" }
    ],

    columns: [
      { key: "id", label: "#" },
      { key: "action", label: "Дія" },
      { key: "entity", label: "Сутність" },
      { key: "entityId", label: "ID сутності" }
    ]
  }
};

// ------------------------------------
// Посилання на HTML-елементи
// Тут один раз знаходимо все, що потрібно на сторінці
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
  statusFilter: document.getElementById("statusFilter"),
  listStatus: document.getElementById("listStatus"),
  emptyState: document.getElementById("emptyState"),
  itemsTableHead: document.getElementById("itemsTableHead"),
  itemsTableBody: document.getElementById("itemsTableBody"),
};

// ------------------------------------
// Екранування HTML
// Щоб у таблицю безпечно вставляти текст
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
// Повертає конфігурацію активної сутності
// ------------------------------------
function getCurrentConfig() {
  return entityConfig[state.currentEntity];
}

// ------------------------------------
// Виводить повідомлення під формою
// ------------------------------------
function setFormMessage(message) {
  if (dom.formMsg) {
    dom.formMsg.textContent = message;
  }
}
function setListStatus(message) {
  if (dom.listStatus) {
    dom.listStatus.textContent = message;
  }
}

// ------------------------------------
// Перетворення значень для красивого показу в таблиці
// Тут ми робимо значення більш людськими
// ------------------------------------
function formatValue(fieldKey, value) {
  if (fieldKey === "role") {
    if (value === "student") return "Студент";
    if (value === "teacher") return "Викладач";
  }

  if (fieldKey === "isActive") {
    return value ? "Так" : "Ні";
  }

  if (fieldKey === "status") {
    if (value === "approved") return "Погоджено";
    if (value === "pending") return "Очікує";
    if (value === "rejected") return "Відхилено";
  }

  return value;
}

// ------------------------------------
// Малює поля форми
// item = null -> створення нового запису
// item != null -> редагування існуючого запису
// ------------------------------------
function renderFormFields(item = null) {
  const config = getCurrentConfig();

  if (!dom.formFields) return;

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
            ${field.options.map((option) => `
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
// Малює шапку таблиці
// ------------------------------------
function renderTableHead() {
  const config = getCurrentConfig();

  if (!dom.itemsTableHead) return;

  dom.itemsTableHead.innerHTML = `
    <tr>
      ${config.columns.map((col) => `<th>${esc(col.label)}</th>`).join("")}
      <th>Дії</th>
    </tr>
  `;
}

// ------------------------------------
// Малює рядки таблиці
// ------------------------------------
function renderTable(items) {
  const config = getCurrentConfig();

  if (dom.emptyState) {
    dom.emptyState.style.display = items.length === 0 ? "block" : "none";
  }

  if (!dom.itemsTableBody) return;

  dom.itemsTableBody.innerHTML = items.map((item) => `
    <tr>
      ${config.columns.map((col) => {
        const rawValue = item[col.key];
        const formattedValue = formatValue(col.key, rawValue);
        return `<td>${esc(formattedValue)}</td>`;
      }).join("")}
      <td>
        <button type="button" class="edit-btn" data-id="${esc(item.id)}">Редагувати</button>
        <button type="button" class="delete-btn danger" data-id="${esc(item.id)}">Видалити</button>
      </td>
    </tr>
  `).join("");
}

// ------------------------------------
// Оновлює заголовки форми і таблиці
// Залежно від активної вкладки і режиму редагування
// ------------------------------------
function updateTitles() {
  const config = getCurrentConfig();

  if (dom.formTitle) {
    dom.formTitle.textContent = state.editId ? config.formTitleEdit : config.formTitleCreate;
  }

  if (dom.formSubhint) {
    dom.formSubhint.textContent = config.formSubhint;
  }

  if (dom.tableTitle) {
    dom.tableTitle.textContent = config.tableTitle;
  }

  if (dom.tableSubhint) {
    dom.tableSubhint.textContent = config.tableSubhint;
  }
}

// ------------------------------------
// Зчитує дані з форми і формує об'єкт dto
// Тут важливо правильно перетворити типи:
// - isActive -> boolean
// - userId / entityId -> number
// ------------------------------------
function readFormData() {
  const config = getCurrentConfig();
  const dto = {};

  config.fields.forEach((field) => {
    const el = document.getElementById(field.name);
    if (!el) return;

    let value = el.value;

    // Для булевого поля isActive перетворюємо "true"/"false" у true/false
    if (field.name === "isActive") {
      dto[field.name] = value === "true";
      return;
    }

    // Для числових полів перетворюємо значення у Number
    if (field.type === "number") {
      dto[field.name] = value === "" ? "" : Number(value);
      return;
    }

    // Для решти полів обрізаємо пробіли
    dto[field.name] = typeof value === "string" ? value.trim() : value;
  });

  return dto;
}

// ------------------------------------
// Скидає форму і виходить з режиму редагування
// ------------------------------------
function resetForm() {
  state.editId = null;
  renderFormFields();
  updateTitles();

  if (dom.cancelEditBtn) {
    dom.cancelEditBtn.style.display = "none";
  }

  setFormMessage("");
}

// ------------------------------------
// Завантажує список записів із сервера
// GET /api/{endpoint}
// ------------------------------------
async function loadItems() {
  const config = getCurrentConfig();

  try {
    // Показуємо стан завантаження
    setListStatus("Завантаження...");
    if (dom.emptyState) {
      dom.emptyState.style.display = "none";
    }
    if (dom.itemsTableBody) {
      dom.itemsTableBody.innerHTML = "";
    }

    const listEndpoint = config.listEndpoint || config.endpoint;
    const result = await apiRequest(`${API}/${listEndpoint}`);
    
    let items = [];

    if (Array.isArray(result.data)) {
     items = result.data;
    } else if (result.data) {
      items = [result.data];
    }

    const q = (state.searchQuery || "").trim().toLowerCase();
    if (q) {
      items = items.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(q)
      );
    }

    if (state.statusFilter) {
  items = items.filter(
    (item) => item.status === state.statusFilter
  );
    }

    if (items.length === 0) {
      setListStatus("");
      if (dom.emptyState) {
        dom.emptyState.style.display = "block";
      }
      if (dom.itemsTableBody) {
        dom.itemsTableBody.innerHTML = "";
      }
      return;
    }

    renderTable(items);
    setListStatus("");
    setFormMessage("");
  } catch (error) {
    console.error("Помилка завантаження:", error);

    if (dom.itemsTableBody) {
      dom.itemsTableBody.innerHTML = "";
    }

    if (dom.emptyState) {
      dom.emptyState.style.display = "none";
    }

    setListStatus("Помилка завантаження.");
    setFormMessage("Не вдалося завантажити дані із сервера.");
  }
}

// ------------------------------------
// Створює новий запис
// POST /api/{endpoint}
// ------------------------------------
async function createItem(dto) {
  const config = getCurrentConfig();

  return await apiRequest(`${API}/${config.endpoint}`, {
  method: "POST",
  body: JSON.stringify(dto),
  })
}

// ------------------------------------
// Оновлює запис
// PUT /api/{endpoint}/{id}
// ------------------------------------
async function updateItem(id, dto) {
  const config = getCurrentConfig();

  return await apiRequest(`${API}/${config.endpoint}/${id}`, {
  method: "PUT",
  body: JSON.stringify(dto),
  });
  
}

// ------------------------------------
// Отримує один запис по id
// GET /api/{endpoint}/{id}
// ------------------------------------
async function getItemById(id) {
  const config = getCurrentConfig();

  const response = await fetch(`${API}/${config.endpoint}/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Не вдалося отримати запис");
  }

  return await response.json();
}

// ------------------------------------
// Видаляє запис
// DELETE /api/{endpoint}/{id}
// ------------------------------------
async function deleteItem(id) {
  const config = getCurrentConfig();

  return await apiRequest(`${API}/${config.endpoint}/${id}`, {
  method: "DELETE",
  });

}

// ------------------------------------
// Перемикає вкладку
// Тут ми:
// - ставимо нову active вкладку
// - очищаємо пошук
// - скидаємо режим редагування
// - перемальовуємо форму і таблицю
// ------------------------------------
function switchEntity(entityName) {
  // ЗБЕРІГАЄМО АКТИВНУ ВКЛАДКУ
  sessionStorage.setItem("activeTab", entityName);

  state.currentEntity = entityName;
  state.editId = null;
  state.searchQuery = "";

  if (dom.searchInput) {
    dom.searchInput.value = "";
  }

  if (dom.cancelEditBtn) {
    dom.cancelEditBtn.style.display = "none";
  }

  dom.tabs.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.entity === entityName);
  });

  renderFormFields();
  renderTableHead();
  updateTitles();
  setFormMessage("");
  loadItems();
}

// ------------------------------------
// Обробник submit форми
// Якщо editId є -> редагування
// Якщо editId немає -> створення
// Після цього перезавантажуємо таблицю
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
// Обробник кліку по таблиці
// edit-btn -> завантажити запис у форму
// delete-btn -> видалити запис
// ------------------------------------
async function onTableClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLElement)) return;

  try {
    // Клік по комірці таблиці -> показ деталей
    if (target.tagName === "TD") {
      const row = target.closest("tr");
      const id = row?.querySelector(".edit-btn")?.dataset.id;

      if (!id) return;

      const item = await getItemById(id);

      alert(`
ID: ${item.data.id}
ПІБ: ${item.data.fullName}
Роль: ${item.data.role}
Активний: ${item.data.isActive ? "Так" : "Ні"}
      `);

      return;
    }

    const id = target.dataset.id;
    if (!id) return;

    if (target.classList.contains("edit-btn")) {
      const item = await getItemById(id);

      state.editId = id;
      renderFormFields(item.data);
      updateTitles();

      if (dom.cancelEditBtn) {
        dom.cancelEditBtn.style.display = "inline-block";
      }

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
// Ініціалізація сторінки
// Тут вішаємо всі події і запускаємо стартову вкладку
// ------------------------------------
function init() {
  dom.tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchEntity(btn.dataset.entity);
    });
  });

  if (dom.entityForm) {
    dom.entityForm.addEventListener("submit", onFormSubmit);
  }

  if (dom.resetBtn) {
    dom.resetBtn.addEventListener("click", () => {
      resetForm();
    });
  }

  if (dom.cancelEditBtn) {
    dom.cancelEditBtn.addEventListener("click", () => {
      resetForm();
      setFormMessage("Редагування скасовано.");
    });
  }

  if (dom.searchInput) {
    dom.searchInput.addEventListener("input", () => {
      state.searchQuery = dom.searchInput.value;
      loadItems();
    });
  }

  if (dom.clearSearchBtn) {
    dom.clearSearchBtn.addEventListener("click", () => {
      state.searchQuery = "";

      if (dom.searchInput) {
        dom.searchInput.value = "";
      }

      loadItems();
    });
  }

  if (dom.statusFilter) {
  dom.statusFilter.addEventListener("change", (e) => {
    state.statusFilter = e.target.value;
    loadItems();
  });
}

  if (dom.itemsTableBody) {
    dom.itemsTableBody.addEventListener("click", onTableClick);
  }

  // Стартова вкладка
  const savedTab = sessionStorage.getItem("activeTab") || "users";
  switchEntity(savedTab);
}

init();