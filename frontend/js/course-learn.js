// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载课程和课程进度数据
    loadCourseData();
    
    // 设置返回课程按钮
    setupBackButton();
});

// 绑定事件监听器
function bindEventListeners() {
    // 完成学习按钮
    const completeBtn = document.getElementById('completeBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            markLessonAsCompleted();
        });
    }
    
    // 上一课/下一课导航按钮
    const prevLessonBtn = document.getElementById('prevLessonBtn');
    if (prevLessonBtn) {
        prevLessonBtn.addEventListener('click', function() {
            navigateToLesson('prev');
        });
    }
    
    const nextLessonBtn = document.getElementById('nextLessonBtn');
    if (nextLessonBtn) {
        nextLessonBtn.addEventListener('click', function() {
            navigateToLesson('next');
        });
    }
    
    // 为每个课程章节添加点击事件
    const lessonItems = document.querySelectorAll('.lesson');
    lessonItems.forEach(function(item) {
        item.addEventListener('click', function() {
            // 获取当前课程的信息
            const lessonTitle = this.querySelector('.lesson-title').textContent;
            selectLesson(lessonTitle, this);
        });
    });
    
    // 章节标题点击展开/折叠
    const chapterHeaders = document.querySelectorAll('.chapter-header');
    chapterHeaders.forEach(function(header) {
        header.addEventListener('click', function() {
            const chapter = this.parentElement;
            const lessons = chapter.querySelector('.lessons');
            
            if (lessons.style.display === 'none') {
                lessons.style.display = 'block';
                this.querySelector('.chapter-toggle i').classList.remove('bi-chevron-down');
                this.querySelector('.chapter-toggle i').classList.add('bi-chevron-up');
            } else {
                lessons.style.display = 'none';
                this.querySelector('.chapter-toggle i').classList.remove('bi-chevron-up');
                this.querySelector('.chapter-toggle i').classList.add('bi-chevron-down');
            }
        });
    });
}

// 加载课程数据
function loadCourseData() {
    // 从URL获取课程ID和课时ID
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course') || 'default';
    const lessonId = urlParams.get('lesson');
    
    // 在实际应用中，这里应该从服务器获取课程数据
    console.log(`加载课程ID: ${courseId}, 课时ID: ${lessonId}`);
    
    // 如果有指定课时，直接跳转到该课时
    if (lessonId) {
        // 找到对应的课时并选中
        const lessons = document.querySelectorAll('.lesson');
        let targetLesson = null;
        
        lessons.forEach(function(lesson) {
            const title = lesson.querySelector('.lesson-title').textContent;
            if (title.includes(lessonId)) {
                targetLesson = lesson;
            }
        });
        
        if (targetLesson) {
            selectLesson(targetLesson.querySelector('.lesson-title').textContent, targetLesson);
        }
    }
    
    // 加载学习进度
    loadLearningProgress(courseId);
}

// 加载学习进度
function loadLearningProgress(courseId) {
    // 从localStorage获取学习进度
    const learningProgress = JSON.parse(localStorage.getItem(`courseProgress_${courseId}`)) || {
        overallProgress: 35,
        completedLessons: ['1.1 数据结构导论', '1.2 数组与链表']
    };
    
    // 更新整体进度
    const progressFill = document.getElementById('overallProgress');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill && progressPercent) {
        progressFill.style.width = `${learningProgress.overallProgress}%`;
        progressPercent.textContent = `${learningProgress.overallProgress}%`;
    }
    
    // 更新各课时的完成状态
    const lessons = document.querySelectorAll('.lesson');
    lessons.forEach(function(lesson) {
        const lessonTitle = lesson.querySelector('.lesson-title').textContent;
        const lessonStatus = lesson.querySelector('.lesson-status i');
        
        if (learningProgress.completedLessons.includes(lessonTitle)) {
            lesson.classList.add('completed');
            lessonStatus.className = 'bi bi-check-circle-fill';
        }
    });
    
    // 更新章节进度
    updateChapterProgress();
}

// 更新章节进度
function updateChapterProgress() {
    const chapters = document.querySelectorAll('.chapter');
    
    chapters.forEach(function(chapter) {
        const lessons = chapter.querySelectorAll('.lesson');
        const completedLessons = chapter.querySelectorAll('.lesson.completed');
        
        const progress = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;
        
        const progressElement = chapter.querySelector('.chapter-progress');
        if (progressElement) {
            progressElement.textContent = `${progress}%`;
        }
    });
}

// 选择课时
function selectLesson(lessonTitle, lessonElement) {
    // 移除所有active类
    const lessons = document.querySelectorAll('.lesson');
    lessons.forEach(function(item) {
        item.classList.remove('active');
    });
    
    // 添加active类到当前点击的课时
    lessonElement.classList.add('active');
    
    // 更新当前课时标题
    const currentLessonTitle = document.getElementById('currentLessonTitle');
    if (currentLessonTitle) {
        currentLessonTitle.textContent = lessonTitle;
    }
    
    // 加载课时内容（在实际应用中，这里应该从服务器获取）
    console.log(`加载课时: ${lessonTitle}`);
    
    // 模拟加载视频
    const videoElement = document.getElementById('lessonVideo');
    if (videoElement) {
        // 设置视频海报（占位图）
        videoElement.poster = `https://via.placeholder.com/1280x720?text=${lessonTitle}`;
    }
    
    // 更新URL，方便分享和书签（不刷新页面）
    const url = new URL(window.location.href);
    url.searchParams.set('lesson', lessonTitle.split(' ')[0]); // 使用课时编号作为参数
    window.history.replaceState({}, '', url);
    
    // 更新导航按钮状态
    updateNavigationButtons(lessonElement);
}

// 更新导航按钮状态
function updateNavigationButtons(currentLesson) {
    const prevButton = document.getElementById('prevLessonBtn');
    const nextButton = document.getElementById('nextLessonBtn');
    
    // 找到当前课时的前一个和后一个课时
    const prevLesson = currentLesson.previousElementSibling;
    const nextLesson = currentLesson.nextElementSibling;
    
    // 更新上一课按钮状态
    if (prevButton) {
        if (prevLesson) {
            prevButton.disabled = false;
            prevButton.classList.remove('disabled');
        } else {
            // 检查上一章的最后一课
            const currentChapter = currentLesson.closest('.chapter');
            const prevChapter = currentChapter.previousElementSibling;
            
            if (prevChapter && prevChapter.classList.contains('chapter')) {
                const prevChapterLessons = prevChapter.querySelectorAll('.lesson');
                if (prevChapterLessons.length > 0) {
                    prevButton.disabled = false;
                    prevButton.classList.remove('disabled');
                } else {
                    prevButton.disabled = true;
                    prevButton.classList.add('disabled');
                }
            } else {
                prevButton.disabled = true;
                prevButton.classList.add('disabled');
            }
        }
    }
    
    // 更新下一课按钮状态
    if (nextButton) {
        if (nextLesson) {
            nextButton.disabled = false;
            nextButton.classList.remove('disabled');
        } else {
            // 检查下一章的第一课
            const currentChapter = currentLesson.closest('.chapter');
            const nextChapter = currentChapter.nextElementSibling;
            
            if (nextChapter && nextChapter.classList.contains('chapter')) {
                const nextChapterLessons = nextChapter.querySelectorAll('.lesson');
                if (nextChapterLessons.length > 0) {
                    nextButton.disabled = false;
                    nextButton.classList.remove('disabled');
                } else {
                    nextButton.disabled = true;
                    nextButton.classList.add('disabled');
                }
            } else {
                nextButton.disabled = true;
                nextButton.classList.add('disabled');
            }
        }
    }
}

// 导航到上一课/下一课
function navigateToLesson(direction) {
    // 获取当前选中的课时
    const currentLesson = document.querySelector('.lesson.active');
    if (!currentLesson) return;
    
    let targetLesson = null;
    
    if (direction === 'prev') {
        // 尝试获取同一章节的上一课
        targetLesson = currentLesson.previousElementSibling;
        
        // 如果没有上一课，尝试获取上一章的最后一课
        if (!targetLesson) {
            const currentChapter = currentLesson.closest('.chapter');
            const prevChapter = currentChapter.previousElementSibling;
            
            if (prevChapter && prevChapter.classList.contains('chapter')) {
                const prevChapterLessons = prevChapter.querySelectorAll('.lesson');
                if (prevChapterLessons.length > 0) {
                    targetLesson = prevChapterLessons[prevChapterLessons.length - 1];
                }
            }
        }
    } else if (direction === 'next') {
        // 尝试获取同一章节的下一课
        targetLesson = currentLesson.nextElementSibling;
        
        // 如果没有下一课，尝试获取下一章的第一课
        if (!targetLesson) {
            const currentChapter = currentLesson.closest('.chapter');
            const nextChapter = currentChapter.nextElementSibling;
            
            if (nextChapter && nextChapter.classList.contains('chapter')) {
                const nextChapterLessons = nextChapter.querySelectorAll('.lesson');
                if (nextChapterLessons.length > 0) {
                    targetLesson = nextChapterLessons[0];
                }
            }
        }
    }
    
    // 如果找到目标课时，选中它
    if (targetLesson) {
        const lessonTitle = targetLesson.querySelector('.lesson-title').textContent;
        selectLesson(lessonTitle, targetLesson);
    }
}

// 标记课程为已完成
function markLessonAsCompleted() {
    // 获取当前课时
    const currentLessonElement = document.querySelector('.lesson.active');
    if (!currentLessonElement) return;
    
    const lessonTitle = currentLessonElement.querySelector('.lesson-title').textContent;
    
    // 获取课程ID
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course') || 'default';
    
    // 从localStorage获取学习进度
    let learningProgress = JSON.parse(localStorage.getItem(`courseProgress_${courseId}`)) || {
        overallProgress: 0,
        completedLessons: []
    };
    
    // 检查该课时是否已完成
    if (!learningProgress.completedLessons.includes(lessonTitle)) {
        // 添加到已完成列表
        learningProgress.completedLessons.push(lessonTitle);
        
        // 更新完成状态
        currentLessonElement.classList.add('completed');
        const lessonStatus = currentLessonElement.querySelector('.lesson-status i');
        if (lessonStatus) {
            lessonStatus.className = 'bi bi-check-circle-fill';
        }
        
        // 计算整体进度
        const totalLessons = document.querySelectorAll('.lesson').length;
        const completedCount = learningProgress.completedLessons.length;
        learningProgress.overallProgress = Math.round((completedCount / totalLessons) * 100);
        
        // 更新进度条
        const progressFill = document.getElementById('overallProgress');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressFill && progressPercent) {
            progressFill.style.width = `${learningProgress.overallProgress}%`;
            progressPercent.textContent = `${learningProgress.overallProgress}%`;
        }
        
        // 更新章节进度
        updateChapterProgress();
        
        // 保存到localStorage
        localStorage.setItem(`courseProgress_${courseId}`, JSON.stringify(learningProgress));
        
        // 提示用户
        showToast('恭喜完成本节学习！');
        
        // 自动跳转到下一课
        setTimeout(function() {
            navigateToLesson('next');
        }, 1500);
    } else {
        showToast('您已完成本节学习');
    }
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

// 设置返回课程按钮
function setupBackButton() {
    const backButton = document.getElementById('backToCourseBtn');
    if (backButton) {
        // 从URL获取课程ID
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course') || 'default';
        
        // 设置返回链接
        backButton.href = `course-detail.html?id=${courseId}`;
        
        // 添加点击事件
        backButton.addEventListener('click', function(e) {
            // 阻止默认的href行为以便我们可以控制导航
            e.preventDefault();
            
            // 保存当前学习进度（如果需要）
            console.log('返回课程详情页');
            
            // 手动导航到课程详情页
            window.location.href = `course-detail.html?id=${courseId}`;
        });
    }
} 