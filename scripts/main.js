// 全局變數聲明
let sidebar, mainContent, overlay, sidebarToggle, articles, welcomeScreen, addArticleBtn;

// 當文檔加載完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素初始化
    initializeElements();
    
    // 從 localStorage 加載文章列表
    articles = JSON.parse(localStorage.getItem('articles') || '[]');
    
    // 初始化事件監聽器
    initializeEventListeners();
    
    // 初始化渲染
    renderArticles();
});

// 初始化 DOM 元素
function initializeElements() {
    sidebarToggle = document.getElementById('sidebarToggle');
    sidebar = document.getElementById('sidebar');
    mainContent = document.querySelector('.main-content');
    overlay = document.getElementById('sidebarOverlay');
    welcomeScreen = document.getElementById('welcome-screen');
    addArticleBtn = document.querySelector('.add-article');
}

// 初始化事件監聽器
function initializeEventListeners() {
    if (!sidebarToggle || !sidebar || !mainContent || !overlay) {
        console.error('Required elements not found');
        return;
    }

    // 側邊欄切換按鈕事件
    sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openSidebar();
    });

    // 側邊欄關閉按鈕事件
    const sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }
    
    // 遮罩層點擊事件
    overlay.addEventListener('click', closeSidebar);

    // 新增文章按鈕事件
    if (addArticleBtn) {
        addArticleBtn.addEventListener('click', function() {
            closeSidebar();
            showArticleEditor();
        });
    }

    // ESC 鍵關閉側邊欄
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

// 打開側邊欄
function openSidebar() {
    sidebar.classList.add('active');
    mainContent.classList.add('shifted');
    overlay.classList.add('active');
    sidebarToggle.classList.add('hidden');
}

// 關閉側邊欄
function closeSidebar() {
    sidebar.classList.remove('active');
    mainContent.classList.remove('shifted');
    overlay.classList.remove('active');
    sidebarToggle.classList.remove('hidden');
}

function formatArticleContent(content) {
    const lines = content.split(/[\r\n]+/);
    
    return lines.map((line, index) => {
        const sentences = line.match(/[^.!?]+[.!?"]+/g) || [line];
        
        return sentences.map(sentence => {
            if (sentence.trim()) {
                const escapedSentence = sentence.trim()
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                
                return `
                    <div class="sentence-container ${index % 2 === 0 ? 'even-row' : 'odd-row'}">
                        <div class="sentence">
                            ${formatWords(escapedSentence)}
                        </div>
                        <button class="play-sentence" onclick="playTextToSpeech(\`${escapedSentence}\`)">
                            🔊
                        </button>
                    </div>
                `;
            }
            return '';
        }).join('');
    }).join('\n');
}

// 顯示文章編輯器
function showArticleEditor() {
    mainContent.innerHTML = `
        <div class="article-editor-page fade-in">
            <div class="article-editor" onclick="event.stopPropagation()">
                <h2>新增文章</h2>
                <div class="editor-content">
                    <input type="text" id="articleTitle" placeholder="請輸入標題" class="editor-input">
                    <textarea id="articleContent" placeholder="請輸入文章內容" class="editor-textarea"></textarea>
                </div>
                <div class="editor-buttons">
                    <button onclick="saveArticle()" class="save-btn">儲存文章</button>
                    <button onclick="cancelEdit()" class="cancel-btn">取消</button>
                </div>
            </div>
        </div>
    `;
}

// 儲存文章
function saveArticle() {
    const title = document.getElementById('articleTitle').value.trim();
    const content = document.getElementById('articleContent').value.trim();
    
    if (!title || !content) {
        showMessage('請填寫標題和內容', 'error');
        return;
    }

    const newArticle = {
        id: Date.now(),
        title: title,
        content: content
    };

    articles.push(newArticle);
    localStorage.setItem('articles', JSON.stringify(articles));
    
    renderArticles();
    showArticle(newArticle);
    showMessage('文章儲存成功！', 'success');
}

// 取消編輯
function cancelEdit() {
    if (articles.length > 0) {
        showArticle(articles[articles.length - 1]);
    } else {
        welcomeScreen.style.display = 'block';
    }
}

// 顯示文章
function showArticle(article) {
    welcomeScreen.style.display = 'none';
    mainContent.innerHTML = `
        <div class="article-content fade-in">
            <h1>${article.title}</h1>
            <div class="article-text">${formatArticleContent(article.content)}</div>
        </div>
    `;
    addWordClickEvents();
}

// 渲染文章列表
function renderArticles() {
    const articleList = document.getElementById('articleList');
    articleList.innerHTML = '';
    
    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'article-item';
        
        articleElement.innerHTML = `
            <div class="article-content-wrapper" onclick="showArticle(${JSON.stringify(article).replace(/"/g, '&quot;')})">
                <h3>${article.title}</h3>
                <p class="article-preview">${article.content.substring(0, 100)}...</p>
            </div>
            <button class="delete-article" onclick="deleteArticle(${article.id})">×</button>
        `;
        
        articleList.appendChild(articleElement);
    });
}

// 刪除文章
function deleteArticle(id) {
    if (confirm('確定要刪除這篇文章嗎？')) {
        articles = articles.filter(article => article.id !== id);
        localStorage.setItem('articles', JSON.stringify(articles));
        renderArticles();
        
        if (articles.length === 0) {
            welcomeScreen.style.display = 'block';
        } else {
            showArticle(articles[articles.length - 1]);
        }
        
        showMessage('文章已刪除', 'success');
    }
}

// 顯示提示訊息
function showMessage(message, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = `${type}-message`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    setTimeout(() => messageElement.classList.add('show'), 10);
    
    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => messageElement.remove(), 300);
    }, 3000);
}

// 格式化單字
function formatWords(sentence) {
    return sentence.split(/\s+/).map(word => {
        // 清理單字，只保留字母、連字符和所有格符號
        const cleanWord = word.replace(/[^a-zA-Z'-]/g, '');
        if (cleanWord) {
            // 為單字添加可點擊的 span 標籤
            return `<span class="word" data-word="${cleanWord}">${word}</span>`;
        }
        return word;
    }).join(' ');
}

// 為單字添加點擊事件
function addWordClickEvents() {
    document.querySelectorAll('.word').forEach(word => {
        // 懸停效果
        word.addEventListener('mouseenter', () => {
            word.classList.add('word-hover');
        });
        
        word.addEventListener('mouseleave', () => {
            word.classList.remove('word-hover');
        });
        
        // 點擊查詢
        word.addEventListener('click', async () => {
            const wordText = word.dataset.word.replace(/[^a-zA-Z]/g, '');
            if (wordText) {
                try {
                    const wordData = await window.lookupWord(wordText);
                    displayWordDetails(wordData);
                    document.getElementById('wordModal').style.display = 'block';
                } catch (error) {
                    console.error('Error looking up word:', error);
                    showMessage('查詢單字時發生錯誤', 'error');
                }
            }
        });
    });
}

// 顯示單字詳細資訊
function displayWordDetails(data) {
    if (data.error) {
        document.getElementById('wordModal').innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <div class="word-error">${data.message}</div>
            </div>
        `;
        return;
    }

    // 整理發音資訊，確保每種發音只出現一次
    const pronunciations = data.pronunciation ? Array.from(new Set(
        data.pronunciation.map(p => `${p.lang}:${p.pron}:${p.url}`)
    )).map(p => {
        const [lang, pron, url] = p.split(':');
        return { lang, pron, url };
    }) : [];

    const modalContent = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="word-header">
                <h2>${data.word}</h2>
                <div class="pronunciations">
                    ${pronunciations.map(pron => `
                        <div class="phonetic">
                            <span>${pron.lang === 'uk' ? '英音' : '美音'}: ${pron.pron}</span>
                            <button onclick="playTextToSpeech('${data.word}')" class="play-btn">🔊</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="translations">
                ${data.definition.map(def => `
                    <div class="meaning">
                        <div class="part-of-speech">${def.pos}</div>
                        <div class="definition">${def.translation}</div>
                        <div class="english-def">${def.text}</div>
                        ${def.example ? `
                            <div class="examples">
                                ${def.example.map(ex => `
                                    <div class="example">
                                        <p class="english">${ex.text}</p>
                                        <p class="chinese">${ex.translation}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('wordModal').innerHTML = modalContent;

    // 重新綁定關閉按鈕事件
    const closeBtn = document.querySelector('.modal .close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            document.getElementById('wordModal').style.display = 'none';
        }
    }

    // 點擊 modal 外部關閉
    const modal = document.getElementById('wordModal');
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
} 