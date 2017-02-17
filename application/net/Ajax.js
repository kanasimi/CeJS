/**
 * @name CeL function for Ajax (Asynchronous JavaScript and XML)
 * @fileoverview 本檔案包含了 Ajax 用的 functions。
 * @since 2015/1/1
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.Ajax',

	// MIME_of()
	require : 'application.net.MIME.',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// 本函式將使用之 encodeURIComponent()
	var encode_URI_component = function(string, encoding) {
		if (library_namespace.character) {
			library_namespace.debug('採用 ' + library_namespace.Class
			// 有則用之。 use CeL.data.character.encode_URI_component()
			+ '.character.encode_URI_component', 1, library_namespace.Class
					+ 'application.net.Ajax');
			return (encode_URI_component = library_namespace.character.encode_URI_component)
					(string, encoding);
		}
		return encodeURIComponent(string);
	};

	/**
	 * null module constructor
	 * 
	 * @class web Ajax 的 functions
	 */
	var _// JSDT:_module_
	= function() {
		// null module constructor
	};

	/**
	 * for JSDT: 有 prototype 才會將之當作 Class
	 */
	_// JSDT:_module_
	.prototype = {};

	// ---------------------------------------------------------------------//
	// XMLHttp set ajax通信処理ライブラリ ==================

	/**
	 * <code>
	to use: include in front:
	way1(good: 以reg代替functionPath!):
	//		[function.js]_iF
	//		[function.js]End

	way2(old):
	//		[function.js]getU,functionPath,'eval(getU(functionPath));'
	//		[function.js]End

	old:
	function getU(p){var o;try{o=new ActiveXObject('Microsoft.XMLHTTP');}catch(e){o=new XMLHttpRequest();}if(o)with(o){open('GET',p,false),send(null);return responseText;}}
	</code>
	 */

	/**
	 * JScript or .wsh only, 能 encode.
	 * 
	 * @param {String}page_url
	 *            page url
	 * @param {String}[charset]
	 *            character encoding of HTML web page. e.g., 'UTF-8', big5,
	 *            euc-jp, ...
	 * @param POST_text
	 *            POST text
	 * 
	 * @returns {String}
	 * @see http://neural.cs.nthu.edu.tw/jang/books/asp/getWebPage.asp?title=10-1%20%E6%8A%93%E5%8F%96%E7%B6%B2%E9%A0%81%E8%B3%87%E6%96%99
	 */
	function get_page(page_url, charset, POST_text) {
		try {
			// may cause error
			var X = new ActiveXObject('Microsoft.XMLHTTP'), AS;
			X.open(POST_text ? 'POST' : 'GET', page_url, false);
			// POST need this
			X.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");
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
			if (charset)
				AS.Charset = charset;
			// 將物件內的文字讀出
			X = AS.ReadText();
			// free
			AS = null;
			return X;
		} catch (e) {
			library_namespace.warn('get_page: ' + e.message);
		}
	}

	// ---------------------------------------------------------------------//

	if (false)
		// default arguments
		var get_URL_arguments = {
			URL : '',
			charset : '',
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

	// XMLHttp.readyState 所有可能的值如下：
	// 0 還沒開始
	// 1 讀取中 Sending Data
	// 2 已讀取 Data Sent
	// 3 資訊交換中 interactive: getting data
	// 4 一切完成 Completed
	var readyState_done = 4,
	//
	document_head = library_namespace.is_WWW(true)
			&& (document.head || document.getElementsByTagName('head')[0]);

	/**
	 * 讀取 URL via XMLHttpRequest。
	 * 
	 * @param {String|Object}URL
	 *            欲請求之目的 URL or options
	 * @param {Function}[onload]
	 *            callback when successful loaded
	 * @param {String}[charset]
	 *            character encoding of HTML web page. e.g., 'UTF-8', big5,
	 *            euc-jp, ...
	 * @param {String|Object}[post_data]
	 *            text data to send when method is POST
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * TODO: 代理伺服器 proxy sever
	 * 
	 * @see https://developer.mozilla.org/zh-TW/docs/DOM/XMLHttpRequest
	 *      http://msdn.microsoft.com/en-us/library/ie/ms535874.aspx
	 */
	function get_URL(URL, onload, charset, post_data, options) {
		// 前導作業。
		if (library_namespace.is_Object(charset)) {
			post_data = charset;
			charset = null;
		}
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);
		if (library_namespace.is_Object(URL) && URL.URL) {
			Object.assign(options, URL);
			onload = options.onload || onload;
			post_data = options.post || post_data;
			charset = options.charset || charset;
			URL = options.URL;
		}

		// https://developer.mozilla.org/en-US/docs/Web/API/URL
		// [ origin + pathname, search, hash ]
		// hrer = [].join('')
		if (Array.isArray(URL)) {
			URL = get_URL.add_parameter(URL[0], URL[1], URL[2], charset);
		}

		if (options.search || options.hash) {
			URL = get_URL.add_parameter(URL, options.search, options.hash,
					charset);
		}

		library_namespace.debug('URL: (' + (typeof URL) + ') [' + URL + ']', 3,
				'get_URL');

		if (typeof onload === 'object') {
			library_namespace.debug(
					'Trying to JSONP, insert page, need callback.', 3,
					'get_URL');
			// library_namespace.run(URL);
			for ( var callback_param in onload) {
				library_namespace.debug('Trying ('
						+ (typeof onload[callback_param]) + ') ['
						+ callback_param + '] = [' + onload[callback_param]
						+ ']', 3, 'get_URL');
				if (callback_param
						&& typeof onload[callback_param] === 'function') {
					var callback_name, node = document.createElement('script');
					for (charset = 0; (callback_name = 'cb' + charset) in library_namespace;)
						charset++;
					library_namespace[callback_name] = function(data) {
						library_namespace.debug('[' + URL
								+ ']: callback 完自動移除 .js。', 2, 'get_URL');
						document_head.removeChild(node);
						// release
						node = null;
						delete library_namespace[callback_name];
						onload[callback_param](data);
					};
					// callback_param: callback parameter
					node.src = URL + '&' + callback_param + '='
							+ library_namespace.Class + '.' + callback_name;
					library_namespace.debug('Use script node: [' + node.src
							+ ']', 3, 'get_URL');
					document_head.appendChild(node);
					return;
				}
			}
			library_namespace.debug('Skip JSONP. No callback setted.', 3,
					'get_URL');
		}

		if (post_data && !options.form_data) {
			post_data = get_URL.parameters_to_String(post_data, charset);
		}

		if (!onload && typeof options.onchange === 'function') {
			onload = function() {
				options.onchange(readyState_done, XMLHttp);
			};
		}

		if (options.async === false && onload || typeof onload !== 'function') {
			onload = false;
		}

		/**
		 * The XMLHttpRequest object can't be cached.
		 */
		var XMLHttp = library_namespace.new_XMLHttp();

		try {
			// IE:404會throw error, timeout除了throw error, 還會readystatechange;
			// Gecko亦會throw error
			// IE 10 中，local file 光 .open() 就 throw 了。
			XMLHttp.open(options.method || (post_data ? 'POST' : 'GET'), URL,
					!!onload, options.user || '', options.password || '');

			if (options.timeout > 0 && !onload) {
				XMLHttp.timeout = options.timeout;
				if (typeof options.onfail === 'function')
					XMLHttp.ontimeout = function(e) {
						options.onfail(e || 'Timeout');
					};
			}
			// TODO: 處理有 onload 下之 timeout 逾時ms數
			// Ajax 程式應該考慮到 server 沒有回應時之處置

			if (library_namespace.is_Object(options.head)
					&& XMLHttp.setRequestHeader)
				Object.keys(options.head).forEach(function(key) {
					XMLHttp.setRequestHeader(key, options.head[key]);
				});

			if (options.mime)
				// ignore charset!
				charset = options.mime;
			else if (charset)
				// old: 'text/xml;charset=' + charset
				// 但這樣會被當作 XML 解析，產生語法錯誤。
				// TODO: try:
				// 'text/'+(/\.x(ht)?ml$/i.test(URL)?'xml':'plain')+';charset='
				// + charset;
				charset = 'application/json;charset=' + charset;

			// 有些版本的 Mozilla 瀏覽器在伺服器送回的資料未含 XML mime-type
			// 檔頭（header）時會出錯。為了避免這個問題，可以用下列方法覆寫伺服器傳回的檔頭，以免傳回的不是 text/xml。
			// http://squio.nl/blog/2006/06/27/xmlhttprequest-and-character-encoding/
			// http://www.w3.org/TR/XMLHttpRequest/ search encoding
			if (charset && XMLHttp.overrideMimeType)
				XMLHttp.overrideMimeType(charset);

			if (onload)
				XMLHttp.onreadystatechange = function() {
					if (XMLHttp.readyState === readyState_done)
						return onload(XMLHttp);

					if (0 < XMLHttp.readyState
							&& XMLHttp.readyState < readyState_done) {
						if (typeof options.onchange === 'function')
							options.onchange(XMLHttp.readyState, XMLHttp);
					} else if (typeof options.onfail === 'function') {
						options.onfail(XMLHttp);
					}
				};

			// 若檔案不存在，會 throw。
			XMLHttp.send(post_data || null);

			if (!onload) {
				// XMLHttp.responseText 會把傳回值當字串用
				// XMLHttp.responseXML 會把傳回值視為 XMLDocument 物件，而後可用 JavaScript
				// DOM 相關函式處理
				// IE only(?):
				// XMLHttp.responseBody 以unsigned array格式表示binary data
				// try{responseBody=(new
				// VBArray(XMLHttp.responseBody)).toArray();}catch(e){}
				// http://aspdotnet.cnblogs.com/archive/2005/11/30/287481.html
				// XMLHttp.responseStream return AdoStream
				return XMLHttp.responseText;
			}

		} catch (e) {
			library_namespace.err(e);
			if (typeof options.onfail === 'function') {
				options.onfail(XMLHttp, e);
			} else if (onload) {
				onload(undefined, e);
			}
		}

	}

	// {Object}parameter hash to String
	// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
	function parameters_to_String(parameters, charset) {
		if (!library_namespace.is_Object(parameters)) {
			if (typeof parameters !== 'string') {
				library_namespace.debug(
				// 可能無法處理
				'非字串之 parameters: [' + parameters + ']', 1,
						'get_URL.parameters_to_String');
			}
			// '' + parameters
			return parameters && String(parameters) || '';
		}

		var array = [];
		library_namespace.debug(Object.keys(parameters).join(','), 3,
				'parameters_to_String');
		Object.keys(parameters).forEach(function(key) {
			library_namespace.debug(key, 5, 'parameters_to_String.forEach');
			array.push(encode_URI_component(key, charset) + '='
			//
			+ encode_URI_component(String(parameters[key]), charset));
		});
		library_namespace.debug(array.length + ' parameters:<br />\n'
		//
		+ array.map(function(parameters) {
			return parameters.length > 400 ? parameters.slice(0,
			//
			library_namespace.is_debug(6) ? 2000 : 400) + '...' : parameters;
		}).join('<br />\n'), 4, 'parameters_to_String');
		return array.join('&');
	}

	// parameter String to hash
	function parse_parameters(parameters) {
		if (library_namespace.is_Object(parameters)) {
			return parameters;
		}

		if (!Array.isArray(parameters)) {
			if (typeof parameters !== 'string') {
				// 可能無法處理
				library_namespace.debug(
						'非字串之 parameters: [' + parameters + ']', 1,
						'get_URL.parse_parameters');
			}
			// http://stackoverflow.com/questions/14551194/how-are-parameters-sent-in-an-http-post-request
			// '' + parameters
			parameters = String(parameters).split('&');
		}

		var hash = library_namespace.null_Object();

		parameters.forEach(function(parameter) {
			var index = parameter.indexOf('=');
			// -1: NOT_FOUND
			if (index === -1) {
				// e.g., key1&key2&key3
				// → key1=&key2=&key3=
				hash[parameter] = '';
			} else {
				hash[parameter.slice(0, index)] = parameter.slice(index + 1);
			}
		});

		return hash;
	}

	function add_parameter(URL, search, hash, charset) {
		if (search || hash) {
			URL = URL.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
			if (search = get_URL.parameters_to_String(search, charset)) {
				if (search.startsWith('?')) {
					if (URL[2])
						search = URL[2] + '&' + search.slice(1);
				} else
					search = (URL[2] ? URL[2] + '&' : '?') + search;
			} else
				search = URL[2] || '';

			if (hash = get_URL.parameters_to_String(hash, charset)) {
				if (!hash.startsWith('#'))
					hash = '#' + hash;
				hash = (URL[3] || '') + hash;
			} else
				hash = URL[3] || '';

			URL = URL[1] + search + hash;
		}

		return URL;
	}

	get_URL.parameters_to_String = parameters_to_String;
	get_URL.parse_parameters = parse_parameters;
	get_URL.add_parameter = add_parameter;
	_.get_URL = get_URL;

	// TODO: 處理 multi requests
	function get_URLs() {
	}

	// ----------------------------------------------------

	var is_nodejs = library_namespace.platform.nodejs;

	/**
	 * <code>

	// "file": keyword for "Content-Disposition: file;"
	{type:'jpg',image:{file:'fn1.jpg'}}

	// will fetch url first.
	{type:'jpg',image:{url:'http://host/'}}

	{type:'jpg',image:{file:'fn1.jpg',type:'image/jpeg'}}

	// Array: use "Content-Type: multipart/mixed;"
	{type:'jpg',images:[{file:'fn1.jpg'},{file:'fn2.jpg'}]}

	{type:'jpg',images:[{file:'fn1.jpg'},{file:'fn2.jpg'}],docs:[{file:'fn1.txt'},{file:'fn2.txt'}]}

	{type:'jpg',images:[{file:'fn1.jpg',type:'image/jpeg'},{file:'fn1.txt',type:'text/plain'}]}

	</code>
	 */

	// should be CRLF
	// @see https://tools.ietf.org/html/rfc7578#section-4.1
	var form_data_new_line = '\r\n';

	function form_data_to_Array(is_slice) {
		if (this.generated) {
			return this.generated;
		}

		var boundary = '--' + this.boundary + form_data_new_line,
		// generated raw post data
		generated = this.generated = [ boundary ], content_length = boundary.length;
		boundary = form_data_new_line + boundary;
		this.forEach(function(chunk, index) {
			if (Array.isArray(chunk)) {
				// chunk = chunk.to_Array(true);
				if (!chunk.content_length) {
					console.log(chunk);
					throw 3;
				}
				content_length += chunk.content_length;
			} else {
				// chunk: {String} or {Buffer}
				content_length += chunk.length;
			}
			generated.push(chunk);
			if (index < this.length - 1) {
				generated.push(boundary);
				content_length += boundary.length;
			}
		}, this);

		if (!(content_length > 0)) {
			console.log(this);
			throw 2;
		}

		boundary = form_data_new_line + '--' + this.boundary;
		if (!is_slice) {
			boundary += '--';
		}
		generated.push(boundary);
		content_length += boundary.length;

		generated.content_length = content_length;
		return generated;
	}

	// 選出 data.generated 不包含之 string
	function give_boundary(data_Array) {
		function not_includes_in(item) {
			return Array.isArray(item) ? item.every(not_includes_in)
			// item: {String} or {Buffer}
			: !item.includes(boundary);
		}

		var boundary, retry_count = 0;
		while (retry_count++ < 8) {
			boundary = (Number.MAX_SAFE_INTEGER * Math.random())
					.toString(10 + 26);
			// console.log('test boundary: [' + boundary + ']');
			for (var i = 1; i < boundary.length / 2 | 0; i++) {
				var slice = boundary.slice(0, i);
				if (boundary.lastIndexOf(slice) > 0) {
					boundary = null;
					break;
				}
			}
			// assert: boundary 不自包含，例如 'aa'自包含'a'，'asas'自包含'as'
			if (boundary) {
				if (not_includes_in(data_Array)) {
					data_Array.boundary = boundary;
					return boundary;
				}
			}
		}
		throw 'give_boundary: Retry too many times!';
	}

	var to_form_data_generated = {
		form_data_generated : true
	};

	// https://github.com/form-data/form-data/blob/master/lib/form_data.js
	// https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.2
	// https://tools.ietf.org/html/rfc7578
	// https://tools.ietf.org/html/rfc2046#section-5.1
	// The "multipart" boundary delimiters and header fields are always
	// represented as 7bit US-ASCII
	// https://tools.ietf.org/html/rfc2049#appendix-A
	// http://stackoverflow.com/questions/4238809/example-of-multipart-form-data
	function to_form_data(parameters, callback, options) {
		function get_file_object(value, callback, key, slice) {
			var is_url, MIME_type;
			if (typeof value === 'string') {
				is_url = value.includes('://');

			} else
			// else: assert: library_namespace.is_Object(value)
			if (is_url = value.url) {
				value = is_url;
				// is_url = true;
			} else {
				// .type: MIME type
				MIME_type = value.type;
				// value: file_path
				value = value.file;
			}

			function push_and_callback(MIME_type, content) {
				var headers = 'Content-Disposition: '
						+ (slice ? 'file' : 'form-data; name="' + key + '"')
						+ '; filename="' + value + '"' + form_data_new_line;
				if (MIME_type) {
					headers += 'Content-Type: ' + MIME_type
							+ form_data_new_line;
				}
				headers += form_data_new_line;
				var chunk = [ headers, content ];
				// 手動設定 Content-Length。
				chunk.content_length = headers.length + content.length;
				// TODO: use stream
				(slice || root_data).push(chunk);
				callback();
			}

			if (!is_url) {
				var content;
				// read file contents
				if (is_nodejs) {
					try {
						// get {Buffer}
						content = fs.readFileSync(value);
					} catch (e) {
						library_namespace
								.err('to_form_data: Error to get file: ['
										+ value + '].');
						// Skip this one.
						callback();
						return;
					}
				} else {
					// node.js 之下此方法不能處理 binary data。
					content = library_namespace
							.get_file(value/* , 'binary' */);
				}
				if (options && options.file_post_processor) {
					options.file_post_processor(value, content);
				}
				// value: file path → file name
				value = value.match(/[^\\\/]*$/)[0];
				if (!MIME_type) {
					MIME_type = library_namespace.MIME_of(value);
				}
				push_and_callback(MIME_type, content);
				return;
			}

			library_namespace.debug('fetch URL [' + value + ']', 1,
					'to_form_data');
			_.get_URL(value, function(XMLHttp, error) {
				if (options && options.url_post_processor) {
					options.url_post_processor(value, XMLHttp, error);
				}
				if (error) {
					library_namespace.err('to_form_data: Error to get URL: ['
							+ URL + '].');
					// Skip this one.
					callback();
					return;
				}

				// value: url → file name
				value = value.replace(/[?#].*$/, '')
						.match(/([^\\\/]*)[\\\/]?$/)[1];
				// console.log('-'.repeat(79));
				// console.log(value);
				library_namespace.debug('fetch URL [' + value + ']: '
						+ XMLHttp.responseText.length + ' bytes', 1,
						'to_form_data');
				push_and_callback(XMLHttp.type, XMLHttp.responseText);
			}, 'binary');
		}

		parameters = get_URL.parse_parameters(parameters);

		var root_data = [], keys = Object.keys(parameters), index = 0;
		root_data.to_Array = form_data_to_Array;
		// console.log('-'.repeat(79));
		// console.log(keys);
		// 因為在遇到fetch url時需要等待，因此採用async。
		function process_next() {
			// console.log('-'.repeat(60));
			// console.log(index + '/' + keys.length);
			if (index === keys.length) {
				// 決定 boundary
				give_boundary(root_data);
				// WARNING: 先結束作業: 生成 .to_Array()，
				// 才能得到 root_data.to_Array().content_length。
				root_data.to_Array();
				if (0) {
					console.log('-'.repeat(79));
					console.log(root_data);
					console.log('-'.repeat(79));
					console.log(root_data.to_Array().content_length);
					console.log(root_data.to_Array().join(''));
					throw 5;
				}
				callback(root_data);
				return;
			}

			var key = keys[index++], value = parameters[key];
			// console.log(key + ': ' + JSON.stringify(value));
			if (Array.isArray(value)) {
				// assert: is files/urls
				var slice = [], item_index = 0,
				//
				next_item = function() {
					if (item_index === value.length) {
						give_boundary(slice);
						var headers = 'Content-Disposition: form-data; name="'
								+ key + '"' + form_data_new_line
								+ 'Content-Type: multipart/mixed; boundary='
								+ slice.boundary + form_data_new_line
								+ form_data_new_line;
						slice = form_data_to_Array.call(slice, true);
						slice.unshift(headers);
						slice.content_length += headers.length;
						root_data.push(slice);
						process_next();
					} else {
						get_file_object(value[item_index++], next_item,/* key */
						undefined, slice);
					}
				};
				next_item();
				return;
			}

			if (library_namespace.is_Object(value)) {
				// assert: is file/url
				get_file_object(value, process_next, key);
				return;
			}

			// 非檔案，屬於普通的表單資料。
			if (!key) {
				throw 'No key for value: ' + value;
			}
			// @see function push_and_callback(MIME_type, content)
			var headers = 'Content-Disposition: form-data; name="' + key + '"'
					+ form_data_new_line + form_data_new_line,
			//
			chunk = [ headers, value ];
			// 手動設定 Content-Length。
			chunk.content_length = headers.length + value.length;
			root_data.push(chunk);
			process_next();
		}
		process_next();

		return root_data;
	}

	_.to_form_data = to_form_data;

	// ---------------------------------------------------------------------//

	/**
	 * <code>
		讀取URL by XMLHttpRequest
		http://jck11.pixnet.net/blog/post/11630232
	
	 * 若有多行程或為各URL設定個別XMLHttp之必要，請在一開始便設定deprecated_get_URL.multi_request，並且別再更改。
	 ** 在此情況下，單一URL仍只能有單一個request!
	 ** 設定 handle_function 須注意程式在等待回應時若無執行其他程式碼將自動中止！
		可設定：
		while(deprecated_get_URL.doing)WScript.Sleep(1);	//||timeout
	
	arguments f:{
		URL:'',	//	The same origin policy prevents document or script loaded from one origin, from getting or setting properties from a of a document from a different origin.(http://www.mozilla.org/projects/security/components/jssec.html#sameorigin)
		enc:'UTF-8',	//	charset: big5, euc-jp,..
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
		update:DOMDocument,	//	use onLoad/onFailed to 加工 return text. onFailed(){throw;} will abort change.
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
	</code>
	 */
	// (URL,fn) or flag URL, handle_function handle result,
	// method,sendDoc,asyncFlag,userName,password
	function deprecated_get_URL(f) {
		var _f = arguments.callee;
		if (typeof _f.XMLHttp == 'object') {
			// try{_f.XMLHttp.abort();}catch(e){}
			// 此時可能衝突或lose?!
			_f.XMLHttp = null;
		}
		// 處理 arguments
		if (!library_namespace.is_Object(f))
			a = arguments, f = {
				URL : f,
				fn : a[1],
				method : a[2],
				sendDoc : a[3]
			};
		if (f.post)
			f.method = 'POST', f.sendDoc = f.post;

		if (!f.URL
				|| !(_f.XMLHttp = library_namespace.new_XMLHttp(f.enc,
						!/\.x(?:ht)?ml$/i.test(f.URL))))
			// throw
			return;

		// try{_f.XMLHttp.overrideMimeType('text/xml');}catch(e){}
		if (typeof f.async != 'boolean')
			// 設定f.async
			f.async = f.fn ? true : false;
		else if (!f.async)
			f.fn = null;
		else if (!f.fn)
			if (typeof _f.HandleStateChange != 'function'
					|| typeof _f.HandleContent != 'function')
				// 沒有能處理的function
				// throw
				return;
			else
				// =null;
				f.fn = _f.HandleContent;
		if (/* typeof _f.multi_request!='undefined'&& */_f.multi_request) {
			if (!_f.q)
				// queue
				_f.i = {}, _f.q = [];
			// ** 沒有考慮到 POST 時 URL 相同的情況!
			_f.i[f.URL] = _f.q.length;
			_f.q.push({
				uri : f.URL,
				XMLHttp : _f.XMLHttp,
				func : f.fn,
				start : _f.startTime = new Date
			});
		} else if (_f.q && typeof _f.clean == 'function')
			_f.clean();

		// for Gecko Error: uncaught exception: Permission denied to call method
		// XMLHttpRequest.open
		if (f.URL.indexOf('://') != -1 && typeof netscape == 'object')
			if (_f.asked > 2) {
				_f.clean(f.URL);
				return;
			} else
				try {
					if (typeof _f.asked == 'undefined') {
						_f.asked = 0;
						alert('我們需要一點權限來使用 XMLHttpRequest.open。\n* 請勾選記住這項設定的方格。');
					}
					netscape.security.PrivilegeManager
					// UniversalBrowserAccess
					.enablePrivilege('UniversalXPConnect');
				} catch (e) {
					_f.asked++;
					_f.clean(f.URL);
					return;
				}

		// if(isNaN(_f.timeout))_f.timeout=300000;//5*60*1000;
		try {
			// IE:404會throw error, timeout除了throw error, 還會readystatechange;
			// Gecko亦會throw error
			try {
				_f.XMLHttp.setRequestHeader("Accept-Encoding", "gzip,deflate");
			} catch (e) {
			}
			// Set header so the called script knows that it's an XMLHttpRequest
			if (false)
				_f.XMLHttp.setRequestHeader("X-Requested-With",
						"XMLHttpRequest");
			// Set the If-Modified-Since header, if ifModified mode.
			if (false)
				_f.XMLHttp.setRequestHeader("If-Modified-Since",
						"Thu, 01 Jan 1970 00:00:00 GMT");
			if (f.method == 'POST'
			// &&_f.XMLHttp.setRequestHeader
			) {
				// use .getAttribute('method') to get 長度不一定如此
				if (false)
					_f.XMLHttp.setRequestHeader("Content-Length",
							f.sendDoc.length);
				// 有些CGI會用Content-Type測試是XMLHttp或是regular form
				// It may be necessary to specify
				// "application/x-www-form-urlencoded" or "multipart/form-data"
				// for posted XML data to be interpreted on the server.
				_f.XMLHttp.setRequestHeader('Content-Type', Array.isArray(f.fn)
						&& f.fn[1] ? 'text/xml'
				// application/x-www-form-urlencoded;charset=utf-8
				: 'application/x-www-form-urlencoded');
			}
			_f.XMLHttp.abort();
			_f.XMLHttp.open(f.method || 'GET', f.URL, f.async, f.user || null,
					f.passwd || null);
			// alert((f.method||'GET')+','+f.URL+','+f.async);
			/**
			 * @see http://www.javaworld.com.tw/jute/post/view?bid=49&id=170177&sty=3&age=0&tpg=1&ppg=1
			 *      根據 W3C的 XMLHttpRequest 規格書上說，①在呼叫 open
			 *      時，如果readyState是4(Loaded) ②呼叫abort之後
			 *      ③發生其他錯誤，如網路問題，無窮迴圈等等，則會重設所有的值。使用全域的情況就只有第一次可以執行，因為之後的readyState是4，所以onreadystatechange
			 *      放在open之前會被清空，因此，onreadystatechange 必須放在open之後就可以避免這個問題。
			 * 
			 * 每使用一次XMLHttpRequest，不管成功或失敗，都要重設onreadystatechange一次。onreadystatechange
			 * 的初始值是 null
			 * 
			 * @see http://www.xulplanet.com/references/objref/XMLHttpRequest.html
			 *      After the initial response, all event listeners will be
			 *      cleared. Call open() before setting new event listeners.
			 */
			if (f.async) {
				_f.doing = (_f.doing || 0) + 1;
				_f.XMLHttp.onreadystatechange = typeof f.fn == 'function'
				//
				? f.fn : function(e) {
					_f.HandleStateChange(e, f.URL, f.fn);
				}
				// ||null
				;
				// 應加 clearTimeout( )
				setTimeout('try{deprecated_get_URL.'
				//
				+ (_f.multi_request ? 'q[' + _f.i[f.URL] + ']' : 'XMLHttp')
						+ '.onreadystatechange();}catch(e){}',
				// 5*60*1000;
				_f.timeout || 3e5);
			}
			_f.XMLHttp.send(f.sendDoc || null);
			if (!f.fn) {
				/**
				 * 非async(異步的)能在此就得到response。Safari and Konqueror cannot
				 * understand the encoding of text files!
				 * 
				 * @see http://www.kawa.net/works/js/jkl/parsexml.html
				 */
				// responseXML: responseXML.loadXML(text)
				return _f.XMLHttp.responseText;
			}
		} catch (e) {
			if (typeof f.fn == 'function')
				f.fn(e);
			else if (typeof window == 'object')
				window.status = e.message;
			return e;
		}
	}
	deprecated_get_URL.timeoutCode = -7732147;

	/**
	 * agent handle function
	 * 
	 * e: object Error, handle_function: function(return text, heads,
	 * XMLHttpRequest object, URL) | [ function, (default|NULL:responseText,
	 * others:responseXML) ]
	 */
	deprecated_get_URL.HandleStateChange = function(e, URL, handle_function) {
		var _t = 0, isOKc, m = deprecated_get_URL.multi_request, _oXMLH;
		if (m)
			m = deprecated_get_URL.q[isNaN(URL) ? deprecated_get_URL.i[URL]
					: URL], _oXMLH = m.XMLHttp, handle_function = m.func,
					URL = m.uri;
		else
			_oXMLH = deprecated_get_URL.XMLHttp;
		if (Array.isArray(handle_function))
			_t = handle_function[1], handle_function = handle_function[0];
		if (!handle_function || typeof handle_function != 'function') {
			deprecated_get_URL.doing--;
			deprecated_get_URL.clean(URL);
			return;
		}
		// http://big5.chinaz.com:88/book.chinaz.com/others/web/web/xml/index1/21.htm
		if (!e)
			if (typeof _oXMLH == 'object' && _oXMLH) {
				if (_oXMLH.parseError
						&& _oXMLH/* .responseXML */.parseError.errorCode != 0)
					e = _oXMLH.parseError, e = new Error(e.errorCode, e.reason);
				else if (_oXMLH.readyState == 4) {
					// only if XMLHttp shows "loaded"

					// condition is OK?
					isOKc = _oXMLH.status;
					isOKc = isOKc >= 200
							&& isOKc < 300
							|| isOKc == 304
							|| !isOKc
							&& (location.protocol == "file:" || location.protocol == "chrome:");
					if (handle_function == deprecated_get_URL.HandleContent)
						// handle_function.apply()
						handle_function(0, isOKc, _oXMLH, URL);
					else {
						// handle_function.apply()
						handle_function(isOKc ? _t ? _oXMLH.responseXML
								// JKL.ParseXML: Safari and Konqueror cannot
								// understand the encoding of text files.
								: typeof window == 'object'
										&& window.navigator.appVersion
												.indexOf("KHTML") != -1
										&& !(e = escape(_oXMLH.responseText))
												.indexOf("%u") != -1 ? e
										: _oXMLH.responseText : 0,
						//
						isOKc ? _oXMLH.getAllResponseHeaders() : 0, _oXMLH, URL);
					}
					// URL之protocol==file:
					// 可能需要重新.loadXML((.responseText+'').replace(/<\?xml[^?]*\?>/,""))
					// 用 .responseXML.documentElement 可調用
					deprecated_get_URL.doing--;
					deprecated_get_URL.clean(URL);
					return;
				}
			} else if (new Date - (m ? m.start : deprecated_get_URL.startTime) > deprecated_get_URL.timeout)
				// timeout & timeout function
				// http://www.stylusstudio.com/xmldev/199912/post40380.html
				// _oXMLH.abort();
				e = new Error(deprecated_get_URL.timeoutCode, 'Timeout');
		// alert(URL+'\n'+_t+'\n'+e+'\n'+_oXMLH.readyState+'\n'+handle_function);
		if (e) {
			handle_function(e, 0, _oXMLH, URL);
			deprecated_get_URL.doing--;
			deprecated_get_URL.clean(URL);
		}// handle_function.apply(e,URL);
	};

	/**
	 * agent content handle function<br />
	 * 有head時content包含回應，否則content表error
	 */
	deprecated_get_URL.HandleContent = function(content, head, _oXMLHttp, URL) {
		if (head) {
			// _oXMLHttp.getResponseHeader("Content-Length")
			alert("URL:	" + URL + "\nHead:\n"
					+ _oXMLHttp.getAllResponseHeaders()
					+ "\n------------------------\nLastModified: "
					+ _oXMLHttp.getResponseHeader("Last-Modified")
					+ "\nResult:\n" + _oXMLHttp.responseText.slice(0, 200));// _oXMLHttp.responseXML.xml
		} else {
			// error
			// test時，可用deprecated_get_URL.XMLHttp.open("HEAD","_URL_",true);，deprecated_get_URL(url,handle_function,'HEAD',true)。
			if (content instanceof Error)
				alert('Error occured!\n'
						+ (typeof e == 'object' && e.number ? e.number + ':'
								+ e.message : e || ''));
			else if (typeof _oXMLHttp == 'object' && _oXMLHttp)
				alert((_oXMLHttp.status == 404 ? "URL doesn't exist!"
						: 'Error occured!')
						+ '\n\nStatus: '
						+ _oXMLHttp.status
						+ '\n'
						+ _oXMLHttp.statusText);
		}
	};

	// 在MP模式下清乾淨queue
	deprecated_get_URL.clean = function(i, force) {
		if (force || deprecated_get_URL.multi_request)
			if (!i && isNaN(i)) {
				if (deprecated_get_URL.q)
					for (i in deprecated_get_URL.i)
						try {
							deprecated_get_URL.q[deprecated_get_URL.i[i]].XMLHttp
									.abort();
							// deprecated_get_URL.q[deprecated_get_URL.i[i]].XMLHttp=null;
						} catch (e) {
						}
				deprecated_get_URL.q = deprecated_get_URL.i
				// =null
				= 0;
			} else if (!isNaN(i)
					|| !isNaN(i = deprecated_get_URL.i[typeof i == 'object' ? i.uri
							: i])) {
				try {
					deprecated_get_URL.q[i].XMLHttp.abort();
				} catch (e) {
				}

				// deprecated_get_URL.q[i].XMLHttp=0;
				delete deprecated_get_URL.i[deprecated_get_URL.q[i].uri];
				deprecated_get_URL.q[i] = 0;
			}
	};

	// ↑XMLHttp set ==================
	// ---------------------------------------------------------------------//

	// @see https://github.com/request/request

	var node_url, node_http, node_https,
	// reuse the sockets (keep-alive connection).
	node_http_agent, node_https_agent,
	//
	node_zlib;

	/**
	 * 快速 merge cookie: 只檢查若沒有重複的 key，則直接加入。不檢查 path 也不處理 expires, domain,
	 * secure。<br />
	 * 為增加效率，不檢查 agent.last_cookie 本身之重複的 cookie。
	 * 
	 * @param {Object}agent
	 *            node_http_agent / node_https_agent
	 * @param {Array}cookie
	 *            new cookie to merge
	 * 
	 * @returns {Object}agent.last_cookie
	 * 
	 * @inner
	 */
	function merge_cookie(agent, cookie) {
		// normalize
		if (!Array.isArray(agent.last_cookie))
			agent.last_cookie = agent.last_cookie ? [ agent.last_cookie ] : [];
		if (!Array.isArray(cookie))
			cookie = cookie ? [ cookie ] : [];

		// remove duplicate cookie

		if (!agent.last_cookie_hash)
			agent.last_cookie_hash = library_namespace.null_Object();
		// key_hash[key] = index of agent.last_cookie
		var key_hash = agent.last_cookie_hash;

		cookie.forEach(function(piece) {
			var matched = piece.match(/^[^=;]+/);
			if (!matched) {
				library_namespace.warn('merge_cookie: Invalid cookie? ['
						+ piece + ']');
				agent.last_cookie.push(piece);
			} else if (matched[0] in key_hash) {
				library_namespace.debug('duplicated cookie! 以後來/新出現者為準。 ['
						+ agent.last_cookie[key_hash[matched[0]]] + ']→['
						+ piece + ']', 3, 'merge_cookie');
				agent.last_cookie[key_hash[matched[0]]] = piece;
			} else {
				// 正常情況。
				// 登記已存在之cookie。
				key_hash[matched[0]] = agent.last_cookie.length;
				agent.last_cookie.push(piece);
			}
		});

		// console.log(agent.last_cookie);
		return agent.last_cookie;
	}

	// 正處理中之 connections
	// var get_URL_node_connection_Set = new Set;

	// 正處理中之 connections
	var get_URL_node_connections = 0,
	// 所有 requests
	get_URL_node_requests = 0;

	/**
	 * 讀取 URL via node http/https。<br />
	 * assert: arguments 必須與 get_URL() 相容！
	 * 
	 * @param {String|Object}URL
	 *            欲請求之目的 URL or options
	 * @param {Function}[onload]
	 *            callback when successful loaded. For failure handling, using
	 *            option.onfail(error);
	 * @param {String}[charset]
	 *            character encoding of HTML web page. e.g., 'UTF-8', big5,
	 *            euc-jp,..
	 * @param {String|Object}[post_data]
	 *            text data to send when method is POST
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://nodejs.org/api/http.html#http_http_request_options_callback
	 *      https://nodejs.org/api/https.html#https_https_request_options_callback
	 * 
	 * @since 2015/1/13 23:23:38
	 */
	function get_URL_node(URL, onload, charset, post_data, options) {
		get_URL_node_requests++;
		if (get_URL_node_connections >= get_URL_node.connects_limit) {
			library_namespace.debug('Waiting ' + get_URL_node_connections
			// 避免同時開過多 connections 的機制。
			+ '/' + get_URL_node_requests + ' connections: '
					+ JSON.stringify(URL), 3, 'get_URL_node');
			var _arguments = arguments;
			setTimeout(function() {
				get_URL_node_requests--;
				get_URL_node.apply(null, _arguments);
			}, 500);
			return;
		}
		// 進入 request 程序
		get_URL_node_connections++;

		// 前導作業。
		if (library_namespace.is_Object(charset)) {
			post_data = charset;
			charset = null;
		}
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// console.log('-'.repeat(79));
		// console.log(JSON.stringify(options));
		// console.log(options.form_data);
		if (options.form_data && options.form_data !== to_form_data_generated) {
			// TODO: charset for post_data
			to_form_data(post_data, function(data) {
				// console.log(data.toString().slice(0,800));
				// console.log('>> ' + data.toString().slice(-200));
				// throw 3;
				options.form_data = to_form_data_generated;
				get_URL_node(URL, onload, charset, data, options);
			}, options.form_data);
			return;
		}

		if (library_namespace.is_Object(URL) && URL.URL) {
			Object.assign(options, URL);
			onload = options.onload || onload;
			post_data = options.post || post_data;
			charset = options.charset || charset;
			URL = options.URL;
		}

		// https://developer.mozilla.org/en-US/docs/Web/API/URL
		// [ origin + pathname, search, hash ]
		// hrer = [].join('')
		if (Array.isArray(URL)) {
			URL = get_URL.add_parameter(URL[0], URL[1], URL[2], charset);
		}

		if (options.search || options.hash) {
			URL = get_URL.add_parameter(URL, options.search, options.hash,
					charset);
		}

		library_namespace.debug('URL: (' + (typeof URL) + ') [' + URL + ']', 1,
				'get_URL_node');

		if (typeof onload === 'object') {
			// use JSONP.
			// need callback.
			for ( var callback_param in onload) {
				if (callback_param
						&& typeof onload[callback_param] === 'function') {
					// 模擬 callback。
					URL += '&' + callback_param + '=cb';
					onload = onload[callback_param];
					break;
				}
			}
		}

		// assert: 自此開始不會改變 URL，也不會中途 exit 本函數。
		if (false) {
			if (get_URL_node_connection_Set.has(URL)) {
				library_namespace.warn('get_URL_node: Already has [' + URL
						+ ']. 同時間重複請求？');
			} else {
				get_URL_node_connection_Set.add(URL);
			}
		}

		if (post_data && !options.form_data) {
			post_data = get_URL.parameters_to_String(post_data, charset);
		}

		if (!onload && typeof options.onchange === 'function') {
			onload = function() {
				options.onchange(readyState_done);
			};
		}

		if (options.async === false && onload || typeof onload !== 'function') {
			onload = false;
		}

		var _URL = node_url.parse(URL),
		// 不改到 options。
		agent = options.agent;
		if (agent) {
			library_namespace.debug('使用' + (agent === true ? '新' : '自定義')
					+ ' agent。', 6, 'get_URL_node');
			if (agent === true) {
				// use new agent
				agent = _URL.protocol === 'https:' ? new node_https.Agent
						: new node_http.Agent;
			}
		} else {
			agent = _URL.protocol === 'https:' ? node_https_agent
					: node_http_agent;
		}

		var request, finished,
		// result_Object模擬 XMLHttp。
		result_Object = {
			// node_agent : agent,
			// for debug
			// url : _URL,
			// 因為可能 redirecting 過，這邊列出的才是最終 URL。
			URL : URL
		},
		// assert: 必定從 _onfail 或 _onload 作結，以確保會註銷登記。
		// 本函數unregister()應該放在所有本執行緒會執行到onload的程式碼中。
		unregister = function() {
			if (false) {
				library_namespace.info('unregister [' + URL + ']'
						+ (finished ? ': had done!' : '') + ' '
						+ get_URL_node_requests + ' requests left.');
			}
			/**
			 * @see http://stackoverflow.com/questions/24667122/http-request-timeout-callback-in-node-js
			 * 
			 * sometimes both timeout callback and error callback will be called
			 * (the error inside the error callback is ECONNRESET - connection
			 * reset)
			 * 
			 * there is a possibilities that it fires on('response',
			 * function(response)) callback altogether
			 */
			if (finished) {
				return true;
			}
			// 註銷登記。
			finished = true;
			get_URL_node_requests--;
			get_URL_node_connections--;
			if (timeout_id) {
				library_namespace.debug('clear timeout ' + (timeout / 1000)
						+ 's [' + URL + ']', 3, 'get_URL_node');
				// console.trace('clear timeout ' + URL);
				clearTimeout(timeout_id);
			}
			if (false && !get_URL_node_connection_Set['delete'](URL)) {
				library_namespace.warn('get_URL_node: URL not exists in Set: ['
						+ URL + ']. 之前同時間重複請求？');
			}
		},
		// on failed
		_onfail = function(error) {
			if (unregister()) {
				// 預防 timeout 時重複執行。
				return;
			}

			if (typeof options.onfail === 'function') {
				options.onfail(error);
				return;
			}

			if (!options.no_warning) {
				console.error('get_URL_node: Get error when retrieving [' + URL
						+ ']:');
				// 這裡用太多並列處理，會造成 error.code "EMFILE"。
				console.error(error);
			}
			// 在出現錯誤時，將 onload 當作 callback。並要確保 {Object}response
			// 因此應該要先檢查error再處理response
			onload(result_Object, error);
		},
		// on success
		_onload = function(result) {
			// 在這邊不過剛開始從伺服器得到資料，因此還不可執行unregister()，否則依然可能遇到timeout。
			if (finished) {
				return;
			}

			if (/^3/.test(result.statusCode)
			//
			&& result.headers.location && result.headers.location !== URL
			//
			&& !options.no_redirect) {
				if (unregister()) {
					// 預防 timeout 時重複執行。
					return;
				}

				try {
					request.abort();
				} catch (e) {
				}

				// e.g., 301
				// 不動到原來的 options。
				options = Object.clone(options);
				options.URL = node_url.resolve(URL, result.headers.location);
				library_namespace.debug(result.statusCode + ' Redirecting to ['
						+ options.URL + '] ← [' + URL + ']', 1, 'get_URL_node');
				get_URL_node(options, onload, charset, post_data);
				return;
			}

			// {Number}result.statusCode
			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
			result_Object.status = result.statusCode;
			// 在有 options.onfail 時僅 .debug()。但這並沒啥條理...
			if (options.onfail || /^2/.test(result.statusCode)) {
				library_namespace.debug('STATUS: ' + result.statusCode + ' '
						+ URL, 2, 'get_URL_node');
			} else if (!options.no_warning) {
				library_namespace.warn('get_URL_node: [' + URL + ']: status '
						+ result.statusCode);
			}

			library_namespace
					.debug('result HEADERS: ' + JSON.stringify(result.headers),
							4, 'get_URL_node._onload');
			// XMLHttp.headers['content-type']==='text/html; charset=utf-8'
			result_Object.headers = result.headers;
			// 在503之類的情況下。可能沒"Content-Type:"。這時result將無.type。
			if (result.headers['content-type']) {
				// MIME type, media-type: XMLHttp.type
				result_Object.type = result.headers['content-type']
				// charset: XMLHttp.charset
				.replace(/;(.*)$/, function($0, $1) {
					var matched = $1.match(/[; ]charset=([^;]+)/i);
					if (matched) {
						result_Object.charset = matched[1].trim();
					}
					return '';
				}).trim();
			}

			merge_cookie(agent, result.headers['set-cookie']);
			// 為預防字元編碼破碎，因此不能設定 result.setEncoding()？
			// 但經測試，Wikipedia 有時似乎會有回傳字元錯位之情形？
			// 2016/4/9 9:9:7 藉由 delete wiki_API.use_Varnish 似可解決。

			// listener must be a function
			if (typeof onload !== 'function'
			//
			&& !options.write_to && !options.write_to_directory) {
				// 照理unregister()應該放這邊，但如此速度過慢。因此改放在 _onload 一開始。
				unregister();
				library_namespace.warn('got [' + URL
						+ '], but there is no listener!', 1, 'get_URL_node');
				// console.log(result);
				return;
			}

			library_namespace.debug('[' + URL + '] loading...', 3,
					'get_URL_node');
			/** {Array} [ {Buffer}, {Buffer}, ... ] */
			var data = [], length = 0;
			result.on('data', function(chunk) {
				// {Buffer}chunk
				length += chunk.length;
				library_namespace.debug('receive BODY.length: ' + chunk.length
						+ '/' + length + ': ' + URL, 4, 'get_URL_node');
				data.push(chunk);
				// node_fs.appendFileSync('get_URL_node.data', chunk);
			});

			// https://iojs.org/api/http.html#http_http_request_options_callback
			result.on('end', function() {
				library_namespace.debug('end(): ' + URL, 2, 'get_URL_node');
				if (unregister()) {
					// 預防 timeout 時重複執行。
					return;
				}

				// 照理應該放這邊，但如此速度過慢。因此改放在 _onload 一開始。
				// unregister();

				// console.log('No more data in response: ' + URL);
				// it is faster to provide the length explicitly.
				data = Buffer.concat(data, length);

				var encoding = result.headers['content-encoding'];
				// https://nodejs.org/docs/latest/api/zlib.html
				// https://gist.github.com/narqo/5265413
				// https://github.com/request/request/blob/master/request.js
				// http://stackoverflow.com/questions/8880741/node-js-easy-http-requests-with-gzip-deflate-compression
				// http://nickfishman.com/post/49533681471/nodejs-http-requests-with-gzip-deflate-compression
				if (encoding) {
					library_namespace.debug('content-encoding: ' + encoding, 5,
							'get_URL_node');
					switch (encoding && encoding.trim().toLowerCase()) {
					case 'gzip':
						library_namespace.debug('gunzip ' + data.length
								+ ' bytes data ...', 2, 'get_URL_node');
						/**
						 * <code>
						可能因為呼叫到舊版library，於此有時會出現 "TypeError: Object #<Object> has no method 'gunzipSync'"
						有時會有 Error: unexpected end of file
						</code>
						 */
						try {
							data = node_zlib.gunzipSync(data);
						} catch (e) {
							library_namespace.err(
							//
							'get_URL_node: Error: node_zlib.gunzipSync(): ' + e
									+ ' [' + URL + ']');
							if (false) {
								console.log(e);
								console.log(_URL);
								console.log(node_zlib);
								console.log(data);
								console.trace(
								//
								'get_URL_node: Error: node_zlib.gunzipSync()');
								console.error(e.stack);
							}
							// free
							data = null;
							_onfail(e);
							return;
						}
						break;
					case 'deflate':
						library_namespace.debug('deflate data ' + data.length
								+ ' bytes...', 2, 'get_URL_node');
						data = node_zlib.deflateSync(data);
						break;
					default:
						library_namespace
								.warn('get_URL_node: Unknown encoding: ['
										+ encoding + ']');
						break;
					}
				}

				// TODO: 確保資料完整，例如檢查結尾碼。
				// .save_to
				if (options.write_to || options.write_to_directory) {
					var file_path = options.write_to
					// save to: 設定寫入目標。
					|| (options.write_to_directory + '/'
					//
					+ URL.replace(/#.*/g, '').replace(/[\\\/:*?"<>|]/g, '_'))
					// 避免 Error: ENAMETOOLONG: name too long
					.slice(0, 256);
					if (!options.no_warning) {
						library_namespace.info('get_URL_node: Write '
								+ data.length + ' B to [' + file_path + ']: '
								+ URL);
					}
					try {
						var fd = node_fs.openSync(file_path, 'w');
						node_fs.writeSync(fd, data, 0, data.length, null);
						node_fs.closeSync(fd);
					} catch (e) {
						library_namespace.err('get_URL_node: Error to write '
								+ data.length + ' B to [' + file_path + ']: '
								+ URL);
						console.error(e);
					}
				}

				if (typeof options.constent_processor === 'function') {
					options.constent_processor(
					// ({Buffer}contains, URL, status)
					data, URL, result.statusCode);
				}

				// 設定 charset = 'binary' 的話，將回傳 Buffer。
				result_Object.buffer = data;
				if (charset !== 'binary') {
					// 未設定 charset 的話，default charset: UTF-8.
					data = data.toString(charset || 'utf8');
				}

				if (library_namespace.is_debug(4))
					library_namespace.debug(
					//
					'BODY: ' + data, 1, 'get_URL_node');
				// result_Object模擬 XMLHttp。
				result_Object.responseText = data;
				onload && onload(result_Object);
				// free
				data = null;
				// node_fs.appendFileSync('get_URL_node.data', '\n');
			});

		};

		_URL.headers = Object.assign({
			// User Agent
			'User-Agent' : get_URL_node.default_user_agent
		}, options.headers);

		if (node_zlib.gunzipSync
		// && node_zlib.deflateSync
		) {
			// 早期 node v0.10.25 無 zlib.gunzipSync。
			// 'gzip, deflate, *'
			_URL.headers['Accept-Encoding'] = 'gzip,deflate';
		}

		if (post_data) {
			_URL.method = 'POST';
			if (0 && options.form_data) {
				console.log('-'.repeat(79));
				console.log(post_data.to_Array().content_length);
				console.log(post_data);
				throw 1;
			}
			Object.assign(_URL.headers, {
				'Content-Type' : options.form_data
				//
				? 'multipart/form-data; boundary='
				// boundary 存入→ post_data.boundary
				+ post_data.boundary : 'application/x-www-form-urlencoded',
				// prevent HTTP 411 錯誤 – 需要內容長度頭 (411 Length Required)
				'Content-Length' : options.form_data
				//
				? post_data.to_Array().content_length
				// NG: post_data.length
				: charset ? Buffer.byteLength(post_data, charset) : Buffer
						.byteLength(post_data)
			});
		}
		if (options.method) {
			// e.g., 'HEAD'
			_URL.method = options.method;
		}

		_URL.agent = agent;
		// console.log(agent.last_cookie);
		if (agent.last_cookie) {
			library_namespace.debug('Set cookie: '
					+ JSON.stringify(agent.last_cookie), 3, 'get_URL_node');
			_URL.headers.Cookie = (_URL.headers.Cookie ? _URL.headers.Cookie
					+ ';' : '')
					// cookie is Array @ Wikipedia
					+ (Array.isArray(agent.last_cookie) ? agent.last_cookie
							.join(';') : agent.last_cookie);
			// console.log(_URL.headers.Cookie);
		}
		library_namespace.debug('set protocol: ' + _URL.protocol, 3,
				'get_URL_node');
		if (library_namespace.is_debug(6)) {
			console.log(_URL.headers);
		}
		try {
			request = _URL.protocol === 'https:' ? node_https.request(_URL,
					_onload) : node_http.request(_URL, _onload);
		} catch (e) {
			// e.g., _http_client.js:52
			if (0) {
				throw new TypeError(
						'Request path contains unescaped characters');
			}
			_onfail(e);
			return;
		}

		if (post_data) {
			// console.log(post_data);
			if (options.form_data) {
				(function write_to_request(data) {
					if (Array.isArray(data)) {
						data.forEach(function(chunk) {
							write_to_request(chunk);
						})
					} else {
						request.write(data);
					}
				})(post_data.to_Array());
			} else if (typeof post_data === 'string') {
				library_namespace.debug('set post data: length '
						+ post_data.length, 3, 'get_URL_node');
				library_namespace.debug('set post data: ' + post_data, 6,
						'get_URL_node');
				request.write(post_data);
			} else {
				library_namespace.error('Invalid POST data: '
						+ JSON.stringify(post_data));
			}
		}

		/** {Natural}timeout in ms for get URL. 逾時ms數 */
		var timeout = options.timeout || get_URL_node.default_timeout, timeout_id,
		//
		_ontimeout = function(e) {
			// 可能已被註銷。
			if (finished) {
				return;
			}

			try {
				// http://hylom.net/node-http-request-get-and-timeout
				// timeoutイベントは発生しているものの、イベント発生後も引き続きレスポンスを待ち続けている
				// request.end();
				request.abort();
			} catch (e) {
				// TODO: handle exception
			}
			if (!options.no_warning) {
				library_namespace.info('get_URL_node: timeout '
						+ (timeout / 1000) + 's [' + URL + ']');
			}
			if (!e) {
				e = new Error('Timeout (' + timeout + 'ms): ' + URL);
				e.code = 'TIMEOUT';
			}

			if (options.timeout_retry > 0) {
				// 連線逾期時重新再取得一次。
				library_namespace.log('get_URL_node: Retry [' + URL + '] ('
						+ options.timeout_retry + ')');
				// 不動到原來的 options。
				options = Object.clone(options);
				options.timeout_retry--;
				options.URL = URL;
				get_URL_node(options, onload, charset, post_data);
				return;
			}

			_onfail(e);
		};

		if (timeout > 0) {
			// setTimeout method 1
			// 此方法似乎不能確實於時間到時截斷。或許因為正在 handshaking?
			request.setTimeout(timeout);
			// https://nodejs.org/api/http.html#http_request_settimeout_timeout_callback
			// http://stackoverflow.com/questions/14727115/whats-the-difference-between-req-settimeout-socket-settimeout
			request.on('timeout', _ontimeout);

			// setTimeout method 2
			// {Object}timeout_id @ node.js
			timeout_id = setTimeout(_ontimeout, timeout);
			library_namespace.debug('add timeout ' + (timeout / 1000) + 's ['
					+ URL + ']', 2, 'get_URL_node');
		}

		library_namespace.debug('set onerror: '
				+ (options.onfail ? 'user defined' : 'default handler'), 3,
				'get_URL_node');

		request.on('error', _onfail);
		// 遇到 "Unhandled 'error' event"，或許是 print 到 stdout 時出錯了，不一定是本函數的問題。

		// debug error: socket parse error
		// CloudFlare 遇到 HPE_INVALID_CONSTANT，可能是因為需要 encodeURI(url)。
		if (false && library_namespace.is_debug(6)) {
			request.on('socket', function(socket) {
				if (socket.parser) {
					socket.parser._execute = socket.parser.execute;
					socket.parser.execute = function(d) {
						console.log(d.toString());
						socket.parser._execute(d);
					};
				}
				// console.log('-----------------------------------');
				// console.log(socket.parser.execute);
			});
		}

		request.end();
	}

	/**
	 * default user agent. for some server, (e.g., tools.wmflabs.org)
	 * <q>Requests must have a user agent</q>.
	 * 
	 * @type {String}
	 */
	get_URL_node.default_user_agent = 'CeJS/2.0 (https://github.com/kanasimi/CeJS)';

	// 逾時ms數: 20 minutes
	get_URL_node.default_timeout = 20 * 60 * 1000;
	get_URL_node.connects_limit = 100;

	get_URL_node.get_status = function(item) {
		var status = {
			connections : get_URL_node_connections,
			// connection_list : Array.from(get_URL_node_connection_Set),
			requests : get_URL_node_requests
		};
		return item ? status[item] : status;
	};

	// setup/reset node agent.
	function setup_node(type, options) {
		if (!is_nodejs)
			return;

		if (_.get_URL !== get_URL_node) {
			// 初始化。
			node_url = require('url');
			node_http = require('http');
			node_https = require('https');
			node_zlib = require('zlib');

			_.get_URL = library_namespace
					.copy_properties(get_URL, get_URL_node);
		}

		if (type !== undefined) {
			if (typeof type === 'string')
				type = /^https/i.test(type);
			var agent = type ? new node_https.Agent(options)
					: new node_http.Agent(options);
			if (options && options.as_default) {
				if (type) {
					node_https_agent = agent;
				} else {
					node_http_agent = agent;
				}
			}
			return agent;
		}

		node_http_agent = new node_http.Agent;
		node_https_agent = new node_https.Agent;
		// 不需要。
		// node_http_agent.maxSockets = 1;
		// node_https_agent.maxSockets = 1;
	}

	_.setup_node_net = setup_node;

	// CeL.application.net.Ajax.setup_node_net();
	// library_namespace.application.net.Ajax.setup_node_net();
	setup_node();

	// ---------------------------------------------------------------------//
	// TODO: for non-nodejs

	/** {Object|Function}fs in node.js */
	var node_fs;
	try {
		if (is_nodejs) {
			// @see https://nodejs.org/api/fs.html
			node_fs = require('fs');
		}
		if (typeof node_fs.readFile !== 'function') {
			throw true;
		}
	} catch (e) {
		library_namespace.debug('無 node.js 之 fs，因此不具備 node 之檔案操作功能。');
		if (false) {
			// enumerate for get_URL_cache_node
			// 模擬 node.js 之 fs，以達成最起碼的效果（即無 cache 功能的情況）。
			node_fs = {
				readFile : function(file_name, charset, callback) {
					callback(true);
				},
				writeFile : library_namespace.null_function
			};
		}
	}

	/**
	 * <code>

	cache 相關函數:
	@see
	application.storage.file.get_cache_file
	application.OS.Windows.file.cacher
	application.net.Ajax.get_URL_cache
	application.net.wiki wiki_API.cache() CeL.wiki.cache()

	</code>
	 */

	/**
	 * cache 作業操作之輔助套裝函數。
	 * 
	 * TODO: 以 HEAD 檢測，若有新版本則不採用 cache。
	 * 
	 * @param {String|Object}URL
	 *            欲請求之目的 URL or options
	 * @param {Function}[onload]
	 *            callback when successful loaded. onload(data, error/is_cached)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 */
	function get_URL_cache_node(URL, onload, options) {
		if (typeof options === 'string') {
			// auto-detecting
			options = /\.[a-z\d\-]+$/i.test(options) ? {
				file_name : options
			} : {
				encoding : options
			};
		} else if (!library_namespace.is_Object(options)) {
			// 前置處理。
			options = library_namespace.null_Object();
		}

		var file_name = options.file_name,
		/** {String}file encoding for fs of node.js. */
		encoding = 'encoding' in options ? options.encoding
				: get_URL_cache_node.encoding;

		if (!file_name && (file_name = URL.match(/[^\/]+$/))) {
			// 自URL取得檔名。
			file_name = file_name[0];
		}
		if (!file_name) {
			onload(undefined, new Error('No file name setted.'));
			return;
		}

		node_fs.readFile(file_name, encoding, function(error, data) {
			if (!options.reget) {
				if (!error) {
					library_namespace.debug('Using cached data.', 3,
							'get_URL_cache_node');
					library_namespace.debug('Cached data: ['
							+ data.slice(0, 200) + ']...', 5,
							'get_URL_cache_node');
					// TODO: use cached_status
					onload(data, true);
					return;
				}

				library_namespace.debug(
						'No valid cached data. Try to get data...', 3,
						'get_URL_cache_node');
			}

			_.get_URL(URL, function(XMLHttp, error) {
				if (error) {
					library_namespace.err(
					//
					'get_URL_cache_node.cache: Error to get URL: [' + URL
							+ '].');
					// WARNING: XMLHttp 僅在重新取得URL時提供。
					onload(undefined, error, XMLHttp);
					return;
				}

				// .buffer: node only.
				data = !encoding && XMLHttp.buffer || XMLHttp.responseText;
				// 資料事後處理程序 (post-processor):
				// 將以 .postprocessor() 的回傳作為要處理的資料。
				if (typeof options.postprocessor === 'function') {
					data = options.postprocessor(data, XMLHttp);
				}
				/**
				 * 寫入cache。
				 * 
				 * 若出現錯誤，則不寫入cache。
				 */
				if (data && /[^\\\/]$/.test(file_name)) {
					library_namespace.info(
					//
					'get_URL_cache_node.cache: Write cache data to ['
							+ file_name + '].');
					library_namespace.debug('Cache data: '
							+ (data && JSON.stringify(data).slice(0, 190))
							+ '...', 3, 'get_URL_cache_node');
					node_fs.writeFileSync(file_name, data, encoding);
				}
				onload(data, undefined, XMLHttp);
			},
			// character encoding of HTML web page
			// is different from the file we want to save to
			options.charset, options.post_data, options.get_URL_options);
		});
	}

	/** {String}預設 file encoding for fs of node.js。 */
	get_URL_cache_node.encoding = 'utf8';

	if (is_nodejs) {
		_.get_URL_cache = get_URL_cache_node;
	}

	// ---------------------------------------------------------------------//

	// export 導出.

	return (_// JSDT:_module_
	);
}
