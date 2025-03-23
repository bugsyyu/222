// new-discussion.js - 处理发起讨论页面功能

document.addEventListener('DOMContentLoaded', function() {
    // 登录状态检查 - 未登录用户不应该访问此页面
    if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        // 保存当前页面URL，以便登录后重定向回来
        localStorage.setItem('eduwebRedirect', window.location.href);
        
        // 重定向到登录页面
        window.location.href = 'login.html';
        return;
    }

    // 确保所有指向社区的链接直接打开社区页面，不经过loading页面
    document.querySelectorAll('a[href="community.html"], a[href="community-loading.html"]').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'community.html';
        });
    });
    
    // 初始化编辑器工具栏
    setupEditorToolbar();
    
    // 设置表单提交事件
    setupFormSubmission();
    
    // 设置标签输入处理
    setupTagsInput();
});

// 设置编辑器工具栏
function setupEditorToolbar() {
    const formatButtons = document.querySelectorAll('.format-btn');
    const editorTextarea = document.getElementById('discussionContent');
    
    formatButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const selection = editorTextarea.value.substring(
                editorTextarea.selectionStart,
                editorTextarea.selectionEnd
            );
            
            let formattedText = '';
            const btnType = this.title;
            
            // 根据按钮类型执行不同的格式化操作
            switch(btnType) {
                case '粗体':
                    formattedText = `**${selection || '粗体文字'}**`;
                    break;
                case '斜体':
                    formattedText = `*${selection || '斜体文字'}*`;
                    break;
                case '插入链接':
                    const url = prompt('请输入链接地址:', 'https://');
                    const text = selection || '链接文字';
                    formattedText = url ? `[${text}](${url})` : selection;
                    break;
                case '插入代码':
                    formattedText = selection ? `\`\`\`\n${selection}\n\`\`\`` : '```\n代码块\n```';
                    break;
                case '插入图片':
                    const imgUrl = prompt('请输入图片链接:', 'https://');
                    formattedText = imgUrl ? `![图片](${imgUrl})` : selection;
                    break;
                case '插入列表':
                    if (selection) {
                        // 如果有选中文本，为每行添加列表标记
                        const lines = selection.split('\n');
                        formattedText = lines.map(line => `- ${line}`).join('\n');
                    } else {
                        formattedText = '- 列表项1\n- 列表项2\n- 列表项3';
                    }
                    break;
                default:
                    formattedText = selection;
            }
            
            // 在光标位置插入格式化后的文本
            insertAtCursor(editorTextarea, formattedText);
        });
    });
}

// 在光标位置插入文本
function insertAtCursor(input, text) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const scrollTop = input.scrollTop;
    
    input.value = input.value.substring(0, start) + text + input.value.substring(end);
    
    // 恢复光标位置和滚动位置
    input.selectionStart = start + text.length;
    input.selectionEnd = start + text.length;
    input.scrollTop = scrollTop;
    
    // 聚焦输入框
    input.focus();
}

// 设置表单提交处理
function setupFormSubmission() {
    const form = document.getElementById('newDiscussionForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const title = document.getElementById('discussionTitle').value.trim();
            const category = document.getElementById('discussionCategory').value;
            const content = document.getElementById('discussionContent').value.trim();
            const tagsInput = document.getElementById('discussionTags').value.trim();
            
            // 表单验证
            if (!validateForm(title, category, content, tagsInput)) {
                return;
            }
            
            // 处理标签
            const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            
            // 创建要提交的数据对象
            const discussionData = {
                title,
                category,
                content,
                tags,
                author: getCurrentUser(),
                created_at: new Date().toISOString()
            };
            
            // 模拟提交到服务器
            submitDiscussion(discussionData);
        });
    }
}

// 表单验证
function validateForm(title, category, content, tagsInput) {
    let isValid = true;
    
    // 验证标题长度
    if (title.length < 5) {
        showValidationError('discussionTitle', '标题至少需要5个字符');
        isValid = false;
    } else if (title.length > 100) {
        showValidationError('discussionTitle', '标题不能超过100个字符');
        isValid = false;
    } else {
        clearValidationError('discussionTitle');
    }
    
    // 验证分类是否选择
    if (!category) {
        showValidationError('discussionCategory', '请选择一个分类');
        isValid = false;
    } else {
        clearValidationError('discussionCategory');
    }
    
    // 验证内容长度
    if (content.length < 20) {
        showValidationError('discussionContent', '内容至少需要20个字符');
        isValid = false;
    } else {
        clearValidationError('discussionContent');
    }
    
    // 验证标签
    if (tagsInput) {
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (tags.length > 5) {
            showValidationError('discussionTags', '最多添加5个标签');
            isValid = false;
        } else {
            // 检查每个标签的长度
            const invalidTag = tags.find(tag => tag.length > 15);
            if (invalidTag) {
                showValidationError('discussionTags', `标签"${invalidTag}"超过15个字符`);
                isValid = false;
            } else {
                clearValidationError('discussionTags');
            }
        }
    }
    
    return isValid;
}

// 显示表单验证错误
function showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    let errorMessage = formGroup.querySelector('.error-message');
    
    field.classList.add('is-invalid');
    
    if (!errorMessage) {
        errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        formGroup.appendChild(errorMessage);
    }
    
    errorMessage.textContent = message;
}

// 清除表单验证错误
function clearValidationError(fieldId) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    field.classList.remove('is-invalid');
    
    if (errorMessage) {
        formGroup.removeChild(errorMessage);
    }
}

// 设置标签输入处理
function setupTagsInput() {
    const tagsInput = document.getElementById('discussionTags');
    
    if (tagsInput) {
        tagsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // 阻止回车键提交表单
            }
        });
    }
}

// 模拟提交讨论到服务器
function submitDiscussion(discussionData) {
    // 显示提交中状态
    const submitButton = document.querySelector('.btn-submit');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = '提交中...';
    
    // 模拟API请求延迟
    setTimeout(() => {
        // 在实际项目中，这里应该是一个POST请求到后端API
        
        // 模拟成功响应
        console.log('提交的讨论数据:', discussionData);
        
        // 显示成功消息
        if (typeof showMessage === 'function') {
            showMessage('讨论发布成功！', 'success');
        } else {
            alert('讨论发布成功！');
        }
        
        // 重定向到讨论列表页面，从社区相关页面跳转，直接进入社区
        setTimeout(() => {
            window.location.href = 'community.html';
        }, 1500);
        
    }, 1000);
}

// 辅助函数 - 获取当前用户信息
function getCurrentUser() {
    if (typeof localStorage !== 'undefined') {
        const userData = localStorage.getItem('eduwebUser');
        if (userData) {
            return JSON.parse(userData);
        }
    }
    
    // 默认用户信息
    return {
        id: 1,
        name: '当前用户',
        role: 'learner'
    };
}

// 登录状态检查 - 如果auth.js未定义此函数
if (typeof isLoggedIn !== 'function') {
    function isLoggedIn() {
        // 检查localStorage中是否有用户数据
        return localStorage.getItem('eduwebUser') !== null;
    }
} 