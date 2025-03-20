document.addEventListener('DOMContentLoaded', function() {
    // 密码可见性切换
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // 密码强度检查
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            updatePasswordStrength(strength, strengthBar, strengthText);
        });
    }

    // 表单提交处理
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// 密码强度检查函数
function checkPasswordStrength(password) {
    let strength = 0;
    const patterns = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    // 计算强度分数
    strength += patterns.length ? 1 : 0;
    strength += patterns.lowercase ? 1 : 0;
    strength += patterns.uppercase ? 1 : 0;
    strength += patterns.numbers ? 1 : 0;
    strength += patterns.special ? 1 : 0;

    return {
        score: strength,
        patterns: patterns
    };
}

// 更新密码强度显示
function updatePasswordStrength(strength, bar, text) {
    const colors = ['#ff4d4d', '#ffa64d', '#ffff4d', '#4dff4d'];
    const messages = ['弱', '一般', '良好', '强'];
    const score = strength.score;
    
    // 更新强度条
    if (bar) {
        bar.style.width = `${(score / 5) * 100}%`;
        bar.style.backgroundColor = colors[Math.min(score - 1, 3)];
    }
    
    // 更新文字提示
    if (text) {
        text.textContent = score > 0 ? messages[Math.min(score - 1, 3)] : '';
    }
}

// 处理登录表单提交
async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    try {
        // 添加加载状态
        submitButton.classList.add('btn-loading');
        submitButton.disabled = true;

        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // 登录成功
            showMessage('登录成功！', 'success');
            // 重定向到首页或仪表板
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } else {
            // 登录失败
            showMessage(data.message || '登录失败，请检查您的邮箱和密码。', 'error');
        }
    } catch (error) {
        showMessage('发生错误，请稍后重试。', 'error');
    } finally {
        // 移除加载状态
        submitButton.classList.remove('btn-loading');
        submitButton.disabled = false;
    }
}

// 处理注册表单提交
async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // 验证密码匹配
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirm_password').value;
    
    if (password !== confirmPassword) {
        showMessage('两次输入的密码不匹配。', 'error');
        return;
    }

    try {
        // 添加加载状态
        submitButton.classList.add('btn-loading');
        submitButton.disabled = true;

        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // 注册成功
            showMessage('注册成功！', 'success');
            // 重定向到登录页面
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } else {
            // 注册失败
            showMessage(data.message || '注册失败，请检查您的输入。', 'error');
        }
    } catch (error) {
        showMessage('发生错误，请稍后重试。', 'error');
    } finally {
        // 移除加载状态
        submitButton.classList.remove('btn-loading');
        submitButton.disabled = false;
    }
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 检查是否已存在消息容器
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        document.body.appendChild(messageContainer);
    }

    // 创建新消息元素
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;

    // 添加消息到容器
    messageContainer.appendChild(messageElement);

    // 3秒后自动移除消息
    setTimeout(() => {
        messageElement.classList.add('message-fade-out');
        setTimeout(() => {
            messageContainer.removeChild(messageElement);
            // 如果没有其他消息，移除容器
            if (messageContainer.children.length === 0) {
                document.body.removeChild(messageContainer);
            }
        }, 300);
    }, 3000);
}

// 社交登录按钮处理
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.classList.contains('btn-github') ? 'github' : 'google';
        handleSocialLogin(provider);
    });
});

// 处理社交登录
function handleSocialLogin(provider) {
    // 这里添加社交登录的具体实现
    // 通常会重定向到对应的OAuth授权页面
    console.log(`Initiating ${provider} login...`);
} 