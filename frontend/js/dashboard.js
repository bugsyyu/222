document.addEventListener('DOMContentLoaded', function() {
    // 用户信息初始化
    initUserInfo();
    
    // 日历初始化
    initCalendar();
    
    // 事件监听
    setupEventListeners();
});

/**
 * 初始化用户信息
 */
function initUserInfo() {
    // 这里应该是从后端API获取用户信息
    // 示例数据
    const userData = {
        name: '张同学',
        avatar: 'images/default-avatar.svg'
    };
    
    // 更新用户信息
    document.getElementById('greetingName').textContent = userData.name;
    document.getElementById('userAvatar').src = userData.avatar;
    
    // 设置头像错误处理
    document.getElementById('userAvatar').onerror = function() { 
        this.src = 'images/default-avatar.svg'; 
    };
    
    // 检查是否已经打卡
    checkDailyCheckin();
}

/**
 * 初始化日历
 */
function initCalendar() {
    const calendarEl = document.getElementById('checkinCalendar');
    
    // 清空之前的内容
    calendarEl.innerHTML = '';
    
    // 获取当前日期
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.getDate();
    
    // 获取当月的第一天是星期几
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // 获取当月的天数
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 添加星期头部
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-weekday';
        dayEl.textContent = day;
        calendarEl.appendChild(dayEl);
    });
    
    // 添加空白天数（月初前的空白）
    for (let i = 0; i < firstDay; i++) {
        const blankDay = document.createElement('div');
        blankDay.className = 'calendar-day empty';
        calendarEl.appendChild(blankDay);
    }
    
    // 模拟已打卡数据 (这里应该从后端API获取)
    const checkedDays = [1, 2, 3, 5, 8, 9, 10, 12, 15, 16];
    
    // 添加当月的天数
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = i;
        
        // 如果是今天，添加今天的类
        if (i === today) {
            dayEl.classList.add('today');
        }
        
        // 如果已打卡，添加完成的类
        if (checkedDays.includes(i)) {
            dayEl.classList.add('completed');
        }
        
        calendarEl.appendChild(dayEl);
    }
}

/**
 * 检查今日是否已打卡
 */
function checkDailyCheckin() {
    // 这里应该从后端API获取打卡状态
    // 示例数据
    const checkinData = {
        checkedToday: false,
        streak: 5
    };
    
    // 更新打卡UI
    updateCheckinUI(checkinData.checkedToday);
    
    // 更新连续打卡天数
    document.getElementById('streakCount').textContent = checkinData.streak;
}

/**
 * 更新打卡UI
 */
function updateCheckinUI(isChecked) {
    const checkinCircle = document.getElementById('checkinCircle');
    const checkinMessage = document.getElementById('checkinMessage');
    const checkinBtn = document.getElementById('checkinBtn');
    
    if (isChecked) {
        checkinCircle.classList.add('checked');
        checkinMessage.textContent = '今日已打卡，继续保持！';
        checkinBtn.disabled = true;
        checkinBtn.textContent = '已打卡';
    } else {
        checkinCircle.classList.remove('checked');
        checkinMessage.textContent = '今日尚未打卡';
        checkinBtn.disabled = false;
        checkinBtn.textContent = '立即打卡';
    }
}

/**
 * 打卡功能
 */
function dailyCheckin() {
    // 这里应该发送请求到后端API进行打卡
    // 示例代码
    
    // 显示加载状态
    const checkinBtn = document.getElementById('checkinBtn');
    checkinBtn.disabled = true;
    checkinBtn.textContent = '打卡中...';
    
    // 模拟API请求延迟
    setTimeout(function() {
        // 假设打卡成功
        updateCheckinUI(true);
        
        // 更新连续打卡天数
        const streakCount = document.getElementById('streakCount');
        streakCount.textContent = parseInt(streakCount.textContent) + 1;
        
        // 更新日历
        initCalendar();
        
        // 显示打卡成功提示
        alert('打卡成功！连续打卡 ' + streakCount.textContent + ' 天');
    }, 1000);
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
    // 打卡按钮点击事件
    document.getElementById('checkinBtn').addEventListener('click', dailyCheckin);
} 