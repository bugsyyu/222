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

    // 角色选择功能
    const roleButtons = document.querySelectorAll('.role-btn');
    if (roleButtons.length > 0) {
        roleButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // 移除所有按钮的active类
                roleButtons.forEach(btn => btn.classList.remove('active'));
                // 给当前点击的按钮添加active类
                this.classList.add('active');
                
                // 存储用户角色选择
                const role = this.getAttribute('data-role');
                document.querySelector('#registerForm').setAttribute('data-selected-role', role);
            });
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

    // 检查用户是否已登录
    checkAuthStatus();

    // 登录状态敏感元素处理
    handleAuthSensitiveElements();
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
            
            // 保存用户信息和token到localStorage
            // 实际项目中应从后端获取这些数据
            saveUserData({
                token: 'mock-jwt-token',
                id: 123,
                name: formData.get('email').split('@')[0],
                email: formData.get('email'),
                role: 'learner',  // 默认角色
                avatar: 'images/default-avatar.svg'
            });
            
            // 检查是否有重定向URL
            const redirectUrl = localStorage.getItem('eduwebRedirect');
            
            setTimeout(() => {
                if (redirectUrl) {
                    // 清除重定向URL
                    localStorage.removeItem('eduwebRedirect');
                    window.location.href = redirectUrl;
                } else {
                    // 没有重定向URL，跳转到首页
                    window.location.href = 'index.html';
                }
            }, 1000);
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

        // 获取所选角色
        const selectedRole = form.getAttribute('data-selected-role') || 'learner';
        
        // 添加角色到表单数据
        const formData = new FormData(form);
        formData.append('role', selectedRole);
        
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

/**
 * 保存用户数据到localStorage
 * @param {Object} userData - 用户数据对象
 */
function saveUserData(userData) {
    localStorage.setItem('eduwebUser', JSON.stringify(userData));
}

/**
 * 获取当前登录用户数据
 * @returns {Object|null} - 返回用户数据对象，未登录则返回null
 */
function getCurrentUser() {
    const userData = localStorage.getItem('eduwebUser');
    return userData ? JSON.parse(userData) : null;
}

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
function isLoggedIn() {
    // 检查用户数据是否存在于localStorage中
    return localStorage.getItem('eduwebUser') !== null;
}

/**
 * 获取当前用户角色
 * @returns {string|null} - 用户角色，未登录则返回null
 */
function getUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

/**
 * 退出登录
 */
function logout() {
    localStorage.removeItem('eduwebUser');
    // 重定向到首页
    window.location.href = 'index.html';
}

/**
 * 检查用户是否有特定权限
 * @param {string|Array} requiredRole - 所需角色或角色数组
 * @returns {boolean} - 是否有权限
 */
function hasPermission(requiredRole) {
    // 如果未登录，无权限
    if (!isLoggedIn()) return false;
    
    const userRole = getUserRole();
    
    // 检查是否有任一所需角色
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
    }
    
    // 检查单一角色
    return userRole === requiredRole;
}

/**
 * 检查是否需要登录才能访问
 * @param {boolean} redirect - 是否在未登录时重定向到登录页面
 * @returns {boolean} - 是否已登录
 */
function requireLogin(redirect = true) {
    const loggedIn = isLoggedIn();
    
    if (!loggedIn && redirect) {
        // 保存当前页面URL以便登录后返回
        localStorage.setItem('eduwebRedirect', window.location.href);
        
        // 显示消息并重定向
        showMessage('请先登录再访问此功能', 'warning');
        
        // 立即跳转到登录页面，不需要延迟
        window.location.href = 'login.html';
        
        return false;
    }
    
    return loggedIn;
}

/**
 * 检查用户认证状态并更新UI
 */
function checkAuthStatus() {
    const isAuthenticated = isLoggedIn();
    const user = getCurrentUser();
    
    // 获取登录/注册按钮和用户头像区域
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        // 检查当前页面
        const currentPage = window.location.pathname.split('/').pop();
        
        // 登录和注册页面不需要修改导航栏
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            return;
        }
        
        // 检查当前页面是否是需要认证的页面
        const restrictedPages = ['profile.html', 'teacher-courses.html', 'dashboard.html', 'course-learn.html', 'notifications.html'];
        const isRestrictedPage = restrictedPages.includes(currentPage);
        
        // 如果是受限页面且未登录，应该已经被重定向，不需要处理
        if (isRestrictedPage && !isAuthenticated) {
            return;
        }
        
        if (isAuthenticated && user) {
            // 用户已登录，显示通知图标和头像
            // 获取未读通知数量 (实际项目中应从服务器获取)
            const unreadCount = getUnreadNotificationsCount();
            const showBadge = unreadCount > 0;
            
            // 确保所有页面包含统一的通知图标和通知数
            authButtons.innerHTML = `
                <a href="notifications.html" class="notification-icon">
                    <i class="bi bi-bell"></i>
                    <span class="notification-badge" ${!showBadge ? 'style="display: none;"' : ''}>${unreadCount}</span>
                </a>
                <a href="profile.html">
                    <img src="${user.avatar}" class="user-avatar" alt="用户头像" onerror="this.src='images/default-avatar.svg'">
                </a>
            `;
            
            // 检查是否为教师角色，显示/隐藏对应元素
            if (user.role === 'teacher') {
                const teacherActions = document.getElementById('teacherActions');
                if (teacherActions) {
                    teacherActions.style.display = 'block';
                }
            }
        } else {
            // 用户未登录，显示登录/注册按钮
            authButtons.innerHTML = `
                <a href="login.html" class="btn btn-login">登录</a>
                <a href="register.html" class="btn btn-register">注册</a>
            `;
            
            // 确保本地存储中没有残留的用户数据
            localStorage.removeItem('eduwebUser');
        }
    }
    
    // 绑定退出登录按钮事件
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

/**
 * 获取用户未读通知数量
 * 实际项目中应从服务器获取
 * @returns {number} - 未读通知数量
 */
function getUnreadNotificationsCount() {
    // 这里是模拟数据，实际项目中应从服务器获取
    const user = getCurrentUser();
    if (!user) return 0;
    
    // 从localStorage获取通知状态，或使用默认值
    const notificationsData = localStorage.getItem('eduwebNotifications');
    if (notificationsData) {
        const data = JSON.parse(notificationsData);
        return data.unreadCount || 0;
    }
    
    // 默认有5个未读通知，与notifications.html页面保持一致
    const defaultNotifications = {
        unreadCount: 5,
        lastChecked: new Date().toISOString()
    };
    localStorage.setItem('eduwebNotifications', JSON.stringify(defaultNotifications));
    return defaultNotifications.unreadCount;
}

/**
 * 处理需要登录后才能使用的UI元素
 */
function handleAuthSensitiveElements() {
    // 处理需要登录的功能按钮
    document.querySelectorAll('[data-require-login="true"]').forEach(element => {
        element.addEventListener('click', function(e) {
            if (!isLoggedIn()) {
                e.preventDefault();
                e.stopPropagation();
                
                // 保存当前页面URL以便登录后返回
                localStorage.setItem('eduwebRedirect', window.location.href);
                
                // 显示消息并重定向
                showMessage('请先登录再访问此功能', 'warning');
                window.location.href = 'login.html';
            }
        });
    });
    
    // 处理需要特定角色的功能
    document.querySelectorAll('[data-require-role]').forEach(element => {
        const requiredRole = element.getAttribute('data-require-role').split(',');
        
        if (!hasPermission(requiredRole)) {
            // 如果不是隐藏元素，则禁用
            if (element.getAttribute('data-permission-action') !== 'hide') {
                element.classList.add('disabled');
                element.setAttribute('disabled', 'disabled');
                element.setAttribute('title', '您没有权限执行此操作');
            } else {
                // 隐藏元素
                element.style.display = 'none';
            }
        }
    });
    
    // 处理课程收藏按钮
    document.querySelectorAll('.btn-favorite').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!isLoggedIn()) {
                e.preventDefault();
                e.stopPropagation();
                
                // 保存当前页面URL以便登录后返回
                localStorage.setItem('eduwebRedirect', window.location.href);
                
                // 显示消息并重定向
                showMessage('请先登录才能收藏课程', 'warning');
                window.location.href = 'login.html';
            }
        });
    });
    
    // 处理评论提交
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            if (!isLoggedIn()) {
                e.preventDefault();
                
                // 保存当前页面URL以便登录后返回
                localStorage.setItem('eduwebRedirect', window.location.href);
                
                // 显示消息并重定向
                showMessage('请先登录才能发表评论', 'warning');
                window.location.href = 'login.html';
            }
        });
    }
    
    // 处理社区发帖按钮
    const newPostBtn = document.querySelector('.new-discussion-btn');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', function(e) {
            if (!isLoggedIn()) {
                e.preventDefault();
                e.stopPropagation();
                
                // 保存当前页面URL以便登录后返回
                localStorage.setItem('eduwebRedirect', window.location.href);
                
                // 显示消息并重定向
                showMessage('请先登录才能发起讨论', 'warning');
                window.location.href = 'login.html';
            }
        });
    }
    
    // 处理讨论详情页的回复按钮
    document.querySelectorAll('.post-reply-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!isLoggedIn()) {
                e.preventDefault();
                e.stopPropagation();
                
                // 保存当前页面URL以便登录后返回
                localStorage.setItem('eduwebRedirect', window.location.href);
                
                // 显示消息并重定向
                showMessage('请先登录才能回复讨论', 'warning');
                window.location.href = 'login.html';
            }
        });
    });
    
    // 课程视频文件上传（教师专用）
    const uploadVideoBtn = document.querySelector('.btn-upload-video');
    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', function(e) {
            if (!hasPermission('teacher')) {
                e.preventDefault();
                showMessage('只有教师可以上传课程视频', 'error');
            }
        });
    }
} 