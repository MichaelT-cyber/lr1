const state = {
  passes: []
};

const form = document.getElementById("passForm");
const resetBtn = document.getElementById("resetBtn");

const userNameInput = document.getElementById("userNameInput");
const reasonSelect = document.getElementById("reasonSelect");
const validDateInput = document.getElementById("validDateInput");
const commentInput = document.getElementById("commentInput");
const issuerInput = document.getElementById("issuerInput");

const formError = document.getElementById("formError");
const tbody = document.getElementById("passesTbody");

function readForm() {
  return {
    userName: userNameInput.value.trim(),
    reason: reasonSelect.value,
    validDate: validDateInput.value,
    comment: commentInput.value.trim(),
    issuer: issuerInput.value.trim()
  };
}

function validate(dto) {
  formError.textContent = "";

  if (dto.userName === "" || dto.reason === "" || dto.validDate === "" || dto.issuer === "") {
    formError.textContent = "Помилка: заповни всі поля зі зірочкою (*).";
    return false;
  }

  const today = new Date();
  const todayStr = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    .toISOString().slice(0, 10);

  if (dto.validDate < todayStr) {
    formError.textContent = "Помилка: Дата дії пропуску не може бути в минулому.";
    return false;
  }

  return true;
}

function addItem(dto) {
  state.passes.push(dto);
}

function render() {
  const rows = state.passes.map((p, idx) => {
    const comment = p.comment === "" ? "—" : p.comment;
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${p.userName}</td>
        <td>${p.reason}</td>
        <td>${p.validDate}</td>
        <td>${p.issuer}</td>
        <td>${comment}</td>
      </tr>
    `;
  }).join("");

  tbody.innerHTML = rows;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const dto = readForm();
  const ok = validate(dto);

  if (!ok) return;

  addItem(dto);
  render();
});

resetBtn.addEventListener("click", () => {
  userNameInput.value = "";
  reasonSelect.value = "";
  validDateInput.value = "";
  commentInput.value = "";
  issuerInput.value = "";
  formError.textContent = "";
  userNameInput.focus();
});

render();
