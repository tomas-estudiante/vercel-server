const axios = require('axios');

module.exports = async (req, res) => {
  const { code } = req.query;
  const appId = '���С����AppID';
  const appSecret = '���С����AppSecret';

  try {
    const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`);
    const { openid, session_key } = response.data;

    res.status(200).json({ openid, session_key });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch openid' });
  }
};