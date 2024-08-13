/**
 * @name CeL function for Ajax (Asynchronous JavaScript and XML)
 * @fileoverview 本檔案包含了模擬WWW客戶端發送HTTP/HTTPS請求用的 functions。
 * @since 2015/1/1
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.Ajax',

	// Promise for fetch()
	require : 'data.code.compatibility.'
	// library_namespace.copy_properties()
	+ '|data.native'
	// MIME_of()
	+ '|application.net.MIME.'
	// for CeL.to_file_name(), CeL.URI, CeL.Search_parameters
	+ '|application.net.',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	function time_message(millisecond) {
		if (library_namespace.age_of) {
			return library_namespace.age_of(0, millisecond, {
				digits : 1
			});
		}

		return millisecond % 1000 === 0 ? millisecond / 1000 + 's'
				: millisecond + 'ms';
	}

	// "Error: socket hang up" {code: 'ECONNRESET'}
	// "Error: connect ETIMEDOUT 1.1.1.1:80"
	// {errno:'ETIMEDOUT', code: 'ETIMEDOUT', address: '125.89.70.31', port:80 }
	// Error: connect ECONNREFUSED 127.0.0.1:443
	// "Error: read ECONNRESET"
	// {errno: 'ECONNRESET', code: 'ECONNRESET', syscall: 'read'}
	// Error: getaddrinfo ENOTFOUND domain
	// ERROR_BAD_STSTUS
	// Error: Timeout 30s
	function localize_error(error) {
		var message = String(error);
		if (library_namespace.gettext) {
			// 處理特別的錯誤訊息。
			var matched = message
					.match(/^(Error: (?:(?:connect|getaddrinfo) E[A-Z]+|Timeout) )(.+)$/);
			if (matched) {
				message = [ matched[1] + '%1', matched[2] ];
			}
			message = Array.isArray(message)
			// gettext_config:{"id":"error-connect-etimedout-$1","mark_type":"combination_message_id"}
			// gettext_config:{"id":"error-connect-econnrefused-$1","mark_type":"combination_message_id"}
			// gettext_config:{"id":"error-getaddrinfo-enotfound-$1","mark_type":"combination_message_id"}
			// gettext_config:{"id":"error-timeout-$1","mark_type":"combination_message_id"}
			? library_namespace.gettext.apply(null, message)
			// gettext_config:{"id":"error-socket-hang-up","mark_type":"combination_message_id"}
			// gettext_config:{"id":"error-read-econnreset","mark_type":"combination_message_id"}
			// gettext_config:{"id":"error-write-econnaborted","mark_type":"combination_message_id"}
			// gettext_config:{"id":"error-unexpected-end-of-file","mark_type":"combination_message_id"}
			: library_namespace.gettext(message);
		}
		return message;
	}

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

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
			// Release memory. 釋放被占用的記憶體.
			AS = null;
			return X;
		} catch (e) {
			library_namespace.warn('get_page: ' + e.message);
		}
	}

	// ---------------------------------------------------------------------//

	var KEY_URL = typeof Symbol === 'function' ? Symbol('URL')
			: '\0URL to fetch';

	/**
	 * 
	 * @param URL_to_fetch
	 * @param search
	 * @param hash
	 * @returns
	 * 
	 * @inner
	 */
	function set_parameters_and_hash(URL_to_fetch, search, hash) {
		// URL_to_fetch = library_namespace.URI(URL_to_fetch);
		// assert: library_namespace.is_URI(URL_to_fetch)
		if (hash || hash === '') {
			if (Object.defineProperty[KEY_not_native] && !/^#/.test(hash))
				hash = '#' + hash;
			URL_to_fetch.hash = hash;
		}
		URL_to_fetch.search_params.set_parameters(search);
		// console.trace(URL_to_fetch.toString(charset));
		return URL_to_fetch;
	}

	function normalize_URL_to_fetch(URL_to_fetch, charset, options) {
		// console.trace(URL_to_fetch);

		// https://developer.mozilla.org/en-US/docs/Web/API/URL
		// [ origin + pathname, search, hash ]
		// hrer = [].join('')
		if (Array.isArray(URL_to_fetch)) {
			URL_to_fetch = set_parameters_and_hash(library_namespace
					.URI(URL_to_fetch[0]), URL_to_fetch[1], URL_to_fetch[2]);
			if (charset)
				URL_to_fetch.charset = charset;
		} else {
			// 當輸入 {URL} 時，node_https.request() 會將 {URL} 轉成
			// {Object}options，不會考慮額外選項 (headers, ...)。
			// 且必須處理 charset，乾脆直接將 {URL} 轉成尋常 plain object / {URI}。
			// https://nodejs.org/api/http.html#http_http_request_url_options_callback
			// If url is a string, it is automatically parsed with new URL(). If
			// it is a URL object, it will be automatically converted to an
			// ordinary options object.

			// console.trace([ URL_to_fetch, charset ]);
			URL_to_fetch = library_namespace.URI(URL_to_fetch, null, {
				charset : charset
			});
			// console.trace(URL_to_fetch);
		}
		// assert: library_namespace.is_URI(URL_to_fetch)
		// console.trace(URL_to_fetch);

		if (options.search || options.hash) {
			URL_to_fetch = set_parameters_and_hash(URL_to_fetch,
					options.search, options.hash);
		}

		library_namespace.debug({
			T : [ 'Fetching URL: %1', '{' + (typeof URL_to_fetch) + '} ['
			//
			+ (typeof URL_to_fetch === 'string' ? URL_to_fetch
			//
			: URL_to_fetch && URL_to_fetch[KEY_URL]
			//
			|| URL_to_fetch.toString(charset)) + ']' ]
		}, 1, 'normalize_URL_to_fetch');

		return URL_to_fetch;
	}

	if (false)
		// default arguments
		var get_URL_arguments = {
			URL : '',
			charset : '',
			// HTTP方法，如"GET", "POST", HEAD, "PUT", "DELETE"等。
			method : 'GET',
			post_data : {},
			async : true,
			// user name. 驗證用使用者名稱。
			user : '',
			// 驗證用密碼。
			password : '',
			// header
			headers : {
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
	 * @param {String|Object}URL_to_fetch
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
	 * TODO: 代理伺服器 using proxy server
	 * 
	 * @see https://developer.mozilla.org/zh-TW/docs/DOM/XMLHttpRequest
	 *      http://msdn.microsoft.com/en-us/library/ie/ms535874.aspx
	 */
	function get_URL(URL_to_fetch, onload, charset, post_data, options) {
		// 前導作業。
		if (library_namespace.is_Object(charset) && !options) {
			options = post_data;
			post_data = charset;
			charset = null;
		}
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// ------------------------------------------------------

		if (library_namespace.is_Object(URL_to_fetch) && URL_to_fetch[KEY_URL]) {
			Object.assign(options, URL_to_fetch);
			// 注意: options.onload 另有用途!
			// https://xhr.spec.whatwg.org/#handler-xhr-onloadstart
			// onload = options.onload || onload;
			post_data = options.post || post_data;
			charset = options.charset || charset;
			URL_to_fetch = options[KEY_URL];
		}

		URL_to_fetch = normalize_URL_to_fetch(URL_to_fetch, charset, options);
		// assert: library_namespace.is_URI(URL_to_fetch)

		if (typeof onload === 'object') {
			library_namespace.debug(
					'Trying to JSONP, insert page, need callback.', 3,
					'get_URL');
			// library_namespace.run(URL_to_fetch);
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
						library_namespace.debug('[' + URL_to_fetch
								+ ']: callback 完自動移除 .js。', 2, 'get_URL');
						document_head.removeChild(node);
						// Release memory. 釋放被占用的記憶體.
						node = null;
						delete library_namespace[callback_name];
						onload[callback_param](data);
					};
					// callback_param: callback parameter
					URL_to_fetch.search_params[callback_param] = library_namespace.Class
							+ '.' + callback_name;
					node.src = URL_to_fetch.toString();
					library_namespace.debug('Use script node: [' + node.src
							+ ']', 3, 'get_URL');
					document_head.appendChild(node);
					return;
				}
			}
			library_namespace.debug('Skip JSONP. No callback specified.', 3,
					'get_URL');
		}

		if (post_data && !options.form_data) {
			post_data = library_namespace.Search_parameters(post_data)
					.toString(charset);
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
			// IE:404 會 throw error, timeout 除了 throw error,
			// 還會 readystatechange;
			// Gecko 亦會 throw error
			// IE 10 中，local file 光 .open() 就 throw 了。
			XMLHttp.open(options.method || (post_data ? 'POST' : 'GET'),
					URL_to_fetch.toString(), !!onload, options.user || '',
					options.password || '');

			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/response
			// XMLHttp.responseType = 'blob';

			if (options.timeout > 0 && !onload) {
				// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/timeout
				XMLHttp.timeout = options.timeout;
				if (typeof options.onfail === 'function')
					XMLHttp.ontimeout = function(e) {
						options.onfail.call(XMLHttp, e || 'Timeout');
					};
			}
			// TODO: 處理有 onload 下之 timeout 逾時ms數
			// Ajax 程式應該考慮到 server 沒有回應時之處置

			if (library_namespace.is_Object(options.headers)
			// https://developer.mozilla.org/zh-TW/docs/Web/API/XMLHttpRequest/setRequestHeader
			// `!!XMLHttp.setRequestHeader` will throw @ HTA (HTML Application)
			&& ('setRequestHeader' in XMLHttp)) {
				Object.keys(options.headers).forEach(function(key) {
					XMLHttp.setRequestHeader(key, options.headers[key]);
				});
			}

			if (options.mime) {
				// ignore charset!
				charset = options.mime;
			} else if (charset) {
				// old: 'text/xml;charset=' + charset
				// 但這樣會被當作 XML 解析，產生語法錯誤。
				// TODO: try:
				// 'text/'+(/\.x(ht)?ml$/i.test(URL_to_fetch)?'xml':'plain')+';charset='
				// + charset;
				charset = 'application/json;charset=' + charset;
			}

			// 有些版本的 Mozilla 瀏覽器在伺服器送回的資料未含 XML mime-type
			// 檔頭（header）時會出錯。為了避免這個問題，可以用下列方法覆寫伺服器傳回的檔頭，以免傳回的不是 text/xml。
			// http://squio.nl/blog/2006/06/27/xmlhttprequest-and-character-encoding/
			// http://www.w3.org/TR/XMLHttpRequest/ search encoding
			if (charset && XMLHttp.overrideMimeType)
				XMLHttp.overrideMimeType(charset);

			if (onload) {
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
			}

			// 若檔案不存在，會 throw。
			XMLHttp.send(post_data || null);

			if (!onload) {
				// XMLHttp.response blob
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
			library_namespace.error(e);
			if (typeof options.onfail === 'function') {
				options.onfail(XMLHttp, e);
			} else if (onload) {
				onload(undefined, e);
			}
		}

	}

	_.get_URL = get_URL;

	// TODO: 處理 multiple requests
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
					throw new Error(
					// gettext_config:{"id":"the-chunk-do-not-has-regular-.content_length"}
					'The chunk do not has regular .content_length!');
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
			// gettext_config:{"id":"illegal-chunk.content_length"}
			throw new Error('Illegal chunk.content_length!');
		}

		boundary = form_data_new_line + '--' + this.boundary;
		if (!is_slice) {
			boundary += '--';
		}
		generated.push(boundary);
		content_length += boundary.length;

		generated.content_length = content_length;
		// console.log(generated);
		return generated;
	}

	// 選出 data.generated 不包含之 string
	function give_boundary(data_Array) {
		function not_includes_in(item) {
			// console.trace([ typeof item, item ]);
			return Array.isArray(item) ? item.every(not_includes_in)
			// item: Should be {String} or {Buffer}
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
		throw new Error('give_boundary: '
		// gettext_config:{"id":"retry-too-many-times"}
		+ 'Retry too many times!');
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
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
				var headers = 'Content-Disposition: '
						+ (slice ? 'file' : 'form-data; name="' + key + '"')
						+ '; filename="' + encodeURIComponent(value) + '"'
						+ "; filename*=UTF-8''" + encodeURIComponent(value)
						+ form_data_new_line;
				if (MIME_type) {
					headers += 'Content-Type: ' + MIME_type
							+ form_data_new_line;
				}
				if (is_nodejs && Buffer.isBuffer(content)) {
					headers += 'Content-Transfer-Encoding: binary'
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
						content = node_fs.readFileSync(value);
					} catch (e) {
						// When we cannot read, it will throw now.
						// e.g., Error: ENOENT: no such file or directory, open
						// 'value'
					}
				} else {
					// node.js 之下此方法不能處理 binary data。
					content = library_namespace
							.get_file(value/* , 'binary' */);
				}
				if (!content) {
					library_namespace.error([ 'to_form_data: ', {
						// gettext_config:{"id":"failed-to-get-file-$1"}
						T : [ 'Failed to get file: [%1]', value ]
					} ]);
					// Skip this one.
					callback();
					return;
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

			library_namespace.debug({
				// gettext_config:{"id":"fetching-url-$1"}
				T : [ '自網路取得 URL：%1', value ]
			}, 1, 'to_form_data');
			_.get_URL(value, function(XMLHttp, error) {
				if (options && options.url_post_processor) {
					options.url_post_processor(value, XMLHttp, error);
				}
				if (error) {
					library_namespace.error([ 'to_form_data: ', {
						// gettext_config:{"id":"got-error-when-retrieving-$1-$2"}
						T : [ 'Got error when retrieving [%1]: %2',
						//
						value, localize_error(error) ]
					} ]);
					// Skip this one.
					callback();
					return;
				}

				// value: url → file name
				value = value.replace(/[?#].*$/, '')
						.match(/([^\\\/]*)[\\\/]?$/)[1];
				// console.log('-'.repeat(79));
				// console.log(value);

				library_namespace.debug({
					// gettext_config:{"id":"got-url-from-the-network-$1-$2-bytes"}
					T : [ '自網路取得 URL：%1，%2{{PLURAL:%2|位元組}}。', value,
							XMLHttp.buffer.length ]
				}, 1, 'to_form_data');
				push_and_callback(XMLHttp.type, XMLHttp.buffer);
			}, 'buffer');
		}

		parameters = library_namespace.Search_parameters(parameters);

		var root_data = [], keys = Object.keys(parameters), index = 0;
		root_data.to_Array = form_data_to_Array;
		// console.log('-'.repeat(79));
		// console.log(keys);
		// 因為在遇到fetch url時需要等待，因此採用async。
		function process_next() {
			if (false) {
				console.log('-'.repeat(60));
				console.log('process_next: ' + index + '/' + keys.length);
				console.log(root_data);
			}

			if (index === keys.length) {
				// 決定 boundary
				give_boundary(root_data);
				// WARNING: 先結束作業: 生成 .to_Array()，
				// 才能得到 root_data.to_Array().content_length。
				root_data.to_Array();
				if (false) {
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

			// 預防有 null, undefined, {Number}, true 之類。
			if (!value || typeof value === 'number'
					|| typeof value === 'boolean') {
				value = String(value);
			}

			var headers;
			if (is_nodejs && typeof value === 'string') {
				value = Buffer.from(value, 'utf8');
				headers = 'Content-Type: text/plain; charset=UTF-8'
						+ form_data_new_line;
			}

			// 非檔案，屬於普通的表單資料。
			if (!key) {
				throw new Error('No key for value: ' + value);
			}
			if (!value && value !== '') {
				// e.g., token=undefined
				throw new TypeError('Invalid type of ' + key + ': '
						+ typeof value);
			}

			// @see function push_and_callback(MIME_type, content)
			headers = 'Content-Disposition: form-data; name="' + key + '"'
					+ form_data_new_line + (headers || '') + form_data_new_line;
			var chunk = [ headers, value ];
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
	function d_func(content,headers[,XMLHttp,URL]){
		if(headers){
			//	content,headers各為XMLHttp.responseText內容及XMLHttp.getAllResponseHeaders()，其他皆可由XMLHttp取得。
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
		if (typeof _f.XMLHttp === 'object') {
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

		if (!f[KEY_URL]
				|| !(_f.XMLHttp = library_namespace.new_XMLHttp(f.enc,
						!/\.x(?:ht)?ml$/i.test(f[KEY_URL]))))
			// throw
			return;

		// try{_f.XMLHttp.overrideMimeType('text/xml');}catch(e){}
		if (typeof f.async !== 'boolean')
			// 設定f.async
			f.async = f.fn ? true : false;
		else if (!f.async)
			f.fn = null;
		else if (!f.fn)
			if (typeof _f.HandleStateChange !== 'function'
					|| typeof _f.HandleContent !== 'function')
				// 沒有能處理的function
				// throw
				return;
			else
				// =null;
				f.fn = _f.HandleContent;
		if (/* typeof _f.multi_request!=='undefined'&& */_f.multi_request) {
			if (!_f.q)
				// queue
				_f.i = {}, _f.q = [];
			// ** 沒有考慮到 POST 時 URL 相同的情況!
			_f.i[f[KEY_URL]] = _f.q.length;
			_f.q.push({
				uri : f[KEY_URL],
				XMLHttp : _f.XMLHttp,
				func : f.fn,
				start : _f.startTime = new Date
			});
		} else if (_f.q && typeof _f.clean === 'function')
			_f.clean();

		// for Gecko Error: uncaught exception: Permission denied to call method
		// XMLHttpRequest.open
		if (f[KEY_URL].indexOf('://') !== NOT_FOUND
				&& typeof netscape === 'object')
			if (_f.asked > 2) {
				_f.clean(f[KEY_URL]);
				return;
			} else
				try {
					if (typeof _f.asked === 'undefined') {
						_f.asked = 0;
						alert('我們需要一點權限來使用 XMLHttpRequest.open。\n* 請勾選記住這項設定的方格。');
					}
					netscape.security.PrivilegeManager
					// UniversalBrowserAccess
					.enablePrivilege('UniversalXPConnect');
				} catch (e) {
					_f.asked++;
					_f.clean(f[KEY_URL]);
					return;
				}

		// if(isNaN(_f.timeout))_f.timeout=300000;//5*60*1000;
		try {
			// IE:404會throw error, timeout除了throw error, 還會readystatechange;
			// Gecko亦會throw error
			try {
				_f.XMLHttp.setRequestHeader("Accept-Encoding",
						"gzip, deflate, br");
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
			if (f.method === 'POST'
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
				// application/x-www-form-urlencoded; charset=utf-8
				: 'application/x-www-form-urlencoded');
			}
			_f.XMLHttp.abort();
			_f.XMLHttp.open(f.method || 'GET', f[KEY_URL], f.async, f.user
					|| null, f.passwd || null);
			// alert((f.method||'GET')+','+f[KEY_URL]+','+f.async);
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
				_f.XMLHttp.onreadystatechange = typeof f.fn === 'function'
				//
				? f.fn : function(e) {
					_f.HandleStateChange(e, f[KEY_URL], f.fn);
				}
				// ||null
				;
				// 應加 clearTimeout( )
				setTimeout('try{deprecated_get_URL.'
						//
						+ (_f.multi_request ? 'q[' + _f.i[f[KEY_URL]] + ']'
								: 'XMLHttp')
						+ '.onreadystatechange();}catch(e){}',
				// 5*60*1000;
				_f.timeout || 3e5);
			}
			_f.XMLHttp.send(f.sendDoc || null);
			if (!f.fn) {
				/**
				 * 非async(異步的)能在此就得到 response。Safari and Konqueror cannot
				 * understand the encoding of text files!
				 * 
				 * @see http://www.kawa.net/works/js/jkl/parsexml.html
				 */
				// responseXML: responseXML.loadXML(text)
				return _f.XMLHttp.responseText;
			}
		} catch (e) {
			if (typeof f.fn === 'function')
				f.fn(e);
			else if (typeof window === 'object')
				window.status = e.message;
			return e;
		}
	}
	deprecated_get_URL.timeoutCode = -7732147;

	/**
	 * agent handle function
	 * 
	 * e: object Error, handle_function: function(return text, headers,
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
		if (!handle_function || typeof handle_function !== 'function') {
			deprecated_get_URL.doing--;
			deprecated_get_URL.clean(URL);
			return;
		}
		// http://big5.chinaz.com:88/book.chinaz.com/others/web/web/xml/index1/21.htm
		if (!e)
			if (typeof _oXMLH === 'object' && _oXMLH) {
				if (_oXMLH.parseError
						&& _oXMLH/* .responseXML */.parseError.errorCode !== 0)
					e = _oXMLH.parseError, e = new Error(e.errorCode, e.reason);
				else if (_oXMLH.readyState === 4) {
					// only if XMLHttp shows "loaded"

					// condition is OK?
					isOKc = _oXMLH.status;
					isOKc = isOKc >= 200
							&& isOKc < 300
							|| isOKc === 304
							|| !isOKc
							&& (location.protocol === "file:" || location.protocol === "chrome:");
					if (handle_function === deprecated_get_URL.HandleContent)
						// handle_function.apply()
						handle_function(0, isOKc, _oXMLH, URL);
					else {
						// handle_function.apply()
						handle_function(isOKc ? _t ? _oXMLH.responseXML
								// JKL.ParseXML: Safari and Konqueror cannot
								// understand the encoding of text files.
								: typeof window === 'object'
										&& window.navigator.appVersion
												.indexOf("KHTML") !== NOT_FOUND
										&& !(e = escape(_oXMLH.responseText))
												.indexOf("%u") !== NOT_FOUND
								//
								? e : _oXMLH.responseText : 0,
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
	 * 有headers時content包含回應，否則content表error
	 */
	deprecated_get_URL.HandleContent = function(content, headers, _oXMLHttp,
			URL) {
		if (headers) {
			// _oXMLHttp.getResponseHeader("Content-Length")
			alert("URL:	" + URL + "\nHeaders:\n"
					+ _oXMLHttp.getAllResponseHeaders()
					+ "\n------------------------\nLastModified: "
					+ _oXMLHttp.getResponseHeader("Last-Modified")
					+ "\nResult:\n" + _oXMLHttp.responseText.slice(0, 200));// _oXMLHttp.responseXML.xml
		} else {
			// error
			// test時，可用deprecated_get_URL.XMLHttp.open("HEAD","_URL_",true);，deprecated_get_URL(url,handle_function,'HEAD',true)。
			if (content instanceof Error)
				alert('Error occured!\n'
						+ (typeof e === 'object' && e.number ? e.number + ':'
								+ e.message : e || ''));
			else if (typeof _oXMLHttp === 'object' && _oXMLHttp)
				alert((_oXMLHttp.status === 404 ? "URL doesn't exist!"
						: 'Error occured!')
						+ '\n\nStatus: '
						+ _oXMLHttp.status
						+ '\n'
						+ _oXMLHttp.statusText);
		}
	};

	// 在MP模式下清乾淨queue
	deprecated_get_URL.clean = function(i, force) {
		// multiple requests
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
					|| !isNaN(i = deprecated_get_URL.i[typeof i === 'object' ? i.uri
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

	var node_url, node_http, node_http2, node_https,
	// reuse the sockets (keep-alive connection).
	node_http_agent, node_http2_agent, node_https_agent,
	//
	node_zlib;

	/**
	 * 快速 merge cookie: 只檢查若沒有重複的 key，則直接加入。不檢查 path 也不處理 expires, domain,
	 * secure。<br />
	 * 為增加效率，不檢查 agent.last_cookie 本身之重複的 cookie。
	 * 
	 * TODO: create class Cookie, Cookie.prototype.merge(),
	 * Cookie.prototype.clone()
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
		// 初始化 initialization + 正規化 normalization
		var last_cookie = agent.last_cookie;
		if (!Array.isArray(last_cookie)) {
			last_cookie = agent.last_cookie = agent.last_cookie ? [ agent.last_cookie ]
					: [];
		}
		if (!cookie) {
			cookie = [];
		} else if (typeof cookie === 'string') {
			cookie = cookie.split(';');
		}
		// assert: Array.isArray(cookie)

		// console.log(agent);
		// console.log(last_cookie.cookie_hash);
		// console.trace(cookie);

		// cookie_index_of[key] = index of last_cookie
		var cookie_index_of = last_cookie.cookie_index_of;
		if (!cookie_index_of) {
			if (last_cookie.length > 0) {
				// regenerate agent.last_cookie
				delete agent.last_cookie;
				last_cookie = merge_cookie(agent, last_cookie);
				// assert: last_cookie === agent.last_cookie
			} else {
				last_cookie.cookie_index_of = Object.create(null);
				last_cookie.cookie_hash = Object.create(null);
			}
			cookie_index_of = last_cookie.cookie_index_of;
		}
		var cookie_hash = last_cookie.cookie_hash;
		// assert: !!cookie_hash === true

		cookie.forEach(function for_each_cookie_piece(piece) {
			piece = piece.trim();
			if (!piece)
				return;
			// [ cookie value without path / domain / expires,
			// key, value, extra ]
			var matched = piece.match(/^([^=;]+)(?:=([^;]+))?(.*)$/);
			library_namespace.debug('last_cookie: ' + last_cookie, 3,
					'merge_cookie');
			// console.log(matched);
			var key, value;
			if (matched) {
				key = matched[1];
				value = matched[2];

			} else {
				library_namespace.warn([ 'merge_cookie: ', {
					// gettext_config:{"id":"invalid-cookie"}
					T : 'Invalid cookie?'
				}, ' [' + piece + ']' ]);
				// treat cookie piece as key
				key = piece;
				value = '';
			}

			if (!key)
				return;

			cookie_hash[key] = value;

			if (key in cookie_index_of) {
				// assert: (key in cookie_hash) === true
				library_namespace.debug([ {
					// gettext_config:{"id":"duplicate-cookie-name!-the-later-newcomer-will-prevail"}
					T : 'cookie 名稱重複！以後來/新出現者為準。'
				}, ' [' + last_cookie[cookie_index_of[key]]
				//
				+ ']→[' + piece + ']' ], 3, 'merge_cookie');
				// remove duplicate cookie: 直接取代。
				last_cookie[cookie_index_of[key]] = piece;

			} else {
				// assert: (key in cookie_hash) === false
				library_namespace.debug([ {
					T : '正常情況。登記已存在之 cookie。'
				} ], 3, 'merge_cookie');
				// console.trace(matched);
				cookie_index_of[key] = last_cookie.length;
				last_cookie.push(piece);
			}
		});

		// console.trace(cookie_hash);
		// console.trace(last_cookie);

		library_namespace.debug('array: ' + JSON.stringify(last_cookie), 3,
				'merge_cookie');
		library_namespace.debug('hash: ' + JSON.stringify(cookie_hash), 3,
				'merge_cookie');
		return last_cookie;
	}

	_.merge_cookie = merge_cookie;

	function set_cookie_to_URL_object(URL_options_to_fetch, agent) {
		// console.trace('agent.last_cookie:');
		// console.log(agent.last_cookie);
		if (agent.last_cookie) {
			// 使用 cookie
			library_namespace.debug('agent.last_cookie: '
					+ JSON.stringify(agent.last_cookie), 3,
					'set_cookie_to_URL_object');
			library_namespace.debug('agent.last_cookie.cookie_hash: '
					+ JSON.stringify(agent.last_cookie.cookie_hash), 3,
					'set_cookie_to_URL_object');
			var cookie = (URL_options_to_fetch.headers.Cookie ? URL_options_to_fetch.headers.Cookie
					+ ';'
					: '')
					// cookie is Array @ Wikipedia
					+ (Array.isArray(agent.last_cookie) ? agent.last_cookie
					// 去掉 expires=...; path=/; domain=...; HttpOnly
					// 這個動作不做也可以，不影響結果。
					.map(function(cookie) {
						return cookie.replace(/;.*/, '');
					}).join('; ') : agent.last_cookie);
			if (cookie) {
				URL_options_to_fetch.headers.Cookie = cookie;
			} else {
				delete URL_options_to_fetch.headers.Cookie;
			}
		}
		library_namespace.debug('Set cookie: '
				+ JSON.stringify(URL_options_to_fetch.headers.Cookie), 3,
				'set_cookie_to_URL_object');
		library_namespace.debug('Set protocol: '
				+ URL_options_to_fetch.protocol, 3, 'set_cookie_to_URL_object');
		library_namespace.debug('Set headers: '
				+ JSON.stringify(URL_options_to_fetch.headers), 3,
				'set_cookie_to_URL_object');
	}

	// ---------------------------------------------------------------------//

	// 正處理中之 connections
	var get_URL_node_connections = 0,
	// 所有 requests
	get_URL_node_requests = 0;

	// 強制使用POST傳送。
	var FORCE_POST = {
		FORCE_POST : true
	};

	var ERROR_BAD_STSTUS = 'BAD STATUS';

	var KEY_not_native = library_namespace.env.not_native_keyword;
	var has_native_URL = typeof URL === "function" && !URL[KEY_not_native];

	/**
	 * 讀取 URL via node http/https。<br />
	 * assert: arguments 必須與 get_URL() 相容！
	 * 
	 * @param {String|Object}URL_to_fetch
	 *            欲請求之目的 URL or options
	 * @param {Function}[onload]
	 *            callback when successful loaded. For failure handling, using
	 *            options.onfail(error);
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
	function get_URL_node(URL_to_fetch, onload, charset, post_data, options) {
		if (!URL_to_fetch) {
			onload(undefined, new SyntaxError('No URL input.'));
			return;
		}

		get_URL_node_requests++;
		if (get_URL_node_connections >= get_URL_node.connects_limit) {
			library_namespace.debug({
				// gettext_config:{"id":"waiting-$1-$2-connections-$3"}
				T : [ 'Waiting %1/%2 {{PLURAL:%1|connection|connections}}: %3',
				// 避免同時開過多 connections 的機制。
				get_URL_node_connections, get_URL_node_requests,
						String(URL_to_fetch) ]
			}, 3, 'get_URL_node');
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
		if (library_namespace.is_Object(charset) && !options) {
			options = post_data;
			post_data = charset;
			charset = null;
		}
		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// console.log('-'.repeat(79));
		// console.log(JSON.stringify(options));
		// console.log(options.form_data);
		if (options.form_data && options.form_data !== to_form_data_generated) {
			// console.trace(options);
			// TODO: charset for post_data
			to_form_data(post_data, function(data) {
				if (false) {
					console.log('>> '
					// library_namespace.data.code.string_digest()
					+ library_namespace.string_digest(data.toString(), 200));
				}
				options.form_data = to_form_data_generated;
				get_URL_node(URL_to_fetch, onload, charset, data, options);
			}, options.form_data);
			return;
		}

		// ------------------------------------------------------

		if (library_namespace.is_Object(URL_to_fetch) && URL_to_fetch[KEY_URL]) {
			Object.assign(options, URL_to_fetch);
			// 注意: options.onload 另有用途!
			// https://xhr.spec.whatwg.org/#handler-xhr-onloadstart
			// onload = options.onload || onload;
			post_data = options.post || post_data;
			charset = options.charset || charset;
			URL_to_fetch = options[KEY_URL];
		}

		// 不改變 options。
		var agent = options.agent;
		if (typeof URL_to_fetch === 'string' && URL_to_fetch.startsWith('//')) {
			// 處理 '//domain.org/path' 的情況。
			URL_to_fetch = (agent && agent.protocol || 'https:') + URL_to_fetch;
		}

		var URL_options_to_fetch = normalize_URL_to_fetch(URL_to_fetch,
				charset, options);
		// assert: library_namespace.is_URI(URL_options_to_fetch)
		// console.trace([ URL_to_fetch, URL_options_to_fetch ]);

		if (typeof onload === 'object') {
			library_namespace.debug(
					'Trying to JSONP, insert page, need callback.', 3,
					'get_URL_node');
			// library_namespace.run(URL_options_to_fetch);
			for ( var callback_param in onload) {
				if (callback_param
						&& typeof onload[callback_param] === 'function') {
					// 模擬 callback。
					// callback_param: callback parameter
					URL_options_to_fetch.search_params[callback_param] = 'cb';
					onload = onload[callback_param];
					break;
				}
			}
		}

		// assert: 自此開始不會改變 URL，也不會中途 exit 本函數。

		if (post_data && !options.form_data) {
			if (library_namespace.is_Object(post_data)
					&& options.headers
					&& typeof options.headers['Content-Type'] === 'string'
					&& options.headers['Content-Type']
							.includes('application/json')) {
				post_data = JSON.stringify(post_data) || FORCE_POST;

			} else {
				post_data = library_namespace.Search_parameters(post_data)
						.toString(options.post_data_charset || charset)
						|| FORCE_POST;
			}
		}

		if (!onload && typeof options.onchange === 'function') {
			onload = function() {
				options.onchange(readyState_done);
			};
		}

		if (options.async === false && onload || typeof onload !== 'function') {
			onload = false;
		}

		// console.trace(URL_options_to_fetch);
		// node_http.request(options): options needs a .path
		// https://nodejs.org/dist/latest/docs/api/http.html#http_http_request_options_callback
		URL_options_to_fetch.path = URL_options_to_fetch.pathname
				+ URL_options_to_fetch.search;

		var URL_is_https = /^https:?$/i.test(URL_options_to_fetch.protocol);

		// console.trace([ URL_to_fetch, URL_options_to_fetch.toString() ]);
		URL_to_fetch = URL_options_to_fetch.toString();
		// assert: {String}URL_to_fetch,
		// library_namespace.is_URI(URL_options_to_fetch)

		/**
		 * https://stackoverflow.com/questions/53593182/client-network-socket-disconnected-before-secure-tls-connection-was-established
		 * mh160.js 必須使用 request，https-proxy-agent 才能正常工作 TODO:
		 * socks-proxy-agent
		 * 
		 * <code>

		// https://techcult.com/free-proxy-software-for-windows-10/#1_Ultrasurf
		> SET http_proxy=http://127.0.0.1:9666
		> node u17.js 镇魂街

		</code>
		 */

		/**
		 * <code>

		// http://anonproxyserver.sourceforge.net/
		// https://www.proxynova.com/proxy-server-list/country-tw/
		var http = require("http");
		var options = {
			host: "211.22.233.69",
			port: 3128,
			path: "http://dict.revised.moe.edu.tw/cgi-bin/cbdic/gsweb.cgi?ccd=9gW4am&o=e0&sec=sec11&option=linkout001&actice=layout",
			//method: 'GET',
			headers: {
				Host: "dict.revised.moe.edu.tw"
			}
		};
		var request=http.request(options, function(response) {
			console.log(response.statusCode);
			console.log(response.headers);
			var data = [], length = 0;
			response.on('data', function(chunk) {length += chunk.length;data.push(chunk);});
			response.on('end', function() {data = Buffer.concat(data, length);console.log(data+'')});
		});
		request.end();



		require('./work_crawler_loader.js'); var PROXY='localhost:8080';

		CeL.get_URL('https://zh.wikipedia.org/wiki/Special:%E6%9C%80%E8%BF%91%E6%9B%B4%E6%94%B9',function(X){console.log(X.responseText)},null,null,{proxy:PROXY});
		CeL.get_URL('https://zh.wikipedia.org/wiki/Special:%E6%9C%80%E8%BF%91%E6%9B%B4%E6%94%B9',function(X){console.log(X.responseText)});

		CeL.get_URL('http://dict.revised.moe.edu.tw/cgi-bin/cbdic/gsweb.cgi?ccd=9gW4am&o=e0&sec=sec11&option=linkout001&actice=layout',function(X){console.log(X.responseText)},null,null,{proxy:PROXY});
		CeL.get_URL('http://dict.revised.moe.edu.tw/cgi-bin/cbdic/gsweb.cgi?ccd=9gW4am&o=e0&sec=sec11&option=linkout001&actice=layout',function(X){console.log(X.responseText)});

		// TODO: test agent, cookie

		</code>
		 */

		var proxy_original_agent,
		// using_proxy_server
		proxy_server = options.proxy
		// https://curl.haxx.se/docs/manpage.html
		// https://superuser.com/questions/876100/https-proxy-vs-https-proxy
		// https://docs.oracle.com/cd/E56344_01/html/E54018/gmgas.html
		// https://stackoverflow.com/questions/32824819/difference-between-http-proxy-https-proxy-and-proxy
		|| URL_is_https && process.env.HTTPS_PROXY
		// `SET http_proxy=http://127.0.0.1:8080`
		|| process.env.http_proxy;

		if (!proxy_server
				|| !(proxy_server = library_namespace.URI(proxy_server))) {
			;

		} else if (URL_is_https) {
			library_namespace.debug({
				// gettext_config:{"id":"using-https-proxy-to-get-url-$1"}
				T : [ 'Using HTTPS proxy to get URL: %1', URL_to_fetch ]
			}, 2, 'get_URL_node');
			// ... just add the special agent:
			proxy_original_agent = proxy_server.agent = agent;
			agent = new HttpsProxyAgent(proxy_server);
			// 複製必要的舊屬性。
			if (proxy_original_agent && proxy_original_agent.last_cookie) {
				// 複製原agent的cookie設定。 @see merge_cookie()
				agent.last_cookie = proxy_original_agent.last_cookie;
			}
			// https://github.com/TooTallNate/node-https-proxy-agent/blob/master/index.js
			// ALPN is supported by Node.js >= v5.
			// attempt to negotiate http/1.1 for proxy servers that support
			// http/2
			if (!('ALPNProtocols' in URL_options_to_fetch)) {
				URL_options_to_fetch.ALPNProtocols = [ 'http 1.1' ];
			}

		} else {
			library_namespace.debug({
				// gettext_config:{"id":"using-http-proxy-to-get-url-$1"}
				T : [ 'Using HTTP proxy to get URL: %1', URL_to_fetch ]
			}, 2, 'get_URL_node');
			// https://www.proxynova.com/proxy-server-list/country-tw/
			// proxy_server.URL_to_fetch = URL_to_fetch;

			// 代理伺服器 using proxy server
			// https://stackoverflow.com/questions/3862813/how-can-i-use-an-http-proxy-with-node-js-http-client
			// https://cnodejs.org/topic/530f41e75adfcd9c0f1c8c16

			URL_options_to_fetch = get_proxy_URL(proxy_server,
					URL_options_to_fetch, URL_to_fetch);
		}

		if (!URL_options_to_fetch.protocol) {
			URL_options_to_fetch.protocol = agent && agent.protocol
			// 直接設定。 default: https://
			|| (proxy_server ? 'http:' : 'https:');
			URL_is_https = URL_options_to_fetch.protocol === 'https:';
		}

		if (agent) {
			library_namespace.debug({
				// gettext_config:{"id":"using-new-agent"}
				T : agent === true ? '使用新 agent。'
				// gettext_config:{"id":"using-custom-agent"}
				: '使用自定義 agent。'
			}, 6, 'get_URL_node');
			if (agent === true) {
				// use new agent.
				options.agent = agent = URL_is_https ? new node_https.Agent
						: new node_http.Agent;
			} else if (agent.protocol
			// agent.protocol 可能是 undefined。
			&& agent.protocol !== URL_options_to_fetch.protocol) {
				var message = {
					// gettext_config:{"id":"the-custom-agent-is-different-from-the-url-and-will-try-to-adopt-the-conforming-agreement-$1"}
					T : [ '自定義 agent 與 URL 之協定不同，將嘗試採用符合的協定：%1',
					//
					agent.protocol + ' !== ' + URL_options_to_fetch.protocol ]
				};
				if (options.no_protocol_warn) {
					library_namespace.debug(message, 3, 'get_URL_node');
				} else {
					library_namespace.warn([ 'get_URL_node: ', message ]);
				}
				// use new agent.
				// assert: options.agent === agent
				agent = URL_is_https ? new node_https.Agent
						: new node_http.Agent;
				// 複製必要的舊屬性。
				if (options.agent.last_cookie) {
					// 複製原agent的cookie設定。 @see merge_cookie()
					agent.last_cookie = options.agent.last_cookie;
				}
			}
		} else {
			// gettext_config:{"id":"using-generic-agent"}
			library_namespace.debug('採用泛用的 agent。', 6, 'get_URL_node');
			agent = URL_is_https ? node_https_agent : node_http_agent;
		}

		// console.log([ options.cookie, agent.last_cookie ]);
		if (options.cookie && !agent.last_cookie) {
			library_namespace.debug({
				// gettext_config:{"id":"reset-the-cookie-to-$1"}
				T : [ '重新設定 cookie 成：%1', options.cookie ]
			}, 3, 'get_URL_node');
			agent.last_cookie = options.cookie;
		}

		var request, finished,
		// result_Object 模擬 XMLHttp response。
		result_Object = {
			// node_agent : agent,

			// .url @ fetch()
			// url : URL_to_fetch,

			// https://developer.mozilla.org/zh-TW/docs/Web/API/Response
			// .useFinalURL @ fetch()
			// useFinalURL : URL_to_fetch,

			// 因為可能 redirecting 過，這邊列出的才是最終 URL。
			// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseURL
			responseURL : URL_to_fetch
		},
		// assert: 必定從 _onfail 或 _onload 作結，以確保會註銷登記。
		// 本函數unregister()應該放在所有本執行緒會執行到onload的程式碼中。
		unregister = function() {
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
				library_namespace.debug('clear timeout '
						+ time_message(timeout) + ' [' + URL_to_fetch + ']', 3,
						'get_URL_node');
				// console.trace('clear timeout ' + URL_to_fetch);
				clearTimeout(timeout_id);
			}
		},
		// on failed
		_onfail = function(error) {
			if (unregister()) {
				// console.log('exit: 預防 timeout 時重複執行。');
				return;
			}

			// console.trace([ options.error_count, options.error_retry ]);
			// 連線逾期/失敗時再重新取得頁面之重試次數。
			if (options.error_retry >= 1
			// 例如當遇到 404 或 502 時，再多嘗試一下。
			&& !(options.error_retry <= options.error_count)) {
				if (!options.get_URL_cloned) {
					// 不動到原來的 options。
					options = Object.clone(options);
					options.get_URL_cloned = true;
				}
				if (options.error_count >= 1) {
					options.error_count++;
				} else {
					options.error_count = 1;
				}
				options[KEY_URL] = URL_to_fetch;
				// Failed to get [' + URL_to_fetch + '].
				library_namespace.log([ 'get_URL_node: ', {
					// gettext_config:{"id":"retry-$1-$2-$3"}
					T : [ 'Retry %1/%2: %3', options.error_count,
					//
					options.error_retry, localize_error(error) ]
				} ]);
				// console.error(error);
				// library_namespace.set_debug(3);
				get_URL_node(options, onload, charset, post_data);
				// console.trace(options);
				return;
			}

			if (typeof options.onfail === 'function') {
				options.onfail.call(result_Object, error);
				return;
			}

			if (!options.no_warning
			// 應已在 _ontimeout 出過警告訊息。
			&& error.code !== 'TIMEOUT') {
				if (error.code === 'ENOTFOUND') {
					library_namespace.error([ 'get_URL_node: ', {
						// gettext_config:{"id":"url-not-found-$1"}
						T : [ 'URL not found: [%1]', URL_to_fetch ]
					} ]);
				} else if (error.code === 'EPROTO'
						&& require('tls').DEFAULT_MIN_VERSION === 'TLSv1.2'
						&& library_namespace.platform('node', 12)) {
					library_namespace.error([ 'get_URL_node: ', {
						T :
						// gettext_config:{"id":"node.js-v12-and-later-versions-disable-tls-v1.0-and-v1.1-by-default"}
						'Node.js v12 and later versions disable TLS v1.0 and v1.1 by default.'
					}, {
						T :
						// gettext_config:{"id":"please-set-tls.default_min_version-=-tlsv1-first"}
						'Please set tls.DEFAULT_MIN_VERSION = "TLSv1" first!'
					}, ' [' + URL_to_fetch + ']' ]);
					/**
					 * <code>
					To solve:
					get_URL_node: Retry 1/4: Error: write EPROTO 14180:error:1425F102:SSL routines:ssl_choose_client_version:unsupported protocol:c:\ws\deps\openssl\openssl\ssl\statem\statem_lib.c:1922:

					require('tls').DEFAULT_MIN_VERSION = 'TLSv1';
					</code>
					 */
				} else {
					library_namespace.error([ 'get_URL_node: ', {
						// gettext_config:{"id":"got-error-when-retrieving-$1-$2"}
						T : [ 'Got error when retrieving [%1]: %2',
						//
						URL_to_fetch, localize_error(error) ]
					} ]);
					// 這裡用太多並列處理，會造成 error.code "EMFILE"。
					// console.error(error);
					// console.error(options);
				}
			}
			// 在出現錯誤時，將 onload 當作 callback。並要確保 {Object}response
			// 因此應該要先檢查 error 再處理 response
			typeof onload === 'function' && onload(result_Object, error);
		},
		// on success
		_onload = function(response) {
			// response object: Class: http.IncomingMessage

			// 在這邊不過剛開始從伺服器得到資料，因此還不可執行unregister()，否則依然可能遇到timeout。
			if (finished) {
				return;
			}

			if (options.onresponse) {
				options.onresponse(response);
			}
			// https://xhr.spec.whatwg.org/#handler-xhr-onloadstart
			if (false && options.onloadstart) {
				options.onloadstart();
			}

			// 若原先有agent，應該合併到原先的agent，而非可能為暫時性/泛用的agent。
			merge_cookie(options.agent || agent, response.headers['set-cookie']);
			// 先合併完cookie之後才能轉址，否則會漏失掉須設定的cookie。

			if (false && response.complete
					&& (response.statusCode / 100 | 0) !== 2) {
				console.log('response:');
				console.log(response);
			}
			if ((response.statusCode / 100 | 0) === 3
					&& response.headers.location
					&& response.headers.location !== URL_to_fetch
					&& !options.no_redirect) {
				if (unregister()) {
					// 預防 timeout 時重複執行。
					return;
				}

				try {
					// request.abort();
					request.destroy();
				} catch (e) {
				}

				// e.g., 301
				if (!options.get_URL_cloned) {
					// 不動到原來的 options。
					options = Object.clone(options);
					options.get_URL_cloned = true;
				}
				options[KEY_URL] = new URL(response.headers.location,
						URL_to_fetch);
				library_namespace.debug({
					// gettext_config:{"id":"$1-redirecting-to-$2-←-$3"}
					T : [ '%1 Redirecting to [%2] ← [%3]', response.statusCode,
							options[KEY_URL], URL_to_fetch ]
				}, 1, 'get_URL_node');
				get_URL_node(options, onload, charset,
				// 重新導向的時候亦傳送 post data。For wiki API
				// e.g., https://github.com/kanasimi/CeJS/issues/12
				// 但piaotian.js搜索作品名稱直接302導向時，加入post_data會產生 405 Not Allowed
				response.statusCode != 302 && post_data);
				return;
			}

			library_namespace.debug({
				// gettext_config:{"id":"response-headers-$1"}
				T : [ 'response HEADERS: %1',
				//
				JSON.stringify(response.headers) ]
			}, 4, 'get_URL_node._onload');
			// 模擬 Response of fetch()
			// https://developer.mozilla.org/zh-TW/docs/Web/API/Response
			Object.assign(result_Object, {
				redirected : !!options.get_URL_cloned,
				// {Number}response.statusCode
				// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status
				status : response.statusCode,
				statusText : response.statusMessage,
				// XMLHttp.headers['content-type']==='text/html; charset=utf-8'
				headers : response.headers
			});

			// 在有 options.onfail 時僅 .debug()。但這並沒啥條理...
			if (options.onfail || (response.statusCode / 100 | 0) === 2) {
				library_namespace.debug({
					// gettext_config:{"id":"http-status-code-$1-$2"}
					T : [ 'HTTP status code: %1 %2', response.statusCode,
							URL_to_fetch ]
				}, 2, 'get_URL_node');
			} else if (!options.no_warning) {
				library_namespace.warn([ 'get_URL_node: ', {
					// gettext_config:{"id":"exception-http-status-code-$1-$2"}
					T : [ 'Exception HTTP status code %1: %2',
					//
					response.statusCode, URL_to_fetch ]
				} ]);
				// console.trace(response);
			}

			// node.js會自動把headers轉成小寫。
			// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition

			// 在503之類的情況下。可能沒"Content-Type:"。這時 response 將無.type。
			if (response.headers['content-type']) {
				// MIME type, media-type: XMLHttp.type
				result_Object.type = response.headers['content-type']
				// charset: XMLHttp.charset
				.replace(/;(.*)$/, function($0, $1) {
					var matched = $1.match(/[; ]charset=([^;]+)/i);
					if (matched) {
						result_Object.charset = matched[1].trim();
					}
					return '';
				}).trim();
			}

			if (response.headers['content-disposition']) {
				// 從 Content-Disposition 中抽取出檔名。
				// ext-value = charset "'" [ language ] "'" value-chars
				var matched = response.headers['content-disposition']
						.match(/ filename\*\s*=\s*([^';]+)'([^';]*)'([^';]+)/);
				if (matched) {
					matched = matched[3];
				} else if (matched = response.headers['content-disposition']
						.match(/ filename\s*=\s*([^';]+)/)) {
					matched = matched[1];
				}
				if (matched && (matched = matched.trim())) {
					matched = (matched.match(/^"(.*)"$/)
							|| matched.match(/^'(.*)'$/) || [ , matched ])[1];
					if (false) {
						console.log([ matched, result_Object.charset, charset,
								!!library_namespace.decode_URI_component ]);
					}
					try {
						if (!/%[\da-f]{2}/.test(matched)) {
							// 有一些網站經過這個轉換似乎就能夠獲得正確的檔案名稱。
							matched = escape(matched);
						}
						if (false && (result_Object.charset || charset)
								&& library_namespace.decode_URI_component) {
							// 現在沒有實例需要用到這個部分。
							matched = library_namespace.decode_URI_component(
									matched, result_Object.charset || charset);
						} else {
							matched = decodeURIComponent(matched);
							// 有的時候還需要這一項。
							// matched = unescape(matched);
						}
						library_namespace.debug({
							// gettext_config:{"id":"file-name-$1"}
							T : [ '檔案名稱：%1', matched ]
						}, 3, 'get_URL_node');
					} catch (e) {
						// TODO: handle exception
					}
					result_Object.filename = library_namespace
							.to_file_name(matched);
				}
			}

			// listener must be a function
			if (typeof onload !== 'function'
			//
			&& !options.write_to && !options.write_to_directory) {
				// 照理unregister()應該放這邊，但如此速度過慢。因此改放在 _onload 一開始。
				unregister();
				library_namespace.warn([ 'get_URL_node: ', {
					// gettext_config:{"id":"got-url-$1-but-there-is-no-listener"}
					T : [ 'Got URL [%1], but there is no listener!',
					//
					URL_to_fetch ]
				} ]);
				// console.log(response);
				return;
			}

			library_namespace.debug({
				// gettext_config:{"id":"waiting-to-receive-data-transferred-back-from-url-$1"}
				T : [ '等待接收從網址 [%1] 傳輸回的資料……', URL_to_fetch ]
			}, 3, 'get_URL_node');

			var flow_encoding = response.headers['content-encoding'];
			flow_encoding = flow_encoding && flow_encoding.trim().toLowerCase();
			if (false) {
				var pipe = response;
				if (flow_encoding === 'gzip')
					pipe = pipe.pipe(node_zlib.createGunzip());
				else if (flow_encoding === 'deflate')
					pipe = pipe.pipe(node_zlib.createInflate());
				pipe = pipe.pipe(node_fs.createWriteStream(file_path));
			}

			// 準備開始接收資料
			// options.ondatastart: 非正規標準
			if (options.ondatastart) {
				options.ondatastart(response);
			}
			// options.onload https://xhr.spec.whatwg.org/#handler-xhr-onload

			/** {Array} [ {Buffer}, {Buffer}, ... ] */
			var data = [], length = 0,
			// total_size https://xhr.spec.whatwg.org/#progressevent
			total_length = +response.headers['content-length'], lengthComputable = total_length >= 0;
			response.on('data', function(chunk) {
				// {Buffer}chunk
				length += chunk.length;
				var message = [ (options.write_to ? options.write_to + ': '
						: '')
						// + chunk.length + '/'
						+ length
						+ (total_length ? '/' + total_length : '')
						+ ' bytes ('
						// 00% of 0.00MiB
						+ (total_length ? (100 * length / total_length | 0)
								+ '%, ' : '')
						+ (length / 1.024 / (/* Date.now() */(new Date)
								.getTime() - start_time)).toFixed(2)
						+ ' KiB/s)' ];
				message.push(': ' + URL_to_fetch);
				library_namespace.debug('receive BODY.length: '
						+ message.join(''), 4, 'get_URL_node');
				if (options.show_progress && length !== total_length) {
					if (!(options.show_progress > 1)) {
						message.pop();
					}
					library_namespace.log_temporary(message.join(''));
				}

				if (length > options.MAX_BUFFER_SIZE) {
					if (data)
						data = null;
				} else {
					data.push(chunk);
				}

				// node_fs.appendFileSync('get_URL_node.data', chunk);

				if (options.ondata) {
					// 注意: 這邊的 chunk 可能是 gzip 之後的資料!
					options.ondata(chunk);
				}
				// https://xhr.spec.whatwg.org/#handler-xhr-onprogress
				if (false && options.onprogress) {
					options.onprogress(lengthComputable, length, total_length);
				}
			});

			// https://iojs.org/api/http.html#http_http_request_options_callback
			response.on('end', function() {
				library_namespace.debug('end(): [' + response.statusCode + '] '
						+ URL_to_fetch, 2, 'get_URL_node');

				// 照理應該放這邊，但如此速度過慢。因此改放在 _onload 一開始。
				// unregister();

				options.onend && options.onend();

				// console.log('No more data in response: ' + URL_to_fetch);
				// it is faster to provide the length explicitly.
				data = data && Buffer.concat(data, length);
				// console.log(data.slice(0, 200));
				// console.log(data.slice(0, 200).toString());

				if (proxy_original_agent) {
					// recover properties
					proxy_original_agent.last_cookie = agent.last_cookie;
				}

				// 基本檢測。

				if ((response.statusCode / 100 | 0) !== 2
				// 例如當遇到 404 或 502 時，再多嘗試一下。
				&& options.error_retry >= 1
				// 本條件參考 _onfail。
				&& !(options.error_retry <= options.error_count)) {
					_onfail(ERROR_BAD_STSTUS);
					return;
				}

				if (!data) {
					;
				} else if (options.verify) {
					// test: invalid content type
					if (typeof options.verify === 'function') {
						if (!options.verify(data)) {
							_onfail('INVALID');
							return;
						}
					} else {
						// assert: CeL.application.storage.file included
						// e.g., options.verify === 'png'
						var file_type = library_namespace.file_type(data,
								options.verify);
						if (file_type.verified === false) {
							_onfail('Invalid ' + options.verify);
							return;
						}
					}
				} else if (data.length === 0) {
					// 若是容許空內容，應該特別指定 options.allow_blanking。
					if (!options.allow_blanking) {
						_onfail('EMPTY');
						return;
					}
				}

				// https://github.com/nodejs/node/blob/master/doc/api/zlib.md#compressing-http-requests-and-responses
				// https://nodejs.org/docs/latest/api/zlib.html
				// https://gist.github.com/narqo/5265413
				// https://github.com/request/request/blob/master/request.js
				// http://stackoverflow.com/questions/8880741/node-js-easy-http-requests-with-gzip-deflate-compression
				// http://nickfishman.com/post/49533681471/nodejs-http-requests-with-gzip-deflate-compression
				if (flow_encoding && data) {
					library_namespace.debug('content-encoding: '
							+ flow_encoding, 5, 'get_URL_node');
					switch (flow_encoding) {
					case 'gzip':
						library_namespace.debug('gunzip ' + data.length
								+ ' bytes data...', 2, 'get_URL_node');
						/**
						 * <code>
						可能因為呼叫到舊版library，於此有時會出現 "TypeError: Object #<Object> has no method 'gunzipSync'"
						有時會有 Error: unexpected end of file
						</code>
						 */
						try {
							data = node_zlib.gunzipSync(data);
						} catch (error) {
							library_namespace.error(
							// get_URL_node: Error: node_zlib.gunzipSync():
							// Error: unexpected end of file [http://...]
							'get_URL_node: Error: node_zlib.gunzipSync(): '
									+ localize_error(error) + ' ['
									+ URL_to_fetch + ']');
							if (false) {
								console.log(error);
								console.log(URL_options_to_fetch);
								console.log(node_zlib);
								console.log(data);
								console.trace(
								//
								'get_URL_node: Error: node_zlib.gunzipSync()');
								console.error(error.stack);
							}
							// Release memory. 釋放被占用的記憶體.
							data = null;
							_onfail(error);
							return;
						}
						break;
					case 'deflate':
						library_namespace.debug('deflate data ' + data.length
								+ ' bytes...', 2, 'get_URL_node');
						data = node_zlib.deflateSync(data);
						break;
					case 'br':
						library_namespace.debug('brotli data ' + data.length
								+ ' bytes...', 2, 'get_URL_node');
						data = node_zlib.brotliDecompressSync(data);
						break;
					default:
						library_namespace.warn([ 'get_URL_node: ', {
							// gettext_config:{"id":"unknown-http-compression-method-$1"}
							T : [ 'Unknown HTTP compression method: [%1]',
							//
							flow_encoding ]
						} ]);
						break;
					}
				}

				// ------------------------------

				if (data && response.statusCode === 403
				//
				&& data.toString().includes('Cloudflare')
				//
				&& data.toString().includes(' id="captcha-bypass"')) {
					// console.log(data.toString());
					library_namespace.error([ 'get_URL_node: ', {
						// https://github.com/Anorov/cloudflare-scrape
						T : // TODO: https://github.com/codemanki/cloudscraper
						// gettext_config:{"id":"you-need-to-bypass-the-ddos-protection-by-cloudflare"}
						'You need to bypass the DDoS protection by Cloudflare!'
					} ]);
				}

				// ------------------------------
				// setup data of result_Object

				result_Object.buffer = data;
				// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/response
				result_Object.response = data;
				// non-standard 非標準: 設定 charset = 'buffer' 的話，將回傳 {Buffer}。
				if (data && charset !== 'buffer') {
					// 未設定 charset 的話，default charset: UTF-8.
					// buffer.toString(null) will throw!
					data = data.toString(charset || undefined/* || 'utf8' */);
				}

				if (library_namespace.is_debug(4)) {
					library_namespace.debug(
					//
					'BODY: ' + data, 1, 'get_URL_node');
				}
				// result_Object模擬 XMLHttp。
				result_Object.responseText = data;

				// ------------------------------

				if ((response.statusCode / 100 | 0) !== 2) {
					// console.trace(data);

					// ssert: options.error_retry >= 1 ? 最後一次 error
					// : BAD STATUS and get something in `this.response`
					_onfail(ERROR_BAD_STSTUS);
					return;
				}

				if (unregister()) {
					// 預防 timeout 時重複執行。
					return;
				}

				// assert: 執行至此表示成功取得資料、沒有錯誤，
				// 開始正常運作至結尾，不會再有中途 return。

				// TODO: 確保資料完整，例如檢查結尾碼。
				// .save_to
				if (data && (options.write_to || options.write_to_directory)) {
					var file_path = options.write_to
							// save to: 設定寫入目標。
							|| (options.write_to_directory
							//
							+ library_namespace.env.path_separator
							//
							+ library_namespace.to_file_name(
							//
							URL_to_fetch.replace(/#.*/, '').replace(
									/[\\\/:*?"<>|]/g, '_')))
							// 避免 Error: ENAMETOOLONG: name too long
							.slice(0, 256);
					if (!options.no_warning) {
						library_namespace.info([ 'get_URL_node: ', {
							T : [
							// gettext_config:{"id":"write-$2-bytes-to-file-$1-$3"}
							'Write %2 {{PLURAL:%2|byte|bytes}} to file [%1]: %3'
							//
							, file_path, data.length, URL_to_fetch ]
						} ]);
					}
					try {
						var fd = node_fs.openSync(file_path, 'w');
						// TODO: use response.pipe(write_stream);
						// @see GitHub.updater.node.js
						node_fs.writeSync(fd, data, 0, data.length, null);
						node_fs.closeSync(fd);

						// set file modify date
						// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date
						// https://tools.ietf.org/html/rfc7231#section-7.1.1.2
						if (response.headers['date']) {
							try {
								// The "Date" header field represents the date
								// and time at which the message was originated

								// fs.utimesSync(path, atime, mtime)
								// atime: the last time this file was accessed
								node_fs.utimesSync(file_path, new Date,
								// mtime: the last time this file was modified
								response.headers['date']);
							} catch (e) {
								// TODO: handle exception
							}
						}
					} catch (e) {
						library_namespace.error([ 'get_URL_node: ', {
							T : [
							// gettext_config:{"id":"failed-to-write-$2-bytes-to-$1-$3"}
							'Failed to write %2 {{PLURAL:%2|byte|bytes}} to [%1]: %3'
							//
							, file_path, data.length, URL_to_fetch ]
						} ]);
						console.error(e);
					}
				}

				if (typeof options.content_processor === 'function') {
					options.content_processor(
					// ({Buffer}contains, URL, status)
					data, URL_to_fetch, response.statusCode);
				}

				if (typeof options.check_reget === 'function'
				// check_reget(XMLHttp)
				&& options.check_reget(result_Object, options)) {
					options[KEY_URL] = URL_to_fetch;
					get_URL_node(options, onload, charset, post_data);
					return;
				}

				if (typeof onload === 'function') {
					onload(result_Object, !data && !options.allow_blanking);
				}
				// Release memory. 釋放被占用的記憶體.
				data = null;
				// node_fs.appendFileSync('get_URL_node.data', '\n');
			});

		};

		// --------------------------------------------------------------------

		// console.trace([ options.headers, URL_options_to_fetch.headers ]);

		// https://fetch.spec.whatwg.org/#forbidden-header-name
		// 必要的 headers: User-Agent, Accept-Language。其他是為了模擬得更真實點。
		URL_options_to_fetch.headers = Object.assign({
			// 網站的主機名稱。
			Host : URL_options_to_fetch.host,

			// User Agent
			'User-Agent' : get_URL_node.default_user_agent,

			// https://developer.mozilla.org/zh-CN/docs/Glossary/Quality_values
			Accept : 'text/html,application/xhtml+xml,application/xml;q=0.9'
			// 少了 '*/*' CrossRef API 會回應 406 "No acceptable resource available."
			+ ',image/avif' + ',image/webp,image/apng,*/*;q=0.8'
					+ ',application/signed-exchange;v=b3;q=0.9',
			// Accept : 'application/json, text/plain, */*',

			// 為了防止 Cloudflare bot protection(?) 阻擋，必須加上 Accept-Language。
			// TODO: get language from system infomation
			// dm5.js using "Microsoft-IIS/8.5",
			// needs 'Accept-Language' to search!
			'Accept-Language' : 'zh-TW,zh;q=0.9' + ',ja;q=0.8' + ',en;q=0.7',

			// DNT : 1,
			Connection : 'keep-alive',
			'Upgrade-Insecure-Requests' : 1,

			// 'sec-ch-ua-mobile' : '?0',
			// 'sec-ch-ua-platform' : 'Windows',

			// TE 請求型頭部用來指定用戶代理希望使用的傳輸編碼類型。
			// 可以將其非正式稱為 Accept-Transfer-Encoding，這個名稱顯得更直觀一些。
			// 當 TE 設置為 trailers 時，如果服務端支持並且返回了
			// Transfer-Encoding: trailers，那麼同時也必須返回另一個響應標頭 Trailer，
			// TE : 'Trailers',

			// Origin : URL_options_to_fetch.protocol + '://' +
			// URL_options_to_fetch.host

			Pragma : 'no-cache',
			// 'max-age=0'
			'Cache-Control' : 'no-cache'
		}, options.fetch_type === 'image' ? {
			// /\.(jpg|png|webp)$/i.test(URL_to_fetch.replace(/[?#].*/, ''))
			Accept :
			// 每次請求重設這些標頭。
			'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			'Sec-Fetch-Dest' : /* options.fetch_type || */'image',
			'Sec-Fetch-Mode' : 'no-cors',
			'Sec-Fetch-Site' : 'cross-site',
			'Sec-Fetch-User' : undefined
		} : {
			// 為了順暢使用 Cloudflare，必須加上 Sec-Fetch-headers？ e.g., mymhh.js
			// https://blog.kalan.dev/fetch-metadata-request-headers/
			'Sec-Fetch-Dest' : options.fetch_type || 'document',
			'Sec-Fetch-Mode' : 'navigate',
			'Sec-Fetch-Site' : 'none',
			'Sec-Fetch-User' : '?1',
		}, options.headers, URL_options_to_fetch.headers);
		for ( var key in URL_options_to_fetch.headers) {
			if (URL_options_to_fetch.headers[key] === undefined)
				delete URL_options_to_fetch.headers[key];
		}
		// delete URL_options_to_fetch.headers.Referer;
		// console.log(options.headers);

		if (false && /Chrome\//.test(get_URL_node.default_user_agent)) {
			Object.assign(URL_options_to_fetch.headers, {
				'sec-ch-ua' :
				//
				'" Not A;Brand";v="99", "Chromium";v="98", "Google Chrome";v="98"'
			});
		}

		if (node_zlib.gunzipSync
		// && node_zlib.deflateSync
		) {
			// 早期 node v0.10.25 無 zlib.gunzipSync。Added in: v0.11.12
			// 'gzip, deflate, *'
			URL_options_to_fetch.headers['Accept-Encoding'] = 'gzip, deflate'
			// Added in: v11.7.0, v10.16.0
			+ (node_zlib.brotliDecompressSync ? ', br' : '');
		}
		// console.trace(URL_options_to_fetch.headers);

		if (false) {
			// @see jQuery
			if (!options.crossDomain
					&& !URL_options_to_fetch.headers["X-Requested-With"]) {
				URL_options_to_fetch.headers["X-Requested-With"] = "XMLHttpRequest";
			}
		}

		if (post_data) {
			URL_options_to_fetch.method = 'POST';
			var _post_data = post_data === FORCE_POST ? '' : post_data;
			if (false && options.form_data) {
				// console.log('-'.repeat(79));
				// console.log(_post_data.to_Array().content_length);
				// console.trace(_post_data);
			}
			Object.assign(URL_options_to_fetch.headers, {
				'Content-Type' : options.headers
				//
				&& options.headers['Content-Type']
				//
				|| (options.form_data ? 'multipart/form-data; boundary='
				// boundary 存入→ post_data.boundary
				+ _post_data.boundary : 'application/x-www-form-urlencoded'),
				// prevent HTTP 411 錯誤 – 需要內容長度頭 (411 Length Required)
				'Content-Length' : options.form_data
				//
				? _post_data.to_Array().content_length
				// NG: _post_data.length
				: charset ? Buffer.byteLength(_post_data, charset) : Buffer
						.byteLength(_post_data)
			});
		}
		if (options.method) {
			// e.g., 'HEAD'
			URL_options_to_fetch.method = options.method;
		}

		URL_options_to_fetch.agent = agent;
		set_cookie_to_URL_object(URL_options_to_fetch, agent);
		if (library_namespace.is_debug(3)) {
			library_namespace.debug('Set headers: '
					+ JSON.stringify(URL_options_to_fetch.headers), 3,
					'get_URL_node');
			console.log(URL_options_to_fetch.headers);
		}

		// console.log(URL_options_to_fetch);
		try {
			// console.trace([ URL_to_fetch, URL_options_to_fetch ]);
			// request scheme
			request = URL_is_https ? node_https : node_http;

			// from node.js 10.9.0
			// http.request(url[, options][, callback])
			// request: Class: http.ClientRequest
			request = request.request(URL_options_to_fetch, _onload);
		} catch (e) {
			// e.g., _http_client.js:52
			if (false) {
				throw new TypeError(
				// gettext_config:{"id":"request-path-contains-unescaped-characters"}
				'Request path contains unescaped characters');
			}
			_onfail(e);
			return;
		}

		if (options.max_listeners >= 0) {
			/**
			 * 最多平行取得檔案的數量。 <code>
			incase "MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 connect listeners added. Use emitter.setMaxListeners() to increase limit"
			</code>
			 */
			request.setMaxListeners(options.max_listeners);
		}

		if (post_data) {
			var _post_data = post_data === FORCE_POST ? '' : post_data;
			// console.trace(URL_options_to_fetch);
			// console.trace(_post_data);
			if (options.form_data) {
				(function write_to_request(data) {
					if (Array.isArray(data)) {
						data.forEach(function(chunk) {
							write_to_request(chunk);
						})
					} else {
						// console.trace(data);
						request.write(data);
					}
				})(_post_data.to_Array());
			} else if (typeof _post_data === 'string') {
				library_namespace.debug('set post data: length '
						+ _post_data.length, 3, 'get_URL_node');
				if (_post_data) {
					library_namespace.debug('set post data: '
							+ (_post_data.length <= 800
							//
							|| library_namespace.is_debug(6) ? _post_data
									: _post_data.slice(0, 800) + '...'), 3,
							'get_URL_node');
				}
				request.write(_post_data);
			} else {
				library_namespace.error({
					// gettext_config:{"id":"invalid-post-data-$1"}
					T : [ 'Invalid POST data: %1', JSON.stringify(post_data) ]
				});
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
				// request.abort();
				request.destroy();
			} catch (err) {
				// TODO: handle exception
			}
			if (!options.no_warning) {
				library_namespace.info([ 'get_URL_node: ', {
					// gettext_config:{"id":"connection-timeout-for-$1-$2"}
					T : [ 'Connection timeout for %1: [%2]',
					//
					time_message(timeout), URL_to_fetch ]
				} ]);
			}
			if (!e) {
				e = new Error('Timeout ' + time_message(timeout) + ': ['
						+ URL_to_fetch + ']');
				e.code = 'TIMEOUT';
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
			library_namespace.debug({
				// gettext_config:{"id":"add-timeout-$1-$2"}
				T : [ 'Add timeout %1: [%2]', time_message(timeout),
						URL_to_fetch ]
			}, 2, 'get_URL_node');
		} else if (timeout) {
			library_namespace.warn([ 'get_URL_node: ', {
				// gettext_config:{"id":"invalid-timeout-$1"}
				T : [ 'Invalid timeout: %1', timeout ]
			} ]);
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

		var start_time = (new Date).getTime();
		request.end();
	}

	/**
	 * default user agent. for some server, (e.g., tools.wmflabs.org)
	 * <q>Requests must have a user agent</q>.
	 * 
	 * @see https://meta.wikimedia.org/wiki/User-Agent_policy
	 * 
	 * @type {String}
	 */
	get_URL_node.default_user_agent = library_namespace.Class + '/'
			+ library_namespace.version + ' (https://github.com/kanasimi/CeJS)';

	// 逾時ms數: 20 minutes
	get_URL_node.default_timeout = 20 * 60 * 1000;
	get_URL_node.connects_limit = 100;

	get_URL_node.get_status = function(item) {
		var status = {
			connections : get_URL_node_connections,
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

			try {
				node_http2 = require('http2');
			} catch (e) {
				// Is old version. Added in: v8.4.0
			}

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

	function parse_proxy_server(proxy_server) {
		// console.log(proxy_server);
		proxy_server = library_namespace.URI(proxy_server);
		proxy_server.proxy = proxy_server.href;
		// console.log(proxy_server);
		return proxy_server;

		if (typeof proxy_server !== 'string') {
			return proxy_server;
		}

		// href=protocol:(//)?username:password@hostname:port/path/filename?search#hash
		// 代理伺服器 proxy_server: "username:password@hostname:port"
		// [ all, protocol, username, password, hostname, port ]
		var matched = proxy_server
				.match(/^(?:(https?:)\/\/)?(?:([^:@]+)(?::([^@]*))?@)?([^:@]+)(?::(\d{1,5}))?$/);

		if (!matched) {
			return false;
		}

		matched = {
			proxy : matched[0],
			protocol : matched[1],
			username : matched[2],
			password : matched[3],
			hostname : matched[4],
			port : +matched[5]
		};

		return matched;
	}

	function get_proxy_URL(proxy_server, URL_options_to_fetch, URL_to_fetch) {
		var proxy_URL = {
			host : proxy_server.hostname,
			port : proxy_server.port
					|| library_namespace.net.port_of_protocol[URL_options_to_fetch.protocol
							.replace(/:$/, '')]
					|| library_namespace.net.port_of_protocol.https,
			path : URL_to_fetch,
			protocol : URL_options_to_fetch.protocol,
			// method: 'GET',
			headers : {
				Host : URL_options_to_fetch.host
			}
		};
		if (proxy_server.agent) {
			proxy_URL.agent = proxy_server.agent;
		}
		if (proxy_server.username) {
			// https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Authentication
			// https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Headers/Proxy-Authorization
			proxy_URL.headers['Proxy-Authorization'] = 'Basic ' + Buffer.from(
			// proxy.auth
			proxy_server.username + ':' + (proxy_server.password || '')
			//
			).toString('base64');
		}

		return proxy_URL;
	}

	// http://luoxia.me/code/2017/07/16/%E8%81%8A%E8%81%8AAgent&Proxy/
	// https://github.com/TooTallNate/node-https-proxy-agent
	/**
	 * get https:// through proxy 用於取得https網站。
	 * 
	 * @see https://www.vanamco.com/2014/06/24/proxy-requests-in-node-js/
	 *      https://gist.github.com/matthias-christen/6beb3b4dda26bd6a221d
	 * 
	 * modify from:
	 * 
	 * HTTPS Agent for node.js HTTPS requests via a proxy.
	 * blog.vanamco.com/connecting-via-proxy-node-js/
	 */
	function HttpsProxyAgent(proxy_server, options) {
		if (!(this instanceof HttpsProxyAgent))
			return new HttpsProxyAgent(proxy_server, options);

		node_https.Agent.call(this, options || {});

		this.options = Object.assign({}, options);

		// href=protocol:(//)?username:password@hostname:port/path/filename?search#hash
		// 代理伺服器 proxy_server: "username:password@hostname:port"
		proxy_server = library_namespace.URI(proxy_server);
		if (!proxy_server) {
			// gettext_config:{"id":"must-specify-proxy-server-hostname-port"}
			throw new Error('Must specify proxy server: hostname:port')
		}
		this.proxy_server = proxy_server;

		// https://github.com/nodejs/node/blob/master/lib/net.js
		// function connect(...args) { }
		this.createConnection = function connect_proxy_server(options, callback) {
			// do a CONNECT request
			var request = Object.assign(get_proxy_URL(proxy_server, options,
					options.host + ':' + options.port), {
				method : 'CONNECT'
			});
			// console.log(request);
			// 此時若有 agent，會是 https。但是待會要用 http connect。
			delete request.agent;
			delete request.protocol;
			if (proxy_server.agent)
				set_cookie_to_URL_object(request, proxy_server.agent);

			library_namespace.debug('Connect to ' + request.path, 2,
					'HttpsProxyAgent.createConnection');
			request = node_http.request(request);

			request.on('connect', function(response, socket, headers) {
				var tls = require('tls');
				// https://github.com/nodejs/node/issues/27384
				// node.js v12 disable TLS v1.0 and v1.1 by default
				// tls.DEFAULT_MIN_VERSION = 'TLSv1';

				// a tls.TLSSocket object
				var tls_socket = tls.connect({
					host : options.host,
					socket : socket
				}, function() {
					callback(null, tls_socket);
				});
			});

			request.on('error', callback);

			request.end();
		}
	}

	/**
	 * <code>
	node_https.request({
		// like you'd do it usually...
		host : 'twitter.com',
		port : 443,
		method : 'GET',
		path : '/',
	
		// set proxy
		agent : new CeL.HttpsProxyAgent('localhost:8080')
	}, function(resonse) {
		resonse.on('data', function(data) {
			console.log(data.toString());
		});
	}).end();

	</code>
	 */
	_.HttpsProxyAgent = HttpsProxyAgent;

	var node_util;
	if (is_nodejs) {
		node_util = require('util');
		node_util.inherits(HttpsProxyAgent, node_https.Agent);
	}

	// https://github.com/nodejs/node/blob/master/lib/_http_agent.js
	HttpsProxyAgent.prototype.getName = function getName(options) {
		var name = (options.host || 'localhost') + ':'
		//
		+ (options.port || '') + ':' + (options.path || '');
		return name;
	};

	// Almost verbatim copy of http.Agent.addRequest
	// https://github.com/nodejs/node/blob/master/lib/_http_agent.js
	// Agent.prototype.addRequest = function addRequest(req, options
	HttpsProxyAgent.prototype.addRequest = function addRequest(request, options) {
		// Get the key for a given set of request options
		// Agent.prototype.getName
		var name = this.getName(options);

		if (!this.sockets[name])
			this.sockets[name] = [];

		// Do not use this.freeSockets

		if (this.sockets[name].length < this.maxSockets) {
			options.request = request;
			// If we are under maxSockets create a new one.

			this.createSocket(name, options, function(error, tls_socket) {
				if (error) {
					process.nextTick(function emitErrorNT(emitter, error) {
						emitter.emit('error', error);
					}, request, error);
					return;
				}
				// setRequestSocket(agent, request, socket);
				request.onSocket(tls_socket);
				// TODO: set this_agent.options.timeout
			});
		} else {
			// We are over limit so we'll add it to the queue.
			if (!this.requests[name])
				this.requests[name] = [];
			this.requests[name].push(request);
			// lost options???
		}
	};

	// Almost verbatim copy of http.Agent.createSocket
	// https://github.com/nodejs/node/blob/master/lib/_http_agent.js
	// Agent.prototype.createSocket
	HttpsProxyAgent.prototype.createSocket = function createSocket(name,
			options, callback) {
		var this_agent = this;
		options = Object.assign({}, options, this.options);

		options.servername = options.host;
		if (options.request) {
			var hostHeader = options.request.getHeader('host');
			if (hostHeader)
				options.servername = hostHeader.replace(/:.*$/, '');
		}

		var called = false;
		function oncreate(error, tls_socket) {
			if (called)
				return;
			called = true;
			if (error) {
				error.message += ' while connecting to HTTP(S) proxy server '
						+ this_agent.hostname + ':' + this_agent.port;

				if (options.request)
					options.request.emit('error', error);
				else
					throw error;

				return;
			}

			var name = this_agent.getName(options);
			if (!this_agent.sockets[name])
				this_agent.sockets[name] = [];

			this_agent.sockets[name].push(tls_socket);

			// ------------------------
			// function installListeners(agent, socket, options)
			var onFree = function onFree() {
				this_agent.emit('free', tls_socket, options);
			};

			var onClose = function onClose(error) {
				/**
				 * This is the only place where sockets get removed from the
				 * Agent.
				 * 
				 * If you want to remove a socket from the pool, just close it.
				 * 
				 * All socket errors end in a close event anyway.
				 */
				this_agent.removeSocket(tls_socket, options);
			};

			var onRemove = function onRemove() {
				/**
				 * We need this function for cases like HTTP 'upgrade' (defined
				 * by WebSockets) where we need to remove a socket from the pool
				 * because it'll be locked up indefinitely
				 */
				this_agent.removeSocket(tls_socket, options);
				tls_socket.removeListener('close', onClose);
				tls_socket.removeListener('free', onFree);
				tls_socket.removeListener('agentRemove', onRemove);
			};

			tls_socket.on('free', onFree);
			tls_socket.on('close', onClose);
			tls_socket.on('agentRemove', onRemove);
			// ------------------------

			// assert: error === null
			callback(error, tls_socket);
		}

		// call connect_proxy_server()
		this_agent.createConnection(options, oncreate);
	};

	// ---------------------------------------------------------------------//

	// https://github.com/TooTallNate/node-socks-proxy-agent
	function SocksProxyAgent() {
		TODO;
	}

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
		library_namespace.debug([ this.id + ': ', {
			// gettext_config:{"id":"there-is-no-`fs`-package-for-node.js-so-there-is-no-file-operation-function-for-node"}
			T : '無 node.js 之 `fs` 套件，因此不具備 node 之檔案操作功能。'
		} ]);
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
	 * 注意: 若執行 onload() 時沒提供 XMLHttp，表示採用 cache。
	 * 
	 * TODO: 以 HEAD 檢測，若有新版本則不採用 cache。
	 * 
	 * @param {String|Object}URL
	 *            欲請求之目的 URL or options
	 * @param {Function}[onload]
	 *            callback when successful loaded. onload(data, error, XMLHttp)
	 * @param {Object}[options]
	 *            附加參數/設定特殊功能與選項
	 */
	function get_URL_cache_node(URL, onload, options) {
		if (typeof options === 'string') {
			// auto-detecting
			options = /\.[a-z\d\-]+$/i.test(options) ? {
				file_name : options
			} : /[\\\/]+$/i.test(options)
			// || 也可以測試是不是目錄、此目錄是否存在。
			? {
				directory : options
			} : {
				encoding : options
			};
		} else if (!library_namespace.is_Object(options)) {
			// 前置處理。
			options = Object.create(null);
		}

		var file_name = options.file_name,
		/** {String}file encoding for fs of node.js. */
		encoding = 'encoding' in options ? options.encoding
				: get_URL_cache_node.encoding;

		if (!file_name && (file_name = decodeURI(URL).match(/[^\/]+$/))) {
			file_name = file_name[0];
			if (library_namespace.HTML_to_Unicode) {
				// 去掉 "&amp;" 之類。
				file_name = library_namespace.HTML_to_Unicode(file_name);
			}
			file_name = library_namespace.to_file_name(file_name);
			library_namespace.debug([ {
				// gettext_config:{"id":"get-filename-from-url-$1"}
				T : [ '自 URL 取得檔名：%1', URL ]
			}, '\n→ ' + file_name ], 1, 'get_URL_cache_node');
		}
		if (typeof options.file_name_processor === 'function') {
			file_name = options.file_name_processor(file_name);
		}
		if (!file_name) {
			// gettext_config:{"id":"no-file-name-specified"}
			onload(undefined, new Error('No file name specified.'));
			return;
		}

		if (options.directory) {
			file_name = library_namespace.append_path_separator(
					options.directory, file_name);
		}

		var file_status;
		try {
			file_status = node_fs.statSync(file_name);
		} catch (e) {
			// TODO: handle exception
		}
		if (!options.get_contents && options.web_resource_date && file_status) {
			// download newer only
			if ((file_status.mtimeMs || file_status.mtime)
			//
			- Date.parse(options.web_resource_date) > -1) {
				library_namespace.debug('File on web ('
						+ options.web_resource_date
						+ ') is not newer than local file ('
						+ file_status.mtime + '): ' + file_name + '', 1,
						'get_URL_cache_node');
				onload(undefined, _.get_URL_cache.NO_NEWS);
				return;
			}
		}

		library_namespace.debug([
				{
					// gettext_config:{"id":"download-$1"}
					T : [ '下載 %1', URL ]
				},
				'\n→ ',
				{
					// gettext_config:{"id":"$1-(file-encoding-$2-charset-$3)"}
					T : [ '%1 (file encoding %2, charset %3)', file_name,
							encoding, options.charset ]
				} ], 1, 'get_URL_cache_node');

		node_fs.readFile(file_name, encoding,
		//
		function(error, data) {
			// console.trace([ file_name, data, error, options.reget ]);
			// 警告: 對於從 HTTP 標頭獲得文件名的情況，就算不設定 options.reget 也沒用，還是會重新獲取檔案。

			// options.force_download
			if (!options.reget) {
				// 未設定 options.simulate_XMLHttpRequest_response 就會傳入 undefined。
				var XMLHttp = options.simulate_XMLHttpRequest_response && {
					// Simulates an XMLHttpRequest response.
					// 模擬 XMLHttpRequest response。
					buffer : data,
					// using CeL.data.character
					responseText : data && data.toString(options.charset),
					responseURL : URL,
					get_from_cache : true
				};

				if (!error && options.web_resource_date && file_status) {
					// download newer only
					if ((file_status.mtimeMs || file_status.mtime)
					//
					- Date.parse(options.web_resource_date) > -1) {
						// No new file on web.
						onload(data, null, XMLHttp);
						return;
					}
				}

				if (!error && !options.preserve_newer
				// 若是容許空內容，應該特別指定 options.allow_blanking。
				&& (data || options.allow_blanking)) {
					library_namespace.debug({
						// gettext_config:{"id":"using-cached-data"}
						T : 'Using cached data.'
					}, 3, 'get_URL_cache_node');
					library_namespace.debug('Cached data: ['
							+ data.slice(0, 200) + ']...', 5,
							'get_URL_cache_node');
					// TODO: use cached_status
					onload(data, null, XMLHttp);
					return;
				}

				library_namespace.debug({
					// gettext_config:{"id":"no-valid-cached-data.-try-to-get-data-(again)"}
					T : 'No valid cached data. Try to get data (again)...'
				}, 3, 'get_URL_cache_node');
			}

			_.get_URL(URL, function(XMLHttp, error) {
				if (error) {
					library_namespace.error([ 'get_URL_cache_node.cache: ', {
						// gettext_config:{"id":"got-error-when-retrieving-$1-$2"}
						T : [ 'Got error when retrieving [%1]: %2',
						//
						URL, localize_error(error) ]
					} ]);
					// WARNING: XMLHttp 僅在重新取得 URL 時提供。
					onload(undefined, error, XMLHttp);
					return;
				}

				// .buffer: node only.
				data = !encoding && XMLHttp.buffer || XMLHttp.response
						|| XMLHttp.responseText;
				// 資料事後處理程序 (post-processor):
				// 將以 .postprocessor() 的回傳作為要處理的資料。
				if (typeof options.postprocessor === 'function') {
					data = options.postprocessor(data, XMLHttp);
				}

				if (options.file_name_processor) {
					file_name = options.file_name_processor(file_name,
					// header_filename
					XMLHttp.filename);
				} else if (XMLHttp.filename) {
					if (false) {
						console.log([ options.directory, options.file_name,
								XMLHttp.filename ]);
						console.log(XMLHttp.headers);
					}
					if (!options.file_name) {
						file_name = (options.directory || '')
						// 若是沒有特別設置檔名，則改採用header裡面的檔名。
						+ XMLHttp.filename;
						library_namespace.info([
								'get_URL_cache_node: ',
								{
									// gettext_config:{"id":"got-file-name-from-http-header-$1"}
									T : [ 'Got file name from HTTP header: %1',
											XMLHttp.filename ]
								} ]);
					} else if (!options.file_name.endsWith(XMLHttp.filename)) {
						library_namespace.info([ 'get_URL_cache_node: ', {
							T : [
							// gettext_config:{"id":"set-file-name-$1-file-name-from-header-$2"}
							'Set file name: [%1], file name from header: [%2].'
							//
							, options.file_name, XMLHttp.filename ]
						} ]);
					}
				}

				var URL_date = XMLHttp.headers['date'];
				if (URL_date && options.preserve_newer && file_status) {
					// data.length === stat.size
					if ((file_status.mtimeMs || file_status.mtime)
					//
					- Date.parse(URL_date) > -1) {
						// Local file is newer than file on web.
						onload(data.toString(), undefined, XMLHttp);
						return;
					}
				}

				/**
				 * 寫入cache。
				 * 
				 * 若出現錯誤，則不寫入cache。
				 */
				if (data && /[^\\\/]$/.test(file_name)) {
					XMLHttp.cached_file_path = file_name;
					if (!file_status) {
						try {
							file_status = node_fs.statSync(file_name);
							if (file_status && !options.reget) {
								library_namespace.info([
										'get_URL_cache_node.cache: ',
										{
											// gettext_config:{"id":"find-that-the-file-exists-after-get-the-file-from-web-$1-.-do-not-overwrite-it"}
											T : [ '重新獲取檔案後發現原檔案已存在，跳過不覆寫：[%1]',
													file_name ]
										} ]);
								onload(data.toString(), undefined, XMLHttp);
								return;
							}
						} catch (e) {
							// TODO: handle exception
						}
					}

					if (!options.no_write_info) {
						library_namespace.info([
								'get_URL_cache_node.cache: ',
								{
									// gettext_config:{"id":"write-data-to-cache-file-$1"}
									T : [ 'Write data to cache file [%1].',
											file_name ]
								} ]);
						// console.trace(data);

						try {
							library_namespace.debug({
								// gettext_config:{"id":"the-data-to-cache-$1"}
								T : [ 'The data to cache: %1...',
								//
								typeof data === 'string'
								//
								&& data.length < 200000
								/**
								 * <code>

								JSON.stringify(data) may be thrown and does not be caught.

								FATAL ERROR: invalid table size Allocation failed - JavaScript heap out of memory

								</code>
								 */
								&& JSON.stringify(data).slice(0, 190) || data ]
							}, 3, 'get_URL_cache_node');
						} catch (e) {
							// TODO: handle exception
						}
					}

					try {
						node_fs.writeFileSync(file_name, data, encoding);
					} catch (error) {
						onload(data.toString(), error, XMLHttp);
						return;
					}
				}

				// set file modify date
				// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date
				// https://tools.ietf.org/html/rfc7231#section-7.1.1.2
				if (URL_date) {
					try {
						// The "Date" header field represents the date
						// and time at which the message was originated

						// fs.utimesSync(path, atime, mtime)
						// atime: the last time this file was accessed
						node_fs.utimesSync(file_name, new Date,
						// mtime: the last time this file was modified
						URL_date);
					} catch (e) {
						// TODO: handle exception
					}
				}

				// Warning: 已經有些程式碼預設會回傳 {String}
				onload(data.toString(), undefined, XMLHttp);
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
		_.get_URL_cache.NO_NEWS = typeof Symbol === 'function' ? Symbol('no news')
				: {
					'no news' : true
				};
	}

	// ---------------------------------------------------------------------//

	/**
	 * defective polyfill for W3C fetch API
	 * 
	 * @since 2018/10/16 17:47:12
	 * @deprecated
	 */
	function node_fetch(input, init) {
		// TODO: input is a Request object.

		var url = input instanceof URL ? input : new URL(input.toString()), options = library_namespace
				.new_options(init);

		function executor(resolve, reject) {
			function callback(response) {
				if ((response.statusCode / 100 | 0) === 3
						&& response.headers.location
						&& response.headers.location !== url.toString()) {
					try {
						// request.abort();
						request.destroy();
					} catch (e) {
					}

					Object.assign(options, {
						redirected : true,
						initial_URL : options.initial_URL || input
					});

					url = new URL(response.headers.location, url);
					library_namespace.debug({
						// gettext_config:{"id":"$1-redirecting-to-$2-←-$3"}
						T : [ '%1 Redirecting to [%2] ← [%3]',
								response.statusCode, url.toString(), input ]
					}, 1, 'fetch');
					node_fetch(url, options);
					return;
				}

				/** {Array} [ {Buffer}, {Buffer}, ... ] */
				var data = [], length = 0;
				response.on('data', function(chunk) {
					// {Buffer}chunk
					length += chunk.length;
					library_namespace.debug('receive BODY '
					//
					+ chunk.length + '/' + length + ': ' + url, 4, 'fetch');
					data.push(chunk);
				});

				response.on('end', function() {
					library_namespace.debug('end(): ' + url, 2, 'fetch');

					// console.log('No more data in response: ' + url);
					// it is faster to provide the length explicitly.
					data = Buffer.concat(data, length);

					var result_Object = {
						// https://developer.mozilla.org/zh-TW/docs/Web/API/Response
						// https://nodejs.org/api/http.html#http_http_get_options_callback
						url : options.initial_URL || input,
						headers : response.headers,
						status : response.statusCode,
						statusText : response.statusMessage,
						ok : (response.statusCode / 100 | 0) === 2,
						redirected : !!options.redirected,
						useFinalURL : url.toString(),

						_buffer : data,

						// TODO: body : new ReadableStream()
						// methods of
						// https://developer.mozilla.org/en-US/docs/Web/API/Body
						// https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream

						text : function text() {
							try {
								return Promise.resolve(
								//
								this._buffer.toString());
							} catch (e) {
								return Promise.reject(e);
							}
						},
						json : function json() {
							return this.text().then(JSON.parse);
						},
						arrayBuffer : function arrayBuffer() {
							return Promise.resolve(this._buffer.buffer);
						}
					};

					resolve(result_Object);
				});
			}

			// TODO: add normal headers
			// CloudFlare 必須設定好headers才能才會才允許回傳資料。

			if (library_namespace.is_debug(9)
					&& library_namespace.env.has_console) {
				console.trace([ url.toString(), options ]);
			}

			// https://nodejs.org/api/http.html
			var request = url.protocol === 'http:' ? node_http.request(url
					.toString(), options, callback) : node_https.request(url
					.toString(), options, callback);
			request.on('error', reject);
			if (options.body)
				request.write(options.body);
			request.end();
		}

		return new Promise(executor);
	}

	/**
	 * defective polyfill for W3C fetch API
	 * 
	 * 必須額外設定 credentials。
	 * 
	 * TODO: fetch 預設上不傳送或接收任何 cookies，如果網站依賴 session 會導致請求回傳未經認證，需要使用 cookies
	 * 
	 * @examples <code>
	
	var fetch = CeL.fetch;

	fetch(url).then(function(response) {
		return response.json();
	}).then(function(json) {
		console.log(json);
	});

	fetch(url).then(function(response) {
		return response.text();
	}).then(function(html) {
		console.log(html);
	});

	</code>
	 * 
	 * @see 20181016.import_earthquake_shakemap.js
	 * @see https://fetch.spec.whatwg.org/#fetch-method
	 *      https://developer.mozilla.org/zh-TW/docs/Web/API/Fetch_API
	 *      https://github.com/node-fetch/node-fetch
	 * 
	 * @since 2021/8/4 6:6:45
	 */
	function fetch__get_URL(input, init) {
		function executor(resolve, reject) {
			function callback(XMLHttp, error) {
				if (error) {
					reject(error);
					return;
				}

				// console.trace(XMLHttp);
				var result_Object = {
					// https://developer.mozilla.org/zh-TW/docs/Web/API/Response
					// https://nodejs.org/api/http.html#http_http_get_options_callback
					headers : XMLHttp.headers,
					ok : (XMLHttp.status / 100 | 0) === 2,
					redirected : XMLHttp.redirected,
					status : XMLHttp.status,
					statusText : XMLHttp.statusText,

					// 重定向後獲得的最終 URL。
					url : XMLHttp.responseURL,
					useFinalURL : true,

					_buffer : XMLHttp.buffer,

					// TODO: body : new ReadableStream()
					// methods of
					// https://developer.mozilla.org/en-US/docs/Web/API/Body
					// https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream

					text : function text() {
						try {
							return Promise.resolve(
							//
							this._buffer.toString());
						} catch (e) {
							return Promise.reject(e);
						}
					},
					json : function json() {
						return this.text().then(JSON.parse);
					},
					arrayBuffer : function arrayBuffer() {
						return Promise.resolve(this._buffer.buffer);
					}
				};

				resolve(result_Object);
			}

			// CloudFlare 必須設定好 headers 才能才會才允許回傳資料。
			// get_URL() 可自動設定 headers。
			_.get_URL(input, callback, null, init && init.body, Object.assign({
				// headers : { 'User-Agent' : '' },
				onfail : reject,
				agent : true
			}, init));
		}

		return new Promise(executor);
	}

	if (is_nodejs) {
		_.fetch = fetch__get_URL;
	}

	// ---------------------------------------------------------------------//

	// export 導出.

	return (_// JSDT:_module_
	);
}
