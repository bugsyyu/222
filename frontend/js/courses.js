// 模拟课程数据
const mockCourses = [
    {
        id: 1,
        title: "Python编程入门到实践",
        category: "计算机科学",
        instructor: "张教授",
        image: "https://picsum.photos/400/300?random=1",
        favorites: 1200,
        price: "¥299"
    },
    {
        id: 2,
        title: "Web前端开发实战",
        category: "计算机科学",
        instructor: "李老师",
        image: "https://picsum.photos/400/300?random=2",
        favorites: 980,
        price: "¥399"
    },
    {
        id: 3,
        title: "数据结构与算法",
        category: "计算机科学",
        instructor: "王教授",
        image: "https://picsum.photos/400/300?random=3",
        favorites: 850,
        price: "¥499"
    },
    {
        id: 4,
        title: "人工智能基础",
        category: "计算机科学",
        instructor: "刘教授",
        image: "https://picsum.photos/400/300?random=4",
        favorites: 760,
        price: "¥599"
    },
    {
        id: 5,
        title: "UI/UX设计原理",
        category: "艺术设计",
        instructor: "赵老师",
        image: "https://picsum.photos/400/300?random=5",
        favorites: 620,
        price: "¥349"
    },
    {
        id: 6,
        title: "商业分析与决策",
        category: "商业管理",
        instructor: "钱教授",
        image: "https://picsum.photos/400/300?random=6",
        favorites: 580,
        price: "¥449"
    },
    {
        id: 7,
        title: "英语口语提升",
        category: "语言学习",
        instructor: "孙老师",
        image: "https://picsum.photos/400/300?random=7",
        favorites: 1500,
        price: "¥249"
    },
    {
        id: 8,
        title: "高等数学基础",
        category: "数学",
        instructor: "周教授",
        image: "https://picsum.photos/400/300?random=8",
        favorites: 480,
        price: "¥399"
    }
];

// 全局变量保存最近的搜索内容
let lastSearchTerm = '';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    setupSearch();
    loadPopularCourses();
    loadCategories();
    setupCategoryCards();
    setActiveNavLink();
});

// 创建课程卡片HTML
function createCourseCard(course) {
    return `
        <div class="col-12 col-md-6 col-lg-3">
            <a href="course-detail.html?id=${course.id}" class="course-link">
                <div class="card course-card">
                    <img src="${course.image}" class="card-img-top" alt="${course.title}" onerror="this.src='images/default-course-cover.svg'">
                    <div class="card-body">
                        <div class="course-category">${course.category}</div>
                        <h5 class="card-title">${course.title}</h5>
                        <div class="instructor">
                            <i class="bi bi-person-circle"></i> ${course.instructor}
                        </div>
                        <div class="course-stats">
                            <div class="favorites">
                                <i class="bi bi-star"></i> ${course.favorites}收藏
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `;
}

// 加载热门课程
function loadPopularCourses() {
    const coursesContainer = document.getElementById('popularCourses');
    const coursesHTML = mockCourses.map(course => createCourseCard(course)).join('');
    coursesContainer.innerHTML = coursesHTML;
}

// 按分类筛选课程
function filterCoursesByCategory(category) {
    let filteredCourses;
    
    if (category === 'all') {
        filteredCourses = mockCourses;
    } else {
        filteredCourses = mockCourses.filter(course => 
            course.category === category
        );
    }
    
    const coursesContainer = document.getElementById('popularCourses');
    const coursesHTML = filteredCourses.map(course => createCourseCard(course)).join('');
    coursesContainer.innerHTML = coursesHTML;
    
    // 更新页面标题显示当前分类
    const sectionTitle = document.querySelector('.popular-courses-section .section-title');
    if (category === 'all') {
        sectionTitle.textContent = '热门课程';
    } else {
        sectionTitle.textContent = `${category}课程`;
    }
}

// 动态加载分类卡片
function loadCategories() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) return;
    
    let categoriesHTML = '';
    
    COURSE_CATEGORIES.forEach(category => {
        categoriesHTML += `
            <div class="col-6 col-md-4 col-lg-3">
                <a href="#" class="category-card" data-category="${category.name}">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="category-icon">
                                <i class="bi ${category.icon}"></i>
                            </div>
                            <h5 class="card-title">${category.name}</h5>
                            <p class="card-text">${category.description}</p>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
    
    categoriesContainer.innerHTML = categoriesHTML;
}

// 设置分类卡片点击事件
function setupCategoryCards() {
    // 等待DOM加载完成后再绑定事件
    setTimeout(() => {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 获取分类名称
                const categoryName = this.getAttribute('data-category');
                
                // 滚动到课程列表区域
                const coursesSection = document.querySelector('.popular-courses-section');
                const offset = 80; // 顶部偏移量，考虑固定导航栏
                const targetPosition = coursesSection.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 按分类筛选课程
                filterCoursesByCategory(categoryName);
            });
        });
    }, 100);
}

// 搜索功能
function setupSearch() {
    // 获取DOM元素并检查它们是否存在
    const overlaySearchInput = document.querySelector('#overlaySearchInput');
    const overlaySearchButton = document.querySelector('#overlaySearchButton');
    const searchIcon = document.querySelector('#searchIcon');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchAnimation = document.getElementById('searchAnimation');
    const searchForm = document.querySelector('.search-form');
    
    // 验证所有必要的元素都存在
    if (!searchIcon || !searchOverlay || !searchAnimation || !overlaySearchInput || !overlaySearchButton || !searchForm) {
        console.error('搜索所需的一个或多个元素不存在，搜索功能可能无法正常工作');
        return; // 如果缺少必要元素，则退出
    }
    
    // 初始化时确保覆盖层处于正确状态
    resetSearchOverlay();
    
    // 添加变量跟踪鼠标按下状态
    let isMouseDown = false;
    let isSelectingText = false;
    
    // 监听搜索输入框的鼠标按下事件
    overlaySearchInput.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        isSelectingText = true;
        e.stopPropagation(); // 阻止冒泡
    });
    
    // 监听整个文档的鼠标松开事件
    document.addEventListener('mouseup', function(e) {
        if (isMouseDown) {
            isMouseDown = false;
            // 如果正在选择文本，延迟一段时间后再允许关闭事件
            if (isSelectingText) {
                setTimeout(() => {
                    isSelectingText = false;
                }, 300);
            }
        }
    });
    
    // 搜索按钮点击事件 - 添加更精致的3D变换效果
    searchIcon.addEventListener('click', function(e) {
        try {
            // 阻止事件冒泡
            e.stopPropagation();
            
            // 3D旋转和缩放效果
            searchIcon.style.transform = 'rotateY(180deg) scale(0.5)';
            searchIcon.style.opacity = '0.5';
            
            // 等待图标动画完成后以更流畅的方式显示覆盖层
            setTimeout(() => {
                // 重置搜索图标
                searchIcon.style.transform = '';
                searchIcon.style.opacity = '';
                
                // 重置搜索表单状态 - 确保清除之前的内联样式
                searchForm.style = '';
                searchForm.classList.remove('animated');
                searchForm.classList.remove('focused');
                
                // 确保覆盖层可见并且样式正确
                ensureOverlayVisibility();
                
                // 激活搜索覆盖层
                searchOverlay.classList.add('active');
                
                // 使用动画序列使体验更顺滑
                setTimeout(() => {
                    // 确保表单显示正确
                    searchForm.style.opacity = '1';
                    searchForm.style.transform = 'translateY(0) scale(1)';
                    
                    // 立即添加放大效果
                    searchForm.classList.add('focused');
                    
                    // 恢复上次的搜索内容
                    if (lastSearchTerm && lastSearchTerm.trim() !== '') {
                        overlaySearchInput.value = lastSearchTerm;
                        overlaySearchInput.classList.add('has-content');
                        
                        // 将光标放在文本末尾
                        setTimeout(() => {
                            overlaySearchInput.selectionStart = overlaySearchInput.selectionEnd = overlaySearchInput.value.length;
                        }, 50);
                    }
                    
                    // 焦点设置到输入框
                    overlaySearchInput.focus();
                    
                    // 漂浮动画效果让表单更生动
                    searchForm.classList.add('animated');
                    
                    // 添加光标闪烁效果
                    overlaySearchInput.style.caretColor = 'transparent';
                    setTimeout(() => {
                        overlaySearchInput.style.caretColor = 'var(--primary-color)';
                    }, 600);
                }, 100);
            }, 300);
            
            // 阻止页面滚动
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('启动搜索覆盖层时出错:', error);
            resetSearchOverlay(); // 出错时重置状态
        }
    });
    
    // 点击搜索覆盖层空白区域关闭，但加强防止误触
    let lastClickTime = 0;
    searchOverlay.addEventListener('click', function(e) {
        // 防止快速双击和误触
        const now = new Date().getTime();
        if (now - lastClickTime < 300) {
            // 忽略太快的点击
            return;
        }
        lastClickTime = now;
        
        // 简化关闭逻辑：如果点击目标就是覆盖层自身而不是其子元素，则关闭搜索框
        // 这样更可靠，避免复杂的距离计算可能导致的问题
        if (e.target === searchOverlay && !isSelectingText) {
            closeSearchOverlay();
        }
    });
    
    // 测试用的辅助函数，用于检测点击关闭是否正常工作
    function debugClickPosition(event) {
        console.log('点击位置:', event.clientX, event.clientY);
        if (searchForm) {
            const rect = searchForm.getBoundingClientRect();
            console.log('搜索框位置:', rect);
        }
    }
    
    // 添加输入框放大功能 - 确保焦点事件正确设置
    overlaySearchInput.addEventListener('focus', function() {
        // 确保搜索框一直保持放大状态
        searchForm.classList.add('focused');
    });

    // 暂时移除输入框失去焦点时的缩小效果，保持放大状态
    // overlaySearchInput.addEventListener('blur', function() {
    //     // 仅当不执行搜索操作时才移除放大效果
    //     if (!overlaySearchButton.classList.contains('active')) {
    //         setTimeout(() => {
    //             searchForm.classList.remove('focused');
    //         }, 200);
    //     }
    // });
    
    // 阻止表单点击事件冒泡，并确保点击表单任何位置都聚焦到输入框
    searchForm.addEventListener('click', function(e) {
        // 点击表单任何位置都聚焦到输入框
        overlaySearchInput.focus();
        searchForm.classList.add('focused');
        e.stopPropagation();
    });
    
    // ESC 键关闭搜索覆盖层
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            closeSearchOverlay();
        }
    });
    
    // 封装关闭搜索覆盖层的函数
    function closeSearchOverlay() {
        try {
            // 移除放大效果
            searchForm.classList.remove('focused');
            
            // 保存当前输入框的内容到全局变量，以便下次打开时恢复
            if (overlaySearchInput && overlaySearchInput.value) {
                lastSearchTerm = overlaySearchInput.value;
            }
            
            // 让表单淡出
            searchForm.style.opacity = '0';
            searchForm.style.transform = 'translateY(40px) scale(0.95)';
            
            // 然后让覆盖层淡出
            setTimeout(() => {
                searchOverlay.classList.remove('active');
                
                // 设置一个延迟，让覆盖层的褪色动画完成
                setTimeout(() => {
                    document.body.style.overflow = ''; // 恢复滚动
                    
                    // 注意：不再清空搜索输入框的内容，只移除激活状态类
                    if (overlaySearchInput) {
                        overlaySearchInput.classList.remove('has-content');
                    }
                    
                    // 重置表单样式
                    searchForm.style = '';
                }, 400);
            }, 150);
        } catch (error) {
            console.error('关闭搜索覆盖层时出错:', error);
            resetSearchOverlay(); // 出错时强制重置状态
        }
    }
    
    // 确保搜索覆盖层可见性的函数
    function ensureOverlayVisibility() {
        searchOverlay.style.position = 'fixed';
        searchOverlay.style.top = '0';
        searchOverlay.style.left = '0';
        searchOverlay.style.width = '100%';
        searchOverlay.style.height = '100%';
        searchOverlay.style.zIndex = '2000';
        searchOverlay.style.display = 'flex';
        searchAnimation.style.zIndex = '2500';
    }
    
    // 重置搜索覆盖层状态的函数
    function resetSearchOverlay() {
        // 重置搜索覆盖层状态
        searchOverlay.classList.remove('active');
        searchOverlay.style.opacity = '0';
        searchOverlay.style.visibility = 'hidden';
        
        // 重置搜索动画状态
        searchAnimation.classList.remove('active');
        searchAnimation.style.opacity = '0';
        searchAnimation.style.visibility = 'hidden';
        
        // 重置输入框
        if (overlaySearchInput) {
            overlaySearchInput.value = '';
            overlaySearchInput.classList.remove('has-content');
            overlaySearchInput.style = '';
        }
        
        // 重置搜索按钮
        if (overlaySearchButton) {
            overlaySearchButton.style = '';
        }
        
        // 重置搜索表单
        if (searchForm) {
            searchForm.style = '';
            searchForm.classList.remove('animated');
            searchForm.classList.remove('focused');
        }
        
        // 确保可见性和z-index正确设置
        ensureOverlayVisibility();
        
        // 恢复页面滚动
        document.body.style.overflow = '';
    }
    
    // 搜索按钮点击事件
    if (overlaySearchButton) {
        overlaySearchButton.addEventListener('click', function(e) {
            e.stopPropagation();
            createRippleEffect(this);
            performSearch();
        });
    }
    
    // 表单提交事件
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // 搜索输入框事件
    if (overlaySearchInput) {
        // 点击输入框阻止冒泡
        overlaySearchInput.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // 每次输入内容时保存当前输入值
        overlaySearchInput.addEventListener('input', function() {
            // 保存当前输入的内容到全局变量
            lastSearchTerm = this.value;
            
            if (this.value.length > 0) {
                // 如果有输入内容，添加激活状态
                this.classList.add('has-content');
            } else {
                this.classList.remove('has-content');
            }
        });
        
        // 按下回车键搜索
        overlaySearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                // 添加键盘输入动画
                this.classList.add('pulse');
                setTimeout(() => {
                    this.classList.remove('pulse');
                    performSearch();
                }, 150);
            }
        });
    }

    // 创建水波纹效果
    function createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        // 计算最佳波纹大小 - 确保波纹足够大以覆盖整个按钮
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.5;
        
        // 设置波纹样式
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${rect.width / 2 - size / 2}px`;
        ripple.style.top = `${rect.height / 2 - size / 2}px`;
        
        // 添加3D效果
        ripple.style.transform = 'translate3d(0, 0, 0) scale(0)';
        ripple.style.transformOrigin = 'center center';
        
        // 添加到元素中
        element.appendChild(ripple);
        
        // 强制浏览器重绘以确保动画正确启动
        void ripple.offsetWidth;
        
        // 应用3D动画
        ripple.style.transform = 'translate3d(0, 0, 0) scale(1)';
        
        // 调整动画开始时的颜色
        ripple.style.opacity = '0.8';
        
        // 动画结束后移除
        setTimeout(() => {
            ripple.style.opacity = '0';
            setTimeout(() => {
                if (ripple && ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 300);
        }, 500);
    }

    function performSearch() {
        const searchTerm = overlaySearchInput.value.trim();
        
        if (searchTerm === '') {
            // 如果搜索词为空，显示提示并轻微震动输入框
            overlaySearchInput.classList.add('shake');
            setTimeout(() => {
                overlaySearchInput.classList.remove('shake');
            }, 500);
            return;
        }
        
        // 将搜索词保存到全局变量
        lastSearchTerm = searchTerm;
        
        // 隐藏搜索表单但保持背景模糊效果
        if (searchForm) {
            searchForm.style.opacity = '0';
            searchForm.style.transform = 'translateY(-20px) scale(0.95)';
        }
        
        setTimeout(() => {
            // 确保搜索动画元素存在并正确初始化
            if (!searchAnimation) {
                console.error('搜索动画元素不存在');
                return;
            }
            
            // 确保搜索动画可见，但完全透明（不带背景和模糊效果）
            searchAnimation.style.display = 'flex';
            searchAnimation.style.visibility = 'visible';
            searchAnimation.style.opacity = '0';
            
            // 清除所有可能影响背景的样式
            searchAnimation.style.backgroundColor = 'transparent !important';
            searchAnimation.style.backdropFilter = 'none !important';
            searchAnimation.style.webkitBackdropFilter = 'none !important';
            searchAnimation.style.background = 'none !important';
            
            // 强制重绘以确保样式更新被应用
            void searchAnimation.offsetWidth;
            
            // 显示搜索动画（仅显示动画本身，不带背景）
            searchAnimation.classList.add('active');
            searchAnimation.style.opacity = '1';
            
            // 添加更精致的3D转动动画
            const searchLoadingDots = searchAnimation.querySelectorAll('.search-loading div');
            if (searchLoadingDots && searchLoadingDots.length > 0) {
                searchLoadingDots.forEach((dot, index) => {
                    dot.style.transform = 'scale(0)';
                    
                    // 顺序显示动画点
                    setTimeout(() => {
                        dot.style.transform = 'scale(1) translateZ(0px)';
                    }, index * 50); // 更快的动画点出现
                });
                
                // 模拟API请求延迟 - 精简搜索时间
                setTimeout(() => {
                    // 优雅的淡出动画
                    searchLoadingDots.forEach((dot, index) => {
                        setTimeout(() => {
                            dot.style.transform = 'scale(0) translateZ(-20px)';
                        }, index * 30); // 更快的动画点消失
                    });
                    
                    setTimeout(() => {
                        searchAnimation.classList.remove('active');
                        searchAnimation.style.opacity = '0';
                        
                        // 现在关闭搜索覆盖层
                        searchOverlay.classList.remove('active');
                        
                        // 恢复页面滚动
                        document.body.style.overflow = '';
                        
                        // 完全重置搜索表单状态，确保下次打开时能正确显示
                        resetSearchForm();
                        
                        // 执行搜索并更新主内容区域
                        updateMainContentWithSearchResults(searchTerm);
                        
                        // 平滑滚动到结果区域
                        const coursesSection = document.querySelector('.popular-courses-section');
                        const offset = 80; // 顶部偏移量，考虑固定导航栏
                        const targetPosition = coursesSection.getBoundingClientRect().top + window.pageYOffset - offset;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                        
                        // 重置动画元素，为下次搜索做准备
                        setTimeout(() => {
                            if (searchLoadingDots) {
                                searchLoadingDots.forEach(dot => {
                                    dot.style.transform = '';
                                });
                            }
                        }, 500);
                    }, 400); // 更快的转场
                }, 1000); // 更短的搜索时间
            } else {
                console.error('搜索动画点元素不存在');
                // 如果动画点不存在，仍继续搜索流程
                setTimeout(() => {
                    searchAnimation.classList.remove('active');
                    searchOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                    resetSearchForm();
                    updateMainContentWithSearchResults(searchTerm);
                }, 1000);
            }
        }, 300);
    }
    
    // 修改重置搜索表单的函数，只有在明确执行搜索后才清空内容
    function resetSearchForm() {
        if (searchForm) {
            // 完全清除所有内联样式
            searchForm.removeAttribute('style');
            
            // 移除任何可能的动画类
            searchForm.classList.remove('animated');
            searchForm.classList.remove('focused');
            
            // 设置默认的初始状态样式
            searchForm.style.opacity = '0';
            searchForm.style.transform = 'translateY(40px) scale(0.95)';
        }
        
        if (overlaySearchInput) {
            // 搜索后清空搜索框内容和全局变量
            overlaySearchInput.value = '';
            lastSearchTerm = '';
            overlaySearchInput.classList.remove('has-content');
            overlaySearchInput.removeAttribute('style');
        }
        
        if (overlaySearchButton) {
            overlaySearchButton.removeAttribute('style');
        }
    }
    
    // 在用户关闭搜索覆盖层后，主内容区也显示搜索结果
    function updateMainContentWithSearchResults(searchTerm) {
        const filteredCourses = mockCourses.filter(course => 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const coursesContainer = document.getElementById('popularCourses');
        const sectionTitle = document.querySelector('.popular-courses-section .section-title');
        
        if (coursesContainer) {
            // 添加更动感的淡入效果
            coursesContainer.style.opacity = '0';
            coursesContainer.style.transform = 'translateY(30px)';
            coursesContainer.style.transition = 'opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            
            setTimeout(() => {
        if (filteredCourses.length === 0) {
            coursesContainer.innerHTML = `<div class="col-12 text-center py-5">
                <div class="empty-results">
                            <i class="bi bi-search" style="font-size: 3rem; color: var(--primary-color); opacity: 0.6;"></i>
                            <h3 style="margin-top: 1rem; font-weight: 600;">未找到相关课程</h3>
                            <p style="margin-top: 0.5rem; color: #888;">尝试使用其他关键词搜索</p>
                </div>
            </div>`;
        } else {
            const coursesHTML = filteredCourses.map(course => createCourseCard(course)).join('');
            coursesContainer.innerHTML = coursesHTML;
        }
        
                // 为标题添加更流畅的动画
                if (sectionTitle) {
                    sectionTitle.style.opacity = '0';
                    sectionTitle.style.transform = 'translateX(-30px)';
                    sectionTitle.style.transition = 'opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1), transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)';
                    
                    setTimeout(() => {
                        sectionTitle.textContent = `搜索结果: "${searchTerm}" (${filteredCourses.length})`;
                        sectionTitle.style.opacity = '1';
                        sectionTitle.style.transform = 'translateX(0)';
                    }, 100);
                }
                
                // 为内容区添加流畅的显示动画
                setTimeout(() => {
                    coursesContainer.style.opacity = '1';
                    coursesContainer.style.transform = 'translateY(0)';
                    
                    // 为每个课程卡片添加顺序出现的动画，更强调3D效果
                    const courseCards = coursesContainer.querySelectorAll('.course-card');
                    courseCards.forEach((card, index) => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(40px) scale(0.95)';
                        card.style.transition = 'opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1), transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
                        
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0) scale(1)';
                            
                            // 鼠标悬停效果增强
                            card.addEventListener('mouseenter', () => {
                                card.style.transform = 'translateY(-10px) scale(1.03)';
                                card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.05)';
                            });
                            
                            card.addEventListener('mouseleave', () => {
                                card.style.transform = 'translateY(0) scale(1)';
                                card.style.boxShadow = '';
                            });
                        }, 100 + (index * 80)); // 每个卡片错开80ms出现
                    });
                }, 200);
            }, 300);
        }
    }

    // 添加动画相关的CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shakeInput {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            50% { transform: translateX(10px); }
            75% { transform: translateX(-5px); }
        }
        
        .shake {
            animation: shakeInput 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        
        @keyframes pulseInput {
            0% { transform: scale(1); }
            50% { transform: scale(0.98); }
            100% { transform: scale(1); }
        }
        
        .pulse {
            animation: pulseInput 0.3s ease;
        }
        
        .has-content {
            color: #333;
            font-weight: 500;
        }
        
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(1);
                opacity: 0;
            }
        }
        
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// 设置分类卡片点击事件
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取分类名称
            const categoryTitle = this.querySelector('.card-title').textContent;
            
            // 滚动到课程列表区域
            const coursesSection = document.querySelector('.popular-courses-section');
            const offset = 80; // 顶部偏移量，考虑固定导航栏
            const targetPosition = coursesSection.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // 按分类筛选课程
            filterCoursesByCategory(categoryTitle);
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPopularCourses();
    setupSearch();
    setupCategoryCards();
    
    // 确保搜索图标和覆盖层正确初始化
    const searchIcon = document.getElementById('searchIcon');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchContainer = document.querySelector('.search-container');
    
    if (searchIcon && searchOverlay && searchContainer) {
        // 重置任何可能造成搜索框不稳定的状态
        searchOverlay.classList.remove('active');
        searchContainer.style.opacity = '';
        searchContainer.style.transform = '';
        
        // 确保 z-index 正确设置
        searchOverlay.style.zIndex = '2000';
    }
    
    // 添加额外的点击事件监听器到文档主体，以确保在出现问题时仍能关闭搜索框
    document.body.addEventListener('click', function(e) {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchForm = document.querySelector('.search-form');
        const searchIcon = document.getElementById('searchIcon');
        
        // 如果搜索覆盖层处于激活状态，但点击目标不是搜索图标、搜索表单或其子元素
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            const isSearchForm = searchForm && (e.target === searchForm || searchForm.contains(e.target));
            const isSearchIcon = searchIcon && (e.target === searchIcon || searchIcon.contains(e.target));
            
            if (!isSearchForm && !isSearchIcon && e.target !== searchOverlay) {
                // 如果点击发生在搜索表单之外，则关闭搜索覆盖层
                window.closeSearchOverlayGlobal();
            }
        }
    });
    
    // 修改全局关闭函数，保留搜索内容
    window.closeSearchOverlayGlobal = function() {
        const searchOverlay = document.getElementById('searchOverlay');
        const searchForm = document.querySelector('.search-form');
        const overlaySearchInput = document.getElementById('overlaySearchInput');
        
        // 保存当前输入框内容
        if (overlaySearchInput && overlaySearchInput.value) {
            lastSearchTerm = overlaySearchInput.value;
        }
        
        if (searchOverlay && searchForm) {
            // 移除放大效果
            searchForm.classList.remove('focused');
            
            // 让表单淡出
            searchForm.style.opacity = '0';
            searchForm.style.transform = 'translateY(40px) scale(0.95)';
            
            // 然后让覆盖层淡出
            setTimeout(() => {
                searchOverlay.classList.remove('active');
                
                // 设置一个延迟，让覆盖层的褪色动画完成
                setTimeout(() => {
                    document.body.style.overflow = ''; // 恢复滚动
                    
                    // 重置表单样式
                    searchForm.style = '';
                    
                    // 不清空输入框内容
                    if (overlaySearchInput) {
                        overlaySearchInput.classList.remove('has-content');
                    }
                }, 400);
            }, 150);
        }
    };
    
    // 添加窗口大小改变事件监听器以确保搜索覆盖层在窗口大小改变时保持稳定
    window.addEventListener('resize', () => {
        if (searchOverlay && searchOverlay.classList.contains('active')) {
            // 确保搜索覆盖层在窗口大小改变时保持全屏
            searchOverlay.style.width = '100%';
            searchOverlay.style.height = '100%';
        }
    });
    
    // 添加页面可见性变化事件监听器，以便在用户从其他标签页返回时重新初始化搜索覆盖层
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && searchOverlay) {
            if (!searchOverlay.classList.contains('active')) {
                // 如果页面可见但搜索覆盖层不活跃，重置它的状态
                searchOverlay.style.opacity = '0';
                searchOverlay.style.visibility = 'hidden';
            }
        }
    });
}); 