
/**
 * @name	CeL function for Ajax (Asynchronous JavaScript and XML)
 * @fileoverview
 * 本檔案包含了 Ajax 用的 functions。
 * @since	2015/1/1
 */

'use strict';
if (typeof CeL === 'function')
CeL.run({
name : 'application.net.Ajax',
code : function(library_namespace) {

//	no requiring

/**
 * null module constructor
 * @class	web Ajax 的 functions
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



//---------------------------------------------------------------------//
//	XMLHttp set	ajax通信処理ライブラリ	==================



/*
to use: include in front:
way1(good: 以reg代替functionPath!):
//	[function.js]_iF
//	[function.js]End

way2(old):
//	[function.js]getU,functionPath,'eval(getU(functionPath));'
//	[function.js]End

old:
function getU(p){var o;try{o=new ActiveXObject('Microsoft.XMLHTTP');}catch(e){o=new XMLHttpRequest();}if(o)with(o){open('GET',p,false),send(null);return responseText;}}
*/



/**
 * JScript or .wsh only, 能 encode.
 * 
 * @param page_url
 *            page url
 * @param encoding
 *            encoding
 * @param POST_text
 *            POST text
 * @returns {String}
 * @see http://neural.cs.nthu.edu.tw/jang/books/asp/getWebPage.asp?title=10-1%20%E6%8A%93%E5%8F%96%E7%B6%B2%E9%A0%81%E8%B3%87%E6%96%99
 */
function get_page(page_url, encoding, POST_text) {
	try {
		// may cause error
		var X = new ActiveXObject('Microsoft.XMLHTTP'), AS;
		X.open(POST_text ? 'POST' : 'GET', page_url, false);
		// POST need this
		X.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		// Download the file
		X.send(POST_text || null);
		AS = new ActiveXObject("ADODB.Stream");
		// 可同時進行讀寫
		AS.Mode = 3;
		// 以二進位方式操作
		AS.Type = 1;
		// 開啟物件
		AS.Open();
		// 將 binary 的資料寫入物件內 may error
		AS.Write(X.responseBody);
		AS.Position = 0;
		// 以文字模式操作
		AS.Type = 2;
		// 設定編碼方式
		if (encoding)
			AS.Charset = encoding;
		// 將物件內的文字讀出
		X = AS.ReadText();
		// free
		AS = null;
		return X;
	} catch (e) {
		library_namespace.warn('get_page: ' + e.message);
	}
}

//---------------------------------------------------------------------//

if (false)
	// default arguments
	var get_URL_arguments = {
		URL : '',
		encoding : '',
		// HTTP方法，如"GET", "POST", HEAD, "PUT", "DELETE"等。
		method : 'GET',
		post : {},
		async : true,
		// user name. 驗證用使用者名稱。
		user : '',
		// 驗證用密碼。
		password : '',
		// header
		head : {
			contentType : 'text/xml'
		},
		// location.search
		search : {
			contentType : 'text/xml'
		},
		// location.hash
		hash : '',
		mime : 'text/xml',
		// onreadystatechange
		onchange : function() {
		},
		timeout : 0,
		onfail : function(error) {
			this.status;
		},
		onload : function() {
		}
	};


//	XMLHttp.readyState 所有可能的值如下：
//	0 還沒開始
//	1 讀取中 Sending Data
//	2 已讀取 Data Sent
//	3 資訊交換中 interactive: getting data
//	4 一切完成 Completed
var readyState_done = 4,
//
document_head = library_namespace.is_WWW(true) && (document.head || document.getElementsByTagName('head')[0]);




/**
 * 讀取 URL via XMLHttpRequest。
 * 
 * @param {String|Object}URL
 *            請求目的URL or options
 * @param {Function}[onload]
 *            callback when successful loaded
 * @param {String}[encoding]
 *            encoding. e.g., 'UTF-8', big5, euc-jp,..
 * @param {String|Object}[post_data]
 *            text data to send when method is POST
 * 
 * @see
 * https://developer.mozilla.org/zh-TW/docs/DOM/XMLHttpRequest
 * http://msdn.microsoft.com/en-us/library/ie/ms535874.aspx
 */
function get_URL(URL, onload, encoding, post_data) {
	// 前導作業。
	if (library_namespace.is_Object(encoding)) {
		post_data = encoding;
		encoding = null;
	}
	var options;
	if (library_namespace.is_Object(URL) && URL.URL) {
		onload = URL.onload || onload;
		post_data = URL.post || post_data;
		encoding = URL.encoding || encoding;
		URL = (options = URL).URL;
	} else
		options = library_namespace.null_Object();

	// https://developer.mozilla.org/en-US/docs/Web/API/URL
	// [ origin + pathname, search, hash ]
	// hrer = [].join('')
	if (Array.isArray(URL))
		URL = get_URL.add_param(URL[0], URL[1], URL[2]);

	if (options.search || options.hash)
		URL = get_URL.add_param(URL, options.search, options.hash);

	library_namespace.debug('URL: (' + (typeof URL) + ') [' + URL + ']', 3, 'get_URL');

	if (typeof onload === 'object') {
		library_namespace.debug('Trying to JSONP, insert page, need callback.', 3, 'get_URL');
		//library_namespace.run(URL);
		for (var callback_param in onload) {
			library_namespace.debug('Trying (' + (typeof onload[callback_param]) + ') [' + callback_param + '] = [' + onload[callback_param] + ']', 3, 'get_URL');
			if (callback_param && typeof onload[callback_param] === 'function') {
				var callback_name,
				node = document.createElement('script');
				for (encoding = 0; (callback_name = 'cb' + encoding) in library_namespace;)
					encoding++;
				library_namespace[callback_name] = function(data) {
					library_namespace.debug('[' + URL + ']: callback 完自動移除 .js。', 2, 'get_URL');
					document_head.removeChild(node);
					// release
					node = null;
					delete library_namespace[callback_name];
					onload[callback_param](data);
				};
				// callback_param: callback parameter
				node.src = URL + '&' + callback_param + '=' + library_namespace.Class + '.' + callback_name;
				library_namespace.debug('Use script node: [' + node.src + ']', 3, 'get_URL');
				document_head.appendChild(node);
				return;
			}
		}
		library_namespace.debug('Skip JSONP. No callback setted.', 3, 'get_URL');
	}

	if (post_data)
		post_data = get_URL.param_to_String(post_data);

	if (!onload && typeof options.onchange === 'function')
		onload = function() {
			options.onchange(readyState_done, XMLHttp);
		};

	if (options.async === false && onload
			|| typeof onload !== 'function')
		onload = false;

	/**
	 * The XMLHttpRequest object can't be cached.
	 */
	var XMLHttp = library_namespace.new_XMLHttp();

	try {
		// IE:404會throw error, timeout除了throw error, 還會readystatechange; Gecko亦會throw error
		// IE 10 中，local file 光 .open() 就 throw 了。
		XMLHttp.open(options.method || (post_data ? 'POST' : 'GET'), URL,
				!!onload, options.user || '', options.password || '');

		if (options.timeout > 0 && !onload) {
			XMLHttp.timeout = options.timeout;
			if (typeof options.onfail === 'function')
				XMLHttp.ontimeout = function() {
					options.onfail(XMLHttp);
				};
		}
		// TODO: 處理有 onload 下之 timeout
		//	Ajax 程式應該考慮到 server 沒有回應時之處置

		if (library_namespace.is_Object(options.head)
				&& XMLHttp.setRequestHeader)
			Object.keys(options.head).forEach(function(key) {
				XMLHttp.setRequestHeader(key, options.head[key]);
			});

		if (options.mime)
			// ignore encoding!
			encoding = options.mime;
		else if (encoding)
			// old: 'text/xml;charset=' + encoding
			// 但這樣會被當作 XML 解析，產生語法錯誤。
			// TODO: try: 'text/'+(/\.x(ht)?ml$/i.test(URL)?'xml':'plain')+';charset=' + encoding;
			encoding = 'application/json;charset=' + encoding;

		// 有些版本的 Mozilla 瀏覽器在伺服器送回的資料未含 XML mime-type
		// 檔頭（header）時會出錯。為了避免這個問題，可以用下列方法覆寫伺服器傳回的檔頭，以免傳回的不是 text/xml。
		// http://squio.nl/blog/2006/06/27/xmlhttprequest-and-character-encoding/
		// http://www.w3.org/TR/XMLHttpRequest/ search encoding
		if (encoding && XMLHttp.overrideMimeType)
			XMLHttp.overrideMimeType(encoding);

		if (onload)
			XMLHttp.onreadystatechange = function() {
				if (XMLHttp.readyState === readyState_done)
					return onload(XMLHttp);

				if (0 < XMLHttp.readyState && XMLHttp.readyState < readyState_done) {
					if (typeof options.onchange === 'function')
						options.onchange(XMLHttp.readyState, XMLHttp);
				} else if (typeof options.onfail === 'function')
					options.onfail(XMLHttp);
			};

		// 若檔案不存在，會 throw。
		XMLHttp.send(post_data || null);

		if (!onload)
			// XMLHttp.responseText	會把傳回值當字串用
			// XMLHttp.responseXML	會把傳回值視為 XMLDocument 物件，而後可用 JavaScript DOM 相關函式處理
			//	IE only(?):
			//	XMLHttp.responseBody	以unsigned array格式表示binary data
			//				try{responseBody=(new VBArray(XMLHttp.responseBody)).toArray();}catch(e){}
			//				http://aspdotnet.cnblogs.com/archive/2005/11/30/287481.html
			//	XMLHttp.responseStream	return AdoStream
			return XMLHttp.responseText;

	} catch (e) {
		library_namespace.err(e);
		if (typeof options.onfail === 'function')
			options.onfail(XMLHttp, e);
	}

}


// parameters to String
// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
get_URL.param_to_String = function(param) {
	if (library_namespace.is_Object(param)) {
		var array = [];
		library_namespace.debug(Object.keys(param).join(','), 3, 'get_URL.param_to_String');
		Object.keys(param).forEach(function(key) {
			library_namespace.debug(key, 4, 'get_URL.param_to_String.forEach');
			array.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(param[key])));
		});
		library_namespace.debug(array.length + ' parameters:<br />\n' + array.join('<br />\n'), 3, 'get_URL.param_to_String');
		return array.join('&');
	}

	// '' + param
	return param && String(param) || '';
};


get_URL.add_param = function(URL, search, hash) {
	if (search || hash) {
		URL = URL.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
		if (search = get_URL.param_to_String(search)) {
			if (search.startsWith('?')) {
				if (URL[2])
					search = URL[2] + '&' + search.slice(1);
			} else
				search = (URL[2] ? URL[2] + '&' : '?') + search;
		} else
			search = URL[2] || '';

		if (hash = get_URL.param_to_String(hash)) {
			if (!hash.startsWith('#'))
				hash = '#' + hash;
			hash = (URL[3] || '') + hash;
		} else
			hash = URL[3] || '';

		URL = URL[1] + search + hash;
	}

	return URL;
};

_.get_URL = get_URL;


// TODO: 處理 multi requests
function get_URLs() {
}


//---------------------------------------------------------------------//

/*

*/


/*	讀取URL by XMLHttpRequest
	http://jck11.pixnet.net/blog/post/11630232

* 若有多行程或為各URL設定個別XMLHttp之必要，請在一開始便設定deprecated_get_URL.multi_request，並且別再更改。
** 在此情況下，單一URL仍只能有單一個request!
** 設定 handle_function 須注意程式在等待回應時若無執行其他程式碼將自動中止！
	可設定：
	while(deprecated_get_URL.doing)WScript.Sleep(1);	//||timeout

arguments f:{
	URL:'',	//	The same origin policy prevents document or script loaded from one origin, from getting or setting properties from a of a document from a different origin.(http://www.mozilla.org/projects/security/components/jssec.html#sameorigin)
	enc:'UTF-8',	//	encoding: big5, euc-jp,..
	fn:(handle_function),	//	onLoad:function(){},
	method:'GET',	//	POST,..
	sendDoc:'text send in POST,..'
	async:ture/false,	//	true if want to asynchronous(非同期), false if synchronous(同期的,會直到readyState==4才return)	http://jpspan.sourceforge.net/wiki/doku.php?id=javascript:xmlhttprequest:behaviour
	user:'userName',
	passwd:'****',	//	password

 //TODO:
	parameters:'~=~&~=~', // {a:1,b:2}
	header:{contentType:'text/xml'},
	contentType:'text/xml',
	run:true/false,	//	do eval
	update:DOMDocument,	//	use onLoad/onFailed to 加工 return text. onFailed(){throw;} will about change.
	interval:\d,
	decay:\d,	//	wait decay*interval when no change
	maxInterval::\d,
	//insertion:top/bottom,..
	onFailed:function(error){this.status;},	//	onFailed.apply(XMLHttp,[XMLHttp.status])
	onStateChange:function(){},
 }


handle_function:
自行處理	typeof handle_function=='function':
function handle_function(error){..}
代為處理	handle_function=[d_func,0: responseText,1: responseXML]:
	responseXML:	http://msdn2.microsoft.com/en-us/library/ms757878.aspx
function d_func(content,head[,XMLHttp,URL]){
 if(head){
  //	content,head各為XMLHttp.responseText內容及XMLHttp.getAllResponseHeaders()，其他皆可由XMLHttp取得。
 }else{
  //	content為error
 }
}
e.g., the simplest: [function(c,h){h&&alert(c);}]

)
*/
function deprecated_get_URL(f){	//	(URL,fn) or flag			URL, handle_function handle result, method,sendDoc,asyncFlag,userName,password
 var _f=arguments.callee;
 if(typeof _f.XMLHttp=='object'){
  //try{_f.XMLHttp.abort();}catch(e){}
  _f.XMLHttp=null;	//	此時可能衝突或lose?!
 }
 //	處理 arguments
 if(!library_namespace.is_Object(f))
  a=arguments,f={URL:f,fn:a[1],method:a[2],sendDoc:a[3]};
 if(f.post)
  f.method='POST',f.sendDoc=f.post;

 if(!f.URL||!(_f.XMLHttp=library_namespace.new_XMLHttp(f.enc,!/\.x(?:ht)?ml$/i.test(f.URL))))return;//throw
 
 //try{_f.XMLHttp.overrideMimeType('text/xml');}catch(e){}
 if(typeof f.async!='boolean')
  //	設定f.async
  f.async=f.fn?true:false;
 else if(!f.async)f.fn=null;
 else if(!f.fn)
  if(typeof _f.HandleStateChange!='function'||typeof _f.HandleContent!='function')
   // 沒有能處理的function
   return;//throw
  else
   f.fn=_f.HandleContent;//null;
 if(/*typeof _f.multi_request!='undefined'&&*/_f.multi_request){
  if(!_f.q)_f.i={},_f.q=[];	//	queue
  _f.i[f.URL]=_f.q.length;	//	** 沒有考慮到 POST 時 URL 相同的情況!
  _f.q.push({uri:f.URL,XMLHttp:_f.XMLHttp,func:f.fn,start:_f.startTime=new Date});
 }else if(_f.q&&typeof _f.clean=='function')_f.clean();

 //	for Gecko Error: uncaught exception: Permission denied to call method XMLHttpRequest.open
 if(f.URL.indexOf('://')!=-1&&typeof netscape=='object')
  if(_f.asked>2){_f.clean(f.URL);return;}
  else try{
   if(typeof _f.asked=='undefined')
    _f.asked=0,alert('我們需要一點權限來使用 XMLHttpRequest.open。\n* 請勾選記住這項設定的方格。');
   netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
  }catch(e){_f.asked++;_f.clean(f.URL);return;}//UniversalBrowserAccess

 //if(isNaN(_f.timeout))_f.timeout=300000;//5*60*1000;
 try{	//	IE:404會throw error, timeout除了throw error, 還會readystatechange; Gecko亦會throw error
  try{_f.XMLHttp.setRequestHeader("Accept-Encoding","gzip,deflate");}catch(e){}
  //	Set header so the called script knows that it's an XMLHttpRequest
  //_f.XMLHttp.setRequestHeader("X-Requested-With","XMLHttpRequest");
  //	Set the If-Modified-Since header, if ifModified mode.
  //_f.XMLHttp.setRequestHeader("If-Modified-Since","Thu, 01 Jan 1970 00:00:00 GMT");
  if(f.method=='POST'){//&&_f.XMLHttp.setRequestHeader
   //_f.XMLHttp.setRequestHeader("Content-Length",f.sendDoc.length);	//	use .getAttribute('method') to get	長度不一定如此
   //	有些CGI會用Content-Type測試是XMLHttp或是regular form
   //	It may be necessary to specify "application/x-www-form-urlencoded" or "multipart/form-data" for posted XML data to be interpreted on the server.
   _f.XMLHttp.setRequestHeader('Content-Type',Array.isArray(f.fn)&&f.fn[1]?'text/xml':'application/x-www-form-urlencoded');	//	application/x-www-form-urlencoded;charset=utf-8
  }
  _f.XMLHttp.abort();
  _f.XMLHttp.open(f.method||'GET',f.URL,f.async,f.user||null,f.passwd||null);
  //alert((f.method||'GET')+','+f.URL+','+f.async);
  //	 根據 W3C的 XMLHttpRequest 規格書上說，①在呼叫 open 時，如果readyState是4(Loaded) ②呼叫abort之後 ③發生其他錯誤，如網路問題，無窮迴圈等等，則會重設所有的值。使用全域的情況就只有第一次可以執行，因為之後的readyState是4，所以onreadystatechange 放在open之前會被清空，因此，onreadystatechange 必須放在open之後就可以避免這個問題。	http://www.javaworld.com.tw/jute/post/view?bid=49&id=170177&sty=3&age=0&tpg=1&ppg=1
  //	每使用一次XMLHttpRequest，不管成功或失敗，都要重設onreadystatechange一次。onreadystatechange 的初始值是 null
  //	After the initial response, all event listeners will be cleared. Call open() before setting new event listeners.	http://www.xulplanet.com/references/objref/XMLHttpRequest.html
  if(f.async)
	_f.doing=(_f.doing||0)+1,
	_f.XMLHttp.onreadystatechange=typeof f.fn=='function'?f.fn:function(e){_f.HandleStateChange(e,f.URL,f.fn);},//||null
	//	應加 clearTimeout( )
	setTimeout('try{deprecated_get_URL.'+(_f.multi_request?'q['+_f.i[f.URL]+']':'XMLHttp')+'.onreadystatechange();}catch(e){}',_f.timeout||3e5);//5*60*1000;
  _f.XMLHttp.send(f.sendDoc||null);
  if(!f.fn)return _f.XMLHttp.responseText;//responseXML: responseXML.loadXML(text)	//	非async(異步的)能在此就得到response。Safari and Konqueror cannot understand the encoding of text files!	http://www.kawa.net/works/js/jkl/parsexml.html
 }catch(e){if(typeof f.fn=='function')f.fn(e);else if(typeof window=='object')window.status=e.message;return e;}
}
deprecated_get_URL.timeoutCode=-7732147;

//	agent handle function
deprecated_get_URL.HandleStateChange=function(e,URL,handle_function){	//	e: object Error, handle_function: function(return text, heads, XMLHttpRequest object, URL) | [ function, (default|NULL:responseText, others:responseXML) ]
 var _t=0,isOKc,m=deprecated_get_URL.multi_request,_oXMLH;
 if(m)m=deprecated_get_URL.q[isNaN(URL)?deprecated_get_URL.i[URL]:URL],_oXMLH=m.XMLHttp,handle_function=m.func,URL=m.uri;else _oXMLH=deprecated_get_URL.XMLHttp;
 if(Array.isArray(handle_function))_t=handle_function[1],handle_function=handle_function[0];
 if(!handle_function || typeof handle_function!='function'){deprecated_get_URL.doing--;deprecated_get_URL.clean(URL);return;}
 //	http://big5.chinaz.com:88/book.chinaz.com/others/web/web/xml/index1/21.htm
 if(!e)
  if(typeof _oXMLH=='object'&&_oXMLH){
   if(_oXMLH.parseError&&_oXMLH/*.responseXML*/.parseError.errorCode!=0)
    e=_oXMLH.parseError,e=new Error(e.errorCode,e.reason);
   else if(_oXMLH.readyState==4){	//	only if XMLHttp shows "loaded"
    isOKc=_oXMLH.status;	//	condition is OK?
    isOKc=isOKc>=200&&isOKc<300||isOKc==304||!isOKc&&(location.protocol=="file:"||location.protocol=="chrome:");
    if(handle_function==deprecated_get_URL.HandleContent)handle_function(0,isOKc,_oXMLH,URL);//handle_function.apply()
    else handle_function(
	isOKc?_t?_oXMLH.responseXML:
		//	JKL.ParseXML: Safari and Konqueror cannot understand the encoding of text files.
		typeof window=='object'&&window.navigator.appVersion.indexOf("KHTML")!=-1&&!(e=escape(_oXMLH.responseText)).indexOf("%u")!=-1?e:_oXMLH.responseText
	:0
	,isOKc?_oXMLH.getAllResponseHeaders():0,_oXMLH,URL);//handle_function.apply()
    //	URL之protocol==file: 可能需要重新.loadXML((.responseText+'').replace(/<\?xml[^?]*\?>/,""))
    //	用 .responseXML.documentElement 可調用
    deprecated_get_URL.doing--;deprecated_get_URL.clean(URL);
    return;
   }
  }else if(new Date-(m?m.start:deprecated_get_URL.startTime)>deprecated_get_URL.timeout)
   //	timeout & timeout function	http://www.stylusstudio.com/xmldev/199912/post40380.html
   e=new Error(deprecated_get_URL.timeoutCode,'Timeout!');//_oXMLH.abort();
 //alert(URL+'\n'+_t+'\n'+e+'\n'+_oXMLH.readyState+'\n'+handle_function);
 if(e){handle_function(e,0,_oXMLH,URL);deprecated_get_URL.doing--;deprecated_get_URL.clean(URL);}//handle_function.apply(e,URL);
};

/*	agent content handle function
有head時content包含回應，否則content表error
*/
deprecated_get_URL.HandleContent=function(content,head,_oXMLHttp,URL){
 if(head){
  // _oXMLHttp.getResponseHeader("Content-Length")
  alert("URL:	"+URL+"\nHead:\n"+_oXMLHttp.getAllResponseHeaders()+"\n------------------------\nLastModified: "+_oXMLHttp.getResponseHeader("Last-Modified")+"\nResult:\n"+_oXMLHttp.responseText.slice(0,200));//_oXMLHttp.responseXML.xml
 }else{
  //	error	test時，可用deprecated_get_URL.XMLHttp.open("HEAD","_URL_",true);，deprecated_get_URL(url,handle_function,'HEAD',true)。
  if(content instanceof Error)alert('Error occured!\n'+(typeof e=='object'&&e.number?e.number+':'+e.message:e||''));
  else if(typeof _oXMLHttp=='object'&&_oXMLHttp)alert((_oXMLHttp.status==404?"URL doesn't exist!":'Error occured!')+'\n\nStatus: '+_oXMLHttp.status+'\n'+_oXMLHttp.statusText);
 }
};

//	在MP模式下清乾淨queue
deprecated_get_URL.clean=function(i,force){
 if(force||deprecated_get_URL.multi_request)
  if(!i&&isNaN(i)){
   if(deprecated_get_URL.q)
    for(i in deprecated_get_URL.i)
     try{
      deprecated_get_URL.q[deprecated_get_URL.i[i]].XMLHttp.abort();
      //deprecated_get_URL.q[deprecated_get_URL.i[i]].XMLHttp=null;
     }catch(e){}
   deprecated_get_URL.q=deprecated_get_URL.i=0;//null
  }else if(!isNaN(i)||!isNaN(i=deprecated_get_URL.i[typeof i=='object'?i.uri:i])){
   try{deprecated_get_URL.q[i].XMLHttp.abort();}catch(e){};
   //deprecated_get_URL.q[i].XMLHttp=0;
   delete deprecated_get_URL.i[deprecated_get_URL.q[i].uri];deprecated_get_URL.q[i]=0;
  }
};


//	↑XMLHttp set	==================
//---------------------------------------------------------------------//


var node_url, node_http, node_https,
// reuse the sockets (keep-alive connection).
node_http_agent, node_https_agent;


// 快速 merge cookie: 只檢查若沒有重複的，則直接加入。不檢查也不處理。
function merge_cookie(agent, cookie) {
	if (!Array.isArray(agent.last_cookie))
		agent.last_cookie = agent.last_cookie ? [ agent.last_cookie ] : [];
	if (!Array.isArray(cookie))
		cookie = cookie ? [ cookie ] : [];
	cookie.forEach(function(piece) {
		if (!agent.last_cookie.includes(piece))
			agent.last_cookie.push(piece);
	});
	return agent.last_cookie;
}


/**
 * 讀取 URL via node http/https。<br />
 * assert: arguments 必須與 get_URL() 相容！
 * 
 * @param {String|Object}URL
 *            請求目的URL or options
 * @param {Function}[onload]
 *            callback when successful loaded
 * @param {String}[encoding]
 *            encoding. e.g., 'utf8', big5, euc-jp,..
 * @param {String|Object}[post_data]
 *            text data to send when method is POST
 * 
 * @see
 * http://nodejs.org/api/http.html#http_http_request_options_callback
 * http://nodejs.org/api/https.html#https_https_request_options_callback
 * 
 * @since	2015/1/13 23:23:38
 */
function get_URL_node(URL, onload, encoding, post_data) {
	// 前導作業。
	if (library_namespace.is_Object(encoding)) {
		post_data = encoding;
		encoding = null;
	}
	var options;
	if (library_namespace.is_Object(URL) && URL.URL) {
		onload = URL.onload || onload;
		post_data = URL.post || post_data;
		encoding = URL.encoding || encoding;
		URL = (options = URL).URL;
	} else
		options = library_namespace.null_Object();

	// https://developer.mozilla.org/en-US/docs/Web/API/URL
	// [ origin + pathname, search, hash ]
	// hrer = [].join('')
	if (Array.isArray(URL))
		URL = get_URL.add_param(URL[0], URL[1], URL[2]);

	if (options.search || options.hash)
		URL = get_URL.add_param(URL, options.search, options.hash);

	library_namespace.debug('URL: (' + (typeof URL) + ') ' + URL, 3, 'get_URL_node');

	if (typeof onload === 'object')
		// use JSONP.
		// need callback.
		for (var callback_param in onload)
			if (callback_param && typeof onload[callback_param] === 'function') {
				// 模擬 callback。
				URL += '&' + callback_param + '=cb';
				onload = onload[callback_param];
				break;
			}

	if (post_data)
		post_data = get_URL.param_to_String(post_data);

	if (!onload && typeof options.onchange === 'function')
		onload = function() {
			options.onchange(readyState_done);
		};

	if (options.async === false && onload
			|| typeof onload !== 'function')
		onload = false;

	var request, _URL = node_url.parse(URL),
	//
	agent = _URL.protocol === 'https:' ? node_https_agent : node_http_agent,
	//
	_onload = function(result) {
		library_namespace.debug('STATUS: ' + result.statusCode, 2, 'get_URL_node');
		library_namespace.debug('HEADERS: ' + JSON.stringify(result.headers), 4, 'get_URL_node');
		merge_cookie(agent, result.headers['set-cookie']);
		// 未設定 encoding 的話，將回傳 Buffer。
		if (encoding !== 'binary')
			// default encoding: UTF-8.
			result.setEncoding(encoding || 'utf8');
		// listener must be a function
		if (typeof onload === 'function') {
			var chunk = [];
			result.on('data', function(data) {
				library_namespace.debug('receive BODY.length: ' + data.length, 3, 'get_URL_node');
				chunk.push(data);
			});
			// https://iojs.org/api/http.html#http_http_request_options_callback
			result.on('end', function() {
				//console.log('No more data in response.');
				if (encoding !== 'binary')
					chunk = chunk.join('');
				else {
					//TODO:  (binary)
				}
				if (library_namespace.is_debug(4))
					library_namespace.debug('BODY: ' + chunk, 1, 'get_URL_node');
				// 模擬 XMLHttp。
				onload({
					responseText : chunk
				});
				// free
				chunk = null;
			});
		} else {
			library_namespace.warn('get_URL_node: get [' + URL + '], but no listener!');
			//console.log(result);
		}
	};

	if (post_data) {
		_URL.method = 'POST';
		_URL.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			// prevent HTTP 411 錯誤 – 需要內容長度頭 (411 Length Required)
			'Content-Length': post_data.length
		};
	}

	_URL.agent = agent;
	if (agent.last_cookie) {
		if (!_URL.headers)
			_URL.headers = {};
		library_namespace.debug('Set cookie: ' + JSON.stringify(agent.last_cookie), 3, 'get_URL_node');
		// cookie is Array @ Wikipedia
		_URL.headers.Cookie = Array.isArray(agent.last_cookie) ? agent.last_cookie.join(';') : agent.last_cookie;
	}
	request = _URL.protocol === 'https:' ? node_https.request(_URL, _onload) : node_http.request(_URL, _onload);

	if (typeof options.onfail === 'function')
		request.on('error', options.onfail);

	if (post_data)
		request.write(post_data);

	request.end();
}


if (library_namespace.is_node) {
	node_url = require('url');
	node_http = require('http');
	node_https = require('https');

	node_http_agent = new node_http.Agent;
	node_https_agent = new node_https.Agent;
	// 不需要。
	//node_http_agent.maxSockets = 1;
	//node_https_agent.maxSockets = 1;

	_.get_URL = library_namespace.copy_properties(get_URL, get_URL_node);
}


//---------------------------------------------------------------------//

return (
	_// JSDT:_module_
);
}


});

