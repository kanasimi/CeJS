
/**
 * @name	CeL function for net
 * @fileoverview
 * 本檔案包含了處理網路傳輸相關功能的 functions。
 * @since	
 */

if (typeof CeL === 'function')
CeL.setup_module('application.net',
{
require : 'application.OS.Windows.get_WScript_object|interact.DOM.HTML_to_Unicode',
code : function(library_namespace, load_arguments) {
'use strict';

//requiring
var get_WScript_object, HTML_to_Unicode;
eval(library_namespace.use_function(this));



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










/*
	** 改用 getNetInfo()

	get host name & IP	2005/3/1 22:32
	只能用於WinXP, Win2000 server（換個版本指令以及輸出可能就不同！），而且非常可能出狀況！
	Win98 不能反查，只能 check local IP

//gethost[generateCode.dLK]='Sleep';
function gethost(host){
 var IP,p,c,t,i,f,cmd;
 //	決定shell	cmd 對於 ".. > ""path+filename"" " 似乎不能對應的很好，所以還是使用 "cd /D path;.. > ""filename"" "
 try{c='%COMSPEC% /U /c "',WshShell.Run(c+'"'),p=WScript.ScriptFullName.replace(/[^\\]+$/,''),c+='cd /D ""'+p+'"" && ',cmd=1;}
 catch(e){try{c='%COMSPEC% /c ',WshShell.Run(c),p='C:\\';}catch(e){return;}}
 if(host){
  if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host))IP=host,host=0;
 }else{
  f='ipconfig.tmp.txt';
  WshShell.Run(c+'ipconfig > '+(cmd?'""'+f+'"" "':p+f),0,1);	//	winipcfg
  if(t=simpleRead(f=p+f)){
   if(i=t.indexOf('PPP adapter'),i!=-1)t=t.slice(i);
   else if(i=t.indexOf('Ethernet adapter'),i!=-1)t=t.slice(i);
   if(i=t.indexOf('IP Address'),i!=-1)t=t.slice(i);
   if(t.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/))IP=RegExp.$1;
  }
  try{fso.DeleteFile(f);}catch(e){}
  if(!IP)return [0,0];
 }
 if(!cmd)return [host,IP];	//	Win98沒有nslookup
 f='qDNS.tmp.txt';
 WshShell.Run(c+'nslookup '+(cmd?'""'+(IP||host)+'"" > ""'+f+'"" "':(IP||host)+'>'+p+f),0,1);
 //try{WScript.Sleep(200);}catch(e){}	//	/C:執行字串中所描述的指令然後結束指令視窗	(x)因為用/c，怕尚未執行完。
 if((t=simpleRead(f=p+f)) && t.match(/Server:/)&&t.match(/Address:\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/) ){
  t=t.slice(RegExp.lastIndex);
  host=t.match(/Name:\s*([^\s]+)/)?RegExp.$1:0;
  IP=t.match(/Address:\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)?RegExp.$1:0;
  //library_namespace.debug(host+'\n'+IP);
 }else host=IP=0;
 try{fso.DeleteFile(f);}catch(e){}
 return [host,IP];
}
*/


//	setting pair
var setting_pair = function(default_setting) {
	var setting_now = default_setting || {},
	setting_handle = function(name, value) {
		if (library_namespace.is_Object(name)) {
			// setter
			for ( var i in name)
				//library_namespace.debug('[' + i + ']=[' + name[i] + ']'),
				setting_now[i] = name[i];
			return setting_now;
		}

		if (library_namespace.is_Array(name)) {
			// getter
			var i, r = [], n;
			for (i in name) {
				n = name[i];
				if (n in setting_now)
					r[i] = setting_now[n];
			}
			return r;
		}

		//if(arguments.length > 1) library_namespace.debug('[' + name + ']=[' + value + ']');
		return arguments.length > 1 ? (setting_now[name] = value)
				: setting_now[name];
	};
	setting_handle.reset = function(setting) {
		return setting_now = setting || {};
	};

	// additional setting
	if (arguments.length > 1)
		for ( var i = 1, l = arguments.length, o; i < l; i++)
			if (library_namespace.is_Object(o = arguments[i]))
				setting_handle(o);

	return setting_handle;
};


//	for element.dataset
//if (!library_namespace.global.DOMStringMap)
//	library_namespace.global.DOMStringMap = setting_pair;

/**
 * get URI/取得器
 * @param {Function}[module]	use what module/command to get.
 * @returns	getter
 * @throws	No module to use.
 */
function URI_accessor(module, setting) {

	if(!module){
		//	detect what module/command to use.
		;
	}

	if ((module in URI_accessor.module)
			&& library_namespace.is_Function(module = URI_accessor.module[module](setting)))
		return module;

	throw new Error('No module' + (module ? ' [' + module + ']' : '') + ' to use!');
};

URI_accessor.setting = {
		//referer : '',
		// window style: 0: hidden, 1: show, 2: Activate & minimize, 7: Minimize. The active window remains active.
		window_style : 0,
		// 指定當檔名具有特殊字元時之暫存檔
		//temporary_file : 'URI_accessor.tmp',
		//temporary_file : 'C:\\URI_accessor.tmp',
		// temporary_file : function(URI, save_to) { return temporary_file_path; },
		// temporary_file : function(URI, save_to) { return save_to + '.unfinished'; },
		temporary_file : function(URI, save_to) {
				var ext = save_to.match(/\.[a-z\d\-]+$/i),
				//	應該用 save_to 的 md5 值。
				hash_id = Math.ceil(Math.random() * 1e9);
				return 'URI_accessor.' + (ext?'temp.'+hash_id+ext[0]:hash_id+'.temp');
		},
		user_agent : 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)'
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
	curl : function(user_setting) {
		//	http://curl.haxx.se/docs/httpscripting.html

		var setting = new setting_pair( {}, URI_accessor.setting, user_setting), value = setting('user_agent'), tmp = '" "',
		command_array = [
				'curl --remote-time --insecure --compressed '
				+ (setting('additional_options') ? setting('additional_options') + ' ' : '')
				+ (setting('cookie_file') ? '--cookie "' + setting('cookie_file') + '" --cookie-jar "' + setting('cookie_file') + '" ' : '')
				+ '--output "',
			'', (value ? '" --user-agent "' + value : '') + '" --referer "' ];

		if (value = setting('referer'))
			command_array[2] += value + tmp;
		else
			command_array.push('', tmp), setting('referer_index', 3);

		command_array.push('', '"');

		//library_namespace.debug(command_array);

		return URI_accessor.default_getter(setting, command_array,
				URI_accessor.default_apply_command);
	},

	wget : function(user_setting) {
		var setting = new setting_pair( {}, URI_accessor.setting, user_setting), value = setting('user_agent'), tmp = '" "',
		command_array = ['wget --timestamping --keep-session-cookies --no-check-certificate '
				+ (setting('additional_options') ? setting('additional_options') + ' ' : '')
				+ '--output-document="', '',
			(value ? '" --user-agent="' + value : '') + '" --referer="' ];

		if (value = setting('referer'))
			command_array[2] += value + tmp;
		else
			command_array.push('', tmp), setting('referer_index', 3);

		command_array.push('', '"');

		//library_namespace.debug(command_array);

		return URI_accessor.default_getter(setting, command_array,
				URI_accessor.default_apply_command);
	}
};

URI_accessor.default_apply_command = function(
		setting, command_array, URI, save_to, temporary_file_used) {
	command_array[1] = temporary_file_used || save_to;
	command_array[command_array.length - 2] = URI;
	var i;
	if (i = setting('referer_index'))
		command_array[i] = URI;
};

URI_accessor.default_getter = function(setting, command_array, apply_command) {
	//library_namespace.debug('get_WScript_object: [' + (typeof get_WScript_object) + ']' + get_WScript_object);
	var WSO = get_WScript_object();
	//library_namespace.debug('WSO: [' + (typeof WSO) + ']' + WSO);
	if (!WSO){
		library_namespace.warn('No WScript objects got!');
		return;
	}

	var WshShell = WSO.WshShell, FSO = WSO.FSO,

	window_style = setting('window_style'),
	temporary_file = setting('temporary_file');
	//library_namespace.debug('temporary_file: [' + (typeof temporary_file) + ']' + temporary_file);

	WSO = null;
	//library_namespace.debug('WshShell: [' + (typeof WshShell) + ']' + WshShell);

	//	return getter
	return function(URI, save_to) {
		var start_time = new Date, result, temporary_file_used;

		if(library_namespace.is_Object(save_to)){
			setting(save_to);
			save_to = setting('save_to');
		}

		//	若沒有輸入 save_to，從 URI 取得。
		if (!save_to)
			save_to = URI_accessor.extract_file_name(URI);

		//	只有非常用字母才需要 temporary file.
		if (temporary_file && !/^[\x20-\x7e]+$/.test(save_to))
			temporary_file_used = typeof temporary_file === 'function' ? temporary_file(URI, save_to)
					: temporary_file;

		if(setting('directory'))
			save_to = setting('directory') + save_to;

		library_namespace.debug('Downloading [<a href="' + URI + '" target="_blank">' + URI + '</a>]'+(temporary_file_used?'→[' + temporary_file_used + ']':'')+'→[' + save_to + ']..');

		apply_command(setting, command_array, URI, save_to, temporary_file_used);
		//library_namespace.debug('WshShell: [' + (typeof WshShell) + ']' + WshShell + ' (' + command_array.join('') + ')');

		try {
			if(result = WshShell.Run(command_array.join(''), window_style, true))
				//	result = EXIT CODE
				this.lastest_errorno = result;

			if (temporary_file_used && FSO.FileExists(temporary_file_used))
				// 出問題還是照搬。
				// 需注意出問題過，原先就存在的情況。
				FSO.MoveFile(temporary_file_used, save_to);

			library_namespace.debug('[' + URI + ']→[<a href="' + save_to + '" target="_blank">' + save_to + '</a>] @ '+Math.round((new Date-start_time)/1000)+' sec '+(result?', <em>error code '+result+'</em>.':''));
			return result;

		} catch (e) {
			if ((e.number & 0xFFFF) === 2)
				// '找不到執行檔: wget。您可能需要安裝此程式後再執行。'
				// http://users.ugent.be/~bpuype/wget/
				return 'NO_EXECUTABLE_FILE';
			return e;
		}
	};
};


/**
 * 從 URI 抽取 file name
 * @param URI	
 * @returns	file name
 */
URI_accessor.extract_file_name = function(URI) {
	var m = URI.match(/(([^\/\\]+)[\/\\]+)?([^\/\\]*)$/);
	if (m)
		return HTML_to_Unicode(decodeURIComponent(m[3].replace(/#.*/, '')
				|| m[1]))
				//	去除首尾空白
				.replace(/\s+$|^\s+/g, '')
				// 處理 illegal file name
				.replace(/["]/g, "''")
				.replace(/[\:\|]/g, '-')
				.replace(/[\0-\31\?\*\\\/<>]/g, '_')
				//	限制長度
				.slice(0, 256);
};

_// JSDT:_module_
.
URI_accessor = URI_accessor;






/**
 * get URI/取得器
 * @param {String}URI	URI to get
 * @param {String}[save_to]	path save to
 * @returns	error
 */
function get_URI(URI, save_to, setting) {
	if (get_URI.getter && (!setting || get_URI.setting === setting))
		return get_URI.getter(URI, save_to);

	var i, getter, result;
	for (i in URI_accessor.module) {
		result = (getter = new URI_accessor(i, setting))(URI, save_to);
		if (result !== 'NO_EXECUTABLE_FILE') {
			get_URI.getter = getter;
			get_URI.setting = setting;
			break;
		}
	}

	return result;
};

_// JSDT:_module_
.
get_URI = get_URI;






/*	for get serial Youtube video

2009/10/18-19 22:09:49	main
2009/10/20 22:40:33	to function

example:

runCode.setR=0;
get_URI.window_style=1;
var i=0,base_directory='D:\\USB\\graduate\\7-1 環境規劃研究\\movie\\大三峡\\'
,d=get_video('9RlvpgkLj-8 SrA2Aumaa3A 1rFiC1FL8hE RnOGhurSmOM lqz6Epp8UgI cRpgU_pz4xs tK31eZ_kYAE cipv9M3ZRxU t_ikkmW0B6I XW_WNd5oThU WxaeQTd5UNg qaHXR_cnYYY tPOuLU0l26o 5JWy-vUpC-A khPySOdT1IA 1wwG1coW_LE gJc0UWNlgU4 U9z7LpFU5CE OkD_eNdAXlI 466JBDiNJZA 48qloGDgtEk ywHtkjHJkOU qjJUAuGcYYY 2XD_zV7smWI q3_ZAVqBxYg -tO0aizbf9A agWpXY1QfYY agWpXY1QfYY Y82DTRuCczw vo_wJMXBTIs t4tzUnmuFqY mqXtLRn4ZwU Ku2Hrc7eIBE wcP8TxQvs-0 aTBFC1i7jSk GdzbL5zVbjo MjOa_GtyWn8 DUrigblNFTU uPB0157JU1I q4EF8Cc6STo qOoi_bnj0dg EPBpJnsNrUk 9MyOhef-hz8 yvccMsJD8ZY Pl7zKTsejQQ LGlGG2T_onc W5aDXj0M-CM i_NUdBTpmZ4 6ulRnzPbTEk GMxRLPkLm8k FrPf88CUhTQ Jcz_8SxdYPw hqs3fc7z8OE 6Wl2qBDXCys _Nvv0uIbQB0 X1r3pdc2hfg DoVGRALYR04 U2wSiDiAALM eR7tQMByTww 5K3vvDszc0k JLNusVIjHZQ j7z6vsvn-Lk TNU7-HtA-PA dWQqKDfjPKg uwEq6PFTXhw kotFR3u13QA 9G8Fehz25Ls IdFKvaj5Poc 1TDiHNsM1kE SRxZPHWZBZM Rn9T_TR2l9E 4P_UNxwpy0w lknvtYmYPzI'.split(' '),base_directory,'D:\\downloads\\');
for(;i<d.length;i++)
 d[i]=d[i].title+'	'+d[i].hash+'	'+d[i].url;
simpleWrite(base_directory+'list.txt',d.join(NewLine),TristateTrue);


TODO:
get more data of video
multi task
debug: get_video('8bFCwvoICD0','d:\\');
*/
//get_video[generateCode.dLK]='initialization_WScript_Objects,get_URI,getU,HTMLToUnicode';
function get_video(video_hash_array, base_directory, temp_directory, list_only) {
	if (!video_hash_array)
		return;
	if (!(video_hash_array instanceof Array))
		video_hash_array = [ video_hash_array ];

	var _f = arguments.callee, count = video_hash_array.length, err_count = 0, i = 0, urls = {}, name_array = [], video_data, fp, t;

	if (base_directory && !/[\\\/]$/.test(base_directory))
		base_directory += library_namespace.env.path_separator;

	for (; i < count; i++) {
		// for message show
		fp = '[' + (i + 1) + '/' + count + '] ' + video_hash_array[i];

		if ((video_data = _f.get_data(video_hash_array[i])) && video_data.url) {
			name_array.push(t = video_data.title);
			urls[t] = video_data;

			sl(fp + ' [<a href="' + video_data.url + '">' + t + '</a>]');
			fp = base_directory + t + video_data.extension;

			if (temp_directory
					&& fso.FileExists(get_URI.temp_file = temp_directory
							+ video_data.hash + video_data.extension))
				fso.MoveFile(get_URI.temp_file, fp);
			if (fso.FileExists(fp)) {
				sl('File [' + fp + '] existed.');
				continue;
			}

			if (temp_directory)
				library_namespace.debug('temp file: [' + get_URI.temp_file
						+ ']');
			if (!list_only) {
				if (a = get_URI(video_data.url, fp))
					err_count++, err(a);
				// Sleep(9);
			}
		} else
			err_count++, err(fp
					+ (video_data ? ' [' + video_data.title + ']' : ''));
	}

	sl(err_count ? 'Error: ' + err_count + '/' + count : 'All ' + count
			+ ' files done.');

	// return video data
	name_array.sort();

	for (i = 0, count = name_array.length, t = []; i < count; i++)
		t.push(urls[name_array[i]]);

	return t;
};
// get video data
get_video.get_data = function(video_hash) {
	var html = getU('http://kej.tw/flvretriever/?videoUrl='
			+ encodeURIComponent('http://www.youtube.com/watch?v=' + video_hash)), title, url, m;

	if (html) {
		if (m = html.match(/vtitle[^>]+>([^<]+)</))
			title = m[1];
		if (m = html.match(/outputfield[^>]+>([^<]+)</))
			url = HTMLToUnicode(m[1]);

		return {
			hash : video_hash,
			// title/name
			title : title,
			url : url,
			// what extension
			extension : '.flv'
		};
	}
};




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
function FindProxyForURL(url, host){	//	url: 完整的URL字串, host: 在 URL字串中遠端伺服器的網域名稱。該參數祇是為了 方便而設定的，是與URL在 :// 和 / 中的文字是一模 一樣。但是傳輸阜（The port number）並不包含其中 。當需要的時候可以從URL字串解讀出來。
 var lch = host.toLowerCase();

	//isPlainHostName(lch) || isInNet(lch,"192.168.0.0","255.255.0.0") || isInNet(lch,"127.0.0.0","255.255.0.0") || dnsDomainIs(lch,".tw") ?"DIRECT";
 return //dnsDomainIs(lch,"holyseal.net") || dnsDomainIs(lch,".fuzzy2.com") ? "PROXY 211.22.213.114:8000; DIRECT":	//	可再插入第二、三順位的proxy
/*
http://www.cybersyndrome.net/

http://www.publicproxyservers.com/page1.html
curl --connect-timeout 5 -x 219.163.8.163:3128 http://www.getchu.com/ | grep Getchu.com
curl --connect-timeout 5 -x 64.34.113.100:80 http://www.getchu.com/ | grep Getchu.com
curl --connect-timeout 5 -x 66.98.238.8:3128 http://www.getchu.com/ | grep Getchu.com
*/
	dnsDomainIs(lch,".cn") || dnsDomainIs(lch,"pkucn.com")
						? "PROXY proxy.hinet.net:80; DIRECT":	//	2009/8/16 14:20:32	用 HiNet 網際網路 Proxy Server 上大陸網速度還滿快的	http://www.ltivs.ilc.edu.tw/proxy/proxy/hinet.htm
	dnsDomainIs(lch,".getchu.com")		? "PROXY 219.163.8.163:3128; PROXY 64.34.113.100:80; PROXY 66.98.238.8:3128; DIRECT":
	dnsDomainIs(lch,".minori.ph")		? "PROXY 219.94.198.110:3128; PROXY 221.186.108.237:80; DIRECT":	//	Japan Distorting Open Proxy List	http://www.xroxy.com/proxy--Distorting-JP-nossl.htm
						//	slow:	http://www.cybersyndrome.net/country.html
	dnsDomainIs(lch,".tactics.ne.jp")	? "PROXY 202.175.95.171:8080; PROXY 203.138.90.141:80; DIRECT":
	//dnsDomainIs(lch,".ys168.com")		? "PROXY 76.29.160.230:8000; DIRECT":	//	永硕E盘专业网络硬盘服务

	"DIRECT";//:/^[a-z\.\d_\-]+$/.test(lch)?"DIRECT":"PROXY dnsrelay.twnic.net.tw:3127";	//	http://www.twnic.net.tw/proxy.pac	將中文網域名稱轉成英文網域名稱
}





//	http://help.globalscape.com/help/cuteftppro8/
//setupCuteFTPSite[generateCode.dLK]='parse_URI';
function setupCuteFTPSite(targetS,site){
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
	//var connectTo = from_URI.indexOf('://') == -1 ? to_URI : from_URI, CuteFTPSite = setupCuteFTPSite(connectTo);
	var
	// isD: use download (else upload)
	isD, CuteFTPSite,
	// lF: local file
	lF,
	// rP: remote path
	rP;
	if (from_URI.indexOf('://') != -1)
		isD = 0;
	else if (to_URI.indexOf('://') != -1)
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
};





return (
	_// JSDT:_module_
);
}


});

