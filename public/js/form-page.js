/**
 * Created by neulion-qa on 15/6/6.
 */

var EditingModel = function(){
	return {
		type: "stock",
		market: "sh",
		code: "",
		fullCode: ""
	};
};

var oGetVars = new (function (sSearch) {
	var rNull = /^\s*$/, rBool = /^(true|false)$/i;
	function buildValue(sValue) {
		if (rNull.test(sValue)) { return null; }
		if (rBool.test(sValue)) { return sValue.toLowerCase() === "true"; }
		if (isFinite(sValue)) { return parseFloat(sValue); }
		if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
		return sValue;
	}
	if (sSearch.length > 1) {
		for (var aItKey, nKeyId = 0, aCouples = sSearch.substr(1).split("&"); nKeyId < aCouples.length; nKeyId++) {
			aItKey = aCouples[nKeyId].split("=");
			var value = aItKey.length > 1 ? buildValue(unescape(aItKey[1])) : null;
			if(this[unescape(aItKey[0])]){
				if(Array.isArray(this[unescape(aItKey[0])])){
					this[unescape(aItKey[0])].push(value);
				}else{
					var array = [this[unescape(aItKey[0])], value];
					this[unescape(aItKey[0])] = array;
				}
			}else{
				this[unescape(aItKey[0])] = value;
			}
		}
	}
})(window.location.search);

var regexStock = /^(\w{2})(\d{6})$/i;
var regexIndex = /^s_(\w{2})(\d{6})$/i;

var formPage = angular.module('formPage', []);
formPage.controller('PageController', function ($scope) {
	$scope.appName = oGetVars.appName;
	$scope.deviceToken = oGetVars.deviceID;
	$scope.editingObject = new EditingModel();
	$scope.isEditMode = false;
	$scope.editingPosition = 0;
	//$scope.stockArray = ['sh600000', 'sz100000'];
	//$scope.indexArray = ['s_sh000001', 's_sz000001'];
	$scope.stockArray = [];
	$scope.indexArray = [];
	var codes = oGetVars.stockCode;
	for(var i=0; i<codes.length; i++){
		var code = codes[i];
		if(code.match(regexIndex)){
			$scope.indexArray.push(code);
		}else{
			$scope.stockArray.push(code);
		}
	}
	var getEditingObjectByCode = function (code) {
		var object = new EditingModel();
		if(code.match(regexIndex)){
			object.fullCode = code;
			object.type = "index";
			object.market = code.replace(regexIndex, '$1');
			object.code = code.replace(regexIndex, '$2');
			return object;
		}else if(code.match(regexStock)){
			object.fullCode = code;
			object.type = "stock";
			object.market = code.replace(regexStock, '$1');
			object.code = code.replace(regexStock, '$2');
			return object;
		}else{
			return null;
		}
	};
	var getFullCodeByEditingObject = function (object) {
		if(object==null){
			object = $scope.editingObject;
		}
		var indexPrefix = object.type=="index" ? "s_" : "";
		var fullCode = indexPrefix + object.market + object.code;
		return fullCode;
	};
	var isCodeValid = function (code) {
		var regex = /^\d{6}$/i;
		return code.match(regex);
	};

	var openPanel = function() {
		//$("input[name='radio-choice-market']").checkboxradio('refresh');
		if($scope.isEditMode){
			$('#btnSave').prop('value', '保存').button('refresh');
			$('#btnDelete').button('enable');
		}else{
			$('#btnSave').prop('value', '添加').button('refresh');
			$('#btnDelete').button('disable');
		}
		$('#radio-choice-sh').prop('checked', $scope.editingObject.market=="sh").checkboxradio( "refresh" );
		$('#radio-choice-sz').prop('checked', $scope.editingObject.market=="sz").checkboxradio( "refresh" );
		$('#defaultpanel').panel('open');
	};

	$scope.openPanelToAdd = function (type) {
		$scope.isEditMode = false;
		$scope.editingObject = new EditingModel();
		$scope.editingObject.type = type;
		openPanel();
	};

	$scope.openPanelToEdit = function (code) {
		$scope.isEditMode = true;
		$scope.editingObject = getEditingObjectByCode(code);
		if($scope.editingObject.type=='stock') {
			$scope.editingPosition = $scope.stockArray.indexOf(code);
		}else if($scope.editingObject.type=='index') {
			$scope.editingPosition = $scope.indexArray.indexOf(code);
		}else {
			alert('Position is undetermined.');
		}
		openPanel();
	};
	
	$scope.saveCode = function () {
		if(isCodeValid($scope.editingObject.code)){
			var targetArray = $scope.editingObject.type=='stock' ? $scope.stockArray : $scope.indexArray;
			var fullCode = getFullCodeByEditingObject();
			if(targetArray.indexOf(fullCode)>=0){
				alert('该代码已经存在，请不要重复添加。');
				return;
			}
			if($scope.isEditMode){
				targetArray[$scope.editingPosition] = fullCode;
			}else{
				targetArray.push(fullCode);
			}
			$('#defaultpanel').panel('close');
		}else{
			alert('代码格式错误，应该为6位数字。');
		}
	};

	$scope.deleteCode = function () {
		if ($scope.editingObject.type == "stock") {
			$scope.stockArray.splice($scope.editingPosition, 1);
		} else {
			$scope.indexArray.splice($scope.editingPosition, 1);
		}
		$('#defaultpanel').panel('close');
	};
	
	$scope.closePanel = function () {
		$('#defaultpanel').panel('close');
	};
});