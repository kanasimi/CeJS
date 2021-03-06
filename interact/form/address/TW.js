
/**
 * @name	CeL address input function
 * @fileoverview
 * 本檔案包含了臺灣縣市鄉鎮郵遞區號 地址/住址 & 3+2碼郵遞區號輸入表單(下拉選單)的 functions。
 * @since	
 */


/*
改成僅用單一格子
http://blog.darkthread.net/blogs/darkthreadtw/archive/2010/06/01/taiwan-addr-helper.aspx
輸入*,?
*/

//'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name:'interact.form.address.TW',
require : 'interact.form.select_input.|data.CSV.parse_CSV',
code : function(library_namespace) {

var module_name = this.id,
// requiring
parse_CSV = this.r('parse_CSV'),
// .use 不會 extend module，因此得自己設定。
select_input = library_namespace.interact.form.select_input;





/**
 * 簡易型 net.web.XML_node @ interact.form.select_input
 * @param tag	p.appendChild tag
 * @param p	parent node
 * @param t	text
 * @param classN	className
 * @inner
 * @ignore
 * @return
 */
var create_DO = function(tag, p, t, classN) {
	var _e;
	if (t && (typeof t != 'object' || library_namespace.is_Object(t)))
		t = document.createTextNode('' + t);

	if (typeof tag === 'object') {
		_e = tag;
	} else if (tag) {
		_e = document.createElement(tag);
		if (classN)
			_e.className = classN;
		if (t)
			_e.appendChild(t);
	} else if (t)
		_e = t;
	if (p && _e)
		p.appendChild(_e);
	return _e;
};


//ClassT={Account_input:{},Address_input:{}},	//	class template set


//	===================================================
/*
	used for address input form
	住址輸入

TODO:
parse address


HISTORY:
2008/7/24 20:38:18	create
*/

/**
 * CeL.address.TW
 * @class	form 的 functions
 */

function Address_input_TW(){

var

//	class private	-----------------------------------

/*	存放 data 的 path
path/:
zip/	ZIP code data, postal code

*/
path=library_namespace.get_module_path(module_name,''),// './',

/*

ZIP[city: 縣市][district: 鄉鎮市區]=ZIP code, postal code

ZIP5[Number(zip3)]={ "zip5,路街":"路街,no_range",.. }

ZIP_to_cd[String(zip3)]=[city,district];

town/area/road/scoop
ZIP5_to_town[String(zip5)]=[路街,no_range]

c_d[city]=[district list]

ENG[city][district]=english


cityL, districtL: list for select_input
cityL[_city_name_]='_city_name_ (districts number)'
districtL[_district_name_]={city_name_:1}

*/
ZIP={},ZIP5=[],ZIP_to_cd={},ZIP5_to_town={},ENG={},c_d={},cityL={},districtL={},

getZIP5=function(z3,force){
 var d,i=0,a,Z;
 z3=Math.floor(z3);
 if(!(z3 in ZIP5)||!ZIP5[z3])
  Z=ZIP5[z3]={};
 else if(Z=ZIP5[z3],!force)return Z;

 try{
  d=library_namespace.get_file(path+'zip'+(z3>99?'':z3>9?'0':'00')+z3+'.csv');
 }catch(e){
  library_namespace.warn('getZIP5: Cannot get ZIP5 data of ['+(z3>99?'':z3>9?'0':'00')+z3+']! ' + e.message);
  return;
 }

 if(d&&(d=parse_CSV(d)))for(;i<d.length;i++)
  if((a=d[i])&&a.length)Z[a[0]+','+a[3]]=ZIP5_to_town[a[0]]=!a[4]||a[4]=='全'?a[3]:a[3]+','+a[4].replace(/^[　\s]+/,'');//去除前空白
 //else sl('Cannot parse ZIP5 data of ['+(z3>99?'':z3>9?'0':'00')+z3+']!');

 //sl('getZIP5: ['+(z3>99?'':z3>9?'0':'00')+z3+'] '+d.length+' records.');

 return Z;
},


addFunc=function(t,f){
 var _t=this,_p=pv(_t);
 create_DO(0,_p.container,' [');
 (create_DO('span',_p.container,t,_.classNameSet.clearMark))
	//	TODO: do not use arguments
	.onclick=arguments.callee.caller===initI?function(){f.apply(_t);}:f;//function(){f(_p.zipI,_p.cityI,_p.districtI,_p.addressI);};
 create_DO(0,_p.container,']');
},


//	instance constructor	---------------------------
instanceL=[],
initI=function(o,prefix){
 if(typeof o!='object')o=document.getElementById(o);
 if(!o){
  //throw new Error('Cannot get outter document object!');
  return;
 }

 if(!prefix)prefix='adr_';

 var _t=this,_p=pv(_t),a;
 instanceL.push(_t);	//	for destructor
 _p.container=o;	//	容器

 //	initial instance object
 _t.nameSet={
  zip:'zip',
  city:'city',
  district:'district',
  address:'address'
 };

 //	layout setup
 _p.fullAdr=create_DO('input',o);	//	最後送出時用
 try{_p.fullAdr['type']='hidden';}catch(e){}	//	低版本 JScript: error
 _p.fullAdr.style.display='none';

 var zipOTrg,zipT=create_DO('span',o,'郵');	//	TODO: <label>
 zipT.style.fontSize = '.7em';
 // green
 zipT.style.color = '#0a0';
 zipT.title = '郵遞區號：';
 a=_p.zipI=new select_input(o,ZIP_to_cd);
 a.setClassName(_.classNameSet.zipI);
 a.setTitle('郵遞區號');

 _p.zipI.dInputted=function(){
  return '['+this.setValue()+']';
 };

 zipOTrg=_p.zipI.toggleToInput;
 _p.zipI.toggleToInput=function(y){
  if(y=y||typeof y=='undefined'){
   zipT.style.display='inline';
   zipOTrg.call(_p.zipI,y);
  }else{
   zipT.style.display='none';
   zipOTrg.call(_p.zipI,y);
  }
 };

 create_DO(0,o,' ');//地址:
 (_p.cityI=new select_input(o,cityL)).setTitle('縣市');
 (_p.districtI=new select_input(o,districtL)).setTitle('鄉鎮市區');
 a=_p.addressI=new select_input(o);
 a.autoShowArrow=1;
 a.setClassName(_.classNameSet.addressI);

/*
 addFunc.call(_t,'全關閉',function(){
 	var _p=pv(this);
	//sl('全關閉: clear all value.');
	_p.zipI.showList(0);
	_p.cityI.showList(0);
	_p.districtI.showList(0);
	_p.addressI.showList(0);
 });
*/
 addFunc.call(_t,'全清除',function(){
 	var _p=pv(this);
	//sl('全清除: clear all value.');
	_p.zipI.setValue(''),		_p.zipI.showList(0),		_p.zipI.toggleToInput();
	_p.cityI.setValue(''),		_p.cityI.showList(0),		_p.cityI.toggleToInput();
	_p.districtI.setValue(''),	_p.districtI.showList(0),	_p.districtI.toggleToInput();
	_p.addressI.setValue(''),	_p.addressI.showList(0),	_p.addressI.toggleToInput();
	_p.addressI.setAllList(null);
 });

 //	功能設定
 var	zipF=_p.zipI.setSearch('startWith'),
	cityF=_p.cityI.setSearch('includeKey'),
	districtF=_p.districtI.setSearch('includeKey')
	;

 a=_p.zipI;
 a.maxList=20,
 a.setMaxLength(5),
 a.onInput=function(k){
  zipF.apply(_p.zipI,arguments);
  _p.addressI.showList(0);
  if(k in ZIP_to_cd){
   var a=ZIP_to_cd[k];
   if(a[0])_p.cityI.setValue(a[0]),_p.cityI.showList(0);
   if(a[1])_p.districtI.setValue(a[1]),_p.districtI.showList(0);
  }else if((k in ZIP5_to_town)&&!_p.addressI.setValue())
   _p.addressI.setValue(ZIP5_to_town[k]),_p.addressI.showList(0);
 };
 a.verify=function(k){
  if(!k&&k!==0)return 1;
  var z;
  if(!library_namespace.is_digits(k))return 2;
  //sl('zipI.verify: '+(_t.useZIP5?'Use':'Do not use')+' zip5.');
  if(k.length>=3)
   if(getZIP5(z=k.slice(0,3)), !(z in ZIP_to_cd) || _t.useZIP5&&getZIP5(z)&&(k.length==5&&!(k in ZIP5_to_town)))
    return 1;
 };

 a=_p.cityI;
 a.maxList=0,	//	unlimited
 a.setMaxLength(8),
 a.onInput=function(k){
  cityF.apply(_p.cityI,arguments);
  _p.addressI.showList(0);
  var c=districtL[_p.districtI.setValue()];
  if(!c||!(k in c)){
   //	選了不同的 city
   _p.zipI.setValue('');
   _p.districtI.setValue('');
   _p.addressI.setAllList([]);
   _p.zipI.showList(0),_p.districtI.showList(0);
  }
  if(!isNaN(ZIP[k]))_p.zipI.setValue(ZIP[k]);
  _p.districtI.setAllList(k in c_d?c_d[k]:districtL);
 };
 a.verify=function(k){
  if(!k || k&&!(k in ZIP))return 1;
 };

 a=_p.districtI;
 a.maxList=20,
 a.setMaxLength(20),
 a.onList=function(l,i){
  if(Array.isArray(l))
   return [l[i],l[i]];
  for(var d in l[i])break;
  return [i,d];
 };
 a.onInput=function(k){
  districtF.apply(_p.districtI,arguments);
  _p.addressI.showList(0);
  var c=districtL[k],i=_p.cityI.setValue();
  if(c && !(i in c)){
   for(var i in c){c=i;break;}
   _p.cityI.showList(0);
   _p.cityI.setValue(c);
  }else c=i;
  if(c in ZIP){
   _p.cityI.showList(0);
   var z=ZIP[c];
   if(typeof z=='object')
    z=_p.districtI.setValue() in z?ZIP[c][_p.districtI.setValue()]:0;
   if(z)_p.zipI.setValue(z),_p.zipI.showList(0);

   //sl('ZIP['+c+']['+_p.districtI.setValue()+']=['+z+']');
   //if(!z){var i;z=ZIP[c];for(var i in z)sl('* ['+i+']='+z[i]);}
  }
 };
 a.verify=function(k){
  var c=_p.cityI.setValue();
  if(!k || k&& ((c in ZIP)&&typeof ZIP[c]=='object'&&!(k in ZIP[c])) || !c_d[c])return 1;
 };

 a=_p.addressI;
 a.maxList=40,
 a.onList=function(l,i){
  return [l[i]||i,Array.isArray(l)?l[i]:i,_p.addressI.setValue()];
 };
 a.onSelect=function(l,i){
  var c=i.indexOf(',');
  _p.zipI.setValue(i.slice(0,c));
  _p.zipI.toggleToInput(0);
  return i.slice(c+1);
 };
 a.setSearch('includeKey');
 a.setProperty('onfocus', function() {
		var c = _p.cityI.setValue(), d = _p.districtI.setValue();
		if (c && (c in ZIP) && typeof ZIP[c] === 'object' && (d in ZIP[c])) {
			_p.zipI.toggleToInput(0);
			_p.cityI.toggleToInput(0);
			_p.districtI.toggleToInput(0);
			// sl('addressI.onfocus: '+(_t.useZIP5?'Use':'Do not use')+' zip5.');
			if (_p.addressI.doFunc)
				_p.addressI.doFunc = 0;
			else if (_t.useZIP5)
				_p.addressI.setAllList(getZIP5(ZIP[c][d])), _p.addressI.onInput();
		}
	});
 a.verify = function(k) {
		if (!k || k.length < 5)
			return 1;
	};

 _t.setNamePrefix(prefix);

 _t.loaded=1;

},_=function(){initI.apply(this,arguments);},


//	(instance private handle)	不要 instance private 的把這函數刪掉即可。
_p='_'+(Math.random()+'').replace(/\./,''),
//	get private variables (instance[,destroy]), init private variables (instance[,access function list[, instance destructor]])
//	TODO: do not use arguments
pv=function(i,d,k){var V,K=_p('k');return arguments.callee.caller===_p('i')?(V=_p(i[K]=_p()),V.O=i,V.L={}):(K in i)&&(V=_p(i[K]))&&i===V.O?d?(_p(i[K],1),delete i[K]):V.L:{};};

//	class destructor	---------------------------
/*
please call at last (e.g., window.unload)

usage:
classT=classT.destroy();
or if you has something more to do:
classT.destroy()&&classT=null;
*/

_.destroy=function(){for(var i=0;i<instanceL.length;i++)instanceL[i].destroy();_p();};

//	(instance private handle, continue)
eval('_p=(function(){var '+_p+'={a:pv,d:_.destroy,c:0,k:"+pv+'+Math.random()+'",i:initI};return function(i,d){var f=arguments.callee.caller;if(f==='+_p+'.a){if(!d)return i in '+_p+'?'+_p+'[i]:('+_p+'[i='+_p+'.c++]={},i);'+_p+'[i]={};}if(f==='+_p+'.d)'+_p+'={};}})();');
_p.toString=function(){return'';};


//	class public interface	---------------------------


//	預設 className
_.classNameSet={
 clearMark:'adr_clear',
 zipI:'adr_zip',
 addressI:'adr_address'
};


//	初始設定並讀取郵局提供之 CSV file。
//	這應該在所有 new 之前先作！
_.readData=function(url){
 if(!url)return;
 path=url.match(/^(.+\/)?([^\/]+)$/)[1];

 var data,i=0,a,b;
 try{
  a=library_namespace.get_file(url);
 }catch(e){
  library_namespace.warn(['interact.form.address.readData: Cannot load data: [',url,']! ',
                          {em:['本 module [', module_name, '] 須以 Ajax 載入資料！']}, e.message]);
  return;
 }
 //library_namespace.log('readData: Get data from ['+url+']:<br />['+a.length+'] '+a.slice(0,200)+'..');
 if(!a||!(data=parse_CSV(a))||data.length<9||data[0].length<3){
  //sl('readData: Cannot read data from ['+url+']!');
  return;
 }

 //	reset
 ZIP={},ZIP5=[],ZIP_to_cd={},ZIP5_to_town={},ENG={},c_d={},cityL={},districtL={};

 //sl('readData: Get '+data.length+' data from ['+url+']:<br />['+data[0]+']<br />['+data[1]+']<br />['+data[2]+']');
 for(;i<data.length;i++){
  a=data[i][1].match(/^([^縣市島]{1,3}[縣市島])(.{2,5})$/);
  if(!a){
   //sl('Cannot parse: ['+data[i][1]+']');//continue;
   cityL[a=data[i][1]]='';
   //districtL[a]='';
   ZIP_to_cd[ZIP[a]=data[i][0]]=[a],ENG[a]=data[i][2];
  }else{
   b=a[2],a=a[1];
   if(!(b in districtL))districtL[b]={};
   districtL[b][a]=1;	//	districtL[_district_name_]={_city_name_:1}
/*
   if(b in districtL)
    sl('readData: duplicate district: '+a+','+b),
    districtL[b+','+a]=[b,a];
   else
    //sl('readData: set district: '+a+','+b),
    districtL[b]=[b,a];
*/
   if(a in c_d)c_d[a].push(b);else c_d[a]=[b];

   if(!(a in ZIP))ZIP[a]={},ENG[a]={};
   ZIP_to_cd[ZIP[a][b]=data[i][0]]=[a,b],ENG[a][b]=data[i][2];

   //sl('ZIP['+a+']['+b+']=['+data[i][0]+']');
  }
 }

 a=cityL,cityL={};
 for(i in c_d)c_d[i].sort(),cityL[i]=i+' ('+c_d[i].length+')';	//	cityL[_city_name_]='_city_name_ (districts number)'
 for(i in a)cityL[i]=a[i];	//	將不常用（沒district）的放後面
};

//	class constructor	---------------------------

/*	預先讀取同目錄下的 county.txt
這些檔案由臺灣郵政全球資訊網下載專區取得。

*/
_.readData(path+'zip/county.txt');


_.prototype={
//	應該盡量把東西放在 class，instance少一點…？

//	instance public interface	-------------------

//	使用 ZIP5
useZIP5:1,

//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！
//nameSet:{},

setNamePrefix:function(p){
 var _t=this,_p=pv(_t);
 if(typeof p!='undefined'){
  _p.fullAdr.name=_p.namePrefix=p;
  _p.zipI.setName(p+_t.nameSet.zip);
  _p.cityI.setName(p+_t.nameSet.city);
  _p.districtI.setName(p+_t.nameSet.district);
  _p.addressI.setName(p+_t.nameSet.address);
 }
 return _p.namePrefix;
},

// set/get
// TODO: 配合 parser
setAddress:function(adr){
 var _p=pv(this),r;
 if(typeof adr==='object')
  _p.zipI.setValue(adr.zip),_p.cityI.setValue(adr.city),_p.districtI.setValue(adr.district),_p.addressI.setValue(adr.address);

 r={zip:_p.zipI.setValue(),city:_p.cityI.setValue(),district:_p.districtI.setValue(),address:_p.addressI.setValue()};
 r.fullAddress=(r.zip?'['+r.zip+'] ':'')+r.city+r.district+r.address;//'臺灣'+
 return r;
},


//	use instance.submit() to check
submit : function(n) {
	var _t = this, _p = pv(_t);
	if (!_t.loaded)
		return true;

	if (typeof n != 'undefined') {
		_p.zipI.setName('');
		_p.cityI.setName('');
		_p.districtI.setName('');
		_p.addressI.setName('');
		if (n)
			_p.fullAdr.name = n;
	}

	_p.fullAdr.value = _t.setAddress().fullAddress;

	return !_p.zipI.verify(_p.zipI.setValue())
			&& !_p.cityI.verify(_p.cityI.setValue())
			&& !_p.districtI.verify(_p.districtI.setValue())
			&& !_p.addressI.verify(_p.addressI.setValue());
},


//	增加功能 button
addFunc:function(t,f){	//	(text, function)
 addFunc.apply(this,arguments);
},


//	(focus on what <input>, focus or blur)
focus : function(i, f) {
	var j, _p = pv(this), alias = {
		a : 'addressI',
		z : 'zipI',
		d : 'districtI',
		c : 'cityI'
	};

	if (i in alias)
		i = alias[i];
	else if (i + 'I' in _p)
		i += 'I';
	if (i in _p)
		_p[i].focus(f);
	else if (!i)
		// to all
		for (j in alias)
			_p[alias[j]].focus(f);
},


//	instance destructor	---------------------------
/*
usage:
instance=instance.destroy();
or if you has something more to do:
instance.destroy()&&instance=null;
*/
destroy:function(){
 var _t=this,_p=pv(_t);
 _p.zipI.destroy();
 _p.cityI.destroy();
 _p.districtI.destroy();
 _p.addressI.destroy();
 pv(_t,1);
}
};	//	_.prototype=

return _;
}

//	===================================================



return Address_input_TW.call(this);

},
//	this is a sub module.
no_extend : '*,this'


});

