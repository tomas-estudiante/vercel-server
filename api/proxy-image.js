// api/proxy-image.js (Vercel Serverless Function)

/**
 * Vercel Serverless Function 代理图片接口
 * 用于解决跨域问题并提供图片流
 */
export default async function handler(req, res) {
  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing image URL' });
  }

  try {
    // 1. 获取目标图片
    // { cf: { image: { format: 'jpeg' } } } 是可选的 Vercel Edge Network 图片优化参数
    const response = await fetch(url, {
      // 建议带上 Referer 防盗链，有些图床需要
      headers: {
        'Referer': 'https://s21.ax1x.com/' 
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    // 2. 设置响应头 (CORS + 二进制流)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    // ⭐️ 允许所有来源跨域 (生产环境建议替换为你的域名)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 3. 将图片数据流式传输给前端
    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Image Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// 必须导出 config 以支持二进制流
export const config = {
  api: {
    bodyParser: false, // 关闭默认解析，处理二进制流
    responseLimit: false, // 允许大文件
  },
};