// API 基礎 URL
const API_BASE_URL = 'https://apidictionary-main.vercel.app/api/dictionary';

// 測試 API 連接
async function testAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/en-tw/hello`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API 測試成功:', data);
        return data;
    } catch (error) {
        console.error('API 測試錯誤:', error);
        throw error;
    }
}

// 查詢單字
async function lookupWord(word) {
    try {
        const response = await fetch(`${API_BASE_URL}/en-tw/${word}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error looking up word:', error);
        return {
            error: true,
            message: '抱歉，查詢過程發生錯誤'
        };
    }
}

// 當文檔載入完成時測試 API
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await testAPI();
    } catch (error) {
        console.error('API 初始化測試失敗:', error);
    }
});

// 導出函數供其他模組使用
window.lookupWord = lookupWord; 