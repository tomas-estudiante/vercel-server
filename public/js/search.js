// --- 页面加载时，解析 URL 中的 searchText 参数，并将其显示在输入框中 ---
document.addEventListener('DOMContentLoaded', function () {
    // 1. 获取当前页面的完整 URL (例如: .../search.html?q=自然)
    const queryString = window.location.search;

    // 2. 利用 URLSearchParams 解析参数
    const urlParams = new URLSearchParams(queryString);

    // 3. 获取名为 "searchText" 的参数值
    const searchText = urlParams.get('searchText');

    // 4. 如果存在关键词，则将其填入输入框
    if (searchText) {
        const inputBox = document.getElementById('txt_search');
        inputBox.value = decodeURIComponent(searchText); // 解码并赋值

        // 可选：同时更新你标签中的 searchword 属性，保持数据同步
        inputBox.setAttribute('searchword', searchText);

        doSearch(searchText); // 执行搜索，显示结果
    }
});

// --- 清空输入框功能 ---
// 1. 获取元素
const clearBtn = document.getElementById('clearBtn');
const txtSearch = document.getElementById('txt_search');
// 2. 绑定点击事件
clearBtn.addEventListener('click', function () {
    // 清空输入框的值
    txtSearch.value = '';

    // 可选：如果需要，也可以清空你自定义的属性
    txtSearch.setAttribute('searchword', '');

    // 清空后隐藏×号
    clearBtn.style.display = 'none';

    // 让光标回到输入框，方便用户重新输入
    txtSearch.focus();
});
// 3. 监听输入框内容变化，动态显示或隐藏清空按钮
txtSearch.addEventListener('input', function () {
    // 如果输入框有值，显示×；否则隐藏
    if (this.value.trim() !== '') {
        clearBtn.style.display = 'inline-block';
    } else {
        clearBtn.style.display = 'none';
    }
});

// --- 搜索功能 ---
const searchBtn = document.getElementById('btn_search');
searchBtn.addEventListener('click', function () {
    const searchText = document.getElementById('txt_search').value;
    doSearch(searchText);
    setParam(searchText); // 更新 URL 中的 searchText 参数
});
txtSearch.addEventListener('keydown', function (event) {
    // 判断按下的键是否是 "Enter"
    if (event.key === 'Enter') {
        // 阻止 textarea 的默认换行行为（可选，看你是否希望支持 Shift+Enter 换行）
        // 如果不加 event.preventDefault()，按回车会先换行再搜索
        event.preventDefault();
        const searchText = document.getElementById('txt_search').value;
        doSearch(searchText); // 触发搜索
        setParam(searchText); // 更新 URL 中的 searchText 参数
    }
});
// 更新 URL 中的 searchText 参数
function setParam(searchText) {
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?searchText=' + encodeURIComponent(searchText);
    window.history.pushState({ path: newUrl }, '', newUrl);
}
/**
* 核心搜索函数
* @param {string} searchText - 用户输入的检索词
*/
function doSearch(searchText) {
    const container = document.getElementById('result-container');
    const keyword = searchText.trim().toLowerCase();

    // 如果关键词为空，清空结果并返回
    if (!keyword) {
        container.innerHTML = '';
        return;
    }

    // 使用 fetch 获取 data 文件夹下的 json 数据
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("网络响应错误");
            }
            return response.json();
        })
        .then(data => {
            // 1. 过滤数据：查找 tags 数组中包含关键词的条目
            const filteredData = data.filter(item => {
                // 检查 tags 数组中是否有任意一个标签包含关键词
                return item.tags.some(tag => tag.toLowerCase().includes(keyword));
            });

            // 2. 渲染结果
            renderTable(filteredData);
        })
        .catch(error => {
            console.error('获取数据失败:', error);
            container.innerHTML = '<p class="no-result">⚠️ 数据加载失败。请确保你是在服务器环境（如 Live Server）下运行，而不是直接打开文件。</p>';
        });
}
/**
 * 根据数据渲染表格
 * @param {Array} list - 过滤后的数据数组
 */
function renderTable(list) {
    const container = document.getElementById('result-container');

    if (list.length === 0) {
        container.innerHTML = '<p class="no-content" value="">抱歉，暂无数据，请稍后重试。</p>';
        return;
    }

    // 构建表格 HTML 字符串
    let tableHtml = `
        <table class="result-table-list">
            <thead>
                <tr>
                    <th>主题</th>
                    <th>作者</th>
                    <th>来源</th>
                    <th>数据库</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;

    // 遍历数据生成行
    list.forEach(item => {
        if (item.database === "图片") {
            tableHtml += `
                <tr>
                    <td class="title"><a href="${item.url}" target="_blank"><img src="${item.url}" alt="${item.title}" class="pic"></a></td>
                    <td class="author">${item.author}</td>
                    <td class="source">${item.source}</td>
                    <td class="data">${item.database}</td>
                    <td class="operat"><button class="btn-quote" onclick="copyImage('${item.url}')">复制</button></td>
                </tr>
            `;
            return; // 跳过后续文本数据的渲染
        } else {
            tableHtml += `
            <tr>
                <td class="title"><a href="${item.url}" target="_blank">${item.title}</a></td>
                <td class="author">${item.author}</td>
                <td class="source">${item.source}</td>
                <td class="data">${item.database}</td>
                <td class="operat"><button class="btn-quote" onclick="alert('引用了：${item.title}')">引用</button></td>
            </tr>
        `;
        }

    });

    tableHtml += `</tbody></table>`;

    // 插入到页面
    container.innerHTML = tableHtml;
}

/**
 * 复制图片到剪贴板的函数
 * @param {string} imageUrl - 原始图片的 URL
 * @param {string} vercelDomain - 你的 Vercel 项目域名 (例如: https://your-project.vercel.app)
 * @returns {Promise<boolean>}
 */
async function copyImageToClipboard(imageUrl, vercelDomain = 'https://vercel-server-kappa.vercel.app') {
  const controller = new AbortController();

  try {
    // 1. 使用 Vercel 代理接口获取图片
    // 构造代理 URL: /api/proxy-image?url=原始图片地址
    const proxyUrl = new URL('/api/proxy-image', vercelDomain);
    proxyUrl.searchParams.append('url', imageUrl);

    console.log('正在从代理获取图片:', proxyUrl.toString());

    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      // 必须设置 mode: 'cors'，即使服务端允许了，前端也要声明
      mode: 'cors' 
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    // 2. 将响应转换为 Blob
    const blob = await response.blob();

    // 3. 使用 Clipboard API 写入剪贴板
    // 注意：这需要用户手势触发（如点击按钮），且需要 HTTPS 环境
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);

    console.log('图片已成功复制到剪贴板！');
    return true;

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Fetch aborted');
    } else if (err.name === 'NotAllowedError') {
      alert('浏览器拒绝了剪贴板访问权限。请确保是在安全上下文(HTTPS)下运行，并且是由用户点击触发的。');
    } else {
      console.error('复制图片失败:', err);
      alert('复制失败: ' + err.message);
    }
    return false;
  }
}