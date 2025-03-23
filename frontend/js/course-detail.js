// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户信息
    initializeUserInfo();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载课程数据
    loadCourseData();
    
    // 检查课程是否已收藏
    checkIfFavorited();
});

// 初始化用户信息
function initializeUserInfo() {
    // 从localStorage获取用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
        username: '用户名',
        email: 'user@example.com',
        avatar: 'https://via.placeholder.com/150',
        bio: '这个人很懒，什么都没写...'
    };
    
    // 更新用户头像
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.src = userInfo.avatar;
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 导航栏用户头像点击
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
    }
    
    // 课程导航滚动
    const navLinks = document.querySelectorAll('.course-nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有active类
            navLinks.forEach(item => item.classList.remove('active'));
            
            // 添加active类到当前点击的项目
            this.classList.add('active');
            
            // 获取目标元素
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            // 滚动到目标元素
            if (targetElement) {
                const offset = 80; // 顶部偏移量，考虑固定导航栏
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 开始学习按钮
    const startLearningBtn = document.getElementById('startLearningBtn');
    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', function() {
            // 获取课程ID
            const courseId = getCourseId();
            // 跳转到学习页面
            window.location.href = `course-learn.html?course=${courseId}`;
        });
    }
    
    // 收藏课程按钮
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavorite);
    }
    
    // 相关课程点击
    const relatedCourses = document.querySelectorAll('.related-course-item');
    relatedCourses.forEach(course => {
        course.addEventListener('click', function() {
            // 在实际应用中，这里应该获取课程ID
            const courseTitle = this.querySelector('h4').textContent;
            showToast(`正在加载课程: ${courseTitle}`);
            // window.location.href = 'course-detail.html?id=' + courseId;
        });
    });
}

// 加载课程数据
function loadCourseData() {
    // 在真实项目中，这里应该从API获取课程数据
    // 这里简单模拟从URL参数获取课程ID
    
    // 从URL获取课程ID
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    // 如果没有ID参数，使用默认课程数据
    if (!courseId) {
        console.log('没有提供课程ID，使用默认数据');
        // 使用页面上已有的默认数据
        return;
    }
    
    // 模拟API请求
    console.log(`加载课程ID: ${courseId}`);
    
    // TODO: 实际项目中这里应该获取课程详情，包括收藏数量
    // 示例代码:
    // fetch(`/api/courses/${courseId}`)
    //   .then(response => response.json())
    //   .then(data => {
    //     document.getElementById('courseTitle').textContent = data.title;
    //     document.getElementById('courseInstructor').textContent = data.instructor;
    //     document.getElementById('courseFavorites').textContent = data.favorites_count.toLocaleString();
    //   });
}

// 检查课程是否已收藏
function checkIfFavorited() {
    // 获取当前课程信息
    const courseTitle = document.getElementById('courseTitle').textContent;
    const courseInstructor = document.getElementById('courseInstructor').textContent;
    
    // 从localStorage获取用户收藏
    let favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
    
    // 检查当前课程是否已收藏
    const isFavorited = favorites.some(course => 
        course.title === courseTitle && course.instructor === courseInstructor
    );
    
    // 更新收藏按钮状态
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        if (isFavorited) {
            favoriteBtn.classList.add('active');
            favoriteBtn.innerHTML = '<i class="bi bi-star-fill"></i> 已收藏';
        } else {
            favoriteBtn.classList.remove('active');
            favoriteBtn.innerHTML = '<i class="bi bi-star"></i> 收藏课程';
        }
    }
}

// 切换收藏状态
function toggleFavorite() {
    // 检查用户是否登录
    const isLoggedIn = localStorage.getItem('eduwebUser') !== null;
    if (!isLoggedIn) {
        // 保存当前页面URL以便登录后返回
        localStorage.setItem('eduwebRedirect', window.location.href);
        
        // 显示消息并重定向
        showToast('请先登录才能收藏课程', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return; // 提前返回，不执行后续操作
    }

    // 获取当前课程信息
    const courseTitle = document.getElementById('courseTitle').textContent;
    const courseInstructor = document.getElementById('courseInstructor').textContent;
    const courseCover = document.getElementById('courseCover').src;
    
    // 从localStorage获取用户收藏
    let favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
    
    // 检查当前课程是否已收藏
    const index = favorites.findIndex(course => 
        course.title === courseTitle && course.instructor === courseInstructor
    );
    
    // 更新收藏状态
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoritesCountElement = document.getElementById('courseFavorites');
    let favoritesCount = parseInt(favoritesCountElement.textContent.replace(",", ""));
    
    if (index === -1) {
        // 添加到收藏
        favorites.push({
            title: courseTitle,
            instructor: courseInstructor,
            cover: courseCover
        });
        
        // 更新按钮状态
        favoriteBtn.classList.add('active');
        favoriteBtn.innerHTML = '<i class="bi bi-star-fill"></i> 已收藏';
        
        // 更新收藏计数 +1
        favoritesCount += 1;
        favoritesCountElement.textContent = favoritesCount.toLocaleString();
        
        showToast('课程已添加到收藏');
    } else {
        // 从收藏中移除
        favorites.splice(index, 1);
        
        // 更新按钮状态
        favoriteBtn.classList.remove('active');
        favoriteBtn.innerHTML = '<i class="bi bi-star"></i> 收藏课程';
        
        // 更新收藏计数 -1
        favoritesCount = Math.max(0, favoritesCount - 1);
        favoritesCountElement.textContent = favoritesCount.toLocaleString();
        
        showToast('课程已从收藏中移除');
    }
    
    // 保存到localStorage
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
    
    // 当后端实现后，这里应该发送API请求更新服务器上的收藏数据
    // updateFavoritesCount(courseId, favoritesCount);
}

// 显示Toast消息
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toastMessage');
    
    if (!toastElement) return;
    
    // 设置消息内容
    toastElement.textContent = message;
    
    // 设置样式
    if (type === 'error') {
        toastElement.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
    } else if (type === 'warning') {
        toastElement.style.backgroundColor = 'rgba(241, 196, 15, 0.9)';
    } else {
        toastElement.style.backgroundColor = 'rgba(46, 204, 113, 0.9)';
    }
    
    // 显示Toast
    toastElement.classList.add('show');
    
    // 3秒后隐藏
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

// 获取课程ID函数
function getCourseId() {
    // 从URL获取课程ID
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'default';
} 