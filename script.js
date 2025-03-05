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
        })
        .catch(err => {
            console.error('复制失败:', err);
        });
});

function formatPassword(password) {
    return password.match(/.{1,4}/g).join(' ');
}

function generatePassword() {
    let chars = '';
    let password = '';
    
    // 构建字符集
    if (uppercaseEl.checked) chars += UPPERCASE_CHARS;
    if (lowercaseEl.checked) chars += LOWERCASE_CHARS;
    if (numbersEl.checked) chars += NUMBER_CHARS;
    if (symbolsEl.checked) chars += SYMBOL_CHARS;
    
    // 验证是否选择了至少一个选项
    if (chars === '') {
        alert('请至少选择一个字符类型！');
        return;
    }
    
    // 生成密码
    const length = lengthEl.value;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    // 显示分段密码
    passwordEl.value = formatPassword(password);
    
    // 更新工具提示
    const tooltip = document.querySelector('.password-tooltip');
    tooltip.textContent = password;
    
    // 评估密码强度
    evaluatePasswordStrength(password);
}

function evaluatePasswordStrength(password) {
    let strength = 0;
    
    // 检查长度
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;
    
    // 检查字符类型
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // 更新强度显示
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

function updatePasswordDisplay(password) {
    passwordEl.style.setProperty('--length', password.length);
    passwordEl.value = password;
}

// 初始生成一个密码
generatePassword();

// 密码历史记录管理
class PasswordHistory {
    constructor() {
        this.histories = this.loadHistories();
        this.initEventListeners();
        this.renderHistories();
    }

    // 加载历史记录
    loadHistories() {
        const histories = localStorage.getItem('passwordHistories');
        return histories ? JSON.parse(histories) : [];
    }

    // 保存历史记录
    saveHistories() {
        localStorage.setItem('passwordHistories', JSON.stringify(this.histories));
    }

    // 添加新记录
    async addHistory(password, usage) {
        const history = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            usage: usage,
            passwordLength: password.length,
            passwordPreview: this.generatePasswordPreview(password),
            password: this.encryptPassword(password)
        };

        this.histories.unshift(history);
        this.saveHistories();
        this.renderHistories();

        // 发送邮件通知
        try {
            await authService.sendPasswordEmail(history);
            alert('密码记录已保存并发送到您的邮箱！');
        } catch (error) {
            alert('邮件发送失败：' + error.message);
        }
    }

    // 生成密码预览（只显示部分字符）
    generatePasswordPreview(password) {
        const length = password.length;
        return `${password.substr(0, 3)}****${password.substr(length-3, 3)}`;
    }

    // 简单的加密方法（实际应用中应使用更安全的加密方式）
    encryptPassword(password) {
        return btoa(password); // 仅作示例，实际使用需要更安全的加密方法
    }

    // 解密密码
    decryptPassword(encrypted) {
        return atob(encrypted); // 仅作示例，实际使用需要更安全的解密方法
    }

    // 删除记录
    deleteHistory(id) {
        this.histories = this.histories.filter(h => h.id !== id);
        this.saveHistories();
        this.renderHistories();
    }

    // 渲染历史记录列表
    renderHistories() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = this.histories.map(history => `
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

        // 添加事件监听
        this.addHistoryItemListeners();
    }

    // 添加历史记录项的事件监听
    addHistoryItemListeners() {
        document.querySelectorAll('.copy-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.history-item').dataset.id);
                const history = this.histories.find(h => h.id === id);
                if (history) {
                    const password = this.decryptPassword(history.password);
                    navigator.clipboard.writeText(password).then(() => {
                        btn.textContent = '已复制!';
                        setTimeout(() => btn.textContent = '复制', 2000);
                    });
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.history-item').dataset.id);
                this.deleteHistory(id);
            });
        });
    }

    // 初始化事件监听
    initEventListeners() {
        const saveBtn = document.getElementById('save-btn');
        const usageInput = document.getElementById('password-usage');

        saveBtn.addEventListener('click', () => {
            const password = document.getElementById('password').value;
            const usage = usageInput.value.trim();

            if (!password || !usage) {
                alert('请输入密码用途！');
                return;
            }

            this.addHistory(password, usage);
            usageInput.value = ''; // 清空输入框
        });
    }
}

// 初始化密码历史记录管理
const passwordHistory = new PasswordHistory(); 