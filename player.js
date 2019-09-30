// pages/player/player.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      play:"暂停",
      // 控制收藏按钮样式
      isCollected:"collection",
      // 当前播放歌曲数据
      currentSong:{}
  },

  // 收藏按钮的点击事件
  collection(){
      if(this.data.isCollected == "collection"){
        this.setData({
          isCollected:""
        })
      }else{
        this.setData({
          isCollected:"collection"
        })
      }
    // 收藏的执行步骤
    // 1.确定添加歌曲的触发时机
    // 1.1注意：如果收藏就添加，如果取消收藏就移除
    // 判断来确定是添加还是移除
    // isCollected数据值为collection时，未收藏；如果是"_"就证明收藏了
    if (this.data.isCollected == "") {
      // 将歌曲数据添加进缓存
      // 如果没有缓存就直接创建
      if(!wx.getStorageSync("like")){
          let like = [this.data.currentSong];

          // 将like数据存入缓存中
          wx.setStorage({
            key: 'like',
            data: like,
          })
      }else{
        // 如果有缓存就将缓存取出并修改再存进去
        // 1.取缓存
       let like = wx.getStorageSync("like");
        console.log(like);
        // 2.修改数据
        like.push(this.data.currentSong);
        // 3.存入缓存
        wx.setStorage({
          key: 'like',
          data: like,
        })
      }
    }
    // 如果取消收藏
    else{
      // 将缓存中的数据移除
      // 1.获取下标
      let index = 0;

      // 2.根据下标确定我喜欢列表中要移除的歌曲
      // 2.1 先取出歌单数据
      let like = wx.getStorageSync("like");
      // 1.2 循环like歌单，拿下标
      for(let i = 0;i < like.length;i++){
        // 如果当前播放歌曲名称等于like列表中的某一首歌曲名，就获取这首歌的下标
        if(this.data.currentSong.musicData.songname==like[i].musicData.songname){
          // 获取下标
          index = i;
        }
      }
      // 2.2 操作歌单
      like.splice(index,1);
      console.log(like);
      // 2.3 将操作完的歌单存入缓存
      wx.setStorage({
        key: 'like',
        data: like,
      })
    }

  },

  
  // 2.如何添加到我喜欢列表
  // 3.如何在我喜欢列表中播放歌曲



  //播放暂停按钮的点击事件
  start(){
    if (this.data.play =="暂停"){
      //歌曲暂停，内容变为播放
      this.data.audios.pause();
      this.setData({
        play:"播放",
      })
    }else{
       //歌曲播放，内容变为暂停
       this.data.audios.play();
       this.setData({
         play: "暂停"
       })
    }
  },
  //上一曲按钮点击事件
  prev(){
     //通过下标来确定获取哪一首歌曲的数据
     //这里我们直接改变index
    //index应该是逐步递减
   let index = this.data.index;
   index--;
   //判断index是否小于0，如果成立就直接将index赋值为length-1
   if(index<0){
     index = this.data.newSongList.length-1;
   }
   this.setData({
     index,
   })
    this.onShow();
  },
  //下一曲按钮点击事件
  next(){
    let index = this.data.index;
    index++;
    if (index > this.data.newSongList.length - 1) {
      index = 0;
    }
    this.setData({
      index,
    })
    this.onShow();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //0.创建音频播放上下文
    let audios =  wx.createInnerAudioContext();
    this.setData({
      audios
    })

    //获取要播放歌曲的下标
    let index = wx.getStorageSync("index");
    //将下标存入data，方便后续使用
    this.setData({
      index,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //判断 如果标识为newSongList就获取新歌列表
    //1.拿标识
    let current = getApp().data.currentList;

    //2.做判断
    // if (current == "newSong") {
    //   var newSongList = wx.getStorageSync("newSongList");
    // }
    let newSongList = [];
    // 如果标识是newSong，就获取新歌列表
    if(current == "newSong"){
      newSongList = wx.getStorageSync("newSongList");
    }
    // 如果current标识值为nearly，表示当前歌单是最近播放
    else if(current == "nearly"){
        newSongList = wx.getStorageSync("nearlyPlay");
    }
    else if(current == "like"){
        // 如果歌单是我喜欢就获取我喜欢的歌单
        newSongList = wx.getStorageSync("like");
    }
    // 如果标识是search就获取搜索列表
    else if(current == "search"){
        newSongList = wx.getStorageSync("search");
    }
    else{
      // 否则就是播放歌手歌单
      let singerList = wx.getStorageSync("singerList");
      for(let i = 0;i < singerList.length;i++){
          // 和当前标识进行比对
          if(current == singerList[i].Fsinger_name){
            // 将当前歌单换为当前歌手的歌单
            // 这里获取歌手歌单需要使用同步代码，因为顺序问题
            newSongList = wx.getStorageSync(current);
          }
      }
    }
    console.log(newSongList);
   

    //将歌曲列表数据存入data
    this.setData({
      newSongList,
    })

    //当前播放的歌曲
    let currentSong = newSongList[this.data.index];
    console.log(currentSong);
    // 为了让收藏事件能拿到currentSong变量，将其存入data中
    this.setData({
      currentSong
    })


    // 如果当前歌曲对象没有data属性
    if (currentSong.data == undefined) {
      let obj = {};
      obj.data = currentSong;
      currentSong = obj;
    }






    // 最近播放列表中要存储的就是每一首正在播放的歌曲，存入缓存
    // 如果有nearlyPlay就直接追加否则就动态创建
    if(wx.getStorageSync("nearlyPlay")){
        // 如果当前歌曲缓存中没有，就存入缓存，否则就不存
        let nearlyPlay = wx.getStorageSync("nearlyPlay");

        // 创建一个标记变量，用来记录缓存中是否有当前歌曲
        let flag = 0;

  
      //判断 如果歌曲来自歌手列表就添加一个musicData属性
      if (currentSong.musicData != undefined) {
        //如果有musicData就将musicData数据赋值给当前歌曲变量
        currentSong.data = currentSong.musicData;
      }

        

        for(let i = 0;i < nearlyPlay.length;i++){
            // 判断当前播放歌曲是否存在于缓存中
          // 判断如果没有musicData就手动创建，并将data的值赋值给musicData
          if(currentSong.musicData==undefined){
            currentSong.musicData = currentSong.data;
          }
            if (currentSong.data.songname == nearlyPlay[i].data.songname) {
                // 如果缓存中已经有当前歌曲了，就将flag改为1
                  flag = 1;
            }
        }
      // 通过判断flag的值来确定是否重复
      if (flag == 0) {
        // 将当前歌曲添加进缓存中
        nearlyPlay.push(currentSong);
        wx.setStorage({
          key: 'nearlyPlay',
          data: nearlyPlay,
        })
      }

        


        // // 如果有数据
        // wx.getStorage({
        //   key: 'nearlyPlay',
        //   success: function(res) {
        //     // 操作res，将新增的歌曲存入res歌曲数组中即可
        //     res.data.push(currentSong);
        //     // 重新将res存入缓存
        //     wx.setStorage({
        //       key: 'nearlyPlay',
        //       data: res.data,
        //     })
        //   },
        //   fail:function(err){
        //     console.log(err);
        //   }
        // })
    }
    // 如果原本没有nearlyPlay数据，我们就重新存储一个
    else{
      wx.setStorage({
        key: 'nearlyPlay',
        data: [currentSong],
      })
    }
    
      // 缓存最近播放歌单完成
      // 优化思路->限制最近播放歌单的上限，最多存放150首歌，一旦超过就从最前面开始替换




    //歌手的歌曲列表数据和新歌速递的数据不同
    




    //歌曲名
    let songName = currentSong.data.songname;

    //歌手名
    let singer = currentSong.data.singer;
    this.setData({
      songName,
      singer
    })

    //"http://imgcache.qq.com/music/photo/album_300/albumid%100/300_albumpic_albumid_0.jpg",
          // albumid%100, albumid    获取歌曲专辑海报的地址公式

    let code = currentSong.data.albumid%100;
    let albumid = currentSong.data.albumid;
    //拼接歌曲专辑的图片url
    let imgUrl = `http://imgcache.qq.com/music/photo/album_300/${code}/300_albumpic_${albumid}_0.jpg`;
    

    //将图片地址存入data中即可
    this.setData({
      imgUrl,
    })




    //设置（拼接）音乐资源的地址
    let filename = "C400" + currentSong.data.songmid + ".m4a";
    let musicUrl = "https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=5381&inCharset=utf-8&outCharset=utf-8&notice=0&format=jsonp&hostUin=0&loginUin=0&platform=yqq&needNewCode=0&cid=205361747&uin=0&filename=" + filename + "&guid=3913883408&songmid=" + currentSong.data.songmid + "&callback=callback";

    wx.request({
      url: musicUrl,
      success: (res) => {
       
        let dataStr = res.data.slice(9, -1);
        let data = JSON.parse(dataStr);
        //我们这里获取的数据是歌曲资源的token
      
        //拼接歌曲资源的地址
        let filename1 = data.data.items[0].filename;
        let vkey = data.data.items[0].vkey;

        let musicSource = 'http://dl.stream.qqmusic.qq.com/' + filename + '?vkey=' + vkey + '&guid=3913883408&uin=0&fromtag=66';

        //将音频上下文对象的src属性设置为音频资源
        this.data.audios.src = musicSource;
        this.data.audios.autoplay = true;

      }
    })

      //https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=5381&inCharset=utf-8&outCharset=utf-8&notice=0&format=jsonp&hostUin=0&loginUin=0&platform=yqq&needNewCode=0&cid=205361747&uin=0&filename=C400'+currentSong.songmid+'.m4a&guid=3913883408&songmid='+currentSong.songmid+'&callback=callback
      // songmid可以从歌曲信息中取到，filename根据songmid生成。比如，songmid是003lghpv0jfFXG，则filename就是前缀加上C400，后缀加上.m4a，即C400003lghpv0jfFXG.m4a。其他字段format、platform、cid、guid可以写死，但都是必须写的





      // 获取like歌单，使用当前歌曲和like歌单中的歌曲进行对比，如果比对成功就让歌曲的收藏按钮亮起否则就灭掉
      // 0.声明一个标识变量
      let lk = 0;
      // 1.获取like歌单
      let like = wx.getStorageSync("like");
      console.log(currentSong);
      // 2.循环like歌单和当前歌单比对
      // for(let i = 0;i < like.length;i++){
      //     if(currentSong.musicData.songid == like[i].musicData.songid){
      //       // 证明歌曲已经收藏
      //       this.setData({
      //         isCollected: ""
      //       })
      //     }else{
      //       // 当前歌曲未收藏
      //       this.setData({
      //         isCollected:"collection"
      //       })
      //     }
      // }


        for (let i = 0; i < like.length; i++) {
          if(currentSong.musicData.songid == like[i].musicData.songid){
            lk = 1;
          }
      }
    if (lk == 1) {
      this.setData({
        isCollected: ""
      })
    } else {
      this.setData({
        isCollected: "collection"
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})