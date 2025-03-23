document.addEventListener('DOMContentLoaded', function() {
    // 模拟通知数据 - 在实际应用中会从后端API获取
    const notifications = [
        {
            id: 2,
            type: 'course',
            title: '课程更新 - Python基础课程',
            content: '您关注的课程已更新新章节：《Python进阶：函数与模块》。',
            time: '2小时前',
            read: false,
            link: 'course-detail.html'
        },
        {
            id: 3,
            type: 'reply',
            title: '回复提醒 - 社区讨论',
            content: '李明回复了您在《如何高效学习编程》讨论中的评论："谢谢分享，这些方法很实用！"',
            time: '5小时前',
            read: false,
            link: 'discussion-detail.html'
        },
        {
            id: 4,
            type: 'course',
            title: '课程更新 - Web开发入门',
            content: '您收藏的课程《Web开发入门》已更新了新的学习资料。',
            time: '1天前',
            read: false,
            link: 'course-detail.html'
        },
        {
            id: 6,
            type: 'reply',
            title: '回复提醒 - 社区讨论',
            content: '王老师回复了您在《学习路径规划》讨论中的问题："建议先掌握基础知识，再深入学习框架..."',
            time: '3天前',
            read: true,
            link: 'discussion-detail.html'
        }
    ];

    // 通知设置定义 - 与后端对应的设置选项
    const notificationSettings = {
        course_updates: {
            id: 'course-updates',
            key: 'course_updates',  // 后端API的键名
            label: '课程更新',
            description: '当您收藏的课程有新章节或更新时',
            default: true
        },
        comment_replies: {
            id: 'comment-replies',
            key: 'comment_replies',  // 后端API的键名
            label: '评论回复',
            description: '当有人回复您的评论时',
            default: true
        }
    };

    // 选择器
    const notificationsList = document.querySelector('.notifications-list');
    const emptyContainer = document.querySelector('.notifications-empty');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const navBadge = document.querySelector('.notification-badge');
    const openNotificationSettingsBtn = document.getElementById('openNotificationSettingsBtn');
    const closeNotificationSettingsBtn = document.getElementById('closeNotificationSettingsBtn');
    const cancelNotificationSettingsBtn = document.getElementById('cancelNotificationSettingsBtn');
    const saveNotificationSettingsBtn = document.getElementById('saveNotificationSettingsBtn');
    const notificationSettingsModal = document.getElementById('notificationSettingsModal');

    // 为所有"标为已读"按钮添加事件处理
    document.querySelectorAll('.btn-mark-read').forEach(button => {
        button.addEventListener('click', function() {
            const notificationId = parseInt(this.getAttribute('data-id'));
            markAsRead(notificationId);
        });
    });

    // 为过滤按钮添加事件处理
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加active类到当前按钮
            this.classList.add('active');
            
            // 获取过滤类型
            const filterType = this.getAttribute('data-filter');
            filterNotifications(filterType);
        });
    });

    // 全部标为已读按钮事件
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }

    // 通知设置按钮事件
    if (openNotificationSettingsBtn) {
        console.log("通知设置按钮已找到:", openNotificationSettingsBtn);
        openNotificationSettingsBtn.addEventListener('click', function() {
            console.log("通知设置按钮被点击");
            openNotificationSettingsModal();
        });
    } else {
        console.log("未找到通知设置按钮");
    }

    // 关闭通知设置模态窗口
    if (closeNotificationSettingsBtn) {
        closeNotificationSettingsBtn.addEventListener('click', closeNotificationSettingsModal);
    }

    // 取消按钮事件
    if (cancelNotificationSettingsBtn) {
        cancelNotificationSettingsBtn.addEventListener('click', closeNotificationSettingsModal);
    }

    // 保存设置按钮事件
    if (saveNotificationSettingsBtn) {
        saveNotificationSettingsBtn.addEventListener('click', saveNotificationSettings);
    }

    /**
     * 过滤通知
     * @param {string} type - 过滤类型 (all, system, course, reply)
     */
    function filterNotifications(type) {
        const items = document.querySelectorAll('.notification-item');
        
        if (items.length === 0) {
            emptyContainer.style.display = 'flex';
            return;
        }

        emptyContainer.style.display = 'none';
        let visibleCount = 0;

        items.forEach(item => {
            if (type === 'all' || item.getAttribute('data-type') === type) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // 如果没有可见的通知，显示空状态
        if (visibleCount === 0) {
            emptyContainer.style.display = 'flex';
        }
    }

    /**
     * 将通知标记为已读
     * @param {number} id - 通知ID
     */
    function markAsRead(id) {
        // 在实际应用中，这里会向后端API发送请求
        // 模拟数据处理
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            
            // 更新UI
            const notificationElem = document.querySelector(`.btn-mark-read[data-id="${id}"]`).closest('.notification-item');
            notificationElem.classList.remove('unread');
            
            // 移动到"已读通知"组
            const readGroup = document.querySelector('.notification-group:nth-child(2)');
            if (readGroup) {
                notificationElem.querySelector('.btn-mark-read').remove();
                readGroup.appendChild(notificationElem);
            }
            
            // 更新未读计数
            updateUnreadCount();
            
            // 向后端API发送请求（模拟）
            console.log(`向后端API发送标记通知 ${id} 为已读的请求`);
            // 实际实现：
            // fetch('/api/notifications/mark-read', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ id: id })
            // })
            // .then(response => response.json())
            // .then(data => console.log('标记为已读成功', data))
            // .catch(error => console.error('标记为已读失败', error));
        }
    }

    /**
     * 将所有通知标记为已读
     */
    function markAllAsRead() {
        // 在实际应用中，这里会向后端API发送请求
        // 模拟数据处理
        notifications.forEach(notification => {
            notification.read = true;
        });
        
        // 更新UI
        const unreadItems = document.querySelectorAll('.notification-item.unread');
        const readGroup = document.querySelector('.notification-group:nth-child(2)');
        
        unreadItems.forEach(item => {
            item.classList.remove('unread');
            item.querySelector('.btn-mark-read')?.remove();
            if (readGroup) {
                readGroup.appendChild(item);
            }
        });
        
        // 更新未读组的标题
        const unreadGroup = document.querySelector('.notification-group:first-child');
        if (unreadGroup) {
            unreadGroup.querySelector('.group-title').textContent = '未读通知 (0)';
        }
        
        // 更新已读组的标题
        if (readGroup) {
            readGroup.querySelector('.group-title').textContent = `已读通知 (${notifications.length})`;
        }
        
        // 更新导航栏通知计数
        if (navBadge) {
            navBadge.style.display = 'none';
        }
        
        // 向后端API发送请求（模拟）
        console.log('向后端API发送标记所有通知为已读的请求');
        // 实际实现：
        // fetch('/api/notifications/mark-all-read', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' }
        // })
        // .then(response => response.json())
        // .then(data => console.log('标记所有为已读成功', data))
        // .catch(error => console.error('标记所有为已读失败', error));
    }

    /**
     * 更新未读通知计数
     */
    function updateUnreadCount() {
        const unreadCount = notifications.filter(n => !n.read).length;
        
        // 更新未读组的标题
        const unreadGroup = document.querySelector('.notification-group:first-child');
        if (unreadGroup) {
            unreadGroup.querySelector('.group-title').textContent = `未读通知 (${unreadCount})`;
        }
        
        // 更新已读组的标题
        const readGroup = document.querySelector('.notification-group:nth-child(2)');
        if (readGroup) {
            readGroup.querySelector('.group-title').textContent = `已读通知 (${notifications.length - unreadCount})`;
        }
        
        // 更新导航栏通知计数
        if (navBadge) {
            if (unreadCount > 0) {
                navBadge.textContent = unreadCount;
                navBadge.style.display = 'flex';
            } else {
                navBadge.style.display = 'none';
            }
        }
        
        // 更新localStorage中的通知数据以保持所有页面同步
        const notificationsData = {
            unreadCount: unreadCount,
            lastChecked: new Date().toISOString()
        };
        localStorage.setItem('eduwebNotifications', JSON.stringify(notificationsData));
    }

    /**
     * 打开通知设置模态窗口
     */
    function openNotificationSettingsModal() {
        console.log("尝试打开模态窗口");
        if (notificationSettingsModal) {
            console.log("找到模态窗口元素");
            
            // 动态生成设置选项
            generateNotificationSettingsUI();
            
            notificationSettingsModal.style.display = 'flex';
            notificationSettingsModal.style.opacity = '1';
            notificationSettingsModal.style.visibility = 'visible';
            
            // 加载保存的设置
            loadNotificationSettings();
        } else {
            console.log("未找到模态窗口元素");
        }
    }

    /**
     * 生成通知设置UI
     */
    function generateNotificationSettingsUI() {
        const settingsList = notificationSettingsModal.querySelector('.notification-settings-list');
        if (!settingsList) return;
        
        // 首先清空现有设置
        const existingGroup = settingsList.querySelector('.settings-group');
        if (existingGroup) {
            while (existingGroup.children.length > 1) {
                existingGroup.removeChild(existingGroup.lastChild);
            }
        }
        
        // 重新生成设置项
        Object.values(notificationSettings).forEach(setting => {
            const settingItem = document.createElement('div');
            settingItem.className = 'settings-item';
            settingItem.innerHTML = `
                <div class="item-label">
                    <span>${setting.label}</span>
                    <p class="item-description">${setting.description}</p>
                </div>
                <div class="toggle-switch">
                    <input type="checkbox" id="${setting.id}" class="toggle-input" data-key="${setting.key}">
                    <label for="${setting.id}" class="toggle-label"></label>
                </div>
            `;
            existingGroup.appendChild(settingItem);
        });
    }

    /**
     * 关闭通知设置模态窗口
     */
    function closeNotificationSettingsModal() {
        console.log("尝试关闭模态窗口");
        if (notificationSettingsModal) {
            console.log("找到模态窗口元素，正在关闭");
            notificationSettingsModal.style.display = 'none';
            notificationSettingsModal.style.opacity = '0';
            notificationSettingsModal.style.visibility = 'hidden';
        } else {
            console.log("未找到模态窗口元素，无法关闭");
        }
    }

    /**
     * 保存通知设置
     */
    function saveNotificationSettings() {
        // 获取所有设置项
        const settings = {};
        
        // 遍历所有toggle input
        notificationSettingsModal.querySelectorAll('.toggle-input').forEach(input => {
            const key = input.getAttribute('data-key');
            if (key) {
                settings[key] = input.checked;
            }
        });
        
        // 保存到localStorage
        localStorage.setItem('eduwebNotificationSettings', JSON.stringify(settings));
        
        // 同步到后端（模拟）
        console.log('向后端API发送通知设置', settings);
        // 实际实现：
        // fetch('/api/user/notification-settings', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(settings)
        // })
        // .then(response => response.json())
        // .then(data => console.log('保存设置成功', data))
        // .catch(error => console.error('保存设置失败', error));
        
        // 关闭模态窗口
        closeNotificationSettingsModal();
        
        // 显示成功消息
        alert('通知设置已保存');
    }

    /**
     * 加载保存的通知设置
     */
    function loadNotificationSettings() {
        const savedSettings = localStorage.getItem('eduwebNotificationSettings');
        
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            // 应用设置到UI
            notificationSettingsModal.querySelectorAll('.toggle-input').forEach(input => {
                const key = input.getAttribute('data-key');
                if (key && settings[key] !== undefined) {
                    input.checked = settings[key];
                } else {
                    // 使用默认值
                    const settingId = input.id;
                    for (const setting of Object.values(notificationSettings)) {
                        if (setting.id === settingId) {
                            input.checked = setting.default;
                            break;
                        }
                    }
                }
            });
        } else {
            // 没有保存的设置，使用默认值
            notificationSettingsModal.querySelectorAll('.toggle-input').forEach(input => {
                const settingId = input.id;
                for (const setting of Object.values(notificationSettings)) {
                    if (setting.id === settingId) {
                        input.checked = setting.default;
                        break;
                    }
                }
            });
        }
    }

    // 初始化
    updateUnreadCount();
    // 按照当前URL的hash定位到特定的通知设置部分
    if (window.location.hash === '#notification-settings') {
        openNotificationSettingsModal();
    }
    
    // 添加一个全局访问点用于调试
    window.testModal = function() {
        console.log("测试模态窗口");
        openNotificationSettingsModal();
    };
    
    // 延迟300毫秒后，检查通知设置按钮是否正确绑定了事件
    setTimeout(function() {
        if (openNotificationSettingsBtn) {
            console.log("通知设置按钮DOM元素存在");
        } else {
            console.log("通知设置按钮DOM元素不存在");
        }
    }, 300);
}); 