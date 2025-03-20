document.addEventListener('DOMContentLoaded', function() {
    // 角色选择按钮处理
    const roleButtons = document.querySelectorAll('.role-btn');
    roleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的active类
            roleButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            // 更新隐藏的角色输入
            document.querySelector('input[name="role"]').value = this.dataset.role;
        });
    });

    // 初始化日期选择器
    initializeDateSelectors();
});

function initializeDateSelectors() {
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');

    // 填充月份选项
    const months = [
        "1月", "2月", "3月", "4月", "5月", "6月",
        "7月", "8月", "9月", "10月", "11月", "12月"
    ];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });

    // 填充年份选项（从当前年份往前100年）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year > currentYear - 100; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // 更新日期选项的函数
    function updateDays() {
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);
        const daysInMonth = new Date(year, month, 0).getDate();

        // 保存当前选中的日期
        const currentDay = daySelect.value;
        
        // 清空现有选项
        daySelect.innerHTML = '<option value="">日期</option>';

        // 添加新的日期选项
        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        }

        // 如果之前选中的日期仍然有效，则保持选中
        if (currentDay && currentDay <= daysInMonth) {
            daySelect.value = currentDay;
        }
    }

    // 当月份或年份改变时更新日期选项
    monthSelect.addEventListener('change', updateDays);
    yearSelect.addEventListener('change', updateDays);

    // 初始化日期选项
    updateDays();
}

// 表单验证
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = this;
    const email = form.querySelector('#email').value;
    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;
    const birthdate = {
        month: form.querySelector('#month').value,
        day: form.querySelector('#day').value,
        year: form.querySelector('#year').value
    };

    // 验证邮箱
    if (!isValidEmail(email)) {
        showError('email', '请输入有效的邮箱地址');
        return;
    }

    // 验证用户名
    if (username.length < 3) {
        showError('username', '用户名至少需要3个字符');
        return;
    }

    // 验证密码
    if (!isValidPassword(password)) {
        showError('password', '密码必须包含至少8个字符，包括大小写字母和数字');
        return;
    }

    // 验证生日
    if (!birthdate.month || !birthdate.day || !birthdate.year) {
        showError('birthdate', '请选择完整的出生日期');
        return;
    }

    // 如果验证通过，提交表单
    submitForm(form);
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = field.parentElement.querySelector('.error-message') || 
                    document.createElement('div');
    
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    if (!field.parentElement.querySelector('.error-message')) {
        field.parentElement.appendChild(errorDiv);
    }

    field.classList.add('error');
    
    // 3秒后移除错误消息
    setTimeout(() => {
        errorDiv.remove();
        field.classList.remove('error');
    }, 3000);
}

async function submitForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add('btn-loading');

    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            // 注册成功
            showMessage('注册成功！正在跳转到登录页面...', 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            // 注册失败
            showMessage(data.message || '注册失败，请重试。', 'error');
        }
    } catch (error) {
        showMessage('发生错误，请稍后重试。', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('btn-loading');
    }
}

function showMessage(message, type = 'info') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container message-${type}`;
    messageContainer.textContent = message;

    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.classList.add('message-fade-out');
        setTimeout(() => {
            messageContainer.remove();
        }, 300);
    }, 3000);
} 