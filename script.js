/* ── CONFIG ── */
const CONFIG = {
  gasUrl: "https://script.google.com/macros/s/AKfycbxVl2u7VHMMQQlYDEYXY_G1ltkO4pyjyzfdXNhidEJaAtTZWC2_RmgkLI8Q4ZyDy-Cm9w/exec",
};

/* ── FIREBASE CONFIG — paste your 4 values from Firebase Console ── */
const firebaseConfig = {
  apiKey: "AIzaSyD5vt8hG2v6bWW6aAgjIu6jYuXtOn5mQ7c",
  authDomain: "mahalakshmi-developers.firebaseapp.com",
  projectId: "mahalakshmi-developers",
  appId: "1:622045706494:web:986f023bdcbb23ec8f0daf"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/* ── reCAPTCHA — one for each form ──
   Each form has its own div: recaptcha-visit and recaptcha-register
   These are rendered automatically on page load               */
let recaptchaVisit    = null;
let recaptchaRegister = null;

function initRecaptchas() {
  if (!recaptchaVisit) {
    recaptchaVisit = new firebase.auth.RecaptchaVerifier("recaptcha-visit", {
      size: "normal",
      callback: () => {},
    });
    recaptchaVisit.render();
  }
  if (!recaptchaRegister) {
    recaptchaRegister = new firebase.auth.RecaptchaVerifier("recaptcha-register", {
      size: "normal",
      callback: () => {},
    });
    recaptchaRegister.render();
  }
}

window.addEventListener("load", initRecaptchas);


/* ══════════════════════════════════════════════════════════
   HEADER SCROLL
══════════════════════════════════════════════════════════ */
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 60);
});


/* ══════════════════════════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════════════════════════ */
const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  mobileNav.classList.toggle("open");
});

function closeMobileNav() {
  hamburger.classList.remove("open");
  mobileNav.classList.remove("open");
}


/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in-view");
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));


/* ══════════════════════════════════════════════════════════
   BACK TO TOP
══════════════════════════════════════════════════════════ */
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 400);
});


/* ══════════════════════════════════════════════════════════
   VISIT FORM — toggle date field
══════════════════════════════════════════════════════════ */
function toggleVisitDate() {
  const val = document.getElementById("v-visit").value;
  document.getElementById("dateGroup").style.display = val === "yes" ? "block" : "none";
  document.getElementById("onlineMsg").style.display = val === "no"  ? "flex"  : "none";
}


/* ══════════════════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════════════════ */
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").replace(/^91/, ""));

function cleanPhone(raw) {
  const d = raw.replace(/\D/g, "").replace(/^91/, "");
  return d.length === 10 ? d : null;
}

function setError(inputId, hasError) {
  const grp = document.getElementById(inputId)?.closest(".form-group");
  if (grp) grp.classList.toggle("error", hasError);
}

function validateVisitFields() {
  const name  = document.getElementById("v-name").value.trim();
  const email = document.getElementById("v-email").value.trim();
  const phone = document.getElementById("v-phone").value.trim();
  const plan  = document.getElementById("v-plan").value;
  const visit = document.getElementById("v-visit").value;
  const date  = document.getElementById("v-date").value;

  let ok = true;
  setError("v-name",  !name);               if (!name)               ok = false;
  setError("v-email", !isValidEmail(email)); if (!isValidEmail(email)) ok = false;
  setError("v-phone", !isValidPhone(phone)); if (!isValidPhone(phone)) ok = false;
  setError("v-plan",  !plan);               if (!plan)               ok = false;
  if (visit === "yes") { setError("v-date", !date); if (!date) ok = false; }
  return ok;
}

function validateRegisterFields() {
  const name  = document.getElementById("r-name").value.trim();
  const email = document.getElementById("r-email").value.trim();
  const phone = document.getElementById("r-phone").value.trim();
  const plan  = document.getElementById("r-plan").value;

  let ok = true;
  setError("r-name",  !name);               if (!name)               ok = false;
  setError("r-email", !isValidEmail(email)); if (!isValidEmail(email)) ok = false;
  setError("r-phone", !isValidPhone(phone)); if (!isValidPhone(phone)) ok = false;
  setError("r-plan",  !plan);               if (!plan)               ok = false;
  return ok;
}


/* ══════════════════════════════════════════════════════════
   SEND OTP
══════════════════════════════════════════════════════════ */
async function sendOtp(formType) {
  const isVisit = formType === "visit";

  if (isVisit  && !validateVisitFields())    return;
  if (!isVisit && !validateRegisterFields()) return;

  const raw   = document.getElementById(isVisit ? "v-phone" : "r-phone").value;
  const phone = "+91" + raw.replace(/\D/g, "").slice(-10);

  const btn = document.getElementById(isVisit ? "vSendOtpBtn" : "rSendOtpBtn");
  btn.classList.add("loading");
  btn.textContent = "Sending OTP…";

  try {
    const verifier = isVisit ? recaptchaVisit : recaptchaRegister;
    const result   = await auth.signInWithPhoneNumber(phone, verifier);

    // Save confirmation result for this form
    if (isVisit) window.visitConfirmation = result;
    else         window.registerConfirmation = result;

    // Show OTP input box
    const box     = document.getElementById(isVisit ? "visitOtpBox"   : "registerOtpBox");
    const phoneEl = document.getElementById(isVisit ? "visitOtpPhone" : "registerOtpPhone");
    phoneEl.textContent = phone;
    box.classList.add("show");
    btn.style.display = "none";

    // Focus OTP input
    document.getElementById(isVisit ? "v-otp" : "r-otp").focus();

  } catch (error) {
    console.error("OTP error:", error);
    alert("Could not send OTP: " + error.message);
    btn.classList.remove("loading");
    btn.textContent = "Send OTP & Verify";

    // Reset recaptcha so user can try again
    const divId = isVisit ? "recaptcha-visit" : "recaptcha-register";
    document.getElementById(divId).innerHTML = "";
    if (isVisit) { recaptchaVisit = null;    }
    else         { recaptchaRegister = null; }
    initRecaptchas();
  }
}


/* ══════════════════════════════════════════════════════════
   VERIFY OTP & SUBMIT
══════════════════════════════════════════════════════════ */
async function verifyOtpAndSubmit(formType) {
  const isVisit = formType === "visit";
  const code    = document.getElementById(isVisit ? "v-otp" : "r-otp").value.trim();
  const errEl   = document.getElementById(isVisit ? "visitOtpErr" : "registerOtpErr");
  const result  = isVisit ? window.visitConfirmation : window.registerConfirmation;

  if (!code) {
    errEl.textContent = "Please enter the OTP.";
    errEl.classList.add("show");
    return;
  }

  try {
    await result.confirm(code);   // Firebase checks the OTP
    errEl.classList.remove("show");
    isVisit ? await submitVisit() : await submitRegister();

  } catch (error) {
    errEl.textContent = "Incorrect OTP. Please try again.";
    errEl.classList.add("show");
    document.getElementById(isVisit ? "v-otp" : "r-otp").value = "";
    document.getElementById(isVisit ? "v-otp" : "r-otp").focus();
  }
}


/* ══════════════════════════════════════════════════════════
   VISIT FORM — submit to Google Sheet
══════════════════════════════════════════════════════════ */
async function submitVisit() {
  const name   = document.getElementById("v-name").value.trim();
  const email  = document.getElementById("v-email").value.trim();
  const phone  = cleanPhone(document.getElementById("v-phone").value);
  const plan   = document.getElementById("v-plan").options[document.getElementById("v-plan").selectedIndex].text;
  const choice = document.getElementById("v-visit").value;
  const date   = document.getElementById("v-date").value || "Online enquiry";
  const time   = new Date().toLocaleString("en-IN");

  try {
    await fetch(CONFIG.gasUrl, {
      method : "POST",
      mode   : "no-cors",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ formType: "visit", name, email, phone, plan, choice, date, submittedAt: time }),
    });
  } catch (e) { console.warn("Sheet error:", e); }

  // Hide OTP box, show success
  document.getElementById("visitOtpBox").classList.remove("show");
  const success = document.getElementById("visitSuccess");
  success.classList.add("show");
  success.scrollIntoView({ behavior: "smooth", block: "center" });

  // Reset
  document.getElementById("visitForm").reset();
  document.getElementById("dateGroup").style.display = "none";
  document.getElementById("onlineMsg").style.display = "none";
  const btn = document.getElementById("vSendOtpBtn");
  btn.style.display = "";
  btn.classList.remove("loading");
  btn.textContent = "Send OTP & Verify";
}


/* ══════════════════════════════════════════════════════════
   REGISTER FORM — submit to Google Sheet
══════════════════════════════════════════════════════════ */
async function submitRegister() {
  const name   = document.getElementById("r-name").value.trim();
  const email  = document.getElementById("r-email").value.trim();
  const phone  = cleanPhone(document.getElementById("r-phone").value);
  const plan   = document.getElementById("r-plan").options[document.getElementById("r-plan").selectedIndex].text;
  const source = document.getElementById("r-source").value || "Not specified";
  const msg    = document.getElementById("r-msg").value.trim() || "None";
  const time   = new Date().toLocaleString("en-IN");

  try {
    await fetch(CONFIG.gasUrl, {
      method : "POST",
      mode   : "no-cors",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ formType: "register", name, email, phone, plan, source, message: msg, submittedAt: time }),
    });
  } catch (e) { console.warn("Sheet error:", e); }

  // Hide OTP box, show success
  document.getElementById("registerOtpBox").classList.remove("show");
  const success = document.getElementById("registerSuccess");
  success.classList.add("show");
  success.scrollIntoView({ behavior: "smooth", block: "center" });

  // Reset
  document.getElementById("registerForm").reset();
  const btn = document.getElementById("rSendOtpBtn");
  btn.style.display = "";
  btn.classList.remove("loading");
  btn.textContent = "Send OTP & Verify";
}
