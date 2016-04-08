// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

var util = require('util');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

//app.get('/form', function(req, res) {
//  const NumberOfStockCodes = 5;
//  var formModel = {
//    appName: req.query.appName,
//    deviceID: req.query.deviceID,
//    stockCodes: null,
//    shouldClose: false,
//    settingsData: ""
//  };
//  var query = new AV.Query('Settings');
//  query.equalTo('appName', formModel.appName);
//  query.equalTo('deviceID', formModel.deviceID);
//  query.find({
//    success: function (results) {
//      var record = null;
//      if (results.length > 0) {//如果找到记录，则在原来基础上做更新操作。
//        record = results[0];
//        console.log('have found record');
//        formModel.stockCodes = record.get("settingsData").stockCodes;
//      }else{//如果没有找到记录，则做新建操作。
//        console.log('no record found');
//        var arr = new Array(NumberOfStockCodes);
//        for(var i=0; i<NumberOfStockCodes; i++){
//          arr[i]="";
//        }
//        formModel.stockCodes = arr;
//      }
//      console.dir(formModel);
//      res.render('form', formModel);
//    },
//    error: function (err) {
//      //处理调用失败
//      console.log('Error when finding the record: '+error.message);
//      //res.render('hello', {message: err.message});
//    }
//  });
//});

app.get('/form', function(req, res) {
  const NumberOfStockCodes = 10;
  const MaxInterval = 600;
  var formModel = {
    appName: req.query.appName,
    deviceID: req.query.deviceID,
    stockCodes: [],
    settingsData: "",
    shouldAutoRefresh: false,
    autoRefreshInterval: MaxInterval,
    shouldAutoWakeUp: false,
    shouldClose: false,
    returnTo: 'pebblejs://close#'
  };
  for(var i=0; i<NumberOfStockCodes; i++){
    if(req.query.stockCode && req.query.stockCode[i] && req.query.stockCode.length>i){
      formModel.stockCodes.push(req.query.stockCode[i]);
    }else if(req.query.stockCode && i==0){
      formModel.stockCodes.push(req.query.stockCode);
    }else{
      formModel.stockCodes.push('');
    }
  }
  if(req.query.shouldAutoRefresh!==undefined){
    formModel.shouldAutoRefresh = req.query.shouldAutoRefresh;
  }
  if(req.query.autoRefreshInterval!==undefined){
    formModel.autoRefreshInterval = req.query.autoRefreshInterval;
  }
  if(req.query.shouldAutoWakeUp!==undefined){
    formModel.shouldAutoWakeUp = req.query.shouldAutoWakeUp;
  }
  if(req.query.return_to){
    formModel.returnTo = req.query.return_to;
  }
  console.dir(formModel);
  res.render('form', formModel);
});

app.post('/form', function(req, res){
  console.log("app.post(/form) req.body="+util.inspect(req.body));
  var formModel = {
    appName: req.body.appName,
    deviceID: req.body.deviceID,
    stockCodes: req.body.stockCode,
    settingsData: {
      stockCodes: req.body.stockCode,
      shouldAutoRefresh: req.body.shouldAutoRefresh!==undefined,
      autoRefreshInterval: req.body.autoRefreshInterval,
      shouldAutoWakeUp: req.body.shouldAutoWakeUp!==undefined
    },
    shouldAutoRefresh: req.body.shouldAutoRefresh!==undefined,
    autoRefreshInterval: req.body.autoRefreshInterval,
    shouldAutoWakeUp: req.body.shouldAutoWakeUp!==undefined,
    shouldClose: false,
    returnTo: 'pebblejs://close#'
  };
  console.dir(formModel);
  console.log('query the recode for updating');
  var query = new AV.Query('Settings');
  query.equalTo('appName', formModel.appName);
  query.equalTo('deviceID', formModel.deviceID);
  query.find({
    success: function (results) {
      var record = null;
      if (results.length > 0) {//如果找到记录，则在原来基础上做更新操作。
        record = results[0];
        console.log('update the found record');
      }else{//如果没有找到记录，则做新建操作。
        record = new AV.Object("Settings");
        record.set("appName", formModel.appName);
        record.set("deviceID", formModel.deviceID);
        console.log('create a new record');
      }
      record.set("settingsData", formModel.settingsData);
      record.save().then(function() {
        formModel.shouldClose = true;
        if(req.body.returnTo)
          formModel.returnTo = req.body.returnTo;
        formModel.settingsData = encodeURIComponent(JSON.stringify(formModel.settingsData));
        console.log('record saved');
        console.dir(formModel);
        res.render('form', formModel);
      }, function(error) {
        // The file either could not be read, or could not be saved to AV.
        console.log('Error when saving the record: '+error.message);
        res.render('hello', {message: err.message});
      });
    },
    error: function (err) {
      //处理调用失败
      console.log('Error when finding the record: '+error.message);
      res.render('hello', {message: err.message});
    }
  });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();