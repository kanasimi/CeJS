
/**
 * @name	CeL map function
 * @fileoverview
 * 本檔案包含了 map 的 functions。
 * @since	
 */


'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name:'interact.integrate.map',
code : function(library_namespace) {




/**
 * null module constructor
 * @class	map 的 functions
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};








//	init function

var SL=new Debug.log,sl=function(){SL.log.apply(SL,arguments);},error=function(){SL.error.apply(SL,arguments);},warn=function(){SL.warn.apply(SL,arguments);};

var gMap,mapO,mData,lostItem,gLocal,dLoc={tw:[23.7,121]};	//	台灣: 23.7,121


addLoad(function(){
 var b=SL.setBoard('log');
 if(window.location.protocol=='file:'&&b)b.style.display='block';	//	強制顯示 log

 if(init&&init.run)sl('Page loaded. Prepare to initial..');

 if(typeof GLatLng=='undefined'){sl('GMap does not loaded.');return;}

 for(var i in dLoc)
  dLoc[i]=new GLatLng(dLoc[i][0],dLoc[i][1]);

 setTimeout('init(0);',0);
});

init.run=1;
function init(i){
 if(!arguments.callee.run)return;

 var m=0,n;
 switch(i){
  case m++:
   setSize();
   if(typeof preLoadMap=='function')preLoadMap();
   break;
  case m++:
   catchFile.sn='map-files';
   catchFile.f=function(url,success,captureId){
	sl('Capture '+(success?'succeeded':'failed')+': <a href="'+url+'">'+url+'</a>');
   };
   catchFile([
	'map.js',
	'map.css'
   ]);
   break;
  case m++:
   initMap();
   initSearch();
   if(window.location.protocol=='file:')setTimeout('mapO.removeTM();',3000);	//	3000: 適当。隨 client 而有不同。
   break;
  case m++:
   readLoc();
   break;
  case m++:
   loadMapData();
   break;
  case m++:
   placeMapItem();
   break;
  case m++:
   if(typeof additionalFunc=='function')additionalFunc();
   break;
 }
 m=['Starting initial process. Catch files..','Catch done. Initial all components..','Map loaded. Loading address records..','address loaded. Loading map data..','map data loaded. placing map items..','placing done. Do additional works..','Initial done.'];
 sl('init: '+m[i]);
 if(arguments.callee.run && ++i<m.length)
  setTimeout('init('+i+');',1);
}

function setOverviewMap(i){
 var m=mapO.overviewMap,n;
 if(m && (n=m.getOverviewMap())){
  //	因為有時來不及反應，所以放這邊。
  if(!i)n.addControl(new GMenuMapTypeControl(1)),i=1,setTimeout('setOverviewMap(1);',500);
  else m.hide();
 }else /*m.show(),*/setTimeout('setOverviewMap();',500);
}


function initSearch(){
 if(typeof google!='undefined' && google.load)google.load("search","1",{callback:function(){
  gLocal=new getSearch(function(r){
   google.search.LocalSearch.resizeStaticMapUrl(r,100,140);
   mapO.setLatLng(r.address||r.titleNoFormatting,r.lat,r.lng);
   sA(r.address,r.titleNoFormatting,r.phone.join('<br />')+'<br />'+r.address);
   //	http://code.google.com/apis/ajaxsearch/documentation/reference.html#_class_GlocalResult
   var h='<div style="background-color:#fef;margin-left:3em;margin-right:3em;padding-top:.5em;padding-bottom:.5em;font-size:.8em;clear:both;margin-bottom:40px;"><b onclick="sA(\''+UnicodeToHTML(r.address,2)+'\',\''+UnicodeToHTML(r.titleNoFormatting,2)+'\',\''+UnicodeToHTML(r.phone.join('<br />')+'<br />'+r.address,2)+'\');" title="'+r.titleNoFormatting+'" style="color:#94e;cursor:pointer;"><img style="margin-top:-.5em;float:left;margin-right:1em;" src="'+r.staticMapUrl+'" />'+r.title
	+'</b><br />'+r.address+'<br />'+r.phone.join('<br />')+(r.phone.length?'<br />':'')/*+r.listingType+'<br />'*/+r.content+'<br />('+r.lat+','+r.lng+') <a href="'+r.url+'" target="_blank">Use Google Maps</a></div>';
   if(sA2.c)sA2.c.innerHTML+=h;else sl(h);
  },'Local');
  sl('initSearch: local search initialed.');
 }});
 else sl('initSearch: Cannot initial local search. Please load API.');
}


var _map_tmp_message;
initMap.flag={backgroundColor:'#DDE'};
function initMap(){
 var a,m,i,_f=arguments.callee;
 mapO=new gMap('map_canvas',dLoc.tw,_f.flag);
 //if(!mapO)return 1;

 //mapO.geocoder.setBaseCountryCode('TW');
 sl('initMap: set geocoder country code: '+mapO.geocoder.getBaseCountryCode());

 //	要先 show 才能得到 getOverviewMap()
 if(m=mapO.overviewMap)
  //	IE7 上 .hide() 時 .show() 會出錯
  //	2008/9/6 22:37:33	IE6 也會出錯了
  if(navigator.userAgent.indexOf('MSIE')==-1)
   m.show(),setOverviewMap();

 //	small mark template	http://econym.googlepages.com/custom.htm	http://mapki.com/wiki/Available_Images	http://econym.googlepages.com/geicons.htm	http://code.google.com/apis/maps/documentation/overlays.html#Icons_overview
 //	iconSize 的處理還是有問題。
 mapO.icon(_f.iconOption||{
	shadow:'http://labs.google.com/ridefinder/images/mm_20_shadow.png',
	iconSize:new GSize(12,20),
	shadowSize:new GSize(22,20),
	iconAnchor:new GPoint(6,20),
	infoWindowAnchor:new GPoint(5,1)
 },1);
 mapO.icon(_f.iconArray||[
	{image:'http://labs.google.com/ridefinder/images/mm_20_green.png'},//http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png//{shadow:'http://maps.google.com/mapfiles/kml/pal5/icon14s.png',image:'http://maps.google.com/mapfiles/kml/pal5/icon14.png'},//
	{image:'http://labs.google.com/ridefinder/images/mm_20_yellow.png'},
	{image:'http://labs.google.com/ridefinder/images/mm_20_green.png'},//{icon:G_DEFAULT_ICON},
	{image:'http://labs.google.com/ridefinder/images/mm_20_orange.png'},//'http://maps.google.com/mapfiles/arrow.png',
	''
 ]);
 mapO.runAfterAdd=function(o){getO.add(o.address,o.name);showML.sel(o);showML();};
 mapO.runOnClick=function(o){showML.sel(o);showML();};
 mapO.runAfterRemove=function(o){if(showML.sel()==o)showML.sel(null,1);showML();};
 mapO.notFound=function(a,d){sl('<em>沒找到 ['+a+'] '+d.name+'</em>');return false;};
 //	在 unload 的時候呼叫 GUnload 以避免瀏覽器 memory leak。
 addListener(0,'unload',function(){try{GUnload();}catch(e){}});

 a=function(htm,t,js,ico){
  return '<div class="cm_line" title="'+t+'" onclick="'+js+'" onmouseover="this.className=\'cm_line_mo\';" onmouseout="this.className=\'cm_line\';"><img style="height:1em;width:1em;" src="'+(ico||'http://www.google.com/mapfiles/markerTransparent.png')+'" /> '+htm+'</div>';
 };
 if(m=mapO.map)
  //	use google's message
  i=function(i){try{
	eval('_map_tmp_message=p('+i+');',m);
	var a=_map_tmp_message;
	//sl('setContextMenu '+i+': '+a);
	return a&&a.length<8?a:'';
  }catch(e){}},
  mapO.setContextMenu([
	a(i(10985)||'Zoom in','將地圖於此放大','mapO.showContextMenu(0),mapO.map.zoomIn(mapO.clickLatLng,true);','http://www.google.com/mapfiles/zoom-plus.png')
	,a(i(10986)||'Zoom out','將地圖於此縮小','mapO.showContextMenu(0),mapO.map.zoomOut(mapO.clickLatLng,true);','http://www.google.com/mapfiles/zoom-minus.png')
	,a(/*i(11047)||*/'Set Center','將地圖於此置中','mapO.showContextMenu(0),mapO.setCenter(mapO.clickLatLng);','http://www.google.com/mapfiles/center.png')
	,'<hr />'
	,a('Search near','搜尋附近','mapO.showContextMenu(0),showNeighbor(mapO.clickLatLng);','http://maps.google.com/mapfiles/kml/pal2/icon13.png')
  ].join('')),
  GEvent.addListener(m,"click",function(){
   mapO.showContextMenu(0);
  }),GEvent.addListener(m,"dragstart",function(){
   mapO.showContextMenu(0);
  });
}


function readLoc(){
 if(loadMapData.dataF)catchFile([loadMapData.dataF,mapO.locFP=loadMapData.dataF+'.adr.csv']);
 mapO.readLoc();
}


//loadMapData.baseD='';
//	預設可使用之模板
loadMapData.getHTM=function(d,type){
 var l=mData[d.name||d.address],a=[mapO.getPoint(d,type)],r=[];
 if(d.address||'')a.unshift(d.address);
 l=l?l.link:'';
 if(!loadMapData.baseD)loadMapData.baseD='';
 if(d.name)		//	不能用 this.baseD
  r.push('<em>'+(l?'<a href="'+loadMapData.baseD+l+'" target="_blank">'+d.name+'</a>':d.name)+'</em>');
 if(d.dscr)r.push(d.dscr);
 r.push('<div class="adr">'+a.join('<br />')+'</div>');
 if(typeof d.getLength=='function')r.push('length: '+(d.getLength()/1000).toFixed(3)+'km');
 if(typeof d.getArea=='function')r.push('面積: '+d.getArea().toFixed(3)+'m&sup2;');
 //if(showNeighbor.pointer&&d.getLatLng)r.push('距離 '+showNeighbor.pointer.distanceFrom(d.getLatLng()));
 //r.push(,'<hr class="sp" /><span onclick="">search near</span>');
 return r.join('<br />').replace(/(<\/(div|p)>)\s*<br\/?>/g,'$1');
};
loadMapData.lessItems=3;
loadMapData.forEach=function(mapData,index){};
/*
loadMapData.zIndexP=function(){
 sl('click '+this.name);
 return -1;
};
*/
function loadMapData(){
 /*	load: 這裡假設 data 中標題可作為id（獨一無二）
	map data: [標題	敘述(description)	link	_data_]
	_data_: search string/kind	additional description/data of different kind of data
		search string/additional description (用括弧框起來的)
		'marker'	lat	lng
		'polyline'	points	levels
		'polygon'	points	levels

	mData[標題||address]={};
 */
 mData={};
 var i=0,m,t,_f=arguments.callee;
 _f.run=1;

 try{t=getU(_f.dataF);}catch(e){sl('Get data file ['+_f.dataF+'] error: '+e.message);}
 if(t)t=parseCSV(t);//t.replace(/\r+/g,'').replace(/\n+$/,'').replace(/^\n+/,'').split('\n');
 else t=[],showML.write('No list got of ['+_f.dataF+'].');

 showML.write('總共 '+t.length+' 筆資料正處理中，請稍候…');
 sl('loadMapData: Found '+t.length+' lines. Parsing.. (<em onclick="if(loadMapData.run)loadMapData.run=0,sl(\'User stopped.\');" style="cursor:pointer;">stop</em>)');
 for(;i<t.length&&_f.run;i++){
  //sl(t[i][7]);
  //if(t[i] && (m=t[i].replace(/\\n/g,'<br />').split('\t')).length>_f.lessItems)
  if(t[i].length>_f.lessItems)
   _f.forEach(t[i],i);
 }
 _f.run=0;
}


placeMapItem.done=function(i){
 //sl('placing done.');
 showML.refresh=1,showML();
 //	workaround 權宜之計: iconSize 的處理還是有問題。
 setTimeout('if(mapO)mapO.iconA[2].image=G_DEFAULT_ICON.image;',500);
};
placeMapItem.step=function(i){
 var _t=this;
 if(_t.run&&i<_t.stepA.length&&(!_t.loadMax||i<_t.loadMax))
  mapO.add(mData[_t.stepA[i++]]),setTimeout('placeMapItem.step('+i+');',0/*i>40?400:i+i*i/4*/);
 else if(_t.done)_t.done(i);
};
placeMapItem.loadMax=80;
function placeMapItem(){
 var _f=arguments.callee,i;
 if(_f.noPlace){	//	一開始不列出點
  if(typeof _f.noPlace=='function')_f.noPlace();
  return;
 }

 lostItem={};
 _f.run=1;
 //showML();
 showML.refresh=0;
 if(_f.step){
  _f.stepA=[];
  for(i in mData)
   lostItem[i]=mData[i],_f.stepA.push(i);//,mapO.add(mData[i]);
  setTimeout('placeMapItem.step(0);',0);
 }else{
  for(i in mData)mapO.add(mData[i]);
  if(_f.done)_f.done();
 }
}



//	interface

//	2008/9/6 15:7:34
//setSize.size=[880,320,240];	//	width, height, menuWidth
setSize.size='95%,70%,25%'.split(',');	//	width, height, menuWidth
setSize.setContainer=function(){
 try{
  this.menuC=(this.menu=document.getElementById('markerList')).parentNode;	//	menuC: menu container
  return this.container=document.getElementById('map_canvas').parentNode;
 }catch(e){}
};
function setSize(){
 var _f=arguments.callee,s=_f.size,_s=s.join('\0').split('\0'),m,a=function(i,k){
	if(!isNaN(s[i]))s[i]+='px';
	if(typeof _s[i]=='string'&&(m=_s[i].match(/^(\d+)%$/)))
	 k=k?'Height':'Width',
	 _s[i]=Math.floor((window.innerHeight?window['inner'+k]:document.documentElement&&document.documentElement.clientHeight?document.documentElement['client'+k]:document.body['offset'+k])*m[1]/100);
 };

/*
 //	from getWinStatus()
 with(document.body.style)width=height='100%';
 sl('setSize: window.inner: '+window.innerWidth+','+window.innerHeight);
 sl('setSize: window.page: '+window.pageXOffset+','+window.pageYOffset);
 sl('setSize: screen: '+screen.width+','+screen.height);
 sl('setSize: document.documentElement.client: '+document.documentElement.clientWidth+','+document.documentElement.clientHeight);
 sl('setSize: document.body.scroll: '+document.body.scrollWidth+','+document.body.scrollHeight);
 sl('setSize: document.body.offset: '+document.body.offsetWidth+','+document.body.offsetHeight);
 sl('setSize: document.body.client: '+document.body.clientWidth+','+document.body.clientHeight);
*/

 a(0);
 a(1,1);
 a(2);
 //sl('setSize: '+_s);

 a=_f.container;
 if(!a&&!(a=_f.setContainer()))return;

 with(a.style)width=s[0],height=s[1];
 with(_f.menuC.style)width=s[2],height=s[1];

 _f.menu.style.height=(_s[1]-_f.menu.offsetTop)+'px';

 //sl('setSize: '+a.offsetWidth+'-'+_f.menuC.offsetWidth+'='+(a.offsetWidth-_f.menuC.offsetWidth));
 //sl('setSize: '+_s[0]+'-'+_s[2]+'='+(_s[0]-_s[2]));
 initMap.flag.size=[
	a.offsetWidth-_f.menuC.offsetWidth-(navigator.userAgent.indexOf('MSIE')==-1?13:1),	//	13: 和 scrollbar 有關嗎??
	(navigator.userAgent.indexOf('MSIE')==-1?_s[1]:_s[1])	//	_s[1] 不能改成 a.offsetHeight
 ];
}



showML.refresh=1;
showML.closeMark='×';
showML.indexA='iA';
showML.selClass='sel';
showML.specialKind='sp';
showML.isSelR=new RegExp('(^|\\s+)'+showML.selClass);
//showML.selO=null;
showML.sel=function(o,removed){
 var _t=this;
 if(typeof o!='undefined'){
  //	GMarker.setImage(src)
  if(!removed&&_t.selO&&_t.selO.setImage)
   try{_t.selO.setImage(mapO.icon().image);}catch(e){}	//	用 try 是因為有時被刪了可是卻還是在（動作太快？），這時要 setImage 會出錯。
  _t.selO=o;
  if(o&&o.setImage)o.setImage(mapO.icon(showSP.selectedI).image);
 }
 return _t.selO;
};
showML.getName=function(o){
 var name=o.parentNode.attributes.getNamedItem(this.indexA),type;
 if(name&&(name=name.nodeValue)&&(type=name.match(/^([a-z]+),(.+)$/i))){
  //sl('showML.getName: ['+type[1]+'] '+type[2]+'('+getO.alias(type[2])+','+mapO.getO(type[1],getO.alias(type[2]))+')');
  //name=,type=type[1];
  return [getO.alias(type[2]),type[1]];//[name,type];
 }
};
showML.write=function(t){
 try{document.getElementById('markerList').innerHTML=t;}catch(e){}
};
function showML(o){
 if(!mapO)return;	//	尚未 initial?

 var _f=arguments.callee;
 if(o){
  var name,type;
  if(type=_f.getName(o)){
   name=type[0],type=type[1];
   if(o.className=='closeMark')
    mapO.remove(name,type);
   else{
    showML.sel(mapO.getO(type,name));//.setImage(mapO.icon(2).image);
    mapO.show(name,type);
    o=o.parentNode;
    for(var i=0,LI=library_namespace.get_tag_list('li', o.parentNode.parentNode);i<LI.length;i++)
     if(_f.isSelR.test(LI[i].className))LI[i].className=LI[i].className.replace(_f.isSelR,'');
    o.className+=' '+_f.selClass;
   }
  }
  return false;
 }

 if(!_f.refresh)return;
 //alert(mapO.getOArray('type').join('\n'));

 var t=['<ol>'],a,i,j,id,OK={};
 for(j in mapO.supportKind()){
  a=mapO.getO(j);
  for(i in a){
   //sl(a[i].name+','+a[i].address);
   if(a[i].name in lostItem)delete lostItem[a[i].name];
   else if(('address' in a[i]) && (a[i].address in lostItem))delete lostItem[a[i].address];

   id=typeof a[i].getLatLng=='function'?a[i].getLatLng():a[i].name;
   if(!(id in OK))
    OK[id]=1,
	t.push('<li '+_f.indexA+'="'+j+','+i+'" class="'+(j=='marker'?'':_f.specialKind)+' '+(_f.sel()==a[i]?_f.selClass:'')+'"'
     +'><a href="#" title="'+UnicodeToHTML((
		((a[i].name+'').indexOf(id)!=-1||(a[i].dscr+'').indexOf(id)!=-1?'':id+'\n')
		+(a[i].dscr||i)
		+(showNeighbor.pointer&&typeof a[i].getLatLng=='function'?'\n距離定點 '+(a[i].getLatLng().distanceFrom(showNeighbor.pointer.getLatLng())/1000||0).toFixed(3)+' km':'')
	  ).replace(/<br\/?>/gi,'\n').replace(/\n{2,}/g,'\n'),2)+'" onclick="return showML(this);" onmouseover="showSP(this,1);" onmouseout="showSP(this);">'
     +(a[i].name||i).replace(/<[^>]+>/g,'')
     +'</a> [<a href="#" class="closeMark" onclick="return showML(this);" title="關閉">'+_f.closeMark+'</a>]</li>');// title="remove marker"
  }
 }
 for(i in lostItem)t.push('<li class="lost"><a href="#" onclick="mData['+dQuote(i,0,"'")+'].show=1;mapO.add(mData['+dQuote(i,0,"'")+']);return false;" title="'+UnicodeToHTML(mData[i].name||mData[i].type||'')+'">'+i+'</a></li>');
 t.push('</ol>');
 //sl(UnicodeToHTML(t.join('')),1);
 _f.write(t.join(''));
 //	see dealWithLink() @ link.js
 if(typeof dealWithLink=='function')setTimeout('dealWithLink(0,1);',0);
 return false;
}


//	show spot
showSP.defaultI=0;	//	default icon index
showSP.selectedI=2;	//	selected icon index
function showSP(o,i){
 if(o){
  var name,type;
  if(type=showML.getName(o)){
   name=type[0],type=type[1];
   o=mapO.getO(type,name);
   if(o&&o.setImage&&o!=showML.sel())
    //sl('showSP: set icon of ['+o.name+'] to '+i),
    o.setImage(mapO.icon(i).image);
  }
  return false;
 }

}

//	應用

function removeAll(){
 showML.refresh=0,lostItem={};
 if(mapO)mapO.removeAll();	//	尚未 initial?
 if(showML)showML.sel(null,1),showML.refresh=1,showML();
}


//	不能造成 type 改變!
function normalize_address(t) {
	var _f = arguments.callee, a = '０１２３４５６７８９';
	if (!_f.dc) {
		_f.nr = new RegExp('[' + a + ']', 'g');
		_f.dc = {};
		for ( var i = 0; i < a.length; i++)
			_f.dc[a.charAt(i)] = i;
	}
	return t.replace(/[\s　]+/g, '').replace(_f.nr, function($0) {
		return _f.dc[$0];
	})
	//.replace(/號([^樓]+樓|之.{1,2})$/,'號');
	;
};

/*
http://www.post.gov.tw/post/internet/f_searchzone/sz_a_b_ta.jsp#a
縣市
鄉鎮市區	【市】為縣轄市
村里	直轄市：台北市、高雄市及省轄市：基隆市、新竹市、台中市、嘉義市、台南市以外地區由於路名結構變化較大，有些地區沒有路、街，僅有「村」、「里」名稱
鄰
路街	路名中不可使用（全、半形）阿拉伯數字，必須一律使用中文數字，如中正二路等，惟門牌號不必輸入。	新村、山莊、新城、工業區等與街、路同級之名稱
段
巷	文字巷
弄
號
\d(之\d)樓(之\d)

縣市鄉鎮區村里鄰路街段巷弄號樓

TODO:
806台灣高雄市前鎮區光華二路413號

*/
_// JSDT:_module_
.
/**
 * 解析地址
 * @param {String} address	地址
 * @returns
 * @_memberOf	_module_
 */
parse_address = function (address) {
	var a = {}, i, v, w = '縣市鄉鎮區村里鄰路街段巷弄號樓',
	r = new RegExp('[^' + w + ']+([' + w + '])', 'g');

	var _ = address.replace(/[　\s]+/g, '').replace(/號([^樓F]{1,6})F$/, '號$1樓')
			.replace(/^(\d{3,5})?[台臺]灣/, '$1').replace(/^\d+/, function($0) {
				r.zip = $0;
				return '';
			}).replace(r, function($0, $1) {
				v = $0;
				if (/縣市/.test(i = $1) && !r.zip)
					v.replace(/^\d{3}\d{2}?}/, function($0) {
						r.zip = $0;
						return '';
					});
				a[i] = v;
				//sl(v);
				return '';
			});
	// sl('['+address+'] --- ['+_+']');
	return _ ? 0 : address;
};


//	地址轉 index
getO.n={};	//	name(address) to mapO.getO's name
getO.add=function(alias,name,type){
 if(alias&&name&&alias!=name){
  if(type&&mapO.getO(type,alias)&&!mapO.getO(type,name)){
   var t=name;name=alias,alias=t;
  }
  //sl('getO.add: ['+alias+'] set to ['+name+']'),
  this.n[alias]=name;
 }
};
getO.alias=function(name){return this.n[name]||name;};
function getO(name){
 return mapO.getO(arguments.callee.n[name]||name);
}




/*	search address
sA(index of mData)
sA({type(where):'',name:'',description:''})
sA(type(where),name,description)
*/
function sA(i,a,b){
 if(!mData)return;	//	尚未 initial?
 if(!(i in mData)||arguments.length>1)
  //sl('sA: search '+i),
  mapO.searchPoint.apply(mapO,arguments);
 else
  //sl('sA: call mData['+i+']('+mData[i].type+')'),
  mapO.searchPoint(mData[i]);
 return false;
}

//	先找尋現有資料
function sA2(adr,noFit){
 var _f=arguments.callee;

 if(!noFit){
  showFit(adr
	,function(k,o){return k&&(o.name+o.description).indexOf(k)!=-1;}
	,function(k){_f(adr,1);}
  );
  return;
 }

 if(typeof adr_to_mData!='object'||mapO.LatLngR.test(adr))return sA(adr);

 //return sA(adr_to_mData[adr]||adr);


 if(!_f.c)_f.c=document.getElementById('guess');

 if(!(adr in adr_to_mData)&&(adr.toLowerCase() in adr_to_mData))
  //sl('sA2: ['+adr+']→['+adr.toLowerCase()+']'),
  adr=adr.toLowerCase();
 if(adr_to_mData[adr] in mData){
  var a=adr_to_mData[adr];
  mData[a].show=1;	//	置中
  sA(a);
  if(showML.selO)mapO.showWindow(showML.selO);
 }else if(!_f.c)sA(adr);
 else mapO.getLocations(adr,function(r){
	 var cM='<div style="float:right;cursor:pointer;" title="close" onclick="sA2.c.style.display=\'none\';">[×]</div>';
	 if(gLocal){gLocal.searcher.setCenterPoint(showNeighbor.pointer.getLatLng()||mapO.setCenter()||'台灣');gLocal.s(adr);}
	 if(!r.length){_f.c.innerHTML=cM+'使用 GClientGeocoder.getLocations 沒找到 [<span style="color:#e23;">'+adr+'</span>]：<br />'+mapO.GeoStatus(mapO.getLocations.errno),_f.c.style.display='block';return;}
	 if(r.length==1&&adr==r[0][2]){sA(adr);if(showML.selO)mapO.showWindow(showML.selO);return;}
	 var i=0,t=[cM+'對於 [<span style="color:#e23;">'+adr+'</span>]，您是不是指：<ol>'];
	 for(;i<r.length;i++)
	  if(r[i][0])
	   //sl('sA2: '+r[i]),
	   t.push('<li><span title="'+r[i][0]+','+r[i][1]+'">〒</span> <span class="point" onclick="sA(this.title);if(showML.selO)mapO.showWindow(showML.selO);return false;" title="'+r[i][2]+'">'+r[i][2]+'</span></li>');
	 t.push('</ol>');
	 _f.c.innerHTML=t.join('');
	 _f.c.style.display='block';
	});//sA(adr);
 return false;
}



/*
從 mData show 符合條件的
*/
showFit.showZoom=40;	//	這以下就 zoom
showFit.limit=80;	//	最多取點數
function showFit(k,func,notFound){
 if(typeof k=='undefined'||!func)return;
 removeAll();
 showML.write('頁面資料讀取中，請稍候…');

 var i,p=[],b,_f=arguments.callee;
 for(i in mData)
  if(func(k,b=mData[i],i) && (b=mapO.searchPoint.call(mapO,b)))	//	確定有找到才 c++
   if(p.push(b), _f.limit&&p.length>_f.limit)break;

 if(p.length<_f.showZoom)
  if(p.length){
   //	zoom
   b=new GLatLngBounds();
   for(i=0;i<p.length;i++)
    b.extend(p[i]);
   mapO.setCenter({p:b.getCenter(),m:'pan',z:mapO.map.getBoundsZoomLevel(b)});
  }else if(notFound)notFound(k);

 return p;
}



/*	只顯示附近的spot
showNeighbor('高雄市苓雅區');

bug:

TODO:
setZoom: getBoundsZoomLevel
addSelf:	加入此點，使之受到管控。預設 false
不在管控內
*/
showNeighbor.pointer=null;	//	default GMarker
showNeighbor.addPointer=function(a){
 var _m=mapO.map,m=mapO.addMarker(
	 new GLatLng(22.62,120.33)//dLoc.tw
	 ,{draggable:true,title:'請拖曳我，以找出鄰近的點。',icon:mapO.icon(3)}
	);
 GEvent.addListener(m,"dragend",function(){
  showNeighbor(m.getLatLng());
 });

 if(this.l)GEvent.removeListener(this.l);
 this.l=GEvent.addListener(_m,"click",function(overlay,point){
  var i,p=[5,10,15,20,30,50],s='<br /><a href="#" onclick="return showNeighbor.byD();" title="search near">搜尋附近</a>';
  for(i=0;i<p.length;i++)s+=' <a href="#" onclick="return showNeighbor.byD('+p[i]+');">'+p[i]+'</a>';
  s+=' km';
  if(overlay==m)m.openInfoWindowHtml('經緯度: '+m.getLatLng()+s);
  else if(!overlay&&point)
   p=m.getLatLng(),m.setLatLng(point),
   m.openInfoWindowHtml(point+'<br />from: '+p+',<br />distance: '+(p.distanceFrom(point)/1000).toFixed(3)+'km'+s);
 });

 return this.pointer=m;
};
showNeighbor.arg={	//	傳給 .getNeighbor() 的參數
	//f:'n[i]=n[i][1][2];',	//	不能改變結構！因為需要 getBoundsZoomLevel
	d:30,
	c:9
};
showNeighbor.forEach=function(a){
 //sl('showNeighbor.forEach: ['+(typeof a[1][2])+'] '+a[1][2]);
 sA(a[1][2]);
};
showNeighbor.byD=function(d){
 var _t=this;
 if(d)_t.arg.d=d;
 if(_t.pointer)_t(_t.pointer.getLatLng());
 return false;
};
showNeighbor.notFound=function(address,address_not_found){
 showML.write('抱歉，找不到 <em>'+address+'</em>'+(address_not_found?'':' 附近的點')+'。');
};
function showNeighbor(l,f){//(location | [location, address], addSelf)
 if(!l)return;
 showML.write('頁面資料讀取中，請稍候…');
 var _f=arguments.callee,i,o,adr;
 if(Array.isArray(l))adr=l[1],l=l[0];
 //sl('showNeighbor: ['+l+','+adr+'] '+(l instanceof GLatLng)+', '+mapO.getLatLng(l+''));
 if(!(l instanceof GLatLng))
  // 無此資料。嘗試取得 loc..
  return mapO.getLatLng(l+'',[function(p){_f([p,adr||l]);},function(p){if(p)return _f([p,adr||l]);_f.notFound&&_f.notFound(adr||l,1);}]);
 o=mapO.getNeighbor(l,_f.arg);
 if(o.length){
  removeAll();
  var bounds=new GLatLngBounds();
  bounds.extend(l);
  for(i=0;i<o.length;i++){
   if(!isNaN(o[i][1][1]))
    //sl('Add to bound: '+o[i][1][0]+','+o[i][1][1]),
    bounds.extend(new GLatLng(o[i][1][0],o[i][1][1]));
   //sl('add ['+o[i][1][2]+'] by '+(_f.forEach+'').slice(0,20)+'..');
   _f.forEach(o[i]);
  }
  if(!mapO.searchPoint.show)	//	若設了 searchPoint.show，還是會被其他的奪去…
   mapO.setCenter({p:bounds.getCenter(),m:'pan',z:mapO.map.getBoundsZoomLevel(bounds)});
 }else _f.notFound(l);
 if(_f.pointer)_f.pointer.setLatLng(l),_f.pointer.openInfoWindowHtml('搜尋 '+(adr?'<em title="'+l+'">'+adr+'</em> ':l)+' 四周 '+_f.arg.d+' km<br />找到 '+o.length+'/(最多 '+_f.arg.c+') 個點。');
 //sl('showNeighbor: search around '+l+' (四周 '+_f.arg.d+' km) get '+o.length+'/(max '+_f.arg.c+') results.');
}














//	===================================================
/*
	** use Yahoo! Map to get position of a address

_=this

TODO:


HISTORY:
2008/7/31 19:56:29	create


http://tw.developer.yahoo.com/maps/
http://developer.yahoo.com/maps/ajax/V3.8/index.html
*/
var
getLatLon=

(function(){

var

//	class private	-----------------------------------

//	class name
n='getLatLon',

//	running now
r=0,

//	interval/timeout seed
s=''+Math.random()*1e12,


//	{ address: [function(lat, lng, address), not found function(address)], .. }
o={},

//	queue: [ adr, .. ]
q=[],


//	map object
m,

//	initial
i=function(){
 if(typeof YMap!='function'){
  //sl(n+': Please include YMap first!');
  return 1;
 }

 var o=document.createElement('div');
 document.body.appendChild(o);
 o.style.width=o.style.height='1px';	//	=0 會造成 .getArea() 出問題
 YEvent.Capture(m=new YMap(o),EventsList.onEndGeoCode,c);
 o.style.visibility='hidden';
 //o.style.display='none';	//	會造成 .getArea() 出問題

 //s=Math.random()*1e12+'';
},


//	do query
d=function(){
 //sl(n+'.do query: '+q[0]);
 if(!q||!q.length)r=0;
 else m.geoCodeAddress(q.shift());
},


//	catch function
c=function(r){
 var a=r.Address,f;

 if(f=_.interval)
  setTimeout(n+'("'+s+'");',f);
 else d();

 if(a in o)
  if(f=o[a],r.success)f[0](r.GeoPoint.Lat,r.GeoPoint.Lon,a);
  else f[1]&&f[1](a);
 delete o[a];
},


//	instance constructor	---------------------------
_=function(a,f,nf){	//	address, function, not found function
 if(a===s)return d();

 if(!a||!f || !m&&i())return 1;

 o[a+='']=[f,nf];

 //sl(n+': ('+q.length+')'+[a,f,nf]);
 q.push(a);

 if(!r)r=1,d();
};


//	class public interface	---------------------------

//	interval (ms)
_.interval=0;


//	class constructor	---------------------------

i();


return _;
})();	//	(function(){

//	===================================================


/*	old
//	use Yahoo! Map

//	interval
//getLatLon.t=200;

//	{ address: [function, not found function], .. }
getLatLon.o={};

//	queue: [ adr, .. ]
getLatLon.q=[];

//	initial
getLatLon.i=function(){
 if(typeof YMap!='function'){
  //sl('getLatLon: Please include YMap first!');
  return 1;
 }
 var c=document.createElement('div');
 document.body.appendChild(c);
 c.style.width=c.style.height=0;
 YEvent.Capture(this.m=new YMap(c),EventsList.onEndGeoCode,this.c);
 c.style.display='none';
 this.T=Math.random()*1e12+'';
};

//	catch function
getLatLon.c=function(r){
 var t=getLatLon;
 if(t.t)setTimeout('getLatLon.d("'+t.T+'");',t.t);else getLatLon.d();
 var f=t.o;
 if(r.Address in f)
  if(f=f[r.Address],r.success)f[0](r.GeoPoint.Lat,r.GeoPoint.Lon,r.Address);
  else f[1]&&f[1](r.Address);
 delete t.o[r.Address];
}

//	do query
getLatLon.d=function(){
 var _f=arguments.callee,_t=this,a,f,n;
 //sl('getLatLon.d: '+_t.q[0]);
 if(!_t.q||!_t.q.length)_t.r=0;
 else _t.m.geoCodeAddress(_t.q.shift());
};


//	running
//getLatLon.r=0;

function getLatLon(adr,f,nf){
 var _f=arguments.callee;
 if(adr===_f.T)return _f.d();
 if(!adr||!f || !_f.m&&_f.i())return;

 if(!_f.q)_f.q=[];
 //sl('getLatLon: ('+_f.q.length+')'+[adr,f,nf]);
 _f.o[adr]=[f,nf];
 _f.q.push(adr);

 if(!_f.r){_f.r=1;_f.d();}
}
*/








//	===================================================

/*
	main map function

_=this

TODO:

*/

//var
gMap=

(function(){

//	class private	-----------------------------------
var

//	class interface	-----------------------------------
_=function(){
 //	Dynamic Loading	http://code.google.com/apis/ajax/documentation/#Dynamic
 //if(typeof GMap=='undefined')google.load("maps","2",{language:"ja_JP",callback:mapsLoaded});

 //	init member
 var _t=this,i;
 //	initial instance object
 _t.locArray=[],_t.locArray2=[],_t.locArray_u={},_t.locArray2_u={},_t.iconA=[],_t.iconO={},_t.dMarkerO={};
 _t.kinds={marker:GMarker,polyline:GPolyline,polygon:GPolygon,xml:GGeoXml};	//	If this failed, maybe GMap didn't loaded?
 for(i in _t.kinds)
  if(i in _t)throw 'Error: ['+i+'] is already a member of me!';
  else _t[i]={};


 //	調整 GLatLng 的顯示
 GLatLng.prototype.toS=function(p){
  if(!p)p=_t.precision||0;
  return Number(this.lat()).toFixed(p)+','+Number(this.lng()).toFixed(p);
 };
 GLatLng.prototype.toString=function(p){return '('+this.toS(p)+')';};


/*
	http://blog.wctang.info/2007/07/use-google-map-api-without-api-key.html
	Geocode 查詢每天有 50000 次的限制	使用 Geocoder 就是要連到 Google 去做查詢，而現在 Google 在做 Geocode 查詢時會在 Server 端做 API key 的檢查，這個就躲不掉了
	http://blog.wctang.info/2007/07/use-google-map-geocoder-without-api-key.html


*/
 if(GBrowserIsCompatible()&&!_t.geocoder)
  with(_t.geocoder=new GClientGeocoder())
	setCache(null),	//	disable cache, 因為找到的都被管控了。
	setBaseCountryCode('tw');	//	語系

 //_t.readLoc();
 _t.initMap.apply(_t,arguments);//return _t.initMap.apply(_t,arguments);
};


//	class public	-----------------------------------


//	prototype	-----------------------------------
_.prototype={

//	這些函數可重寫
notFound:function(address,data){
 return 1;//throw 'Address ['+address+'] not found!';
},
//	增加 overlay 後
runAfterAdd:function(obj,type,data,name){},
//	移除 overlay 後
runAfterRemove:function(obj,type){},
//	按 overlay 時
runOnClick:function(obj,type){},

precision:6,	//	精度，算到小數點下第幾位。GMap 2008:6

defaultZoom:14,	//	預設縮放

/*
map,	//	GMap obj

TODO:
use GMarkerManager,	http://code.google.com/apis/maps/documentation/overlays.html#Marker_Manager


//handle array:
marker={'lat,lng':GMarker},	//	GMarker 地圖標記
polyline={points:GPolyline},	//	GPolyline 折線
polygon={points:GPolygon},	//	GPolygon 多邊形
xml={URL:GGeoXml},		//	GGeoXml: xml/kml
*/
kinds:{},
supportKind:function(k){
 return k?k in this.kinds:this.kinds;
},

getKind:function(o){
 for(var i in this.kinds)
  if(o instanceof this.kinds[i])return i;
},


//	讀入先前 catch 的經緯度，存loc而不必每次search
readLoc:function(){
 var _t=this,t,i=0,l,a;
 if(!_t.locFP)_t.locFP='map_loc.dat';	//	紀錄 LatLng/地址 可供 searchPoint() 使用
 //	GDownloadUrl(url,callback)
 try{t=getU(_t.locFP);}catch(e){}
 _t.adr_to_loc={};
 if(!t||!(t=t.replace(/\r/g,'').split('\n')).length)return;

 sl('Get '+t.length+' catched address records from ['+_t.locFP+'].');
 for(;i<t.length;i++)
  if((a=t[i].split('	')).length>1 && (l=a[0].split(',')).length==2)
   _t.adr_to_loc[a[1]]=new GLatLng(l[0],l[1])
   //,sl('readLoc: ['+a[1]+'] '+_t.adr_to_loc[a[1]])
   ;
  else sl('readLoc: error data: '+t[i]);
},

//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！
//	locArray[]=[lat,lng,adr] sort by lat	給 writeLoc() & getNeighbor() 用，僅包含需要 search 的。
locArray:[],
//	寫入 catched 的經緯度
writeLoc:function(s){
 var _t=this,i,t=[],l,a=_t.precision,b,c;
 //sl('writeLoc: We will write data to ['+_t.locFP+'].');
 if(!_t.locFP)return;

 for(i in _t.adr_to_loc)
  if(l=_t.adr_to_loc[i])try{
   if(isNaN(b=Number(l.lat()))||isNaN(c=Number(l.lng())))throw new Error(1,'經緯度非數字');
   t.push([b.toFixed(a),c.toFixed(a),i]);
  }catch(e){sl('writeLoc: Error: '+e.message+': ['+l+'] '+i+', ('+l.lat()+','+l.lng()+')');}

 sl('writeLoc: '+_t.locArray.length+'→'+t.length);
 //	不相同時才作處理
 if(t.length!=_t.locArray.length){
  t.sort(function(l,r){return l[0]-r[0]||l[1]-r[1];});
  for(a=_t.locArray=[],b=_t.locArray_u={},c=[],i=0;i<t.length;i++)
   if(l=t[i]){
    if((l[0]+','+l[1]) in b)sl('writeLoc: 重複住址@ '+l[0]+','+l[1]+': '+b[l[0]+','+l[1]][2]+' , '+l[2]);
    a.push(b[l[0]+','+l[1]]=l);
    c.push(l[0]+','+l[1]+'	'+l[2]);
    //sl('writeLoc: '+i+'/'+t.length+' '+c[c.length-1]);	//	多!!
   }
  //sl('writeLoc: '+(typeof simpleWrite)+','+_t.locFP);
  if(typeof simpleWrite=='function'){
   c=c.join('\n');
   if(typeof simpleRead=='function' && simpleRead(_t.locFP,'utf-8')==c)
    sl('writeLoc: 欲寫入之內容('+c.length+' chars)與標的檔相同。檔案並未變更。');
   else
    //sl('writeLoc: Write '+c.length+' chars to ['+_t.locFP+'].'),
    simpleWrite(_t.locFP,c,'utf-8');
  }//else sl('writeLoc: <em>Warning: function.js is not included?</em>');
 }
 if(s)sl('<textarea>'+t.join('\n')+'</textarea>');
 return t;
},
//	locArray2[]=[lat,lng,adr] sort by lat	給 getNeighbor() 用，包括所有不需要 search 的地址。
locArray2:[],
locArray_u:{},locArray2_u:{},	//	預防重複: locArray_u['lat,lng']=obj of locArray or locArray2
/*	取得鄰近的地點: 經緯度, 最大距離(km)	http://blog.ben.idv.tw/2007/06/blog-post.html	http://hk.geocities.com/hk_weather/big5/others/calculators.html	http://blog.xuite.net/joy715/blog/9285691	http://iask.sina.com.cn/b/6263160.html
mapO.getNeighbor([22.620096,120.333381],"sl(n[i][1][2]);");
return:
	f.d:	距離(km)
	f.c:	最多取用點數，<=0：全取，未設：default
	f.s:	最後時選取與否的篩選設置之函數	傳回數值越大越後面
	f.D:	計算距離之函數，將用來比較
		default			[ [較準確的距離, [lat,lng,adr]],.. ]
		求得較大概的距離(以距離平方比計算,比較快)
					[ [距離, [lat,lng,adr]],.. ]	f.D=function(p,l){var a=l.lat()-p[0],b=l.lng()-p[1];return a*a+b*b;}

	f.f:	對選出之 spot 作最後處置之函數
		default			[ [較準確的距離, [lat,lng,adr]],.. ]
		傳回地址		[ adr1, adr2,.. ]		f.f=	'n[i]=n[i][1][2];'
		傳回 obj		[ [lat,lng,adr],.. ]		f.f=	'n[i]=n[i][1];'
		求得較準確的距離	[ [距離, [lat,lng,adr]],.. ]	f.f=	'n[i][1]=l.distanceFrom(n[i][1]);'
*/
getNeighbor:function(l,f){
 var _t=this,lat,lng,i,n=[],p=function(A){
	//	計算最接近上限mLat之loc
	//	c: 誤差
	var i=0,j=A.length,a,b,c=f._d,mLat=lat-c;
	if(!j)return;
	//sl(mLat+'~'+(lat+c));
	do{
	 //sl(Math.floor((i+j)/2)+'/'+A.length+','+A[a=Math.floor((i+j)/2)]);
	 b=A[a=Math.floor((i+j)/2)][0];
	 if(b>mLat)j=a;else if(b<mLat)i=a;
	}while(i<j-1&&Math.abs(b-mLat)>c);
	//sl('start: from ['+a+'/'+A.length+'] '+A[a].join(':')+' to '+(lat+c));var tt=[];
	for(i=a,mLat=lat+c,a=lng-c,b=lng+c;i<A.length&&A[i][0]<mLat;i++)
	 if(/*tt.push('- '+A[i]+': '+a+','+c+','+b),*/c=A[i][1],a<c&&c<b)
	  //n.push([j=f.D(A[i],l),A[i]]),sl('distance: '+j.toFixed(2)+' to '+A[i]);
	  n.push([f.D(A[i],l),A[i]]);
	//sl(tt.join('<br />'));
 };
 if(typeof l=='string')l=l.split(',');
 //if(typeof l=='function'&&l.lat&&l.lng)lat=typeof l.lat=='function'?l.lat():l.lat,lng=typeof l.lng=='function'?l.lng():l.lng;
 if(l instanceof GLatLng)lat=l.lat(),lng=l.lng();
 else lat=l[0],lng=l[1],l=new GLatLng(lat,lng);
 //	這邊起 l 為原始點之 GLatLng
 if(typeof f!='object')
  f=isNaN(f)?{f:f}:{d:f};
 f._d=(f.d>0?f.d:20)/111;	//	1度的實際長度~111公里。
 if(!f.D)f.D=function(p,l){
	//var a=lat-p[0],b=lng-p[1];return a*a+b*b;	//	大概的，比較快。
	return l.distanceFrom(new GLatLng(p[0],p[1]));	//	real distance
 };

 //sl(lng+', '+lat+'; '+f._d);
 _t.writeLoc();
 p(_t.locArray);
 _t.locArray2.sort(function(l,r){return l[0]-r[0]||l[1]-r[1];});
 //sl('['+_t.locArray2.length+']<br />* '+_t.locArray2.join('<br />* '));
 p(_t.locArray2);
 //sl('Get '+n.length+' records near ('+lat+','+lng+').');

 //	由近至遠 sort
 if(typeof f.s=='undefined')f.s=function(l,r){return l[0]-r[0];};	//	l, r: [distance by f.D,[lat,lng,adr]]
 if(f.s)n.sort(f.s);
 //for(i=0;i<n.length;i++)sl('getNeighbor '+i+': '+n[i][0]+' '+n[i][1][2]);
 if(typeof f.c=='undefined'||f.c&&!isNaN(f.c)&&n.length>f.c)
  n=n.slice(0,f.c>0?f.c:9);	//	預設取 9 個

 if(typeof f.f=='string')f.f=new Function('n','i','l',f.f);
 //sl('Run: [~'+n.length+'] by '+f.f);
 if(typeof f.f=='function')
  for(i=0;i<n.length;i++)f.f(n,i,l);

 return n;
},
/*
http://econym.googlepages.com/geomulti.htm
http://econym.googlepages.com/didyoumean.htm
enum GGeoStatusCode	http://code.google.com/intl/zh-CN/apis/maps/documentation/reference.html#GGeoStatusCode
*/
GeoStatus:function(c){
 var m=this.GeoStatusM;
 if(!m){
  this.GeoStatusM=m={
	G_GEO_SERVER_ERROR:'伺服器錯誤。',
	G_GEO_MISSING_QUERY:'輸入空地址。',
	G_GEO_UNKNOWN_ADDRESS:'找不到指定地址的對應地理位置。可能地址比較新，無法解析地址，地址不正確，或者缺少該地址的數據。',
	G_GEO_UNAVAILABLE_ADDRESS:'由於合法性或合同原因，無法返回給定地址的地理位置信息。',
	G_GEO_BAD_KEY:'給定的密鑰無效或與給定的 host ('+window.location.host+') 不匹配。',
	G_GEO_TOO_MANY_QUERIES:'給定的密鑰超出了 24 小時的請求限制。',
	//404:'沒找到網頁',
	403:'Probably an incorrect error caused by a bug in the handling of invalid JSON',
	G_GEO_SUCCESS:'查詢成功'
  };
  var i,v;
  for(i in m)try{
   if(!isNaN(v=eval(i))&&v!=i)m[v]=m[i];
  }catch(e){}
 }
 return m[c]||'';
},
/*	mapO.getLocations('taiwan',function(r){});
	arguments:
		address, function([[lat,lng,adr], ..]), data object
		address, [handle function, (預設0: 傳入 [[lat,lng,adr], ..], 1: 傳入 GClientGeocoder.getLocations)], data object

http://code.google.com/apis/maps/documentation/services.html#Geocoding_Structured
http://code.google.com/apis/kml/documentation/kmlreference.html#placemark
http://www.step1.cn/googleapi/map/kml.htm#Placemark

to use:
mapO.getLocations('宿舍',function(r){for(var i=0;i<r.length;i++)sl(i+'/'+r.length+' '+r[i]);});
*/
getLocations:function(adr,func,d){
 var _t=this,_f=arguments.callee,a
  //	country code
  ,cc={TW:'台灣',US:'United States',JP:'日本',CN:'中国',KR:'大韓民國',KP:'朝鮮',UK:'United Kingdom'}
  ,ga=function(p){	//	從 Placemark 得到住址(address)資料
	 var c,a,b;
	 if(c=p.AddressDetails.Country){
	  b=c.CountryNameCode;
	  a=b in cc?[cc[b]]:[];
	  if(c=c.AdministrativeArea){
	   if(b=c.AdministrativeAreaName)a.push(b);
	   if(c=c.SubAdministrativeArea){
	    if(b=c.SubAdministrativeAreaName)a.push(b);
	    if(c=c.Locality){
	     if(b=c.PostalCode)a.unshift('['+b.PostalCodeNumber+']');
	     if(b=c.LocalityName)a.push(b);
	     if((c=c.Thoroughfare)&&(b=c.ThoroughfareName))
	      a.push(b);
	    }
	   }
	  }
	  a=a.join(' ');
	 }
	 return p.address?p.address+' ('+a+')':a;
  },
  //	預設代為處理函數組
  f=[
	//	代為處理傳入 [lat,lng,adr]
	function(r){
	 _f.errno=r.Status.code;
	 if(r instanceof GLatLng)
	  r=[[r.lat(),r.lng(),adr]];
	 else if(r.Status.code==G_GEO_SUCCESS){
	   //sl('getLocations: Get '+r.Placemark.length+' place(s) of ['+r.name+'].');
	   //sl('getLocations: [0]: '+r.Placemark[0].name);
	   var i=0,n=r.name,p=r.Placemark,l,a;
	   for(r=[];i<p.length;i++)
	    a=ga(p[i])||n+'('+i+')',
	    //sl('getLocations: ('+p[i].Point.coordinates+') '+a),
	    l=p[i].Point.coordinates,r.push([l[1],l[0],a]),
	    _t.adr_to_loc[a]=new GLatLng(l[1],l[0]);
	 }else r=[];
	 return func(r);
	}
   ,
	//	代為處理傳入 Placemark
	function(r){
	 _f.errno=r.Status.code;
	 if(r instanceof GLatLng)
	  r={Status:{code:G_GEO_SUCCESS},Placemark:[{Point:{coordinates:[r[0],r[1]]}}]};
	 else if(r.Status.code==G_GEO_SUCCESS){
	  //sl('getLocations: find '+r.Placemark.length+' records, '+r.Placemark[0].Point.coordinates+': '+r.Placemark[0].address);
	  //if(r.Placemark.length==1){var l=r.Placemark[0].Point.coordinates;_t.adr_to_loc[r.Placemark[0].address]=new GLatLng(l[1],l[0]);}
	  for(var i=0,n=r.name,p=r.Placemark,l;i<p.length;i++)l=p[i].Point.coordinates,_t.adr_to_loc[ga(p[i])||n+'('+i+')']=new GLatLng(l[1],l[0]);
	 }//else sl('getLocations: search ['+adr+'] fault: ['+r.Status.code+'] '+_t.GeoStatus(r.Status.code));
	 return func(r);
	}
  ];

 if(Array.isArray(func))
  a=func[1],
  f=	typeof a=='function'?a
	:typeof a=='number' && f[a]? f[a] 
	:f[0],
  func=func[0];
 else f=f[0];

 return _t.getLatLng(adr+='',[f,function(){return _t.geocoder.getLocations(adr,f);}],d);
},

//	直接手動設定
setLatLng:function(adr,lat,lng){
 if(!(lat instanceof GLatLng))lat=new GLatLng(lat,lng);
 this.adr_to_loc[adr]=lat;
 sl('setLatLng: '+lat+' '+adr);
 return lat;
},

//	經緯度 RegExp
LatLngR:/^\s*(\d{1,3}(\.\d+)?)\s*,\s*(\d{1,3}(\.\d+)?)\s*$/,

/*	未設定 func 則僅回傳 catched 的位置
	You can define your method by .f(adr,c), for example: search by specified SQL server.

TODO:
繼承 Geocoding cache
*/
getLatLng:function(adr,func,d){	//	string address, (function(GLatLng) | [func:function(GLatLng), handle function: function(GLatLng, address)]), data object
 //if(!adr)return;
 var _t=this,m,a,f,c=function(p){
 	 if(!p)sl('getLatLng: Search failed: '+adr);
	 if(p)_t.adr_to_loc[adr]=p;
	 return func(p,adr)||p;
	};

 if(Array.isArray(func))
  f=func[1],func=func[0];

 //sl('getLatLng: search '+adr);
 //	檢測是否為經緯度
 if(m=adr.match(_t.LatLngR)){
  if(a=(d&&d.description||adr).replace(/<[\/]?([bh]r|p)[^>]*>/ig,'\n').match(/[^\r\n]+[市區街路][^\r\n]+/))
   //sl('('+m[1]+','+m[3]+') ['+a[0]+']'),
   if(!((m[1]+','+m[3]) in _t.locArray2_u))_t.locArray2.push(_t.locArray2_u[m[1]+','+m[3]]=[m[1],m[3],a[0]]);
  m=new GLatLng(m[1],m[3]);
  return func?func(m):m;
 //	搜尋已知地址
 }else if((m=_t.adr_to_loc) && (m=m[adr]))//sl('getLatLng: handle adr_to_loc['+adr+']='+m[adr]+' get '+(func?c(m):m)/*+' by '+func*/),
  return func?c(m):m;
 //	搜尋未知地址
 else if(func)
  //sl('<em>Not catched: '+adr+'</em>'),
  return _t.geocoder.getLatLng(adr,typeof f=='function'?function(m){f(m,adr);}:c);	//	 原來需要用 arguments.callee.f，但若已經用 var 定義則可直接使用。
},

/*
d={
 name:'',	//	這邊 name 被當作 id, title
 description:'HTML',
 type:'',
 data:['','']
//選用 optional:
 htm:'HTML' / function(obj){return 'HTML';},
//尚未用到︰
 link:'',
};
*/
add:function(d,force){
 if(!d||typeof d!='object')return this;
 var _t=this,o=_t.supportKind(d.type);
 if(!o){_t.searchPoint(d);return this;}

 //if(!(d.type in _t))_t[d.type]={};
 var _S=_t[d.type],_m=this.map,a;
 //if(typeof _S!='object')sl('add: typeof ['+d.type+'] = '+(typeof _S));
 if((d.name in _S)&&!force)return this;	//	已存在

 o=_t.kinds[d.type];
 if(d.type=='marker'){
  o=new o(new GLatLng(d.data[0],d.data[1]),_t.getMarkerO(d));
  //if(d.zIndexP)o._zIndexProcess=o._zIndexProcess,o.zIndexProcess=d.zIndexP;	//	** 可以利用 zIndexP 來在 infowindow is opened 時設定 z-index.. 沒用 @ 2008/6/30 19:43:43
 }else a={points:d.data[0],levels:d.data[1],numLevels:4,zoomFactor:16},
	o=new o.fromEncoded(d.type=='polyline'?a:{polylines:[a],fill:true,outline:true});//geodesic:true	Geodesic means 'along great circle'

 _t._add(o,d);

 return this;
},
searchPoint:function(adr,name,description){
 var _f=arguments.callee,_t=this,type='marker',_M=_t[type],_m=_t.map,latlng,d;
 if(typeof adr=='object')d=adr,adr=adr.type;else d={type:adr,show:_f.show};	//	預設 searchPoint.show
 if(!d.name)d.name=name||adr;
 if(typeof d.description=='undefined')
  if(description)d.description=description;
  else if(d.name!=adr)d.description=adr;
 if(!d.type)return;
 if(isNaN(d.retry)&&!_t.geocoder.getCache())d.retry=2;	//	找不到時重試次數

try{
 if(adr in _M)
  //sl('We already have ['+adr+']'),
  _t.show(_M[adr],type);
 else _t.getLatLng(adr+='',function(point){
	if(!point){
	 if(d.retry){
	  //sl('try once more('+d.retry+'): ['+adr+']');
	  d.retry--,_f.call(_t,d);return false;
	 }else{
	  //sl('searchPoint: not found function: '+_t.notFound);
	  return _t.notFound(adr,d);
	 }
	}else{
	 if(adr in _M)return;	//	可能經過太久才被 load?

	 // ** 注意：這邊沒設 _M[adr]=_M[point.toUrlValue(_t.precision)]
	 var p=new GMarker(latlng=point,_t.getMarkerO(d));
	 if(!d.name)d.name=p+'';
	 //sl('found '+point+' '+d.name+', icon: '+p.getIcon().iconSize);
	 //point='loc: '+point;
	 if(typeof d.description=='undefined')d.description=point;
	 else if(d.description==adr)d.description+='<br />'+point;
	 //_M=_M[adr];
	 if(!('address' in p))p.address=adr;else throw 'GMarker.address was used: ['+p.address+']!';
	 //sl('Last add '+adr+'..');
	 _t._add(p,d,type);
	}
  },d);
}catch(e){sl('searchPoint: Error: '+adr+', '+_M+': '+e.message);}//throw e;
 return latlng;
},
// private:	註冊 o 成為內容 d={}，並設定 click 等 event
_add:function(o,d,type){
 if(!o)return;
 if(!d)d=o;
 if(!type)type=d.type;
 var _t=this,_S=_t[type],_m=this.map;

 //if(d.name)_S[d.name]=o;	//	或許已經設定過了，這邊就需要跳過。
 if(((d.name||d)+'') in _S)
  sl('_add: Warning: Type '+type+' 已存在 ['+(d.name||d)+']'+(_S[d.name||d].getLatLng?' '+_S[d.name||d].getLatLng():'')+('address' in _S[d.name||d]?' '+_S[d.name||d].address:'')+'!'
	//+'<br />_add: 將以 ['+(o.name||d.name||d)+']'+(o.getLatLng?' '+o.getLatLng():'')+(o.address?' '+o.address:'')+' 覆寫。'
	);
 _S[d.name||d]=o;	//	必設!!

 if(_m)_m.addOverlay(o);//_t._addOverlay(o);//
 //if(o.getIcon)sl('_add: show '+o.getIcon().iconSize+' '+o.getIcon().image);
 o.name=d.name,o.dscr=d.description;	//	GMarker 中這兩個本來就有被用，偵測也只會發現已使用。
 //	another way to add tooltip: GControlPosition
 if(!('sHtm' in o)){
  if('htm' in d)o.sHtm=typeof d.htm=='function'?d.htm.call(d,o,type):d.htm;
  else o.sHtm=(d.name?'<em>'+d.name+'</em>'+(d.description?'<br />':''):'')+(d.description||'');
 }else throw '['+type+'].sHtm was used: ['+o.sHtm+']!';
 if(!('sHtmF' in o)){
  if('htmF' in d)
   o.sHtmF=typeof d.htmF=='function'?d.htmF.call(d,o,type):d.htmF;
 }else throw '['+type+'].sHtmF was used: ['+o.sHtm+']!';
 //	openInfoWindowTabs: http://www.geocodezip.com/mapXmlTabsPlus.asp
 GEvent.addListener(o,"click",function(e){
  _t.showWindow(o);
  _t.runOnClick(o,type,e&&e.target||window.event&&window.event.srcElement);
 });
 if(d.show)_t.show(o,type);
 _t.runAfterAdd(o,type,d,d.name||d);
},
_addOverlay:function(o){
 var _t=this,_m=_t.map;
 if(!_t._aa)_t._aa=[];
 if(o){_t._aa.push(o);return;}
 var i;
 while(i=_t._aa.shift())
  _m.addOverlay(i);
},


//	icon setup
defaultIconIndex:0,
iconA:[],
iconO:{},
icon:function(index){
 var _t=this;
 if(Array.isArray(index)){
  //	設定 icon
  _t.iconA=[];
  for(var a,i=0,p,u;i<index.length;i++)
   if(u=index[i]){
    if(typeof u=='string')u={image:u};
    if(library_namespace.is_Object(u)){
     _t.iconA.push(a=new GIcon(u.icon||_t.iconA[_t.defaultIconIndex]||G_DEFAULT_ICON));
     //a=new GIcon(u.icon||_t.iconA[_t.defaultIconIndex]||G_DEFAULT_ICON);
	 for(p in _t.iconO)	//	default first
      //sl('icon: set icon['+(_t.iconA.length-1)+'].'+p+'='+_t.iconO[p]),
	  a[p]=_t.iconO[p];
     if('temp' in u){	//	template 2
      for(p in u.temp)
	   //sl('icon: template set icon['+(_t.iconA.length-1)+'].'+p+'='+u.temp[p]),
	   a[p]=u.temp[p];
      delete u.temp;
     }
     for(p in u)	//	user set last
	  //sl('icon: specified set icon['+(_t.iconA.length-1)+'].'+p+'='+u[p]),
	  a[p]=u[p];
	 //_t.iconA.push(new GIcon(a));
    }else _t.iconA.push(u);
   }
  return _t.iconA.length;
 }

 if(library_namespace.is_Object(index)){
  //sl('icon: set default icon option');
  for(i in index)
   //sl('icon: set default ['+i+']=['+index[i]+']'),
   _t.iconO[i]=index[i];
  return;
 }

 //	return icon[index]
 if(isNaN(index)||index<0||index>=_t.iconA.length)index=_t.defaultIconIndex;
 //sl('icon: return icon['+index+'] '+(_t.iconA[index]?_t.iconA[index].iconSize+' '+_t.iconA[index].image:'G_DEFAULT_ICON'));
 return _t.iconA[index]||G_DEFAULT_ICON;
},

dMarkerO:{},	//	default marker option
getMarkerO:function(mo,setMO){	//	setMO: set default, 1: add, 2:reset
 var _t=this,i,a={icon:1,title:1,zIndexProcess:1,draggable:1};	//	class GMarkerOptions
 _t.dMarkerO.icon=_t.icon();
 if(setMO){
  if(setMO==2)_t.dMarkerO={};
  setMO=_t.dMarkerO;
 }else{
  //	複製一份
  setMO={};
  for(i in _t.dMarkerO)
   //sl('getMarkerO: from default ['+i+']=['+_t.dMarkerO[i]+']'),
   setMO[i]=_t.dMarkerO[i];
 }
 if(library_namespace.is_Object(mo))
  for(i in a)
   if(a[i]&&typeof mo[i]!='undefined')
    //sl('getMarkerO: set ['+i+']=['+mo[i]+']'),
	setMO[i]=mo[i];
 //sl('getMarkerO: icon: '+setMO.icon.iconSize+' '+setMO.icon.image);
 return setMO;
},

/*	增加自己控制的 marker，會自動顯現，但不會列入管控，得自己設定。
usage:
mapO.addMarker(dLoc.tw,{draggable:true});
*/
addMarker:function(loc,opt){
 var _t=this,_m=_t.map,m;
 if(_m){
  if(Array.isArray(loc))loc=new GLatLng(loc[0],loc[1]);
  m=new GMarker(loc,_t.getMarkerO(opt));
  //sl('addMarker icon: '+_t.getMarkerO(opt).icon.iconSize+' '+_t.getMarkerO(opt).icon.image);
  //sl('addMarker iconSize: '+_t.getMarkerO(opt).iconSize);
  _m.addOverlay(m);
 }
 return m;
},


//	f={p:position, m:method(pan/panBy/set), z:zoom}
setCenter:function(f){
 var _m=this.map;
 if(f instanceof GLatLng||!library_namespace.is_Object(f))f={p:f};

 //sl('setCenter: setZoom ['+(f.z||null)+'] @ '+f.p+' by method ['+(f.m||'setCenter')+'].');
 if(!isNaN(f.z))_m.setZoom(f.z);
 if(f.p){
  if(Array.isArray(f.p))f.p=new GLatLng(f.p[0],f.p[1]);
  if(f.m=='pan')_m.panTo(f.p);
  else if(f.m=='panBy')_m.panBy(f.p);
  else _m.setCenter(f.p);
 }

 return _m.getCenter();
},

//	zoom above 19	You can set zoom up to 30 by using setCenter() not by setZoom() or zoomIn()	firefox: 45.1238,-123.1138	http://esa.ilmari.googlepages.com/highres.htm
/*
eval('error_noImage=p(10121);',mapO.map);
sl(error_noImage);
*/
zoom:function(z){
 var _t=this,_m=_t.map,m;
 if(typeof z=='string'&&(m=z.match(/^[+\-]/)))z=_m.getZoom()+(m[0]=='+'?z:-z);
 if(z)_m.setZoom(z);//try{_m.setCenter(_m.getCenter(),z);}catch(e){}	//	中文中, enableContinuousZoom()? 這麼搞會出錯
 return _m.getZoom();
},
//	show, or focus. f={noCenter:false, redraw: false}
show:function(name,type,f){
 var _t=this,_S=_t[type],_m=_t.map,inC;	//	inC: in control
 if(typeof name=='string')
  if(name in _S)_S=_S[name],inC=1;
  else _S=0;
 else _S=name;
 if(typeof _S!='object'||!_S)return;

 if(_S.isHidden&&_S.isHidden())_S.show();
 if(typeof f!='object')f={noCenter:f};	//	default: don't set to center
 if(!f.noCenter){
  var p=_t.getPoint(_S,type);
  //sl('show: center= '+p);
  if(_m){
   _m.setCenter(p);
   if(_m.getZoom()<9)_m.setZoom(_t.defaultZoom);
   if(inC)_t.showWindow(_S,p);	//	未管控就 showWindow 會有奇妙的結果。
  }
 }
 if(f.redraw && _S.redraw)_S.redraw(true);	//	Front/back order of markers can be messed simply by moving them in south-north direction. (v1) 	http://koti.mbnet.fi/ojalesa/exam/anim_v2.html

 return _t;
},

//	show HTML window (obj, point)	o.sHtmF=show HTML flag: {maxContent:'', ..}: see class GInfoWindowOptions
showWindow:function(o,p){
 //sl('showWindow: '+(p||o.openInfoWindowHtml));
 if(typeof o.openInfoWindowHtml=='function')
  o.openInfoWindowHtml(o.sHtm,o.sHtmF);	//	enableMaximize()
 else this.map.openInfoWindowHtml(p||this.getPoint(o),o.sHtm,o.sHtmF);
},

//	get the GLatLng of the object
getPoint:function(o,type){
 if(!type)type=this.getKind(o);
 //sl('getPoint: ['+type+']'+o.name);
 if(type=='marker'&&typeof o.getLatLng=='function')return o.getLatLng();

 if(typeof o.getBounds=='function')
  return o.getBounds().getCenter();

 if(typeof o.getCenter=='function')
  return o.getCenter();

 if(typeof o.getVertexCount=='function')
  return o.getVertex(Math.floor(o.getVertexCount()/2));
},

getZoom:function(o,type){
 if(!type)type=this.getKind(o);
 //sl('getPoint: ['+type+']'+o.name);

 if(typeof o.getBounds=='function')
  return this.getBoundsZoomLevel(o.getBounds());	//	得到適當的 zoom

 //if(type=='marker')return _t.defaultZoom;
 return _t.defaultZoom;
},


initMap:function(id,latlng,f){	//	container, center, other initial setting flags
 var _t=this,_m,a;
 //	檢查當前瀏覽器是否支持地圖 API 庫
 if(GBrowserIsCompatible()){
  //	指定GMap使用的圖層 @ id
  if(typeof id=='string')id=document.getElementById(id);
  if(!id)return _t;
  _t.canvas=id;	//	container object

  if(!f)f={};
  if(!f.size)
   f.size=f.x&&f.y?[f.x,f.y]:[640,320];
  if(Array.isArray(f.size))f.size=new GSize(f.size[0],f.size[1]);

  _m=_t.map=new GMap2(id,f);//=new google.maps.Map2();
  //	設定中心點座標
  _m.setCenter(latlng||new GLatLng(0,0),7);	//	default center.
  //_m.setMapType(G_HYBRID_MAP);
  _m.addMapType(G_PHYSICAL_MAP);	//	地形圖
  _m.addMapType(G_SATELLITE_3D_MAP);	//	with the Google Earth Browser Plug-in

  //	控制元件	客制化: http://julian.norway.idv.tw/index.php/archives/322
  //_m.addControl((new GHierarchicalMapTypeControl()).addRelationship(G_SATELLITE_MAP, G_HYBRID_MAP, "Labels", true));
  //_m.removeMapType(G_HYBRID_MAP);
  _m.addControl(a=_t.overviewMap=new GOverviewMapControl(new GSize(_m.getSize().width/2.5,_m.getSize().height/2)));	//	可折疊的縮小圖
  a.hide();	//	show(), hide().
  //a.getOverviewMap().addControl(new GMenuMapTypeControl(1));	must use setTimeout: getOverviewMap() is not available until after the module has loaded.
  _m.addControl(new GLargeMapControl());	//	加入地圖縮放工具
  _m.addControl(new GMenuMapTypeControl(1));//GMapTypeControl(1)	//	切換地圖型態的按鈕
  _m.addControl(new GScaleControl());	//	地圖比例尺
  _m.enableScrollWheelZoom();
  _m.enableContinuousZoom();	//	平滑放大

  GEvent.addListener(_m,'mouseover',function(){_m.showControls();});
  GEvent.addListener(_m,'mouseout',function(){_m.hideControls();});
 }else{
  sl('<em>抱歉，您的瀏覽器不支援 Google Maps！</em>');
 }
 return _t;
},



/*	移除所有管控項
c.f.,	this.map.clearOverlays()
*/
removeAll:function(type){
 var _t=this,i,o;
 if(!type)for(i in _t.kinds)
  arguments.callee.call(this,i);
 else{
  //sl('removeAll: ('+(typeof type)+') ['+type+'], '+(typeof _t[type]));
  //o=[];for(i in _t[type])o.push(i);for(i=0;i<o.length;i++)_t.remove(o[i],type);
  for(i in _t[type])_t.remove(i,type);
  //_t[type]={};
 }
},

remove:function(n,type){
 var _S=this[type];
 if(n in _S){
  //sl('remove '+type+' ['+n+']: '+(_S[n].name||_S[n].address||_S[n].dscr));
  this.map.removeOverlay(_S[n]);
  delete _S[n];
  this.runAfterRemove(n,type);
 }
 return this;
},

//	http://econym.googlepages.com/example_context.htm
setContextMenu:function(o){
 var _t=this,_m=_t.map,h;
 if(!_m)return;

 if(typeof o!='object'){
  h=o;
  o=document.createElement('div');
  o.className='gMap_contextMenu';
  o.innerHTML=h;
 }

 if(_t.contextMenu)
  _t.contextMenu.replaceNode(o);
 else _m.getContainer().appendChild(_t.contextMenu=o)
  ,GEvent.addListener(_m,'singlerightclick',function(p,t){
   _t.clickLatLng=_m.fromContainerPixelToLatLng(_t.clickPoint=p);
   var x=p.x,y=p.y,w=_m.getSize().width-o.offsetWidth,h=_m.getSize().height-o.offsetHeight;
   if(x>w&&w>0)x=w;
   if(y>h&&h>0)y=h;
   (new GControlPosition(G_ANCHOR_TOP_LEFT,new GSize(x,y))).apply(o);
   _t.showContextMenu(1);
  });

 _t.showContextMenu(0);
 return o;
},
showContextMenu:function(v){
 var o=this.contextMenu;
 if(o)o.style.visibility=v||typeof v=='undefined'?'visible':'hidden';
},

//	get overlay
getO:function(type,name){
 var s=this[type];
 return name?name in s?s[name]:null:s;
},

//	get name of the type
getOArray:function(type){
 var i,a=[],o=this[type];
 if(o)for(i in o)a.push(i);
 return a;
},


/*
var i,t=[],o;
o=GGeoXml.prototype;//GMap2.prototype
sl('['+(typeof o)+'] '+(o+'').replace(/\n/g,'<br />')+'<hr />',1);for(i in o)t.push('['+(typeof o[i])+'] '+i);sl(t.sort().join('<br />'));

TODO:
GEvent.addListener(map,"addoverlay",function(overlay){if(overlay.name){}});
*/
loadXML:function(URL){
 var _t=this,x=new GGeoXml(URL);
 //	.getDefaultCenter(), .getDefaultBounds() 可能是 null
 _t.setCenter({p:x.getDefaultCenter(),z:x.getDefaultBounds(),m:'pan'});
 _t.map.addOverlay(x);
 return _t.xml[URL]=x;
},

//resize map
resize:function(x,y){
 with(this.map.getContainer().style)
  width=x+'px',height=y+'px';
},

//	去除商標, Copyright message
removeTM:function(l){
 var a=this.canvas;
 if(!a)return;
 a=library_namespace.get_tag_list('a'),i=a.length,t=1;
 //sl('removeTM: '+UnicodeToHTML(document.getElementById('map_canvas').innerHTML));
 for(;i>0&&(t||l);){
  i--;
  //	http://www.google.com/intl/en_ALL/help/terms_maps.html
  if(t && a[i].href.indexOf('terms_maps')!=-1 && a[i].parentNode.tagName.toLowerCase()=='div'){
   //sl('removeTM: remove copyright: '+a[i].href);
   //sl('removeTM: remove copyright: '+UnicodeToHTML(a[i].parentNode.innerHTML));
   removeNode(a[i].parentNode,1);	//	連這div都刪除會有奇怪現象發生
   t=0;
  }else if(l && a[i].innerHTML.indexOf('poweredby.png')!=0){
   //sl('removeTM: remove logo: '+UnicodeToHTML(a[i].parentNode.innerHTML));
   removeNode(a[i].parentNode,1);
   l=0;
  }
 }
}

};	//	_.prototype=


return _;
})();	//	(function(){

//	===================================================


/*	2008/9-10/1
	搜尋用代理工具

usage:
google.load("search","1",{language:"ja_JP",callback:loadSearch});
function loadSearch(){
 gSearch=new getSearch(function(r,p){
  sl('<a href="'+r.unescapedUrl+'">'+r.title+'</a><br /><div style="margin-left:3em;font-size:.8em;">'+r.content+'</div>');
 });
}
 
 
TODO:
Yahoo! Search BOSS	http://developer.yahoo.com/search/boss/

LocalSearch:
http://www.google.com/uds/samples/apidocs/static-tiles.html
http://code.google.com/apis/ajaxsearch/documentation/reference.html#_class_GlocalSearch

*/
function getSearch(fn,kind){	//	handle function, kind: Web/Local
 if(!kind)kind='Web';
 var _t=this,_s=typeof google!='undefined'?google.search:0;
 if(!_s||!_s[kind+'Search'])return;
 _s=_t.searcher=new _s[kind+'Search']();

 if(kind=='Local'){
  //sl('Set center: '+'Taiwan');
  _s.setCenterPoint('台灣');//Taiwan
  _s.setResultSetSize(google.search.Search.LARGE_RESULTSET);
  //_s.setCenterPoint("93108");
 }else{
  _s.setNoHtmlGeneration();
  //.addSearcher(_s,(new google.search.SearcherOptions()).setExpandMode(google.search.SearchControl.EXPAND_MODE_OPEN));
 }

 _s.setResultSetSize(google.search.Search.LARGE_RESULTSET);

 _s.setSearchCompleteCallback(_t,_t.searchComplete[kind],[_s]);
 if(fn)_t.sf=fn;
 return _t;
}
getSearch.prototype={

//	country translate
countryT:{Taiwan:'台灣'},

searchComplete:{
Local:function(searcher){
 var r=searcher.results,i=0,a,b,j;
 if(r&&r.length>0)for(;i<r.length;i++){
  o=r[i],a=o.country;
  if(a in this.countryT)a=this.countryT[a];
  o.address=a+o.region+o.city+o.streetAddress;
  o.phone=[];
  if(a=o.phoneNumbers)
   for(j=0;j<a.length;j++)
    o.phone.push((a[j].type?a[j].type+': ':'')+a[j].number);
  this.sf(o);
 }
/*
	var imageUrl = GlocalSearch.computeStaticMapUrl(searcher.results, 350, 400);
	document.getElementById("resultsImg").src = imageUrl;
*/
},
Web:function(searcher){
 var s=searcher,p=s.cursor.currentPageIndex,i=0,r=s.results;
 //sl('<hr />page '+p+':');
 if(r&&r.length)for(;i<r.length;i++)
  this.sf(r[i],p);
 s.gotoPage(p+1);	//	這會一直執行到不能執行為止。(2008/7: 0-3)
}

},	//	searchComplete


//	handle function
sf:function(r,p){
},

s:function(w){
 //sl('getSearch: search ['+w+']');
 if(w)this.searcher.execute(w);
}

};








return (
	_// JSDT:_module_
);
}


});

