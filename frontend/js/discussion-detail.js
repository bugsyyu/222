// discussion-detail.js - 处理讨论详情页面功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面功能
    initReplyButtons();
    setupEditorToolbar();
    setupDialogBox();
    updateUserRoleBadges();
    setupReplyEditor();
    
    console.log('==== 页面加载完成，开始初始化回复排序 ====');
    
    // 初始化嵌套回复折叠功能
    initNestedRepliesToggle();
    
    // 立即执行排序 - 确保所有静态回复按照时间顺序排列
    console.log('执行第一次排序...');
    sortReplies('asc');
    
    // 延迟200ms后再次排序，确保所有动态内容都已加载
    setTimeout(() => {
        console.log('执行延迟排序，以捕获动态加载的内容...');
        sortReplies('asc');
    }, 200);
    
    // 再次延迟1秒后检查并排序，以防有延迟加载的内容
    setTimeout(() => {
        console.log('执行最终排序检查...');
        sortReplies('asc');
        console.log('所有回复排序完成！');
    }, 1000);
    
    // 添加高亮效果的CSS
    document.head.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes highlight-comment {
            0% { background-color: #ffffff; }
            30% { background-color: rgba(79, 70, 229, 0.15); }
            100% { background-color: #ffffff; }
        }
        
        .post-card.highlight-effect {
            animation: highlight-comment 2s ease-out;
        }
    </style>
    `);
    
    // 修改跳转到父回复的逻辑，添加更明显的高亮效果
    document.querySelectorAll('.reply-parent-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 移除所有现有高亮
                document.querySelectorAll('.highlight-effect').forEach(el => {
                    el.classList.remove('highlight-effect');
                });
                
                // 添加高亮效果类
                targetElement.classList.add('highlight-effect');
                
                // 滚动到目标位置
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });
    
    // 添加测试数据 - 生成嵌套回复进行测试
    generateChronologicalReplies();
});

// 初始化回复按钮功能
function initReplyButtons() {
    // 为所有回复按钮添加事件处理
    document.querySelectorAll('.post-reply-btn').forEach(button => {
        button.addEventListener('click', handleReplyButtonClick);
    });
    
    // 取消回复按钮
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const textarea = document.querySelector('.editor-input');
            const replyEditor = document.querySelector('.reply-editor');
            
            // 如果有内容，显示确认对话框
            if (textarea.value.trim()) {
                showDialog();
            } else {
                // 如果没有内容，清空输入框
                textarea.value = '';
            }
        });
    }
    
    // 提交回复按钮
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const replyEditor = document.querySelector('.reply-editor');
            const content = replyEditor.querySelector('.editor-input').value.trim();
            const replyToId = replyEditor.dataset.replyTo || 'post1'; // 默认回复主帖
            
            if (!content) {
                alert('请输入回复内容');
                return;
            }
            
            // 调用回复函数处理回复
            handleReplySubmission(replyToId, content);
            
            // 清空输入框
            replyEditor.querySelector('.editor-input').value = '';
        });
    }
}

// 处理回复提交
function handleReplySubmission(parentId, content) {
    // 获取父回复信息
    const parentElement = document.getElementById(parentId);
    if (!parentElement) {
        // 如果没有找到，检查是否为嵌套回复的ID-nested格式
        const nestedId = parentId + "-nested";
        const nestedElement = document.getElementById(nestedId);
        if (nestedElement) {
            // 使用data-original-id获取原始ID
            const originalId = nestedElement.dataset.originalId;
            if (originalId) {
                // 使用原始ID进行处理
                return handleReplySubmission(originalId, content);
            }
        }
        return; // 如果依然找不到，退出函数
    }
    
    const parentUsername = parentElement.querySelector('.username').textContent;
    const currentUser = getCurrentUser() || {
        name: '测试用户',
        avatar: 'images/default-avatar.svg',
        role: 'learner'
    };
    
    // 生成唯一ID
    const replyId = 'reply' + Date.now();
    
    // 判断是主回复还是嵌套回复
    const isMainPost = parentId === 'post1';
    const isNestedReply = parentElement.classList.contains('nested-reply-card');
    
    // 第一种情况：回复主帖 - 创建为直接回复
    if (isMainPost) {
        // 直接添加为主回复
        addDirectReply(parentId, content, replyId, currentUser, false);
    }
    // 第二种情况：回复直接回复 - 创建为嵌套回复
    else if (!isNestedReply) {
        // 添加为嵌套回复
        addNestedReply(parentId, content, replyId, currentUser);
    }
    // 第三种情况：回复嵌套回复 - 创建为独立回复并引用嵌套回复的作者
    else {
        // 找到嵌套回复的独立版本ID
        let targetId = parentId;
        if (parentId.endsWith('-nested')) {
            // 如果是嵌套版本的ID，转换为独立版本ID
            targetId = parentElement.dataset.originalId || parentId.replace('-nested', '');
        }
        
        // 添加为独立回复，并设置引用标记
        addDirectReply(targetId, content, replyId, currentUser, true);
    }
    
    // 更新所有计数器
    updateRepliesCount();
}

// 添加直接回复（非嵌套）
function addDirectReply(parentId, content, replyId, currentUser, addReference) {
    // 获取主回复容器
    const repliesContainer = document.getElementById('chronologicalReplies');
    if (!repliesContainer) return;
    
    // 获取父元素的用户名
    const parentElement = document.getElementById(parentId);
    const parentUsername = parentElement ? parentElement.querySelector('.username').textContent : '';
    
    // 创建引用部分的HTML（如果需要）
    const referenceHtml = addReference ? `
        <div class="reply-reference">
            <i class="fas fa-quote-left"></i>
            回复给 <a href="#${parentId}" class="reply-parent-link">${parentUsername}</a>
            <span class="reply-timestamp">${formatDate(new Date())}</span>
        </div>
    ` : '';
    
    // 获取当前日期时间
    const now = new Date();
    const isoDate = now.toISOString();
    const timestamp = now.getTime();
    
    // 创建回复HTML
    const replyHtml = `
        <article class="post-card reply-card" id="${replyId}" data-original-reply="${parentId}" data-timestamp="${timestamp}" data-iso-date="${isoDate}">
            <div class="post-card-left">
                <div class="post-avatar">
                    <img src="${currentUser.avatar}" alt="用户头像" onerror="this.src='images/default-avatar.svg'">
                    <div class="user-role-badge ${currentUser.role}">${getUserRoleText(currentUser.role)}</div>
                </div>
            </div>
            <div class="post-card-right">
                ${referenceHtml}
                <div class="post-header">
                    <div class="post-author">
                        <span class="username">${currentUser.name}</span>
                        <span class="post-date">${formatDate(now)}</span>
                    </div>
                </div>
                <div class="post-content">
                    <p>${content}</p>
                </div>
                <div class="post-actions">
                    <button class="post-reply-btn" data-require-login="true" data-parent-id="${replyId}" data-parent-user="${currentUser.name}">
                        <i class="fas fa-reply"></i>
                        回复
                    </button>
                </div>
                <div class="nested-replies">
                    <!-- 嵌套回复会在后续添加 -->
                </div>
            </div>
        </article>
    `;
    
    // 添加回复到主容器（总是添加到底部 - 最早回复优先）
    repliesContainer.insertAdjacentHTML('beforeend', replyHtml);
    
    // 为新回复按钮和引用链接添加事件处理
    const newReplyElement = document.getElementById(replyId);
    if (newReplyElement) {
        // 回复按钮事件
        const newReplyButton = newReplyElement.querySelector('.post-reply-btn');
        if (newReplyButton) {
            newReplyButton.addEventListener('click', handleReplyButtonClick);
        }
        
        // 引用链接事件
        const parentLink = newReplyElement.querySelector('.reply-parent-link');
        if (parentLink) {
            parentLink.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // 高亮目标回复
                    document.querySelectorAll('.highlight-effect').forEach(el => {
                        el.classList.remove('highlight-effect');
                    });
                    targetElement.classList.add('highlight-effect');
                    
                    // 滚动到目标位置
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        }
    }
    
    // 重新排序所有回复，确保时间顺序正确
    sortReplies('asc');
    
    console.log(`已添加直接回复: ${replyId}，并重新排序`);
}

// 初始化所有嵌套回复的折叠/展开功能
function initNestedRepliesToggle() {
    // 查找所有嵌套回复容器
    const nestedRepliesContainers = document.querySelectorAll('.nested-replies');
    
    console.log(`找到 ${nestedRepliesContainers.length} 个嵌套回复容器`);
    
    // 为每个没有折叠按钮的容器创建按钮
    nestedRepliesContainers.forEach(container => {
        // 检查是否有内容
        const nestedReplies = container.querySelectorAll('.nested-reply-card');
        if (nestedReplies.length === 0) return; // 跳过空容器
        
        // 检查是否已有折叠按钮
        const parentCard = container.closest('.post-card-right');
        const existingButton = parentCard ? parentCard.querySelector('.nested-replies-toggle') : null;
        
        if (!existingButton) {
            // 创建新的折叠按钮
            createToggleButton(container, nestedReplies.length);
            console.log('为嵌套回复创建了新的折叠按钮');
        } else {
            // 更新现有的按钮以使用新样式
            updateExistingToggleButton(existingButton, nestedReplies.length);
        }
    });
    
    console.log('嵌套回复折叠功能初始化完成');
}

// 更新现有的折叠按钮为新样式
function updateExistingToggleButton(button, repliesCount) {
    // 保持按钮的折叠状态
    const isCollapsed = button.classList.contains('collapsed');
    
    // 清空内容
    button.innerHTML = '';
    
    // 创建新的图标元素
    const toggleIcon = document.createElement('div');
    toggleIcon.className = 'toggle-icon';
    button.appendChild(toggleIcon);
    
    // 创建文本和计数指示器
    const toggleText = document.createElement('span');
    toggleText.textContent = isCollapsed ? '展开回复' : '收起回复';
    button.appendChild(toggleText);
    
    const countIndicator = document.createElement('span');
    countIndicator.className = 'replies-count-indicator';
    countIndicator.textContent = `(${repliesCount}条)`;
    button.appendChild(countIndicator);
}

// 创建嵌套回复折叠/展开按钮
function createToggleButton(nestedReplies, nestedCount) {
    const parentElement = nestedReplies.closest('.post-card-right');
    
    // 检查是否已经有折叠按钮
    let existingToggle = parentElement.querySelector('.nested-replies-toggle');
    if (existingToggle) {
        // 更新已有按钮的计数
        const countIndicator = existingToggle.querySelector('.replies-count-indicator');
        if (countIndicator) {
            countIndicator.textContent = `(${nestedCount}条)`;
        }
        return existingToggle;
    }
    
    // 创建新的折叠按钮
    const toggleButton = document.createElement('div');
    toggleButton.className = 'nested-replies-toggle';
    
    // 创建新的图标元素
    const toggleIcon = document.createElement('div');
    toggleIcon.className = 'toggle-icon';
    toggleButton.appendChild(toggleIcon);
    
    // 创建文本和计数指示器
    const toggleText = document.createElement('span');
    toggleText.textContent = '收起回复';
    toggleButton.appendChild(toggleText);
    
    const countIndicator = document.createElement('span');
    countIndicator.className = 'replies-count-indicator';
    countIndicator.textContent = `(${nestedCount}条)`;
    toggleButton.appendChild(countIndicator);
    
    // 插入到父元素中，在嵌套回复区域之前
    parentElement.insertBefore(toggleButton, nestedReplies);
    
    // 添加点击事件
    toggleButton.addEventListener('click', function() {
        toggleNestedReplies(this, nestedReplies);
    });
    
    // 检查localStorage中是否有保存的展开/折叠状态
    const replyId = nestedReplies.closest('.post-card')?.id;
    if (replyId) {
        const isCollapsed = localStorage.getItem(`collapsed_${replyId}`) === 'true';
        if (isCollapsed) {
            // 设置折叠状态，无需动画
            toggleNestedReplies(toggleButton, nestedReplies, true);
        }
    }
    
    return toggleButton;
}

// 切换嵌套回复的折叠/展开状态
function toggleNestedReplies(toggleButton, nestedReplies, setCollapsed) {
    const isCollapsing = setCollapsed !== undefined ? setCollapsed : !toggleButton.classList.contains('collapsed');
    const textSpan = toggleButton.querySelector('span:not(.replies-count-indicator)');
    
    if (isCollapsing) {
        // 准备折叠：记录当前高度
        nestedReplies.style.height = `${nestedReplies.scrollHeight}px`;
        
        // 触发重排
        nestedReplies.offsetHeight;
        
        // 添加折叠类
        nestedReplies.classList.add('collapsed');
        toggleButton.classList.add('collapsed');
        
        // 更新文本
        if (textSpan) textSpan.textContent = '展开回复';
    } else {
        // 展开嵌套回复
        // 移除折叠类
        nestedReplies.classList.remove('collapsed');
        toggleButton.classList.remove('collapsed');
        
        // 更新文本
        if (textSpan) textSpan.textContent = '收起回复';
    }
    
    // 保存状态到localStorage
    const replyId = nestedReplies.closest('.post-card')?.id;
    if (replyId) {
        localStorage.setItem(`collapsed_${replyId}`, isCollapsing);
    }
    
    // 控制台输出
    console.log(`${isCollapsing ? '折叠' : '展开'}了嵌套回复区域`);
}

// 添加嵌套回复（仅添加为一级嵌套）
function addNestedReply(parentId, content, replyId, currentUser) {
    const parentElement = document.getElementById(parentId);
    if (!parentElement) return;
    
    // 查找或创建嵌套回复容器
    let nestedReplies = parentElement.querySelector('.nested-replies');
    let toggleButton = null;
    
    // 检查是否已有折叠按钮
    const existingToggle = parentElement.querySelector('.nested-replies-toggle');
    const isCurrentlyCollapsed = existingToggle ? existingToggle.classList.contains('collapsed') : false;
    
    if (!nestedReplies) {
        nestedReplies = document.createElement('div');
        nestedReplies.className = 'nested-replies';
        parentElement.querySelector('.post-card-right').appendChild(nestedReplies);
    }
    
    // 获取当前日期时间
    const now = new Date();
    const isoDate = now.toISOString();
    const timestamp = now.getTime();
    
    // 创建嵌套回复HTML - 添加跳转到独立回复的链接
    const replyHtml = `
        <article class="post-card nested-reply-card" id="${replyId}-nested" data-original-id="${replyId}" data-timestamp="${timestamp}" data-iso-date="${isoDate}">
            <div class="post-card-left">
                <div class="post-avatar">
                    <img src="${currentUser.avatar}" alt="用户头像" onerror="this.src='images/default-avatar.svg'">
                    <div class="user-role-badge ${currentUser.role}">${getUserRoleText(currentUser.role)}</div>
                </div>
            </div>
            <div class="post-card-right">
                <div class="post-header">
                    <div class="post-author">
                        <span class="username">${currentUser.name}</span>
                        <span class="post-date">${formatDate(now)}</span>
                        <a href="#${replyId}" class="view-in-timeline" title="在时间线中查看此回复">
                            <i class="fas fa-external-link-alt"></i>
                            <span class="sr-only">在时间线中查看</span>
                        </a>
                    </div>
                </div>
                <div class="post-content">
                    <p>${content}</p>
                </div>
                <div class="post-actions">
                    <button class="post-reply-btn" data-require-login="true" data-parent-id="${replyId}" data-parent-user="${currentUser.name}">
                        <i class="fas fa-reply"></i>
                        回复
                    </button>
                </div>
            </div>
        </article>
    `;
    
    // 添加回复到嵌套容器
    nestedReplies.insertAdjacentHTML('beforeend', replyHtml);
    
    // 获取当前嵌套回复数量
    const nestedCount = nestedReplies.querySelectorAll('.nested-reply-card').length;
    
    // 如果这是第一个嵌套回复，或者尚未添加折叠按钮，添加折叠按钮
    if (!existingToggle && nestedCount > 0) {
        toggleButton = createToggleButton(nestedReplies, nestedCount);
        // 添加注意力动画，提示新添加的嵌套回复
        setTimeout(() => {
            toggleButton.classList.add('attention-pulse');
            setTimeout(() => {
                toggleButton.classList.remove('attention-pulse');
            }, 3000);
        }, 200);
    } else if (existingToggle) {
        // 更新现有按钮的回复计数
        const countIndicator = existingToggle.querySelector('.replies-count-indicator');
        if (countIndicator) {
            countIndicator.textContent = `(${nestedCount}条)`;
        }
        
        // 添加注意力动画，提示嵌套回复已添加
        existingToggle.classList.add('attention-pulse');
        setTimeout(() => {
            existingToggle.classList.remove('attention-pulse');
        }, 3000);
        
        // 如果之前是折叠状态，保持折叠状态
        if (isCurrentlyCollapsed) {
            // 记录当前高度
            nestedReplies.style.height = `${nestedReplies.scrollHeight}px`;
            // 触发重排
            nestedReplies.offsetHeight;
            // 重新应用折叠类
            nestedReplies.classList.add('collapsed');
        }
    }
    
    // 为新回复按钮添加事件
    const nestedReplyElement = document.getElementById(`${replyId}-nested`);
    if (nestedReplyElement) {
        const replyButton = nestedReplyElement.querySelector('.post-reply-btn');
        if (replyButton) {
            replyButton.addEventListener('click', handleReplyButtonClick);
        }
        
        // 添加直接跳转链接事件
        const viewInTimelineLink = nestedReplyElement.querySelector('.view-in-timeline');
        if (viewInTimelineLink) {
            viewInTimelineLink.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = replyId; // 独立副本ID
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // 高亮目标元素
                    highlightElement(targetElement);
                    
                    // 滚动到目标位置
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
        });
    }
}

    // 同时作为独立回复添加到时间轴上
    addIndependentNestedReply(parentId, content, replyId, currentUser);
}

// 在时间轴上添加嵌套回复的独立副本
function addIndependentNestedReply(parentId, content, replyId, currentUser) {
    // 获取主回复容器
    const repliesContainer = document.getElementById('chronologicalReplies');
    if (!repliesContainer) return;
    
    // 获取父元素的用户名
    const parentElement = document.getElementById(parentId);
    const parentUsername = parentElement ? parentElement.querySelector('.username').textContent : '';
    
    // 获取当前日期时间
    const now = new Date();
    const isoDate = now.toISOString();
    const timestamp = now.getTime();
    
    // 创建回复HTML，包含引用信息 - 添加显著的跳转视觉效果
    const replyHtml = `
        <article class="post-card reply-card" id="${replyId}" data-is-nested-copy="true" data-original-reply="${parentId}" data-timestamp="${timestamp}" data-iso-date="${isoDate}">
            <div class="post-card-left">
                <div class="post-avatar">
                    <img src="${currentUser.avatar}" alt="用户头像" onerror="this.src='images/default-avatar.svg'">
                    <div class="user-role-badge ${currentUser.role}">${getUserRoleText(currentUser.role)}</div>
                </div>
            </div>
            <div class="post-card-right">
                <div class="reply-reference">
                    <i class="fas fa-quote-left"></i>
                    回复给 <a href="#${parentId}" class="reply-parent-link">${parentUsername}</a>
                    <div class="nested-reply-link">
                        <a href="#${replyId}-nested" class="view-nested-position" title="查看在嵌套位置的回复">
                            <i class="fas fa-level-up-alt"></i>
                            查看嵌套位置
                        </a>
                    </div>
                    <span class="reply-timestamp">${formatDate(now)}</span>
                </div>
                <div class="post-header">
                    <div class="post-author">
                        <span class="username">${currentUser.name}</span>
                        <span class="post-date">${formatDate(now)}</span>
                    </div>
                </div>
                <div class="post-content">
                    <p>${content}</p>
                </div>
                <div class="post-actions">
                    <button class="post-reply-btn" data-require-login="true" data-parent-id="${replyId}" data-parent-user="${currentUser.name}">
                        <i class="fas fa-reply"></i>
                        回复
                    </button>
                </div>
                <div class="nested-replies">
                    <!-- 嵌套回复会在后续添加 -->
                </div>
            </div>
        </article>
    `;
    
    // 添加回复到主容器（总是添加到底部 - 最早回复优先）
        repliesContainer.insertAdjacentHTML('beforeend', replyHtml);
    
    // 为新回复按钮和引用链接添加事件处理
    const newReplyElement = document.getElementById(replyId);
    if (newReplyElement) {
        // 回复按钮事件
        const newReplyButton = newReplyElement.querySelector('.post-reply-btn');
        if (newReplyButton) {
            newReplyButton.addEventListener('click', handleReplyButtonClick);
        }
        
        // 引用链接事件 - 改进定位精度和视觉提示
        const parentLink = newReplyElement.querySelector('.reply-parent-link');
        if (parentLink) {
            parentLink.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // 高亮目标回复
                    highlightElement(targetElement);
                    
                    // 滚动到目标位置
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // 展开嵌套回复，如果父元素是一个包含嵌套回复的卡片
                    ensureNestedRepliesVisible(targetElement);
                }
            });
        }
        
        // 添加查看嵌套位置链接事件
        const viewNestedLink = newReplyElement.querySelector('.view-nested-position');
        if (viewNestedLink) {
            viewNestedLink.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // 高亮目标回复
                    highlightElement(targetElement);
                    
                    // 确保嵌套回复区域是展开的
                    const nestedRepliesContainer = targetElement.closest('.nested-replies');
                    if (nestedRepliesContainer) {
                        ensureNestedRepliesVisible(nestedRepliesContainer.closest('.post-card'));
                    }
                    
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        }
    }
    
    // 始终重新排序所有回复，确保时间顺序正确
    sortReplies('asc');
    
    console.log(`已添加嵌套回复的独立副本: ${replyId}，并重新排序`);
}

// 辅助函数：确保嵌套回复区域是可见的（如果被折叠则展开）
function ensureNestedRepliesVisible(parentElement) {
    if (!parentElement) return;
    
    // 检查父元素是否有折叠的嵌套回复
    const nestedReplies = parentElement.querySelector('.nested-replies');
    const toggleButton = parentElement.querySelector('.nested-replies-toggle');
    
    if (nestedReplies && toggleButton) {
        // 不论是否折叠，都添加注意力动画效果
        toggleButton.classList.add('attention-pulse');
        
        // 如果是折叠状态，则展开
        if (nestedReplies.classList.contains('collapsed')) {
            // 展开嵌套回复
            toggleNestedReplies(toggleButton, nestedReplies, false);
            console.log('自动展开了嵌套回复区域');
        }
        
        // 确保用户能注意到这里有嵌套回复
        // 设置一个较长的时间以确保动画效果明显
        setTimeout(() => {
            toggleButton.classList.remove('attention-pulse');
        }, 3000);
        
        // 添加额外的视觉效果
        const nestedReplyCards = nestedReplies.querySelectorAll('.nested-reply-card');
        nestedReplyCards.forEach((card, index) => {
            // 按顺序添加闪烁效果，增加用户注意力
            setTimeout(() => {
                card.classList.add('highlight-effect');
                setTimeout(() => {
                    card.classList.remove('highlight-effect');
                }, 1000);
            }, index * 200);
        });
    }
}

// 辅助函数：增强的元素高亮效果
function highlightElement(element) {
    if (!element) return;
    
    // 应用更强烈的高亮效果
    element.classList.add('highlight-effect-intense');
    
    // 找到与此元素相关的精灵球按钮
    const toggleButton = element.closest('.post-card-right')?.querySelector('.nested-replies-toggle');
    if (toggleButton) {
        // 添加精灵球动画
        toggleButton.classList.add('attention-pulse');
        setTimeout(() => {
            toggleButton.classList.remove('attention-pulse');
        }, 3000);
    }
    
    // 移除高亮效果
    setTimeout(() => {
        element.classList.remove('highlight-effect-intense');
    }, 2000);
}

// 更新回复计数
function updateRepliesCount() {
    // 计算所有直接回复数量（不包括嵌套回复的独立副本）
    const directReplyCount = document.querySelectorAll('#chronologicalReplies > .reply-card:not([data-is-nested-copy="true"])').length;
    
    // 计算嵌套回复数量
    let nestedReplyCount = document.querySelectorAll('.nested-replies > .nested-reply-card').length;
    
    const totalCount = directReplyCount + nestedReplyCount;
    
    // 更新回复标题显示
            const repliesHeading = document.querySelector('.replies-heading');
            if (repliesHeading) {
        repliesHeading.innerHTML = `<i class="fas fa-comments"></i> 回复 (${totalCount})`;
    }
}

// 排序回复 - 保留但简化为只支持升序排序（最早优先）
function sortReplies(direction) {
    const repliesContainer = document.getElementById('chronologicalReplies');
    if (!repliesContainer) return;
    
    console.log('开始排序回复...');
    
    // 获取所有直接回复，包括嵌套回复的独立副本
    const replies = Array.from(repliesContainer.querySelectorAll(':scope > .reply-card'));
    console.log(`找到 ${replies.length} 个回复需要排序`);
    
    // 增强型日期解析函数 - 支持多种日期格式
    function parseDate(dateStr) {
        try {
            console.log(`尝试解析日期: '${dateStr}'`);
            
            // 检查是否是时间戳数字（后端可能直接传递时间戳）
            if (!isNaN(dateStr) && dateStr.toString().length >= 10) {
                const timestamp = parseInt(dateStr);
                const date = new Date(timestamp);
                console.log(`  → 解析为时间戳: ${date.toISOString()}`);
                return date;
            }
            
            // 检查是否是ISO格式日期字符串（后端REST API常用格式）
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) || 
                dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    console.log(`  → 解析为ISO格式: ${date.toISOString()}`);
                    return date;
                }
            }
            
            // 尝试匹配数据属性中隐藏的时间戳（可能会在后端集成时添加）
            const dataTimestamp = replies[0].dataset?.timestamp;
            if (dataTimestamp && !isNaN(dataTimestamp)) {
                const date = new Date(parseInt(dataTimestamp));
                console.log(`  → 从数据属性解析: ${date.toISOString()}`);
                return date;
            }
            
            // 匹配中文日期格式 "2024年1月4日 14:30"
            const cnMatch = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2})/);
            if (cnMatch) {
                const [_, year, month, day, hour, minute] = cnMatch;
                // 注意：月份是从0开始的，所以需要减1
                const date = new Date(year, month - 1, day, hour, minute);
                console.log(`  → 解析为中文格式: ${date.toISOString()}`);
                return date;
            }
            
            // 匹配标准日期格式 "2024/01/04 14:30" 或 "2024-01-04 14:30"
            const stdMatch = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s+(\d{1,2}):(\d{1,2})/);
            if (stdMatch) {
                const [_, year, month, day, hour, minute] = stdMatch;
                const date = new Date(year, month - 1, day, hour, minute);
                console.log(`  → 解析为标准格式: ${date.toISOString()}`);
                return date;
            }
            
            // 回退方案：对中文日期格式进行预处理后尝试解析
            console.log(`  → 使用回退方案`);
            const dateStrProcessed = dateStr
                .replace(/年/, '/')
                .replace(/月/, '/')
                .replace(/日/, '');
            
            const date = new Date(dateStrProcessed);
            if (!isNaN(date.getTime())) {
                console.log(`  → 回退方案解析结果: ${date.toISOString()}`);
                return date;
            }
            
            throw new Error('无法识别的日期格式');
        } catch (e) {
            console.error(`日期解析错误: ${dateStr}`, e);
            // 出错返回当前日期作为默认值，但加上一个非常小的随机数以避免相同时间戳
            const defaultDate = new Date();
            defaultDate.setMilliseconds(Math.random() * 1000);
            return defaultDate;
        }
    }
    
    // 从元素中获取日期
    function getDateFromElement(element) {
        // 首先尝试从数据属性获取ISO日期或时间戳（适合后端集成）
        const dataTimestamp = element.dataset?.timestamp;
        const dataIsoDate = element.dataset?.isoDate;
        
        if (dataTimestamp && !isNaN(dataTimestamp)) {
            return new Date(parseInt(dataTimestamp));
        }
        
        if (dataIsoDate) {
            const date = new Date(dataIsoDate);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        // 回退到从元素文本获取日期
        const dateElement = element.querySelector('.post-date');
        if (dateElement) {
            return parseDate(dateElement.textContent);
        }
        
        // 如果无法获取日期，返回当前日期作为默认值
        return new Date();
    }
    
    // 调试时间解析
    replies.forEach(reply => {
        const dateText = reply.querySelector('.post-date').textContent;
        const username = reply.querySelector('.username').textContent;
        const id = reply.id;
        const parsedDate = getDateFromElement(reply);
        console.log(`回复 ID: ${id}, 用户: ${username}, 日期文本: ${dateText}, 解析结果: ${parsedDate.toISOString()}`);
    });
    
    // 根据日期排序 - 只按升序排列（最早优先）
    replies.sort((a, b) => {
        const dateA = getDateFromElement(a);
        const dateB = getDateFromElement(b);
        
        console.log(`比较: ${a.id}(${dateA.toISOString()}) 和 ${b.id}(${dateB.toISOString()})`);
        
        return dateA - dateB;
    });
    
    // 重新添加到容器
    replies.forEach(reply => {
        repliesContainer.appendChild(reply);
    });
    
    // 添加排序后的顺序日志
    console.log('排序后的回复顺序:');
    const sortedReplies = Array.from(repliesContainer.querySelectorAll(':scope > .reply-card'));
    sortedReplies.forEach((reply, index) => {
        const dateText = reply.querySelector('.post-date').textContent;
        const username = reply.querySelector('.username').textContent;
        console.log(`${index + 1}. ${reply.id}, 用户: ${username}, 日期: ${dateText}`);
    });
    
    console.log('回复排序完成');
}

// 修改生成测试数据函数，添加跳转功能
function generateChronologicalReplies() {
    // 函数内容保持不变，但确保处理嵌套回复显示
    
    // 在生成完所有测试数据后，为已有的嵌套回复和独立回复添加跳转链接
    setTimeout(() => {
        // 为所有嵌套回复添加跳转到独立位置的链接
        document.querySelectorAll('.nested-reply-card').forEach(nestedReply => {
            const originalId = nestedReply.dataset.originalId;
            if (originalId && !nestedReply.querySelector('.view-in-timeline')) {
                // 添加到时间线查看链接
                const authorDiv = nestedReply.querySelector('.post-author');
                if (authorDiv) {
                    const viewLink = document.createElement('a');
                    viewLink.href = `#${originalId}`;
                    viewLink.className = 'view-in-timeline';
                    viewLink.title = '在时间线中查看此回复';
                    viewLink.innerHTML = '<i class="fas fa-external-link-alt"></i><span class="sr-only">在时间线中查看</span>';
                    
                    authorDiv.appendChild(viewLink);
                    
                    // 添加点击事件
                    viewLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href').substring(1);
                        const targetElement = document.getElementById(targetId);
                        
                        if (targetElement) {
                            highlightElement(targetElement);
                            targetElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    });
                }
            }
        });
        
        // 为所有独立回复添加跳转到嵌套位置的链接
        document.querySelectorAll('.post-card[data-is-nested-copy="true"]').forEach(independentReply => {
            const nestedId = `${independentReply.id}-nested`;
            const referenceDiv = independentReply.querySelector('.reply-reference');
            
            if (referenceDiv && !independentReply.querySelector('.nested-reply-link')) {
                const nestedLink = document.createElement('div');
                nestedLink.className = 'nested-reply-link';
                nestedLink.innerHTML = `
                    <a href="#${nestedId}" class="view-nested-position" title="查看在嵌套位置的回复">
                        <i class="fas fa-level-up-alt"></i>
                        查看嵌套位置
                    </a>
                `;
                
                referenceDiv.appendChild(nestedLink);
                
                // 添加点击事件
                const linkElement = nestedLink.querySelector('a');
                linkElement.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        highlightElement(targetElement);
                        
                        // 确保嵌套回复区域是展开的
                        const nestedRepliesContainer = targetElement.closest('.nested-replies');
                        if (nestedRepliesContainer) {
                            ensureNestedRepliesVisible(nestedRepliesContainer.closest('.post-card'));
                        }
                        
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                });
            }
        });
        
        // 增强所有回复父链接的功能
    document.querySelectorAll('.reply-parent-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                    // 使用增强的高亮和展开功能
                    highlightElement(targetElement);
                    ensureNestedRepliesVisible(targetElement);
                
                // 滚动到目标位置
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        });
    });
    }, 500);
}

// 设置编辑器工具栏
function setupEditorToolbar() {
    // 处理格式化按钮
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const editor = document.querySelector('.editor-input');
            const selection = editor.value.substring(editor.selectionStart, editor.selectionEnd);
            let formattedText = '';
            
            // 根据按钮类型执行不同操作
            const btnType = this.title;
            
            switch(btnType) {
                case '粗体':
                    formattedText = `**${selection || '粗体文字'}**`;
                    break;
                case '斜体':
                    formattedText = `*${selection || '斜体文字'}*`;
                    break;
                case '插入链接':
                    const url = prompt('请输入链接地址:', 'https://');
                    const text = selection || '链接文字';
                    formattedText = url ? `[${text}](${url})` : selection;
                    break;
                case '插入代码':
                    formattedText = selection ? `\`${selection}\`` : '`代码`';
                    break;
                case '插入图片':
                    const imgUrl = prompt('请输入图片链接:', 'https://');
                    formattedText = imgUrl ? `![图片](${imgUrl})` : selection;
                    break;
                default:
                    formattedText = selection;
            }
            
            // 将格式化文本插入编辑器
            if (formattedText) {
                insertAtCursor(editor, formattedText);
            }
        });
    });
}

// 在光标位置插入文本
function insertAtCursor(input, text) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const value = input.value;
    
    input.value = value.substring(0, start) + text + value.substring(end);
    input.focus();
    input.selectionStart = input.selectionEnd = start + text.length;
}

// 设置确认弹窗功能
function setupDialogBox() {
    const dialogOverlay = document.querySelector('.dialog-overlay');
    const dialogClose = document.querySelector('.dialog-close');
    const cancelDialog = document.querySelector('.cancel-dialog');
    const confirmDialog = document.querySelector('.confirm-dialog');
    
    if (!dialogOverlay) return;
    
    // 显示确认弹窗
    window.showDialog = function() {
        dialogOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    
    // 隐藏确认弹窗
    window.hideDialog = function() {
        dialogOverlay.style.display = 'none';
        document.body.style.overflow = '';
    };
    
    // 折叠编辑器
    window.collapseEditor = function() {
        const replyEditor = document.querySelector('.reply-editor');
        const editorInput = document.querySelector('.editor-input');
        
        editorInput.value = '';
        editorInput.blur();
        
        // 重置为回复主帖
        replyEditor.dataset.replyTo = 'post1';
        
        hideDialog();
    };
    
    // 点击关闭弹窗按钮
    if (dialogClose) dialogClose.addEventListener('click', hideDialog);
    if (cancelDialog) cancelDialog.addEventListener('click', hideDialog);
    if (confirmDialog) confirmDialog.addEventListener('click', collapseEditor);
    
    // 点击弹窗外部关闭弹窗
    dialogOverlay.addEventListener('click', function(e) {
        if (e.target === dialogOverlay) {
            hideDialog();
        }
    });
}

// 更新用户角色名牌显示
function updateUserRoleBadges() {
    // 获取所有用户名牌
    const userBadges = document.querySelectorAll('.user-badge.member');
    
    // 如果找到了带有member类的名牌元素
    if (userBadges.length > 0) {
        // 模拟从API获取用户角色信息
        // 在实际项目中，这里应该从后端API获取用户角色信息
        // 为演示目的，我们会随机分配角色或使用预设数据
        
        userBadges.forEach(badge => {
            // 获取用户名元素
            const usernameElement = badge.closest('.user-details').querySelector('.username');
            if (!usernameElement) return;
            
            // 获取用户名
            const username = usernameElement.textContent.trim();
            
            // 确定用户角色
            // 这里仅作演示，实际项目中应该从后端获取真实数据
            let userRole;
            
            // 模拟特定用户的固定角色（管理员除外，管理员已有特殊标记）
            if (username === '张三') {
                // 跳过管理员
                return;
            } else if (username === '李四' || username === '赵六') {
                userRole = 'teacher';
            } else {
                userRole = 'learner';
            }
            
            // 更新名牌文本和类
            badge.textContent = userRole === 'teacher' ? '教师' : '学习者';
            badge.classList.remove('member');
            badge.classList.add(userRole);
        });
    }
}

// 设置回复编辑器的用户信息显示
function setupReplyEditor() {
    // 检查是否登录，如果登录获取用户信息
    const isUserLoggedIn = typeof isLoggedIn === 'function' && isLoggedIn();
    
    // 获取登录提示元素
    const loginNotice = document.getElementById('replyLoginNotice');
    
    if (isUserLoggedIn) {
        // 如果已登录，创建回复编辑器，隐藏登录提示
        if (loginNotice) {
            loginNotice.style.display = 'none';
        }
        
        // 检查是否已经存在回复编辑器，如果不存在则创建
        let replyEditor = document.querySelector('.reply-editor');
        if (!replyEditor) {
            replyEditor = createReplyEditor();
        }
        
        // 为主回复编辑器设置默认回复对象为主帖
        replyEditor.dataset.replyTo = 'post1'; // 默认回复主帖
        
        // 获取当前用户
        const currentUser = getCurrentUser();
        if (currentUser) {
            // 设置编辑器中的用户头像
            const editorAvatar = document.getElementById('editorAvatar');
            if (editorAvatar && currentUser.avatar) {
                editorAvatar.src = currentUser.avatar;
            }
            
            // 添加用户角色标识
            const roleInfo = document.createElement('div');
            roleInfo.className = 'editor-role-info';
            
            // 确定用户角色显示文本
            let roleText = getUserRoleText(currentUser.role);
            
            roleInfo.innerHTML = `<span class="editor-username">${currentUser.name}</span> <span class="user-badge ${currentUser.role}">${roleText}</span>`;
            
            // 插入到编辑器之前
            const editorContainer = replyEditor.querySelector('.editor-container');
            if (editorContainer && !replyEditor.querySelector('.editor-role-info')) {
                editorContainer.insertBefore(roleInfo, editorContainer.firstChild);
            }
        }
    } else {
        // 如果未登录，确保回复编辑器被移除，显示登录提示
        const replyEditor = document.querySelector('.reply-editor');
        if (replyEditor) {
            replyEditor.remove();
        }
        
        if (loginNotice) {
            loginNotice.style.display = 'block';
        }
    }
    
    // 处理所有回复按钮的可见性和行为
    handleReplyButtonsVisibility(isUserLoggedIn);
}

// 创建回复编辑器
function createReplyEditor() {
    // 创建回复编辑器的HTML结构
    const replyEditor = document.createElement('div');
    replyEditor.className = 'reply-editor';
    replyEditor.dataset.requireLogin = 'true';
    replyEditor.style.display = 'flex';
    
    replyEditor.innerHTML = `
        <div class="editor-avatar">
            <img src="images/default-avatar.svg" alt="用户头像" class="user-avatar" id="editorAvatar" onerror="this.src='images/default-avatar.svg'">
        </div>
        <div class="editor-container">
            <textarea class="editor-input" placeholder="写下你的回复..."></textarea>
            <div class="editor-toolbar">
                <div class="formatting-buttons">
                    <button class="format-btn" title="粗体">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button class="format-btn" title="斜体">
                        <i class="fas fa-italic"></i>
                    </button>
                    <button class="format-btn" title="插入链接">
                        <i class="fas fa-link"></i>
                    </button>
                    <button class="format-btn" title="插入代码">
                        <i class="fas fa-code"></i>
                    </button>
                    <button class="format-btn" title="插入图片">
                        <i class="fas fa-image"></i>
                    </button>
                </div>
                <div class="action-buttons">
                    <button class="cancel-btn">取消</button>
                    <button class="submit-btn">发表回复</button>
                </div>
            </div>
        </div>
    `;
    
    // 将编辑器插入到回复区域中的适当位置
    const repliesSection = document.querySelector('.replies-section');
    const loginNotice = document.getElementById('replyLoginNotice');
    
    if (repliesSection && loginNotice) {
        repliesSection.insertBefore(replyEditor, loginNotice);
    }
    
    // 为新创建的编辑器绑定事件
    const cancelBtn = replyEditor.querySelector('.cancel-btn');
    const submitBtn = replyEditor.querySelector('.submit-btn');
    const formatBtns = replyEditor.querySelectorAll('.format-btn');
    
    // 取消按钮事件
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            const textarea = replyEditor.querySelector('.editor-input');
            
            // 如果有内容，显示确认对话框
            if (textarea.value.trim()) {
                showDialog();
            } else {
                // 如果没有内容，清空输入框并重置回复对象
                textarea.value = '';
                // 默认回复主帖
                replyEditor.dataset.replyTo = 'post1';
            }
        });
    }
    
    // 提交按钮事件
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const content = replyEditor.querySelector('.editor-input').value.trim();
            const replyToId = replyEditor.dataset.replyTo || 'post1'; // 默认回复主帖
            
            if (!content) {
                alert('请输入回复内容');
                return;
            }
            
            // 模拟添加回复 - 实际项目中应该发送到服务器
            addReplyToPost(replyToId, content);
            
            // 清空输入框并重置回复对象为主帖
            replyEditor.querySelector('.editor-input').value = '';
            replyEditor.dataset.replyTo = 'post1'; // 重置为回复主帖
        });
    }
    
    // 格式化按钮事件
    formatBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const editor = replyEditor.querySelector('.editor-input');
            const selection = editor.value.substring(editor.selectionStart, editor.selectionEnd);
            let formattedText = '';
            
            // 根据按钮类型执行不同操作
            const btnType = this.title;
            
            switch(btnType) {
                case '粗体':
                    formattedText = `**${selection || '粗体文字'}**`;
                    break;
                case '斜体':
                    formattedText = `*${selection || '斜体文字'}*`;
                    break;
                case '插入链接':
                    const url = prompt('请输入链接地址:', 'https://');
                    const text = selection || '链接文字';
                    formattedText = url ? `[${text}](${url})` : selection;
                    break;
                case '插入代码':
                    formattedText = selection ? `\`${selection}\`` : '`代码`';
                    break;
                case '插入图片':
                    const imgUrl = prompt('请输入图片链接:', 'https://');
                    formattedText = imgUrl ? `![图片](${imgUrl})` : selection;
                    break;
                default:
                    formattedText = selection;
            }
            
            // 将格式化文本插入编辑器
            if (formattedText) {
                insertAtCursor(editor, formattedText);
            }
        });
    });
    
    return replyEditor;
}

// 新增函数：处理所有回复按钮的可见性和行为
function handleReplyButtonsVisibility(isLoggedIn) {
    // 获取所有回复按钮
    const replyButtons = document.querySelectorAll('.post-reply-btn');
    
    replyButtons.forEach(button => {
        if (!isLoggedIn) {
            // 如果未登录，修改回复按钮的行为
            button.removeEventListener('click', handleReplyButtonClick);
            button.addEventListener('click', handleUnauthenticatedReplyClick);
            
            // 更改按钮文本，提示用户需要登录
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> 登录后回复';
        } else {
            // 如果已登录，确保回复按钮有正确的处理函数
            button.removeEventListener('click', handleUnauthenticatedReplyClick);
            button.addEventListener('click', handleReplyButtonClick);
            
            // 确保按钮文本正确
            button.innerHTML = '<i class="fas fa-reply"></i> 回复';
        }
    });
}

// 已登录状态下回复按钮的点击处理
function handleReplyButtonClick(e) {
    e.preventDefault();
    
    // 获取当前按钮所在的回复卡片
    const postElement = this.closest('.post-card');
    const postId = postElement.id;
    const postUsername = postElement.querySelector('.username').textContent;
    
    // 移除所有已存在的快捷回复框
    document.querySelectorAll('.quick-reply-box').forEach(box => box.remove());
    
    // 创建快捷回复框
    const quickReplyBox = createQuickReplyBox(postId, postUsername);
    
    // 获取当前回复卡片中的post-card-right元素
    const postCardRight = postElement.querySelector('.post-card-right');
    
    // 将快捷回复框插入到post-card-right的最后
    postCardRight.appendChild(quickReplyBox);
    
    // 聚焦到快捷回复框的文本输入区域
    setTimeout(() => {
        const textArea = quickReplyBox.querySelector('textarea');
        textArea.focus();
    }, 100);
}

// 创建快捷回复框
function createQuickReplyBox(parentId, parentUsername) {
    const quickReplyBox = document.createElement('div');
    quickReplyBox.className = 'quick-reply-box';
    quickReplyBox.dataset.replyTo = parentId;
    
    // 获取当前用户
    const currentUser = getCurrentUser();
    const avatarSrc = currentUser ? currentUser.avatar : 'images/default-avatar.svg';
    
    quickReplyBox.innerHTML = `
        <div class="quick-reply-editor">
            <div class="editor-avatar">
                <img src="${avatarSrc}" alt="用户头像" class="user-avatar" onerror="this.src='images/default-avatar.svg'">
            </div>
            <div class="editor-container">
                <textarea class="editor-input" placeholder="回复 @${parentUsername}..."></textarea>
                <div class="editor-actions">
                    <button class="cancel-quick-reply">取消</button>
                    <button class="submit-quick-reply">发表回复</button>
                </div>
                <div class="editor-tip">提示: 按 Ctrl+Enter 快速发表</div>
            </div>
        </div>
    `;
    
    // 绑定取消按钮事件
    const cancelBtn = quickReplyBox.querySelector('.cancel-quick-reply');
    cancelBtn.addEventListener('click', function() {
        quickReplyBox.remove();
    });
    
    // 获取文本框和提交按钮
    const textarea = quickReplyBox.querySelector('textarea');
    const submitBtn = quickReplyBox.querySelector('.submit-quick-reply');
    
    // 文本框按键事件 - 支持Ctrl+Enter提交
    textarea.addEventListener('keydown', function(e) {
        // 判断是否为Ctrl+Enter
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            submitReply();
        }
    });
    
    // 提交按钮事件
    submitBtn.addEventListener('click', submitReply);
    
    // 提交回复函数
    function submitReply() {
        const content = textarea.value.trim();
        const replyToId = quickReplyBox.dataset.replyTo;
        
        if (!content) {
            alert('请输入回复内容');
            return;
        }
        
        // 调用回复函数处理回复
        handleReplySubmission(replyToId, content);
        
        // 移除快捷回复框
        quickReplyBox.remove();
    }
    
    return quickReplyBox;
}

// 未登录状态下回复按钮的点击处理
function handleUnauthenticatedReplyClick(e) {
    e.preventDefault();
    
    // 滚动到"请先登录"提示
    const loginNotice = document.getElementById('replyLoginNotice');
    if (loginNotice) {
        loginNotice.scrollIntoView({ behavior: 'smooth' });
        
        // 添加闪烁效果以吸引注意
        loginNotice.classList.add('highlight-notice');
        setTimeout(() => {
            loginNotice.classList.remove('highlight-notice');
        }, 1500);
    }
}

// 辅助函数 - 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

// 辅助函数 - 获取用户角色显示文本
function getUserRoleText(role) {
    switch(role) {
        case 'admin': return '管理员';
        case 'staff': return '管理员';
        case 'teacher': return '教师';
        case 'learner': return '学习者';
        case 'member': return '会员';
        default: return '学习者';
    }
}

// 模拟获取当前用户信息
function getCurrentUser() {
    // 从 localStorage 中获取用户数据
    const userData = localStorage.getItem('eduwebUser');
    if (userData) {
        return JSON.parse(userData);
    }
    
    // 如果没有用户数据，返回默认值
    return {
        name: '当前用户',
        avatar: 'images/default-avatar.svg',
        role: 'learner'
    };
}

// 模拟登录状态检查
function isLoggedIn() {
    // 检查 localStorage 中是否存在用户数据
    return localStorage.getItem('eduwebUser') !== null;
}

// 初始化静态回复排序
function initStaticRepliesSort() {
    console.log('初始化静态回复排序...');
    
    // 检查页面中是否有预设的回复
    const repliesContainer = document.getElementById('chronologicalReplies');
    if (!repliesContainer) return;
    
    // 测试：尝试格式化所有日期字符串为统一格式
    console.log('测试：统一日期格式以确保正确排序');
    const allReplyCards = repliesContainer.querySelectorAll(':scope > .reply-card');
    allReplyCards.forEach(card => {
        const dateElement = card.querySelector('.post-date');
        if (dateElement) {
            const originalDateText = dateElement.textContent;
            console.log(`回复 ${card.id} 原始日期: ${originalDateText}`);
            
            try {
                // 解析日期
                const match = originalDateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2})/);
                if (match) {
                    const [_, year, month, day, hour, minute] = match;
                    // 创建标准化的Date对象
                    const date = new Date(year, month - 1, day, hour, minute);
                    console.log(`  → 解析为: ${date.toISOString()}`);
                    
                    // 可以考虑将日期重新格式化为统一格式，以避免解析问题
                    // 暂时只输出日志，不修改DOM
                }
            } catch (e) {
                console.error(`解析日期错误 ${card.id}: ${originalDateText}`, e);
            }
        }
    });
    
    const existingReplies = repliesContainer.querySelectorAll(':scope > .reply-card');
    if (existingReplies.length > 0) {
        console.log(`找到 ${existingReplies.length} 个静态回复，开始排序...`);
        
        // 对静态HTML中的回复进行排序
        sortReplies('asc');
    }
} 