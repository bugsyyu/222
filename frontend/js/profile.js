// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化用户信息
    initializeUserInfo();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载用户数据
    loadUserData();
});

// 初始化用户信息
function initializeUserInfo() {
    // 从localStorage获取用户信息，如果没有则使用默认值
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
        username: '用户名',
        email: 'user@example.com',
        avatar: 'https://via.placeholder.com/150',
        bio: '这个人很懒，什么都没写...'
    };
    
    // 更新页面显示
    document.querySelector('.user-info h2').textContent = userInfo.username;
    document.querySelector('.user-info p').textContent = userInfo.email;
    document.getElementById('userAvatar').src = userInfo.avatar;
    document.getElementById('profileAvatar').src = userInfo.avatar;
    
    // 更新模态框表单
    if (document.getElementById('editUsername')) {
        document.getElementById('editUsername').value = userInfo.username;
        document.getElementById('editEmail').value = userInfo.email;
        document.getElementById('editBio').value = userInfo.bio || '';
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 编辑个人资料按钮
    const editBtn = document.querySelector('.edit-profile-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            const modal = document.getElementById('editProfileModal');
            if (modal) modal.style.display = 'flex';
        });
    }
    
    // 关闭模态框按钮
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = document.getElementById('editProfileModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // 取消按钮
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const modal = document.getElementById('editProfileModal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // 保存个人资料按钮
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveProfile);
    }
    
    // 收藏/取消收藏按钮
    const unfavBtns = document.querySelectorAll('.btn-unfavorite');
    unfavBtns.forEach(btn => {
        btn.addEventListener('click', handleUnfavorite);
    });
    
    // 点击空白区域关闭模态框
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // 我的收藏链接
    const favoritesLink = document.getElementById('favoritesLink');
    if (favoritesLink) {
        favoritesLink.addEventListener('click', function(e) {
            e.preventDefault();
            showFavoritesPage();
        });
    }
    
    // 设置链接
    const settingsLink = document.getElementById('settingsLink');
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSettingsPage();
        });
    }
    
    // 查看全部收藏链接
    const viewAllFavorites = document.getElementById('viewAllFavorites');
    if (viewAllFavorites) {
        viewAllFavorites.addEventListener('click', function(e) {
            e.preventDefault();
            showFavoritesPage();
        });
    }
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // 清除本地存储的用户信息
            localStorage.removeItem('userInfo');
            // 提示用户已退出
            showToast('已成功退出登录');
            // 延迟跳转到登录页
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
    
    // 头像上传按钮
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', handleAvatarUpload);
    }
}

// 保存个人资料
function handleSaveProfile() {
    // 获取表单数据
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const bio = document.getElementById('editBio').value;
    
    // 验证数据
    if (!username || !email) {
        showToast('用户名和邮箱不能为空', 'error');
        return;
    }
    
    // 保存到本地存储
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    userInfo.username = username;
    userInfo.email = email;
    userInfo.bio = bio;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    // 更新页面显示
    document.querySelector('.user-info h2').textContent = username;
    document.querySelector('.user-info p').textContent = email;
    
    // 关闭模态框
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.style.display = 'none';
    
    // 显示成功消息
    showToast('个人资料已更新');
}

// 取消收藏
function handleUnfavorite(e) {
    const card = e.target.closest('.favorite-card');
    if (card) {
        // 添加动画效果
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            card.remove();
            showToast('已取消收藏');
        }, 300);
    }
}

// 处理头像上传
function handleAvatarUpload() {
    // 创建一个隐藏的文件输入框
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // 触发点击文件选择
    fileInput.click();
    
    // 处理文件选择
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // 获取图片数据
                const imageData = e.target.result;
                
                // 更新头像
                document.getElementById('profileAvatar').src = imageData;
                document.getElementById('userAvatar').src = imageData;
                
                // 保存到localStorage
                const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
                userInfo.avatar = imageData;
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                // 显示成功消息
                showToast('头像已更新');
            };
            
            // 读取文件为DataURL
            reader.readAsDataURL(file);
        }
        
        // 移除文件输入框
        document.body.removeChild(fileInput);
    });
}

// 显示收藏页面
function showFavoritesPage() {
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) return;
    
    // 创建收藏页面内容
    pageContent.innerHTML = `
        <div class="settings-container">
            <div class="settings-header">
                <h1>我的收藏</h1>
                <button class="btn-cancel" id="closeFavoritesPage">返回</button>
            </div>
            
            <div class="favorites-grid" id="allFavorites">
                <!-- 收藏内容将通过JavaScript添加 -->
            </div>
        </div>
    `;
    
    // 显示页面
    pageContent.classList.add('show');
    
    // 加载收藏内容
    const allFavorites = document.getElementById('allFavorites');
    if (allFavorites) {
        // 模拟更多收藏数据
        const favorites = [
            {
                title: '数据结构与算法',
                instructor: '张老师',
                cover: 'https://via.placeholder.com/300x200'
            },
            {
                title: '机器学习基础',
                instructor: '李老师',
                cover: 'https://via.placeholder.com/300x200'
            },
            {
                title: 'Web全栈开发',
                instructor: '王老师',
                cover: 'https://via.placeholder.com/300x200'
            },
            {
                title: '数据库原理',
                instructor: '刘老师',
                cover: 'https://via.placeholder.com/300x200'
            }
        ];
        
        // 生成HTML
        allFavorites.innerHTML = favorites.map(course => `
            <div class="favorite-card">
                <div class="favorite-img">
                    <img src="${course.cover}" alt="${course.title}">
                </div>
                <div class="favorite-info">
                    <h3>${course.title}</h3>
                    <p>讲师：${course.instructor}</p>
                    <div class="favorite-actions">
                        <a href="#" class="btn-start">开始学习</a>
                        <button class="btn-unfavorite"><i class="bi bi-star-fill"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // 绑定取消收藏按钮
        allFavorites.querySelectorAll('.btn-unfavorite').forEach(btn => {
            btn.addEventListener('click', handleUnfavorite);
        });
    }
    
    // 返回按钮
    const closeBtn = document.getElementById('closeFavoritesPage');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            pageContent.classList.remove('show');
        });
    }
}

// 显示设置页面
function showSettingsPage() {
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) return;
    
    // 创建设置页面内容
    pageContent.innerHTML = `
        <div class="settings-container">
            <div class="settings-header">
                <h1>设置</h1>
                <button class="btn-cancel" id="closeSettingsPage">返回</button>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-header">
                    <h2>账号设置</h2>
                </div>
                <div class="settings-section-content">
                    <div class="settings-row">
                        <div>
                            <div class="settings-row-label">密码</div>
                            <div class="settings-row-description">修改您的账号密码</div>
                        </div>
                        <button class="btn-save">修改</button>
                    </div>
                    <div class="settings-row">
                        <div>
                            <div class="settings-row-label">邮箱通知</div>
                            <div class="settings-row-description">接收课程更新和活动通知</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-header">
                    <h2>隐私设置</h2>
                </div>
                <div class="settings-section-content">
                    <div class="settings-row">
                        <div>
                            <div class="settings-row-label">学习记录</div>
                            <div class="settings-row-description">允许其他用户查看我的学习记录</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="settings-row">
                        <div>
                            <div class="settings-row-label">个人信息</div>
                            <div class="settings-row-description">公开展示我的个人资料</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 显示页面
    pageContent.classList.add('show');
    
    // 添加开关按钮样式
    const style = document.createElement('style');
    style.textContent = `
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }
        
        input:checked + .slider {
            background-color: #1890ff;
        }
        
        input:focus + .slider {
            box-shadow: 0 0 1px #1890ff;
        }
        
        input:checked + .slider:before {
            transform: translateX(26px);
        }
        
        .slider.round {
            border-radius: 34px;
        }
        
        .slider.round:before {
            border-radius: 50%;
        }
    `;
    document.head.appendChild(style);
    
    // 返回按钮
    const closeBtn = document.getElementById('closeSettingsPage');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            pageContent.classList.remove('show');
            document.head.removeChild(style);
        });
    }
}

// 加载用户数据
function loadUserData() {
    // 模拟从服务器加载数据
    const userData = {
        studyHours: 120,
        completedCourses: 5,
        recentLearning: [
            {
                title: 'Python基础课程',
                progress: 75,
                lastAccess: '3天前'
            },
            {
                title: 'Web开发入门',
                progress: 60,
                lastAccess: '1周前'
            }
        ],
        favorites: [
            {
                title: '数据结构与算法',
                instructor: '张老师',
                cover: 'https://via.placeholder.com/300x200'
            },
            {
                title: '机器学习基础',
                instructor: '李老师',
                cover: 'https://via.placeholder.com/300x200'
            }
        ]
    };
    
    // 更新学习统计
    updateLearningStats(userData);
    
    // 更新最近学习
    updateRecentLearning(userData.recentLearning);
    
    // 更新收藏课程
    updateFavorites(userData.favorites);
}

// 更新学习统计
function updateLearningStats(data) {
    const hoursElement = document.getElementById('stats-hours');
    const coursesElement = document.getElementById('stats-courses');
    
    if (hoursElement) {
        hoursElement.textContent = `${data.studyHours}小时`;
    }
    
    if (coursesElement) {
        coursesElement.textContent = `${data.completedCourses}门`;
    }
}

// 更新最近学习
function updateRecentLearning(courses) {
    const container = document.querySelector('.course-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    courses.forEach(course => {
        const item = document.createElement('div');
        item.className = 'course-item';
        item.innerHTML = `
            <div class="course-info">
                <h3>${course.title}</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
                <div class="course-meta">
                    <span class="progress-text">完成度: ${course.progress}%</span>
                    <span class="course-date">${course.lastAccess}</span>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// 更新收藏课程
function updateFavorites(favorites) {
    const container = document.querySelector('.favorites-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    favorites.forEach(course => {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.innerHTML = `
            <div class="favorite-img">
                <img src="${course.cover}" alt="${course.title}">
            </div>
            <div class="favorite-info">
                <h3>${course.title}</h3>
                <p>讲师：${course.instructor}</p>
                <div class="favorite-actions">
                    <a href="#" class="btn-start">开始学习</a>
                    <button class="btn-unfavorite"><i class="bi bi-star-fill"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
        
        // 绑定取消收藏按钮事件
        const unfavBtn = card.querySelector('.btn-unfavorite');
        if (unfavBtn) {
            unfavBtn.addEventListener('click', handleUnfavorite);
        }
    });
}

// 显示Toast消息
function showToast(message, type = 'success') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    
    // 根据类型设置不同的样式
    if (type === 'error') {
        toast.style.backgroundColor = 'rgba(245, 34, 45, 0.9)';
    } else if (type === 'warning') {
        toast.style.backgroundColor = 'rgba(250, 173, 20, 0.9)';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// 添加toast样式到document
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .toast-message {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: rgba(46, 204, 113, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s, transform 0.3s;
            z-index: 1100;
        }
        
        .toast-message.show {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
})(); 