/**
 * @name CeL function for net
 * @fileoverview 本檔案包含了處理網路傳輸相關功能的 functions。
 * @since
 */

// --------------------------------------------------------------------------------------------
// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net',

	// includes() @ data.code.compatibility.
	require : 'data.code.compatibility.' + '|data.native.'
	//
	+ '|application.OS.Windows.get_WScript_object'
	//
	+ '|interact.DOM.HTML_to_Unicode',

	// 設定不匯出的子函式。
	// no_extend : '*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {
	'use strict';

	var module_name = this.id;
	// @see PATTERN_has_URI_invalid_character @ library_namespace.character
	var PATTERN_has_URI_invalid_character = /[^a-zA-Z0-9;,/?:@&=+$\-_.!~*'()#]/;
	var check_encoding = function(encoding) {
		// console.trace(encoding);
		if (encoding && !/^UTF-?8$/i.test(encoding)) {
			library_namespace.warn('您必須先載入 CeL.! 這訊息只會顯示一次!');
			check_encoding = null;
		}
	},
	// 本函數亦使用於 CeL.application.net.work_crawler
	// 本函式將使用之 encodeURIComponent()，包含對 charset 之處理。
	// @see function_placeholder() @ module.js
	encode_URI_component = function(string, encoding) {
		if (library_namespace.character) {
			library_namespace.debug('採用 ' + library_namespace.Class
			// 有則用之。 use CeL.data.character.encode_URI_component()
			+ '.character.encode_URI_component 編碼 ' + encoding, 1, module_name);
			encode_URI_component = library_namespace.character.encode_URI_component;
			check_encoding = null;
			return encode_URI_component(string, encoding);
		}
		check_encoding(encoding);
		return encodeURIComponent(string);
	};
	var encode_URI = function(string, encoding) {
		if (library_namespace.character) {
			library_namespace.debug('採用 ' + library_namespace.Class
			// 有則用之。 use CeL.data.character.encode_URI()
			+ '.character.encode_URI 編碼 ' + encoding, 1, module_name);
			encode_URI = library_namespace.character.encode_URI;
			check_encoding = null;
			return encode_URI(string, encoding);
		}
		check_encoding(encoding);
		return encodeURI(string);
	};
	var decode_URI_component = function(string, encoding) {
		if (library_namespace.character) {
			library_namespace.debug('採用 ' + library_namespace.Class
			// 有則用之。 use CeL.data.character.decode_URI_component()
			+ '.character.decode_URI_component 解碼 ' + encoding, 1, module_name);
			decode_URI = library_namespace.character.decode_URI;
			decode_URI_component = library_namespace.character.decode_URI_component;
			check_encoding = null;
			return decode_URI_component(string, encoding);
		}
		check_encoding(encoding);
		return decodeURIComponent(string);
	};
	var decode_URI = decode_URI_component;

	// requiring
	var KEY_not_native = library_namespace.env.not_native_keyword;
	var get_WScript_object = this.r('get_WScript_object'), HTML_to_Unicode = this
			.r('HTML_to_Unicode');

	/**
	 * null module constructor
	 * 
	 * @class net 的 functions
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

	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	var NOT_FOUND = ''.indexOf('_');

	// ------------------------------------------------------------------------

	function is_IP(host, IPv6_only) {
		return !IPv6_only
		// for IPv4 addresses
		&& /^[12]?\d{1,2}(?:\.[12]?\d{1,2}){3}$/.test(host) && 4
		// for IPv6 addresses
		|| /^[\dA-F]{1,4}(?::[\dA-F]{1,4}){7}$/i.test(host) && 6;
	}

	_.is_IP = is_IP;

	/**
	 * get full path.
	 */
	function get_full_URL(relative_path, base_URL) {
		if (/([a-z\d]+:)\/\//.test(relative_path)) {
			// e.g., "https://host.name/"
			return relative_path;
		}
		if (relative_path.startsWith('/')) {
			// e.g., "/path/to/file"
			var matched = base_URL.match(/([a-z\d]+:)\/\/[^\/]+/);
			if (matched) {
				return matched[0] + relative_path;
			}
		}
		// e.g., "relative/path/to/file"
		return base_URL.replace(/[^\/]+$/, '') + relative_path;
	}

	_.get_full_URL = get_full_URL;

	// gethost[generateCode.dLK]='Sleep';
	/**
	 * get host name & IP 2005/3/1 22:32 只能用於WinXP, Win2000
	 * server（換個版本指令以及輸出可能就不同！），而且非常可能出狀況！ Win98 不能反查，只能 check local IP
	 * 
	 * @deprecated 改用 getNetInfo()
	 */
	function gethost(host) {
		var IP, p, c, t, i, f, cmd;
		// 決定shell cmd 對於 ".. > ""path+filename"" " 似乎不能對應的很好，
		// 所以還是使用 "cd /D path;.. > ""filename"" "
		try {
			c = '%COMSPEC% /U /c "', WshShell.Run(c + '"');
			p = WScript.ScriptFullName.replace(/[^\\]+$/, '');
			c += 'cd /D ""' + p + '"" && ';
			cmd = 1;
		} catch (e) {
			try {
				c = '%COMSPEC% /c ';
				WshShell.Run(c);
				p = 'C:\\';
			} catch (e) {
				return;
			}
		}
		if (host) {
			if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host))
				IP = host, host = 0;
		} else {
			f = 'ipconfig.tmp.txt';
			// winipcfg
			WshShell.Run(c + 'ipconfig > ' + (cmd ? '""' + f + '"" "' : p + f),
					0, true);
			if (t = simpleRead(f = p + f)) {
				// TODO: use t.between()
				if ((i = t.indexOf('PPP adapter')) !== NOT_FOUND)
					t = t.slice(i);
				else if ((i = t.indexOf('Ethernet adapter')) !== NOT_FOUND)
					t = t.slice(i);
				if ((i = t.indexOf('IP Address')) !== NOT_FOUND)
					t = t.slice(i);
				if (t.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/))
					IP = RegExp.$1;
			}
			try {
				fso.DeleteFile(f);
			} catch (e) {
			}
			if (!IP)
				return [ 0, 0 ];
		}
		if (!cmd)
			// Win98沒有nslookup
			return [ host, IP ];
		f = 'qDNS.tmp.txt';
		WshShell.Run(c
				+ 'nslookup '
				+ (cmd ? '""' + (IP || host) + '"" > ""' + f + '"" "'
						: (IP || host) + '>' + p + f), 0, true);
		// /C:執行字串中所描述的指令然後結束指令視窗 (x)因為用/c，怕尚未執行完。
		// try { WScript.Sleep(200); } catch (e) { }
		if ((t = simpleRead(f = p + f)) && t.match(/Server:/)
				&& t.match(/Address:\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
			t = t.slice(RegExp.lastIndex);
			host = t.match(/Name:\s*(\S+)/) ? RegExp.$1 : 0;
			IP = t.match(/Address:\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/) ? RegExp.$1
					: 0;
			// library_namespace.debug(host + '\n' + IP);
		} else
			host = IP = 0;
		try {
			fso.DeleteFile(f);
		} catch (e) {
		}
		return [ host, IP ];
	}

	// for element.dataset
	if (false)
		if (!library_namespace.global.DOMStringMap)
			library_namespace.global.DOMStringMap = library_namespace.setting_pair;

	// ------------------------------------------------------------------------

	var port_of_protocol = {
		// https://tools.ietf.org/html/rfc1928#section-3
		// The SOCKS service is conventionally located on TCP port 1080.
		// https://github.com/TooTallNate/node-socks-proxy-agent/blob/master/src/agent.ts
		socks4 : 1080,
		socks4a : 1080,
		socks5 : 1080,
		socks : 1080,
		socks5h : 1080,
		ftp : 21,
		http : 80,
		https : 443
	};

	_.port_of_protocol = port_of_protocol;

	var PATTERN_URI =
	// [ all, 1: `protocol:`, 2: '//', 3: host, 4: path ]
	/^([\w\-]{2,}:)?(\/\/)?(\/[A-Z]:|(?:[^@]*@)?[^\/#?&:.][^\/#?&:]+(?::\d{1,5})?)?(.*)$/i
	// /^(?:(https?:)\/\/)?(?:([^:@]+)(?::([^@]*))?@)?([^:@]+)(?::(\d{1,5}))?$/
	;

	/**
	 * URI class.
	 * 
	 * 本組函數之目的:<br />
	 * 1. polyfill for W3C URL API.<br />
	 * 2. CeL.Search_parameters() 採用{Object}操作 hash 更方便重複利用，且可支援 charset。
	 * 
	 * new URLSearchParams() 會將數值轉成字串。 想二次利用 {Object}, {Array}，得採用 new CeL.URI()
	 * 而非 new URL()。
	 * 
	 * @example <code>

	// 警告: 這不能保證 a 和 fg 的順序!! 僅保證 fg=23 → fg=24。欲保持不同名稱 parameters 間的順序，請採用 {String}parameter+parameter。
	var url = new CeL.URI('ftp://user:cgh@dr.fxgv.sfdg:4231/3452/dgh.rar?fg=23&a=2&fg=24#hhh');
	alert(url.hostname);
	// to URL()
	new URL(url).toString() === url.toString()
	// parameters to URLSearchParams() 
	new URLSearchParams(url.search_params.toString()).toString() === url.search_params.toString();
	
	</code>
	 * 
	 * <code>

	test:
	/fsghj.sdf
	a.htm
	http://www.whatwg.org/specs/web-apps/current-work/#attr-input-pattern
	file:///D:/USB/cgi-bin/lib/JS/_test_suit/test.htm
	//www.whatwg.org/specs/web-apps/current-work/#attr-input-pattern

	TODO:
	file:///D:/USB/cgi-bin/lib/JS/_test_suit/test.htm
	→ .file_path:
	D:\USB\cgi-bin\lib\JS\_test_suit\test.htm

	eURI : /^((file|telnet|ftp|https?)\:\/\/|~?\/)?(\w+(:\w+)?@)?(([-\w]+\.)+([a-z]{2}|com|org|net))?(:\d{1,5})?(\/([-\w~!$+|.,=]|%[\dA-F]{2})*)?(\?(([-\w~!$+|.,*:]|%[\dA-F]{2})+(=([-\w~!$+|.,*:=]|%[\dA-F]{2})*)?&?)*)?(#([-\w~!$+|.,*:=]|%[\dA-F]{2})*)?$/i,

	TODO:
	input [ host + path, search, hash ]
	URI, IRI, XRI
	WHATWG URL parser

	 * </code>
	 * 
	 * @param {String}uri
	 *            URI to parse
	 * @param {String}[base_uri]
	 *            當做基底的 URL。 see
	 *            CeL.application.storage.file.get_relative_path()
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @return parsed object
	 * 
	 * @since 2010/4/13 23:53:14 from parseURI+parseURL
	 * @since 2021/2/27 6:10:25 Parses URI, function parse_URI(uri) → new
	 *        URI(uri)
	 * 
	 * @_memberOf _module_
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL_API
	 * @see RFC 1738, RFC 2396, RFC 3986, Uniform Resource Identifier (URI):
	 *      Generic Syntax, http://tools.ietf.org/html/rfc3987,
	 *      http://flanders.co.nz/2009/11/08/a-good-url-regular-expression-repost/,
	 *      http://www.mattfarina.com/2009/01/08/rfc-3986-url-validation,
	 *      https://developer.mozilla.org/en/DOM/window.location, also see
	 *      batURL.htm
	 */
	function URI(uri, base_uri, options) {
		if (!is_URI(this)) {
			// Call URI(value), like String(value)
			if (is_URI(uri))
				return uri;

			return new URI(uri, base_uri, options);
		}

		options = library_namespace.new_options(options);
		if (options.charset === 'buffer') {
			// Although the content is buffer, the URI itself should be not.
			delete options.charset;
		}
		if ((uri instanceof URL) || is_URI(uri)) {
			// uri.href
			uri = uri.toString();
		}

		if (!uri
		// 不能用 instanceof String!
		|| typeof uri !== 'string') {
			throw new Error('Invalid URI type: (' + (typeof uri) + ') ' + uri);
		}

		var href = library_namespace.simplify_path(uri);
		if (/^\/\//.test(uri)) {
			// CeL.simplify_path('//hostname') === '/hostname'
			href = '/' + href;
		}
		var matched = href.match(PATTERN_URI), path;
		if (!matched) {
			throw new Error('Invalid URI: (' + (typeof uri) + ') ' + uri);
		}

		// console.log(href);
		library_namespace.debug('parse [' + uri + ']: '
				+ matched.join('<br />\n'), 8, 'URI');

		// console.trace([ matched, base_uri, options ]);
		uri = base_uri && URI(base_uri) || options.as_URL
		//
		|| library_namespace.is_WWW() && {
			// protocol包含最後的':',search包含'?',hash包含'#'.
			// file|telnet|ftp|https
			protocol : location.protocol,
			hostname : location.hostname,
			port : location.port,
			host : location.host,
			// local file @ IE: C:\xx\xx\ff, others: /C:/xx/xx/ff
			pathname : location.pathname
		};
		if (library_namespace.need_avoid_assign_to_setter) {
			for ( var key in uri) {
				if (key !== 'search'
				// &&key !== 'hash'
				) {
					this[key] = uri[key];
				}
			}
			uri = this;
		} else {
			uri = Object.assign(this, uri);
		}
		// uri.uri = href;

		/**
		 * ** filename 可能歸至m[4]!<br />
		 * 判斷準則:<br />
		 * gsh.sdf.df#dhfjk filename|hostname<br />
		 * gsh.sdf.df/dhfjk hostname<br />
		 * gsh.sdf.df?dhfjk filename<br />
		 * gsh.sdf.df filename<br />
		 */
		href = matched[3] && matched[3].toLowerCase() || '';
		path = matched[4] || '';
		// 可辨識出為 domain 的這個 hostname. e.g., gTLD
		// https://en.wikipedia.org/wiki/Generic_top-level_domain
		if (/(?:\w+\.)+(?:com|org|net|info)$/i.test(href)) {
			// e.g., URI("www.example.com")
			path = path || '/';
			if (uri.protocol === 'file:')
				uri.protocol = 'https:';
		}

		if (matched[1])
			uri.protocol = matched[1].toLowerCase();
		// uri._protocol = uri.protocol.slice(0, -1).toLowerCase();
		// library_namespace.debug('protocol [' + uri._protocol + ']', 2);

		if (href && !/^\/[A-Z]:$/i.test(href)
				&& (path.charAt(0) === '/' || /[@:]/.test(href))) {
			// 處理 username:password
			if (matched = href.match(/^([^@]*)@(.+)$/)) {
				matched.user_passwords = matched[1].match(/^([^:]+)(:(.*))?$/);
				if (!matched.user_passwords)
					return;
				uri.username = matched.user_passwords[1];
				if (matched.user_passwords[3])
					uri.password = matched.user_passwords[3];
				href = matched[2];
			} else {
				// W3C URL API 不論有沒有帳號密碼皆會設定這兩個值
				uri.password = '';
				uri.username = '';
			}

			// [ all, host, (integer)port ]
			matched = href.match(/^([^\/#?&\s:]+)(?::(\d{1,5}))?$/);
			if (!matched) {
				throw new Error('Invalid host: ' + href);
			}

			// 處理 host
			// host=hostname:port
			uri.hostname = uri.host = matched[1];
			if (matched[2]
					&& matched[2] != port_of_protocol[uri.protocol.slice(0, -1)
							.toLowerCase()]) {
				// uri[KEY_port] = parseInt(matched[2], 10);
				uri.port = String(parseInt(matched[2], 10));
				uri.host += ':' + uri.port;
			} else if (false) {
				uri[KEY_port] = parseInt(matched[2]
						|| port_of_protocol[uri.protocol.slice(0, -1)
								.toLowerCase()]);
			}

		} else {
			// test uri.protocol === 'file:'
			path = href + path;
			href = '';
			// uri.protocol === 'file:'
			uri.port = uri.port || '';
			uri.host = uri.host || '';
			uri.hostname = uri.hostname || '';
			uri.username = uri.username || '';
			uri.password = uri.password || '';
		}

		uri.origin = uri.protocol + '//' + uri.host;

		// Normalize Windows path
		// "d:\\p\\" → "d:/p/"
		path = path.replace(/\\/g, '/');
		if (/^[A-Z]:/i.test(path)) {
			// "d:/p/" → "/d:/p/"
			path = '/' + path;
		}
		if (!href) {
			// test /C:/path
			if (!/^\/[A-Z]:/i.test(path)) {
				if (!base_uri) {
					library_namespace.debug(
					// 將 [' + path + '] 當作 pathname! not hostname!
					'Treat [' + path + '] as pathname!', 1, 'URI');
				}
				if (uri.pathname) {
					if (/^\//.test(path)) {
						// path 為 absolute path
						matched = !/^\/[A-Z]:/i.test(path)
								&& uri.pathname.match(/^\/[A-Z]:/i);
						if (matched)
							path = matched[0] + path;
					} else {
						// 僅取 uri.pathname 之 directory path
						path = uri.pathname.replace(/[^\\\/]+$/, '') + path;
					}
					path = library_namespace.simplify_path(path);
				}
			}
			// console.trace(path);
		}
		// upper-cased driver letter: "/d:/p/" → "/D:/p/"
		path = path.replace(/^\/[a-z]:/g, function($0) {
			return $0.toUpperCase();
		});
		if (library_namespace.is_WWW()) {
			library_namespace.debug('local file: [' + location.pathname + ']',
					9, 'URI');
		}

		// NG: /^([^%]+|%[\dA-F]{2})+$/
		// prevent catastrophic backtracking. e.g., '.'.repeat(300)+'%'
		// Thanks for James Davis.
		if (false && path && !/^(?:[^%]|%[\dA-F]{2})+$/i.test(path)) {
			library_namespace.warn('URI: encoding error: [' + path + ']');
		}
		if (path && /&#\d{2,5};/.test(path)) {
			library_namespace
					.warn('URI: You may need to decode "&#...;" first (e.g., via '
							// CeL.HTML_to_Unicode()
							+ library_namespace.Class
							+ '.HTML_to_Unicode()): [' + path + ']');
			console.trace(path);
		}

		// console.trace([ href, path, uri ]);
		library_namespace.debug('parse path: [' + path + ']', 9);
		if (path && (matched = path
		// https://cdn.dongmanmanhua.cn/16189006774011603165.jpg?x-oss-process=image/quality,q_90
		.match(/^(([^#?]*\/)?([^\/#?]*))?(\?([^#]*))?(#.*)?$/))) {
			library_namespace.debug('pathname: [' + matched + ']', 9);
			// pathname={path}filename
			uri.pathname = matched[1] || '';
			if (/%[\dA-F]{2}/i.test(uri.pathname)) {
				try {
					// console.trace([ uri.pathname, decodeURI(uri.pathname) ]);
					// Try to get decoded path.
					uri.pathname = decodeURI(uri.pathname);
				} catch (e) {
					// uri.pathname = decode_URI(uri.pathname, charset);
				}
			}
			if (PATTERN_has_URI_invalid_character.test(uri.pathname)) {
				// console.trace([ uri.pathname, encode_URI(uri.pathname,
				// options.charset) ]);
				uri.pathname = encode_URI(uri.pathname, options.charset);
			}
			// .directory_path 會隨不同 OS 之 local file 表示法作變動!
			uri.directory_path = /^\/[A-Z]:/i.test(uri.pathname) ? matched[2]
					.slice(1).replace(/\//g, '\\')
			// e.g., 'file:///D:/directory/file.name'
			// → D:\directory\
			: /^[A-Z]:(?:\/([^\/]|$)|$)/i.test(uri.pathname) ? matched[2]
					.replace(/\//g, '\\') : matched[2];
			uri.filename = matched[3];
			// request path used @ node.js http.request(options)
			// uri.path = uri.pathname + uri.search
			// uri.path = uri.pathname + (matched[5] ? '?' + matched[5] : '');

			var _options;
			if (Object.defineProperty[KEY_not_native]) {
				// hash without '#': using uri.hash.slice(1)
				uri.hash = matched[6];
				uri.search = matched[4];
				_options = Object.assign({
					// @see (typeof options.URI === 'object')
					URI : uri
				}, options);
			} else {
				Object.defineProperty(uri, KEY_hash, {
					value : matched[6] ? matched[6].slice(1) : '',
					writable : true
				});
				_options = options;
			}
			matched = matched[5];
			// console.trace([ matched, _options ]);
		} else {
			if (!href) {
				throw new Error('Invalid URI: ' + uri);
			}
			if (uri.pathname) {
				uri.directory_path = uri.pathname.replace(/[^\/]+$/, '');
				// uri.path = uri.pathname;
			}
			matched = '';
		}

		if (options.as_URL) {
			// 盡可能模擬 W3C URL()
			// library_namespace.debug('search: [' + matched[5] + ']', 2);
			// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
			uri.searchParams = new URLSearchParams(matched, _options);
		} else {
			// do not set uri.search_params directly.
			_options = Object.assign({
				URI : uri
			}, _options);
			// console.trace(_options);
			uri.search_params = new Search_parameters(matched, _options);
		}

		if (options.charset)
			uri.charset = options.charset;

		library_namespace.debug('path: [' + uri.path + ']', 9);

		if (Object.defineProperty[KEY_not_native]) {
			library_namespace.debug('Generate .href of URI by URI_toString()',
					10);
			uri.toString();
		}
		// console.trace(uri);

		library_namespace.debug('href: [' + uri.href + ']', 8);
		// return uri;
	}

	Object.defineProperties(URI.prototype, {
		hash : {
			enumerable : true,
			get : function get() {
				if (!this[KEY_hash])
					return '';
				return '#' + this[KEY_hash];
			},
			set : function set(value) {
				value = String(value);
				if (value.startsWith('#')) {
					value = value.slice(1);
				}
				this[KEY_hash] = value;
			}
		},
		// URI.prototype.search
		search : {
			enumerable : true,
			get : search_getter,
			set : function set(value) {
				var search_params = this.search_params || this.searchParams;
				if (false && this.search_params) {
					this.search_params[KEY_URL] = this;
				}

				// search_params.clean_parameters();
				search_clean_parameters(search_params);

				// node.js v0.10.48 有 bug? 需要取得 search_params 一次才不會造成
				// ReferenceError: CeL is not defined
				// @ URI.prototype.href.set
				// @ site_name #17 @ _test suite/test.js
				URL[KEY_not_native] && search_params && Math.abs(0);

				value = String(value);
				if (value.startsWith('?')) {
					value = value.slice(1);
				}
				if (value) {
					// search_params.set_parameters(value);
					search_set_parameters.call(search_params, value);
				}
			}
		},
		// URI.prototype.href
		href : {
			enumerable : true,
			get : Object.defineProperty[KEY_not_native] ? URI_toString
					: URI_href,
			set : function set(href) {
				URI.call(this, href);
			}
		},
		toString : {
			value : Object.defineProperty[KEY_not_native] ? URI_toString
					: URI_href
		}
	});

	function search_getter(options) {
		// library_namespace.debug('normalize properties by search_getter');
		// library_namespace.debug(this.search_params);

		if (false && this.search_params) {
			this.search_params[KEY_URL] = this;
		}

		var uri = this;
		// console.trace([ uri, uri.searchParams ]);
		var search = 'search_params' in uri
		// function parameters_toString(options)
		? uri.search_params.toString(options)
		// options.as_URL?
		: uri.searchParams.toString();
		return search ? '?' + search : '';
	}

	function URI_href() {
		var uri = this;
		// console.trace([ uri, uri.search ]);
		// href=protocol:(//)?username:password@hostname:port/path/filename?search#hash
		var href = (uri.protocol ? uri.protocol + '//' : '')
				+ (uri.username || uri.password ? uri.username
						+ (uri.password ? ':' + uri.password : '') + '@' : '')
				+ uri.host
				// assert: uri.pathname is encodeURI()-ed.
				+ uri.pathname + uri.search + uri.hash;
		return href;
	}

	// options: 'charset'
	function URI_toString(options) {
		var uri = this;
		// assert: !!Object.defineProperty[KEY_not_native] === true
		uri.search = search_getter.call(uri, options);
		if ((uri.hash = String(uri.hash)) && !uri.hash.startsWith('#')) {
			uri.hash = '#' + uri.hash;
		}
		// console.trace(uri.search);
		return uri.href = URI_href.call(uri);
	}

	_// JSDT:_module_
	.URI = URI;

	function is_URI(value) {
		return value instanceof URI;
	}

	_.is_URI = is_URI;

	// ------------------------------------------------------------------------

	var NO_EQUAL_SIGN = typeof Symbol === 'function' ? Symbol('NO_EQUAL_SIGN')
	//
	: {
		NO_EQUAL_SIGN : true
	};

	function decode_URI_component_no_throw(value, charset) {
		try {
			return decode_URI_component(value, charset);
		} catch (e) {
		}

		// decode_URI_component() should be decodeURIComponent()
		return value.replace(/%([\dA-F]{2})/g, function(encoded, code) {
			return String.fromCharCode(parseInt(code, 16));
		});
	}

	/**
	 * parse_parameters({String}parameter) to hash
	 * 
	 * CeL.net.Search_parameters()
	 * 
	 * 新版本與 charset 編碼無關的話，應該使用 new URLSearchParams(parameters).toString()。
	 * 
	 * @param {String}search_string
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
	 */
	function Search_parameters(search_string, options) {
		// Similar to:
		// return new URLSearchParams(search_string);
		// but with charset and forward compatibility
		// and re-usable {Object} data structure.

		if (!is_Search_parameters(this)) {
			// `CeL.Search_parameters(search_string)`
			if (is_Search_parameters(search_string))
				return search_string;
			return new Search_parameters(search_string, options);
		}

		options = library_namespace.setup_options(options);
		var parameters = this;
		var data, name, value, matched;
		if (typeof search_string === 'string') {
			// http://stackoverflow.com/questions/14551194/how-are-parameters-sent-in-an-http-post-request
			data = search_string.replace(/\+/g, '%20').split(/&/);
		} else if (Array.isArray(search_string)) {
			data = search_string;
		} else if (typeof search_string === 'object') {
			// https://github.com/whatwg/url/issues/27
			// Creation of URLSearchParams from Object/Map
			if (library_namespace.is_Map(search_string)) {
				// input {Map}.
				Array.from(search_string.entries()).forEach(function(entry) {
					parameters[entry[0]] = entry[1];
				});
			} else if (search_string instanceof URLSearchParams) {
				Array.from(search_string.keys()).unique().forEach(
						function(key) {
							var values = search_string.getAll(key);
							parameters[key] = values.length > 1 ? values
									: values[0];
						});
			} else {
				// {Object}search_string.
				// assert: library_namespace.is_Object(search_string)
				Object.assign(parameters, search_string);
			}
		} else {
			if (search_string) {
				// Invalid search 無法處理之 parameters
				library_namespace.debug({
					// gettext_config:{"id":"enter-a-non-string-parameter-$1"}
					T : [ '輸入了非字串之參數：[%1]', search_string ]
				}, 1, 'Search_parameters');
			}
		}

		// 不可設置 parameters.charset，會加在 request URL 裡面。
		var charset = options.charset;

		for (var i = 0, l = data && data.length || 0; i < l; i++) {
			if (!data[i])
				continue;
			if (library_namespace.is_Object(data[i])) {
				this.set_parameters(data[i], options);
				continue;
			}
			if (typeof data[i] !== 'string') {
				library_namespace
						.error('Must input {String} as search parameter!');
				console.error(data[i]);
				return;
			}

			// Warning: Search_parameters() 僅接受 UTF-8。
			// 欲設定 charset，必須自行先處理 .search！

			// var index = parameter.indexOf('=');
			if (matched = data[i].match(/^([^=]+)=(.*)$/)) {
				name = matched[1];
				value = decode_URI_component_no_throw(matched[2], charset);
			} else {
				name = data[i];
				value = 'default_value' in options ? options.default_value
						: /* name */NO_EQUAL_SIGN;
			}
			try {
				name = decode_URI_component_no_throw(name, charset);
			} catch (e) {
				// TODO: handle exception
			}

			if (ignore_search_properties
			// Warning: for old environment, may need ignore some keys
			&& (name in ignore_search_properties)) {
				continue;
			}

			if (library_namespace.is_debug(2)) {
				try {
					library_namespace.debug('[' + (i + 1) + '/' + l + '] '
					//
					+ (parameters[name] ? '<span style="color:#888;">('
					//
					+ parameters[name].length + ')</span> [' + name
					//
					+ '] += [' + value + ']' : '[' + name + '] = ['
					//
					+ value + ']'));
				} catch (e) {
				}
			}

			if (options.split_pattern && typeof value === 'string'
			//
			&& (matched = value.split(options.split_pattern)).length > 1) {
				if (name in parameters) {
					if (Array.isArray(parameters[name])) {
						Array.prototype.push.apply(parameters[name], matched);
					} else {
						matched.unshift(parameters[name]);
						parameters[name] = matched;
					}
				} else
					parameters[name] = matched;
			} else {
				search_add_1_parameter.call(parameters, name, value);
			}
		}

		if (options.Array_only) {
			Object.keys(parameters).forEach(function(key) {
				if (!ignore_search_properties
				// Warning: for old environment, may need ignore some keys
				|| !(key in ignore_search_properties)) {
					if (!Array.isArray(parameters[name]))
						parameters[name] = [ parameters[name] ];
				}
			});
		}

		if (typeof options.URI === 'object') {
			Object.defineProperty(parameters, KEY_URL, {
				value : options.URI
			});
		}
	}

	function search_add_1_parameter(key, value, options) {
		if (key in this) {
			var original_value = this[key];
			if (Array.isArray(original_value))
				original_value.push(value);
			else
				this[key] = [ original_value, value ];
		} else {
			// Warning: if Array.isArray(value),
			// next value will push to the value!
			this[key] = value;
		}
	}

	/**
	 * set / append these parameters
	 * 
	 * @inner
	 */
	function search_set_parameters(parameters, options) {
		// console.trace([ this, parameters, options ]);
		options = Object.assign({
			charset : this.charset || this[KEY_URL] && this[KEY_URL].charset
		}, options);
		if (!library_namespace.is_Object(parameters))
			parameters = Search_parameters(parameters, options);
		// console.trace([ this, parameters, options ]);
		// Object.keys() 不會取得 Search_parameters.prototype 的屬性。
		Object.keys(parameters).forEach(function(key) {
			if (!ignore_search_properties
			// Warning: for old environment, may need ignore some keys
			|| !(key in ignore_search_properties)) {
				var value = parameters[key];
				if (options.append) {
					search_add_1_parameter.call(this,
					//
					key, value, options);
				} else {
					this[key] = value;
				}
			}
		}, this);
		return this;
	}

	// @inner
	function search_clean_parameters(object) {
		// if (!object)
		object = this;
		if (!object) {
			// @ node.js v0.10.48
			// https://github.com/kanasimi/CeJS/runs/2105831296?check_suite_focus=true
			return this;
		}

		Object.keys(object).forEach(function(key) {
			if (!ignore_search_properties
			// Warning: for old environment, may need ignore some keys
			|| !(key in ignore_search_properties)) {
				delete object[key];
			}
		});
		return this;
	}

	// {Object}this parameter hash to String
	// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/toString
	function parameters_toString(options) {
		var charset;
		if (typeof options === 'string') {
			charset = options;
			options = Object.create(null);
		} else {
			options = library_namespace.setup_options(options);
			charset = options.charset;
		}
		if (charset === undefined) {
			// console.trace([ this, this[KEY_URL] ]);
			charset = this.charset || this[KEY_URL] && this[KEY_URL].charset;
		}

		var search = [], key;
		function append(value) {
			if (library_namespace.is_debug(9) && typeof value !== 'string'
					&& typeof value !== 'number' && value !== NO_EQUAL_SIGN) {
				try {
					library_namespace.debug({
						T : [
								// gettext_config:{"id":"set-$1-to-a-non-string-$2"}
								'設定 %1 成非字串之參數：%2',
								typeof JSON === 'object' ? JSON.stringify(key)
										: String(key),
								typeof JSON === 'object' ? JSON
										.stringify(value) : String(value) ]
					}, 1, 'parameters_toString.append');
				} catch (e) {
					// TypeError: Converting circular structure to JSON
				}
			}

			// console.trace([ key, value ]);
			try {
				search.push(value === NO_EQUAL_SIGN ? key : key + '='
						+ encode_URI_component(String(value), charset));
				// console.trace(search);
			} catch (e) {
				library_namespace.error(e);
				console.error(e);
				console.trace([ key, value ]);
			}
		}

		// console.trace([ this, charset ]);
		for (var index = 0, key_list = Object.keys(this); index < key_list.length; index++) {
			key = key_list[index];
			if (ignore_search_properties && (key in ignore_search_properties)) {
				// Warning: for old environment, may need ignore some keys
				continue;
			}

			var value = this[key];
			key = encode_URI_component(key, charset);
			// console.trace(key + ' = ' + value);
			if (!Array.isArray(value)) {
				append(value);
			} else if (Object.getOwnPropertyDescriptor(value, 'toString')) {
				// assert: 自行定義 {Function}.toString()
				append(value.toString());
			} else {
				value.forEach(append);
			}
		}

		library_namespace.debug([ {
			// gettext_config:{"id":"a-total-of-$1-parameters"}
			T : [ '共%1個參數：', search.length ]
		}, '<br />\n', search.map(function(parameter) {
			return parameter.length > 400 ? parameter.slice(0,
			//
			library_namespace.is_debug(6) ? 2000 : 400) + '...' : parameter;
		}).join('<br />\n') ], 9, 'parameters_toString');

		search = search.join('&');
		if (this[KEY_URL]) {
			// @see URI.prototype.search
			this[KEY_URL].search = search;
		}

		return search;
	}

	// @private
	var KEY_hash = typeof Symbol === 'function' ? Symbol('hash') : '\0hash';
	var KEY_URL = !Object.defineProperty[KEY_not_native]
			&& typeof Symbol === 'function' ? Symbol('URL') : '\0URL';
	// search_properties
	Object.assign(Search_parameters.prototype, {
		clean_parameters : search_clean_parameters,
		set_parameters : search_set_parameters,
		// valueOf
		toString : parameters_toString
	});
	var ignore_search_properties;
	if (Object.defineProperty[KEY_not_native]) {
		// 皆已採用 Object.keys(), Object.entries()
		// Object.keys() 不會取得 Search_parameters.prototype 的屬性。
		// ignore_search_properties = Object.clone(Search_parameters.prototype);
		ignore_search_properties = Object.create(null);

		// @ WScript.exe 會採用 (key in ignore_search_properties) 的方法，
		// 因此 KEY_URL 必須是 {String}。
		if (typeof KEY_URL !== 'string')
			KEY_URL = String(KEY_URL);
		ignore_search_properties[KEY_URL] = true;
		// alert(Object.keys(ignore_search_properties));
	}

	_.Search_parameters = Search_parameters;

	function is_Search_parameters(value) {
		return value instanceof Search_parameters;
	}

	_.is_Search_parameters = is_Search_parameters;

	// --------------------------------

	// 有缺陷的 URL()
	function defective_URL(url) {
		// Object.assign() will not copy toString:URI_toString()
		// Object.assign(this, URI(url));

		return new URI(url, null, {
			// 盡可能模擬 W3C URL()
			as_URL : true
		});
	}

	// 有缺陷的 URLSearchParams()
	function defective_URLSearchParams(search_string, options) {
		// library_namespace.debug(search_string);
		// Warning: new Map() 少了許多必要的功能! 不能完全替代!
		var search = Object.entries(
		//
		new Search_parameters(search_string, options));
		if (ignore_search_properties) {
			search = search.filter(function(entry) {
				return !(entry[0] in ignore_search_properties);
			});
		}
		// library_namespace.info(search.length);

		// alert(Array.isArray(search));
		try {
			Map.call(this, search);
			if (!this.forEach)
				throw 1;
			return;
		} catch (e) {
			// node.js 0.11: Constructor Map requires 'new'
		}

		search = new Map(search);
		// Copy all methods
		Object.assign(search, defective_URLSearchParams.prototype);
		return search;
	}

	// https://developer.mozilla.org/zh-TW/docs/Learn/JavaScript/Objects/Inheritance
	Object.assign(defective_URLSearchParams.prototype = Object
			.create(Map.prototype), {
		constructor : defective_URLSearchParams,

		clean : function clean() {
			var search = this;
			var keys = Array.from(this.keys());
			keys.forEach(function(key) {
				search['delete'](key);
			});
			return this;
		},

		// URLSearchParams() 會存成字串，不會保留原先的資料結構。
		set : function set(key, value) {
			key = String(key);
			value = String(value);
			Map.prototype.set.call(this, key, value);
		},
		append : function append(key, value) {
			key = String(key);
			value = String(value);
			// defective_URLSearchParams.prototype.toString
			if (this.has(key)) {
				var original_value = Map.prototype.get.call(this, key);
				if (Array.isArray(original_value)) {
					original_value.push(value);
				} else {
					Map.prototype.set
							.call(this, key, [ original_value, value ]);
				}
			} else {
				Map.prototype.set.call(this, key, value);
			}
		},

		// Return the first one
		get : function get(key) {
			key = String(key);
			var original_value = Map.prototype.get.call(this, key);
			if (Array.isArray(original_value))
				return original_value[0];
			return original_value;
		},
		getAll : function getAll(key) {
			key = String(key);
			if (!this.has(key))
				return [];
			var original_value = Map.prototype.get.call(this, key);
			if (Array.isArray(original_value))
				return original_value;
			return [ original_value ];
		},

		// 注意: 本 library 模擬之 URLSearchParams.prototype.toString 只能得到等價
		// href，不完全相同。
		toString : function toString() {
			// defective_URLSearchParams.prototype.toString
			var list = [];
			this.forEach(function(value, key) {
				// console.trace([ value, key ]);
				key = encodeURIComponent(key) + '=';
				if (Array.isArray(value)) {
					value.forEach(function(v) {
						list.push(key + encodeURIComponent(String(v)));
					});
				} else {
					list.push(key + encodeURIComponent(String(value)));
				}
			});
			return list.join('&');
		}
	});

	// ------------------------------------------------------------------------

	/**
	 * <code>
	https://pubs.opengroup.org/onlinepubs/007908799/xbd/notation.html
	The following table lists escape sequences and associated actions on display devices capable of the action.

	https://pubs.opengroup.org/onlinepubs/007908799/xcu/printf.html
	the escape sequences listed in the XBD specification, File Format Notation  (\\, \a, \b, \f, \n, \r, \t, \v), which will be converted to the characters they represent
	</code>
	 */
	var to_file_name_escape_sequences = {
		'\n' : '＼n',
		'\r' : '＼r',
		'\t' : '＼t'
	};

	/**
	 * 正規化 file name，排除會導致 error 的字元。 normalize file name
	 * 
	 * @param {String}file_name
	 *            file name
	 * @param {Boolean}do_escape
	 *            是否作 escape
	 * 
	 * @returns {String}正規化 file name
	 * 
	 * @see data.is_matched.string_pre_handler(),
	 *      application.storage.file.get_file_name()
	 * @since 2012/10/13 13:31:21
	 */
	function to_file_name(file_name, do_escape) {
		file_name = file_name.trim();

		// 處理 illegal file name. 去除檔名中不被允許的字元。
		// http://en.wikipedia.org/wiki/Filename#Reserved_characters_and_words

		if (do_escape)
			file_name = file_name
			// 若本來就含有這些 functional 字元的情況，須作 escape。
			.replace(/([＼／｜？＊])/g, '＼$1');
		// else: make result readable.

		file_name = file_name.replace(/[\0-\x1f]/g, function($0) {
			if ($0 in to_file_name_escape_sequences)
				return to_file_name_escape_sequences[$0];

			var c = $0.charCodeAt(0).toString(16), l = c.length;
			if (l === 1 || l === 3)
				c = '0' + c;
			else if (4 < l && l < 8)
				c = '000'.slice(l - 5) + c;
			return '＼' + (c.length === 2 ? 'x' : 'u') + c;
		});

		file_name = file_name
		// functional characters in RegExp.
		.replace(/[\\\/|?*]/g, function($0) {
			return {
				'\\' : '＼',
				// Fraction slash '⁄'
				// Division slash '∕'
				'/' : '／',
				'|' : '｜',
				'?' : '？',
				'*' : '＊'
			}[$0];
		});

		file_name = file_name
		// normalize string.
		// 全寬引號（fullwidth quotation mark）[＂]
		.replace(/"([^"'“”＂]+)"/g, '“$1”').replace(/"/g, '”')
				.replace(/:/g, '：').replace(/</g, '＜').replace(/>/g, '＞');

		if (library_namespace.platform.is_Windows()) {
			file_name = file_name
			// 若是以 "." 結尾，在 Windows 7 中會出現問題，無法移動或刪除。
			.replace(/(.)\.$/, '$1._');
		}

		// 限制長度.
		// http://en.wikipedia.org/wiki/Filename#Length_restrictions
		// http://msdn.microsoft.com/en-us/library/aa365247.aspx#maxpath
		// https://docs.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation
		if (file_name.length > 255) {
			library_namespace
					.warn('to_file_name: The file name will be cutted! ['
							+ file_name.length + '] [' + file_name + ']');
			file_name = file_name.slice(0, 255);
		}

		return file_name;
	}

	_// JSDT:_module_
	.to_file_name = to_file_name;

	var
	/**
	 * 取得副檔名。
	 * 
	 * @type {RegExp}
	 */
	PATTERN_extension = /\.([a-z\d\-]+)$/i,
	/**
	 * 一般字元，非特殊字元之 folder 名。<br />
	 * [...]{1,512}<br />
	 * 
	 * @type {RegExp}
	 */
	PATTERN_ordinary_folder_name = /^[a-z\d ~!@#$%^&()-_+={}[],.]+[\\\/]$/i,

	TARGET_FILE_EXISTS = new Error, NO_EXECUTABLE_FILE = new Error, NOT_YET_IMPLEMENTED = new Error;

	TARGET_FILE_EXISTS.name = 'TARGET_FILE_EXISTS';
	NO_EXECUTABLE_FILE.name = 'NO_EXECUTABLE_FILE';
	NOT_YET_IMPLEMENTED.name = 'NOT_YET_IMPLEMENTED';

	/**
	 * 取得 URI/取得器
	 * 
	 * @param {Function}[module]
	 *            use what module/command to get.
	 * @returns getter
	 * @throws No
	 *             module to use.
	 */
	function URI_accessor(module, setting) {

		if (!module)
			if (URI_accessor.default_module)
				module = URI_accessor.default_module;
			else {
				// detect what module/command to use.
				for (module in URI_accessor.module)
					if (!URI_accessor.test_module(module)) {
						URI_accessor.default_module = module;
						break;
					}
				if (!URI_accessor.default_module)
					module = undefined;
			}

		if ((module in URI_accessor.module)
				&& library_namespace
						.is_Function(module = URI_accessor.module[module]
								(setting)))
			return module;

		throw new Error('No module' + (module ? ' [' + module + ']' : '')
				+ ' to use!');
	}

	// return undefined: OK, others: error.
	URI_accessor.test_module = function(module_name) {
		library_namespace.debug('test module: [' + module_name + ']', 1,
				'URI_accessor.test_module');
		try {
			get_WScript_object().WshShell.Run(module_name, 0, true);
		} catch (e) {
			// 若不存在此執行檔案，將 throw。
			library_namespace.error(e);
			return (e.number & 0xFFFF) === 2 ? NO_EXECUTABLE_FILE : e;
		}
		library_namespace.debug('test module: [' + module_name + ']: OK.', 1,
				'URI_accessor.test_module');
	};

	/**
	 * 從 URI 抽取 file name
	 * 
	 * @param URI
	 *            URI
	 * @returns file name
	 * @throws decodeURIComponent
	 *             error
	 */
	URI_accessor.extract_file_name = function(URI) {
		// 須處理非標準之符號，可能會有 &#x27; 之類的東西。因此對 #hash 之處理得放在 HTML_to_Unicode() 後面。
		var m = URI.replace(/([^&])#.*/, '$1')
		//
		.match(/(([^\/\\]+)[\/\\]+)?([^\/\\]*)$/);
		if (m) {
			return URI_accessor.regularize_file_name(
			// 因為 escape 會多出不必要符號，因此不 escape。
			HTML_to_Unicode(m[3] || m[1]), false);
		}
	};

	// 正規化 file name
	URI_accessor.regularize_file_name = to_file_name;

	URI_accessor.setting = {
		// referer : '',
		window_style : function() {
			// 0: hidden, 1: show, 2: Activate & minimize,
			// 7: Minimize. The active window remains active.
			return library_namespace.is_debug() ? 1 : 0;
		},
		// 指定當檔名具有特殊字元時之暫存檔。
		// temporary_file : 'URI_accessor.tmp',
		// temporary_file : 'C:\\URI_accessor.tmp',
		// temporary_file : function(URI, save_to, FSO) { return
		// temporary_file_path; },
		// temporary_file : function(URI, save_to, FSO) { return save_to +
		// '.unfinished'; },
		temporary_file : function(URI, save_to) {
			var extension = save_to.match(PATTERN_extension),
			// 應該用 save_to 的 md5 值。
			hash_id = Math.ceil(Math.random() * 1e9);
			return 'URI_accessor.'
					+ (extension ? 'temp.' + hash_id + extension[0] : hash_id
							+ '.temp');
		},

		// do not overwrite:
		// target_exist : false

		// when target file exists, save to ..
		// target_exist : function(target, FSO) { return save_to || skip; },

		// when target file exists, rename old to ..
		// target_exist : [ save new to, rename old to ],

		target_exist : [],

		user_agent : 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.29 Safari/537.22'
	};

	URI_accessor.target_exist = {
		rename : function(target, FSO) {
			var proto = target + '.old', move_to = proto, i = 0;
			// TODO: when error occurred..
			while (FSO.FileExists(move_to))
				move_to = proto + ++i;
			try {
				FSO.MoveFile(target, move_to);
			} catch (e) {
			}
			return target;
		},
		// save new to, rename old to
		move : function(save_to, move_to, FSO) {
			if (!move_to)
				move_to = save_to + '.old';
			if (FSO.FileExists(move_to))
				try {
					FSO.DeleteFile(move_to);
				} catch (e) {
				}
			try {
				FSO.MoveFile(save_to, move_to);
			} catch (e) {
			}
			return save_to;
		}
	};

	/**
	 * <code>
	default command modules.
	取得方法：
	wget
	curl
	lftp
	prozilla
	puf
	CuteFTPPro.TEConnection

	XMLHttp
	Msxml2.DOMDocument
	InternetExplorer.Application
	WinHttp.WinHttpRequest.5.1
		深入挖掘Windows腳本技術(5) - 網頁特效代碼 - IT學習者	http://www.itlearner.com/Article/2008/4024_5.shtml
		獲取軟件下載的真實地址！再談獲取Response.redirect重定向的URL-asp教程-asp學習網	http://www.aspxuexi.com/xmlhttp/example/2006-8-8/852.htm
		http://www.360doc.com/content/11/0108/11/597197_84935972.shtml
		從msdn得知，WinHttp.WinHttpRequest.5.1 是 msxml 4.0 的底層對象，也就是說 XMLHTTP/ServerXMLHTTP 也是在它的基礎上封裝而來。

	XMLHTTP組件在處理包含Location頭的302消息時太智能了，直接跳轉到最後的頁面

	TODO:
	先知道 file size
	use $PATH
	</code>
	 */
	URI_accessor.module = {
		curl : function(user_setting) {
			// http://curl.haxx.se/docs/httpscripting.html

			// The ORDINAL 2821 could not be located in the dynamic link library
			// LIBEAY32.dll
			// This is caused by a conflict in the version of LIBEAY32.DLL
			// Solution: install the latest version of Win32 OpenSSL
			// http://www.slproweb.com/products/Win32OpenSSL.html

			if (false) {
				library_namespace.debug('URI_accessor.setting.temporary_file:'
						+ URI_accessor.setting.temporary_file, 2,
						'URI_accessor.module.curl');
				library_namespace.debug('user_setting.temporary_file:'
						+ user_setting.temporary_file, 2,
						'URI_accessor.module.curl');
			}
			var setting = new library_namespace.setting_pair(Object
					.create(null), URI_accessor.setting, user_setting),
			//
			value = setting('user_agent'),
			//
			tmp = setting('cookie') || setting('cookie_file'),
			//
			command_array = [
					'curl --remote-time --insecure --compressed '
							+ (library_namespace.is_debug(2) ? '-v ' : '')
							+ (setting('additional_options') ? setting('additional_options')
									+ ' '
									: '')
							// --cookie STRING/FILE String or file to read
							// cookies from (H)
							+ (tmp ? '--cookie "' + tmp + '" ' : '')
							+ ((tmp = setting('cookie_file')
									|| setting('cookie')) ? '--cookie-jar "'
									+ tmp + '" ' : '') + '--output "', '',
					(value ? '" --user-agent "' + value : '') + '"' ];

			if (setting('POST')) {
				setting('POST_index', command_array.length + 1);
				command_array.push(' --data "', '', '"');
			}

			command_array[command_array.length - 1] += ' --referer "';

			tmp = '" "';
			if (value = setting('referer')) {
				library_namespace.debug([ 'referer: ', {
					a : value,
					href : value
				} ], 2, 'URI_accessor.module.curl');
				command_array[command_array.length - 1] += value + tmp;
			} else
				setting('referer_index', command_array.length), command_array
						.push('', tmp);

			command_array.push('', '"');

			library_namespace.debug('command_array: ' + command_array, 2,
					'URI_accessor.module.curl');
			if (false)
				library_namespace.debug('temporary_file: ['
						+ (typeof setting('temporary_file')) + ']'
						+ setting('temporary_file'), 2,
						'URI_accessor.module.curl');

			return URI_accessor.default_getter(setting, command_array,
					URI_accessor.default_apply_command);
		},

		wget : function(user_setting) {
			var setting = new library_namespace.setting_pair(Object
					.create(null), URI_accessor.setting, user_setting), value = setting('user_agent'), tmp = '" "', command_array = [
					'wget --timestamping --keep-session-cookies --no-check-certificate '
							+ (library_namespace.is_debug(2) ? '-d ' : '')
							+ (setting('additional_options') ? setting('additional_options')
									+ ' '
									: '') + '--output-document="', '',
					(value ? '" --user-agent="' + value : '') + '"' ];

			if (setting('POST')) {
				setting('POST_index', command_array.length + 1);
				command_array.push(' --post-data="', '', '"');
			}

			command_array[command_array.length - 1] += ' --referer="';

			if (value = setting('referer')) {
				library_namespace.debug([ 'referer: ', {
					a : value,
					href : value
				} ], 2, 'URI_accessor.module.wget');
				command_array[command_array.length - 1] += value + tmp;
			} else
				setting('referer_index', command_array.length), command_array
						.push('', tmp);

			command_array.push('', '"');

			library_namespace.debug('command_array: ' + command_array, 2,
					'URI_accessor.module.wget');
			if (false)
				library_namespace.debug('temporary_file: ['
						+ (typeof setting('temporary_file')) + ']'
						+ setting('temporary_file'), 2,
						'URI_accessor.module.wget');

			return URI_accessor.default_getter(setting, command_array,
					URI_accessor.default_apply_command);
		}
	};

	URI_accessor.default_apply_command = function(setting, command_array, URI,
			save_to, temporary_file_used) {
		command_array[1] = temporary_file_used || save_to;
		command_array[command_array.length - 2] = URI;
		var i;
		if (i = setting('referer_index'))
			command_array[i] = URI;
		if (i = setting('POST_index'))
			command_array[i] = setting('POST') || '';
	};

	URI_accessor.default_getter = function(setting, command_array,
			apply_command) {
		if (false)
			library_namespace.debug('get_WScript_object: ['
					+ (typeof get_WScript_object) + ']' + get_WScript_object,
					2, 'URI_accessor.default_getter');
		var WSO = get_WScript_object();
		if (false)
			library_namespace.debug('WSO: [' + (typeof WSO) + ']' + WSO, 2,
					'URI_accessor.default_getter');
		if (!WSO) {
			library_namespace.warn('No WScript objects got!');
			return;
		}

		var WshShell = WSO.WshShell, FSO = WSO.FSO,
		//
		normalize_directory = function(id) {
			var directory = setting(id);
			if (directory && !/[\\\/]$/.test(directory))
				setting(id, directory + library_namespace.env.path_separator);
		}, normalize_function = function(id) {
			if (typeof setting(id) !== 'function')
				setting(id, undefined);
		},
		//
		window_style = setting('window_style'), temporary_file = setting('temporary_file');
		library_namespace.debug('temporary_file: [' + (typeof temporary_file)
				+ ']' + temporary_file, 2, 'URI_accessor.default_getter');

		WSO = null;

		var getter = function(URI, save_to) {
			var start_time = new Date, result, temporary_file_used, tmp;

			if (library_namespace.is_Object(save_to)) {
				setting(save_to);
				normalize_directory('directory');
				normalize_function('callback');
				save_to = setting('save_to');
			}

			// 若沒有輸入 save_to，從 URI 取得。
			if (!save_to)
				save_to = URI_accessor.extract_file_name(URI);

			// 得放在偵測 temporary file 之前，預防 directory
			// 包含非普通的(unordinary)字符。
			if (tmp = setting('directory'))
				save_to = tmp + save_to;

			if (FSO.FileExists(save_to) && ('target_exist' in setting())) {
				if (Array.isArray(tmp = setting('target_exist')))
					tmp = URI_accessor.target_exist.move(tmp[0] || save_to,
							tmp[1], FSO);
				else if (typeof tmp === 'string' && tmp.charAt(0) === '*')
					tmp = URI_accessor.target_exist[tmp.slice(1)];

				if (typeof tmp === 'function')
					tmp = tmp(save_to, FSO);

				if (typeof tmp === 'string' && tmp)
					save_to = tmp;
				else {
					library_namespace
							.debug(
									'Skip ['
											+ URI
											+ ']: target file ['
											+ save_to
											+ '] exists and target_exist of setting refused rename or overwrite.',
									2, 'URI_accessor.default_getter.getter');
					result = TARGET_FILE_EXISTS;
					if (tmp = setting('callback'))
						tmp(save_to, URI, result);
					return result;
				}
			}

			// 只有非常用字母才需要 temporary file。
			if (temporary_file && !/^[\x20-\x7e]+$/.test(save_to)) {
				temporary_file_used = typeof temporary_file === 'function' ? temporary_file(
						URI, save_to, FSO)
						: temporary_file;
				library_namespace.debug('temporary file: ['
						+ temporary_file_used + ']←[' + temporary_file + ']',
						2, 'URI_accessor.default_getter.getter');
			}

			library_namespace.debug('Downloading [<a href="'
					+ URI
					+ '" target="_blank">'
					+ URI
					+ '</a>]'
					+ (temporary_file_used ? '→[' + temporary_file_used + ']'
							: '') + '→[' + save_to + ']..', 1,
					'URI_accessor.default_getter.getter');

			apply_command(setting, command_array, URI, save_to,
					temporary_file_used);
			library_namespace.debug(
					'Execute: [' + command_array.join('') + ']', 2,
					'URI_accessor.default_getter.getter');
			library_namespace.debug('WshShell: [' + (typeof WshShell) + ']'
					+ WshShell, 3, 'URI_accessor.default_getter.getter');

			try {
				// WshShell.Run("cmd.exe /c set > env.txt", 1, true);
				result = WshShell.Run(command_array.join(''),
				// Window Style
				1,
				// typeof window_style === 'function' ? window_style() :
				// window_style,
				// true: 等調用的程序退出後再執行。
				true);
				if (result) {
					// result = EXIT CODE
					this.lastest_errorno = result;
					save_to = '[error] ' + save_to;
				}

				if (temporary_file_used)
					if (FSO.FileExists(temporary_file_used))
						// 出問題還是照搬。
						// 需注意出問題過，原先就存在的情況。
						FSO.MoveFile(temporary_file_used, save_to);
					else
						library_namespace
								.warn('temporary file does not exists: ['
										+ temporary_file_used + ']');

				library_namespace.debug('['
						+ URI
						+ ']→[<a href="'
						+ save_to
						+ '" target="_blank">'
						+ save_to
						+ '</a>] @ '
						+ Math.round((new Date - start_time) / 1000)
						+ ' sec '
						+ (result ? ', <em>error code ' + result + '</em>.'
								: ''));

			} catch (e) {
				// library_namespace.error(e);
				if ((e.number & 0xFFFF) === 2)
					// 若不存在此執行檔案，將 throw。
					// '找不到執行檔: wget。您可能需要安裝此程式後再執行。'
					// http://users.ugent.be/~bpuype/wget/
					result = NO_EXECUTABLE_FILE;
				else {
					library_namespace.error(e);
					result = e;
				}
			}

			if (tmp = setting('callback'))
				tmp(save_to, URI, result, setting);
			return result;
		};

		if (false)
			library_namespace.debug('WshShell: [' + (typeof WshShell) + ']'
					+ WshShell, 2, 'URI_accessor.default_getter');

		// binding prototype
		if (false)
			library_namespace.set_method(URI_accessor.prototype,
					getter.prototype);
		else
			getter.prototype = URI_accessor.prototype;

		normalize_directory('directory');
		normalize_function('callback');

		return getter;
	};

	library_namespace.set_method(URI_accessor.prototype, {
		// TODO
		list : function(URI_array, index_URI, index_save_to) {
			throw NOT_YET_IMPLEMENTED;
		},
		process : function(index) {
			throw NOT_YET_IMPLEMENTED;
		}
	});

	_// JSDT:_module_
	.URI_accessor = URI_accessor;

	/**
	 * get URI / URI 取得器.
	 * 
	 * @example <code>
	 * get_URI('http://lyrics.meicho.com.tw/game/index.htm');
	 * </code>
	 * 
	 * @param {String}URI
	 *            URI to get
	 * @param {String}[save_to]
	 *            path save to
	 * 
	 * @returns error
	 */
	function get_URI(URI, save_to, setting) {
		if (get_URI.getter && (!setting
		// 有可能使用相同的 setting object，但僅改變了部分內容，如 temporary_file。
		// || get_URI.setting === setting
		))
			return get_URI.getter(URI, save_to);

		var i, getter, result;
		for (i in URI_accessor.module) {
			result = (getter = new URI_accessor(i, setting))(URI, save_to);
			if (result !== NO_EXECUTABLE_FILE) {
				// cache default setting
				get_URI.getter = getter;
				get_URI.setting = setting;
				break;
			}
		}

		return result;
	}

	_// JSDT:_module_
	.get_URI = get_URI;

	// @since 2021/2/27 6:29:0 remove get_video() for 下載 Youtube 影片檔案與播放清單:
	// 年久失修且網站改版，無法使用且沒想要維護了。

	/**
	 * 自動組態設定檔/自動設定網址
	 * 
	 * url: 完整的URL字串, host: 在 URL字串中遠端伺服器的網域名稱。該參數祇是為了 方便而設定的，是與URL在 :// 和 /
	 * 中的文字是一模 一樣。但是傳輸阜（The port number）並不包含其中 。當需要的時候可以從URL字串解讀出來。
	 * 
	 * <code>
	http://contest.ks.edu.tw/syshtml/proxy-pac.html
	Proxy Auto-Config File Format	http://lyrics.meicho.com.tw/proxy.pac
	http://openattitude.irixs.org/%E7%BC%96%E5%86%99-pac-proxy-auto-config-%E6%96%87%E4%BB%B6/
	http://www.atmarkit.co.jp/fwin2k/experiments/ieproxy/ieproxy_01.html
	http://www.cses.tcc.edu.tw/~chihwu/proxy-pac.htm
	you should configure your server to map the .pac filename extension to the MIME type:
		application/x-ns-proxy-autoconfig

	網域名稱之長度，經punycode轉碼後，不得超過63字元,大約二十個中文字以內。

	FindProxyForURL 將會傳回一個描寫Proxy組態設定的單一字串。假如該字串為空字串，則表示瀏覽器不使用 Proxy 伺服器。
	假如有多個代理伺服器設定同時存在，則最左邊的設定將第一個使用，直 到瀏覽器無法建立連線才會更換到第二個設定。而瀏覽器將會在30分鐘後 自動對於先前無回應的 PROXY 伺服器重新連線。而瀏覽器將會於一個小時 後自動再連線一次（每一次的重新連線都會增加30分鐘）。
	如果說所有的 PROXY 伺服器都當掉了，也沒有將 DIRECT 設定在 .pac 檔 案，那麼瀏覽器在嘗試建立連線 20 分鐘後將會詢問是否要暫時忽略 Proxy 服器直接存取網路，下一次詢問的時間則是在 40 分鐘後（注意！每一次 詢問都會增加20分鐘)

	http://www.microsoft.com/technet/prodtechnol/ie/ieak/techinfo/deploy/60/en/corpexjs.mspx?mfr=true
	The isInNet, isResolvable, and dnsResolve functions query a DNS server.
	The isPlainHostName function checks to see if there are any dots in the hostname. If so, it returns false; otherwise, the function returns true.
	The localHostOrDomainIs function is executed only for URLs in the local domain.
	The dnsDomainIs function returns true if the domain of the hostname matches the domain given.

	DIRECT - 不調用代理，直接連接
	PROXY host:port - 調用指定代理(host:port)
	SOCKS host:port - 調用指定SOCKS代理(host:port)
	如果是選用由分號分割的多塊設置，按照從左向右，最左邊的代理會被最優先調用，除非瀏覽器無法成功和proxy建立連接，那麼下一個配置就會被調 用。如果瀏覽器遇到不可用的代理服務器，瀏覽器將在30分鐘後自動重試先前無響應的代理服務器，一個小時後會再次進行嘗試，依此類推，每次間隔時間為 30 分鐘。
	</code>
	 */
	function FindProxyForURL(url, host) {
		var lch = host.toLowerCase();

		// isPlainHostName(lch) || isInNet(lch,"192.168.0.0","255.255.0.0") ||
		// isInNet(lch,"127.0.0.0","255.255.0.0") || dnsDomainIs(lch,".tw")
		// ?"DIRECT";
		return (
		/**
		 * <code>
		//dnsDomainIs(lch,"holyseal.net") || dnsDomainIs(lch,".fuzzy2.com") ? "PROXY 211.22.213.114:8000; DIRECT":	//	可再插入第二、三順位的proxy
		http://www.cybersyndrome.net/

		http://www.publicproxyservers.com/page1.html
		curl --connect-timeout 5 -x 219.163.8.163:3128 http://www.getchu.com/ | grep Getchu.com
		curl --connect-timeout 5 -x 64.34.113.100:80 http://www.getchu.com/ | grep Getchu.com
		curl --connect-timeout 5 -x 66.98.238.8:3128 http://www.getchu.com/ | grep Getchu.com

		dnsDomainIs(lch, ".cn") || dnsDomainIs(lch, "pkucn.com") ? "PROXY proxy.hinet.net:80; DIRECT" :	//	2009/8/16 14:20:32	用 HiNet 網際網路 Proxy Server 上大陸網速度還滿快的	http://www.ltivs.ilc.edu.tw/proxy/proxy/hinet.htm
		dnsDomainIs(lch, ".getchu.com") ? "PROXY 219.163.8.163:3128; PROXY 64.34.113.100:80; PROXY 66.98.238.8:3128; DIRECT" :
		dnsDomainIs(lch, ".minori.ph") ? "PROXY 219.94.198.110:3128; PROXY 221.186.108.237:80; DIRECT" :	//	Japan Distorting Open Proxy List	http://www.xroxy.com/proxy--Distorting-JP-nossl.htm
		//	slow:	http://www.cybersyndrome.net/country.html
		dnsDomainIs(lch, ".tactics.ne.jp") ? "PROXY 202.175.95.171:8080; PROXY 203.138.90.141:80; DIRECT" :
		dnsDomainIs(lch,".ys168.com")		? "PROXY 76.29.160.230:8000; DIRECT":	//	永硕E盘专业网络硬盘服务
		</code>
		 */
		dnsDomainIs(lch, "erogamescape.dyndns.org")
		//
		? "PROXY 211.22.213.114:8000; DIRECT"
		// http://www.twnic.net.tw/proxy.pac 將中文網域名稱轉成英文網域名稱
		// :/^[a-z\.\d_\-]+$/.test(lch)?"DIRECT":"PROXY
		// dnsrelay.twnic.net.tw:3127"
		: "DIRECT");
	}

	// http://help.globalscape.com/help/cuteftppro8/
	// setupCuteFTPSite[generateCode.dLK]='parse_URI';
	function setupCuteFTPSite(targetS, site) {
		if (typeof targetS === 'string')
			targetS = new URI(targetS, {
				protocol : 'ftp:'
			});
		if (!targetS)
			return;

		if (site) {
			try {
				site.Disconnect();
			} catch (e) {
			}
			try {
				site.Close();
			} catch (e) {
			}
		}
		try {
			site = null;
			site = WScript.CreateObject("CuteFTPPro.TEConnection");
			site.Host = targetS.host;
			// http://help.globalscape.com/help/cuteftppro8/setting_protocols.htm
			// The default Protocol is FTP, however SFTP (SSH2), FTPS (SSL),
			// HTTP, and HTTPS can also be used.
			site.Protocol = targetS.protocol.replace(/:$/, '').toUpperCase();
			if (targetS.username)
				site.Login = targetS.username;
			if (targetS.password)
				site.Password = targetS.password;

			site.useProxy = "off";
			site.TransferType = 'binary';

			site.Connect();

			// site.TransferURL("http://lyrics.meicho.com.tw/run.js");
		} catch (e) {
			return;
		}
		return site;
	}

	/*
	 * TODO: transferURL(remote URI,remote URI)
	 */
	// transferURL[generateCode.dLK]='parsePath,parse_URI,setupCuteFTPSite';
	function transferURL(from_URI, to_URI) {
		// var connectTo = from_URI.includes('://') ? from_URI : to_URI,
		// CuteFTPSite = setupCuteFTPSite(connectTo);
		var
		// isD: use download (else upload)
		isD, CuteFTPSite,
		// lF: local file
		lF,
		// rP: remote path
		rP;
		if (from_URI.includes('://'))
			isD = 0;
		else if (to_URI.includes('://'))
			isD = 1;
		else
			// local to local?
			return;
		lF = parsePath(isD ? to_URI : from_URI);
		CuteFTPSite = setupCuteFTPSite(rP = new URI(isD ? from_URI : to_URI, {
			protocol : 'ftp:'
		}));
		if (!CuteFTPSite || !CuteFTPSite.IsConnected)
			return;

		// 到這裡之後，就認定 CuteFTPPro.TEConnection 的 initial 沒有問題，接下來若出問題，會嘗試重新
		// initial CuteFTPPro.TEConnection.

		// initial local folder
		try {
			if (!site.LocalExists(site.LocalFolder = lF.directory))
				site.CreateLocalFolder(lF.directory);
		} catch (e) {
			return;
		}
		site.RemoteFolder = rP.pathname;

		if (isD) {
			site.Download(rP.fileName, lF.fileName || rP.fileName);
			if (!site.LocalExists(lF.path))
				return;
		} else {
			site.Upload(lF.fileName, rP.fileName || lF.fileName);
			if (!site.LocalExists(rP.path))
				return;
		}

		// get list
		// site.GetList('/OK', '', '%NAME');
		// var l = site.GetResult().replace(/\r\n?/g, '\n').split('\n');

		// close
		try {
			site.Disconnect();
		} catch (e) {
		}
		site.Close();

		return 1;
	}

	// ---------------------------------------------------------------

	// var globalThis = library_namespace.env.global;
	if (library_namespace.is_WWW(true) || library_namespace.platform.nodejs) {
		library_namespace.set_method(library_namespace.env.global, {
			// defective polyfill for W3C URL API, URLSearchParams()
			URL : defective_URL,
			URLSearchParams : defective_URLSearchParams
		});

		// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
		// URLSearchParams_set_parameters(parameters)
		URLSearchParams.prototype.set_parameters = function set_parameters(
				parameters, options) {
			if (Array.isArray(parameters))
				parameters = parameters.join('&');
			// assert: typeof parameters === 'object'
			// || typeof parameters === 'string'
			parameters = new URLSearchParams(parameters);

			var search = this;
			parameters.forEach(function(value, key) {
				search.append(key, value);
			});
			return this;
		};
	}

	return (_// JSDT:_module_
	);
}
