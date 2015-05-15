require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("getSettings", function(request, response) {
  console.log('request.params');
  console.dir(request.params);
  var query = new AV.Query('Settings');
  query.equalTo('appName', request.params.app);
  query.equalTo('deviceID', request.params.device);
  query.find({
    success: function(results) {
      var result = {};
      if(results.length>0){
        result = results[i].get('settingsData');
      }
      response.success(result);
    },
    error: function() {
      response.error('Retrieving settings failed');
    }
  });
});

AV.Cloud.define("saveSettings", function(request, response) {
  console.log('request.params');
  console.dir(request.params);
  var settings = new AV.Object("Settings");
  settings.set("appName", request.params.app);
  settings.set("deviceID", request.params.device);
  settings.set("settingsData", request.params.settings);
  settings.save().then(function() {
    response.success(request.params.settings);
  }, function(error) {
    // The file either could not be read, or could not be saved to AV.
    console.log('Error in Cloud Function (saveSettings): '+error);
  });
});