
// helper: get element by id
const $ = id => document.getElementById(id);

/* -------------------- Element references (may be null) -------------------- */
const overlay = $('overlay');
const modalCard = $('modalCard');
const openSignBtn = $('openSignBtn');
const modalClose = $('modalClose');
const signInView = $('signInView');
const createView = $('createView');
const toCreateLink = $('toCreateLink');
const toSignInLink = $('toSignInLink');

const isUser = $('isUser');
const isAdmin = $('isAdmin');
const userFields = $('userFields');
const adminFields = $('adminFields');

const createSubmit = $('createSubmit');

/* IDs to observe for realtime validation */
const realtimeIds = [
  'firstName','lastName','cuEmail','age','gender',
  'adminLast','employeeId','cuPassword','cuPassword2','agree'
];

/* -------------------- Small helpers -------------------- */
function showFieldError(errId, message) {
  const el = $(errId);
  if (el) el.textContent = message;
}
function clearAllErrors() {
  document.querySelectorAll('.error-text').forEach(e => e.textContent = '');
  document.querySelectorAll('.invalid').forEach(i => i.classList.remove('invalid'));
  document.querySelectorAll('.valid').forEach(i => i.classList.remove('valid'));
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function modalShake(){
  if (!modalCard) return;
  modalCard.classList.remove('shake');
  void modalCard.offsetWidth; // force reflow to restart animation
  modalCard.classList.add('shake');
}

/* -------------------- Modal open/close -------------------- */
if (openSignBtn) openSignBtn.addEventListener('click', () => openModal('signin'));
if (modalClose) modalClose.addEventListener('click', closeModal);
if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function openModal(mode = 'signin') {
  if (!overlay) return;
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
  if (mode === 'signin') showSignIn();
  else showCreate();
}

function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden','true');
  resetCreateChecks();
  clearAllErrors();
}

/* -------------------- Views (Sign In / Create) -------------------- */
if (toCreateLink) toCreateLink.addEventListener('click', e => { e.preventDefault(); showCreate(); });
if (toSignInLink) toSignInLink.addEventListener('click', e => { e.preventDefault(); showSignIn(); });

function showSignIn(){
  if (signInView) signInView.classList.remove('hidden');
  if (createView) createView.classList.add('hidden');
  const title = $('modalTitle'); if (title) title.textContent = "Sign In";
  clearSignInErrors();
}

function showCreate(){
  if (signInView) signInView.classList.add('hidden');
  if (createView) createView.classList.remove('hidden');
  const title = $('modalTitle'); if (title) title.textContent = "Create Account";
  if (isUser && isAdmin && !isUser.checked && !isAdmin.checked) isUser.checked = true;
  updateAccountFields();
  validateCreateForm();
}

/* -------------------- User / Admin toggle logic -------------------- */
if (isUser) isUser.addEventListener('change', () => { if (isUser.checked && isAdmin) isAdmin.checked = false; updateAccountFields(); validateCreateForm(); });
if (isAdmin) isAdmin.addEventListener('change', () => { if (isAdmin.checked && isUser) isUser.checked = false; updateAccountFields(); validateCreateForm(); });

function updateAccountFields(){
  if (!userFields || !adminFields) return;
  if (isAdmin && isAdmin.checked) {
    adminFields.classList.remove('hidden');
    userFields.classList.add('hidden');
  } else {
    adminFields.classList.add('hidden');
    userFields.classList.remove('hidden');
  }
}
function resetCreateChecks(){
  if (!isUser || !isAdmin) return;
  isUser.checked = true;
  isAdmin.checked = false;
  updateAccountFields();
}

/* -------------------- Real-time listeners -------------------- */
realtimeIds.forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', () => validateCreateForm());
  el.addEventListener('change', () => validateCreateForm());
});

/* sign-in inputs clear errors while typing */
['siEmail','siPassword'].forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', () => {
    const err = $('err-' + id);
    if (err) err.textContent = '';
    el.classList.remove('invalid');
  });
});

/* -------------------- Sign In submit (basic demo + redirect) -------------------- */
const signInSubmit = $('signInSubmit');
if (signInSubmit) signInSubmit.addEventListener('click', () => {
  clearSignInErrors();
  const emEl = $('siEmail'), pwEl = $('siPassword');
  const em = emEl ? emEl.value.trim() : '';
  const pw = pwEl ? pwEl.value.trim() : '';
  let ok = true;
  if (!em) { if (emEl) emEl.classList.add('invalid'); showFieldError('err-siEmail','Please enter email.'); ok = false; }
  if (!pw) { if (pwEl) pwEl.classList.add('invalid'); showFieldError('err-siPassword','Please enter password.'); ok = false; }
  if (!ok) { modalShake(); return; }

  // demo success -> redirect to homepage; replace with server auth in production
  window.location.href = "index.html";
});

function clearSignInErrors(){
  showFieldError('err-siEmail','');
  showFieldError('err-siPassword','');
  if ($('siEmail')) $('siEmail').classList.remove('invalid');
  if ($('siPassword')) $('siPassword').classList.remove('invalid');
}

/* -------------------- Create submit & validation -------------------- */
if (createSubmit) {
  createSubmit.addEventListener('click', (e) => {
    clearAllErrors();
    const valid = validateCreateForm();
    if (!valid) {
      modalShake();
      const firstInvalid = document.querySelector('.input.invalid, .input-small.invalid, select.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // demo: account created. Ask if user wants to auto-login
    const wantsLogin = confirm("Account created successfully! Do you want to login automatically?");
    if (wantsLogin) {
      // You can differentiate admin/user if desired:
      // const redirectUrl = (isAdmin && isAdmin.checked) ? 'admin-dashboard.html' : 'index.html';
      window.location.href = "index.html";
    } else {
      closeModal();
    }
  });
}

/* -------------------- Form validation function -------------------- */
function validateCreateForm(){
  clearAllErrors();

  const isAdminAcc = isAdmin && isAdmin.checked;
  const isUserAcc = !isAdminAcc;
  let valid = true;

  const pw1 = ($('cuPassword') ? $('cuPassword').value.trim() : '');
  const pw2 = ($('cuPassword2') ? $('cuPassword2').value.trim() : '');

  // USER fields
  if (isUserAcc) {
    const first = $('firstName') ? $('firstName').value.trim() : '';
    const last = $('lastName') ? $('lastName').value.trim() : '';
    const email = $('cuEmail') ? $('cuEmail').value.trim() : '';
    const ageVal = $('age') ? $('age').value.trim() : '';
    const gender = $('gender') ? $('gender').value : '';

    if (!first) { showFieldError('err-firstName','Please enter your first name.'); if ($('firstName')) $('firstName').classList.add('invalid'); valid = false; }
    if (!last) { showFieldError('err-lastName','Please enter your last name.'); if ($('lastName')) $('lastName').classList.add('invalid'); valid = false; }
    if (!email) { showFieldError('err-cuEmail','Please enter your email.'); if ($('cuEmail')) $('cuEmail').classList.add('invalid'); valid = false; }
    else if (!validateEmail(email)) { showFieldError('err-cuEmail','Please enter a valid email.'); if ($('cuEmail')) $('cuEmail').classList.add('invalid'); valid = false; }

    if (!ageVal) { showFieldError('err-age','Please enter your age.'); if ($('age')) $('age').classList.add('invalid'); valid = false; }
    else {
      const ageNum = Number(ageVal);
      if (Number.isNaN(ageNum)) { showFieldError('err-age','Please enter a valid age.'); if ($('age')) $('age').classList.add('invalid'); valid = false; }
      else if (ageNum < 18) { showFieldError('err-age','You must be 18 years or older.'); if ($('age')) $('age').classList.add('invalid'); valid = false; }
    }

    if (!gender) { showFieldError('err-gender','Please select gender.'); if ($('gender')) $('gender').classList.add('invalid'); valid = false; }
    else if (!(gender === 'Male' || gender === 'Female')) { showFieldError('err-gender','Please select Male or Female.'); if ($('gender')) $('gender').classList.add('invalid'); valid = false; }
  }

  // ADMIN fields
  if (isAdminAcc) {
    const adminLast = $('adminLast') ? $('adminLast').value.trim() : '';
    const employeeId = $('employeeId') ? $('employeeId').value.trim() : '';
    if (!adminLast) { showFieldError('err-adminLast','Please enter last name.'); if ($('adminLast')) $('adminLast').classList.add('invalid'); valid = false; }
    if (!employeeId) { showFieldError('err-employeeId','Please enter employee ID.'); if ($('employeeId')) $('employeeId').classList.add('invalid'); valid = false; }
  }

  // Password checks (both types)
  if (!pw1) { showFieldError('err-cuPassword','Please enter password.'); if ($('cuPassword')) $('cuPassword').classList.add('invalid'); valid = false; }
  if (!pw2) { showFieldError('err-cuPassword2','Please confirm password.'); if ($('cuPassword2')) $('cuPassword2').classList.add('invalid'); valid = false; }
  if (pw1 && pw1.length < 8) { showFieldError('err-cuPassword','Password must be at least 8 characters.'); if ($('cuPassword')) $('cuPassword').classList.add('invalid'); valid = false; }
  if (pw1 && pw2 && pw1 !== pw2) { showFieldError('err-cuPassword2','Passwords do not match.'); if ($('cuPassword2')) $('cuPassword2').classList.add('invalid'); valid = false; }

  const agreeChecked = $('agree') ? $('agree').checked : false;
  if (!agreeChecked) { showFieldError('err-cuPassword2','You must agree to Terms & Privacy.'); valid = false; }

  if (createSubmit) createSubmit.disabled = !valid;
  return valid;
}

/* -------------------- Show/Hide toggles for password fields -------------------- */
(function attachPwToggles(){
  const buttons = document.querySelectorAll('.toggle-pw');
  if (!buttons || buttons.length === 0) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = $(targetId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
        btn.setAttribute('aria-pressed','true');
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
        btn.setAttribute('aria-pressed','false');
      }
    });
  });
})();

/* -------------------- Init -------------------- */
resetCreateChecks && resetCreateChecks();
validateCreateForm && validateCreateForm();
