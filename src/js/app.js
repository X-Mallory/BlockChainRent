App = {

  //web3链接区块链，合约实例
  web3Provider: null,
  shareApp: {},
  defaultAccount: null,
  web3: null,
  Intermediator: "0x322fc04c646cc71707a997dc99f7732654449ba6",
  Intermediator_pass: "123",

//Min页面初始化函数
init:  function() {
    
  App.initWeb3();
  
  //App.initdata();

   //从区块链中获取商品
 App.shareApp.getObjectsNumber(function(error,result){
 if(!error)
 {
    var data_length = result.c[0];
    var length = result.c[0];
    //alert(data_length);
    var limit = 8;
    if(data_length <= 8)
        limit = data_length;
    data_length = Math.ceil(data_length/8);

     /////增加页码
    //翻页处理
    $(".zxf_pagediv").createPage({
            pageNum:data_length,
            current: 1,
            backfun: function(e,result) {
                console.log(e);
                var page = parseInt( e.current);
                if( page >0 && page <= data_length )
                  App.updatePageDate((page-1)*8,page*8,length);
            }
      });
   App.updatePageDate(0,limit);
     
     // console.log(goodsRow.html());
    
 }
 else
  console.error(error);

});
    //return await App.initWeb3();
  },

 ///更新页面数据
  updatePageDate: function(start,limit,length){
   $.ajaxSettings.async = false;

     var goodsRow = $('#goodsRow');
      //获取商品的添加模板
    var goodTemplate = $('#goodsTemplate');

    var mytips = new Array("tip exemption","tip donation","tip new_product");
    var tipContent = new Array("优惠","有赠品","新品");
    //移除子元素
    goodsRow.empty();
       
    if (limit > length)
          {
            limit = length;
          }
  
    for (i = start; i < limit; i ++) {
           
        App.shareApp.getObjectBy_id(i,function(error,result){
         if(!error)
       {
         goodTemplate = $('#goodsTemplate');
        var data = {};
        data.c_address = result[0];         //物品的拥有者地址
        data.title = result[1];             //物品名称
        data.priceDaily = result[2].c[0];   //日租金
        data.deposit = result[3].c[0];      //押金
        data.dec = result[4];               //描述
        data.img = "images/" +  result[5];               //图片地址
        data.isrent = result[6];            //是否被租用
        data.id = result[7].c[0]            //物品id
        data.price = result[3].c[0].toString() + '/' + result[2].c[0].toString() + "  (押金/日租金: wei)";
      

        
         goodTemplate.find('.myButton').attr('id', data.id);

        
        try{
          goodTemplate.find('img').attr('src', data.img);
          }
          catch(err){
            alert('未找到图片');
            goodTemplate.find('img').attr('src', "images/error.jpg");
      }

        goodTemplate.find('.title').text(data.title);
        goodTemplate.find('.dec').text(data.dec);
        goodTemplate.find('.price').text(data.price);
        
        var sss=i%3;
        Math.random()*3;
        var num = Math.random()*3 + 1;
        num = parseInt(num, 10);
       
        switch(num)
        {
        case 1:
           goodTemplate.find('#aa').attr('class', mytips[0]);
           goodTemplate.find('#aa').text(tipContent[0]);
          break;
        case 2:
           goodTemplate.find('#aa').attr('class', mytips[1]);
           goodTemplate.find('#aa').text(tipContent[1]);
          break;
        default:
          goodTemplate.find('#aa').attr('class', mytips[2]);
          goodTemplate.find('#aa').text(tipContent[2]);
        }

       
                //设置被租用
        if(data.isrent){
         
         goodTemplate.find('#'+ data.id +':first').text("已被租用");
         goodTemplate.find('#'+ data.id +':first').attr('onclick', "App.Norent(1)");

         goodTemplate.find('#'+ data.id +':first').next().next().text("归还物品");
         goodTemplate.find('#'+ data.id +':first').next().next().attr('onclick', "App.Back(this)");

         
         //data.isrent=false;
        }
        else
        {
          goodTemplate.find('#'+ data.id +':first').text("租用");
          goodTemplate.find('#'+ data.id +':first').attr('onclick', "App.Rent(this)");

         goodTemplate.find('#'+ data.id +':first').next().next().text("不可归还");
         goodTemplate.find('#'+ data.id +':first').next().next().attr('onclick', "App.Norent(2)");


        }

        // console.log(goodTemplate.html());
  
         goodsRow.append(goodTemplate.html());

        //console.log(goodsRow.html());
         //设置被租用
           }
       else
        console.error(error);
        });  
    }

       
       $.ajaxSettings.async = true;


  },


  //用于初始化区块链中的物品
  initdata: function(){

     $.ajaxSettings.async = false;

     $.getJSON('./goods.json', function(data) {
        alert('初始化数据');
     // name,priceDaily, deposit,detail,addr
      for (i = 0; i < data.length; i ++) {
        var name = data[i].title;
        var priceD = data[i].priceDaily;
        var dep = data[i].deposit;
        var deta = data[i].dec;
        var add = data[i].img;

        App.creatObject(name,parseInt(priceD),parseInt(dep),deta,add);
       
        }
      });
      $.ajaxSettings.async = true;

  },


  //用于初始化链接区块链，以及智能合约
  initWeb3:  function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);
     //先使用第一个默认账户
    web3.eth.defaultAccount = web3.eth.accounts[0];
    console.log("gasPrice(wei):",web3.eth.gasPrice.toString());
    App.defaultAccount =  web3.eth.defaultAccount;
    //console.log("account:",web3.eth.defaultAccount);
     // 加载Adoption.json，保存了Adoption的ABI（接口说明）信息

     var abi;
     var address;
    $.ajaxSettings.async = false;
    $.getJSON('./contracts/shareapp.json', function(data) {
      // 用Adoption.json数据创建一个可交互的TruffleContract合约实例。
       abi = data[0].abi;
       address = data[0].address
    });
    $.ajaxSettings.async = true;
    var shareAppContract = web3.eth.contract(abi);
    App.shareApp = shareAppContract.at(address);

  },









//租用页面的初始函数
rentstart: function(){
       App.initWeb3();
       var para = App.GetUrlPara();
       //区块链中查找物品信息
        App.shareApp.getObjectBy_id(para,function(error,result){
         if(!error)
       {
         
        var data = {} ;
        data.address = result[0];         //物品的拥有者地址
        data.title = result[1];             //物品名称
        data.priceDaily = result[2].c[0];   //日租金
        data.deposit = result[3].c[0];      //押金
        data.dec = result[4];               //描述
        data.img = "images/" + result[5];               //图片地址
        data.isrent = result[6];            //是否被租用
        data.id = result[7].c[0]            //物品id
        data.price = result[3].c[0].toString() + '/' + result[2].c[0].toString() + "   (wei)";
      
      var goodTemplate = $(document);
      goodTemplate.find('#creator').text(data.address);
      
      try{
          goodTemplate.find('#image').attr('src', data.img);
      }
      catch(err){
        console.log(err);
        goodTemplate.find('#image').attr('src', "images/error.jpg");
      }

      goodTemplate.find('#name').text(data.title);
     
      goodTemplate.find('#money').text(data.price);
      goodTemplate.find('.myButton').attr('id', data.id);
    }
    else
      console.log(error);
  });
     
},





//归还页面的初始函式
backstart: function(){
 App.initWeb3();
       var para = App.GetUrlPara();
       //区块链中查找物品信息
        App.shareApp.getObjectBy_id(para,function(error,result){
         if(!error)
       {
         
        var data = {} ;
        data.address = result[0];         //物品的拥有者地址
        data.title = result[1];             //物品名称
        data.priceDaily = result[2].c[0];   //日租金
        data.deposit = result[3].c[0];      //押金
        data.dec = result[4];               //描述
        data.img = "images/" + result[5];               //图片地址
        data.isrent = result[6];            //是否被租用
        data.id = result[7].c[0]            //物品id
        data.price = result[3].c[0].toString() + '/' + result[2].c[0].toString() + "   (wei)";
      
      var goodTemplate = $(document);
      goodTemplate.find('#creator').text(data.address);
      
      try{
          goodTemplate.find('#image').attr('src', data.img);
      }
      catch(err){
        console.log(err);
        goodTemplate.find('#image').attr('src', "images/error.jpg");
      }

      goodTemplate.find('#name').text(data.title);
     
      goodTemplate.find('#money').text(data.price);
      
      App.shareApp.getObjectRenter_Byid(data.id,function(error,result){
        if(!error){
           goodTemplate.find('#renter').text(result[1]);
           goodTemplate.find('#date_start').text(App.format(result[0].c[0]));
           console.log('timetamp:',result[0].c[0]);
           goodTemplate.find('#rent_money').text(App.getRentMoney(result[0].c[0],data.priceDaily));

        }
        else
          console.log(error);
        
      });
      


      goodTemplate.find('.myButton').attr('id', data.id);

    }
    else
      console.log(error);
  });
        
},







//查看物品详情页面的初始函数
 goodsstart: function(){
       App.initWeb3();
       var para = App.GetUrlPara();
       //区块链中查找物品信息
        App.shareApp.getObjectBy_id(para,function(error,result){
         if(!error)
       {
         
        var data = {} ;
        data.address = result[0];         //物品的拥有者地址
        data.title = result[1];             //物品名称
        data.priceDaily = result[2].c[0];   //日租金
        data.deposit = result[3].c[0];      //押金
        data.dec = result[4];               //描述
        data.img = "images/" + result[5];               //图片地址
        data.isrent = result[6];            //是否被租用
        data.id = result[7].c[0]            //物品id
        data.price = result[3].c[0].toString() + '/' + result[2].c[0].toString() + "   (wei)";
      //console.log(document);
      var goodTemplate = $(document);
      //goodTemplate.getElementById('.myButton').attr('id'," test");
      goodTemplate.find('#creator').text(data.address);
      
      try{
          goodTemplate.find('#image').attr('src', data.img);
      }
      catch(err){
        console.log(err);
        goodTemplate.find('#image').attr('src', "images/error.jpg");
      }

      goodTemplate.find('#name').text(data.title);

      goodTemplate.find('#rent').attr('onclick', "App.Back(this)");
      if (data.isrent)
      {
        
         goodTemplate.find('#rent').text("归还物品");
         goodTemplate.find('#rent').attr('onclick', "App.Back(this)");
         goodTemplate.find('#isrent').text("是");
      }
      else{

        goodTemplate.find('#rent').text("租用");
        goodTemplate.find('#rent').attr('onclick', "App.Rent(this)");
        goodTemplate.find('#isrent').text("否");
      }
      goodTemplate.find('#money').text(data.price);
      goodTemplate.find('#g_contet').text(data.dec);
      App.shareApp.getObjectRenter_Byid(para,function(error,result){
       if(!error)
       {
         console.log(result)
         goodTemplate.find('#renter').text(result[1]);
       }
       else
        console.log(error)

      });
     // goodTemplate.find('#renter').text("0x0000000000000000000000000000000000000000");
      goodTemplate.find('#r_time').text("租户未提供此项信息");
       goodTemplate.find('.myButton').attr('id', data.id);
      }
      else
        console.error(error);
     });

},



//租用函数
Confirm_Rent: function(e){

var objectid = e.id;

var renter = $("#account").val();
var pass = $("#pass").val();

//账户检查
var reg = new RegExp("(^0x[0-9|a-z|A-Z]*$)");
  if ( ! reg.test(renter))
  {
    $.message({
        message:'地址不合法!',
        type:'error'
    });
    return ;
  }
 //解锁账户
   try{
   result_1 = web3.personal.unlockAccount(renter,pass);
   console.log("password",result_1);
   }
   catch(err){
    $.message({
        message:'账户密码错误',
        type:'error'
    });
    //console.log(result_1);
    return ;
   }
  // console.log(result_1);

//当前时间戳
var date = new Date().getTime();

   //调用智能合约租借函数
 aa = App.shareApp.rentObj(parseInt(objectid), date,App.Intermediator ,renter,{from:renter,gas:300000},function(error,result){
           if(!error)
           {
            console.log("success:",result);
             $.message({
                 message:'租借成功',
                 type:'success'
                    });
            
           }
           else{
            $.message({
                    message:'租借失败',
                    type:'error'
                     });
              console.log("success:",result);
           }
            //console.error(error);
          });
  console.log(aa);
  

},






//归还函数
Confirm_Back: function(e){
var objectid = e.id;
var payfor = $(document).find('#rent_money').text();

var renter = $(document).find('#renter').text();
var pass = $("#pass").val();
var creator = null;


App.shareApp.getObjectBy_id(objectid,function(error,result){
         if(!error)
       {
         
        creator = result[0];         //物品的拥有者地址
        }
        else
          console.log(error);
      });

App.shareApp.getObjectRenter_Byid(objectid,function(error,result){
        if(!error){
           renter = result[1];   //租用者地址

          
           //解锁账户
             try{
             result_1 = web3.personal.unlockAccount(renter,pass);
             }
             catch(err){
              $.message({
                  message:'账户密码错误,不能归还',
                  type:'error'
              });
              return ;
             }
             console.log(result_1);
                  }
                  else
                    console.log(error);
            
      });

   //当前时间戳
   var date = new Date().getTime();
    
    //解锁中间人账户
   try{
   result_1 = web3.personal.unlockAccount(App.Intermediator,App.Intermediator_pass);
   }
   catch(err){
    $.message({
        message:'内部发生错误，归还失败',
        type:'error'
    });
    console.log(err);
    return ;
   }
    //alert(renter);
   console.log('id',parseInt(objectid),'d',date,'r',renter);
   console.log(App.Intermediator);
   console.log(payfor);
   //调用智能合约的归还函数
    aa = App.shareApp.backObj(parseInt(objectid),date,{from:App.Intermediator,value:payfor,gas:300000},function(error,result){
           if(!error)
           {
             $.message({
               message:'归还成功',
               type:'success'
                      });
             console.log("Success creat:",result);
           }
           else{

            $.message({
               message:'归还失败',
               type:'error'
                      });
            console.error(error);
           }
            

          });
         console.log("back",aa);

},








//点击创建后的响应函数
 creat: function(){
  //alert("创建");
  var goodTemplate = $(document);

      //goodTemplate.getElementById('.myButton').attr('id'," test");
  var addr = $('#address').val();
  var name = $('#name').val();
  var money = $('#money').val();
  var conent = $('#g_content').val();
  //图片地址还未处理
  /// goodTemplate.find('#r_time').text();
  var img = $('#picture').val();
  var pass =  $('#pass').val();
  
  console.log(addr,name,money,conent);

  //检查账户地址的正则表达式
  var reg = new RegExp("(^0x[0-9|a-z|A-Z]*$)");
  if ( ! reg.test(addr))
  {
    $.message({
        message:'地址不合法!',
        type:'error'
    });
    return ;
  }
   
  var pp = money.split('/');
  var pri = pp[0];
  var dep = pp[1];

  console.log(pri,dep);

  //价格填写格式错误
  if (pri == null || dep == null)
  {
  $.message({
        message:'请检查价格填写格式',
        type:'error'
    });
    return ;

  }
   
   //解锁账户
   try{
   result_1 = web3.personal.unlockAccount(addr,pass);
   }
   catch(err){
    $.message({
        message:'账户密码错误',
        type:'error'
    });
    return ;
   }
   console.log(result_1);

   aa = App.shareApp.createObj(name, parseInt(dep),parseInt(pri),conent,img,{from:addr,gas:300000},function(error,result){
           if(!error)
           {
             $.message({
               message:'创建成功',
               type:'success'
                      });
             console.log("Success creat:",result);
           }
           else{

            $.message({
               message:'创建失败',
               type:'error'
                      });
            console.error(error);
           }
            

          });
         console.log("back",aa);
 },


//点击租用后调用的函数，跳转到租用页面
Rent: function(e){
    var id = e.id;
    console.log(id);
    var url = "Rent.html"+"?id="+ id;
    console.log(url);
    window.location.href=url;

},


//点击归还后调用的函数，跳转到归还页面
Back: function(e){
    var id = e.id;
    console.log(id);
    var url = "Back.html"+"?id="+ id;
    console.log(url);
    window.location.href=url;

},


//点击查看详情后调用的函数，跳转到物品详情页面
lookgoods: function(e) {
    var id = e.id;
    console.log(id);
    var url = "goods.html"+"?id="+ id;
    console.log(url);
    window.location.href=url;
   
  },


//获取URl参数
  GetUrlPara: function ()
　　{
　　　　var url = document.location.toString();
　　　　var arrUrl = url.split("?");

　　　　var para = arrUrl[1].split("=");
        
　　　　return para[1];
　　},

//查询账户余额
  getMoney: function() {
    var addr = $('#address').val();
    var reg = new RegExp("(^0x[0-9|a-z|A-Z]*$)");
    if ( ! reg.test(addr))
    {
      $.message({
          message:'地址不合法!',
          type:'error'
      });
      return ;
    }
  
   console.log(web3.eth.getBalance(addr));
    money = web3.eth.getBalance(addr);


    $('#addr').text(addr);
    $('#money').text(money.toNumber());
  },



//已被租用，不可租用
Norent: function(flag){
  if(flag == 1){
  $.message({
        message:'已经被租用啦!',
        type:'info'
    });
   }
  if(flag == 2){
  $.message({
        message:'还未租出，不可以归还!',
        type:'info'
    });
   }
},



//通过时间差计算小时差
 datetime: function (time) {
    var interval = new Date().getTime()-time;
    //计算出相差小时数
    
    var returnTime=Math.floor(interval/(3600*1000))

    return returnTime;
},

//计算租用费用
getRentMoney: function(tiemtamp,price_hour){

  time = App.datetime(tiemtamp);
  if(time < 1)
    time = 1;
  return time * price_hour;
},

//将时间戳转换为日期格式
add0: function(m){return m<10?'0'+m:m },
format: function(shijianchuo)
{
var time = new Date(shijianchuo);
var y = time.getFullYear();
var m = time.getMonth()+1;
var d = time.getDate();
var h = time.getHours();
var mm = time.getMinutes();
var s = time.getSeconds();
return y+'-'+App.add0(m)+'-'+App.add0(d)+' '+App.add0(h)+':'+App.add0(mm)+':'+App.add0(s);
},








//获得当前物品数量
getObjNum: function(){
  
 App.shareApp.getObjectsNumber(function(error,result){
 if(!error)
 {
    alert(result.c[0]);
    return result.c[0];
 }
 else
  console.error(error);

});
  
},


//创建新的物品:
creatObject: function(name,priceDaily, deposit,detail,addr){
//参数检查：

              //调用合约函数
           var aa = App.shareApp.createObj(name,parseInt(priceDaily), parseInt(deposit),detail,addr,{from:App.defaultAccount,gas:300000},function(error,result){
           if(!error)
           {
             console.log("Success creat:",result);
           }
           else
            console.error(error);
          });
          App.shareApp.getObjectsNumber(function(error,result){
             if(!error)
           {
             console.log("Success get:",result.c[0]);
           }
           else
            console.error(error);

          });



},


//通过物品ID获取物品
getObject_Byid: function(id){

 App.shareApp.methods.getObjectBy_id().call().then(id,function(error,result){
   if(!error)
 {
    alert(111);
    var object = {};
    object.c_address = result[0];         //物品的拥有者地址
    object.title = result[1];             //物品名称
    object.priceDaily = result[2].c[0];   //日租金
    object.deposit = result[3].c[0];      //押金
    object.dec = result[4];               //描述
    object.img = result[5];               //图片地址
    object.isrent = result[6];            //是否被租用
    object.price = result[3].c[0].toString() + '/' + result[2].c[0].toString();

   // return object;
 }
 else
  console.error(error);
  });

 alert(222);
},



};

