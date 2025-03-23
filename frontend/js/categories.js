/**
 * 标准课程分类
 * 这是整个平台使用的标准课程分类列表
 * 在前后端开发时都应参考此文件保持分类一致性
 */

const COURSE_CATEGORIES = [
    {
        id: 'computer-science',
        name: '计算机科学',
        icon: 'bi-laptop',
        description: '编程、人工智能、数据科学等'
    },
    {
        id: 'business',
        name: '商业管理',
        icon: 'bi-graph-up',
        description: '金融、市场营销、创业等'
    },
    {
        id: 'design',
        name: '艺术设计',
        icon: 'bi-palette',
        description: '平面设计、UI/UX、动画等'
    },
    {
        id: 'language',
        name: '语言学习',
        icon: 'bi-translate',
        description: '英语、日语、德语等'
    },
    {
        id: 'math',
        name: '数学',
        icon: 'bi-calculator',
        description: '代数、统计、微积分等'
    },
    {
        id: 'health',
        name: '健康医学',
        icon: 'bi-heart',
        description: '营养学、心理学、医学等'
    },
    {
        id: 'music',
        name: '音乐艺术',
        icon: 'bi-music-note-beamed',
        description: '乐理、演奏、作曲等'
    },
    {
        id: 'humanities',
        name: '人文社科',
        icon: 'bi-book',
        description: '历史、哲学、文学等'
    }
];

// 课程难度等级
const COURSE_DIFFICULTY = [
    {
        id: 'beginner',
        name: '入门'
    },
    {
        id: 'intermediate',
        name: '中级'
    },
    {
        id: 'advanced',
        name: '高级'
    },
    {
        id: 'expert',
        name: '专家'
    }
];

// 课程语言
const COURSE_LANGUAGES = [
    {
        id: 'chinese',
        name: '中文'
    },
    {
        id: 'english',
        name: '英文'
    },
    {
        id: 'japanese',
        name: '日语'
    },
    {
        id: 'korean',
        name: '韩语'
    },
    {
        id: 'french',
        name: '法语'
    },
    {
        id: 'other',
        name: '其他'
    }
];

// 辅助函数：通过ID获取分类名称
function getCategoryNameById(categoryId) {
    const category = COURSE_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : '';
}

// 辅助函数：通过名称获取分类ID
function getCategoryIdByName(categoryName) {
    const category = COURSE_CATEGORIES.find(cat => cat.name === categoryName);
    return category ? category.id : '';
} 