// pages/addFunction/addFunction.js
var QQMapWX = require("../../libs/qqmap-wx-jssdk.js")
var qqmapsdk;


Page({
  data: {
    
  },

  onLoad: function (options) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'DWGBZ-I3CWD-GMW4W-PSXMX-CSGPQ-ZUFGY'
    });
    this.getData()
  },

  onReachBottom: function () {
    // 页面触底时执行

  },

  test:async function () {

    this.getData()
    
  },


  getData: function () {//次数，单次数量
    var t=this
    console.log('获取数据')
    wx.cloud.callFunction({
      name: 'http',
      data: {
        url:'https://file1.dxycdn.com/2020/0130/454/3393874921745912507-115.json?t=26464959'
      },
    })
      .then(res => {
        console.log(res.result)
        var data = res.result
        
        t.setData({ 'source': data })
      })
      .catch(console.error)





    //t.setData("source",)
    // this.GetProvince(async function (province) {  //回调
    //   console.log(province)
    //   const db = wx.cloud.database()
    //   const _ = db.command
    //   const count = await db.collection('psychologist').where(
    //       {
    //         'province': province
    //       }
    //   ).count()
    //   const total = count.total
    //   console.log(total)
    //   const MAX_LIMIT = 20  //由于微信限制，一次最多取20个元素
    //   const batchTimes = Math.ceil(total / 20)
    //   var source=[]
    //   for (let i = 0; i < batchTimes; i++) {
    //     db.collection('psychologist').where(
    //       {'province': province}
    //       ).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get(
    //         {
    //           success: function(res) {
    //             console.log(res.data)
                
    //             var data=res.data
    //             data.forEach(function(element){
    //               var obj={}
    //               obj.organization=element.organization
    //               obj.time=element.time
    //               obj.tel=element.tel
    //               source.push(obj)
    //             })
    //             console.log(source)
    //             if(i==batchTimes-1)
    //               t.setData({'source':source})
                

    //           //t.setData({'source':source})
              
    //           },
    //           fail: err => {
    //             console.error('失败：', err)
    //           }
    //         }
    //       )
    //   }

    //   // // 等待所有
    //   // return (await Promise.all(tasks)).reduce((acc, cur) => {
    //   //   const result = acc.data.concat(cur.data)
    //   //   console.log(result)
    //   //   var source=[]
    //   //   result.forEach(function(element){
    //   //     var obj={}
    //   //     obj.hospital=element.hospital
    //   //     obj.address=element.address
    //   //     obj.tel=element.tel
    //   //     obj.type=element.type
    //   //     source.push(obj)
    //   //   });
    //   //   t.setData({"source",source})
    //   //   console.log(t.data.source)
    //   //   return {
    //   //     data: acc.data.concat(cur.data),
    //   //     errMsg: acc.errMsg,
    //   //   }
    //   // })

      



    // })
  },

  SearchInput: function (e) {
    this.setData({
      searchname: e.detail.value

    })
    this.btn_search()
  },

  GetProvince: function (callback) {
    var t = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        var lo = {}
        lo.latitude = res.latitude
        lo.longitude = res.longitude
        qqmapsdk.reverseGeocoder({
          location: lo,
          coord_type: 1,
          success: function (res) {
            console.log(res.result.address_component.province)
            t.setData({"city":res.result.address_component.province})
            callback(res.result.address_component.province)
          },
          fail: function (error) {
            console.error(error);
          }
        })

      }
    })
  },

  btn_search: function () {
    

    var src = this.data.searchname
    const db = wx.cloud.database();
    db.collection('2019ncov').where({
      t_no: {
        $regex: ".*" + src + ".*",
        $options: 'i'
      }
    })
      .get({
        success: function (res) {
          console.log(res.data)
          var source = []
          var data = res.data
          data.forEach(function (element) {
            var obj = {}
            obj.img = tfimg[element.t_type]
            obj.date = element.t_date
            obj.no = element.t_no
            obj.start = element.t_pos_start
            obj.end = element.t_pos_end
            obj.no_sub = element.t_no_sub
            obj.memo = element.t_memo
            source.push(obj)

          });
          t.setData({ 'source': source })

        },
        fail: err => {
          console.error('失败：', err)
        }
      })


  }


})

