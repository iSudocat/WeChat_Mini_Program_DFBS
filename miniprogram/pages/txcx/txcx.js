// pages/addFunction/addFunction.js

const code = `// 云函数入口函数
exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  return {
    sum: event.a + event.b
  }
}`

Page({
  data: {
    tflist:[
      {
        "name":"火车",
        "img":"images/train.png"
      },
      {
        "name":"飞机",
        "img":"images/airplane.png"
      }
    ],

    source:[

    ]
  },

  onLoad: function (options) {
    
  },

  test:function(){
    console.log('test')
    var obj={}
    obj.name="公交"
    obj.img="images/bus.png"
    let tflist=this.data.tflist;
    tflist.push(obj)
    this.setData({'tflist':tflist})
    
  },

  SearchInput: function (e) {
    this.setData({
      searchname: e.detail.value
    })
  },


  btn_search:function(){
    var t = this
    var tfimg={
      1:"images/airplane.png",
      2:"images/train.png",
      3:"images/subway.png",
      4:"images/bus.png",
      5:"images/bus.png",
      6:"images/taxi.png"
    }

    var src=this.data.searchname
    const db = wx.cloud.database();
    db.collection('2019ncov').where({
     t_no:{
       $regex:".*"+src+".*",
       $options:'i'
      }
    })
    .get({
      success: function(res) {
        console.log(res.data)
        var source=[]
        var data=res.data
        data.forEach(function(element){
          var obj={}
          obj.img=tfimg[element.t_type]
          obj.date=element.t_date
          obj.no=element.t_no
          obj.start=element.t_pos_start
          obj.end=element.t_pos_end
          obj.no_sub=element.t_no_sub
          obj.memo=element.t_memo
          source.push(obj)
          
        });
        t.setData({'source':source})

      },
      fail: err => {
        console.error('失败：', err)
      }
    })


  },
  testFunction() {
    wx.cloud.callFunction({
      name: 'sum',
      data: {
        a: 1,
        b: 2
      },
      success: res => {
        wx.showToast({
          title: '调用成功',
        })
        this.setData({
          result: JSON.stringify(res.result)
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '调用失败',
        })
        console.error('[云函数] [sum] 调用失败：', err)
      }
    })
  },

})

