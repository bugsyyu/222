// 模拟课程数据
const mockCourses = [
    {
        id: 1,
        title: "Python编程入门到实践",
        category: "计算机科学",
        instructor: "张教授",
        image: "https://picsum.photos/400/300?random=1",
        rating: 4.8,
        students: 1200,
        price: "¥299"
    },
    {
        id: 2,
        title: "Web前端开发实战",
        category: "计算机科学",
        instructor: "李老师",
        image: "https://picsum.photos/400/300?random=2",
        rating: 4.6,
        students: 980,
        price: "¥399"
    },
    {
        id: 3,
        title: "数据结构与算法",
        category: "计算机科学",
        instructor: "王教授",
        image: "https://picsum.photos/400/300?random=3",
        rating: 4.9,
        students: 850,
        price: "¥499"
    },
    {
        id: 4,
        title: "人工智能基础",
        category: "计算机科学",
        instructor: "刘教授",
        image: "https://picsum.photos/400/300?random=4",
        rating: 4.7,
        students: 760,
        price: "¥599"
    }
];

// 创建课程卡片HTML
function createCourseCard(course) {
    return `
        <div class="col-12 col-md-6 col-lg-3">
            <div class="card course-card">
                <img src="${course.image}" class="card-img-top" alt="${course.title}">
                <div class="card-body">
                    <div class="course-category">${course.category}</div>
                    <h5 class="card-title">${course.title}</h5>
                    <div class="instructor">
                        <i class="bi bi-person-circle"></i> ${course.instructor}
                    </div>
                    <div class="course-stats">
                        <div class="rating">
                            <i class="bi bi-star-fill"></i> ${course.rating}
                        </div>
                        <div class="students">
                            <i class="bi bi-people"></i> ${course.students}人学习
                        </div>
                        <div class="price">${course.price}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 加载热门课程
function loadPopularCourses() {
    const coursesContainer = document.getElementById('popularCourses');
    const coursesHTML = mockCourses.map(course => createCourseCard(course)).join('');
    coursesContainer.innerHTML = coursesHTML;
}

// 搜索功能
function setupSearch() {
    const searchInput = document.querySelector('.search-section input');
    const searchButton = document.querySelector('.search-section button');

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredCourses = mockCourses.filter(course => 
            course.title.toLowerCase().includes(searchTerm) ||
            course.category.toLowerCase().includes(searchTerm) ||
            course.instructor.toLowerCase().includes(searchTerm)
        );

        const coursesContainer = document.getElementById('popularCourses');
        const coursesHTML = filteredCourses.map(course => createCourseCard(course)).join('');
        coursesContainer.innerHTML = coursesHTML;
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPopularCourses();
    setupSearch();
}); 