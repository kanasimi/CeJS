
/**
 * @name	CeL function for drag-and-drop
 * @fileoverview
 * 本檔案包含了 web 物件的滑鼠拖曳 functions。
 * @since	
 */

/*
http://www.w3.org/TR/html5/dnd.html#dnd
http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html
https://developer.mozilla.org/en/Using_files_from_web_applications
http://html5demos.com/drag
http://d.hatena.ne.jp/ksy_dev/20100731/p1?sid=810f738005e991c6

*/

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name:'interact.DnD',
require : 'interact.DOM.is_HTML_element|interact.DOM.get_element|interact.DOM.add_listener|interact.DOM.stop_event|interact.DOM.set_text|data.swap_key_value',
code : function(library_namespace) {

//	requiring
var is_HTML_element = this.r('is_HTML_element'), get_element = this.r('get_element'), add_listener = this.r('add_listener'), stop_event = this.r('stop_event'), set_text = this.r('set_text'), swap_key_value = this.r('swap_key_value');



/**
 * null module constructor
 * @class	web drag_and_drop 的 functions
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



_// JSDT:_module_
.
move_element = function(element, target) {
	target.appendChild(element.parentNode.removeChild(element));
};




function set_drop_target(element, drop_handler, drag_in_handler) {
	if (!is_HTML_element(element)
			&& !is_HTML_element(element = get_element(element)))
		return;

	//if(element.id) library_namespace.debug(element.id, 0, 'set_drop_target');

	add_listener( {
		//	拖進 target。
		//	阻止 dragover 預定動作方能觸發 ondrop。
		//	http://fillano.blog.ithome.com.tw/post/257/81723
		dragover : stop_event,
		//	在 target 上拖動。
		dragenter : stop_event,
		//	在 target 上拖完放開滑鼠。
		drop : function(event) {
			//	處理 types: 將所有設定的 type 一一列出。IE9 沒有 dataTransfer.types。
			var i = 0, list = event.dataTransfer.types || ['text', 'url'], l = list.length, data, type;
			for (; i < l; i++) {
				try {
					//	IE10 中拖拉外部檔案時，dataTransfer.getData(list[i]) 可能會 throw "Invalid argument."
					data = event.dataTransfer.getData(list[i]);
					type = typeof data;
					library_namespace.debug('[' + (i + 1) + '/' + l + '] [' + list[i] + ']: '
							+ (data ? type === 'string' && /^[a-z\d\-]+:\/\//i.test(data) ?
									'<a href="' + data + '" target="_blank">' + decodeURI(data) + '</a>'
									: data
								: '[' + type + '] ' + (String(data) || '<span class="gray">(null)</span>')),
							1, 'set_drop_target.ondrop');
					if (list[i] in set_drop_target.handler) {
						type = set_drop_target.handler[list[i]];
						for ( var h = 0, _t = this,
								timeout_binder = (typeof setTimeout === 'function' || typeof setTimeout === 'object') &&
								function() {
									library_namespace.debug('準備執行。 (' + data + ')', 2, 'set_drop_target.ondrop');
									//library_namespace.debug('' + type[h]);
									type[this].call(_t, data);
									library_namespace.debug('執行完畢。', 2, 'set_drop_target.ondrop');
								}; h < type.length; h++) {
							try {
								if(timeout_binder) {
									library_namespace.debug('use setTimeout to run:<br />'
											+ type[h].toString().replace(/\n/g, '<br />'), 2,
											'set_drop_target.ondrop');
									setTimeout(timeout_binder.bind(h), 0);
								} else {
									library_namespace.debug('directly run. typeof setTimeout: [' + typeof setTimeout + '].', 2, 'set_drop_target.ondrop');
									type[h].call(this, data);
								}
							} catch (e) {
								library_namespace.warn('set_drop_target.ondrop: Error to run ' + list[i] + '.' + h);
								library_namespace.error(e);
							}
						}
					}
				} catch (e) {
					library_namespace.debug('Error to get data of [' + list[i] + ']: ' + e,
							1, 'set_drop_target.ondrop');
					//library_namespace.error(e);
				}
			}

			//	處理 files. IE9 沒有 dataTransfer.files。
			//	http://www.html5rocks.com/en/tutorials/file/dndfiles/
			//	https://github.com/MrSwitch/dropfile
			if((list = event.dataTransfer.files)
					&& (l = list.length)){
				library_namespace.debug('Drop ' + l + ' file object(s).', 1, 'set_drop_target.ondrop');
				for (i = 0; i < l; i++) {
					data = list[i];
					library_namespace.debug('[' + (i + 1) + '/' + l + '] <em>'
							+ data.name + '</em>' + (data.type ? ' (' + data.type + ')' : '') + ': ' + data.size + ' bytes.',
							1, 'set_drop_target.ondrop');

					//	若是小圖，則直接顯示出來。
					if (/^image\/\w+/.test(data.type) && data.size < 1000000) {
						_.read_file(data, function(event) {
							var contents = event.target.result;
							library_namespace.debug('<em>' + this.file.name + '</em>: <img title="' + this.file.name + '" src="'
									+ contents + '" />' + contents.length
									+ ' chars starting with [' + contents.slice(0, 30).replace(/</g, '&lt;') + ']',
									1, 'set_drop_target.ondrop');
						}, 'url');
					}
				}

				_.read_files(list, function(event){
					var contents = event.target.result;
					library_namespace.debug('[' + this.file.name + '] loaded: ' + contents.length
							+ ' chars starting with [' + contents.slice(0, 30).replace(/</g, '&lt;')
							+ ']', 1, 'set_drop_target');
				});
			}

			return stop_event(event);
		}
	}, element);

	if (library_namespace.is_Object(drop_handler)) {
		library_namespace.debug('adding drop handler.');
		set_drop_target.add_handler(drop_handler);
	}

	return element;
}

set_drop_target.handler = Object.create(null);
/**
 * 為 drop 的 type 設定 handler.
 * 
 * @param {Object}handler_hash
 *            欲設定的 handler.<br />
 *            e.g., {type_name : handler },<br />
 *            e.g., { type_name : { id : handler } }
 */
set_drop_target.add_handler = function add_handler(handler_hash) {
	if (!library_namespace.is_Object(handler_hash)) {
		return;
	}

	var type_name, handler_list, handler, id;
	for (type_name in handler_hash) {
		library_namespace.debug('adding [' + type_name + '].');
		handler_list = set_drop_target.handler[type_name];
		if (!Array.isArray(handler_list))
			set_drop_target.handler[type_name] = handler_list = [];

		handler = handler_hash[type_name];
		library_namespace.debug('adding [' + type_name + '] ' + handler, 1, 'set_drop_target.add_handler');
		if (library_namespace.is_Function(handler)) {
			handler_list.push(handler);
		} else if (library_namespace.is_Object(handler)) {
			for (id in handler)
				handler_list[id] = handler[id];
		} else {
			library_namespace.warn('unknown handler: ' + handler);
		}
	}
};


_// JSDT:_module_
.
set_drop_target = set_drop_target;


//	<a href="http://www.w3.org/TR/FileAPI/" accessdate="2011/11/5 15:33">File API</a>
_// JSDT:_module_
.
read_files = function(files, handler, index) {
	//	check files type
	if (!library_namespace.is_type(files, 'FileList')) {
		if(handler && typeof handler.error === 'function')
			//handler.error.call(null);
			handler.error();
		return;
	}

	if(isNaN(index)){
		//	初始化 initialization
		handler = _.read_file.regular_handler(handler);

		index = 0;
	}

	//	依序讀入個別檔案內容。
	_.read_file(files[index], [ handler, {
		loadend : function() {
			if (++index < files.length)
				_.read_files(files, handler, index);
		}
	} ]);
};


//	<a href="http://www.w3.org/TR/FileAPI/" accessdate="2011/11/5 15:33">File API</a>
function read_file(file, handler, encoding, start, end) {
	var blob, reader = library_namespace.is_WWW(true)
	//
	&& window.FileReader && new window.FileReader();
	if (!reader) {
		library_namespace.error('read_file: This browser / platform does not support FileReader.');
		return;
	}

	//	check file type
	if (!library_namespace.is_type(file, 'File')) {
		if(handler && typeof handler.error === 'function')
			//handler.error.call(null);
			handler.error();
		return;
	}

	//	非標準! 但這樣設定後，event handler 中即可使用 this.file 取得相關資訊。
	reader.file = file;

	add_listener( [ _.read_file.regular_handler(handler), {
		error : function(event) {
			var error = event.target.error, code = error.code, message;
			switch (code) {
			case error.NOT_FOUND_ERR:
				message = 'File [' + file.name + '] Not Found!';
				break;
			case error.NOT_READABLE_ERR:
				message = 'File [' + file.name + '] is not readable!';
				break;
			case error.ABORT_ERR:
				message = 'User aborted reading [' + file.name + '].';
				break;
			case error.SECURITY_ERR:
				//	多是因不能 DnD local files.
				message = 'Security error to read [' + file.name + '].';
				break;
			default:
				error = _.read_file.code_to_name || (_.read_file.code_to_name = swap_key_value(error, [], /^[A-Z_\-\d]+$/));
				if (code in error)
					message = '<em>' + error[code] + '</em> to read [' + file.name + '].';
			}
			library_namespace.warn('read_file: ' + (message || 'Error ' + code + ' to read [' + file.name + '].'));
		},
		loadend : function() {
			//	預防 memory leak.
			delete reader.file;
			//library_namespace.debug('reader.file deleted.', 2, 'read_file');
		}
	} ], reader);

	if (start || end) {
		if (isNaN(start = parseInt(start))
				|| start < 0)
			start = 0;
		if (!isNaN(end = parseInt(end))
				&& end > start && end < file.size)
			blob = file.slice ? file.slice(start, end)
					: file.webkitSlice ? file.webkitSlice(start, end)
					: file.mozSlice && file.mozSlice(start, end);
	}

	if(!blob)
		blob = file;

	library_namespace.debug('read-in [' + file.name + ']' + (encoding ? ' as ' + encoding : '') + '.', 0, 'read_file');
	if ((!encoding || encoding === 'binary')
		//	IE10 沒有 .readAsBinaryString
		&& reader.readAsBinaryString)
		reader.readAsBinaryString(blob);
	else if(encoding === 'url')
		reader.readAsDataURL(blob);
	else
		//	UTF-8 is assumed if this parameter is not specified.
		//	https://developer.mozilla.org/en/DOM/FileReader
		reader.readAsText(blob, encoding || 'UTF-8');
};

read_file.regular_handler = function(handler) {
	if (typeof handler === 'function')
		handler = {
			load : handler
		};

	if (library_namespace.is_Object(handler)) {
		if (typeof handler.status === 'string')
			handler.status = get_element(handler.status);

		if (is_HTML_element(handler.status)) {
			// progress bar
			var progress_bar = handler.status;
			if(!handler.progress)
				handler.progress = function(event) {
					if (event.lengthComputable) {
						//	讀取比例
						//var percent_loaded;
						set_text(progress_bar, '[' + this.file.name + '] ' +
								(progress_bar.style.width = Math.round(event.loaded / event.total * 100) + '%'));
					}
				};
			if(!handler.load)
				handler.load = function(event) {
					set_text(progress_bar, '[' + this.file.name + '] loaded.');
				};

			delete handler.status;
		}

	}

	return handler;
};


_// JSDT:_module_
.
read_file = read_file;




//	about drag-and-drop @ IE6	---------------------------

/*
2008/1/24 0:51:17
*/

//CSS of body
get_drag_path.bCSS = 'margin:0;padding:.2em;color:#e42;background-color:#eff;';
// default contents in HTML
get_drag_path.dC = '<em>Drop Here</em> （不能拖曳多個物件）';
// show infomation after every drag
get_drag_path.show = 1;
// drag object
get_drag_path.o = 'dropT';
// 每次執行完是否應顯示
get_drag_path.shouldShow = function(o) {
	return o == showM.so;
};

// href Object & Array
get_drag_path.href_hash = Object.create(null);
get_drag_path.href_list = [];

//	未設定目錄。拖曳功能只在 IE6 有效。
get_drag_path.able = function() {
	var n = window ? window.navigator : 0;
	try {
		return n && (n = n.appVersion) && (n = n.match(/MSIE (\d+)/))
				&& n[1] == 6;
	} catch (e) {
		//	呼叫 navigator.* 可能有 -2147024882 "存放裝置空間不足，無法完成此操作。"
		//	http://www.dotblogs.com.tw/alonstar/archive/2008/10/09/5625.aspx
		//	結果原來是我的機碼不知道為什麼多了一大堆.NET CLR 3.0的版本，找了一台正常的比對之後，把多的機碼刪除就好了。
		//	HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\5.0\User Agent\Post Platform
		return !!get_drag_path.href_list;
	}
};

get_drag_path.add = function(p) {
	// sl('get_drag_path: add path ['+p+']');

	// 不能計算數目：不準 可能會有 file:///, http:// 等
	get_drag_path.href_hash[this.href = p] = 1;
};

//	每 get_drag_path.interval 執行一次
function get_drag_path() {
	var _s = arguments.callee,
	// 或者直接用 dropT.location.href，不透過 document.getElementById.
	o = document.getElementById(_s.o), w = o.contentWindow, bU = 'about:blank', i, t = [];

	if (w.location.href != _s.href || w.location.href != bU) {
		// 處理中隱藏，預防此時再被拖進。
		o.style.display = 'none';
		if (w.location.href != bU) {
			// sl('get_drag_path: get href ['+w.location.href+']');
			i = unescape(getPathOnly(w.location.href));
			// sl('get_drag_path: get unescaped href ['+i+']');
			// NOT GOOD: if(!i.indexOf('file:///'))i=getFP(getPathOnly(i));
			//	drag 的都是完整 path。getPathOnly 應該先於 unescape，預防 # 等字元。
			if (/^[a-z]:\//i.test(i))
				i = getFP(i.replace(/\//g, '\\'));

			_s.add(i);

			w.location.href = bU;
			if (_s.show)
				_s.d(), _s.afterAdd && _s.afterAdd();
		}
		if (bU == w.location.href)
			// 用 try: 有時 about:blank 還沒設定好
			try {
				// 無法用 className
				var s = w.document.body;
				s.style.cssText = _s.bCSS;
				//	只能在 about:blank 設定
				s.innerHTML = _s.dC;
				var s = _s.shouldShow;
				o.style.display = (typeof s === 'function' ? s(_s.o) : s) ? 'block'
						: 'none';
			} catch (e) {
			}
	}
	return _s.href;
}
//	delete url in collection
get_drag_path.d = function(u) {
	if (u === 1) {
		get_drag_path.href_hash = Object.create(null);
		return;
	} else if (u in get_drag_path.href_hash)
		delete get_drag_path.href_hash[u];
	get_drag_path.href_list = [];
	var t = [];
	for (i in get_drag_path.href_hash){
		get_drag_path.href_list.push(i);
		t.push('<div><b style="cursor:pointer;color:#e22;" onclick="get_drag_path.d(this.parentNode.childNodes[2].innerHTML);">[delete]</b> <span>'
				+ i + '</span></div>');
	}
	// get_drag_path.href_list.sort();
	sl('last dragged: '
			+ this.href
			+ (t.length > 1 ? '<hr />[' + t.length + '] get_drag_path.href_list:<br />'
					+ t.join('') : ''));
	return get_drag_path.href_list;
};

//get_drag_path.afterAdd = function() {};






return (
	_// JSDT:_module_
);
}


});

