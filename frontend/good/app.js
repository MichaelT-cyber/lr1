const state = {
  passes: [] 
};

const dom = {
  form: document.getElementById("passForm"),
  submitBtn: document.getElementById("submitBtn"),
  resetBtn: document.getElementById("resetBtn"),

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
  formError: document.getElementById("formError"),

  tbody: document.getElementById("passesTbody")
};

function computeNextId() {
  if (state.passes.length === 0) return 1;
  const maxId = Math.max(...state.passes.map(x => x.id));
  return maxId + 1;
}

function clearErrors() {
  dom.formError.textContent = "";

  const pairs = [
    [dom.userNameInput, dom.userNameError],
    [dom.reasonSelect, dom.reasonError],
    [dom.validDateInput, dom.validDateError],
    [dom.commentInput, dom.commentError],
    [dom.issuerInput, dom.issuerError],
  ];

  for (const [input, err] of pairs) {
    input.classList.remove("invalid");
    err.textContent = "";
  }
}

function setFieldError(input, errEl, msg) {
  input.classList.add("invalid");
  errEl.textContent = msg;
}

function readForm() {
  return {
    userName: dom.userNameInput.value.trim(),
    reason: dom.reasonSelect.value,
    validDate: dom.validDateInput.value,
    comment: dom.commentInput.value.trim(),
    issuer: dom.issuerInput.value.trim()
  };
}

function validate(dto) {
  clearErrors();
  let ok = true;

  if (dto.userName === "") { setFieldError(dom.userNameInput, dom.userNameError, "Ім'я та прізвище обов’язкові."); ok = false; }
  if (dto.reason === "")   { setFieldError(dom.reasonSelect, dom.reasonError, "Оберіть Причину."); ok = false; }
  if (dto.issuer === "")   { setFieldError(dom.issuerInput, dom.issuerError, "Хто допустив обов’язковий."); ok = false; }

  if (dto.validDate === "") {
    setFieldError(dom.validDateInput, dom.validDateError, "Вкажіть Дату дії пропуску");
    ok = false;
  } else {
    const today = new Date();
    const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      .toISOString().slice(0, 10);
    if (dto.validDate < todayStr) {
      setFieldError(dom.validDateInput, dom.validDateError, "Дата не може бути в минулому.");
      ok = false;
    }
  }

  if (dto.comment !== "" && dto.comment.length < 5) {
    setFieldError(dom.commentInput, dom.commentError, "Коментар або порожній, або ≥ 5 символів.");
    ok = false;
  }

  if (!ok) dom.formError.textContent = "Виправ помилки у полях";
  return ok;
}

function addItem(dto) {
  state.passes.push({
    id: computeNextId(),
    ...dto
  });
}

function deleteItem(id) {
  state.passes = state.passes.filter(x => x.id !== id);
}

function render() {
  dom.tbody.innerHTML = state.passes.map((p, idx) => {
    const comment = p.comment === "" ? "—" : p.comment;

    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${p.userName}</td>
        <td>${p.reason}</td>
        <td>${p.validDate}</td>
        <td>${p.issuer}</td>
        <td>${comment}</td>
        <td class="actions">
          <button type="button" class="delete-btn" data-id="${p.id}">Видалити</button>
        </td>
      </tr>
    `;
  }).join("");
}

function resetForm() {
  dom.userNameInput.value = "";
  dom.reasonSelect.value = "";
  dom.validDateInput.value = "";
  dom.commentInput.value = "";
  dom.issuerInput.value = "";
  clearErrors();
  dom.userNameInput.focus();
}

function onSubmit(e) {
  e.preventDefault();

  const dto = readForm();
  if (!validate(dto)) return;

  addItem(dto);
  render();
  resetForm(); 
}

function onTableClick(e) {
  const btn = e.target;
  if (!btn.classList.contains("delete-btn")) return;

  const id = Number(btn.dataset.id);
  deleteItem(id);
  render();
}

dom.form.addEventListener("submit", onSubmit);
dom.resetBtn.addEventListener("click", resetForm);

dom.tbody.addEventListener("click", onTableClick);

render();
resetForm();
