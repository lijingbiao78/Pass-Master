// DOM元素
const passwordEl = document.getElementById('password');
const lengthEl = document.getElementById('length');
const lengthValEl = document.getElementById('length-val');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const strengthIndicator = document.getElementById('strength-indicator');
const strengthText = document.getElementById('strength-text');

// 字符集
const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// 更新密码长度显示
lengthEl.addEventListener('input', (e) => {
    lengthValEl.textContent = e.target.value;
});

// 生成密码
generateBtn.addEventListener('click', generatePassword);

// 复制密码
copyBtn.addEventListener('click', () => {
    if (!passwordEl.value) return;
    
    navigator.clipboard.writeText(passwordEl.value)
        .then(() => {
            copyBtn.textContent = '已复制!';
            setTimeout(() => {
                copyBtn.textContent = '复制';
            }, 2000);
        });
});

function generatePassword() {
    let chars = '';
    let password = '';
    
    if (uppercaseEl.checked) chars += UPPERCASE_CHARS;
    if (lowercaseEl.checked) chars += LOWERCASE_CHARS;
    if (numbersEl.checked) chars += NUMBER_CHARS;
    if (symbolsEl.checked) chars += SYMBOL_CHARS;
    
    if (chars === '') {
        alert('请至少选择一个字符类型！');
        return;
    }
    
    const length = lengthEl.value;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    passwordEl.value = password;
    evaluatePasswordStrength(password);
}

function evaluatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    strengthIndicator.className = '';
    if (strength <= 2) {
        strengthIndicator.classList.add('weak');
        strengthText.textContent = '弱';
    } else if (strength <= 4) {
        strengthIndicator.classList.add('medium');
        strengthText.textContent = '中';
    } else {
        strengthIndicator.classList.add('strong');
        strengthText.textContent = '强';
    }
}

// 保存密码记录
document.getElementById('save-btn').addEventListener('click', () => {
    const password = passwordEl.value;
    const usage = document.getElementById('password-usage').value.trim();
    
    if (!password || !usage) {
        alert('请输入密码用途！');
        return;
    }
    
    const history = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        usage: usage,
        password: password,
        passwordPreview: password.substring(0, 3) + '****' + password.substring(password.length - 3)
    };
    
    let histories = JSON.parse(localStorage.getItem('passwordHistories') || '[]');
    histories.unshift(history);
    localStorage.setItem('passwordHistories', JSON.stringify(histories));
    
    document.getElementById('password-usage').value = '';
    renderHistories();
});

function renderHistories() {
    const histories = JSON.parse(localStorage.getItem('passwordHistories') || '[]');
    const historyList = document.getElementById('history-list');
    
    historyList.innerHTML = histories.map(history => `
        <div class="history-item" data-id="${history.id}">
            <div class="date">${history.date}</div>
            <div class="usage">${history.usage}</div>
            <div class="password-preview">${history.passwordPreview}</div>
            <div class="actions">
                <button class="copy-history-btn">复制</button>
                <button class="delete-btn">删除</button>
            </div>
        </div>
    `).join('');
    
    // 添加复制和删除按钮的事件监听
    document.querySelectorAll('.copy-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.history-item').dataset.id;
            const history = histories.find(h => h.id === parseInt(id));
            if (history) {
                navigator.clipboard.writeText(history.password);
                btn.textContent = '已复制!';
                setTimeout(() => btn.textContent = '复制', 2000);
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.history-item').dataset.id);
            const newHistories = histories.filter(h => h.id !== id);
            localStorage.setItem('passwordHistories', JSON.stringify(newHistories));
            renderHistories();
        });
    });
}

// 初始化
generatePassword();
renderHistories(); 