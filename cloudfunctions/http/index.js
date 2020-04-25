// 云函数入口文件
const axios = require('axios')

async function getdata() {
  try {
    var res = await axios.get('https://c.m.163.com/ug/api/wuhan/app/data/list-total')
    return res.data.data
  } catch (err) {
    console.log(err)
    return err
  }
  
}

// 云函数入口函数
exports.main = async (event, context) => {
  return getdata()
}