// 处理投票按钮点击
document.querySelectorAll('.stat-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const voteType = this.classList.contains('upvote') ? 'up' : 'down';
        const voteCount = this.querySelector('span');
        const currentCount = parseInt(voteCount.textContent);
        
        // 检查是否已经投票
        if (this.classList.contains('voted')) {
            this.classList.remove('voted');
            voteCount.textContent = currentCount - 1;
        } else {
            this.classList.add('voted');
            voteCount.textContent = currentCount + 1;
            
            // 如果是赞同票，移除对立票的状态
            const oppositeBtn = voteType === 'up' 
                ? this.parentElement.querySelector('.downvote')
                : this.parentElement.querySelector('.upvote');
            
            if (oppositeBtn.classList.contains('voted')) {
                oppositeBtn.classList.remove('voted');
                const oppositeCount = oppositeBtn.querySelector('span');
                oppositeCount.textContent = parseInt(oppositeCount.textContent) - 1;
            }
        }
        
        // TODO: 发送投票请求到服务器
        // sendVoteToServer(postId, voteType);
    });
});

// 处理回复按钮点击
document.querySelectorAll('.reply-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const replyEditor = document.querySelector('.reply-editor');
        replyEditor.scrollIntoView({ behavior: 'smooth' });
        replyEditor.querySelector('textarea').focus();
    });
});

// 处理回复编辑器
const replyTextarea = document.querySelector('.reply-editor textarea');
if (replyTextarea) {
    // 自动调整文本框高度
    replyTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// 处理回复提交
const replyForm = document.querySelector('.reply-editor');
if (replyForm) {
    replyForm.querySelector('.btn-primary').addEventListener('click', function() {
        const content = replyForm.querySelector('textarea').value.trim();
        if (!content) {
            alert('请输入回复内容');
            return;
        }
        
        // TODO: 发送回复到服务器
        // sendReplyToServer(postId, content);
        
        // 清空输入框
        replyForm.querySelector('textarea').value = '';
    });
}

// 处理工具栏按钮
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.querySelector('i').className;
        
        switch(action) {
            case 'fas fa-star':
                toggleFavorite();
                break;
            case 'fas fa-share':
                sharePost();
                break;
            case 'fas fa-flag':
                reportPost();
                break;
            case 'fas fa-image':
                insertImage();
                break;
            case 'fas fa-link':
                insertLink();
                break;
            case 'fas fa-code':
                insertCode();
                break;
        }
    });
});

// 工具栏功能实现
function toggleFavorite() {
    const btn = document.querySelector('.tool-btn i.fa-star').parentElement;
    btn.classList.toggle('active');
    // TODO: 发送收藏请求到服务器
}

function sharePost() {
    // 获取当前页面URL
    const url = window.location.href;
    
    // 创建临时输入框
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    
    // 选择并复制
    input.select();
    document.execCommand('copy');
    
    // 移除临时输入框
    document.body.removeChild(input);
    
    // 显示提示
    alert('链接已复制到剪贴板');
}

function reportPost() {
    // TODO: 实现举报功能
    alert('举报功能开发中...');
}

// 编辑器工具栏功能
function insertImage() {
    // TODO: 实现图片上传功能
    const url = prompt('请输入图片URL：');
    if (url) {
        const textarea = document.querySelector('.reply-editor textarea');
        const imageMarkdown = `![图片](${url})`;
        insertAtCursor(textarea, imageMarkdown);
    }
}

function insertLink() {
    const url = prompt('请输入链接URL：');
    const text = prompt('请输入链接文字：');
    if (url && text) {
        const textarea = document.querySelector('.reply-editor textarea');
        const linkMarkdown = `[${text}](${url})`;
        insertAtCursor(textarea, linkMarkdown);
    }
}

function insertCode() {
    const textarea = document.querySelector('.reply-editor textarea');
    const selection = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    const code = selection || '在此输入代码';
    const codeBlock = `\`\`\`\n${code}\n\`\`\``;
    insertAtCursor(textarea, codeBlock);
}

// 辅助函数：在光标位置插入文本
function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    textarea.value = value.substring(0, start) + text + value.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
}

// 处理排序选项
const sortSelect = document.querySelector('.sort-options select');
if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        // TODO: 根据选择的排序方式重新加载回复列表
        // loadReplies(postId, sortBy);
    });
} 