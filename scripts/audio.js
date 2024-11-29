// 使用 Web Speech API 進行語音合成
const synth = window.speechSynthesis;
let currentRate = 1.0;

// 文本轉語音函數
function playTextToSpeech(text) {
    // 停止當前正在播放的語音
    synth.cancel();
    
    // 移除 HTML 實體和多餘的空格
    text = text.replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .trim();
    
    // 創建語音實例
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 設置語音參數
    utterance.lang = 'en-US';
    utterance.rate = currentRate;
    utterance.pitch = 1;
    
    // 播放語音
    synth.speak(utterance);
}

// 設置語速
function setSpeechRate(rate) {
    currentRate = parseFloat(rate);
}

// 停止播放
function stopAudio() {
    synth.cancel();
}

// 導出函數
window.playTextToSpeech = playTextToSpeech;
window.setSpeechRate = setSpeechRate;
window.stopAudio = stopAudio; 