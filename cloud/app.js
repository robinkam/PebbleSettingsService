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
  var appName = req.query.app;
  var deviceID = req.query.device;
  var settingsData = req.query.settings;
  var param = req.query;
  param.shouldClose = false;
  console.dir(param);
  if(settingsData==null){
    AV.Cloud.run('getSettings', param, {
      success: function(data){
        //调用成功，得到成功的应答data
        param.settings = data;
        res.render('form', param);
      },
      error: function(err){
        //处理调用失败
        res.render('hello', {message: err.message})
      }
    });
  }else{
    AV.Cloud.run('saveSettings', param, {
      success: function(data){
        //调用成功，得到成功的应答data
        param.shouldClose = true;
        res.render('form', param);
      },
      error: function(err){
        //处理调用失败
        param.message = '发生错误：'+err;
        res.render('form', param)
      }
    });
  }
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();