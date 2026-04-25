// js/main.js

const searchBtn = document.getElementById('btn_search');
const searchInput = document.getElementById('txt_SearchText');

// --- 核心功能函数：执行跳转 ---
function doSearch() {
    const keyword = searchInput.value.trim();
    if (keyword) {
        window.location.href = 'search.html?searchText=' + encodeURIComponent(keyword);
    } else {
        // 如果为空，可以给输入框加个震动效果或者提示，这里简单alert
        alert('请输入检索内容！');
        searchInput.focus(); // 让光标回到输入框
    }
}

// 1. 绑定按钮点击事件
searchBtn.addEventListener('click', doSearch);

// 2. 绑定键盘按下事件
searchInput.addEventListener('keydown', function(event) {
    // 判断按下的键是否是 "Enter"
    if (event.key === 'Enter') {
        // 阻止 textarea 的默认换行行为（可选，看你是否希望支持 Shift+Enter 换行）
        // 如果不加 event.preventDefault()，按回车会先换行再搜索
        event.preventDefault(); 
        doSearch(); // 触发搜索
    }
});