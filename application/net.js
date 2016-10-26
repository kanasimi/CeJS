
/**
 * @name	CeL function for net
 * @fileoverview
 * 本檔案包含了處理網路傳輸相關功能的 functions。
 * @since	
 */


if (typeof CeL === 'function')
CeL.run(
{
name:'application.net',
// includes() @ data.code.compatibility.
require : 'data.code.compatibility.|data.native.|application.OS.Windows.get_WScript_object|interact.DOM.HTML_to_Unicode',
code : function(library_namespace) {
'use strict';

//requiring
var get_WScript_object = this.r('get_WScript_object'), HTML_to_Unicode = this.r('HTML_to_Unicode');



/**
 * null module constructor
 * @class	net 的 functions
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


/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
var NOT_FOUND = ''.indexOf('_');




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



//gethost[generateCode.dLK]='Sleep';
/*
	** @deprecated 改用 getNetInfo()

	get host name & IP	2005/3/1 22:32
	只能用於WinXP, Win2000 server（換個版本指令以及輸出可能就不同！），而且非常可能出狀況！
	Win98 不能反查，只能 check local IP
*/
function gethost(host) {
	var IP, p, c, t, i, f, cmd;
	//	決定shell	cmd 對於 ".. > ""path+filename"" " 似乎不能對應的很好，所以還是使用 "cd /D path;.. > ""filename"" "
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
		WshShell.Run(c + 'ipconfig > ' + (cmd ? '""' + f + '"" "' : p + f), 0, 1);	//	winipcfg
		if (t = simpleRead(f = p + f)) {
			// TODO: use t.between()
			if (i = t.indexOf('PPP adapter'), i != NOT_FOUND)
				t = t.slice(i);
			else if (i = t.indexOf('Ethernet adapter'), i != NOT_FOUND)
				t = t.slice(i);
			if (i = t.indexOf('IP Address'), i != NOT_FOUND)
				t = t.slice(i);
			if (t.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/))
				IP = RegExp.$1;
		}
		try {
			fso.DeleteFile(f);
		} catch (e) { }
		if (!IP)
			return [0, 0];
	}
	if (!cmd)
		return [host, IP];	//	Win98沒有nslookup
	f = 'qDNS.tmp.txt';
	WshShell.Run(c + 'nslookup ' + (cmd ? '""' + (IP || host) + '"" > ""' + f + '"" "' : (IP || host) + '>' + p + f), 0, 1);
	//try { WScript.Sleep(200); } catch (e) { }	//	/C:執行字串中所描述的指令然後結束指令視窗	(x)因為用/c，怕尚未執行完。
	if ((t = simpleRead(f = p + f)) && t.match(/Server:/)
		&& t.match(/Address:\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
		t = t.slice(RegExp.lastIndex);
		host = t.match(/Name:\s*([^\s]+)/) ? RegExp.$1 : 0;
		IP = t.match(/Address:\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/) ? RegExp.$1 : 0;
		//library_namespace.debug(host+'\n'+IP);
	} else
		host = IP = 0;
	try {
		fso.DeleteFile(f);
	} catch (e) { }
	return [host, IP];
}



//	for element.dataset
//if (!library_namespace.global.DOMStringMap)
//	library_namespace.global.DOMStringMap = library_namespace.setting_pair;


/*

test:
/fsghj.sdf
a.htm
http://www.whatwg.org/specs/web-apps/current-work/#attr-input-pattern
file:///D:/USB/cgi-bin/lib/JS/_test_suit/test.htm
//www.whatwg.org/specs/web-apps/current-work/#attr-input-pattern

TODO:
.fileName:
file:///D:/USB/cgi-bin/lib/JS/_test_suit/test.htm
->
D:\USB\cgi-bin\lib\JS\_test_suit\test.htm

eURI : /^((file|telnet|ftp|https?)\:\/\/|~?\/)?(\w+(:\w+)?@)?(([-\w]+\.)+([a-z]{2}|com|org|net))?(:\d{1,5})?(\/([-\w~!$+|.,=]|%[a-f\d]{2})*)?(\?(([-\w~!$+|.,*:]|%[a-f\d{2}])+(=([-\w~!$+|.,*:=]|%[a-f\d]{2})*)?&?)*)?(#([-\w~!$+|.,*:=]|%[a-f\d]{2})*)?$/i,

TODO:
URI, IRI, XRI

*/
/**
 * Parses URI.
 * 
 * @example <code>
 * alert(parse_URI('ftp://user:cgh@dr.fxgv.sfdg:4231/3452/dgh.rar?fg=23#hhh').hostname);
 * </code>
 * 
 * @param {String}URI
 *            URI to parse
 * 
 * @return parsed object
 * 
 * @since 2010/4/13 23:53:14 from parseURI+parseURL
 * 
 * @_memberOf _module_
 * 
 * @see RFC 1738, RFC 2396, RFC 3986, Uniform Resource Identifier (URI): Generic
 *      Syntax, http://tools.ietf.org/html/rfc3987,
 *      http://flanders.co.nz/2009/11/08/a-good-url-regular-expression-repost/,
 *      http://www.mattfarina.com/2009/01/08/rfc-3986-url-validation,
 *      https://developer.mozilla.org/en/DOM/window.location, also see
 *      batURL.htm
 */
function parse_URI(URI) {
	var matched, tmp, href = URI, path;
	if (!href
			||
		// 不能用 instanceof String!
			typeof href !== 'string'
			|| !(matched = href.match(/^([\w\d\-]{2,}:)?(\/\/)?(\/[A-Z]:|[^\/#?&\s:]+)([^\s:]*)$/i)))
		return;
	library_namespace.debug('parse [' + URI + ']: ' + matched.join('<br />\n'), 2);

	URI = library_namespace.is_WWW() ? {
		// protocol包含最後的':',search包含'?',hash包含'#'.
		// file|telnet|ftp|https
		protocol: location.protocol,
		hostname: location.hostname,
		port: location.port,
		host: location.host,
		// local file @ IE: C:\xx\xx\ff, others: /C:/xx/xx/ff
		pathname: location.pathname
	} : library_namespace.null_Object();
	URI.URI = href;

	if (tmp = matched[1])
		URI.protocol = tmp;
	URI._protocol = URI.protocol.slice(0, -1);
	library_namespace.debug('protocol [' + URI._protocol + ']', 2);

	/**
	 * ** filename 可能歸至m[4]!<br />
	 * 判斷準則:<br />
	 * gsh.sdf.df#dhfjk	filename|hostname<br />
	 * gsh.sdf.df/dhfjk	hostname<br />
	 * gsh.sdf.df?dhfjk	filename<br />
	 * gsh.sdf.df		filename<br />
	 */
	href = matched[3];
	path = matched[4];
	if (href && !/^\/[A-Z]:$/i.test(href)
			&& (path.charAt(0) === '/' || /[@:]/.test(href))) {
		// 處理 username:password
		if (matched = href.match(/^([^@]*)@(.+)$/)) {
			tmp = matched[1].match(/^([^:]+)(:(.*))?$/);
			if (!tmp)
				return;
			URI.username = tmp[1];
			if (tmp[3])
				URI.password = tmp[3];
			href = matched[2];
		}

		// 處理 host
		if (matched = href.match(/^([^\/#?&\s:]+)(:(\d{1,5}))?$/)) {
			// host=hostname:port
			URI.host = URI.hostname = matched[1];
			if (matched[3])
				URI.port = parseInt(matched[3], 10);
			else if (tmp = {
					http: 80,
					ftp: 21
			}[URI._protocol])
				URI.host += ':' + (URI.port = tmp);
		} else
			return;

	} else {
		// test URI.protocol === 'file:'
		path = href + path;
		href = '';
	}
	if (!href)
		library_namespace.warn('將 [' + path + '] 當作 pathname!');
	library_namespace.debug('local file: [' + location.pathname + ']', 2);

	if (!/^([^%]+|%[a-f\d]{2})+$/i.test(path))
		library_namespace.warn('encoding error: [' + path + ']');

	library_namespace.debug('parse path: [' + path + ']', 2);
	if (path && (matched = path.match(/^((.*\/)?([^\/#?]*))?(\?([^#]*))?(#(.*))?$/))) {
		// pathname={path}filename
		library_namespace.debug('pathname: [' + matched + ']', 2);
		// .path 會隨不同 OS 之 local file 表示法作變動!
		URI.path = /^\/[A-Z]:/i.test(URI.pathname = matched[1]) ? matched[2].slice(1).replace(/\//g, '\\') : matched[2];
		URI.filename = matched[3];
		URI.search = matched[4];
		URI._search = parse_URI.parse_search(matched[5]);
		URI.hash = matched[6];
		URI._hash = matched[7];
	} else {
		if (!href)
			return;
		URI.path = URI.pathname.replace(/[^\/]+$/, '');
	}
	library_namespace.debug('path: [' + URI.path + ']', 2);

	// href=protocol:(//)?username:password@hostname:port/path/filename?search#hash
	URI.href = (URI.protocol ? URI.protocol + '//' : '')
			+ (URI.username ? URI.username
					+ (URI.password ? ':' + URI.password : '') + '@' : '')
			+ URI.host + URI.pathname + (URI.search || '') + (URI.hash || '');

	library_namespace.debug('href: [' + URI.href + ']', 2);
	return URI;
}


parse_URI.parse_search = function parse_search(string, param, options) {
	var data = typeof string === 'string' ? string.replace(/\+/g, '%20').split(/&/) : [], i = 0, l = data.length, name, value, matched;
	if (!library_namespace.is_Object(param))
		param = library_namespace.null_Object();
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	for (; i < l; i++) if (data[i]) {
		if (matched = data[i].match(/^([^=]+)=(.*)$/)) {
			name = matched[1];
			value = decodeURIComponent(matched[2]);
		} else {
			name = data[i];
			value = 'default_value' in options ? options.default_value : name;
		}

		if (library_namespace.is_debug(2))
			library_namespace.debug('[' + (i + 1) + '/' + l + '] '
				+ (param[name] ? '<span style="color:#888;">(' + param[name].length + ')</span> [' + name + '] += [' + value + ']' : '[' + name + '] = [' + value + ']'));

		if (options.split_pattern
		//
		&& (matched = value.split(options.split_pattern)).length > 1) {
			if (name in param)
				if (Array.isArray(param[name]))
					Array.prototype.push.apply(param[name], matched);
				else {
					matched.unshift(param[name]);
					param[name] = matched;
				}
			else
				param[name] = matched;
		} else
			if (name in param) {
				if (Array.isArray(param[name]))
					param[name].push(value);
				else
					param[name] = [ param[name], value ];
			} else
				param[name] = value;
	}

	if (options.Array_only)
		for (name in param)
			if (!Array.isArray(param[name]))
				param[name] = [ param[name] ];

	return param;
};

_// JSDT:_module_
.
parse_URI = parse_URI;


/**
 * 正規化 file name，排除會導致error的字元。
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
		var c = $0.charCodeAt(0).toString(16), l = c.length;
		if (l === 1 || l === 3)
			c = '0' + c;
		else if (4 < l && l < 8)
			c = '000'.slice(l - 5) + c;
		return '＼' + (c.length === 2 ? 'x' : 'u') + c;
	})

	// functional characters in RegExp.
	.replace(/[\\\/|?*]/g, function($0) {
		return {
			'\\' : '＼',
			'/' : '／',
			'|' : '｜',
			'?' : '？',
			'*' : '＊'
		}[$0];
	})

	// normalize string.
	// 全寬引號（fullwidth quotation mark）[＂]
	.replace(/"([^"'“”＂]+)"/g, '“$1”').replace(/"/g, '”').replace(/:/g, '：')
			.replace(/</g, '＜').replace(/>/g, '＞');

	// 限制長度.
	// http://en.wikipedia.org/wiki/Filename#Length_restrictions
	// http://msdn.microsoft.com/en-us/library/aa365247.aspx#maxpath
	if (file_name.length > 255) {
		library_namespace.warn('to_file_name: The file name will be cutted! ['
				+ file_name.length + '] [' + file_name + ']');
		file_name = file_name.slice(0, 255);
	}
	return file_name;
}

_// JSDT:_module_
.
to_file_name = to_file_name;


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

TARGET_FILE_EXISTS = new Error,
NO_EXECUTABLE_FILE = new Error,
NOT_YET_IMPLEMENTED = new Error;

TARGET_FILE_EXISTS.name = 'TARGET_FILE_EXISTS';
NO_EXECUTABLE_FILE.name = 'NO_EXECUTABLE_FILE';
NOT_YET_IMPLEMENTED.name = 'NOT_YET_IMPLEMENTED';


/**
 * 取得 URI/取得器
 * @param {Function}[module]	use what module/command to get.
 * @returns	getter
 * @throws	No module to use.
 */
function URI_accessor(module, setting) {

	if (!module)
		if (URI_accessor.default_module)
			module = URI_accessor.default_module;
		else {
			//	detect what module/command to use.
			for (module in URI_accessor.module)
				if (!URI_accessor.test_module(module)) {
					URI_accessor.default_module = module;
					break;
				}
			if (!URI_accessor.default_module)
				module = undefined;
		}

	if ((module in URI_accessor.module)
			&& library_namespace.is_Function(module = URI_accessor.module[module](setting)))
		return module;

	throw new Error('No module' + (module ? ' [' + module + ']' : '') + ' to use!');
}

//	return undefined: OK, others: error.
URI_accessor.test_module = function (module_name) {
	library_namespace.debug('test module: [' + module_name + ']', 1, 'URI_accessor.test_module');
	try {
		get_WScript_object().WshShell.Run(module_name, 0, true);
	} catch (e) {
		// 若不存在此執行檔案，將 throw。
		library_namespace.err(e);
		return (e.number & 0xFFFF) === 2 ? NO_EXECUTABLE_FILE : e;
	}
	library_namespace.debug('test module: [' + module_name + ']: OK.', 1, 'URI_accessor.test_module');
};

/**
 * 從 URI 抽取 file name
 * @param URI	URI
 * @returns	file name
 * @throws	decodeURIComponent error
 */
URI_accessor.extract_file_name = function(URI) {
	// 須處理非標準之符號，可能會有 &#x27; 之類的東西。因此對 #hash 之處理得放在 HTML_to_Unicode() 後面。
	var m = URI.replace(/([^&])#.*/, '$1')
	//
	.match(/(([^\/\\]+)[\/\\]+)?([^\/\\]*)$/);
	if (m) {
		return URI_accessor.regularize_file_name(
		// 因為 escape 會多出不必要符號，因此不 escape。
		HTML_to_Unicode(decodeURIComponent(m[3] || m[1])), false);
	}
};

// 正規化 file name
URI_accessor.regularize_file_name = to_file_name;

URI_accessor.setting = {
	//referer : '',
	window_style: function () {
		// 0: hidden, 1: show, 2: Activate & minimize, 7: Minimize. The active window remains active.
		return library_namespace.is_debug() ? 1 : 0;
	},
	// 指定當檔名具有特殊字元時之暫存檔。
	//temporary_file : 'URI_accessor.tmp',
	//temporary_file : 'C:\\URI_accessor.tmp',
	// temporary_file : function(URI, save_to, FSO) { return temporary_file_path; },
	// temporary_file : function(URI, save_to, FSO) { return save_to + '.unfinished'; },
	temporary_file: function (URI, save_to) {
		var extension = save_to.match(PATTERN_extension),
		//	應該用 save_to 的 md5 值。
		hash_id = Math.ceil(Math.random() * 1e9);
		return 'URI_accessor.' + (extension ? 'temp.' + hash_id + extension[0] : hash_id + '.temp');
	},

	// do not overwrite:
	// target_exist : false

	// when target file exists, save to ..
	// target_exist : function(target, FSO) { return save_to || skip; },

	// when target file exists, rename old to ..
	// target_exist : [ save new to, rename old to ],

	target_exist: [],

	user_agent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.29 Safari/537.22'
};

URI_accessor.target_exist = {
	rename: function (target, FSO) {
		var proto = target + '.old', move_to = proto, i = 0;
		//	TODO: when error occurred..
		while (FSO.FileExists(move_to))
			move_to = proto + ++i;
		try {
			FSO.MoveFile(target, move_to);
		} catch (e) { }
		return target;
	},
	//	save new to, rename old to
	move: function (save_to, move_to, FSO) {
		if (!move_to)
			move_to = save_to + '.old';
		if (FSO.FileExists(move_to))
			try {
				FSO.DeleteFile(move_to);
			} catch (e) { }
		try {
			FSO.MoveFile(save_to, move_to);
		} catch (e) { }
		return save_to;
	}
};

/*
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

*/
URI_accessor.module = {
	curl: function (user_setting) {
		//	http://curl.haxx.se/docs/httpscripting.html

		//	The ORDINAL 2821 could not be located in the dynamic link library LIBEAY32.dll
		//	This is caused by a conflict in the version of LIBEAY32.DLL
		//	Solution: install the latest version of Win32 OpenSSL
		//	http://www.slproweb.com/products/Win32OpenSSL.html

		//library_namespace.debug('URI_accessor.setting.temporary_file:'+URI_accessor.setting.temporary_file, 2, 'URI_accessor.module.curl');
		//library_namespace.debug('user_setting.temporary_file:'+user_setting.temporary_file, 2, 'URI_accessor.module.curl');
		var setting = new library_namespace.setting_pair(library_namespace.null_Object(), URI_accessor.setting, user_setting), value = setting('user_agent'),
		tmp = setting('cookie') || setting('cookie_file'),
		command_array = [
				'curl --remote-time --insecure --compressed '
				+ (library_namespace.is_debug(2) ? '-v ' : '')
				+ (setting('additional_options') ? setting('additional_options') + ' ' : '')
				// --cookie STRING/FILE  String or file to read cookies from (H)
				+ (tmp ? '--cookie "' + tmp + '" ' : '')
				+ ((tmp = setting('cookie_file') || setting('cookie')) ? '--cookie-jar "' + tmp + '" ' : '')
				+ '--output "',
			'', (value ? '" --user-agent "' + value : '') + '"'];

		if (setting('POST')) {
			setting('POST_index', command_array.length + 1);
			command_array.push(' --data "', '', '"');
		}

		command_array[command_array.length - 1] += ' --referer "';

		tmp = '" "';
		if (value = setting('referer')) {
			library_namespace.debug(['referer: ', { a: value, href: value }], 2, 'URI_accessor.module.curl');
			command_array[command_array.length - 1] += value + tmp;
		} else
			setting('referer_index', command_array.length), command_array.push('', tmp);

		command_array.push('', '"');

		library_namespace.debug('command_array: ' + command_array, 2, 'URI_accessor.module.curl');
		//library_namespace.debug('temporary_file: [' + (typeof setting('temporary_file')) + ']' + setting('temporary_file'), 2, 'URI_accessor.module.curl');

		return URI_accessor.default_getter(setting, command_array,
				URI_accessor.default_apply_command);
	},

	wget: function (user_setting) {
		var setting = new library_namespace.setting_pair(library_namespace.null_Object(), URI_accessor.setting, user_setting), value = setting('user_agent'), tmp = '" "',
		command_array = ['wget --timestamping --keep-session-cookies --no-check-certificate '
				+ (library_namespace.is_debug(2) ? '-d ' : '')
				+ (setting('additional_options') ? setting('additional_options') + ' ' : '')
				+ '--output-document="', '',
			(value ? '" --user-agent="' + value : '') + '"'];

		if (setting('POST')) {
			setting('POST_index', command_array.length + 1);
			command_array.push(' --post-data="', '', '"');
		}

		command_array[command_array.length - 1] += ' --referer="';

		if (value = setting('referer')) {
			library_namespace.debug(['referer: ', { a: value, href: value }], 2, 'URI_accessor.module.wget');
			command_array[command_array.length - 1] += value + tmp;
		} else
			setting('referer_index', command_array.length), command_array.push('', tmp);

		command_array.push('', '"');

		library_namespace.debug('command_array: ' + command_array, 2, 'URI_accessor.module.wget');
		//library_namespace.debug('temporary_file: [' + (typeof setting('temporary_file')) + ']' + setting('temporary_file'), 2, 'URI_accessor.module.wget');

		return URI_accessor.default_getter(setting, command_array,
				URI_accessor.default_apply_command);
	}
};

URI_accessor.default_apply_command = function (
		setting, command_array, URI, save_to, temporary_file_used) {
	command_array[1] = temporary_file_used || save_to;
	command_array[command_array.length - 2] = URI;
	var i;
	if (i = setting('referer_index'))
		command_array[i] = URI;
	if (i = setting('POST_index'))
		command_array[i] = setting('POST') || '';
};

URI_accessor.default_getter = function (setting, command_array, apply_command) {
	//library_namespace.debug('get_WScript_object: [' + (typeof get_WScript_object) + ']' + get_WScript_object, 2, 'URI_accessor.default_getter');
	var WSO = get_WScript_object();
	//library_namespace.debug('WSO: [' + (typeof WSO) + ']' + WSO, 2, 'URI_accessor.default_getter');
	if (!WSO) {
		library_namespace.warn('No WScript objects got!');
		return;
	}

	var WshShell = WSO.WshShell, FSO = WSO.FSO,

	normalize_directory = function (id) {
		var directory = setting(id);
		if (directory && !/[\\\/]$/.test(directory))
			setting(id, directory + library_namespace.env.path_separator);
	},
	normalize_function = function (id) {
		if (typeof setting(id) !== 'function')
			setting(id, undefined);
	},


	window_style = setting('window_style'),
	temporary_file = setting('temporary_file');
	library_namespace.debug('temporary_file: [' + (typeof temporary_file) + ']' + temporary_file, 2, 'URI_accessor.default_getter');

	WSO = null,

	getter = function (URI, save_to) {
		var start_time = new Date, result, temporary_file_used, tmp;

		if (library_namespace.is_Object(save_to)) {
			setting(save_to);
			normalize_directory('directory');
			normalize_function('callback');
			save_to = setting('save_to');
		}

		//	若沒有輸入 save_to，從 URI 取得。
		if (!save_to)
			save_to = URI_accessor.extract_file_name(URI);

		//	得放在偵測 temporary file 之前，預防 directory 包含非普通的(unordinary)字符。
		if (tmp = setting('directory'))
			save_to = tmp + save_to;

		if (FSO.FileExists(save_to) && ('target_exist' in setting())) {
			if (Array.isArray(tmp = setting('target_exist')))
				tmp = URI_accessor.target_exist.move(tmp[0] || save_to, tmp[1], FSO);
			else if (typeof tmp === 'string' && tmp.charAt(0) === '*')
				tmp = URI_accessor.target_exist[tmp.slice(1)];

			if (typeof tmp === 'function')
				tmp = tmp(save_to, FSO);

			if (typeof tmp === 'string' && tmp)
				save_to = tmp;
			else {
				library_namespace.debug('Skip [' + URI + ']: target file [' + save_to + '] exists and target_exist of setting refused rename or overwrite.', 2, 'URI_accessor.default_getter.getter');
				result = TARGET_FILE_EXISTS;
				if (tmp = setting('callback'))
					tmp(save_to, URI, result);
				return result;
			}
		}

		//	只有非常用字母才需要 temporary file。
		if (temporary_file && !/^[\x20-\x7e]+$/.test(save_to)) {
			temporary_file_used = typeof temporary_file === 'function' ? temporary_file(URI, save_to, FSO)
					: temporary_file;
			library_namespace.debug('temporary file: [' + temporary_file_used + ']←[' + temporary_file + ']', 2, 'URI_accessor.default_getter.getter');
		}

		library_namespace.debug('Downloading [<a href="' + URI + '" target="_blank">' + URI + '</a>]'
			+ (temporary_file_used ? '→[' + temporary_file_used + ']' : '')
			+ '→[' + save_to + ']..', 1, 'URI_accessor.default_getter.getter');

		apply_command(setting, command_array, URI, save_to, temporary_file_used);
		library_namespace.debug('Execute: [' + command_array.join('') + ']', 2, 'URI_accessor.default_getter.getter');
		library_namespace.debug('WshShell: [' + (typeof WshShell) + ']' + WshShell, 3, 'URI_accessor.default_getter.getter');

		try {
			if (result = WshShell.Run(command_array.join(''), typeof window_style === 'function' ? window_style() : window_style, true)) {
				//	result = EXIT CODE
				this.lastest_errorno = result;
				save_to = '[error] ' + save_to;
			}

			if (temporary_file_used)
				if (FSO.FileExists(temporary_file_used))
					// 出問題還是照搬。
					// 需注意出問題過，原先就存在的情況。
					FSO.MoveFile(temporary_file_used, save_to);
				else
					library_namespace.warn('temporary file does not exists: [' + temporary_file_used + ']');

			library_namespace.debug('[' + URI + ']→[<a href="' + save_to
					+ '" target="_blank">' + save_to + '</a>] @ '
					+ Math.round((new Date - start_time) / 1000) + ' sec '
					+ (result ? ', <em>error code ' + result + '</em>.' : ''));

		} catch (e) {
			if ((e.number & 0xFFFF) === 2)
				// 若不存在此執行檔案，將 throw。
				// '找不到執行檔: wget。您可能需要安裝此程式後再執行。'
				// http://users.ugent.be/~bpuype/wget/
				result = NO_EXECUTABLE_FILE;
			else {
				library_namespace.err(e);
				result = e;
			}
		}

		if (tmp = setting('callback'))
			tmp(save_to, URI, result, setting);
		return result;
	};

	//library_namespace.debug('WshShell: [' + (typeof WshShell) + ']' + WshShell, 2, 'URI_accessor.default_getter');

	//	binding prototype
	//library_namespace.set_method(URI_accessor.prototype, getter.prototype);
	getter.prototype = URI_accessor.prototype;

	normalize_directory('directory');
	normalize_function('callback');

	return getter;
};


library_namespace.set_method(URI_accessor.prototype, {
	//	TODO
	list : function(URI_array, index_URI, index_save_to) {
		throw NOT_YET_IMPLEMENTED;
	},
	process : function(index) {
		throw NOT_YET_IMPLEMENTED;
	}
});




_// JSDT:_module_
.
URI_accessor = URI_accessor;






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
		//	有可能使用相同的 setting object，但僅改變了部分內容，如 temporary_file。
		//|| get_URI.setting === setting
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
.
get_URI = get_URI;





//get_video[generateCode.dLK]='initialization_WScript_Objects,get_URI,getU,HTMLToUnicode';
/**
 * for serial get Youtube video.<br />
 * 下載影片檔案與播放清單。<br />
 * <br />
 * ** 會改變 options!
 * 
 * TODO:<br />
 * multi task<br />
 * add video description (#eow-description)<br />
 * 
 * @example <code>
 * get_video('http://www.youtube.com/watch?v=22YrMRav6dU', '.');
 * get_video('http://www.youtube.com/playlist?list=PLCE7553F6ED018907', '.');
 * </code>
 * 
 * @param {String|Array}video_url
 * @param {String|Boolean}download_to
 *            download to what directory.<br />
 *            false: no download, get video information only.
 * 
 * @returns {Array} video information
 * 
 * @since 2009/10/18-19 22:09:49	main<br />
 *        2009/10/20 22:40:33	to function<br />
 *        2012/3/31 21:19:52	refactoring 重構. get more data of video.
 * 
 * @see <a href="http://kej.tw/flvretriever/youtube.php" accessdate="2012/3/31 17:10">Kej's FLV Retriever</a>,
 *      <a href="http://www.longtailvideo.com/support/forums/jw-player/setup-issues-and-embedding/10404/youtube-blocked-httpyoutubecomgetvideo" accessdate="2012/3/31 21:20">Youtube blocked http://youtube.com/get_video | LongTail Video | Home of the JW Player</a>,
 *      <a href="http://userscripts.org/scripts/review/109103" accessdate="2012/3/31 21:21" title="Source for &quot;Download YouTube Videos as MP4 (Patch)&quot; - Userscripts.org">Source for &quot;Download YouTube Videos as MP4 (Patch)&quot; - Userscripts.org</a>,
 *      <a href="http://tubewall.googlecode.com/svn-history/r2/trunk/demo/get_video_info.txt" accessdate="2012/3/31 21:21" title="猜测get_video_info返回参数的含义">猜測get_video_info返回參數的含義</a>,
 *      <a href="https://developers.google.com/youtube/2.0/developers_guide_protocol_playlists" accessdate="2012/3/31 22:5">API v2.0 – Playlists - YouTube &mdash; Google Developers</a>
 *      
 */
function get_video(video_url, download_to, options) {
	library_namespace.debug(video_url, 2, 'get_video');
	if (!Array.isArray(video_url)) {
		if (!video_url)
			return;
		video_url = [ video_url ];
	}

	var count = video_url.length, error_count = 0, i, info_hash = library_namespace.null_Object(), video_info, result,
	/**
	 * for message show
	 */
	file_message, title, matched, URI;

	if (download_to && typeof download_to === 'string' && !/[\\\/]$/.test(download_to)) {
		download_to += library_namespace.env.path_separator;
	}

	// 處理 options。
	if (typeof options === 'function')
		options = {
			callback : options
		};
	else if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();
	if (!options.base_directory)
		options.base_directory = download_to;

	for (i = 0; i < count; i++) {
		file_message = '[' + (i + 1) + '/' + count + '] ' + video_url[i];

		try {
			// http://youtu.be/_id_
			// →
			// https://www.youtube.com/watch?v=_id_&feature=youtu.be
			if (URI = parse_URI(video_url[i].replace('//youtu.be/', '//www.youtube.com/watch?v='))) {
				if (URI.hostname.toLowerCase().includes('youtube')) {
					library_namespace.debug('URI.filename: ' + URI.filename, 2, 'get_video');
					if (URI.filename === 'watch_videos') {
						matched = URI._search.video_ids.split(',');
						URI._search.v = matched[URI._search.index | 0];
						matched[URI._search.index | 0] = '<b style="color:#f80;">' + URI._search.v + '</b>';
						library_namespace.info(['All ', matched.length, ' videos in the list: [', matched.join('<b style="color:#f8f;">|</b>'), ']']);
					}

					if (URI.filename === 'playlist') {
						if (matched = URI._search.list.match(/^PL(.+)/)) {
							// 取得 title 並創建 sub-directory。
							var playlist_id = matched[1], url;
							if (false) {
								// YouTube Data API v2 Deprecation
								url = 'playlist.' + playlist_id + '.info';
								result = get_URI('http://gdata.youtube.com/feeds/api/playlists/'
										+ playlist_id, url, get_video.getter_setting);
							}
							// get from HTML
							// https://developers.google.com/youtube/v3/docs/playlistItems/list
							// https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=PL~~
							// https://www.youtube.com/playlist?list=PL~~
							url = 'playlist.' + playlist_id + '.info.htm';
							result = get_URI('https://www.youtube.com/playlist?list='
									+ playlist_id, url, get_video.getter_setting);

							if (!result) {
								result = library_namespace.get_file(url);
								matched = true;
								library_namespace.debug('playlist info: ' + result.replace(/</g, '&lt;'), 3);
								//pattern = /<media:player\s+url=['"]([^'"]+)['"]/g,
								var pattern = / data-video-id="([^'"]+)"/g;
								//title = result.match(/<title\s+type='text'>([^<]+)<\/title>/),
								title = result.match(/<meta name="title" content="([^"]+)">/);
								if (!title) {
									library_namespace.err('Error to get playlist [' + playlist_id + ']: ' + result + '.');
									continue;
								}
								// 因為 escape 會多出不必要符號，因此不 escape。
								if (title = URI_accessor.regularize_file_name(HTML_to_Unicode(title[1]), false)) {
									try {
										library_namespace.debug('準備好 sub-directory。 Try to create directory [' + download_to + title + ']', 3);
										FSO.CreateFolder(download_to + title);
										download_to += title + library_namespace.env.path_separator;
										library_namespace.info('Create directory [' + download_to + ']');
									} catch (e) {
										if ((e.number & 0xFFFF) === 58) {
											//	檔案已存在. File already exists.
											//	http://msdn.microsoft.com/en-us/library/aa264975(v=vs.60).aspx
											download_to += title + library_namespace.env.path_separator;
										} else {
											library_namespace.warn('Create directory [' + download_to + title + '] error:');
											library_namespace.err(e);
										}
									}
									try {
										library_namespace.debug('移動暫存檔 [' + url + ']→[' + download_to + url + ']');
										FSO.MoveFile(url, download_to + url);
										matched = false;
									} catch (e) {
										// TODO: handle exception
									}
								}
								if (matched)
									try {
										library_namespace.debug('刪掉暫存檔 [' + url + ']');
										FSO.DeleteFile(url);
									} catch (e) {
										// TODO: handle exception
									}

								// 取得 play list urls。
								url = [];
								while (matched = pattern.exec(result)) {
									//url.push(matched[1].replace(/(\?v=[^&]+).+$/, '$1'));
									url.push('https://www.youtube.com/watch?v=' + matched[1]);
								}
								var length = url.length;
								if (length === 0) {
									library_namespace.info('No video get.');
									// to next list/file.
									continue;
								}

								var prefix = options.prefix;
								for (var j = 0, to_pad = String(length).length; j < length; j++) {
									library_namespace.info('get_video: playlist [' + (j + 1) + '/' + length + '] <a href="' + url[j] + '">' + url[j] + '</a> to [' + download_to + ']');
									if (prefix === undefined)
										// default: add track number.
										options.prefix = '[' + (j + 1).pad(to_pad) + '] ';
									 else if (typeof prefix === 'function')
										options.prefix = prefix(title, url[j], download_to, j, length);
									get_video(url[j], download_to, options);
								}

								library_namespace.info(playlist_id + ' (<b>' + title + '</b>): All ' + length + ' video(s) done.');
								// to next list/file.
								continue;
							}
						}

					} else if (video_info = get_video.get_information(URI._search.v, download_to)) {
						//	TODO: 測試 "list="。

						info_hash[title = video_info.title] = video_info;

						library_namespace.info([URI._search.v, ' [', { b: title, S: 'color:#f80;' }, ']']);

						if (download_to && video_info.best) {
							var setting = get_video.getter_setting,
							target = download_to + URI_accessor.regularize_file_name((options.prefix || '')
							//
							+ (video_info.author ? '[' + video_info.author + '] ' : '') + title + ' [' + URI._search.v + ']', true) + '.' + video_info.best.extension;
							if (FSO.FileExists(target)) {
								library_namespace.warn('File exists: [' + target + ']');
								continue;
							}

							setting.start_time = new Date;
							setting.title = title;
							setting.target = target;
							setting.callback = options.callback || function (save_to, URI, result, setting) {
								var t = (new Date - setting('start_time')) / 1000;
								t = t < 60 ? t.toFixed(2) + ' seconds' : (t / 60).toFixed(2) + ' minutes';
								t = [{ b: setting('title'), S: 'color:#f80;' }, ' ', result ? 'error ' + result : 'OK', ' @ ', t];
								if (result)
									library_namespace.err(t);
								else
									library_namespace.log(t);
							};

							setting.referer = 'http://www.youtube.com/watch?v=' + URI._search.v;
							setting.temporary_file
							// 處理 folder 為特殊名稱，因此 curl 或 console 無法 handle 的情況。
							// 亦可先測試無法建檔後，才採用上一層的 options.base_directory。
							= (PATTERN_ordinary_folder_name.test(download_to) ? download_to : options.base_directory || '')
							// e.g., xxxxxxxxxxx.mp4
							+ URI._search.v + '.' + video_info.best.extension;

							library_namespace.info('Downloading [' + target + ']←[' + setting.temporary_file + ']');
							result = get_URI(video_info.best.url, target, setting);

							delete setting.start_time;
							delete setting.title;
							delete setting.target;
							delete setting.callback;

							// Sleep(9);
							if (!result) {
								continue;
							}
						}
					}
				}
			}

			throw new Error('input error: ' + file_message);

		} catch (e) {
			error_count++;
			library_namespace.err(file_message
					+ (video_info ? ' [' + video_info.title + ']:' : ' error:'));
			library_namespace.err(e);
		}
	}

	library_namespace.debug(error_count ? 'Error: ' + error_count + '/' + count
			: 'All ' + count + ' video(s) done.');

	// return video information
	return info_hash;
}

get_video.getter_setting = {
	additional_options: '--location',
	// 2014/12/6 對於 "150 這部影片無法在您的國家/地區播放。"，需要是自己的影片，有 cookies 才行。
	cookie : "",
	cookie_file : 'youtube.cookie.txt',
	referer : 'http://www.youtube.com/'
};

// get video data.
//	為因應各資源提供者於不同時期之不同格式，本函數須順應影音網站變更而重寫。
//	get_video_info 是 Youtube API 的一部分。
//	http://developer.nokia.com/Community/Wiki/How_to_parse_YouTube_API_response
get_video.get_information = function get_video_information(video_hash, download_to) {
	var html, matched, param, param_url, data = 'video.' + video_hash + '.info';
	if (!download_to)
		download_to = '';
	// 2014/1/14 加上 sts 才能使下面 parse signature 正常作動。eurl 似乎沒必要。
	// 2014/5/2 某些版權影片需要 eurl。
	get_URI(encodeURI('http://www.youtube.com/get_video_info?eurl='
		+ get_video.getter_setting.referer + '&sts=1586&video_id=' + video_hash), data, get_video.getter_setting);

	try {
		html = library_namespace.get_file(data);
	} catch (e) {
		// TODO: handle exception
	}
	if (html) {
		try {
			FSO.DeleteFile(data);
		} catch (e) {
			// TODO: handle exception
		}

		library_namespace.debug('解析 data.', 2);
		param = parse_URI.parse_search(html);

		if ('errorcode' in param) {
			library_namespace.err('[' + video_hash + ']: ' + param.errorcode + ' ' + param.reason);
			return;
		}

		library_namespace.debug('parse url_encoded_fmt_stream_map', 2);
		param.url_encoded_fmt_stream_map.split(',').forEach(function (o) {
			param_url = parse_URI.parse_search(o, param_url);
		});

		//library_namespace.debug('parse url', 2);
		//param = parse_URI.parse_search(param.url, param);

		library_namespace.debug('檢測是否有 error.', 2);
		if (html.includes('status=ok')) {
			param.hash = video_hash;
			var i, l, fmt_list = [], list = [], best_score = 0, best_video,
			set_score = function (d) {
				var score = 0, matched = d.format.match(/(\d+)x(\d+)/), type_score = {
					//	scale 相同時，越後面的越可能是原始檔案。
					webm: ++score,
					'3gpp': ++score,
					flv: ++score,
					mpg: ++score,
					mov: ++score,
					avi: ++score,
					mp4: ++score
				};
				score = 0;
				if (matched)
					score += matched[1] * matched[2];
				if (d.extension in type_score)
					score += type_score[d.extension];
				else
					library_namespace.warn('Unknown type: ' + d.extension);
				if (score > best_score) {
					best_score = score;
					best_video = d;
				}
				return score;
			},
			//
			tmp = param.fmt_list.split(',');
			library_namespace.debug('record fmt_list: [' + param.fmt_list + ']', 2);
			for (i = 0, l = tmp.length; i < l; i++) {
				if (matched = tmp[i].match(/^([\d]+)\/(.+)$/))
					fmt_list[+matched[1]] = matched[2];
			}

			if (!param_url.sig) {
				if (Array.isArray(param_url.s)) {
					param_url.sig = [];
					// 2014/1/13 parse signature.
					param_url.s.forEach(function (s, i) {
						library_namespace.debug('parse signature: (' + s.length + ')[' + s + ']', 3, 'get_information.parse_signature');

						// http://kej.tw/flvretriever/youtube.php
						// only works when s.length = 87.
						s = s.split('');
						s[52] = s[0];
						//	swap [62], [83]
						s[0] = s[62];
						s[62] = s[83];
						s[83] = s[0];
						s = s.slice(3, -3).reverse().join('');

						// https://github.com/rg3/youtube-dl/issues/897
						// https://github.com/rg3/youtube-dl/blob/master/youtube_dl/extractor/youtube.py	:	_static_decrypt_signature()
						/*
						''
						.replace(/(?:el)?if len\(s\) == (\d+):\s+return/g, ';break;case $1:s=')
						.replace(/\[(\d+):(\d+):-1\]/g, ".slice($2+1,$1+1).split('').reverse().join('')")
						.replace(/\[(\d+):(\d+):?\]/g, '.slice($1,$2)')
						.replace(/\[::-1\]/g, ".split('').reverse().join('')")
						.replace(/\[(\d+):\s*:(\d+)\]/g, ".slice(0,$1+1).split('').reverse().join('')")
						.replace(/\[(\d+):\s*:?\]/g, '.slice($1)')
						.replace(/\[(\d+)\]/g, '.charAt($1)');
						*/
						/*
						switch (s.length) {
							case 93:
								s = s.slice(29 + 1, 86 + 1).split('').reverse().join('') + s.charAt(88) + s.slice(5 + 1, 28 + 1).split('').reverse().join('');
								break;
							case 92:
								s = s.charAt(25) + s.slice(3, 25) + s.charAt(0) + s.slice(26, 42) + s.charAt(79) + s.slice(43, 79) + s.charAt(91) + s.slice(80, 83);
								break;
							case 91:
								s = s.slice(27 + 1, 84 + 1).split('').reverse().join('') + s.charAt(86) + s.slice(5 + 1, 26 + 1).split('').reverse().join('');
								break;
							case 90:
								s = s.charAt(25) + s.slice(3, 25) + s.charAt(2) + s.slice(26, 40) + s.charAt(77) + s.slice(41, 77) + s.charAt(89) + s.slice(78, 81);
								break;
							case 89:
								s = s.slice(78 + 1, 84 + 1).split('').reverse().join('') + s.charAt(87) + s.slice(60 + 1, 77 + 1).split('').reverse().join('') + s.charAt(0) + s.slice(3 + 1, 59 + 1).split('').reverse().join('');
								break;
							case 88:
								s = s.slice(7, 28) + s.charAt(87) + s.slice(29, 45) + s.charAt(55) + s.slice(46, 55) + s.charAt(2) + s.slice(56, 87) + s.charAt(28);
								break;
							case 87:
								s = s.slice(6, 27) + s.charAt(4) + s.slice(28, 39) + s.charAt(27) + s.slice(40, 59) + s.charAt(2) + s.slice(60);
								break;
							case 86:
								if (//age_gate
									false)
									s = s.slice(2, 63) + s.charAt(82) + s.slice(64, 82) + s.charAt(63);
								else
									s = s.slice(72 + 1, 80 + 1).split('').reverse().join('') + s.charAt(16) + s.slice(39 + 1, 71 + 1).split('').reverse().join('') + s.charAt(72) + s.slice(16 + 1, 38 + 1).split('').reverse().join('') + s.charAt(82) + s.slice(0, 15 + 1).split('').reverse().join('');
								break;
							case 85:
								s = s.slice(3, 11) + s.charAt(0) + s.slice(12, 55) + s.charAt(84) + s.slice(56, 84);
								break;
							case 84:
								s = s.slice(70 + 1, 78 + 1).split('').reverse().join('') + s.charAt(14) + s.slice(37 + 1, 69 + 1).split('').reverse().join('') + s.charAt(70) + s.slice(14 + 1, 36 + 1).split('').reverse().join('') + s.charAt(80) + s.slice(0, 14).split('').reverse().join('');
								break;
							case 83:
								s = s.slice(63 + 1, 80 + 1).split('').reverse().join('') + s.charAt(0) + s.slice(0 + 1, 62 + 1).split('').reverse().join('') + s.charAt(63);
								break;
							case 82:
								s = s.slice(37 + 1, 80 + 1).split('').reverse().join('') + s.charAt(7) + s.slice(7 + 1, 36 + 1).split('').reverse().join('') + s.charAt(0) + s.slice(0 + 1, 6 + 1).split('').reverse().join('') + s.charAt(37);
								break;
							case 81:
								s = s.charAt(56) + s.slice(56 + 1, 79 + 1).split('').reverse().join('') + s.charAt(41) + s.slice(41 + 1, 55 + 1).split('').reverse().join('') + s.charAt(80) + s.slice(34 + 1, 40 + 1).split('').reverse().join('') + s.charAt(0) + s.slice(29 + 1, 33 + 1).split('').reverse().join('') + s.charAt(34) + s.slice(9 + 1, 28 + 1).split('').reverse().join('') + s.charAt(29) + s.slice(0 + 1, 8 + 1).split('').reverse().join('') + s.charAt(9);
								break;
							case 80:
								s = s.slice(1, 19) + s.charAt(0) + s.slice(20, 68) + s.charAt(19) + s.slice(69, 80);
								break;
							case 79:
								s = s.charAt(54) + s.slice(54 + 1, 77 + 1).split('').reverse().join('') + s.charAt(39) + s.slice(39 + 1, 53 + 1).split('').reverse().join('') + s.charAt(78) + s.slice(34 + 1, 38 + 1).split('').reverse().join('') + s.charAt(0) + s.slice(29 + 1, 33 + 1).split('').reverse().join('') + s.charAt(34) + s.slice(9 + 1, 28 + 1).split('').reverse().join('') + s.charAt(29) + s.slice(0 + 1, 8 + 1).split('').reverse().join('') + s.charAt(9);
							default:
								throw new Error('signature (.s) length ' + s.length + ' not supported!');
						}
						*/

						param_url.sig.push(s);
						library_namespace.debug('parse signature: →(' + s.length + ')[' + s + ']', 2, 'get_information.parse_signature');
					});
				} else if(!param_url.url[0].includes('&signature='))
					library_namespace.err('未發現 signature (signature or sig or s)！');
			}

			tmp = param_url.itag;
			//if (!tmp) throw new Error('未發現各種格式之 url！');
			library_namespace.debug('解析各種格式之 url: [' + tmp + ']', 2);
			for (i = 0, l = tmp.length; i < l; i++) {
				//	get_video.get_information version: 2012/10/1
				if (matched = tmp[i].match(/^([\d]+)$/)) {
					data = {
						//	2012/11/06 添加 signature.
						url: param_url.url[i]
						//
						+ (param_url.sig ? '&signature=' + param_url.sig[i] : '')
						//
						+ (param_url.title ? '&title=' + param_url.title : ''),
						quality: param_url.quality[i],
						format: fmt_list[matched[1]],
						extension: param_url.type[i].match(/^video\/(?:x-)?([^;:\s]+)/)[1]
					};
					set_score(data);
					library_namespace.info('<a href="' + data.url + '">' + data.quality + ' ' + data.extension + ' ('
							+ data.format + ') (' + param_url.type[i] + ')' + '</a> fmt = ' + matched[1]
							+ ', score = ' + set_score(data));
					list.push(data);
				}
			}
			param.list = list;
			if (best_video)
				param.best = best_video;

			return param;
		}
	}

	if (!library_namespace.is_Object(param)) {
		//	預防連 data 都沒有的情況。可能須確認外部程式正常作動。
		param = { reason: 'Can not parse data. Is the external program worked properly?' };
	}
	data = new Error('Can not get video information of ['
			+ video_hash + ']: ' + (param.reason || 'Unknown error'));
	if ('errorcode' in param)
		data.number = Number(param.errorcode);
	throw data;
};

_// JSDT:_module_
.
get_video = get_video;






/*	自動組態設定檔/自動設定網址
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
*/
function FindProxyForURL(url, host) {	//	url: 完整的URL字串, host: 在 URL字串中遠端伺服器的網域名稱。該參數祇是為了 方便而設定的，是與URL在 :// 和 / 中的文字是一模 一樣。但是傳輸阜（The port number）並不包含其中 。當需要的時候可以從URL字串解讀出來。
	var lch = host.toLowerCase();

	//isPlainHostName(lch) || isInNet(lch,"192.168.0.0","255.255.0.0") || isInNet(lch,"127.0.0.0","255.255.0.0") || dnsDomainIs(lch,".tw") ?"DIRECT";
	return (
	//dnsDomainIs(lch,"holyseal.net") || dnsDomainIs(lch,".fuzzy2.com") ? "PROXY 211.22.213.114:8000; DIRECT":	//	可再插入第二、三順位的proxy
	/*
	http://www.cybersyndrome.net/
	
	http://www.publicproxyservers.com/page1.html
	curl --connect-timeout 5 -x 219.163.8.163:3128 http://www.getchu.com/ | grep Getchu.com
	curl --connect-timeout 5 -x 64.34.113.100:80 http://www.getchu.com/ | grep Getchu.com
	curl --connect-timeout 5 -x 66.98.238.8:3128 http://www.getchu.com/ | grep Getchu.com
	*/
	//dnsDomainIs(lch, ".cn") || dnsDomainIs(lch, "pkucn.com") ? "PROXY proxy.hinet.net:80; DIRECT" :	//	2009/8/16 14:20:32	用 HiNet 網際網路 Proxy Server 上大陸網速度還滿快的	http://www.ltivs.ilc.edu.tw/proxy/proxy/hinet.htm
	//dnsDomainIs(lch, ".getchu.com") ? "PROXY 219.163.8.163:3128; PROXY 64.34.113.100:80; PROXY 66.98.238.8:3128; DIRECT" :
	//dnsDomainIs(lch, ".minori.ph") ? "PROXY 219.94.198.110:3128; PROXY 221.186.108.237:80; DIRECT" :	//	Japan Distorting Open Proxy List	http://www.xroxy.com/proxy--Distorting-JP-nossl.htm
	//	slow:	http://www.cybersyndrome.net/country.html
	//dnsDomainIs(lch, ".tactics.ne.jp") ? "PROXY 202.175.95.171:8080; PROXY 203.138.90.141:80; DIRECT" :
	//dnsDomainIs(lch,".ys168.com")		? "PROXY 76.29.160.230:8000; DIRECT":	//	永硕E盘专业网络硬盘服务
	dnsDomainIs(lch, "erogamescape.dyndns.org") ? "PROXY 211.22.213.114:8000; DIRECT"

	: "DIRECT"//:/^[a-z\.\d_\-]+$/.test(lch)?"DIRECT":"PROXY dnsrelay.twnic.net.tw:3127"	//	http://www.twnic.net.tw/proxy.pac	將中文網域名稱轉成英文網域名稱
	);
}





//	http://help.globalscape.com/help/cuteftppro8/
//setupCuteFTPSite[generateCode.dLK]='parse_URI';
function setupCuteFTPSite(targetS, site) {
	if (typeof targetS === 'string')
		targetS = parse_URI(targetS, 'ftp:');
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
		// The default Protocol is FTP, however SFTP (SSH2), FTPS (SSL), HTTP, and HTTPS can also be used.
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
TODO:
transferURL(remote URI,remote URI)
*/
//transferURL[generateCode.dLK]='parsePath,parse_URI,setupCuteFTPSite';
function transferURL(from_URI, to_URI) {
	//var connectTo = from_URI.includes('://') ? from_URI : to_URI, CuteFTPSite = setupCuteFTPSite(connectTo);
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
	CuteFTPSite = setupCuteFTPSite(rP = parse_URI(isD ? from_URI : to_URI, 'ftp:'));
	if (!CuteFTPSite || !CuteFTPSite.IsConnected)
		return;

	// 到這裡之後，就認定 CuteFTPPro.TEConnection 的 initial 沒有問題，接下來若出問題，會嘗試重新 initial
	// CuteFTPPro.TEConnection.

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
	//site.GetList('/OK', '', '%NAME');
	//var l = site.GetResult().replace(/\r\n?/g, '\n').split('\n');

	// close
	try {
		site.Disconnect();
	} catch (e) {
	}
	site.Close();

	return 1;
}




return (
	_// JSDT:_module_
);
}


});

