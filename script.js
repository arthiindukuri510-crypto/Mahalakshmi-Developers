/* ── CONFIG ── */
const CONFIG = {
  gasUrl: "https://script.google.com/macros/s/AKfycbxVl2u7VHMMQQlYDEYXY_G1ltkO4pyjyzfdXNhidEJaAtTZWC2_RmgkLI8Q4ZyDy-Cm9w/exec",
};

/* ── FIREBASE CONFIG ── */
const firebaseConfig = {
  apiKey: "AIzaSyAKmoaJFihwGHW4kWjDJ_0JFxet5BsLrhk",
  authDomain: "mahalakshmi-project-e41ca.firebaseapp.com",
  projectId: "mahalakshmi-project-e41ca",
  appId: "1:655924461615:web:eea581a3a7bf650c8d06da"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/* ── reCAPTCHA ── */
let recaptchaVisit = null;
let recaptchaRegister = null;

function setupVisitRecaptcha() {
  if (!recaptchaVisit) {
    recaptchaVisit = new firebase.auth.RecaptchaVerifier(
      "recaptcha-visit",
      { size: "normal" }
    );
    recaptchaVisit.render();
  }
}

function setupRegisterRecaptcha() {
  if (!recaptchaRegister) {
    recaptchaRegister = new firebase.auth.RecaptchaVerifier(
      "recaptcha-register",
      { size: "normal" }
    );
    recaptchaRegister.render();
  }
}

/* ── PHONE FORMAT FIX ── */
function formatPhoneNumber(input) {
  let phone = input.trim();
  phone = phone.replace(/\D/g, "");

  if (phone.length === 12 && phone.startsWith("91")) {
    return "+" + phone;
  }

  if (phone.length === 10) {
    return "+91" + phone;
  }

  if (phone.length === 11 && phone.startsWith("0")) {
    return "+91" + phone.substring(1);
  }

  return null;
}

/* ── VALIDATION ── */
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").replace(/^91/, ""));

function cleanPhone(raw) {
  const d = raw.replace(/\D/g, "").replace(/^91/, "");
  return d.length === 10 ? d : null;
}

/* ── SEND OTP ── */
async function sendOtp(formType) {
  const isVisit = formType === "visit";

  const rawInput = document.getElementById(isVisit ? "v-phone" : "r-phone").value;
  const phone = formatPhoneNumber(rawInput);

  const btn = document.getElementById(isVisit ? "vSendOtpBtn" : "rSendOtpBtn");
  btn.classList.add("loading");
  btn.textContent = "Sending OTP…";

  if (!phone) {
    alert("Enter valid phone number");
    btn.classList.remove("loading");
    btn.textContent = "Send OTP & Verify";
    return;
  }

  try {
    // 🔥 create recaptcha only when needed
    if (isVisit) {
      setupVisitRecaptcha();
    } else {
      setupRegisterRecaptcha();
    }

    const verifier = isVisit ? recaptchaVisit : recaptchaRegister;

    const result = await auth.signInWithPhoneNumber(phone, verifier);

    if (isVisit) window.visitConfirmation = result;
    else window.registerConfirmation = result;

    const box = document.getElementById(isVisit ? "visitOtpBox" : "registerOtpBox");
    const phoneEl = document.getElementById(isVisit ? "visitOtpPhone" : "registerOtpPhone");

    phoneEl.textContent = phone;
    box.classList.add("show");
    btn.style.display = "none";

    document.getElementById(isVisit ? "v-otp" : "r-otp").focus();

  } catch (error) {
    console.error("OTP error:", error);
    alert("Could not send OTP: " + error.message);

    btn.classList.remove("loading");
    btn.textContent = "Send OTP & Verify";

    const divId = isVisit ? "recaptcha-visit" : "recaptcha-register";
    document.getElementById(divId).innerHTML = "";

    if (isVisit) recaptchaVisit = null;
    else recaptchaRegister = null;
  }
}

/* ── VERIFY OTP ── */
async function verifyOtpAndSubmit(formType) {
  const isVisit = formType === "visit";
  const code = document.getElementById(isVisit ? "v-otp" : "r-otp").value.trim();
  const result = isVisit ? window.visitConfirmation : window.registerConfirmation;

  if (!code) {
    alert("Enter OTP");
    return;
  }

  try {
    await result.confirm(code);
    alert("OTP Verified ✅");

  } catch (error) {
    alert("Invalid OTP ❌");
  }
}
