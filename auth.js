// 首先需要引入 EmailJS SDK
// <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

class AuthService {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
        this.initEmailJS();
    }

    // 初始化 EmailJS
    initEmailJS() {
        emailjs.init("YOUR_PUBLIC_KEY"); // 需要替换成你的 EmailJS public key
    }

    // 加载用户数据
    loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    // 保存用户数据
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // 加载当前用户
    loadCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    // 保存当前用户
    saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    // 注册
    register(username, email, password) {
        // 检查邮箱是否已注册
        if (this.users.some(user => user.email === email)) {
            throw new Error('该邮箱已被注册');
        }

        const user = {
            id: Date.now(),
            username,
            email,
            password: this.hashPassword(password), // 实际应用中使用更安全的加密方式
            passwordHistories: []
        };

        this.users.push(user);
        this.saveUsers();
        this.saveCurrentUser(user);

        return user;
    }

    // 登录
    login(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('邮箱或密码错误');
        }

        this.saveCurrentUser(user);
        return user;
    }

    // 登出
    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    // 发送密码记录邮件
    async sendPasswordEmail(passwordRecord) {
        if (!this.currentUser) {
            throw new Error('请先登录');
        }

        const templateParams = {
            to_email: this.currentUser.email,
            to_name: this.currentUser.username,
            password_usage: passwordRecord.usage,
            password_preview: passwordRecord.passwordPreview,
            created_date: passwordRecord.date
        };

        try {
            await emailjs.send(
                "YOUR_SERVICE_ID", // 需要替换成你的 EmailJS service ID
                "YOUR_TEMPLATE_ID", // 需要替换成你的 EmailJS template ID
                templateParams
            );
            return true;
        } catch (error) {
            console.error("发送邮件失败:", error);
            throw error;
        }
    }

    // 简单的密码加密（实际应用中使用更安全的方式）
    hashPassword(password) {
        return btoa(password);
    }
}

// 初始化认证服务
const authService = new AuthService();

// 处理注册表单提交
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            await authService.register(username, email, password);
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

// 处理登录表单提交
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            await authService.login(email, password);
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        }
    });
} 