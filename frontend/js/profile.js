document.addEventListener('DOMContentLoaded', function() {
    try {
        // 确保UserInfoManager已加载
        if (window.UserInfoManager) {
    initUserInfo();
    setupEventListeners();
    const oldBindFn = window.bindEventListeners;
    if (typeof oldBindFn === 'function') {
        window.bindEventListeners = function() {
            console.log('Using new event handlers instead');
        };
    }

    // 获取通知设置相关元素
    const openNotificationSettingsBtn = document.getElementById('openNotificationSettingsBtn');
    const closeNotificationSettingsBtn = document.getElementById('closeNotificationSettingsBtn');
    const cancelNotificationSettingsBtn = document.getElementById('cancelNotificationSettingsBtn');
    const saveNotificationSettingsBtn = document.getElementById('saveNotificationSettingsBtn');
    const notificationSettingsModal = document.getElementById('notificationSettingsModal');
    
    // 设置通知设置弹窗相关事件
    if (openNotificationSettingsBtn) {
        openNotificationSettingsBtn.addEventListener('click', openNotificationSettingsModal);
    }
    
    if (closeNotificationSettingsBtn) {
        closeNotificationSettingsBtn.addEventListener('click', closeNotificationSettingsModal);
    }
    
    if (cancelNotificationSettingsBtn) {
        cancelNotificationSettingsBtn.addEventListener('click', closeNotificationSettingsModal);
    }
    
    if (saveNotificationSettingsBtn) {
        saveNotificationSettingsBtn.addEventListener('click', saveNotificationSettings);
    }
    
    // 从localStorage加载用户的通知设置
    loadNotificationSettings();
        } else {
            console.warn('UserInfoManager 未加载，等待加载...');
            // 延迟重试
            setTimeout(function() {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
            }, 100);
        }
    } catch (error) {
        console.error('初始化页面时出错:', error);
    }
});

function initUserInfo() {
    // 使用UserInfoManager获取用户信息
    const userData = window.UserInfoManager.getUserInfo();
    
    // 更新DOM元素
    if (document.getElementById('userAvatar')) {
    document.getElementById('userAvatar').src = userData.avatar;
    }
    
    if (document.getElementById('greetingName')) {
        document.getElementById('greetingName').textContent = userData.name;
    }
    
    if (document.getElementById('userName')) {
    document.getElementById('userName').textContent = userData.name;
    }
    
    if (document.getElementById('userEmail')) {
    document.getElementById('userEmail').textContent = userData.email;
    }
    
    if (document.getElementById('profileAvatar')) {
    document.getElementById('profileAvatar').src = userData.avatar;
    }
    
    const bioElement = document.querySelector('.user-bio');
    if (bioElement && userData.bio) {
        bioElement.textContent = userData.bio;
    }
    
    // 如果有统计数据，则更新
    if (userData.stats) {
        if (document.getElementById('stats-hours')) {
            document.getElementById('stats-hours').textContent = userData.stats.hours || 120;
        }
        if (document.getElementById('stats-courses')) {
            document.getElementById('stats-courses').textContent = userData.stats.courses || 5;
        }
        if (document.getElementById('stats-streak')) {
            document.getElementById('stats-streak').textContent = userData.stats.streak || 7;
        }
    }
    
    // 设置头像加载失败时的默认图片
    if (document.getElementById('userAvatar')) {
    document.getElementById('userAvatar').onerror = function() { this.src = 'images/default-avatar.svg'; };
    }
    if (document.getElementById('profileAvatar')) {
    document.getElementById('profileAvatar').onerror = function() { this.src = 'images/default-avatar.svg'; };
    }
    
    // 检查用户角色并显示对应功能入口
    if (userData.roles && userData.roles.includes('teacher')) {
        showTeacherActions();
    }
    
    // 监听用户信息变化
    window.UserInfoManager.onChange(function(updatedUserData) {
        // 当用户信息发生变化时，更新页面
        if (document.getElementById('userAvatar')) {
            document.getElementById('userAvatar').src = updatedUserData.avatar;
        }
        if (document.getElementById('greetingName')) {
            document.getElementById('greetingName').textContent = updatedUserData.name;
        }
        if (document.getElementById('userName')) {
            document.getElementById('userName').textContent = updatedUserData.name;
        }
        if (document.getElementById('userEmail')) {
            document.getElementById('userEmail').textContent = updatedUserData.email;
        }
        if (document.getElementById('profileAvatar')) {
            document.getElementById('profileAvatar').src = updatedUserData.avatar;
        }
        const bioElement = document.querySelector('.user-bio');
        if (bioElement && updatedUserData.bio) {
            bioElement.textContent = updatedUserData.bio;
        }
    });
}

// 显示教师功能入口
function showTeacherActions() {
    const teacherActions = document.getElementById('teacherActions');
    if (teacherActions) {
        teacherActions.style.display = 'block';
    }
}

function setupEventListeners() {
    // 绑定继续学习按钮
    document.querySelectorAll('.btn-continue').forEach(button => {
        button.addEventListener('click', handleContinueLearning);
    });
    
    // 绑定"查看全部课程"按钮
    const viewAllCoursesBtn = document.querySelector('.recent-courses .btn-view-all');
    if (viewAllCoursesBtn) {
        viewAllCoursesBtn.removeAttribute('href'); // 移除href属性
        viewAllCoursesBtn.id = 'viewAllCourses'; // 添加ID
        viewAllCoursesBtn.addEventListener('click', handleViewAllCourses);
    }
    
    // 绑定开始学习按钮
    document.querySelectorAll('.btn-start').forEach(button => {
        button.addEventListener('click', handleStartLearning);
    });
    
    // 绑定取消收藏按钮
    document.querySelectorAll('.btn-unfavorite').forEach(button => {
        button.addEventListener('click', handleUnfavorite);
    });
    
    // 绑定"查看全部收藏"按钮
    const viewAllFavoritesBtn = document.querySelector('.favorite-courses .btn-view-all');
    if (viewAllFavoritesBtn) {
        viewAllFavoritesBtn.removeAttribute('href'); // 移除href属性
        viewAllFavoritesBtn.id = 'viewAllFavorites'; // 确保ID正确
        viewAllFavoritesBtn.addEventListener('click', handleViewAllFavorites);
    }
    
    // 绑定编辑个人资料按钮
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }
    
    // 绑定关闭模态框按钮
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditProfileModal);
    }
    
    // 绑定取消编辑按钮
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditProfileModal);
    }
    
    // 绑定保存资料按钮
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveUserProfile);
    }
    
    // 绑定更换头像按钮
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', openAvatarUploadDialog);
    }
    
    // 通知设置按钮
    const openNotificationSettingsBtn = document.getElementById('openNotificationSettingsBtn');
    if (openNotificationSettingsBtn) {
        openNotificationSettingsBtn.addEventListener('click', openNotificationSettingsModal);
    }
    
    // 关闭通知设置模态框按钮
    const closeNotificationSettingsBtn = document.getElementById('closeNotificationSettingsBtn');
    if (closeNotificationSettingsBtn) {
        closeNotificationSettingsBtn.addEventListener('click', closeNotificationSettingsModal);
    }
    
    // 取消通知设置按钮
    const cancelNotificationSettingsBtn = document.getElementById('cancelNotificationSettingsBtn');
    if (cancelNotificationSettingsBtn) {
        cancelNotificationSettingsBtn.addEventListener('click', closeNotificationSettingsModal);
    }
    
    // 保存通知设置按钮
    const saveNotificationSettingsBtn = document.getElementById('saveNotificationSettingsBtn');
    if (saveNotificationSettingsBtn) {
        saveNotificationSettingsBtn.addEventListener('click', saveNotificationSettings);
    }
}

function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        // 填充表单数据
        document.getElementById('editUsername').value = document.getElementById('userName').textContent;
        document.getElementById('editEmail').value = document.getElementById('userEmail').textContent;
        document.getElementById('editBio').value = document.querySelector('.user-bio').textContent;
        
        // 显示模态框
        modal.classList.add('active');
    }
}

function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('editProfileModal');
    if (modal && event.target === modal) {
        closeEditProfileModal();
    }
});

function openAvatarUploadDialog() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.click();
    
    fileInput.onchange = function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            if (file.size > 2 * 1024 * 1024) {
                showToast('文件大小不能超过2MB', 'error');
                document.body.removeChild(fileInput);
                return;
            }
            
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                showToast('请选择JPEG, PNG或GIF格式的图片', 'error');
                document.body.removeChild(fileInput);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDataUrl = e.target.result;
                
                // 使用UserInfoManager更新头像
                window.UserInfoManager.updateAvatar(imageDataUrl);
                
                showToast('头像已更新', 'success');
            };
            
            reader.readAsDataURL(file);
        }
        
        document.body.removeChild(fileInput);
    };
}

function saveUserProfile() {
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const bio = document.getElementById('editBio').value;
    
    if (!username || !email) {
        showToast('用户名和邮箱不能为空', 'error');
        return;
    }
    
    // 使用UserInfoManager更新用户信息
    window.UserInfoManager.updateUserInfo({
        name: username,
        email: email,
        bio: bio
    });
    
    closeEditProfileModal();
    showToast('个人资料已更新', 'success');
}

function handleContinueLearning(e) {
    e.preventDefault();
    const courseItem = e.target.closest('.course-item');
    const courseName = courseItem.querySelector('h3').textContent;
    let courseId;
    switch(courseName) {
        case 'Python基础课程':
            courseId = '1';
            break;
        case 'Web开发入门':
            courseId = '2';
            break;
        default:
            courseId = '1';
    }
    window.location.href = `course-learn.html?id=${courseId}`;
}

function handleViewAllCourses(e) {
    e.preventDefault();
    
    // 获取学习课程数据
    // 在实际项目中，这里应该从后端获取所有课程
    const recentCourses = [
        {
            id: '1',
            title: 'Python基础课程',
            cover: 'images/default-course-cover.svg',
            progress: 75,
            date: '3天前'
        },
        {
            id: '2',
            title: 'Web开发入门',
            cover: 'images/default-course-cover.svg',
            progress: 60,
            date: '1周前'
        },
        {
            id: '3',
            title: '数据结构与算法',
            cover: 'images/default-course-cover.svg',
            progress: 30,
            date: '2周前'
        },
        {
            id: '4',
            title: 'JavaScript进阶',
            cover: 'images/default-course-cover.svg',
            progress: 45,
            date: '3周前'
        }
    ];
    
    // 区分学习中和已完成的课程
    const inProgressCourses = recentCourses.filter(course => course.progress < 100);
    const completedCourses = getCompletedCourses();
    
    const inProgressCoursesCount = inProgressCourses.length;
    const completedCoursesCount = completedCourses.length;
    const totalCoursesCount = inProgressCoursesCount + completedCoursesCount;
    
    // 创建页面内容
    const pageContainer = document.getElementById('pageContent');
    if (pageContainer) {
        pageContainer.innerHTML = `
            <div class="courses-container">
                <div class="courses-header">
                    <h1>所有课程 (${totalCoursesCount})</h1>
                    <button class="btn-back" id="backFromAllCoursesBtn"><i class="bi bi-arrow-left"></i> 返回</button>
                </div>
                
                <div class="course-section">
                    <h2>学习中的课程 (${inProgressCoursesCount})</h2>
                    <div class="course-list" id="inProgressCoursesGrid">
                        ${inProgressCoursesCount > 0 ? '' : '<div class="empty-courses">暂无学习中的课程</div>'}
                    </div>
                </div>
                
                <div class="course-section">
                    <h2>已完成的课程 (${completedCoursesCount})</h2>
                    <div class="course-list" id="completedCoursesGrid">
                        ${completedCoursesCount > 0 ? '' : '<div class="empty-courses">暂无已完成课程</div>'}
                    </div>
                </div>
            </div>
        `;
        
        // 添加学习中的课程到网格
        if (inProgressCoursesCount > 0) {
            const inProgressGrid = document.getElementById('inProgressCoursesGrid');
            
            if (inProgressGrid) {
                // 添加课程卡片到网格
                inProgressCourses.forEach(course => {
                    const courseCard = document.createElement('div');
                    courseCard.className = 'course-item';
                    courseCard.innerHTML = `
                        <div class="course-img">
                            <img src="${course.cover}" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                        </div>
                        <div class="course-info">
                            <h3>${course.title}</h3>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${course.progress}%"></div>
                            </div>
                            <div class="course-meta">
                                <span class="progress-text">完成度: ${course.progress}%</span>
                                <span class="course-date">${course.date}</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            <a href="course-learn.html?id=${course.id}" class="btn-continue">继续学习</a>
                        </div>
                    `;
                    inProgressGrid.appendChild(courseCard);
                });
            }
        }
        
        // 添加已完成的课程到网格
        if (completedCoursesCount > 0) {
            const completedGrid = document.getElementById('completedCoursesGrid');
            
            if (completedGrid) {
                // 添加完成的课程卡片到网格
                completedCourses.forEach(course => {
                    const courseCard = document.createElement('div');
                    courseCard.className = 'course-item completed';
                    courseCard.innerHTML = `
                        <div class="course-img">
                            <img src="${course.cover}" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                            <div class="completion-badge"><i class="bi bi-check-circle-fill"></i></div>
                        </div>
                        <div class="course-info">
                            <h3>${course.title}</h3>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                            <div class="course-meta">
                                <span class="progress-text">已完成</span>
                                <span class="course-date">完成于: ${course.completionDate}</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            <a href="course-learn.html?id=${course.id}" class="btn-review">复习课程</a>
                        </div>
                    `;
                    completedGrid.appendChild(courseCard);
                });
            }
        }
        
        // 显示页面内容
        pageContainer.style.display = 'block';
        
        // 返回按钮事件
        const backBtn = document.getElementById('backFromAllCoursesBtn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                pageContainer.style.display = 'none';
            });
        }
    }
}

// 获取已完成的课程列表
function getCompletedCourses() {
    // 在实际项目中，这里应该从后端获取已完成课程数据
    // 现在返回模拟数据，确保与用户资料中显示的已完成课程数量一致（5门）
    return [
        {
            id: '5',
            title: 'HTML与CSS基础',
            cover: 'images/default-course-cover.svg',
            completionDate: '2023-10-15',
            instructor: '李老师'
        },
        {
            id: '6',
            title: 'JavaScript基础教程',
            cover: 'images/default-course-cover.svg',
            completionDate: '2023-11-20',
            instructor: '王老师'
        },
        {
            id: '7',
            title: '响应式网页设计',
            cover: 'images/default-course-cover.svg',
            completionDate: '2023-12-05',
            instructor: '张老师'
        },
        {
            id: '8',
            title: 'Git版本控制',
            cover: 'images/default-course-cover.svg',
            completionDate: '2024-01-10',
            instructor: '赵老师'
        },
        {
            id: '9',
            title: '命令行基础',
            cover: 'images/default-course-cover.svg',
            completionDate: '2024-02-18',
            instructor: '刘老师'
        }
    ];
}

function handleStartLearning(e) {
    e.preventDefault();
    
    // 获取课程名称
    const favoriteCard = e.target.closest('.favorite-card');
    const courseName = favoriteCard.querySelector('h3').textContent;
    
    // 根据课程名称生成课程ID (实际项目中应该从后端API获取)
    let courseId;
    switch(courseName) {
        case '数据结构与算法':
            courseId = '3';
            break;
        case '机器学习基础':
            courseId = '4';
            break;
        default:
            courseId = '1';
    }
    
    // 跳转到课程学习页面
    window.location.href = `course-learn.html?id=${courseId}`;
}

function handleUnfavorite(e) {
    e.preventDefault();
    
    if (confirm('确定要取消收藏此课程吗？')) {
        // 移除收藏卡片
        const favoriteCard = e.target.closest('.favorite-card');
        favoriteCard.remove();
        
        // 显示提示
        showToast('课程已从收藏中移除');
    }
}

function handleViewAllFavorites(e) {
    e.preventDefault();
    
    // 获取收藏课程数据
    // 在实际项目中，这里应该从后端获取所有收藏课程
    const favoriteCourses = [
        {
            id: '3',
            title: '数据结构与算法',
            cover: 'images/default-course-cover.svg',
            instructor: '张老师'
        },
        {
            id: '4',
            title: '机器学习基础',
            cover: 'images/default-course-cover.svg',
            instructor: '李老师'
        },
        {
            id: '5',
            title: 'React前端开发',
            cover: 'images/default-course-cover.svg',
            instructor: '王老师'
        },
        {
            id: '6',
            title: '云计算与容器技术',
            cover: 'images/default-course-cover.svg',
            instructor: '赵老师'
        }
    ];
    
    const favoritesCount = favoriteCourses.length;
    
    // 创建页面内容
    const pageContainer = document.getElementById('pageContent');
    if (pageContainer) {
        pageContainer.innerHTML = `
            <div class="courses-container">
                <div class="courses-header">
                    <h1>收藏的课程 (${favoritesCount})</h1>
                    <button class="btn-back" id="backFromAllFavoritesBtn"><i class="bi bi-arrow-left"></i> 返回</button>
                </div>
                <div class="favorites-grid" id="allFavoritesGrid">
                    ${favoritesCount > 0 ? '' : '<div class="empty-courses">暂无收藏课程</div>'}
                </div>
            </div>
        `;
        
        // 添加所有收藏课程到网格
        if (favoritesCount > 0) {
            const favoritesGrid = document.getElementById('allFavoritesGrid');
            
            if (favoritesGrid) {
                // 添加课程卡片到网格
                favoriteCourses.forEach(course => {
                    const favoriteCard = document.createElement('div');
                    favoriteCard.className = 'favorite-card';
                    favoriteCard.innerHTML = `
                        <div class="favorite-img">
                            <img src="${course.cover}" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                        </div>
                        <div class="favorite-info">
                            <h3>${course.title}</h3>
                            <p>讲师：${course.instructor}</p>
                            <div class="favorite-actions">
                                <a href="course-learn.html?id=${course.id}" class="btn-start">开始学习</a>
                                <button class="btn-unfavorite" data-course-id="${course.id}"><i class="bi bi-star-fill"></i></button>
                            </div>
                        </div>
                    `;
                    favoritesGrid.appendChild(favoriteCard);
                });
                
                // 重新绑定取消收藏按钮的事件
                const unfavoriteBtns = document.querySelectorAll('#allFavoritesGrid .btn-unfavorite');
                if (unfavoriteBtns.length > 0) {
                    unfavoriteBtns.forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const favoriteCard = this.closest('.favorite-card');
                            if (confirm('确定要取消收藏此课程吗？')) {
                                favoriteCard.style.opacity = '0';
                                favoriteCard.style.transform = 'scale(0.9)';
                                favoriteCard.style.transition = 'all 0.3s';
                                
                                setTimeout(() => {
                                    favoriteCard.remove();
                                    
                                    // 检查是否没有收藏课程了
                                    if (document.querySelectorAll('#allFavoritesGrid .favorite-card').length === 0) {
                                        document.getElementById('allFavoritesGrid').innerHTML = '<div class="empty-courses">暂无收藏课程</div>';
                                    }
                                    
                                    showToast('课程已从收藏中移除');
                                }, 300);
                            }
                        });
                    });
                }
            }
        }
        
        // 显示页面内容
        pageContainer.style.display = 'block';
        
        // 返回按钮事件
        const backBtn = document.getElementById('backFromAllFavoritesBtn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                pageContainer.style.display = 'none';
            });
        }
    }
}

function bindEventListeners() {
    const favoritesLink = document.getElementById('favoritesLink');
    if (favoritesLink) {
        favoritesLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleViewAllFavorites(e);
        });
    }
    const settingsLink = document.getElementById('settingsLink');
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSettingsPage();
        });
    }
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userInfo');
            showToast('已成功退出登录');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
    
    // 绑定"查看全部课程"按钮
    const viewAllCoursesBtn = document.querySelector('.recent-courses .btn-view-all');
    if (viewAllCoursesBtn) {
        viewAllCoursesBtn.removeAttribute('href'); // 移除href属性
        viewAllCoursesBtn.addEventListener('click', handleViewAllCourses);
    }
    
    // 绑定"查看全部收藏"按钮
    const viewAllFavoritesBtn = document.querySelector('.favorite-courses .btn-view-all');
    if (viewAllFavoritesBtn) {
        viewAllFavoritesBtn.removeAttribute('href'); // 移除href属性
        viewAllFavoritesBtn.id = 'viewAllFavorites'; // 确保ID正确
        viewAllFavoritesBtn.addEventListener('click', handleViewAllFavorites);
    }
}

function showSettingsPage() {
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) return;
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
    pageContent.classList.add('show');
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
    const closeBtn = document.getElementById('closeSettingsPage');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            pageContent.classList.remove('show');
            document.head.removeChild(style);
        });
    }
}

// 显示Toast提示消息
function showToast(message, type = 'success') {
    // 检查是否已存在toast容器
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // 创建新toast元素
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    
    // 添加到容器中
    toastContainer.appendChild(toast);
    
    // 显示toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            if (toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    }, 3000);
}

// 为页面添加toast样式
(function() {
    if (document.querySelector('#profile-toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'profile-toast-styles';
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .toast-message {
            padding: 12px 20px;
            margin-bottom: 10px;
            background-color: #4CAF50;
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        }
        
        .toast-message.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .toast-message.error {
            background-color: #F44336;
        }
        
        .toast-message.warning {
            background-color: #FF9800;
        }
        
        .toast-message.info {
            background-color: #2196F3;
        }
    `;
    
    document.head.appendChild(style);
})();

function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('eduwebUser');
        window.location.href = 'index.html';
    }
}

// 通知设置相关功能
/**
 * 打开通知设置弹窗
 */
function openNotificationSettingsModal() {
    const modal = document.getElementById('notificationSettingsModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
}

/**
 * 关闭通知设置弹窗
 */
function closeNotificationSettingsModal() {
    const modal = document.getElementById('notificationSettingsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // 恢复背景滚动
    }
}

/**
 * 保存通知设置
 */
function saveNotificationSettings() {
    // 收集所有通知设置的状态
    const settings = {
        frequency: {
            realtime: document.getElementById('realtime-notifications').checked,
            dailyDigest: document.getElementById('daily-digest').checked
        },
        types: {
            courseUpdates: document.getElementById('course-updates').checked,
            commentReplies: document.getElementById('comment-replies').checked,
            systemNotifications: document.getElementById('system-notifications').checked,
            learningReminders: document.getElementById('learning-reminders').checked
        },
        methods: {
            inSite: document.getElementById('in-site-notifications').checked,
            email: document.getElementById('email-notifications').checked
        }
    };
    
    // 将设置保存到localStorage
    localStorage.setItem('eduwebNotificationSettings', JSON.stringify(settings));
    
    // 显示成功消息
    showMessage('通知设置已保存', 'success');
    
    // 关闭弹窗
    closeNotificationSettingsModal();
    
    // 在实际应用中，这里会向后端API发送请求
    console.log('通知设置已保存:', settings);
}

/**
 * 从localStorage加载通知设置
 */
function loadNotificationSettings() {
    const savedSettings = localStorage.getItem('eduwebNotificationSettings');
    
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // 应用频率设置
        if (settings.frequency) {
            document.getElementById('realtime-notifications').checked = settings.frequency.realtime;
            document.getElementById('daily-digest').checked = settings.frequency.dailyDigest;
        }
        
        // 应用类型设置
        if (settings.types) {
            document.getElementById('course-updates').checked = settings.types.courseUpdates;
            document.getElementById('comment-replies').checked = settings.types.commentReplies;
            document.getElementById('system-notifications').checked = settings.types.systemNotifications;
            document.getElementById('learning-reminders').checked = settings.types.learningReminders;
        }
        
        // 应用通知方式设置
        if (settings.methods) {
            document.getElementById('in-site-notifications').checked = settings.methods.inSite;
            document.getElementById('email-notifications').checked = settings.methods.email;
        }
    }
}

/**
 * 显示消息提示
 * @param {string} message - 要显示的消息
 * @param {string} type - 消息类型 (success, error, info, warning)
 */
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