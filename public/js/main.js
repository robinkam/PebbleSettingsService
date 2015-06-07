/**
 * Created by neulion-qa on 15/6/7.
 */
$(document).ready(function () {
	var editingObject, isEditMode, editingPosition, stockArray, indexArray;
	stockArray = [];
	indexArray = [];

	$('#autoRefreshSwitch').prop('checked', true).flipswitch("refresh");
	$('.divSlider').show();
	$('#autoRefreshSwitch').change(function (e) {
		var isSwitchOn = $('#autoRefreshSwitch').prop('checked');
		if (isSwitchOn)
			$('.divSlider').show();
		else
			$('.divSlider').hide();
	});

	var EditingModel = function(){
		var object = {
			type:"",
			market:"",
			code:"",
			fullCode:""
		};
		return object;
	};
	var getEditingObjectByCode = function (code) {
		var regexStock = /(\w{2})(\d{6})/ig;
		var regexIndex = /s_(\w{2})(\d{6})/ig;
		if(code.match(regexIndex)){
			var object = new EditingModel();
			object.fullCode = code;
			object.type = "index";
			object.market = code.replace(regexIndex, '$1');
			object.code = code.replace(regexIndex, '$2');
			return object;
		}else if(code.match(regexStock)){
			var object = new EditingModel();
			object.fullCode = code;
			object.type = "stock";
			object.market = code.replace(regexStock, '$1');
			object.code = code.replace(regexStock, '$2');
			return object;
		}else{
			return null;
		}
	};
	var getFullCodeByEditingObject = function (editingType) {
		var indexPrefix = editingType=="index" ? "s_" : "";
		var market = $('input[name="radio-choice-market"]:checked').val();
		var code = $('#text-input').prop('value');
		var fullCode = indexPrefix + market + code;
		return fullCode;
	};
	var getListItem = function (type, text, index) {
		return '<li class="'+type+'"><a href="#">'+text+'<span class="ui-li-count">'+index+'</span></a></li>';
	};
	var openPanelToAddCode = function(type){
		isEditMode = false;
		editingObject = new EditingModel();
		editingObject.type = type;
		$('#defaultpanel').panel('open');
	};
	var openPanelToEditCode = function(code){
		isEditMode = true;
		editingObject = getEditingObjectByCode(code);
		$('#defaultpanel').panel('open');
	};
	$('#defaultpanel').on( "panelbeforeopen", function( event, ui ) {
		if(editingObject.market!=""){
			$('#radio-choice-sh').prop('checked', editingObject.market=="sh").checkboxradio( "refresh" );
			$('#radio-choice-sz').prop('checked', editingObject.market=="sz").checkboxradio( "refresh" );
			$('#text-input').prop('value', editingObject.code);
		}else{
			$('#text-input').prop('value', "");
		}
		if(isEditMode){
			$('#btnSave').prop('value', '保存').button('refresh');
			$('#btnDelete').button('enable');
		}else{
			$('#btnSave').prop('value', '添加').button('refresh');
			$('#btnDelete').button('disable');
		}
	} );
	$('#btnSave').click(function (e) {
		if(isEditMode){
			if(editingObject.type=="stock"){
				$('#myList li .stock').remove();
				for(var i=0; i<stockArray.length; i++){
					var code = stockArray[i];
					$('#list-divider-stock').append(getListItem('stock', code, i));
				}
			}else if(editingObject.type=="index"){
				$('#myList li .index').remove();
				for(var i=0; i<indexArray.length; i++){
					var code = indexArray[i];
					$('#list-divider-index').append(getListItem('index', code, i));
				}
			}
		}else{
			var code = getFullCodeByEditingObject(editingObject.type);
			if(editingObject.type=="stock"){
				$('#cellAddStock').before(getListItem('stock', code, stockArray.length));
				stockArray.push(code);
			}else if(editingObject.type=="index"){
				$('#cellAddIndex').before(getListItem('index', code, indexArray.length));
				indexArray.push(code);
			}
		}
		$('#myList').listview('refresh');
		$('#defaultpanel').panel('close');
	});
	$('#btnDelete').click(function (e) {
		$('#defaultpanel').panel('close');
	});
	$("#btnCancel").click(function (e) {
		$('#defaultpanel').panel('close');
	});
	$(document).on('click', 'li.stock>a', function (e) {
		var index =  $(this).find("span").text();
		var code = stockArray[index];
		openPanelToEditCode(code);
	});
	$(document).on('click', 'li.index>a', function (e) {
		var index = $(this).find("span").text();
		var code = indexArray[index];
		openPanelToEditCode(code);
	});
	$('#cellAddStock').click(function (e){
		openPanelToAddCode("stock");
	});
	$('#cellAddIndex').click(function (e){
		openPanelToAddCode("index");
	});

	var initUI = function () {
		stockArray = ['sh600000', 'sz100000'];
		indexArray = ['s_sh000001', 's_sz000001'];
		for(var i=0; i<stockArray.length; i++){
			var code = stockArray[i];
			$('#cellAddStock').before(getListItem('stock', code, i));
		}
		for(var i=0; i<indexArray.length; i++){
			var code = indexArray[i];
			$('#cellAddIndex').before(getListItem('index', code, i));
		}
		$('#myList').listview('refresh');
	};
	initUI();
});