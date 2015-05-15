// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.get('/form', function(req, res) {
  var formModel = {
    appName: req.query.appName,
    deviceID: req.query.deviceID,
    settingsData: req.query.settingsData,
    stockCode1: req.query.stockCode1,
    stockCode2: req.query.stockCode2
  }
  formModel.shouldClose = false;
  console.dir(formModel);
  if(formModel.stockCode1==undefined){
    console.log('query settings');
    var query = new AV.Query('Settings');
    query.equalTo('appName', formModel.appName);
    query.equalTo('deviceID', formModel.deviceID);
    query.find({
      success: function(results) {
        if(results.length>0){
          console.log(results.length+' records found');
          var settingsData = results[0].get('settingsData');
          if(settingsData!=undefined && settingsData.stockCodes!=undefined && settingsData.stockCodes.length>1){
            formModel.stockCode1 = settingsData.stockCodes[0].toLowerCase();
            formModel.stockCode2 = settingsData.stockCodes[1].toLowerCase();
          }else{
            formModel.stockCode1 = "";
            formModel.stockCode2 = "";
          }
          formModel.settingsData = {
            stockCodes:[formModel.stockCode1, formModel.stockCode2]
          };
        }else{
          console.log(results.length+' records found');
          formModel.stockCode1 = "";
          formModel.stockCode2 = "";
          formModel.settingsData = {
            stockCodes:[formModel.stockCode1, formModel.stockCode2]
          };
        }
        console.dir(formModel);
        res.render('form', formModel);
      },
      error: function(err) {
        //处理调用失败
        res.render('hello', {message: err.message});
      }
    });

    //console.log('call cloud function getSettings()');
    //AV.Cloud.run('getSettings', param, {
    //  success: function(data){
    //    //调用成功，得到成功的应答data
    //    console.log('getSettings success: '+data);
    //    param.settings = data;
    //    res.render('form', param);
    //  },
    //  error: function(err){
    //    //处理调用失败
    //    res.render('hello', {message: err.message});
    //  }
    //});
  }else{
    formModel.settingsData = {
      stockCodes:[req.query.stockCode1.toLowerCase(), req.query.stockCode2.toLowerCase()]
    };
    console.dir(formModel);
    console.log('query the recode for updating');
    var query = new AV.Query('Settings');
    query.equalTo('appName', formModel.appName);
    query.equalTo('deviceID', formModel.deviceID);
    query.find({
      success: function (results) {
        var record = null;
        if (results.length > 0) {
          record = results[0];
          console.log('update the found record');
        }else{
          record = new AV.Object("Settings");
          record.set("appName", formModel.appName);
          record.set("deviceID", formModel.deviceID);
          console.log('create a new record');
        }
        record.set("settingsData", formModel.settingsData);
        record.save().then(function() {
          formModel.shouldClose = true;
          formModel.settingsData = encodeURIComponent(JSON.stringify(formModel.settingsData));
          console.log('record saved');
          console.dir(formModel);
          res.render('form', formModel);
        }, function(error) {
          // The file either could not be read, or could not be saved to AV.
          console.log('Error when updating the record: '+error.message);
        });
      },
      error: function (err) {
        //处理调用失败
        res.render('hello', {message: err.message});
      }
    });
    //console.log('call cloud function saveSettings()');
    //AV.Cloud.run('saveSettings', param, {
    //  success: function(data){
    //    //调用成功，得到成功的应答data
    //    param.shouldClose = true;
    //    res.render('form', param);
    //  },
    //  error: function(err){
    //    //处理调用失败
    //    param.message = err.message;
    //    res.render('form', param);
    //  }
    //});
  }
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();