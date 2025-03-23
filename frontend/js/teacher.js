document.addEventListener('DOMContentLoaded', function() {
    // 确保只调用一个初始化入口点
    initPage();
});

function initTeacherInfo() {
    // 使用UserInfoManager获取用户信息
    const userData = window.UserInfoManager.getUserInfo();
    
    // 如果用户没有教师角色，添加教师角色
    if (!userData.roles || !userData.roles.includes('teacher')) {
        window.UserInfoManager.addRole('teacher');
    }
    
    // 更新页面上的教师信息
    if (document.getElementById('userAvatar')) {
        document.getElementById('userAvatar').src = userData.avatar;
    }
    
    if (document.getElementById('greetingName')) {
        document.getElementById('greetingName').textContent = userData.name;
    }
    
    if (document.getElementById('teacherName')) {
        document.getElementById('teacherName').textContent = userData.name;
    }
    
    if (document.getElementById('teacherEmail')) {
        document.getElementById('teacherEmail').textContent = userData.email;
    }
    
    if (document.getElementById('teacherAvatar')) {
        document.getElementById('teacherAvatar').src = userData.avatar;
    }
    
    const bioElement = document.querySelector('.user-bio');
    if (bioElement && userData.bio) {
        bioElement.textContent = userData.bio;
    }
    
    // 教师统计数据保持不变
    const defaultStats = {
        published: 8,
        students: 520,
        rating: 4.8
    };
    
    const teacherStats = userData.teacherStats || defaultStats;
    
    if (document.getElementById('stats-published')) {
        document.getElementById('stats-published').textContent = teacherStats.published;
    }
    
    if (document.getElementById('stats-students') && teacherStats.students) {
        document.getElementById('stats-students').textContent = teacherStats.students;
    }
    
    if (document.getElementById('stats-rating') && teacherStats.rating) {
        document.getElementById('stats-rating').textContent = teacherStats.rating;
    }
    
    // 设置头像加载失败时的默认图片
    if (document.getElementById('userAvatar')) {
        document.getElementById('userAvatar').onerror = function() { this.src = 'images/default-avatar.svg'; };
    }
    
    if (document.getElementById('teacherAvatar')) {
        document.getElementById('teacherAvatar').onerror = function() { this.src = 'images/default-avatar.svg'; };
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
        
        if (document.getElementById('teacherName')) {
            document.getElementById('teacherName').textContent = updatedUserData.name;
        }
        
        if (document.getElementById('teacherEmail')) {
            document.getElementById('teacherEmail').textContent = updatedUserData.email;
        }
        
        if (document.getElementById('teacherAvatar')) {
            document.getElementById('teacherAvatar').src = updatedUserData.avatar;
        }
        
        const bioElement = document.querySelector('.user-bio');
        if (bioElement && updatedUserData.bio) {
            bioElement.textContent = updatedUserData.bio;
        }
    });
}

function setupEventListeners() {
    // 创建课程按钮点击事件
    const createCourseBtn = document.getElementById('createCourseBtn');
    if (createCourseBtn) {
        createCourseBtn.addEventListener('click', function() {
            openCreateCourseModal();
        });
    }
    
    // 关闭创建课程模态框
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeCreateCourseModal);
    }
    
    // 取消创建课程
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    if (cancelCreateBtn) {
        cancelCreateBtn.addEventListener('click', closeCreateCourseModal);
    }
    
    // 保存草稿
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveDraft);
    }
    
    // 立即发布课程
    const publishCourseBtn = document.getElementById('publishCourseBtn');
    if (publishCourseBtn) {
        publishCourseBtn.addEventListener('click', publishCourse);
    }
    
    // 关闭编辑课程模态框
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', closeEditCourseModal);
    }
    
    // 取消编辑课程
    const cancelEditCourseBtn = document.getElementById('cancelEditCourseBtn');
    if (cancelEditCourseBtn) {
        cancelEditCourseBtn.addEventListener('click', closeEditCourseModal);
    }
    
    // 保存编辑
    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEditCourse);
    }
    
    // 删除课程
    const deleteCourseBtn = document.getElementById('deleteCourseBtn');
    if (deleteCourseBtn) {
        deleteCourseBtn.addEventListener('click', deleteCourse);
    }
    
    // 查看全部已发布课程
    const viewAllPublishedCoursesBtn = document.getElementById('viewAllPublishedCourses');
    if (viewAllPublishedCoursesBtn) {
        viewAllPublishedCoursesBtn.addEventListener('click', viewAllPublishedCourses);
    }
    
    // 查看全部草稿
    const viewAllDraftCoursesBtn = document.getElementById('viewAllDraftCourses');
    if (viewAllDraftCoursesBtn) {
        viewAllDraftCoursesBtn.addEventListener('click', viewAllDraftCourses);
    }
    
    // 设置课程封面上传
    setupFileUpload('courseCover', 'coverPreview');
    setupFileUpload('editCourseCover', 'editCoverPreview');
    
    // 设置视频上传
    setupVideoUpload('courseVideo', 'videoUploadList', 'addVideoBtn');
    setupVideoUpload('editCourseVideo', 'editVideoUploadList', 'editAddVideoBtn');
    
    // 绑定课程项的编辑和发布/下架按钮
    bindCourseItemEvents();
}

function setupFileUpload(inputId, previewId) {
    const fileInput = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const uploadButton = fileInput.parentElement.querySelector('.btn-upload');
    
    uploadButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                preview.src = e.target.result;
            };
            
            reader.readAsDataURL(fileInput.files[0]);
        }
    });
}

function setupVideoUpload(inputId, listContainerId, buttonId) {
    const fileInput = document.getElementById(inputId);
    const listContainer = document.getElementById(listContainerId);
    const uploadButton = document.getElementById(buttonId);
    
    uploadButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files.length > 0) {
            // 清除空消息
            const emptyMessage = listContainer.querySelector('.empty-video-message');
            if (emptyMessage) {
                emptyMessage.remove();
            }
            
            // 添加每个选择的视频到列表
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                const videoItem = createVideoItem(file);
                listContainer.appendChild(videoItem);
                
                // 模拟上传进度（实际应用中应该使用AJAX上传）
                simulateUploadProgress(videoItem);
            }
            
            // 绑定新添加的删除按钮
            bindVideoDeleteButtons();
            
            // 重置文件输入，允许再次选择同一文件
            fileInput.value = '';
        }
    });
}

function createVideoItem(file) {
    const fileSize = formatFileSize(file.size);
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item uploading';
    videoItem.innerHTML = `
        <div class="video-info">
            <i class="bi bi-file-earmark-play"></i>
            <span class="video-name">${file.name}</span>
            <span class="video-size">${fileSize}</span>
            <span class="video-status uploading">上传中</span>
        </div>
        <div class="video-actions">
            <button type="button" class="btn-video-delete"><i class="bi bi-trash"></i></button>
        </div>
        <div class="video-upload-progress">
            <div class="progress-bar-fill" style="width: 0%"></div>
        </div>
    `;
    return videoItem;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function simulateUploadProgress(videoItem) {
    const progressBar = videoItem.querySelector('.progress-bar-fill');
    const statusSpan = videoItem.querySelector('.video-status');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            videoItem.classList.remove('uploading');
            statusSpan.textContent = '已完成';
            statusSpan.classList.remove('uploading');
            statusSpan.classList.add('success');
        }
        progressBar.style.width = `${progress}%`;
    }, 500);
}

function bindVideoDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.btn-video-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const videoItem = this.closest('.video-item');
            videoItem.style.opacity = '0';
            videoItem.style.height = '0';
            videoItem.style.marginBottom = '0';
            videoItem.style.padding = '0';
            videoItem.style.transition = 'all 0.3s';
            
            setTimeout(() => {
                videoItem.remove();
                
                // 检查列表是否为空，如果是则显示空消息
                const listContainer = videoItem.parentNode;
                if (listContainer && listContainer.children.length === 0) {
                    listContainer.innerHTML = '<div class="empty-video-message">请上传课程视频</div>';
                }
            }, 300);
        });
    });
}

function bindCourseItemEvents() {
    // 绑定编辑课程按钮
    document.querySelectorAll('.btn-edit-course').forEach(button => {
        button.addEventListener('click', function() {
            const courseItem = this.closest('.course-item');
            const courseTitle = courseItem.querySelector('h3').textContent;
            
            // 获取课程数据 (模拟数据，实际项目中从后端获取)
            const courseData = getCourseDataByTitle(courseTitle);
            
            // 打开编辑模态框
            openEditCourseModal(courseData);
        });
    });
    
    // 绑定发布/下架按钮
    document.querySelectorAll('.btn-toggle-status').forEach(button => {
        button.addEventListener('click', function() {
            const courseItem = this.closest('.course-item');
            const courseStatus = courseItem.querySelector('.course-status');
            
            if (courseStatus.classList.contains('published')) {
                // 当前是已发布状态，变更为下架
                courseStatus.classList.remove('published');
                courseStatus.classList.add('draft');
                courseStatus.textContent = '草稿';
                this.textContent = '发布';
                showToast('课程已下架');
            } else {
                // 当前是草稿状态，变更为发布
                courseStatus.classList.remove('draft');
                courseStatus.classList.add('published');
                courseStatus.textContent = '已发布';
                this.textContent = '下架';
                showToast('课程已发布');
            }
        });
    });
    
    // 绑定发布课程按钮 (草稿列表中的)
    document.querySelectorAll('.btn-publish-course').forEach(button => {
        button.addEventListener('click', function() {
            const courseItem = this.closest('.course-item');
            const courseTitle = courseItem.querySelector('h3').textContent;
            
            if (confirm(`确定要发布《${courseTitle}》课程吗？`)) {
                // 这里应该有发布课程的API调用
                // 模拟发布成功
                courseItem.remove(); // 从草稿列表中移除
                showToast('课程已成功发布');
                
                // 刷新已发布课程列表 (实际应该是API请求)
                // 这里简单模拟添加到已发布列表
                const publishedList = document.querySelector('.published-courses .course-list');
                if (publishedList) {
                    const newItem = document.createElement('div');
                    newItem.className = 'course-item';
                    newItem.innerHTML = `
                        <div class="course-img">
                            <img src="images/default-course-cover.svg" alt="课程封面" onerror="this.src='images/default-course-cover.svg'">
                        </div>
                        <div class="course-info">
                            <h3>${courseTitle}</h3>
                            <div class="course-meta">
                                <span class="course-students"><i class="bi bi-people"></i> 0 学生</span>
                                <span class="course-rating"><i class="bi bi-star-fill"></i> 0.0</span>
                                <span class="course-status published">已发布</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            <button class="btn-edit-course">编辑</button>
                            <button class="btn-toggle-status">下架</button>
                        </div>
                    `;
                    publishedList.appendChild(newItem);
                    
                    // 为新添加的元素绑定事件
                    bindCourseItemEvents();
                }
            }
        });
    });
}

function loadCourses() {
    // 模拟从API获取课程数据
    // 实际应用中这里应该是一个AJAX请求
    const publishedCoursesData = [
        {
            id: 1,
            title: 'Web前端开发入门',
            cover: 'images/default-course-cover.svg',
            students: 235,
            rating: 4.7,
            status: 'published',
            duration: 12,
            chapters: 8,
            difficulty: 'beginner',
            language: 'chinese',
            releaseDate: '2023-03-15'
        },
        {
            id: 2,
            title: 'JavaScript高级编程',
            cover: 'images/default-course-cover.svg',
            students: 178,
            rating: 4.9,
            status: 'published',
            duration: 16,
            chapters: 12,
            difficulty: 'intermediate',
            language: 'chinese',
            releaseDate: '2023-05-10'
        }
    ];
    
    const draftCoursesData = [
        {
            id: 3,
            title: 'Vue.js实战教程',
            cover: 'images/default-course-cover.svg',
            lastEdit: '2天前',
            progress: 80,
            status: 'draft',
            duration: 10,
            chapters: 6,
            difficulty: 'intermediate',
            language: 'chinese',
            releaseDate: ''
        }
    ];
    
    // 将课程数据存储在全局变量中，方便其他函数使用
    window.coursesData = [...publishedCoursesData, ...draftCoursesData];
}

function getCourseDataByTitle(title) {
    // 模拟课程数据
    const coursesData = {
        'Web前端开发入门': {
            title: 'Web前端开发入门',
            category: '计算机科学',
            description: 'HTML、CSS和JavaScript基础，帮助初学者快速入门Web前端开发。',
            duration: '30',
            chapters: '12',
            difficulty: 'beginner',
            language: 'chinese',
            releaseDate: '2023-09-15',
            cover: 'images/default-course-cover.svg'
        },
        'JavaScript高级编程': {
            title: 'JavaScript高级编程',
            category: '计算机科学',
            description: '深入讲解JavaScript高级特性与设计模式，提升前端开发能力。',
            duration: '45',
            chapters: '15',
            difficulty: 'advanced',
            language: 'chinese',
            releaseDate: '2023-10-20',
            cover: 'images/default-course-cover.svg'
        },
        'Vue.js实战教程': {
            title: 'Vue.js实战教程',
            category: '计算机科学',
            description: '从零开始学习Vue.js框架，通过实际项目掌握前端开发技能。',
            duration: '40',
            chapters: '10',
            difficulty: 'intermediate',
            language: 'chinese',
            releaseDate: '',
            cover: 'images/default-course-cover.svg'
        }
    };
    
    return coursesData[title] || {
        title: title,
        category: '计算机科学',
        description: '课程描述信息',
        duration: '30',
        chapters: '10',
        difficulty: 'beginner',
        language: 'chinese',
        releaseDate: '',
        cover: 'images/default-course-cover.svg'
    };
}

function openCreateCourseModal() {
    const modal = document.getElementById('createCourseModal');
    if (modal) {
        // 重置表单
        document.getElementById('createCourseForm').reset();
        document.getElementById('coverPreview').src = 'images/default-course-cover.svg';
        document.getElementById('videoUploadList').innerHTML = '<div class="empty-video-message">请上传课程视频</div>';
        
        // 显示模态框
        modal.classList.add('active');
    }
}

function closeCreateCourseModal() {
    const modal = document.getElementById('createCourseModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function openEditCourseModal(courseData) {
    const modal = document.getElementById('editCourseModal');
    if (modal) {
        // 填充表单数据
        document.getElementById('editCourseTitle').value = courseData.title || '';
        document.getElementById('editCourseCategory').value = courseData.category || '';
        document.getElementById('editCourseDescription').value = courseData.description || '';
        document.getElementById('editCourseDuration').value = courseData.duration || '';
        document.getElementById('editCourseChapters').value = courseData.chapters || '';
        document.getElementById('editCourseDifficulty').value = courseData.difficulty || '';
        document.getElementById('editCourseLanguage').value = courseData.language || '';
        document.getElementById('editCourseReleaseDate').value = courseData.releaseDate || '';
        
        // 显示封面预览
        if (courseData.cover) {
            document.getElementById('editCoverPreview').src = courseData.cover;
        } else {
            document.getElementById('editCoverPreview').src = 'images/default-course-cover.svg';
        }
        
        // 显示模态框
        modal.classList.add('active');
    }
}

function closeEditCourseModal() {
    const modal = document.getElementById('editCourseModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function validateCourseForm(formId, isPublish = false) {
    const title = document.getElementById(`${formId}Title`).value;
    const category = document.getElementById(`${formId}Category`).value;
    const description = document.getElementById(`${formId}Description`).value;
    const duration = document.getElementById(`${formId}Duration`).value;
    const chapters = document.getElementById(`${formId}Chapters`).value;
    const difficulty = document.getElementById(`${formId}Difficulty`).value;
    const language = document.getElementById(`${formId}Language`).value;
    
    // 基本验证（如果是发布，则需要所有必填字段）
    if (!title) {
        showToast('课程标题不能为空', 'error');
        return false;
    }
    
    if (isPublish) {
        if (!category) {
            showToast('请选择课程分类', 'error');
            return false;
        }
        
        if (!description) {
            showToast('课程简介不能为空', 'error');
            return false;
        }
        
        if (!duration) {
            showToast('请填写课程总时长', 'error');
            return false;
        }
        
        if (!chapters) {
            showToast('请填写课程章节数', 'error');
            return false;
        }
        
        if (!difficulty) {
            showToast('请选择课程难度等级', 'error');
            return false;
        }
        
        if (!language) {
            showToast('请选择授课语言', 'error');
            return false;
        }
        
        // 视频检查
        const videoList = document.getElementById(`${formId === 'course' ? '' : 'edit'}VideoUploadList`);
        const hasVideos = videoList && !videoList.querySelector('.empty-video-message');
        const hasVideoItems = videoList && videoList.querySelectorAll('.video-item').length > 0;
        
        if (!hasVideos && !hasVideoItems) {
            showToast('请上传至少一个课程视频', 'error');
            return false;
        }
    }
    
    return true;
}

function saveDraft() {
    // 表单验证
    if (!validateCourseForm('course', false)) {
        return;
    }
    
    // 这里应该有保存草稿的API调用
    // 为了演示，我们直接显示成功消息并关闭模态框
    showToast('课程草稿保存成功！', 'success');
    closeCreateCourseModal();
}

function publishCourse() {
    // 表单验证
    if (!validateCourseForm('course', true)) {
        return;
    }
    
    // 这里应该有发布课程的API调用
    // 为了演示，我们直接显示成功消息并关闭模态框
    showToast('课程发布成功！', 'success');
    closeCreateCourseModal();
}

function saveEditCourse() {
    // 表单验证
    if (!validateCourseForm('editCourse', true)) {
        return;
    }
    
    // 这里应该有更新课程的API调用
    // 为了演示，我们直接显示成功消息并关闭模态框
    showToast('课程更新成功！', 'success');
    closeEditCourseModal();
}

function deleteCourse() {
    // 确认删除
    if (confirm('确定要删除这个课程吗？此操作不可恢复！')) {
        // 这里应该有删除课程的API调用
        // 为了演示，我们直接显示成功消息并关闭模态框
        showToast('课程已删除', 'info');
        closeEditCourseModal();
    }
}

function viewAllPublishedCourses(e) {
    e.preventDefault();
    // 这里应该跳转到完整的已发布课程页面
    // 或者在当前页面加载更多课程
    showToast('加载全部已发布课程...', 'info');
}

function viewAllDraftCourses(e) {
    e.preventDefault();
    // 这里应该跳转到完整的草稿课程页面
    // 或者在当前页面加载更多课程
    showToast('加载全部草稿课程...', 'info');
}

/**
 * 显示操作提示信息
 * @param {string} message - 提示信息
 * @param {string} type - 提示类型 (success, error, info, warning)
 */
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
    if (document.querySelector('#toast-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'toast-styles';
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

// 初始化页面
function initPage() {
    try {
        // 确保UserInfoManager已加载
        if (window.UserInfoManager) {
            // 先加载教师信息
            initTeacherInfo();
            
            // 然后加载课程数据
            loadCourses();
            
            // 设置事件监听器
            setupEventListeners();
            
            // 填充下拉菜单
            populateDropdowns();
            
            // 检查是否有hash参数来决定显示哪个课程列表
            const hash = window.location.hash;
            if (hash === '#draft') {
                showDraftCourses();
            } else {
                showPublishedCourses();
            }
            
            // 添加调试信息，帮助排查分类下拉菜单问题
            console.log('分类初始化完成', {
                'COURSE_CATEGORIES存在?': typeof COURSE_CATEGORIES !== 'undefined',
                '分类数量': typeof COURSE_CATEGORIES !== 'undefined' ? COURSE_CATEGORIES.length : 0
            });
        } else {
            console.warn('UserInfoManager 未加载，等待加载...');
            // 延迟重试
            setTimeout(initPage, 100);
        }
    } catch (error) {
        console.error('初始化页面时出错:', error);
    }
}

// 用标准分类填充下拉框
function populateDropdowns() {
    // 确保COURSE_CATEGORIES已定义
    if (typeof COURSE_CATEGORIES === 'undefined') {
        console.error('错误: COURSE_CATEGORIES未定义，请确保categories.js已正确加载');
        return;
    }

    console.log('开始填充课程分类下拉框...');
    
    // 填充课程分类下拉框
    const categorySelects = document.querySelectorAll('#courseCategory, #editCourseCategory');
    categorySelects.forEach(select => {
        if (select) {
            console.log('处理分类选择器:', select.id);
            
            // 保留默认选项
            const defaultOption = select.querySelector('option');
            select.innerHTML = '';
            select.appendChild(defaultOption);
            
            // 添加标准分类选项
            COURSE_CATEGORIES.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name; // 使用分类名称作为值
                option.textContent = category.name;
                select.appendChild(option);
                console.log(`添加分类选项: ${category.name}`);
            });
        } else {
            console.warn('未找到分类选择器元素');
        }
    });
    
    // 填充难度等级下拉框
    const difficultySelects = document.querySelectorAll('#courseDifficulty, #editCourseDifficulty');
    difficultySelects.forEach(select => {
        if (select) {
            // 保留默认选项
            const defaultOption = select.querySelector('option');
            select.innerHTML = '';
            select.appendChild(defaultOption);
            
            // 添加标准难度等级选项
            COURSE_DIFFICULTY.forEach(difficulty => {
                const option = document.createElement('option');
                option.value = difficulty.id;
                option.textContent = difficulty.name;
                select.appendChild(option);
            });
        }
    });
    
    // 填充课程语言下拉框
    const languageSelects = document.querySelectorAll('#courseLanguage, #editCourseLanguage');
    languageSelects.forEach(select => {
        if (select) {
            // 保留默认选项
            const defaultOption = select.querySelector('option');
            select.innerHTML = '';
            select.appendChild(defaultOption);
            
            // 添加标准语言选项
            COURSE_LANGUAGES.forEach(language => {
                const option = document.createElement('option');
                option.value = language.id;
                option.textContent = language.name;
                select.appendChild(option);
            });
        }
    });
}

// ... existing code ... 