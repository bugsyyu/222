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
    
    // 从本地存储获取课程发布数量，如果没有则使用默认值
    const publishedCount = localStorage.getItem('teacherPublishedCoursesCount') || 4;
    
    // 教师统计数据
    const defaultStats = {
        published: publishedCount,
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
            
            // 查找课程数据
            let courseData;
            
            if (window.coursesData) {
                // 先在已发布课程中查找
                courseData = window.coursesData.publishedCourses.find(c => c.title === courseTitle);
                
                // 如果没找到，则在草稿课程中查找
                if (!courseData) {
                    courseData = window.coursesData.draftCourses.find(c => c.title === courseTitle);
                }
            }
            
            if (courseData) {
                // 使用课程数据填充表单并打开编辑模态框
            openEditCourseModal(courseData);
            } else {
                // 如果找不到课程数据，则使用标题生成默认数据
                const defaultCourseData = getCourseDataByTitle(courseTitle);
                openEditCourseModal(defaultCourseData);
            }
        });
    });
    
    // 绑定切换课程状态按钮
    document.querySelectorAll('.btn-toggle-status').forEach(button => {
        button.addEventListener('click', function() {
            const courseItem = this.closest('.course-item');
            const courseTitle = courseItem.querySelector('h3').textContent;
            
            // 查找对应的课程数据
            let courseData;
            let courseIndex = -1;
            let isPublished = true;
            
            if (window.coursesData) {
                // 检查是否在已发布课程中
                courseIndex = window.coursesData.publishedCourses.findIndex(c => c.title === courseTitle);
                
                if (courseIndex !== -1) {
                    courseData = window.coursesData.publishedCourses[courseIndex];
                    isPublished = true;
                } else {
                    // 如果不在已发布课程中，则检查草稿课程
                    courseIndex = window.coursesData.draftCourses.findIndex(c => c.title === courseTitle);
                    if (courseIndex !== -1) {
                        courseData = window.coursesData.draftCourses[courseIndex];
                        isPublished = false;
                    }
                }
            }
            
            if (courseData) {
                if (isPublished) {
                    // 确认是否要将课程下架
                    if (confirm(`确定要将《${courseTitle}》下架吗？`)) {
                        // 从已发布课程中移除
                        window.coursesData.publishedCourses.splice(courseIndex, 1);
                        
                        // 添加到草稿课程中
                        courseData.status = 'draft';
                        courseData.progress = courseData.progress || 90; // 设置默认进度
                        window.coursesData.draftCourses.push(courseData);
                        
                        // 更新统计信息
                        updateCourseStats(window.coursesData.publishedCourses, window.coursesData.draftCourses);
                        
                        // 更新按钮和状态标签
                this.textContent = '发布';
                        const statusElement = courseItem.querySelector('.course-status');
                        if (statusElement) {
                            statusElement.classList.remove('published');
                            statusElement.classList.add('draft');
                            statusElement.textContent = '草稿';
                        }
                        
                        // 如果是全部已发布课程页面，则删除当前项
                        const allCoursesGrid = document.getElementById('allPublishedCoursesGrid');
                        if (allCoursesGrid && courseItem.parentNode === allCoursesGrid) {
                            courseItem.style.opacity = '0';
                            courseItem.style.height = '0';
                            courseItem.style.transition = 'all 0.3s';
                            
                            setTimeout(() => {
                                courseItem.remove();
                                
                                // 检查是否没有课程了
                                if (window.coursesData.publishedCourses.length === 0) {
                                    allCoursesGrid.innerHTML = '<div class="empty-courses">暂无发布的课程</div>';
                                }
                            }, 300);
                        }
                        
                        showToast('课程已下架到草稿箱', 'success');
                    }
            } else {
                    // 确认是否要发布课程
                    if (confirm(`确定要发布《${courseTitle}》课程吗？`)) {
                        // 从草稿课程中移除
                        window.coursesData.draftCourses.splice(courseIndex, 1);
                        
                        // 添加到已发布课程中
                        courseData.status = 'published';
                        courseData.students = courseData.students || 0;
                        courseData.rating = courseData.rating || 0;
                        window.coursesData.publishedCourses.push(courseData);
                        
                        // 更新按钮和状态标签
                this.textContent = '下架';
                        const statusElement = courseItem.querySelector('.course-status');
                        if (statusElement) {
                            statusElement.classList.remove('draft');
                            statusElement.classList.add('published');
                            statusElement.textContent = '已发布';
                        }
                        
                        // 如果是全部草稿课程页面，则删除当前项
                        const allDraftGrid = document.getElementById('allDraftCoursesGrid');
                        if (allDraftGrid && courseItem.parentNode === allDraftGrid) {
                            courseItem.style.opacity = '0';
                            courseItem.style.height = '0';
                            courseItem.style.transition = 'all 0.3s';
                            
                            setTimeout(() => {
                                courseItem.remove();
                                
                                // 检查是否没有课程了
                                if (window.coursesData.draftCourses.length === 0) {
                                    allDraftGrid.innerHTML = '<div class="empty-courses">暂无草稿课程</div>';
                                }
                            }, 300);
                        }
                        
                        // 更新统计信息
                        updateCourseStats(window.coursesData.publishedCourses, window.coursesData.draftCourses);
                        
                        showToast('课程已成功发布', 'success');
                    }
                }
            } else {
                showToast('找不到课程数据', 'error');
            }
        });
    });
    
    // 绑定发布课程按钮 (专门用于草稿列表中的发布按钮)
    document.querySelectorAll('.btn-publish-course').forEach(button => {
        button.addEventListener('click', function() {
            const courseItem = this.closest('.course-item');
            const courseTitle = courseItem.querySelector('h3').textContent;
            
            // 查找对应的课程数据
            let courseData;
            let courseIndex = -1;
            
            if (window.coursesData) {
                // 在草稿课程中查找
                courseIndex = window.coursesData.draftCourses.findIndex(c => c.title === courseTitle);
                if (courseIndex !== -1) {
                    courseData = window.coursesData.draftCourses[courseIndex];
                }
            }
            
            if (courseData && confirm(`确定要发布《${courseTitle}》课程吗？`)) {
                // 从草稿课程中移除
                window.coursesData.draftCourses.splice(courseIndex, 1);
                
                // 添加到已发布课程中
                courseData.status = 'published';
                courseData.students = courseData.students || 0;
                courseData.rating = courseData.rating || 0;
                window.coursesData.publishedCourses.push(courseData);
                
                // 更新统计信息
                updateCourseStats(window.coursesData.publishedCourses, window.coursesData.draftCourses);
                
                // 如果是在主页面，从草稿列表中移除并添加到已发布列表
                const draftList = document.querySelector('.draft-courses .course-list');
                if (draftList && courseItem.parentNode === draftList) {
                    // 从草稿列表中移除
                    courseItem.remove();
                    
                    // 添加到已发布列表
                const publishedList = document.querySelector('.published-courses .course-list');
                if (publishedList) {
                        const newCourseItem = document.createElement('div');
                        newCourseItem.className = 'course-item';
                        newCourseItem.innerHTML = `
                        <div class="course-img">
                                <img src="${courseData.cover}" alt="${courseData.title}" onerror="this.src='images/default-course-cover.svg'">
                        </div>
                        <div class="course-info">
                                <h3>${courseData.title}</h3>
                            <div class="course-meta">
                                    <span class="course-favorites"><i class="bi bi-star"></i> ${courseData.students} 收藏</span>
                                <span class="course-status published">已发布</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            <button class="btn-edit-course">编辑</button>
                            <button class="btn-toggle-status">下架</button>
                        </div>
                    `;
                        
                        // 如果已发布列表已有2个课程，移除最后一个
                        const publishedItems = publishedList.querySelectorAll('.course-item');
                        if (publishedItems.length >= 2) {
                            publishedItems[publishedItems.length - 1].remove();
                        }
                        
                        // 添加到列表顶部
                        if (publishedList.firstChild) {
                            publishedList.insertBefore(newCourseItem, publishedList.firstChild);
                        } else {
                            publishedList.appendChild(newCourseItem);
                        }
                    }
                } else {
                    // 如果是在全部草稿页面，直接移除
                    const allDraftGrid = document.getElementById('allDraftCoursesGrid');
                    if (allDraftGrid && courseItem.parentNode === allDraftGrid) {
                        courseItem.remove();
                        
                        // 检查是否没有草稿课程了
                        if (window.coursesData.draftCourses.length === 0) {
                            allDraftGrid.innerHTML = '<div class="empty-courses">暂无草稿课程</div>';
                        }
                    }
                }
                
                // 重新绑定事件
                bindCourseItemEvents();
                
                showToast('课程已成功发布', 'success');
            } else if (!courseData) {
                showToast('找不到课程数据', 'error');
            }
        });
    });
}

function loadCourses() {
    // 调用模拟的API获取课程数据
    fetchCoursesData()
        .then(data => {
            const { publishedCoursesData, draftCoursesData } = data;
            
            // 将课程数据存储在全局变量中，方便其他函数使用
            window.coursesData = { publishedCourses: publishedCoursesData, draftCourses: draftCoursesData };
            
            // 更新页面上的课程数量统计
            updateCourseStats(publishedCoursesData, draftCoursesData);
            
            // 更新课程列表展示
            updateCourseListDisplay(publishedCoursesData, draftCoursesData);
        })
        .catch(error => {
            console.error('获取课程数据失败:', error);
            showToast('获取课程数据失败，请稍后重试', 'error');
        });
}

/**
 * 从后端API获取课程数据
 * 目前使用模拟数据，后续可替换为实际API调用
 * @return {Promise} 包含课程数据的Promise对象
 */
function fetchCoursesData() {
    return new Promise((resolve, reject) => {
        // 模拟网络延迟
        setTimeout(() => {
            try {
                // 这里是模拟的数据
                // 实际应用中会替换为 fetch('/api/teacher/courses') 或类似的API调用
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
                    },
                    {
                        id: 4,
                        title: 'PHP后端开发基础',
                        cover: 'images/default-course-cover.svg',
                        students: 156,
                        rating: 4.5,
                        status: 'published',
                        duration: 14,
                        chapters: 10,
                        difficulty: 'beginner',
                        language: 'chinese',
                        releaseDate: '2023-07-20'
                    },
                    {
                        id: 5,
                        title: '数据库设计与优化',
                        cover: 'images/default-course-cover.svg',
                        students: 125,
                        rating: 4.6,
                        status: 'published',
                        duration: 18,
                        chapters: 15,
                        difficulty: 'intermediate',
                        language: 'chinese',
                        releaseDate: '2023-08-05'
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
                    },
                    {
                        id: 6,
                        title: '响应式网页设计入门',
                        cover: 'images/default-course-cover.svg',
                        lastEdit: '3天前',
                        progress: 65,
                        status: 'draft',
                        duration: 8,
                        chapters: 5,
                        difficulty: 'beginner',
                        language: 'chinese',
                        releaseDate: ''
                    },
                    {
                        id: 7,
                        title: 'Node.js后端开发实践',
                        cover: 'images/default-course-cover.svg',
                        lastEdit: '1周前',
                        progress: 40,
                        status: 'draft',
                        duration: 12,
                        chapters: 8,
                        difficulty: 'intermediate',
                        language: 'chinese',
                        releaseDate: ''
                    }
                ];
                
                resolve({ publishedCoursesData, draftCoursesData });
            } catch (error) {
                reject(error);
            }
        }, 300); // 添加300ms延迟模拟网络请求
    });
}

/**
 * 更新课程列表显示
 * @param {Array} publishedCourses - 已发布课程数据
 * @param {Array} draftCourses - 草稿课程数据
 */
function updateCourseListDisplay(publishedCourses, draftCourses) {
    // 更新已发布课程列表
    const publishedList = document.querySelector('.published-courses .course-list');
    if (publishedList) {
        publishedList.innerHTML = '';
        
        // 首页只显示最多2门已发布课程
        if (publishedCourses.length > 0) {
            // 只显示前两个课程
            const displayedCourses = publishedCourses.slice(0, 2);
            displayedCourses.forEach(course => {
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item';
                courseItem.innerHTML = `
                    <div class="course-img">
                        <img src="${course.cover}" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                    </div>
                    <div class="course-info">
                        <h3>${course.title}</h3>
                        <div class="course-meta">
                            <span class="course-favorites"><i class="bi bi-star"></i> ${course.students || 0} 收藏</span>
                            <span class="course-status published">已发布</span>
                        </div>
                    </div>
                    <div class="course-actions">
                        <button class="btn-edit-course">编辑</button>
                        <button class="btn-toggle-status">下架</button>
                    </div>
                `;
                publishedList.appendChild(courseItem);
            });
            
            // 如果有更多课程，添加一个提示信息
            if (publishedCourses.length > 2) {
                const moreCoursesMsg = document.createElement('div');
                moreCoursesMsg.className = 'more-courses-hint';
                moreCoursesMsg.innerHTML = `<i class="bi bi-info-circle"></i> 还有 ${publishedCourses.length - 2} 门课程未显示，点击下方"查看全部"按钮查看更多。`;
                publishedList.appendChild(moreCoursesMsg);
            }
        } else {
            publishedList.innerHTML = '<div class="empty-course-message">暂无已发布课程</div>';
        }
    }
    
    // 更新草稿课程列表
    const draftList = document.querySelector('.draft-courses .course-list');
    if (draftList) {
        draftList.innerHTML = '';
        
        // 首页只显示最多2门草稿课程
        if (draftCourses.length > 0) {
            // 只显示前两个草稿课程
            const displayedDrafts = draftCourses.slice(0, 2);
            displayedDrafts.forEach(course => {
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item';
                courseItem.innerHTML = `
                    <div class="course-img">
                        <img src="${course.cover}" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                    </div>
                    <div class="course-info">
                        <h3>${course.title}</h3>
                        <div class="course-meta">
                            <span class="course-progress">${course.progress || 0}% 完成</span>
                            <span class="course-status draft">草稿</span>
                        </div>
                    </div>
                    <div class="course-actions">
                        <button class="btn-edit-course">继续编辑</button>
                        <button class="btn-publish-course">发布</button>
                    </div>
                `;
                draftList.appendChild(courseItem);
            });
            
            // 如果有更多草稿，添加一个提示信息
            if (draftCourses.length > 2) {
                const moreDraftsMsg = document.createElement('div');
                moreDraftsMsg.className = 'more-courses-hint';
                moreDraftsMsg.innerHTML = `<i class="bi bi-info-circle"></i> 还有 ${draftCourses.length - 2} 门草稿未显示，点击下方"查看全部"按钮查看更多。`;
                draftList.appendChild(moreDraftsMsg);
            }
        } else {
            draftList.innerHTML = '<div class="empty-course-message">暂无草稿课程</div>';
        }
    }
    
    // 重新绑定事件
    bindCourseItemEvents();
    
    // 存储完整的课程数据，供"查看全部"功能使用
    window.coursesData = { publishedCourses, draftCourses };
}

/**
 * 更新页面上的课程统计数据
 * @param {Array} publishedCourses - 已发布课程数据
 * @param {Array} draftCourses - 草稿课程数据
 */
function updateCourseStats(publishedCourses, draftCourses) {
    // 更新已发布课程数量
    const publishedCountElement = document.getElementById('stats-published');
    if (publishedCountElement) {
        publishedCountElement.textContent = publishedCourses.length;
    }
    
    // 储存课程数量到localStorage，以便其他页面可以访问
    localStorage.setItem('teacherPublishedCoursesCount', publishedCourses.length);
    localStorage.setItem('teacherDraftCoursesCount', draftCourses.length);
    
    // 更新"查看全部"按钮上的文字，显示课程数量
    const viewAllPublishedBtn = document.getElementById('viewAllPublishedCourses');
    if (viewAllPublishedBtn) {
        viewAllPublishedBtn.textContent = `查看全部已发布课程 (${publishedCourses.length})`;
    }
    
    const viewAllDraftBtn = document.getElementById('viewAllDraftCourses');
    if (viewAllDraftBtn) {
        viewAllDraftBtn.textContent = `查看全部草稿 (${draftCourses.length})`;
    }
    
    // 更新页面上任何可能显示的全部已发布课程页面的标题
    const allCoursesTitle = document.querySelector('.courses-header h1');
    if (allCoursesTitle && allCoursesTitle.textContent.includes('已发布课程')) {
        allCoursesTitle.textContent = `已发布课程 (${publishedCourses.length})`;
    }
    
    // 更新页面上任何可能显示的全部草稿课程页面的标题
    const allDraftsTitle = document.querySelector('.courses-header h1');
    if (allDraftsTitle && allDraftsTitle.textContent.includes('草稿课程')) {
        allDraftsTitle.textContent = `草稿课程 (${draftCourses.length})`;
    }
    
    // 确保window.coursesData的结构正确
    if (window.coursesData) {
        window.coursesData.publishedCourses = publishedCourses;
        window.coursesData.draftCourses = draftCourses;
    }
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
        },
        'PHP后端开发基础': {
            title: 'PHP后端开发基础',
            category: '计算机科学',
            description: 'PHP语言基础、Web后端开发流程、数据库交互与项目实战。',
            duration: '35',
            chapters: '14',
            difficulty: 'beginner',
            language: 'chinese',
            releaseDate: '2023-07-20',
            cover: 'images/default-course-cover.svg'
        },
        '数据库设计与优化': {
            title: '数据库设计与优化',
            category: '计算机科学',
            description: '数据库设计原则、SQL优化技巧、性能调优与高可用架构设计。',
            duration: '40',
            chapters: '15',
            difficulty: 'intermediate',
            language: 'chinese',
            releaseDate: '2023-08-05',
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
        const titleInput = document.getElementById('editCourseTitle');
        titleInput.value = courseData.title || '';
        // 保存原始标题用于后续查找
        titleInput.dataset.originalTitle = courseData.title;
        
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

/**
 * 向后端API发送课程状态更新请求
 * 目前使用模拟实现，后续可替换为实际API调用
 * @param {string} action - 操作类型：'save', 'publish', 'unpublish', 'delete'
 * @param {Object} courseData - 课程数据
 * @return {Promise} 操作结果Promise
 */
function apiUpdateCourse(action, courseData) {
    return new Promise((resolve, reject) => {
        // 模拟网络延迟
        setTimeout(() => {
            try {
                console.log(`API操作: ${action}`, courseData);
                
                // 模拟操作成功
                // 在实际应用中，这里会是一个fetch或axios请求
                // 例如: fetch('/api/courses', { method: 'POST', body: JSON.stringify(courseData) })
                
                // 确保localStorage中的计数与全局数据一致
                const publishedCourses = window.coursesData.filter(c => c.status === 'published');
                const draftCourses = window.coursesData.filter(c => c.status === 'draft');
                
                localStorage.setItem('teacherPublishedCoursesCount', publishedCourses.length);
                localStorage.setItem('teacherDraftCoursesCount', draftCourses.length);
                
                // 触发自定义事件，让其他组件可以监听课程数据变化
                const updateEvent = new CustomEvent('course-data-updated', {
                    detail: {
                        action,
                        courseData,
                        publishedCount: publishedCourses.length,
                        draftCount: draftCourses.length
                    }
                });
                document.dispatchEvent(updateEvent);
                
                resolve({ success: true, message: `课程成功${getActionName(action)}` });
            } catch (error) {
                reject({ success: false, message: `操作失败: ${error.message}` });
            }
        }, 500); // 添加500ms延迟模拟网络请求
    });
}

/**
 * 获取操作对应的中文名称
 * @param {string} action - 操作类型
 * @return {string} 操作中文名称
 */
function getActionName(action) {
    const actionMap = {
        'save': '保存',
        'publish': '发布',
        'unpublish': '下架',
        'delete': '删除'
    };
    return actionMap[action] || '更新';
}

/**
 * 保存新课程草稿
 */
function saveDraft() {
    // 表单验证
    if (!validateCourseForm('course', false)) {
        return;
    }
    
    // 收集表单数据
    const courseData = {
        title: document.getElementById('courseTitle').value,
        category: document.getElementById('courseCategory').value,
        description: document.getElementById('courseDescription').value,
        duration: document.getElementById('courseDuration').value,
        chapters: document.getElementById('courseChapters').value,
        difficulty: document.getElementById('courseDifficulty').value,
        language: document.getElementById('courseLanguage').value,
        releaseDate: document.getElementById('courseReleaseDate').value,
        status: 'draft',
        cover: document.getElementById('coverPreview').src,
        id: Date.now(), // 临时ID，实际应用中由后端生成
        progress: 50, // 默认进度
        lastEdit: '刚刚'
    };
    
    // 添加到课程数据
    window.coursesData.push(courseData);
    
    // 调用API保存课程
    apiUpdateCourse('save', courseData)
        .then(response => {
            // 更新课程计数
            const publishedCourses = window.coursesData.filter(c => c.status === 'published');
            const draftCourses = window.coursesData.filter(c => c.status === 'draft');
            updateCourseStats(publishedCourses, draftCourses);
            
            // 更新课程列表
            updateCourseListDisplay(publishedCourses, draftCourses);
            
    showToast('课程草稿保存成功！', 'success');
    closeCreateCourseModal();
        })
        .catch(error => {
            console.error('保存草稿失败:', error);
            showToast('保存失败，请重试', 'error');
        });
}

/**
 * 发布新课程
 */
function publishCourse() {
    // 表单验证
    if (!validateCourseForm('course', true)) {
        return;
    }
    
    // 收集表单数据
    const courseData = {
        title: document.getElementById('courseTitle').value,
        category: document.getElementById('courseCategory').value,
        description: document.getElementById('courseDescription').value,
        duration: document.getElementById('courseDuration').value,
        chapters: document.getElementById('courseChapters').value,
        difficulty: document.getElementById('courseDifficulty').value,
        language: document.getElementById('courseLanguage').value,
        releaseDate: document.getElementById('courseReleaseDate').value || new Date().toISOString().split('T')[0],
        status: 'published',
        cover: document.getElementById('coverPreview').src,
        id: Date.now(), // 临时ID，实际应用中由后端生成
        students: 0,
        rating: 0
    };
    
    // 添加到课程数据
    window.coursesData.push(courseData);
    
    // 调用API保存课程
    apiUpdateCourse('publish', courseData)
        .then(response => {
            // 更新课程计数
            const publishedCourses = window.coursesData.filter(c => c.status === 'published');
            const draftCourses = window.coursesData.filter(c => c.status === 'draft');
            updateCourseStats(publishedCourses, draftCourses);
            
            // 更新课程列表
            updateCourseListDisplay(publishedCourses, draftCourses);
            
    showToast('课程发布成功！', 'success');
    closeCreateCourseModal();
        })
        .catch(error => {
            console.error('发布课程失败:', error);
            showToast('发布失败，请重试', 'error');
        });
}

/**
 * 保存编辑的课程
 */
function saveEditCourse() {
    // 表单验证
    if (!validateCourseForm('editCourse', true)) {
        return;
    }
    
    // 获取当前编辑的课程标题
    const originalTitle = document.getElementById('editCourseTitle').dataset.originalTitle || document.getElementById('editCourseTitle').value;
    
    // 查找对应的课程数据
    const courseIndex = window.coursesData.findIndex(c => c.title === originalTitle);
    
    if (courseIndex !== -1) {
        // 获取课程原始状态
        const originalStatus = window.coursesData[courseIndex].status;
        
        // 更新课程数据
        const updatedCourse = {
            ...window.coursesData[courseIndex],
            title: document.getElementById('editCourseTitle').value,
            category: document.getElementById('editCourseCategory').value,
            description: document.getElementById('editCourseDescription').value,
            duration: document.getElementById('editCourseDuration').value,
            chapters: document.getElementById('editCourseChapters').value,
            difficulty: document.getElementById('editCourseDifficulty').value,
            language: document.getElementById('editCourseLanguage').value,
            releaseDate: document.getElementById('editCourseReleaseDate').value
        };
        
        // 如果有封面更新
        const editCoverPreview = document.getElementById('editCoverPreview');
        if (editCoverPreview && !editCoverPreview.src.includes('default-course-cover.svg')) {
            updatedCourse.cover = editCoverPreview.src;
        }
        
        // 更新全局数据
        window.coursesData[courseIndex] = updatedCourse;
        
        // 调用API更新课程
        apiUpdateCourse('save', updatedCourse)
            .then(response => {
                // 更新课程计数（如果状态有变化）
                if (updatedCourse.status !== originalStatus) {
                    const publishedCourses = window.coursesData.filter(c => c.status === 'published');
                    const draftCourses = window.coursesData.filter(c => c.status === 'draft');
                    updateCourseStats(publishedCourses, draftCourses);
                }
                
                // 更新显示的课程标题
                const courseItems = document.querySelectorAll('.course-item');
                for (let item of courseItems) {
                    const itemTitle = item.querySelector('h3')?.textContent;
                    if (itemTitle === originalTitle) {
                        item.querySelector('h3').textContent = updatedCourse.title;
                        // 如果有封面更新
                        const coverImg = item.querySelector('.course-img img');
                        if (coverImg && updatedCourse.cover) {
                            coverImg.src = updatedCourse.cover;
                        }
                    }
                }
                
    showToast('课程更新成功！', 'success');
    closeEditCourseModal();
            })
            .catch(error => {
                console.error('更新课程失败:', error);
                showToast('更新失败，请重试', 'error');
            });
    } else {
        showToast('找不到要更新的课程', 'error');
    }
}

function deleteCourse() {
    // 获取当前编辑的课程标题
    const courseTitle = document.getElementById('editCourseTitle').dataset.originalTitle || document.getElementById('editCourseTitle').value;
    
    // 确认删除
    if (courseTitle && confirm(`确定要删除《${courseTitle}》课程吗？此操作不可恢复！`)) {
        // 查找对应的课程数据
        const courseIndex = window.coursesData.findIndex(c => c.title === courseTitle);
        
        if (courseIndex !== -1) {
            const course = window.coursesData[courseIndex];
            
            // 从数据中移除
            window.coursesData.splice(courseIndex, 1);
            
            // 调用API删除课程
            apiUpdateCourse('delete', course)
                .then(response => {
                    // 计算新的发布和草稿课程
                    const publishedCourses = window.coursesData.filter(c => c.status === 'published');
                    const draftCourses = window.coursesData.filter(c => c.status === 'draft');
                    
                    // 更新统计信息
                    updateCourseStats(publishedCourses, draftCourses);
                    
                    // 从页面移除对应课程项
                    const courseItems = document.querySelectorAll('.course-item');
                    for (let item of courseItems) {
                        const itemTitle = item.querySelector('h3')?.textContent;
                        if (itemTitle === courseTitle) {
                            item.style.opacity = '0';
                            item.style.height = '0';
                            item.style.transition = 'all 0.3s';
                            
                            setTimeout(() => {
                                item.remove();
                                
                                // 检查对应的列表是否为空
                                if (course.status === 'published') {
                                    const publishedList = document.querySelector('.published-courses .course-list');
                                    if (publishedList && publishedList.children.length === 0) {
                                        publishedList.innerHTML = '<div class="empty-course-message">暂无已发布课程</div>';
                                    }
                                    
                                    const allPublishedGrid = document.getElementById('allPublishedCoursesGrid');
                                    if (allPublishedGrid && allPublishedGrid.children.length === 0) {
                                        allPublishedGrid.innerHTML = '<div class="empty-courses">暂无发布的课程</div>';
                                    }
                                } else {
                                    const draftList = document.querySelector('.draft-courses .course-list');
                                    if (draftList && draftList.children.length === 0) {
                                        draftList.innerHTML = '<div class="empty-course-message">暂无草稿课程</div>';
                                    }
                                    
                                    const allDraftGrid = document.getElementById('allDraftCoursesGrid');
                                    if (allDraftGrid && allDraftGrid.children.length === 0) {
                                        allDraftGrid.innerHTML = '<div class="empty-courses">暂无草稿课程</div>';
                                    }
                                }
                            }, 300);
                        }
                    }
                    
                    // 刷新主页课程列表
                    updateCourseListDisplay(publishedCourses, draftCourses);
                    
                    // 显示成功消息并关闭模态框
        showToast('课程已删除', 'info');
        closeEditCourseModal();
                })
                .catch(error => {
                    console.error('删除课程失败:', error);
                    showToast('删除失败，请重试', 'error');
                    
                    // 恢复数据（回滚）
                    window.coursesData.splice(courseIndex, 0, course);
                });
        } else {
            showToast('找不到要删除的课程', 'error');
        }
    }
}

function viewAllPublishedCourses(e) {
    e.preventDefault();
    
    // 获取已发布课程数据
    const publishedCourses = window.coursesData && window.coursesData.publishedCourses ? window.coursesData.publishedCourses : [];
    const publishedCount = publishedCourses.length;
    
    console.log("已发布课程数量:", publishedCount, "课程数据:", publishedCourses);
    
    // 创建页面内容
    const pageContainer = document.getElementById('pageContent');
    if (pageContainer) {
        pageContainer.innerHTML = `
            <div class="courses-container">
                <div class="courses-header">
                    <h1>已发布课程 (${publishedCount})</h1>
                    <button class="btn-back" id="backFromAllCoursesBtn"><i class="bi bi-arrow-left"></i> 返回</button>
                </div>
                <div class="courses-grid" id="allPublishedCoursesGrid">
                    ${publishedCount > 0 ? '' : '<div class="empty-courses">暂无发布的课程</div>'}
                </div>
                <div class="courses-footer">
                    <a href="#" class="btn btn-primary" id="viewAllPublishedBtn">查看全部已发布课程 (${publishedCount})</a>
                </div>
            </div>
        `;
        
        // 添加所有课程到网格
        if (publishedCount > 0) {
            const coursesGrid = document.getElementById('allPublishedCoursesGrid');
            
            if (coursesGrid) {
                // 添加课程卡片到网格
                publishedCourses.forEach(course => {
                    const courseCard = document.createElement('div');
                    courseCard.className = 'course-item';
                    courseCard.innerHTML = `
                        <div class="course-img">
                            <img src="${course.cover}" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                        </div>
                        <div class="course-info">
                            <h3>${course.title}</h3>
                            <div class="course-meta">
                                <span class="course-students"><i class="bi bi-people"></i> ${course.students || 0} 学生</span>
                                <span class="course-rating"><i class="bi bi-star-fill"></i> ${course.rating || 0}</span>
                                <span class="course-status published">已发布</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            <button class="btn-edit-course" data-course-id="${course.id}">编辑</button>
                            <button class="btn-toggle-status" data-course-id="${course.id}">下架</button>
                        </div>
                    `;
                    coursesGrid.appendChild(courseCard);
                });
                
                // 绑定事件
                bindCourseItemEvents();
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
        
        // 绑定查看全部按钮事件
        const viewAllBtn = document.getElementById('viewAllPublishedBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // 这里可以添加更多功能或者重定向到另一个页面
                showToast('当前已显示全部已发布课程', 'info');
            });
        }
    } else {
        showToast('加载全部已发布课程出错', 'error');
    }
}

function viewAllDraftCourses(e) {
    e.preventDefault();
    
    // 获取草稿课程数据
    const draftCourses = window.coursesData && window.coursesData.draftCourses ? window.coursesData.draftCourses : [];
    const draftCount = draftCourses.length;
    
    console.log("草稿课程数量:", draftCount, "课程数据:", draftCourses);
    
    // 创建页面内容
    const pageContainer = document.getElementById('pageContent');
    if (pageContainer) {
        pageContainer.innerHTML = `
            <div class="courses-container">
                <div class="courses-header">
                    <h1>草稿课程 (${draftCount})</h1>
                    <button class="btn-back" id="backFromAllDraftsBtn"><i class="bi bi-arrow-left"></i> 返回</button>
                </div>
                <div class="courses-grid" id="allDraftCoursesGrid">
                    ${draftCount > 0 ? '' : '<div class="empty-courses">暂无草稿课程</div>'}
                </div>
                <div class="courses-footer">
                    <a href="#" class="btn btn-primary" id="viewAllDraftsBtn">查看全部草稿 (${draftCount})</a>
                </div>
            </div>
        `;
        
        // 添加所有草稿课程到网格
        if (draftCount > 0) {
            const coursesGrid = document.getElementById('allDraftCoursesGrid');
            
            if (coursesGrid) {
                // 添加课程卡片到网格
                draftCourses.forEach(course => {
                    const courseCard = document.createElement('div');
                    courseCard.className = 'course-item';
                    courseCard.innerHTML = `
                        <div class="course-img">
                            <img src="${course.cover}" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                        </div>
                        <div class="course-info">
                            <h3>${course.title}</h3>
                            <div class="course-meta">
                                <span class="course-progress">${course.progress || 0}% 完成</span>
                                <span class="course-status draft">草稿</span>
                            </div>
                        </div>
                        <div class="course-actions">
                            <button class="btn-edit-course" data-course-id="${course.id}">继续编辑</button>
                            <button class="btn-publish-course" data-course-id="${course.id}">发布</button>
                        </div>
                    `;
                    coursesGrid.appendChild(courseCard);
                });
                
                // 绑定事件
                bindCourseItemEvents();
            }
        }
        
        // 显示页面内容
        pageContainer.style.display = 'block';
        
        // 返回按钮事件
        const backBtn = document.getElementById('backFromAllDraftsBtn');
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                pageContainer.style.display = 'none';
            });
        }
        
        // 绑定查看全部按钮事件
        const viewAllBtn = document.getElementById('viewAllDraftsBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                // 这里可以添加更多功能或者重定向到另一个页面
                showToast('当前已显示全部草稿课程', 'info');
            });
        }
    } else {
        showToast('加载全部草稿课程出错', 'error');
    }
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