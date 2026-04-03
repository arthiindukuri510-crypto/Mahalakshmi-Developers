'use strict';

// ── Your Google Apps Script Web App URL ──
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxVl2u7VHMMQQlYDEYXY_G1ltkO4pyjyzfdXNhidEJaAtTZWC2_RmgkLI8Q4ZyDy-Cm9w/exec';

/* ══════════════════════════════════════════
   VALIDATION FUNCTIONS
══════════════════════════════════════════ */

/**
 * EMAIL VALIDATION
 * Rules:
 *  - Standard format: local@domain.tld
 *  - No spaces, no consecutive dots
 *  - Domain must have at least one dot
 *  - TLD must be 2–10 characters
 *  - No special chars except . _ % + - in local part
 */
function validateEmail(email) {
  email = email.trim();
  if (!email) return { valid: false, msg: 'Email address is required.' };

  // No spaces allowed
  if (/\s/.test(email)) return { valid: false, msg: 'Email must not contain spaces.' };

  // No consecutive dots
  if (/\.\./.test(email)) return { valid: false, msg: 'Email must not contain consecutive dots.' };

  // Full RFC-style regex
  const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+\-]*@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,10}$/;
  if (!emailRegex.test(email)) return { valid: false, msg: 'Please enter a valid email (e.g. name@gmail.com).' };

  // Local part cannot start or end with a dot
  const local = email.split('@')[0];
  if (local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, msg: 'Email local part cannot start or end with a dot.' };
  }

  return { valid: true, msg: '' };
}

/**
 * PHONE VALIDATION
 * Rules:
 *  - Strips spaces, dashes, dots, parentheses, +91 / 0 prefix
 *  - Must be exactly 10 digits after stripping
 *  - First digit must be 6, 7, 8, or 9 (valid Indian mobile)
 *  - Cannot be all same digits (e.g. 9999999999)
 */
function validatePhone(phone) {
  if (!phone.trim()) return { valid: false, msg: 'Phone number is required.' };

  // Strip allowed formatting characters
  let cleaned = phone.trim()
    .replace(/[\s\-().]/g, '')   // remove spaces, dashes, dots, brackets
    .replace(/^\+91/, '')         // remove +91 prefix
    .replace(/^91(?=\d{10}$)/, '') // remove 91 if followed by exactly 10 digits
    .replace(/^0/, '');            // remove leading 0

  // Must be exactly 10 digits now
  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, msg: 'Enter a valid 10-digit Indian mobile number.' };
  }

  // First digit must be 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, msg: 'Mobile number must start with 6, 7, 8, or 9.' };
  }

  // Cannot be all same digits
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return { valid: false, msg: 'Please enter a real phone number.' };
  }

  return { valid: true, msg: '' };
}


/* ══════════════════════════════════════════
   ERROR DISPLAY HELPERS
══════════════════════════════════════════ */

function setError(id, hasError, customMsg) {
  const el    = document.getElementById(id);
  const group = el.closest('.form-group');
  const errEl = group.querySelector('.err-msg');

  group.classList.toggle('error', hasError);

  if (hasError && customMsg && errEl) {
    errEl.textContent = customMsg;
  }
  return hasError;
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.closest('.form-group').classList.remove('error');
}


/* ══════════════════════════════════════════
   REAL-TIME VALIDATION ON INPUT
   (shows feedback as user types / leaves field)
══════════════════════════════════════════ */

function attachRealtimeValidation(inputId, type) {
  const el = document.getElementById(inputId);
  if (!el) return;

  // Validate on blur (when user leaves field)
  el.addEventListener('blur', () => {
    if (type === 'email') {
      const result = validateEmail(el.value);
      setError(inputId, !result.valid, result.msg);
    } else if (type === 'phone') {
      const result = validatePhone(el.value);
      setError(inputId, !result.valid, result.msg);
    }
  });

  // Clear error as user types (after an error was shown)
  el.addEventListener('input', () => {
    const group = el.closest('.form-group');
    if (group.classList.contains('error')) {
      if (type === 'email') {
        const result = validateEmail(el.value);
        if (result.valid) clearError(inputId);
      } else if (type === 'phone') {
        const result = validatePhone(el.value);
        if (result.valid) clearError(inputId);
      }
    }
  });
}

// Attach real-time validation to all email and phone fields
attachRealtimeValidation('v-email', 'email');
attachRealtimeValidation('v-phone', 'phone');
attachRealtimeValidation('r-email', 'email');
attachRealtimeValidation('r-phone', 'phone');


/* ══════════════════════════════════════════
   CLEAR ERRORS ON INPUT (all fields)
══════════════════════════════════════════ */
document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
  el.addEventListener('input', () => {
    // Only clear for non-email/phone fields (those have custom logic above)
    const id = el.id;
    if (!['v-email','v-phone','r-email','r-phone'].includes(id)) {
      el.closest('.form-group').classList.remove('error');
    }
  });
});


/* ══════════════════════════════════════════
   STICKY HEADER
══════════════════════════════════════════ */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});


/* ══════════════════════════════════════════
   MOBILE NAVIGATION
══════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}


/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Fallback: force all reveals after 1.5s
setTimeout(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
}, 1500);


/* ══════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════ */
const btt = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  btt.classList.toggle('show', window.scrollY > 400);
});
btt.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ══════════════════════════════════════════
   VISIT DATE TOGGLE
══════════════════════════════════════════ */
function toggleVisitDate() {
  const sel       = document.getElementById('v-visit');
  const dateGroup = document.getElementById('dateGroup');
  const onlineMsg = document.getElementById('onlineMsg');

  if (sel.value === 'yes') {
    dateGroup.style.display = 'block';
    onlineMsg.style.display = 'none';
  } else if (sel.value === 'no') {
    dateGroup.style.display = 'none';
    onlineMsg.style.display = 'flex';
  } else {
    dateGroup.style.display = 'none';
    onlineMsg.style.display = 'none';
  }
}


/* ══════════════════════════════════════════
   VISIT FORM SUBMISSION
══════════════════════════════════════════ */
function submitVisitForm(e) {
  e.preventDefault();
  let hasErrors = false;

  const name     = document.getElementById('v-name');
  const email    = document.getElementById('v-email');
  const phone    = document.getElementById('v-phone');
  const plan     = document.getElementById('v-plan');
  const visitSel = document.getElementById('v-visit');
  const date     = document.getElementById('v-date');

  // Name
  if (!name.value.trim()) {
    hasErrors = setError('v-name', true, 'Please enter your full name.') || true;
  } else {
    setError('v-name', false);
  }

  // Email — enhanced validation
  const emailResult = validateEmail(email.value);
  if (!emailResult.valid) {
    hasErrors = setError('v-email', true, emailResult.msg) || true;
  } else {
    setError('v-email', false);
  }

  // Phone — enhanced validation
  const phoneResult = validatePhone(phone.value);
  if (!phoneResult.valid) {
    hasErrors = setError('v-phone', true, phoneResult.msg) || true;
  } else {
    setError('v-phone', false);
  }

  // Plan
  if (!plan.value) {
    hasErrors = setError('v-plan', true, 'Please select an investment plan.') || true;
  } else {
    setError('v-plan', false);
  }

  // Date (only if visit = yes)
  if (visitSel.value === 'yes' && !date.value) {
    hasErrors = setError('v-date', true, 'Please select your preferred visit date.') || true;
  } else {
    setError('v-date', false);
  }

  if (hasErrors) return;

  const btn = document.querySelector('#visitForm .btn-submit');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  var url = APPS_SCRIPT_URL
    + '?formType=visit'
    + '&name='      + encodeURIComponent(name.value.trim())
    + '&email='     + encodeURIComponent(email.value.trim())
    + '&phone='     + encodeURIComponent(phone.value.trim())
    + '&plan='      + encodeURIComponent(plan.options[plan.selectedIndex].text)
    + '&wantVisit=' + encodeURIComponent(visitSel.value === 'yes' ? 'Yes' : 'No')
    + '&visitDate=' + encodeURIComponent(date.value || 'N/A');

  var img = new Image();
  img.src = url;

  setTimeout(() => {
    btn.textContent = 'Submitted ✓';
    btn.style.background = 'linear-gradient(135deg, #2d6a4f, #40916c)';
    document.getElementById('visitForm')
      .querySelectorAll('input, select, textarea, button')
      .forEach(el => el.disabled = true);
    const s = document.getElementById('visitSuccess');
    s.classList.add('show');
    s.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 2000);
}


/* ══════════════════════════════════════════
   REGISTER FORM SUBMISSION
══════════════════════════════════════════ */
function submitRegisterForm(e) {
  e.preventDefault();
  let hasErrors = false;

  const name  = document.getElementById('r-name');
  const email = document.getElementById('r-email');
  const phone = document.getElementById('r-phone');
  const plan  = document.getElementById('r-plan');
  const msg   = document.getElementById('r-msg');

  // Name
  if (!name.value.trim()) {
    hasErrors = setError('r-name', true, 'Please enter your full name.') || true;
  } else {
    setError('r-name', false);
  }

  // Email — enhanced validation
  const emailResult = validateEmail(email.value);
  if (!emailResult.valid) {
    hasErrors = setError('r-email', true, emailResult.msg) || true;
  } else {
    setError('r-email', false);
  }

  // Phone — enhanced validation
  const phoneResult = validatePhone(phone.value);
  if (!phoneResult.valid) {
    hasErrors = setError('r-phone', true, phoneResult.msg) || true;
  } else {
    setError('r-phone', false);
  }

  // Plan
  if (!plan.value) {
    hasErrors = setError('r-plan', true, 'Please select a plan.') || true;
  } else {
    setError('r-plan', false);
  }

  if (hasErrors) return;

  const btn = document.querySelector('#registerForm .btn-submit');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  var url = APPS_SCRIPT_URL
    + '?formType=register'
    + '&name='    + encodeURIComponent(name.value.trim())
    + '&email='   + encodeURIComponent(email.value.trim())
    + '&phone='   + encodeURIComponent(phone.value.trim())
    + '&plan='    + encodeURIComponent(plan.options[plan.selectedIndex].text)
    + '&message=' + encodeURIComponent(msg.value.trim());

  var img = new Image();
  img.src = url;

  setTimeout(() => {
    btn.textContent = 'Submitted ✓';
    btn.style.background = 'linear-gradient(135deg, #2d6a4f, #40916c)';
    document.getElementById('registerForm')
      .querySelectorAll('input, select, textarea, button')
      .forEach(el => el.disabled = true);
    const s = document.getElementById('registerSuccess');
    s.classList.add('show');
    s.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 2000);
}


/* ══════════════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ══════════════════════════════════════════
   ACTIVE NAV LINK HIGHLIGHTING
══════════════════════════════════════════ */
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));


/* ══════════════════════════════════════════
   PLAN CARD TILT EFFECT
══════════════════════════════════════════ */
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    card.style.transform = `perspective(800px) rotateX(${-(y/rect.height)*6}deg) rotateY(${(x/rect.width)*6}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => card.style.transition = '', 500);
  });
});


/* ══════════════════════════════════════════
   GALLERY LIGHTBOX
══════════════════════════════════════════ */
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
    document.head.appendChild(style);
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;animation:fadeIn 0.25s ease;';
    const image = document.createElement('img');
    image.src = img.src;
    image.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:8px;object-fit:contain;';
    overlay.appendChild(image);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => { overlay.remove(); style.remove(); });
  });
});


/* ══════════════════════════════════════════
   SET MINIMUM DATE FOR VISIT
══════════════════════════════════════════ */
const dateInput = document.getElementById('v-date');
if (dateInput) {
  const t = new Date();
  dateInput.min = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}


console.log('%cMahalakshmi Developers', 'color:#C8960C;font-size:18px;font-weight:bold;font-family:serif;');
console.log('%cRed Sandalwood Farm Investment — Built with ❤️', 'color:#8B1A1A;font-size:12px;');