
/**
 * @name	CeL function for Windows
 * @fileoverview
 * 本檔案包含了 Windows 系統管理專用的 functions。
 * @since	
 */

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name : 'application.OS.Windows',
code : function(library_namespace) {


/**
 * null module constructor
 * @class	web 的 functions
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



// --------------------------------------------------------


// 在 .hta 中, typeof WScript==='undefined'.
// http://msdn.microsoft.com/library/en-us/shellcc/platform/shell/reference/objects/shell/application.asp
// http://msdn.microsoft.com/library/en-us/shellcc/platform/shell/programmersguide/shell_intro.asp

// 用 IE 跑 ActiveXObject 可能會出現 ActiveX 指令碼的警告，須更改「允許主動式內容在我電腦上的檔案中執行」或改用 <a href="http://msdn.microsoft.com/en-us/library/ms537628%28v=vs.85%29.aspx" accessdate="2011/12/11 20:4" title="The Mark of the Web (MOTW)">Mark of the Web</a>。
// IE 工具→「網際網路選項」→「進階」→「安全性」→「允許主動式內容在我電腦上的檔案中執行」


_// JSDT:_module_
.
//	for Microsoft Windows Component Object Model.
//	http://blogs.msdn.com/b/ericlippert/archive/2004/06/01/145686.aspx
//	http://technet.microsoft.com/library/ee156598.aspx
new_COM = typeof WScript === 'object' ? function(id) {
	//	http://msdn.microsoft.com/en-us/library/xzysf6hc(v=vs.84).aspx
	return WScript.CreateObject(id);
} : typeof ActiveXObject === 'function' ? function(id) {
	// e.g., in HTA
	return new ActiveXObject(id);
} : typeof Server === 'object' && Server.CreateObject && function(id) {
	return Server.CreateObject(id);
};

// CeL.application.OS.Windows.no_COM
if (_.no_COM = !_.new_COM && 'No Component Object Model support!') {
	if (false && !library_namespace.env.ignore_COM_error)
		library_namespace.warn('new_COM: no <a href="http://en.wikipedia.org/wiki/Component_Object_Model" target="_blank">Component Object Model</a> support!');

	(_.new_COM = function(id) {
		// 忽略沒有 Windows Component Object Model 的錯誤。
		if (!library_namespace.env.ignore_COM_error)
			throw new Error('new_COM: No method to get Microsoft <a href="http://en.wikipedia.org/wiki/Component_Object_Model" target="_blank">Component Object Model</a> (COM): [' + id + ']! You may need to set `CeL.env.ignore_COM_error = true`!');
	});

	return _;
}
// WScript.Echo((_.no_COM? '沒' : '') + '有 Windows Component Object Model。');


/**
 * test if is a COM.<br />
 * 經驗法則。並非依照規格書。
 * 
 * @param object
 *            object to test
 * @returns {Boolean} is a COM.
 */
function is_COM(object) {
	try {
		if (library_namespace.is_Object(object)
				&& '' === '' + object
				&& typeof object.constructor === 'undefined'
				) {
			var i;
			for (i in object) {
				return false;
			}

			try {
				i = String(object);
				return false;
			} catch (e) {
				return true;
			}
		}
		return false;

	} catch (e) {
		// TODO: handle exception
	}
}


_// JSDT:_module_
.
is_COM = is_COM;






var HTA;
/**
 * Are we run in HTA?<br />
 * ** HTA 中應該在 DOM ready 後呼叫，否則 document.getElementsByTagName 不會有東西！
 * @param {String}[id]	HTA tag id (only used in low version that we have no document.getElementsByTagName)
 * @return	We're in HTA
 * @require	library_namespace.is_WWW
 * @since	2009/12/29 19:18:53
 * @_memberOf	_module_
 * @see
 * http://msdn2.microsoft.com/en-us/library/ms536479.aspx
 * http://www.microsoft.com/technet/scriptcenter/resources/qanda/apr05/hey0420.mspx
 * http://www.msfn.org/board/lofiversion/index.php/t61847.html
 * lazy evaluation
 * http://peter.michaux.ca/articles/lazy-function-definition-pattern
 */
function get_HTA(id) {
	if (!library_namespace.is_HTA)
		return;

	if (library_namespace.is_WWW(true)) {
		HTA = document.getElementsByTagName('APPLICATION')[0];
	} else
		HTA = library_namespace.is_WWW() && id && document.all && document.all[id];

	return HTA;
};

library_namespace.set_initializor(get_HTA, _);




function parse_command_line(command_line, no_command_name){
	//	TODO: "" 中的判別仍有問題。
	var args = [], re = no_command_name ? /\s+("([^"]*)"|(\S+))/g
			: /\s*("([^"]*)"|(\S+))/g, result;

	// commandLine 第一引數為 full script name
	while (result = re.exec(command_line))
		args.push(result[3] || result[2]);

	return args;
}

//get_WScript_object();
//get_WScript_object[generateCode.dLK]='is_WWW,get_HTA,WSH,dirSp'.split(',');
//get_WScript_object[generateCode.dLK].push('*var args,WshShell,WinShell,WinShell,fso;get_WScript_object();');
var WSH, WshShell = "WScript.Shell", WinShell = "Shell.Application", FSO = "Scripting.FileSystemObject", args;

var log_message;

/**
* 
* @param HTML_only
*/
function get_WScript_object(HTML_only) {
	var i;

	if (typeof WshShell === 'string') {
		//library_namespace.debug('Initializing using ' + _.new_COM, 1, 'get_WScript_object');
		try {
			WshShell = _.new_COM(WshShell);
			WinShell = _.new_COM(WinShell);
			FSO = _.new_COM(FSO);
		} catch (e) {
			if ((e.number & 0xFFFF) === 429)
				//	Automation 伺服程式無法產生物件
				//	Run-Time Error '429' OLE Automation Server Can't Create Object
				//	把 HTA 當作 HTML?
				throw e;
			library_namespace.error(e);
		}
		//library_namespace.debug(typeof FSO, 1, 'get_WScript_object');
	} else
		library_namespace.debug('Already initialized!', 1, 'get_WScript_object');

	if (typeof WScript === 'object'
		// && typeof WScript.constructor=='undefined'
			) {
		// Array.from()
		args = Array.prototype.slice.call(WScript.Arguments);

		//	Microsoft Windows Script Host (WSH)
		i = (WSH = WScript.FullName).lastIndexOf(library_namespace.env.path_separator);
		if (i !== -1)
			WSH = WSH.slice(i + 1);

	} else if (
			!(typeof HTML_only === 'undefined' ? library_namespace.is_WWW() && !_.get_HTA() : HTML_only)// !HTML_only//
			&& typeof ActiveXObject !== 'undefined')
		try {
			if (i = _.get_HTA()){
				args = parse_command_line(i.commandLine);
				//	default HTA host is mshta.exe.
				WSH = 'mshta.exe';
			}
		} catch (e) {
		}

	//	判斷假如尚未load則排入以確定是否為HTA
	else if (library_namespace.is_WWW(1) && !_.get_HTA()
			// && !document.getElementsByTagName('body').length
			)
		setTimeout(function() {
			get_WScript_object(HTML_only);
		}, 100);


	try {
		// CScript.exe only
		// var stdout = FSO.GetStandardStream(1);
		// var stderr = FSO.GetStandardStream(2);
		log_message = function(message) {
			// stdout.WriteLine(message);
			// WScript.StdOut.Write(message);
			WScript.StdOut.WriteLine(message);
		};
	} catch (e) {
		// using WScript.exe
		log_message = function(message) {
			WScript.Echo(message);
		};
	}

	// WScript.StdIn.ReadLine()


/*
* @cc_on @if(@_jscript_version >= 5) // JScript gives us Conditional
* compilation, we can cope with old IE versions. // and security blocked
* creation of the objects. ;//else.. @end@
*/

	i = {
		WshShell : WshShell,
		WinShell : WinShell,
		FSO : FSO,
		args : args,
		WSH : WSH
	};

	if(HTML_only)
		throw i;
	return i;
};

library_namespace.set_initializor(get_WScript_object, _);




/*	2007/11/17 23:3:53
	使用 ADSI (Active Directory Service Interface) 存取資料
	http://support.microsoft.com/kb/234001
	http://www.dbworld.com.tw/member/article/010328b.htm
	http://support.microsoft.com/kb/216393
*/
function addUser(name,pw,group,computer){
 //	http://msdn.microsoft.com/library/en-us/script56/html/wsmthenumprinterconnections.asp
 ;
 //	連上伺服器
 var oIADs,o;
 //	利用Create指令，指定產生一個新的使用者類別，以及使用者帳號的名稱。使用SetInfo的指令將目錄服務中的資料更新。
 try{oIADs=new Enumerator(GetObject(computer='WinNT://'+(computer||(new_COM('WScript.Network')).ComputerName)));}catch(e){}//WScript.CreateObject('WScript.Network')
 if(oIADs){//try{
  if(name){
   try{o=oIADs.Create('user',name);}catch(e){o=new Enumerator(GetObject(computer+'/'+name));}
   o.SetPassword(pw),/*o.FullName=name,o.Description=name,*/o.SetInfo();
   //	Administrators
   if(group)(new Enumerator(GetObject(computer+'/'+group))).Add(o.ADsPath);	//	o.ADsPath: computer+'/'+name
   return o;	//	得到用戶
  }

  //oIADs.Filter=['user'];//new VBArray('user');	//	no use, 改用.AccountDisabled
  o={};
  //	http://msdn2.microsoft.com/en-us/library/aa746343.aspx
  //	對所有的oIADs，通常有Name,Description
  for(var i,j,a,b,p='Name,AccountDisabled,Description,FullName,HomeDirectory,IsAccountLocked,LastLogin,LoginHours,LoginScript,MaxStorage,PasswordExpirationDate,PasswordMinimumLength,PasswordRequired,Profile'.split(',');!oIADs.atEnd();oIADs.moveNext())if(typeof oIADs.item().AccountDisabled==='boolean'){
   for(i=oIADs.item(),j=0,a={};j<p.length;j++)if(b=p[j])try{
    a[b]=i[b];
    if(typeof a[b]==='date')a[b]=new Date(a[b]);
   }catch(e){
    //alert('addUser():\n['+i.name+'] does not has:\n'+b);
    //	刪掉沒有的屬性。但僅少數不具有，所以不能全刪。XP中沒有(?):,AccountExpirationDate,BadLoginAddress,BadLoginCount,Department,Division,EmailAddress,EmployeeID,FaxNumber,FirstName,GraceLoginsAllowed,GraceLoginsRemaining,HomePage,Languages,LastFailedLogin,LastLogoff,LastName,LoginWorkstations,Manager,MaxLogins,NamePrefix,NameSuffix,OfficeLocations,OtherName,PasswordLastChanged,Picture,PostalAddresses,PostalCodes,RequireUniquePassword,SeeAlso,TelephoneHome,TelephoneMobile,TelephoneNumber,TelephonePager,Title
    //p[j]=0;//delete p[j];
   }
   o[i.name]=a;
  }

  return o;
 }//catch(e){}
};
//a=addUser();for(i in a){d=[];for(j in a[i])d.push(j+': '+a[i][j]);alert(d.join('\n'));}





//	特殊功能	-------------------------------------------------------

/*	取得基本環境值
//	test
if(0){
 var o=WinEnvironment;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=SpecialFolder;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=Network;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=NetDrive;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
 o=NetPrinter;
 if(typeof o=='object'){var i,t='';for(i in o)t+=i+'='+o[i]+'\n';alert(t);}
}
*/
//setTool();
var WinEnvironment,SpecialFolder,Network,NetDrive,NetPrinter;
//getEnvironment[generateCode.dLK]='WinEnvironment,SpecialFolder,Network,NetDrive,NetPrinter,*getEnvironment();';
function getEnvironment(){
 if(typeof WshShell!=='object'||typeof SpecialFolder==='object')return;

 // http://www.robvanderwoude.com/vbstech_data_environment.php
 // https://msdn.microsoft.com/ja-jp/library/cc364502.aspx
 // WshShell.ExpandEnvironmentStrings('%TEMP%'), WshShell.ExpandEnvironmentStrings('%ProgramFiles%')
 WinEnvironment={},Network={},NetDrive={},NetPrinter={};
 // Windows 95/98/Me の場合、使用できる strType は Process に限定されます。
 var i,j,k,o=new Enumerator(WshShell.Environment("Process"));/*	Win9x、NT（Administratorもしくはほかのユーザー）の区別なく、すべての場合でエラーが発生しないようにするには、strTypeに"PROCESS"を指定するとよいでしょう。
	機器上所有已定義的環境變數Windows environment variables	http://msdn2.microsoft.com/en-us/library/fd7hxfdd(VS.85).aspx	http://www.roy.hi-ho.ne.jp/mutaguchi/wsh/refer/lesson11.htm	http://nacelle.info/wsh/03001.php	http://www.cs.odu.edu/~wild/windowsNT/Spring00/wsh.htm
	usual:	ALLUSERSPROFILE,APPDATA,BLASTER,CLASSPATH,CLIENTNAME,CommonProgramFiles,COMPUTERNAME,ComSpec,DEVMGR_SHOW_NONPRESENT_DEVICES,HOMEDRIVE,HOMEPATH,INCLUDE,LIB,LOGONSERVER,NUMBER_OF_PROCESSORS,OS,Os2LibPath,Path,PATHEXT,PROCESSOR_ARCHITECTURE,PROCESSOR_IDENTIFIER,PROCESSOR_LEVEL,PROCESSOR_REVISION,ProgramFiles,PROMPT,QTJAVA,SESSIONNAME,SystemDrive,SystemRoot,TEMP,TMP,USERDOMAIN,USERNAME,USERPROFILE,VS71COMNTOOLS,VSCOMNTOOLS,windir,winbootdir

	WshShell.ExpandEnvironmentStrings("%windir%\\notepad.exe");	WshShell.Environment("Process")("TMP")
	MyShortcut.IconLocation = WSHShell.ExpandEnvironmentStrings("%windir%\\notepad.exe, 0");

	System	HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Environment
	User	HKEY_CURRENT_USER\Environment
	Volatile	HKEY_CURRENT_USER\Volatile Environment	ログオフとともにクリアされる
	Process, or 98:'WshShell.Environment'==WshShell.Environment("Process"),NT:==WshShell.Environment("System")ただし、Administratorアカウントを持つユーザー以外は、strTypeに"SYSTEM"を指定、もしくは省略するとエラーになります。
 */
 while(!o.atEnd()){
  i=o.item();
  j=i.indexOf('=');//if((j=i.indexOf('='))!=-1)
  WinEnvironment[i.slice(0,j)]=i.substr(j+1);	//	value以';'作為分隔，若有必要可使用.split(';')
  o.moveNext();
 }

 //	http://www.microsoft.com/japan/msdn/library/ja/script56/html/wsprospecialfolders.asp	HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders
 //	VB中用For Each .. In可列舉出全部，但JS則不行-_-所以得自己列舉
 // fso.GetSpecialFolder( 0: Windows 文件夾 1: System 文件夾 2: Temp 文件夾 )
 set_Object_value('SpecialFolder','AllUsersDesktop,AllUsersStartMenu,AllUsersPrograms,AllUsersStartup,AppData,Desktop,Favorites,Fonts,MyDocuments,NetHood,PrintHood,Programs,Recent,SendTo,StartMenu,Startup,Templates');
 o=WshShell.SpecialFolders;
 for(i in SpecialFolder)SpecialFolder[i]=o(i);
 for(i=0;i<o.Count();i++)SpecialFolder[i]=o.item(i);

 o=new_COM("WScript.Network");//WScript.CreateObject("WScript.Network");
 //	http://msdn.microsoft.com/library/en-us/script56/html/wsmthenumprinterconnections.asp
 Network.ComputerName=o.ComputerName,Network.UserDomain=o.UserDomain,Network.UserName=o.UserName;
 //	Network Drive & Printer mappings
 j=o.EnumNetworkDrives(),k=1;
 for(i=0;i<j.Count();i+=2)NetDrive[j.Item(i)?j.Item(i):'Volatile'+k++]=NetDrive[i/2]=j.Item(i+1);
 j=o.EnumPrinterConnections(),k=1;
 for(i=0;i<j.Count();i+=2)NetPrinter[j.Item(i)]=NetPrinter[i/2]=j.Item(i+1);
};	//	function getEnvironment()

// http://msdn.microsoft.com/en-us/library/0ea7b5xe.aspx
// http://msdn.microsoft.com/en-us/library/yzefkb42.aspx
/*

CeL.run('application.OS.Windows');
CeL.log(CeL.get_SpecialFolder('APPDATA','foobar2000'));

*/
function get_SpecialFolder(name, sub_path) {
	if (!SpecialFolder) {
		var SpecialFolders = get_WScript_object().WshShell.SpecialFolders;

		SpecialFolder = [];
		'AllUsersDesktop,AllUsersStartMenu,AllUsersPrograms,AllUsersStartup,AppData,Desktop,Favorites,Fonts,MyDocuments,NetHood,PrintHood,Programs,Recent,SendTo,StartMenu,Startup,Templates'
		//
		.toUpperCase().split(',')
		//
		.forEach(function (strFolderName) {
			var path = SpecialFolders.Item(strFolderName);
			if (path) {
				SpecialFolder[strFolderName] = path;
				library_namespace.debug('SpecialFolder[' + strFolderName + '] = [' + path + ']', 2);
			}
		});

		// SpecialFolders.length === SpecialFolders.Count()
		for (var i = 0, length = SpecialFolders.Count(); i < length; i++)
			// SpecialFolders.Item(i) is native String @ JScript.
			SpecialFolder[i] = SpecialFolders.Item(i);
	}

	if (!name)
		name = SpecialFolder;
	else if ((name = SpecialFolder[name.toUpperCase()]) && sub_path)
		name += '\\' + sub_path;
	return name;
}

_.get_SpecialFolder = get_SpecialFolder;



_// JSDT:_module_
.
/**
 * 取得 VB 的 Nothing
 * @returns	VB 的 Nothing
 * @_memberOf	_module_
 */
VBNothing = function () {
	try {
		return new_COM("ADODB.RecordSet").ActiveConnection;
	} catch (e) {
	}
};

_// JSDT:_module_
.
/**
 * 轉換 VB 的 Safe Array 成為 JS Array.
 * @param vba	VB 的 array
 * @returns
 * @_memberOf	_module_
 */
VBA_to_JSA = function (vba) {
	try {
		return (new VBArray(vba)).toArray();
	} catch (e) {
	}
	return [];
};

_// JSDT:_module_
.
/**
 * 轉換JS Array成為VB的Safe Array.
 * Safe Array To JS Array: plaese use new VBArray().
 * JScriptの配列は実際にはCSV文字列だったりする。VBScriptのvartypeに食わせると8(VT_STRING)が返ってくることからもわかる。
 * @param array
 * @returns
 * @see
 * http://www.microsoft.com/japan/msdn/japan/msdn/library/ja/script56/html/js56jsobjvbarray.asp
 * @_memberOf	_module_
 */
JSA_to_VBA = function (array) {
	if (typeof array !== 'object')
		array = [ array ];
	var i = 0, dic = new_COM("Scripting.Dictionary");
	for (; i < array.length; i++)
		dic.add(i, array[i]);
	try {
		return dic.items();
	} finally {
		//dic = null;
	}
};




/*	http://www.eggheadcafe.com/forumarchives/scriptingVisualBasicscript/Mar2006/post26047035.asp
	Application.DoEvents();
*/
function DoEvents() {
	// Triggers screen updates in an HTA...
	try {
		if (!DoEvents.w)
			DoEvents.w = typeof WshShell === 'object' ? WshShell
					: new_COM("WScript.Shell");
		DoEvents.w.Run("%COMSPEC% /c exit", 0, true);
	} catch (e) {
	}
}

var DoNothing = DoEvents;

function Sleep(_sec) {
	if (isNaN(_sec) || _sec < 0)
		_sec = 0;
	if (typeof WScript === 'object')
		try {
			// Win98的JScript沒有WScript.Sleep
			WScript.Sleep(_sec * 1e3);
		} catch (e) {
		}
		else
			// if(typeof window!='object')
			try {
				if (!Sleep.w)
					Sleep.w = typeof WshShell === 'object' ? WshShell
							: new_COM("WScript.Shell");
				Sleep.w.Run(_sec ? "%COMSPEC% /c ping.exe -n " + (1 + _sec)
						+ " 127.0.0.1>nul 2>nul" : "%COMSPEC% /c exit", 0,
						true);
			} catch (e) {
			}
};





/*
	送key到application	http://msdn.microsoft.com/library/en-us/script56/html/wsmthsendkeys.asp
	SendKeys('a')	送a
	SendKeys("a{1}4{2}5");	送a,等1/10s,送4,等2/10s,送5
	timeOut:	<0:loop, 0 or not set:1 time, >0:be the time(ms)
*/
var SendKeysU;
//SendKeys[generateCode.dLK]='Sleep';
function SendKeys(keys,appTitle,timeOut,timeInterval){
 if(typeof WshShell!=='object'||typeof WshShell!=='object'&&typeof(WshShell=new_COM("WScript.Shell"))!=='object')return 1;
 if(isNaN(timeInterval)||timeInterval<1)timeInterval=100;	//	時間間隔
 timeOut=timeOut?timeOut<0?-1:Math.floor(timeOut/timeInterval)+1:0;
 if(appTitle)
  while(!WshShell.AppActivate(appTitle))
   if(timeOut--)Sleep(timeInterval);else return 2;
 if(!SendKeysU)SendKeysU=100;	//	時間間隔單位
 while(keys.match(/\{([.\d]+)\}/)){
  WshShell.SendKeys(keys.substr(0,RegExp.index));
  Sleep(SendKeysU*RegExp.$1);
  keys=keys.substr(RegExp.lastIndex);
 }
 return WshShell.SendKeys(keys);
}




// Create an object reference: hack?!
//var windows=new WScript();
// Run the calculator program
//windows.explorer.run('calc.exe');
// Writing the local computer name to the screen
//document.write(windows.network.computerName);
// Copy files from one folder to another
//windows.fileSystem.copyFile('c:\\mydocuments\\*.txt', 'c:\\tempfolder\\');





return (
	_// JSDT:_module_
);
}


});

