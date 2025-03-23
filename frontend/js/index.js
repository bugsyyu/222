/**
 * EduWeb 主页专用JavaScript
 * 处理主页特定逻辑和UI更新
 */

document.addEventListener('DOMContentLoaded', function() {
    // 更新主页CTA按钮
    updateHomePageCTA();
});

// 确保在页面加载后立即执行一次，同时也在window.load时执行一次
// 这样可以防止某些情况下DOM加载顺序导致的问题
window.addEventListener('load', function() {
    updateHomePageCTA();
});

/**
 * 根据登录状态更新主页CTA按钮
 * 如果用户已登录，则将"立即开始"按钮更改为"个人中心"按钮
 */
function updateHomePageCTA() {
    console.log("执行updateHomePageCTA函数");
    
    // 检查是否在主页
    const currentPage = window.location.pathname.split('/').pop();
    console.log("当前页面:", currentPage);
    
    if (currentPage !== 'index.html' && currentPage !== '' && currentPage !== '/') return;
    
    // 检查用户是否已登录
    const isAuthenticated = isLoggedIn();
    console.log("用户登录状态:", isAuthenticated);
    
    // 获取CTA按钮区域
    const ctaButtonsArea = document.querySelector('.cta-buttons');
    if (!ctaButtonsArea) {
        console.log("未找到CTA按钮区域");
        return;
    }
    
    // 获取主按钮
    const primaryButton = ctaButtonsArea.querySelector('.btn-primary');
    if (!primaryButton) {
        console.log("未找到主按钮");
        return;
    }
    
    // 如果用户已登录，修改主要CTA按钮
    if (isAuthenticated) {
        console.log("用户已登录，更新按钮为'个人中心'");
        // 更新按钮文本和链接
        primaryButton.textContent = '个人中心';
        primaryButton.href = 'profile.html';
    } else {
        console.log("用户未登录，保持按钮为'立即开始'");
        // 确保未登录状态下按钮恢复原样
        primaryButton.textContent = '立即开始';
        primaryButton.href = 'register.html';
    }
}

/**
 * 检查用户是否已登录
 * 从auth.js复制的函数，确保即使auth.js中的函数未定义也能正常工作
 * @returns {boolean} 用户是否已登录
 */
function isLoggedIn() {
    return !!localStorage.getItem('eduwebUser');
}

// 添加一个监听器以便在localStorage变化时更新UI
// 这对测试特别有用，因为可以立即看到变化
window.addEventListener('storage', function(e) {
    if (e.key === 'eduwebUser') {
        updateHomePageCTA();
    }
}); 