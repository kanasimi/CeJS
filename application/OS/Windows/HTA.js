
/**
 * @name	CeL function for HTML Applications (HTAs)
 * @fileoverview
 * 本檔案包含了 Microsoft Windows HTML Applications (HTAs) 的 functions。
 * @since	
 */

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name:'application.OS.Windows.HTA',
// includes() @ data.code.compatibility.
require : 'data.code.compatibility.|interact.DOM.select_node|interact.DOM.fill_form',
code : function(library_namespace) {

//	requiring
var select_node = this.r('select_node'), fill_form = this.r('fill_form');




/**
 * null module constructor
 * @class	web HTA 的 functions
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



/*	
TODO:
JavaScript closure and IE 4-6 memory leak
Mozilla ActiveX Project	http://www.iol.ie/%7Elocka/mozilla/mozilla.htm
IE臨時文件的位置可以從註冊表鍵值 HKLM\Software\Microsoft\Windows\CurrentVersion\Internet Settings\Cache\paths\Directory 中讀取。
*/

_// JSDT:_module_
.
/**
 * Internet Explorer Automation tool
 * @param {String} [URL]	initial URL
 * @returns {IEA}
 * @_memberOf	_module_
 * @see	http://msdn.microsoft.com/en-us/library/aa752084(v=vs.85).aspx
 */
IEA = function (URL) {

	try {
/*	COM objects
WScript.CreateObject("InternetExplorer.Application","Event_");
new ActiveXObject(class[, servername]);

http://www.cnblogs.com/xdotnet/archive/2007/04/09/javascript_object_activexobject.html
var obj=new ActiveXObject(servername,typename[,location]);
servername提供該對象的應用程序名稱；
typename要創建的對象地類型或類；
location創建該對象得網絡服務器名稱。
*/
		this.app = new ActiveXObject("InternetExplorer.Application");
	} catch (e) {
		library_namespace
			.error('IEA: No InternetExplorer.Application object created!');
	}
	if (!this.app)
		return;

	//	要先瀏覽了網頁，才能實行 IEApp.Document其他功能。
	this.go(URL || '');

	return this;

/*	other functions
http://msdn2.microsoft.com/en-us/library/aa752085.aspx
http://msdn2.microsoft.com/en-us/library/Aa752084.aspx
IEApp.Visible=true;
IEApp.Offline=true;
IEApp.Document.frames.prompt();
*/
};

/**
 * get <frame>
 * @param document_object	document object
 * @param name	frame name
 * @returns
 */
_.IEA.frame = function(document_object, name) {
	try {
		document_object = document_object.getElementsByTagName('frame');
		return name ? document_object[name].contentWindow.document : document_object;
	} catch (e) {
		// TODO: handle exception
	}
};

_.IEA.prototype = {
	/**
	 * 本 IEA 之 status 是否 OK.<br />
	 * 以有無視窗，否則以有無內容判別是否 OK.<br />
	 * 關掉視窗時， typeof this.app.Visible=='unknown'
	 * @param w	window object
	 * @returns
	 */
	OK : function(w) {
		try {
			if (w ? typeof this.app.Visible === 'boolean'
					: this.doc().body.innerHTML)
				return this.app;
		} catch (e) {
			// TODO: handle exception
		}
	},
	autoSetBase : true,
	baseD : '',
	baseP : '',
	//init_url : 'about:blank',
	timeout : 3e4, // ms>0
	setBase : function(URL) {
		var m = (URL || '').match(/^([\w\-]+:\/\/[^\/]+)(.*?)$/);
		if (m) {
			this.baseD = m[1];
			this.baseP = m[2].slice(0, m[2].lastIndexOf('/') + 1);
		}
		//WScript.Echo('IEA.setBase:\ndomin: '+this.baseD+'\npath: '+this.baseP);
		return this.baseD;
	},
	/**
	 * go to URL. 注意: 若是 .go('URL#hash') 則可能無反應，須改成 .go('URL')。
	 * @param URL	URL or history num
	 * @returns
	 */
	go : function(URL) {
		try {
			if (URL === '' || isNaN(URL)) {
				if (URL === '')
					URL = 'about:blank';// this.init_url;

				if (URL) {
					if (!URL.includes(':')
							//!URL.includes('://') && !URL.includes('about:')
							) {
						//	預防操作中 URL 已經改了。
						this.setBase(this.href());
						URL = this.baseD + (URL.charAt(0) === '/' ? '' : this.baseP) + URL;
					}

					//	IEApp.Document.frames.open(URL);	**	請注意：這裡偶爾會造成script停滯，並跳出警告視窗！
					this.app.Navigate(URL);

					if (this.autoSetBase)
						this.setBase(URL);
					this.wait();

					//	防止自動關閉: don't work
					//this.win().onclose=function(){return false;};//this.win().close=null;

					if(library_namespace.is_debug())
						this.parse_frame();
				}
			} else {
				this.win().history.go(URL);
				this.wait();
			}

		} catch (e) {
			// TODO: handle exception
		}
		return this;
	},
/*	完全載入
TODO:
http://javascript.nwbox.com/IEContentLoaded/
try{document.documentElement.doScroll('left');}
catch(e){setTimeout(arguments.callee, 50);return;}
instead of onload
*/
	waitStamp : 0,
	waitInterval : 200, // ms
	waitState : 3, // 1-4: READYSTATE_COMPLETE=4 usual set to interactive=3
	wait : function(w) {
		if (!w && !(w = this.waitState) || this.waitStamp)
			// !!this.waitStamp: wait 中
			return;
		this.waitStamp = new Date;
		try {
			// 可能中途被關掉
			while (new Date - this.waitStamp < this.timeout
					&& (!this.OK(true) || this.app.busy || this.app.readyState < w))
				try {
					// Win98的JScript沒有WScript.Sleep
					WScript.Sleep(this.waitInterval);
				} catch (e) {
					// TODO: handle exception
				}
		} catch (e) {
			// TODO: handle exception
		}
		w = new Date - this.waitStamp;
		this.waitStamp = 0;
		return w;
	},
	quit : function(quit_IEA) {
		try {
			this.app.Quit();
		} catch (e) {
			// TODO: handle exception
		}
		this.app = null;

		if (quit_IEA) {
			// destory IEA on window.onunload().
			if (IEA_instance)
				IEA_instance.quit();
		}

		if (typeof CollectGarbage === 'function')
			//	CollectGarbage(): undocumented IE javascript method: 先置為 null 再 CollectGarbage(); 設置為null,它會斷開對象的引用，但是IE為了節省資源（經常釋放內存也會佔系統資源），因此採用的是延遲釋放策略，你調用CollectGarbage函數，就會強制立即釋放。
			//	http://www.cnblogs.com/stupidliao/articles/797659.html
			setTimeout(function() {
				CollectGarbage();
			}, 0);

		return;
	},
	// 用IE.doc().title or IE.app.LocationName 可反映狀況
	doc : function() {
		try {
			return this.app.document;
		} catch (e) {
			// TODO: handle exception
		}
	},
	// get URL
	href : function() {
		try {
			return this.app.LocationURL;
		} catch (e) {
			// TODO: handle exception
		}
	},
	win : function() {
		try {
			return this.doc().parentWindow;
		} catch (e) {
			// TODO: handle exception
		}
	},
	eval : function(code, scope) {
		// IE 11 中無法使用 this.win().eval:
		// Error 70 [Error] (facility code 10): 沒有使用權限
		return (scope ? this.g(scope).parentWindow : this.win()).eval(code);
	},
/*
reload:function(){
 try{IE.win().history.go(0);IE.wait();}catch(e){}
},
*/
	/**
	 * get element
	 * @param e
	 * @param o
	 * @returns
	 */
	get_element : function(e, o) {
		try {
			return (o || this.doc()).getElementById(e);
		} catch (e) {
			// TODO: handle exception
		}
	},
	/**
	 * @deprecated
	 */
	getE : function() {
		return this.get_element.apply(this, arguments);
	},
	/**
	 * get tag
	 * @param e
	 * @param o
	 * @returns
	 */
	get_tag : function(e, o) {
		try {
			return (o || this.doc()).getElementsByTagName(e);
		} catch (e) {
			// TODO: handle exception
		}
	},
	/**
	 * @deprecated
	 */
	getT : function() {
		return this.get_tag.apply(this, arguments);
	},
	/**
	 * get node/elements/frame/.. 通用. A simple CSS
	 * selector with iframe.<br />
	 * Support #id, type(tag name), .name, .<br />
	 * TODO:
	 * 最佳化
	 * 
	 * @param {String}path
	 *            CSS selector, XPath, ..
	 * @param {object}[base_space]
	 *            base document/context
	 * @returns node
	 * @see Sizzle<br />
	 * 
	 */
	g : function get_node(selector, base_space) {
		if (typeof base_space === 'string' && base_space) {
			base_space = this.g(base_space);
		}

		library_namespace.debug('get [' + selector + ']', 2, 'IEA.get_node');
		var node = select_node(selector, base_space || this.doc());
		if (library_namespace.is_NodeList(node) && node.length === 1) {
			node = node[0];
			library_namespace.debug('treat node as single NodeList, 移至 [0]: &lt;' + node.tagName + '&gt;.', 2, 'IEA.get_node');
		}
		if (node && (('' + node.tagName).toLowerCase() in {
			frame : 1,
			iframe : 1
		})) {
			library_namespace.debug('移至 &lt;' + node.tagName + '&gt;.contentWindow.document', 2, 'IEA.get_node');
			// IE11: typeof node.contentWindow === 'object', but node.contentWindow.document: 沒有使用權限
			node = node.contentWindow.document;
		} else if (library_namespace.is_NodeList(node) && library_namespace.is_debug(2)) {
			library_namespace.warn('IEA.get_node: get NodeList[' + node.length + '].');
		}
		return node;
	},
	// name/id, HTML object to get frame, return document object or not
	// .getElementsByName()
	// http://www.w3school.com.cn/htmldom/met_doc_getelementsbyname.asp
	frame : function(n, f, d) {
		try {
			f = f ? f.getElementsByTagName('frame') : this.getT('frame');
			if (isNaN(n)) {
				if (!n)
					return f;
				for ( var i = 0, l = (f = library_namespace.get_tag_list(f)).length; i < l; i++)
					if (f[i].name === n) {
						n = i;
						break;
					}
			}
			if (!isNaN(n))
				return d ? f[n].contentWindow.document : f[n];
		} catch (e) {
			// TODO: handle exception
		}
	},
	//	IE.frames()['*']	IEApp.document.frames
	//	Cross Site AJAX	http://blog.joycode.com/saucer/archive/2006/10/03/84572.aspx
	//	Cross-Site XMLHttpRequest	http://ejohn.org/blog/cross-site-xmlhttprequest/
	frames : function() {
		try {
			var i = 0, f = this.getT('frame'), r = [];
			for (r['*'] = []; i < f.length; i++)
				r['*'].push(f(i).name), r[f(i).name] = r[i] = f(i);
			// use frame.window, frame.document
			return r;
		} catch (e) {
			// TODO: handle exception
		}
	},
	parse_frame : function(frames) {
		try {
			if (frames || (frames = this.doc()).getElementsByTagName('frame').length)
				library_namespace.parse_frame(frames);
		} catch (e) {
			// TODO: handle exception
		}
	},
	click : function fill(selector, base_space) {
		var node = this.g(selector, base_space);
		if (typeof node === 'object' && !isNaN(node.length))
			node = node[0];
		if (node && node.click) {
			//	http://www.quirksmode.org/dom/events/click.html
			// IE 5-8 use the following event order:
			// IE 8 中還是有些情況下不能模擬滑鼠點擊！
			if (node.mousedown)
				node.mousedown();
			node.click();
			if (node.mouseup)
				node.mouseup();
			this.wait();
		}
	},
	fill : function fill(pair, submit, base_space, config) {
		if (typeof base_space === 'string' && base_space) {
			base_space = this.g(base_space);
		}
		if (!library_namespace.is_Object(config))
			config = Object.create(null);
		config.window = this.win();
		config.base = base_space || this.doc();
		config.submit = submit;
		fill_form(pair, config);
		this.wait();
	},
	// form name array
	// formNA : 0,
	//	return name&id object. 設置這個還可以強制 do submit 使用 name 為主，不用 id。
	fillForm_rtE : 0,
	/**
	 * 自動填寫表單
	 * 
	 * @param {Object}pair
	 *            設定 pair: {id/name: value}
	 * @param submit_id
	 *            do submit(num) 或 button id
	 * @param form_index
	 *            submit 之 form index 或 id
	 * @returns
	 * @deprecated use .fill()
	 */
	fillForm : function fillForm(parameter, submit_id, form_index) {
		try {
			var i, j, n = {}, h = 0, f = this.doc().forms[form_index || 0] || {}, t,
			// g=f.getElementById,
			s = function(o, v) {
				t = o.tagName.toLowerCase();
				if (t === 'select')
					if (isNaN(v) || v < 0 || v >= o.options.length)
						o.value = v;
					else
						//	.options[i].value==v
						//	.selectedIndex= 的設定有些情況下會失效
						o.selectedIndex = v; 
				// 參考 cookieForm
				else if (t === 'input') {
					t = o.type.toLowerCase(); // .getAttribute('type')
					if (t === 'checkbox')
						o.checked = v;
					else if (t !== 'radio')
						o.value = v;
					else if (o.value === v)
						o.checked = true;
					else
						return true; // return true: 需要再處理
				} else if (t === 'textarea')
					o.value = v;
			};
			/*	needless
			  if(!f){
			   f=this.getT('form');
			   for(i in f)if(f[i].name==fi){f=a[i];break;}
			  }
			  if(!f)f={};
			*/
			for (j in parameter)
				if (!(i = /* f.getElementById?f.getElementById(j): */this
						.get_element(j))
						|| s(i, parameter[j]))
					n[j] = 1, h = 1;
			if ((h || this.fillForm_rtE)
					&& (i = f.getElementsByTagName ? f
							.getElementsByTagName('input') : this.getT('input')).length)
				for (j = 0, i = library_namespace.get_tag_list(i); j < i.length; j++)
					if (i[j].name in n)
						s(i[j], parameter[i[j].name]);
					else if (submit_id && typeof submit_id !== 'object' && submit_id === i[j].name)
						submit_id = i[j];
			// if(i[j].name in pm)s(i[j],pm[i[j].name]);
			if (submit_id) {
				if (i = typeof submit_id === 'object' ? submit_id
						: /* f.getElementById&&f.getElementById(l)|| */
							this.get_element(submit_id))
					i.click();
				else
					f.submit();
				this.wait();
			} else if (this.fillForm_rtE) {
				h = {
					'' : i
				};
				for (j = 0; j < i.length; j++)
					if (i[j].name)
						h[i[j].name] = i[j];
				return h;
			}
		} catch (e) {
			// TODO: handle exception
		}
		return this;
	},

	get_form_name : function get_form_name(form_index) {
		var i, doc = this.doc(), form = doc.forms[0] || doc,
		input = library_namespace.get_tag_list('input'), name, name_array = [];
		if(input.length){
			library_namespace.debug('All ' + doc.forms.length + ' forms, form[' + form_index + '] gets ' + input.length + ' &gt;input&lt;s.');
			for (i=0;i<input.length;i++) {
				name = input[i].name || input[i].id;
				if (name !== undefined)
					name_array.push(name);
			}
			library_namespace.log(name_array);
		}
		return name_array;
	},

	setLoc : function(w, h, l, t) {
		try {
			var s = this.win().screen;
			if (w) {
				this.app.Width = w;
				if (typeof l === 'undefined')
					l = (s.availWidth - w) / 2;
			}
			if (h) {
				this.app.Height = h;
				if (typeof t === 'undefined')
					t = (s.availHeight - h) / 2;
			}
			if (l)
				this.app.Left = l;
			if (t)
				this.app.Top = t;
		} catch (e) {
			// TODO: handle exception
		}
		return this;
	},

	write : function(h) {
		try {
			var d = this.doc();
			if (!d)
				this.go('');
			d.open();
			d.write(h || '');
			d.close();
		} catch (e) {
			// TODO: handle exception
		}
		return this;
	},

	//	使之成為 dialog 形式的視窗
	//	http://members.cox.net/tglbatch/wsh/
	setDialog : function(w, h, l, t, H) {
		try {
			this.app.FullScreen = true;
			this.app.ToolBar = false;
			this.app.StatusBar = false;
		} catch (e) {
			// TODO: handle exception
		}
		this.setLoc(w, h, l, t);
		if (H)
			this.write(H).focus();
		try {
			//	太早設定 scroll 沒用。
			H = this.doc();
			H.scroll = 'no';
			H.style.borderStyle = 'outset';
			H.style.borderWidth = '3px';
		} catch (e) {
			// TODO: handle exception
		}
		return this;
	},

	show : function(s) {
		try {
			this.app.Visible = typeof s === 'undefined' || s;
		} catch (e) {
			// TODO: handle exception
		}
		return this;
	},

	focus : function(s) {
		try {
			if (s || typeof s === 'undefined')
				this.win().focus();
			else
				this.win().blur();
		} catch (e) {
			// TODO: handle exception
		}
		return this;
	},

	get_page : function() {
		return this.getT('html')[0].outerHTML;
	},
	save_page : function(path, encoding) {
		var text = this.get_page();
		if (path && text) {
			href = this.href();
			l = href.length;
			l = (l > 9 ? l > 99 ? l > 999 ? '' : '0' : '00' : '000') + l;
			library_namespace.write_file(path, '<!-- saved from url=(' + l + ')' + href + ' -->' + line_separator + text, encoding || TristateTrue);
		}
		return this;
	},

	getC : function(class_name) {
		return find_class(class_name, this.doc());
	}
};


_.IEA.prototype.getE = _.IEA.prototype.get_element;

var IEA_instance;
/**
 * get IEA instance.
 * 
 * @param {Boolean}new_1
 *            get a new one.
 * @returns {IEA} IEA instance
 * 
 * @inner
 */
function new_IEA(new_1) {
	if (!new_1 && IEA_instance && IEA_instance.OK(true))
		return IEA_instance;

	// IEA.prototype.init_url='http://www.google.com/';
	if (IEA_instance = new IEA)
		if (IEA_instance.OK(true))
			IEA.instance = IEA_instance;
		else {
			library_namespace.error('Error to use IEA!');
			IEA_instance = null;
		}

	return IEA_instance;
}


function get_HTML(url) {
	if (url && !get_HTML.no_directly) {
		library_namespace.debug('Directly get:<br />' + url, 2);
		try {
			// 當大量 access 時，可能被網站擋下。e.g., Google.
			var data = library_namespace.get_file(url);
			library_namespace.debug('<br />' + data.replace(/</g, '&lt;'), 3);
			return data;

		} catch (e) {
			library_namespace.error('get_HTML: Error to directly access, will try IEA futher:<br />'
					+ url);
			get_HTML.no_directly = true;
		}
	}

	if(!new_IEA())
		return '';

	if (url)
		IEA_instance.go(url);
	IEA_instance.wait();

	// https://ipv4.google.com/sorry/IndexRedirect?continue=_url_
	if (IEA_instance.href().includes('.google.com/sorry/IndexRedirect')) {
		IEA_instance.show(true);
		// 如果您使用了自動程式常用的進階字詞，或是快速傳出多項要求，系統可能會要求您進行人機驗證 (Captcha)。
		throw new Error('如要繼續，請輸入人機驗證 (Captcha) 字元。');
	}

	var doc = IEA_instance.doc(), HTML;
	if (doc) {
		// alert(IEA.instance.doc().getElementsByTagName('html')[0].outerHTML);
		if (HTML = doc.getElementsByTagName('html'))
			return HTML[0].outerHTML;

		library_namespace.warn('No html element found! Use body.');
		return doc.body.outerHTML;
	}

	library_namespace.warn('No document node found!');
}

_.IEA.get_HTML = get_HTML;


//	WSH環境中設定剪貼簿的資料：多此一舉	http://yuriken.hp.infoseek.co.jp/index3.html	http://code.google.com/p/zeroclipboard/
//setClipboardText[generateCode.dLK]='IEA';//,clipboardFunction
function setClipboardText(cData, cType) {
	if (typeof clipboardFunction === 'function')
		return clipboardFunction();
	if (!new_IEA())
		return '';
	if (!cType)
		cType = 'text';

	var w = IEA_instance.win();
	if (cData)
		w.clipboardData.setData(cType, cData);
	else
		cData = w.clipboardData.getData(cType);

	//IEA_instance.quit();
	// try{IEApp.Quit();}catch(e){}
	return cData || '';
}

_// JSDT:_module_
.
setClipboardText = setClipboardText;

_// JSDT:_module_
.
/**
 * WSH 環境中取得剪貼簿的資料
 * @_memberOf	_module_
 */
getClipboardText = setClipboardText;





return (
	_// JSDT:_module_
);
}


});

