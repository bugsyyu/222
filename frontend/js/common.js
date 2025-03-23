/**
 * EduWeb 通用JavaScript函数
 * 处理全站共用的功能
 */

// 立即检查受保护页面是否需要重定向（不等待DOMContentLoaded）
(function() {
    // 检查当前页面是否需要认证
    const currentPage = window.location.pathname.split('/').pop();
    const authRequiredPages = ['profile.html', 'teacher-courses.html', 'dashboard.html', 'course-learn.html', 'notifications.html'];
    
    // 如果是需要认证的页面，立即检查登录状态
    if (authRequiredPages.includes(currentPage)) {
        // 获取localStorage中的用户数据检查是否已登录
        const userData = localStorage.getItem('eduwebUser');
        if (!userData) {
            // 未登录，保存当前URL并重定向
            localStorage.setItem('eduwebRedirect', window.location.href);
            window.location.href = 'login.html';
        }
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    // 如果当前页面是 new-discussion.html，立即设置其中的社区相关链接
    const currentPath = window.location.pathname;
    if (currentPath.includes('new-discussion.html')) {
        // 查找所有社区相关链接并直接设置为跳转到 community.html
        document.querySelectorAll('a[href="community.html"], a[href="community-loading.html"]').forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'community.html';
            });
        });
    } else {
        // 处理社区链接，使其先经过loading页面
        setupCommunityLinks();
    }
    
    // 确保导航栏显示正确的状态
    // 如果auth.js没有正确处理，这里将提供额外的保障
    ensureCorrectNavigation();
});

/**
 * 设置社区链接，修改所有指向community.html的链接，先经过loading页面
 * 但如果当前已经在社区相关页面，则直接导航到community.html
 */
function setupCommunityLinks() {
    // 检查当前是否在社区相关页面
    const currentPath = window.location.pathname;
    const isCommunityRelated = 
        currentPath.includes('discussion-detail.html') || 
        currentPath.includes('community.html') ||
        currentPath.includes('community-loading.html') ||
        currentPath.includes('new-discussion.html');
    
    // 获取所有社区相关链接
    const communityLinks = document.querySelectorAll('a[href="community.html"], a[href="community-loading.html"]');
    
    // 遍历所有链接并修改
    communityLinks.forEach(link => {
        // 保留原始的点击事件处理
        link.addEventListener('click', function(event) {
            // 阻止默认链接行为
            event.preventDefault();
            
            // 如果当前在社区相关页面，直接跳转到社区页面
            if (isCommunityRelated) {
                window.location.href = 'community.html';
            } else {
                // 否则重定向到加载页面
                window.location.href = 'community-loading.html';
            }
        });
    });
}

/**
 * 确保导航栏显示正确的状态
 * 这个函数提供了一个额外的保障，以防auth.js中的逻辑未正确执行
 */
function ensureCorrectNavigation() {
    // 检查是否已登录
    const userData = localStorage.getItem('eduwebUser');
    const isLoggedIn = !!userData;
    
    // 获取当前页面
    const currentPage = window.location.pathname.split('/').pop();
    const authRequiredPages = ['profile.html', 'teacher-courses.html', 'dashboard.html', 'course-learn.html', 'notifications.html'];
    const isAuthRequiredPage = authRequiredPages.includes(currentPage);
    
    // 如果是需要登录的页面但未登录，应该已被重定向，这里无需处理
    if (isAuthRequiredPage && !isLoggedIn) {
        return;
    }
    
    // 获取导航栏的auth-buttons区域
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;
    
    // 如果未登录且不是特定的页面，确保显示登录/注册按钮
    if (!isLoggedIn) {
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-login">登录</a>
            <a href="register.html" class="btn btn-register">注册</a>
        `;
    }
}

// 用户信息同步管理模块
const UserInfoManager = {
    // 获取用户信息
    getUserInfo: function() {
        // 首先尝试从localStorage获取用户数据
        let userData = JSON.parse(localStorage.getItem('eduwebUserInfo') || '{}');
        
        // 如果没有存储的用户数据，返回默认数据
        if (!Object.keys(userData).length) {
            userData = {
                name: '张同学',
                email: 'zhang@example.com',
                avatar: 'images/default-avatar.svg',
                bio: '热爱学习，专注于编程技术和Web开发，希望通过EduWeb平台提升自己的技能。',
                roles: ['student'] // 默认为学生角色
            };
            
            // 如果URL包含teacher参数，添加教师角色
            if (window.location.href.includes('teacher') || 
                document.getElementById('teacherActions') || 
                document.querySelector('.teacher-profile')) {
                userData.roles.push('teacher');
                // 为教师角色设置默认信息
                if (userData.name === '张同学') {
                    userData.name = '王老师';
                    userData.email = 'wang@example.com';
                    userData.bio = '资深前端开发工程师，拥有10年教学经验，专注Web开发和用户体验设计，热爱分享技术知识。';
                }
            }
            
            // 存储默认用户数据
            this.saveUserInfo(userData);
        }
        
        return userData;
    },
    
    // 保存用户信息
    saveUserInfo: function(userData) {
        localStorage.setItem('eduwebUserInfo', JSON.stringify(userData));
        
        // 触发用户信息更新事件
        const event = new CustomEvent('userinfochange', { detail: userData });
        document.dispatchEvent(event);
        
        return userData;
    },
    
    // 更新用户信息
    updateUserInfo: function(updates) {
        const userData = this.getUserInfo();
        const updatedData = { ...userData, ...updates };
        return this.saveUserInfo(updatedData);
    },
    
    // 更新头像
    updateAvatar: function(avatarUrl) {
        return this.updateUserInfo({ avatar: avatarUrl });
    },
    
    // 添加角色
    addRole: function(role) {
        if (!role) return this.getUserInfo();
        
        const userData = this.getUserInfo();
        if (!userData.roles) {
            userData.roles = [];
        }
        
        if (!userData.roles.includes(role)) {
            userData.roles.push(role);
            return this.saveUserInfo(userData);
        }
        
        return userData;
    },
    
    // 移除角色
    removeRole: function(role) {
        const userData = this.getUserInfo();
        if (!userData.roles) return userData;
        
        userData.roles = userData.roles.filter(r => r !== role);
        return this.saveUserInfo(userData);
    },
    
    // 监听用户信息变化
    onChange: function(callback) {
        document.addEventListener('userinfochange', (event) => {
            callback(event.detail);
        });
    }
};

// 导出全局可访问
window.UserInfoManager = UserInfoManager; 