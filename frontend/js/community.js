// community.js - 处理社区页面功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面功能
    setupNewDiscussionButton();
    setupTopicFilters();
});

// 设置"发起讨论"按钮功能
function setupNewDiscussionButton() {
    const newDiscussionBtn = document.querySelector('.new-discussion-btn');
    
    if (newDiscussionBtn) {
        newDiscussionBtn.addEventListener('click', function(e) {
            // 检查用户是否已登录
            if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
                e.preventDefault(); // 阻止默认跳转行为
                
                // 显示登录提示弹窗
                showLoginDialog('发起讨论需要先登录', '请登录后再发布新讨论');
                
                // 存储用户想要访问的页面，登录后可以重定向回来
                localStorage.setItem('eduwebRedirect', 'new-discussion.html');
            }
            // 如果用户已登录，则按默认行为跳转到发起讨论页面
        });
    }
}

// 显示登录提示弹窗
function showLoginDialog(title, message) {
    // 创建弹窗元素
    const dialog = document.createElement('div');
    dialog.className = 'login-dialog-overlay';
    
    dialog.innerHTML = `
        <div class="login-dialog">
            <div class="login-dialog-header">
                <h3>${title}</h3>
                <button class="login-dialog-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="login-dialog-content">
                <p>${message}</p>
            </div>
            <div class="login-dialog-footer">
                <a href="login.html" class="btn btn-primary">登录</a>
                <a href="register.html" class="btn btn-secondary">注册</a>
                <button class="btn btn-text login-dialog-cancel">取消</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(dialog);
    
    // 防止滚动
    document.body.style.overflow = 'hidden';
    
    // 显示弹窗动画
    setTimeout(() => {
        dialog.classList.add('visible');
    }, 10);
    
    // 添加关闭事件
    dialog.querySelector('.login-dialog-close').addEventListener('click', closeLoginDialog);
    dialog.querySelector('.login-dialog-cancel').addEventListener('click', closeLoginDialog);
    dialog.addEventListener('click', function(e) {
        if (e.target === dialog) {
            closeLoginDialog();
        }
    });
    
    // 关闭弹窗函数
    function closeLoginDialog() {
        dialog.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(dialog);
            document.body.style.overflow = '';
        }, 300);
    }
}

// 设置主题过滤器功能
function setupTopicFilters() {
    const topicItems = document.querySelectorAll('.topic-item');
    
    topicItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有项目的active类
            topicItems.forEach(i => i.classList.remove('active'));
            
            // 为当前点击的项目添加active类
            this.classList.add('active');
            
            // 获取主题名称
            const topicName = this.querySelector('.topic-name').textContent;
            
            // 更新主题标题
            const contentTitle = document.querySelector('.content-title');
            if (contentTitle) {
                contentTitle.textContent = topicName;
            }
            
            // 这里可以添加AJAX请求，获取对应主题的讨论列表
            // 实际项目中应该请求后端API获取特定主题的讨论
            
            // 为了演示，我们暂时不做实际数据刷新
        });
    });
}

// 如果auth.js中没有定义isLoggedIn函数，我们需要定义一个用于检查登录状态
if (typeof isLoggedIn !== 'function') {
    function isLoggedIn() {
        // 检查localStorage中是否有用户数据
        return localStorage.getItem('eduwebUser') !== null;
    }
} 