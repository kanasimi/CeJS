
/**
 * @name	CeL file function for Windows
 * @fileoverview
 * 本檔案包含了 Windows 的檔案/文件管理 functions。
 * 
 * use 'application.storage' instead
 * 
 * @since	2009/12/1
 */

/*
 * @see
 * JScript Language Reference (Windows Scripting - JScript)
 * http://msdn.microsoft.com/en-US/library/yek4tbz0%28v=VS.84%29.aspx
 * 
 * TODO:
 * http://www.comsharp.com/GetKnowledge/zh-CN/It_News_K869.aspx
 */

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name : 'application.OS.Windows.file',
//data.set_Object_value|application.locale.encoding.guess_encoding
require : 'data.code.compatibility.|application.OS.Windows.new_COM|application.OS.Windows.is_COM|application.storage.file.is_absolute_path|data.file.file_system_structure',
code : function(library_namespace) {


//requiring
var new_COM = this.r('new_COM'), is_COM = this.r('is_COM'),
// set_Object_value = this.r('set_Object_value'),
is_absolute_path = this.r('is_absolute_path'), file_system_structure = this.r('file_system_structure');


var module_name = this.id;


/**
 * null module constructor
 * @class	Windows 下，檔案操作相關之 function。
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
	JScript only	-------------------------------------------------------
*/


// 經驗法則。並非依照規格書。
function is_ADO_Stream(object) {
	//library_namespace.debug('is_COM: ' + is_COM(object), 2);
	//library_namespace.debug('typeof object.SetEOS: ' + typeof object.SetEOS, 2);
	//library_namespace.debug('typeof object.LoadFromFile: ' + typeof object.LoadFromFile, 2);
	return is_COM(object)
		&& typeof object.LoadFromFile === 'unknown';
};

_// JSDT:_module_
.
is_ADO_Stream = is_ADO_Stream;

// 經驗法則。並非依照規格書。
function is_FSO(object) {
	return is_COM(object)
		&& typeof object.FileExists === 'unknown'
		&& typeof object.GetFile === 'unknown';
};

_// JSDT:_module_
.
is_FSO = is_FSO;



_// JSDT:_module_
.
/**
 * FileSystemObject Object I/O mode enumeration.
 * @see	<a href="http://msdn.microsoft.com/en-US/library/314cz14s.aspx" accessdate="2009/11/28 17:42" title="OpenTextFile Method">OpenTextFile Method</a>
 * @_memberOf	_module_
 */
IO_mode = {
	// * @_description <a href="#.IO_mode">IO_mode</a>: Open a file for reading only. You can't write to this file.
	/**
	 * Open a file for reading only. You can't write to this file.
	 * @_memberOf	_module_
	 */
	ForReading : 1,
	/**
	 * Open a file for writing.
	 * @_memberOf	_module_
	 */
	ForWriting : 2,
	/**
	 * Open a file and write to the end of the file.
	 * @_memberOf	_module_
	 */
	ForAppending : 8
};

_// JSDT:_module_
.
/**
 * FileSystemObject Object file open format enumeration.
 * @see	<a href="http://msdn.microsoft.com/en-US/library/314cz14s.aspx" accessdate="2009/11/28 17:42" title="OpenTextFile Method">OpenTextFile Method</a>
 * @_memberOf	_module_
 */
open_format = {
	/**
	 * Opens the file using the system default.
	 * @_memberOf	_module_
	 */
	TristateUseDefault : -2,
	/**
	 * Opens the file as Unicode.
	 * @_memberOf	_module_
	 */
	TristateTrue : -1,
	/**
	 * Opens the file as ASCII.
	 * @_memberOf	_module_
	 */
	TristateFalse : 0
};


var WshShell = new_COM("WScript.Shell"),
/** {String}path separator. e.g., '/', '\' */
path_separator = library_namespace.env.path_separator,
path_separator_pattern = library_namespace.env.path_separator_pattern,
line_separator = library_namespace.env.line_separator,
/**
 * FileSystemObject
 * @inner
 * @ignore
 * @see
 * <a href="http://msdn.microsoft.com/en-US/library/z9ty6h50%28VS.85%29.aspx" accessdate="2010/1/9 8:10">FileSystemObject Object</a>
 * Scripting Run-Time Reference/FileSystemObject
 * http://msdn.microsoft.com/en-US/library/hww8txat%28v=VS.84%29.aspx
 */
FSO = new_COM("Scripting.FileSystemObject"),
// XMLHttp,
WinShell // initialization_WScript_Objects
, args, ScriptHost;



/*	↑JScript only	-------------------------------------------------------
*/

// set/get current working directory. 設定/取得目前工作目錄。
function working_directory(change_to_directory) {
	if (change_to_directory)
		WshShell.CurrentDirectory = change_to_directory;
	return WshShell.CurrentDirectory + path_separator;
}

_.working_directory = working_directory;


/*

return {Object} report
	.list	files matched
	.succeed	success items
	.failed	failed items
	.log	log text
	.undo	undo data

usage example:
	move_file()	get file list array of current dir.
	move_file(0,0,'dir')	get file list array of dir.
	move_file('*.*','*.jpg','dir')	Error! Please use RegExp('.*\..*') or wildcard_to_RegExp('*.*')
	move_file(/file(\d+).jpg/,0,'dir')	get file list array of dir/file(\d+).jpg
	move_file(f1,move_file.f.remove)	delete f1
	move_file('f1','f2')	[f1]->[f2]
	move_file('f1','f2','.',move_file.f.copy|move_file.f.reverse)	copy [./f2] to [./f1]
	move_file(/file(\d+).jpg/,/file ($1).jpg/,'dir')	[dir/file(\d+).jpg]->[dir/file ($1).jpg]	can't use fuzzy or reverse in this time

prog example:
	function move_file_filter(fn){var n=fn.match(/0000(\d+)\(\d\)\.pdf/);if(!n)return true;n=n[1];if(n!=0&&n!=1&&n!=7&&n!=10&&n!=13&&n!=15&&n!=26&&n!=28)return true;try{n=fn.match(/(\d+)\(\d\)\.pdf/);FileSystemObject.MoveFile(n[1]+'('+(n[1]?vol-1:vol-2)+').pdf',n[1]+'.pdf');}catch(e){}return;}
	var vol=11,doMove=move_file(new RegExp('(\\d+)\\('+vol+'\\)\\.pdf'),'$1.pdf');
	write_file('move.log','-'.repeat(60)+line_separator+doMove.log,open_format.TristateTrue,ForAppending);
	write_file('move.undo.'+vol+'.txt',doMove.undo,open_format.TristateTrue),write_file('move.undo.'+vol+'.bat',doMove.undo);//bat不能用open_format.TristateTrue
	alert('Done '+doMove.succeed+'/'+doMove.list.length);

	for Win98, turn lower case:
	move_file(/^[A-Z\d.]+$/,function($0){return '_mv_tmp_'+$0.toLowerCase();},'.',move_file.f.include_folder|move_file.f.include_subfolder);
	alert(move_file(/^_mv_tmp_/,'','.',move_file.f.include_folder|move_file.f.include_subfolder).log);


for(var i=0,j,n,m;i<40;i++)
 if(!FSO.FileExists(n='0000'+(i>9?'':'0')+i+'.pdf'))for(j=0;j<25;j++)
  if(FSO.FileExists(m='0000'+(i>9?'':'0')+i+'('+j+').pdf')){try{FSO.MoveFile(m,n);}catch(e){}break;}

TODO:
move newer	把新檔移到目的地，舊檔移到 bak。

*/
_// JSDT:_module_
.
/**
 * move/rename files, ** use RegExp, but no global flag **<br />
 * 可用 move_file_filter() 來排除不要的<br />
 * 本函數可能暫時改變目前工作目錄！
 * @param {String} from	from file
 * @param {String} to	to file
 * @param {String} base_path	base path
 * @param flag
 * @param {Function} filter	可用 filter() 來排除不要的
 * @return	{Object} report
 * @since	2004/4/12 17:25
 * @requires	path_separator,FSO,WshShell,line_separator,Enumerator
 * @_memberOf	_module_
 */
move_file = function move_file(from, to, base_path, flag, filter) {
	var _s = move_file.f ? move_file : _.move_file, _f = _s.f,
	// '.?': 一定會match
	default_from = new RegExp('.?'), t, CurrentDirectory, report = {};
	//library_namespace.debug(typeof from + ',' + from.constructor);
	if (flag & _f.reverse)
		//flag-=_f.reverse,
		t = from, from = to, to = t;
	if (!from)
		from = default_from;
	else if (typeof from !== 'string'
		&& (!library_namespace.is_RegExp(from) && !(from = '' + from)))
		from = default_from;
	report.list = [], report.succeed = report.failed = 0,
	report.undo = report.log = '';

	if (!base_path)
		base_path = '.' + path_separator;
	else if (typeof get_folder === 'function')
		base_path = get_folder(base_path);

	if ((base_path = '' + base_path).slice(
			// -1, or try: base_path.length-path_separator.length
			-1) !== path_separator)
		base_path += path_separator;

	/*
	if (typeof FSO === 'undefined')
		FSO = new ActiveXObject("Scripting.FileSystemObject");
	else if (typeof FSO !== 'object')
		throw new Error(1, 'FSO was already seted!');
	*/
	try {
		dir = FSO.GetFolder(base_path);
	} catch (e) {
		throw new Error(e.number,
				'move_file(): 基準路徑不存在\n' + e.description);
	}

	// TODO: 對from不存在與為folder之處裡: fuzzy

	if (flag & _f.include_subfolder) {
		CurrentDirectory = WshShell.CurrentDirectory;
		for ( var i = new Enumerator(dir.SubFolders); !i.atEnd(); i.moveNext())
			_s(from, to, i.item(), flag);
		if (base_path)
			// 改變目前工作目錄
			WshShell.CurrentDirectory = base_path;
	}
	// if(flag&_f.include_folder){}
	var i, f = new Enumerator(dir.Files), use_exact = typeof from === 'string', overwrite = flag
	& _f.overwrite, not_test = !(flag & _f.Test), func = flag
	& _f.copy ? 'copy' : to === _f.remove || flag & _f.remove
			&& !to ? 'delete' : from !== default_from || to ? 'move'
					: 'list';
	// if(func=='delete')to=_f.remove; // 反正不是用這個判別的
	//library_namespace.debug('use_exact: ' + use_exact + '\nbase_path: ' + base_path + '\nfrom: ' + from);
	// BUG: 這樣順序會亂掉，使得 traverse (遍歷)不完全
	for (; !f.atEnd(); f.moveNext())
		if (i = f.item(), use_exact && i.Name === from || !use_exact
				&& from.test(i.Name)) {
			report.list.push(i.Name);

			if (typeof filter === 'function' && !filter(i.Name))
				continue;
			t = func === 'copy' || func === 'move' ? i.Name.replace(from,
					typeof to === 'object' ? to.source : to) : '';

			if (t)
				try {
					report.log += func + ' [' + i.Name + ']'
					+ (t ? ' to [' + t + '] ' : '');
					var u = '';
					t = (base_path === default_from ? base_path : '')
					+ t;
					if (func === 'delete') {
						if (not_test)
							i.Delete(overwrite);
					} else if (!FSO.FileExists(t) || overwrite) {
						if (not_test) {
							if (overwrite && FSO.FileExists(t))
								FSO.DeleteFile(t, true);
							if (func === 'copy')
								//	Copy() 用的是 FileSystemObject.CopyFile or FileSystemObject.CopyFolder, 亦可用萬用字元(wildcard characters)
								i.Copy(t, overwrite);
							else
								i.Move(t);
						}
						u = 'move	' + t + '	' + i.Name + line_separator;
					} else {
						report.log += ': target existing, ';
						throw 1;
					}
					report.log += 'succeed.' + line_separator,
					report.undo += u, report.succeed++;
				} catch (e) {
					report.log += 'failed.' + line_separator, report.failed++;
				}
				//library_namespace.debug(i.Name + ',' + t);
		}

	if (flag & _f.include_subfolder && CurrentDirectory)
		WshShell.CurrentDirectory = CurrentDirectory;
	report.log += line_separator + (not_test ? '' : '(test)') + func + ' ['
				+ from + '] to [' + to + ']' + line_separator
				+ (typeof gDate === 'function' ? gDate() + '	' : '')
				+ 'done ' + report.succeed + '/' + report.list.length
				+ line_separator;
	return report;
};

//var move_file.f;
//set_Object_value('move_file.f','none=0,overwrite=1,fuzzy=2,reverse=4,include_folder=8,include_subfolder=16,Test=32,copy=64,remove=128','int');
_// JSDT:_module_
.
/**
 * <a href="#.move_file">move_file</a> 的 flag enumeration
 * @constant
 * @_memberOf	_module_
 */
move_file.f = {
		/**
		 * null flag
		 * @_memberOf _module_
		 */
		none : 0,
		/**
		 * overwrite target
		 * @_memberOf _module_
		 */
		overwrite : 1,
		/**
		 * If source don't exist but target exist, than reverse.
		 * @deprecated	TODO
		 * @_memberOf _module_
		 */
		fuzzy : 2,
		/**
		 * reverse source and target
		 * @_memberOf _module_
		 */
		reverse : 4,
		/**
		 * include folder
		 * @_memberOf _module_
		 */
		include_folder : 8,
		/**
		 * include sub-folder
		 * @_memberOf _module_
		 */
		include_subfolder : 16,
		/**
		 * Just do a test
		 * @_memberOf _module_
		 */
		Test : 32,
		/**
		 * copy, instead of move the file
		 * @_memberOf _module_
		 */
		copy : 64,
		/**
		 * 當 target 指定此 flag，或包含此 flag 而未指定 target 時，remove the source。
		 * @_memberOf _module_
		 */
		remove : 128
};

_// JSDT:_module_
.
/**
 * move file
 * @requires	FSO,get_folder,get_file_name,initialization_WScript_Objects
 * @_memberOf	_module_
 */
move_1_file = function(from, to, dir, only_file_name, reverse) {
	if (!from || !to || from === to)
		return new Error(1, 'file name error.');

	var e;
	dir = get_folder(dir);

	if (reverse)
		e = from, from = to, to = e;
	e = function(_i) {
		return FSO.FileExists(_i) ? _i : dir ? dir
				+ (only_file_name ? library_namespace.get_file_name(_i) : _i) : null;
	};

	try {
		//library_namespace.debug('move_1_file:\n' + dir + '\n\n' + e(from) + '\n→\n' + e(to));
		FSO.MoveFile(e(from), e(to));
		return;
	} catch (e) {
		e.message = 'move_1_file:\n' + from + '\n→\n' 
				+ to// +'\n\n'+e.message
				;
		return e;
	}
};


/*
function mv(from,to,dir,only_filename,reverse){
 var e,_f,_t;
 dir=get_folder(dir);

 if(reverse)e=from,from=to,to=e;
 _f=from;
 _t=to;
 to=0;
 e=function(_i){
  return FSO.FileExists(_i)?_i:dir&&FSO.FileExists(_i=dir+(only_filename?library_namespace.get_file_name(_i):_i))?_i:0;
 };

 try{
  if(!(_f=e(_f)))to=1;else if(!(_t=e(_t)))to=2;
  else{
   alert('mv():\n'+dir+'\n\n'+_f+'\n→\n'+_t);
   FSO.MoveFile(_f,_t);
   return;
  }
 }catch(e){return e;}
 return e||new Error(to,(to==1?'移動するファイルは存在しない':'移動先が既存した')+':\n'+_f+'\n→\n'+_t);
}


function mv(from,to,dir,only_filename,reverse){
 var e,_f,_t;
 dir=get_folder(dir);

 if(reverse)e=from,from=to,to=e;
 _f=from,_t=to,to=e=0;

 try{
  if(!FSO.FileExists(_f)&&(!dir||!FSO.FileExists(_f=dir+(only_filename?library_namespace.get_file_name(_f):_f))))to=1;
  else if(FSO.FileExists(_t)&&(!dir||FSO.FileExists(_t=dir+(only_filename?library_namespace.get_file_name(_t):_t))))to=2;
  else{
   alert('mv():\n'+dir+'\n'+_f+'\n→\n'+_t);
   //FSO.MoveFile(_f,_t);
   return;
  }
 }catch(e){}
 return e||new Error(to,(to==1?'移動するファイルは存在しない':'移動先が既存した')+':\n'+_f+'\n→\n'+_t);
}

*/


/*

下面一行調到檔案頭
var get_file_details_items,get_file_details_get_object=-62.262;
*/
_// JSDT:_module_
.
/**
 * get file details (readonly)
 * @example
 * get_file_details('path');
 * get_file_details('file/folder name',parentDir);
 * get_file_details('path',get_file_details_get_object);
 * @see	<a href="http://msdn.microsoft.com/en-US/library/bb787870%28VS.85%29.aspx" accessdate="2009/11/29 22:52" title="GetDetailsOf Method (Folder)">GetDetailsOf Method (Folder)</a>
 * @_memberOf	_module_
 */
get_file_details = function(fileObj, parentDirObj) {
	var i, n, r;
	// WinShell=new ActiveXObject("Shell.Application");
	if (typeof WinShell === 'undefined' || !fileObj)
		return;

	// deal with fileObj & parentDirObj
	if (parentDirObj === get_file_details_get_object)
		parentDirObj = 0, n = 1;
	// else n='';
	if (!parentDirObj) {
		// fileObj is path
		if (typeof fileObj !== 'string')
			return;
		if (i = fileObj.lastIndexOf('/') + 1)
			parentDirObj = fileObj.slice(0, i - 1), fileObj = fileObj
			.slice(i);
		else
			return;
	}
	if (typeof parentDirObj === 'string')
		parentDirObj = WinShell.NameSpace(parentDirObj);
	if (typeof fileObj == 'string' && fileObj)
		fileObj = parentDirObj.ParseName(fileObj);
	if (n)
		// just get [(object)parentDirObj,(object)fileObj]
		return [ parentDirObj, fileObj ];

	// get item name
	if (typeof get_file_details_items !== 'object') {
		get_file_details_items = [];
		for (i = 0, j; i < 99; i++)
			// scan cols
			if (n = WinShell.NameSpace(0).GetDetailsOf(null, i))
				get_file_details_items[i] = n;
	}

	// main process
	//for(i=0,r=[];i<get_file_details_items.length;i++)
	r = [];
	for (i in get_file_details_items) {
		//if(get_file_details_items[i])
		r[get_file_details_items[i]] = r[i] = parentDirObj
		.GetDetailsOf(fileObj, i);
	}

	return r;
};


_// JSDT:_module_
.
/**
 * FileSystemObject Object Attributes Property
 * @see
 * <a href="http://msdn.microsoft.com/en-US/library/5tx15443%28VS.85%29.aspx" accessdate="2010/1/9 8:11">Attributes Property</a>
 * @_memberOf	_module_
 * @since	2010/1/9 08:33:36
 */
FSO_attributes = {
	/**
	 * Default. No attributes are set.
	 * @_memberOf	_module_
	 */
	none : 0,
	/**
	 * Normal file. No attributes are set.
	 * @_memberOf	_module_
	 */
	Normal : 0,
	/**
	 * Read-only file. Attribute is read/write.
	 * @_memberOf	_module_
	 */
	ReadOnly : 1,
	/**
	 * Hidden file. Attribute is read/write.
	 * @_memberOf	_module_
	 */
	Hidden : 2,
	/**
	 * System file. Attribute is read/write.
	 * @_memberOf	_module_
	 */
	System : 4,
	/**
	 * Disk drive volume label. Attribute is read-only.
	 * @_memberOf	_module_
	 */
	Volume : 8,
	/**
	 * Folder or directory. Attribute is read-only.
	 * @_memberOf	_module_
	 */
	Directory : 16,
	/**
	 * File has changed since last backup. Attribute is read/write.
	 * @_memberOf	_module_
	 */
	Archive : 32,
	/**
	 * Link or shortcut. Attribute is read-only.
	 * @_memberOf	_module_
	 */
	Alias : 1024,
	/**
	 * Compressed file. Attribute is read-only.
	 * @_memberOf	_module_
	 */
	Compressed : 2048
};

//	reverse map
_.FSO_attributes_reverse = [];
(function() {
	for (var i in _.FSO_attributes)
		if (i !== 'none')
			_.FSO_attributes_reverse[_.FSO_attributes[i]] = i;
})


/*
TODO
	未來：change_attributes(path,'-ReadOnly&-Hidden&-System')

下面調到檔案頭
set_Object_value('Attribute','Normal=0,none=0,ReadOnly=1,Hidden=2,System=4,Volume=8,Directory=16,Archive=32,Alias=64,Compressed=128','int');
set_Object_value('AttributeV','0=Normal,1=ReadOnly,2=Hidden,4=System,8=Volume,16=Directory,32=Archive,64=Alias,128=Compressed');
*/
_// JSDT:_module_
.
/**
 * 改變檔案之屬性。
 * chmod @ UNIX
 * @param	F	file path
 * @param	A	attributes, 屬性.
 * @example
 * change_attributes(path,'-ReadOnly');
 * @_memberOf	_module_
 */
change_attributes = function(F, A) {
	if (!F)
		return -1;

	if (typeof F === 'string')
		try {
			F = FSO.GetFile(F);
		} catch (e) {
			return -2;
		}

	var a;
	try {
		a = F.Attributes;
	} catch (e) {
		return -3;
	}

	if (typeof A === 'undefined')
		A = a;
	else if (A === '' || A === 'Archive')
		A = 32;
	else if (A === 'Normal')
		A = 0;
	else if (isNaN(A))
		if (A.charAt(0) === 'x' || A.charAt(0) === '-')
			if (A = -_.FSO_attributes[A.substr(1)], A && a % (A << 2))
				A = a + A;
			else
				A = a;
		else if (A = _.FSO_attributes[A], A && a % (A << 2) === 0)
			A = a + A;
		else
			A = a;
	else if (_.FSO_attributes_reverse[A])
		if (a % (A << 2) === 0)
			A = a + A;
		else
			A = a;
	else if (_.FSO_attributes_reverse[-A])
		if (a % (A << 2))
			A = a + A;
		else
			A = a;

	if (a !== A)
		try {
			F.Attributes = A;
		} catch (e) {
			//popErr(e);
			library_namespace.error(e);
			//	70：防寫（沒有使用權限）
			return 70 === (e.number & 0xFFFF) ? -8 : -9;
		}
	return F.Attributes;
};





_// JSDT:_module_
.
/**
 * 開檔處理<br />
 * 測試是否已開啟資料檔之測試與重新開啟資料檔
 * @param FN	file name
 * @param NOTexist	if NOT need exist
 * @param IO_mode	open I/O mode
 * @return
 * @requires	FSO,WshShell,IO_mode
 * @_memberOf	_module_
 */
openDataTest = function(FN, NOTexist, IO_mode) {
	if (!FN)
		return 3;
	if (NOTexist && !FSO.FileExists(FN))
		return 0;
	if (!IO_mode)
		IO_mode = _.IO_mode.ForAppending;
	while (true)
		try {
			var Fs = FSO.OpenTextFile(FN, ForAppending);
			Fs.Close();
			break;
		} catch (e) {
			// 對執行時檔案已經開啟之處理
			//if(typeof e==='object'&&e.number&&(e.number&0xFFFF)===70)
			if ((e.number & 0xFFFF) !== 70) {
				return pErr(e, 0,
						'開啟資料檔 [<green>' + FN + '<\/>] 時發生錯誤！'),
						6 === alert(
								'開啟資料檔 [' + FN + ']時發生不明錯誤，\n	是否中止執行？',
								0, ScriptName + ' 測試是否已開啟資料檔：發生不明錯誤！',
								4 + 48) ? 1 : 0;
			}
			if (2 === WshShell.Popup(
					'★資料檔：\n\	' + FN + '\n	無法寫入！\n\n可能原因與解決方法：\n	①資料檔已被開啟。執行程式前請勿以其他程式開啟資料檔！\n	②資料檔被設成唯讀，請取消唯讀屬性。',
					0, ScriptName + '：資料檔開啟發生錯誤！', 5 + 48))
				return 2;
		}
	return 0;
};

_// JSDT:_module_
.
/**
 * 
 * @param {String}file_path
 *            file path
 * @param {Number|open_format}format
 *            open format, e.g., open_format.TristateUseDefault.<br />
 *            default: auto-detecting
 * @param {Number|IO_mode}IO_mode
 *            open I/O mode, e.g., IO_mode.ForAppending.<br />
 *            default: ForReading
 * @return
 */
open_template = function(file_path, format, IO_mode) {
	/**
	 * file
	 * @inner
	 * @ignore
	 */
	var F,
	/**
	 * file streams
	 * @inner
	 * @ignore
	 */
	Fs;
	if (!IO_mode)
		IO_mode = _.IO_mode.ForReading;
	if (!format)
		format = _.open_format.TristateUseDefault;// TristateTrue
	try {
		F = FSO.GetFile(file_path);
		//Fs=open_file(file_path,format,IO_mode);
		Fs = F.OpenAsTextStream(IO_mode, format);
	} catch (e) {
		// 指定的檔案不存在?
		pErr(e);
		// quit();
	}
	return Fs;
};

/**
 * 
 * @param {String}file_path
 *            file path
 * @param {Number|IO_mode}IO_mode
 *            open I/O mode, e.g., IO_mode.ForAppending.<br />
 *            default: ForReading
 * @param {Number|open_format}format
 *            open format, e.g., open_format.TristateUseDefault.<br />
 *            default: auto-detecting
 * @return
 */
//var openOut.f;	//	default format
function openOut(file_path,IO_mode,format){
 var OUT,OUTs,_f=openOut.f;
 if(!IO_mode)IO_mode=_.IO_mode.ForWriting;
 if(!format)format=_f==='string'&&_f?_f:_.open_format.TristateUseDefault;
 try{
  OUT=FSO.GetFile(file_path);
 }
 catch(e){try{
  //指定的檔案不存在
  var tmp=FSO.CreateTextFile(file_path,true);
  tmp.Close();
  OUT=FSO.GetFile(file_path);
 }catch(e){pErr(e);}}

 try{OUTs=OUT.OpenAsTextStream(IO_mode,format);}catch(e){pErr(e);}

 return OUTs;
}


// create link
// 2015/9/3
// link source (target), link file path
// https://msdn.microsoft.com/en-us/library/xsy6k3ys.aspx
function create_shortcut(from, to, options) {
	if (!/\\.(lnk|url)$/i.test(to))
		to += '.lnk';
	var WshShortcut = WshShell.CreateShortcut(to);
	if (library_namespace.is_Object(options))
		Object.assign(WshShortcut, options);
	WshShortcut.TargetPath = from;
	WshShortcut.Save();
	return WshShortcut;
}

_.create_shortcut = create_shortcut;


/*
	轉換捷徑, 傳回shortcut的Object. true path
	http://msdn2.microsoft.com/en-US/library/xk6kst2k.aspx
	http://yuriken.hp.infoseek.co.jp/index3.html
*/
var p;
//parse_shortcut[generateCode.dLK]='initialization_WScript_Objects';//,parseINI
function parse_shortcut(path,rtPath){
 if(typeof path!=='string')path='';
 else if(/\.(lnk|url)$/i.test(path)){
  var sc=WshShell.CreateShortcut(path),p=sc.TargetPath,_i;
  //	檔名有可能是不被容許的字元（不一定總是有'?'），這時只有.url以文字儲存還讀得到。
  if(/*(''+sc).indexOf('?')!=-1*/!p&&/\.url$/i.test(path)&&typeof parseINI==='function'){
   p=parseINI(path,0,1);
   sc={_emu:p};
   sc.TargetPath=(p=p.InternetShortcut).URL;
   for(_i in p)sc[_i]=p[_i];
/*
URL File Format (.url)	http://www.cyanwerks.com/file-format-url.html
[DEFAULT]
BASEURL=http://so.7walker.net/guide.php
[DOC#n(#n#n#n…)]
[DOC#4#5]
BASEURL=http://www.someaddress.com/frame2.html
[DOC_adjustiframe]
BASEURL=http://so.7walker.net/guide.php
ORIGURL=http://so.7walker.net/guide.php
[InternetShortcut]
URL=http://so.7walker.net/guide.php
Modified=50A8FD7702D1C60106
WorkingDirectory=C:\WINDOWS\
ShowCommand=	//	規定Internet Explorer啟動後窗口的初始狀態：7表示最小化，3表示最大化；如果沒有ShowCommand這一項的話則表示正常大小。
IconIndex=1	//	IconFile和IconIndex用來為Internet快捷方式指定圖標
IconFile=C:\WINDOWS\SYSTEM\url.dll
Hotkey=1601

Hotkey:
下面加起來: Fn 單獨 || (Fn || base) 擇一 + additional 擇2~3
base:
0=0x30(ASCII)
9=0x39(ASCII)
A=0x41(ASCII)
Z=0x5a(ASCII)
;=0xba
=
,
-
.
/
`=0xc0
[=0xdb
\
]
'=0xde

Fn:
F1=0x70
..
F12=0x7b

additional:
Shift=0x100
Ctrl=0x200
Alt=0x400

*/
   p=p.URL;
  }
  if(!rtPath)return sc;
  path=/^file:/i.test(p)?p.replace(/^[^:]+:\/+/,'').replace(/[\/]/g,'\\'):p;	//	/\.url$/i.test(path)?'':p;
 }
 return rtPath?path:null;
};

//filepath=OpenFileDialog();	基於安全，IE無法指定初始值或型態
//OpenFileDialog[generateCode.dLK]='IEA';
function OpenFileDialog() {
	var IE = new IEA, o;
	if (!IE.OK(1))
		return null;

	// value="'+dP+'"	useless
	IE.write('<input id="file" type="file" />');

	o = IE.getE('file');
	o.focus();
	o.click();
	o = o.value || null;

	// IE.setDialog(200,400).show(1);
	IE.quit();

	return o;
};


/**
 * 是否為檔案.
 * @param path	file path
 * @param create	create if not exist
 * @returns
 */
function is_file(path, create) {
	if (!path)
		return 0;
	/*
	if (typeof FSO == 'undefined')
		FSO = new ActiveXObject("Scripting.FileSystemObject");
	*/
	if (FSO.FileExists(path))
		return true;

	//	doesn't exist
	path = library_namespace.get_file_name(path);
	if (create)
		try {
			create = FSO.CreateTextFile(path, true);
			create.Close();
		} catch (e) {
		}
	return FSO.FileExists(path);
};

_// JSDT:_module_
.
is_file = is_file;

/**
 * 是否為目錄
 * @param path	file path
 * @param create	create if not exist
 * @returns	0:not folder, 1:absolute, 2:relative path
 */
function is_folder(path, create) {
	if (!path)
		return 0;
	if (FSO.FolderExists(path = turnToPath(path)))
		return is_absolute_path(path) ? 1 : 2;
	if (create)
		try {
			FSO.CreateFolder(path);
			return is_absolute_path(path) ? 1 : 2;
		} catch (e) {
		}
	return 0;
};

_// JSDT:_module_
.
is_folder = is_folder;


/**
 * get directory name of a path
 * @param folder_path
 * @param mode	0:path, 1:file name
 * @returns
 */
function get_folder(folder_path, mode) {
	if (typeof folder_path === 'object' && typeof folder_path.Path === 'string')
		if (typeof folder_path.IsRootFolder !== 'undefined')
			return folder_path.Path;
		else
			folder_path = folder_path.Path;
	if (typeof folder_path !== 'string')
		return '';
	//else if(/^[a-z]$/i.test(folder_path))folder_path+=':\\';

	// if(folder_path.slice(-1)!='\\')folder_path+='\\';
	var i = folder_path.lastIndexOf('\\');
	if (i === -1)
		i = folder_path.lastIndexOf('/');
	return i === -1 ? folder_path : mode ? folder_path.substr(i + 1) : folder_path.slice(0, i + 1);
};



/**
 * 取得下一個序號的檔名，如輸入pp\aa.txt將嘗試pp\aa.txt→pp\aa[pattern].txt
 * @param file_path	file path
 * @param begin_serial	begin serial
 * @param pattern	增添主檔名的模式，包含Ser的部分將被轉換為序號
 * @returns
 */
function getNextSerialFN(file_path, begin_serial, pattern) {
	if (!file_path)
		return;
	if (isNaN(begin_serial))
		if (!FSO.FileExists(file_path))
			return file_path;
		else
			begin_serial = 0;

	var i = file_path.lastIndexOf('.'), base, ext, Ser = ':s:';
	if (i == -1)
		base = file_path, ext = '';
	else
		// FSO.GetBaseName(filespec);FSO.GetExtensionName(path);FSO.GetTempName();
		base = file_path.slice(0, i), ext = file_path.substr(i);

	if (!pattern)
		pattern = '_' + Ser;
	i = pattern.indexOf(Ser);

	if (i == -1)
		base += pattern;
	else
		base += pattern.slice(0, i), ext = pattern.substr(i + Ser.length) + ext;

	for (i = begin_serial || 0; i < 999; i++)
		if (!FSO.FileExists(base + i + ext))
			return base + i + ext;

	return;
};


_// JSDT:_module_
.
/**
 * 將以 adTypeBinary 讀到的 2 bytes 一組之 ADO Stream binary data 資料轉換成可使用之 data。
 * 
 * @example
 * <code>
 * // 較安全的讀檔：
 * var text = translate_ADO_Stream_binary_data(read_file(file_path, 'binary'));
 * write_file(file_path, text, 'ISO-8859-1');
 * </code>
 * 
 * @param binary_data
 *            ADO Stream 來的 binary data
 * @param {Integer}[length]
 *            處理 length
 * @param {Integer}[type]
 *            是否為數字
 * @returns {String|Number}轉換過之資料
 * @see <a
 *      href="http://www.hawk.34sp.com/stdpls/dwsh/charset_adodb.html">Hawk&apos;s
 *      W3 Laboratory : Disposable WSH : 番外編：文字エンコーディングとADODB.Stream</a>
 * @_memberOf _module_
 */
translate_ADO_Stream_binary_data = function translate_ADO_Stream_binary_data(binary_data, length, type) {
	var _s = translate_ADO_Stream_binary_data, i = 0, charArray, value, DOM = _s.XMLDOM, position, text;

	// initialization
	if (!DOM)
		try {
			// 要素名は何でも良い
			DOM = _s.XMLDOM = new_COM("Microsoft.XMLDOM").createElement('tmp');
			DOM.dataType = 'bin.hex';
		} catch (e) {
			return;
		}

	if (binary_data !== 0)
		// binary data
		DOM.nodeTypedValue = binary_data, text = DOM.text, position = 0;
	else
		position = _s.position, text = _s.text;

	if ((length |= 0) < 1 || length > text.length / 2)
		length = text.length / 2;

	if (type) {
		for (value = 0; i < length; i++)
			value = 0x100 * value + parseInt(text.substr(position, 2), 16),
					position += 2;
		_s.position = position;
		return value;
	}

	if (library_namespace.is_debug()) {
		if (!(length > 0) || length !== parseInt(length))
			library_namespace.debug(position + ', ' + i + ' == 0 ~ length = '
					+ length + ', ' + text.slice(0, 8), 2);
	}

	// Error 5029 [RangeError] (facility code 10): 陣列長度必須是一有限的正整數
	charArray = new Array(parseInt(length));
	// 極慢！用 += 更慢。
	for (; i < length; i++)
		try {
			if (library_namespace.is_debug(2)) {
				if (i % 100000 === 0)
					library_namespace.debug(i, 2);
				if (i === 40)
					library_namespace.debug(String.fromCharCode(parseInt(text
							.substr(position, 2), 16))
							+ '\n' + charArray.join(''), 2);
			}

			charArray.push(String.fromCharCode(parseInt(text
					.substr(position, 2), 16))), position += 2;
			if (false)
				charArray[i] = String.fromCharCode((t.charCodeAt(i << 1) << 8)
						+ t.charCodeAt((i << 1) + 1));
		} catch (e) {
			e.description = 'translate_ADO_Stream_binary_data: 輸入了錯誤的資料:\n'
					+ e.description;
			throw e;
		}

	if (!binary_data)
		_s.position = position;

	return charArray.join('');
};

_// JSDT:_module_
.
/**
 * 轉換以 adTypeBinary 讀到的資料
 * @param	data	以 adTypeBinary 讀到的資料
 * @param	pos	position
 * @since	2007/9/19 20:58:26
 * @_memberOf	_module_
 */
Ado_binary = function(data, pos) {
	this.newDOM();

	if (typeof data === 'string') {
		if (!data || typeof library_namespace.get_file_path === 'function'
			&& !(data = library_namespace.get_file_path(data)))
			return;
		this.newFS(data);
		this.setPos(pos || 0);
	} else
		this.setData(data, pos);
};

_// JSDT:_module_
.
/**
 * @_memberOf	_module_
 */
Ado_binary.prototype = {
/**
 * 設定 data
 * 
 * @param data	binary data
 * @param pos
 * @return
 * @_memberOf	_module_
 */
setData : function(data, pos) {
	this.DOM.nodeTypedValue = data,// binary data
	this.bt = this.DOM.text;// binary text
	if (!this.AdoS)
		this.len = this.bt.length / 2;
	this.setPos(pos || 0);
},
setPos : function(p) {
	if (!isNaN(p)) {
		if (p < 0)
			p = 0;
		else if (p > this.len)
			p = this.len;
		this.pos = p;
	}
	return this.pos;
},
testLen : function(len) {
	if (!len || len < 0)
		len = this.len;
	if (this.pos + len > this.len)
		len = this.len - this.pos;
	return len;
},
/**
 * read data
 * @private
 * @param len	length
 * @return
 * @_memberOf	_module_
 */
readData : function(len) {
	this.AdoS.Position = this.pos;
	var _data = this.AdoS.Read(len);
	//	讀 binary data 用 'ISO-8859-1' 會 error encoding.
	this.setData(_data, this.AdoS.Position);
},
read : function(len) {
	var charArray = new Array(len = this.testLen(len)), _i = 0;
	this.readData(len);
	for (; _i < len; _i++) {
		try {
			charArray.push(String.fromCharCode(parseInt(this.bt
					.substr(2 * _i, 2), 16)));
			// charArray[i]=String.fromCharCode((t.charCodeAt(i<<1)<<8)+t.charCodeAt((i<<1)+1));
		} catch (e) {
			this.retErr(e);
		}
	}
	return charArray.join('');
},
readNum : function(len) {
	len = this.testLen(len);
	this.readData(len);
	var val = 0, _i = len;
	for (; _i > 0;) {
		try {
			val = 0x100 * val
			+ parseInt(this.bt.substr(2 * (--_i), 2), 16);
		} catch (e) {
			this.retErr(e);
		}
	}
	return val;
},
readHEX : function(len) {
	len = this.testLen(len);
	this.readData(len);
	return this.bt;
},
retErr : function(e) {
	e.description = 'Ado_binary: 輸入了錯誤的資料:\n' + e.description;
	throw e;
},
/**
 * @private
 * @return
 * @_memberOf	_module_
 */
newDOM : function() {
	this.DOM = null;
	//try{
	// 要素名は何でも良い.
	this.DOM = new_COM("Microsoft.XMLDOM").createElement('tmp' + Math.random());
	//}catch(e){return;}
	this.DOM.dataType = 'bin.hex';
},
/**
 * @private
 * @param {String}file_path
 *            file path
 * @return
 * @_memberOf	_module_
 */
newFS : function(file_path) {
	if (file_path)
		this.file_path = file_path;
	else if (!(file_path = this.file_path))
		return;
	this.AdoS = open_file(file_path, 'binary');
	if (library_namespace.is_type(this.AdoS, 'Error')) {
		return this.AdoS;
	}
	this.len = this.AdoS.Size;
},
/**
 * 實際上沒多大效用。實用解決法：少用 ADO_Stream.Write()
 * @return
 * @_memberOf	_module_
 */
renew : function() {
	this.bt = this.data = 0;
	this.newDOM();
	if (this.AdoS && this.file_path) {
		this.pos = this.AdoS.Position;
		this.AdoS.Close();
		this.AdoS = null;
		this.newFS();
	}
},
destory : function(e) {
	if (this.AdoS)
		this.AdoS.Close();
	this.AdoS = this.pos = this.bt = this.data = 0;
}
}; //	Ado_binary.prototype={


/*
//	速度過慢，放棄。
//open_file.returnADO=true;
function handle_binary(file_path,func,interval){
 var t,fs=open_file(file_path,'binary',ForReading);
 if(library_namespace.is_type(fs, 'Error'))return;
 if(!interval)interval=1;
 //alert(fs.size)
 while(!fs.EOS)
  if(func(translate_ADO_Stream_binary_data(fs.Read(interval))))return;
 func();
 fs.Close();
}
*/

/*	配合simple系列使用
http://thor.prohosting.com/~mktaka/html/utf8.html
http://www.andrewu.co.uk/webtech/comment/?703
http://www.blueidea.com/bbs/NewsDetail.asp?id=1488978
http://www.blueidea.com/bbs/NewsDetail.asp?GroupName=WAP+%BC%BC%CA%F5%D7%A8%C0%B8&DaysPrune=5&lp=1&id=1524739
C#	http://www.gotdotnet.com/team/clr/bcl/TechArticles/TechArticles/IOFAQ/FAQ.aspx
http://www.sqlxml.org/faqs.aspx?faq=2
http://www.imasy.or.jp/~hir/hir/tech/js_tips.html

ADODB.Stream	最大問題：不能append
http://msdn2.microsoft.com/en-US/library/ms808792.aspx
http://msdn.microsoft.com/library/en-US/ado270/htm/mdmscadoenumerations.asp
http://study.99net.net/study/web/asp/1067048121.html	http://www.6to23.com/s11/s11d5/20031222114950.htm
http://blog.csdn.net/dfmz007/archive/2004/07/23/49373.aspx
*/

/*	搬到前面
set_Object_value('AdoEnums','adTypeBinary=1,adTypeText=2'	//	StreamTypeEnum
+',adReadAll=-1,adReadLine=-2'	//	StreamReadEnum	http://msdn2.microsoft.com/en-US/library/ms806462.aspx
+',adSaveCreateNotExist=1,adSaveCreateOverWrite=2'	//	SaveOptionsEnum
+',adCR=13,adCRLF=-1,adLF=10'	//	LineSeparatorsEnum
,'int');
*/

/**
 * ADO Enumerated Constants.
 * @see
 * <a href="http://msdn.microsoft.com/en-us/library/ms807536" accessdate="2012/3/29 21:51">ADO Enumerated Constants</a>
 */
var AdoEnums = {
	adTypeBinary : 1,
	adTypeText : 2,
	adReadAll : -1,
	adReadLine : -2,
	adSaveCreateNotExist : 1,
	adSaveCreateOverWrite : 2,
	adCR : 13,
	adCRLF : -1,
	adLF : 10
};

/**
 * 簡易開檔函數。<br />
 * 會先嘗試以 ADO Stream 開檔，不成時則嘗試 FSO。<br />
 * 主要提供給 <a href="#read_file">read_file</a>, <a href="#write_file">write_file</a>
 * 使用。
 * 
 * @param {String}file_path
 *            file path
 * @param {Number|open_format}format
 *            open format, e.g., open_format.TristateUseDefault.<br />
 *            default: auto-detecting
 * @param {Number|IO_mode}IO_mode
 *            open I/O mode, e.g., IO_mode.ForAppending.<br />
 *            default: ForReading
 * 
 * @returns {Error}
 * @returns {ADO Stream}
 * @returns {FileSystemObject}
 * 
 * @_memberOf _module_
 * 
 * @since
 * 2012/3/29 22:45:19	重寫 open_file, read_file, write_file. 行為有所改變，與之前版本不相容!
 * 
 * @see <a
 *      href="http://msdn.microsoft.com/en-us/library/windows/desktop/ms675032.aspx"
 *      accessdate="2012/3/29 18:19" title="Stream Object (ADO)">ADO Stream</a>,<br />
 *      <a href="http://msdn.microsoft.com/en-us/library/6kxy1a51.aspx"
 *      accessdate="2012/3/29 18:21" title="FileSystemObject">FSO</a>
 */
function open_file(file_path, format, IO_mode) {
	if (false) {
		if (!file_path || _.is_absolute_path && library_namespace.get_file_path
				&& !_.is_absolute_path(file_path)
				&& !(file_path = library_namespace.get_file_path(file_path)))
			return new Error('Unknown file!');
	}
	if (!file_path && library_namespace.get_file_path)
		file_path = library_namespace.get_file_path(file_path);

	if (file_path && typeof format === 'undefined' && library_namespace.guess_encoding)
		format = library_namespace.guess_encoding(file_path);

	var file_stream, reset = function() {
		//	所有用完的 handle 皆應經過這樣的處理。
		try {
			file_stream && file_stream.Close();
		} catch (e) {
			// TODO: handle exception
		}
		file_stream = null;
	};

	if (isNaN(format)) {
		try {
			// ASPの場合, Err.Number=-2147221005表不支援.
			file_stream = new_COM("ADODB.Stream");
		} catch (e) {
			library_namespace.error(e);
			return e;
		}

		// read write
		// file_stream.Mode=3;
		if (format === 'binary')
			// 以二進位方式操作
			file_stream.Type = AdoEnums.adTypeBinary;
		else {
			file_stream.Type = AdoEnums.adTypeText;
			try {
				//library_namespace.debug('Set Charset [' + format + '] [' + file_path + ']', 2);
				file_stream.Charset = format in open_file.OS_alias ? open_file.OS_alias[format] : format;
			} catch (e) {
				/**
				 * UTF-8, unicode, Shift_JIS, Big5, GB 2312, ascii=ISO-8859-1,
				 * _autodetect, _autodetect_all ..<br />
				 * 
				 * @see HKEY_CLASSES_ROOT\MIME\Database\Charset
				 */
				library_namespace.debug('Illegal file format to open: (' + typeof format + ') [' + format + ']', 1, 'open_file');
				library_namespace.error(e);
				reset();
				return e;
			}
		}

		if (IO_mode === _.IO_mode.ForAppending && !FSO.FileExists(file_path))
			// 無此檔時改 writing。
			IO_mode = _.IO_mode.ForWriting;
		if (false && IO_mode === _.IO_mode.ForWriting)
			// truncate file
			file_stream.SetEOS();

		file_stream.Open();

		// file_stream.Position = 0;
		// file_stream.LineSeparator = AdoEnums.adLF;
		if (file_path && FSO.FileExists(file_path))
			try {

				// library_namespace.debug('Load [' + file_path + ']', 2);
				file_stream.LoadFromFile(file_path);
			} catch (e) {
				library_namespace.debug('ADO Stream error.', 1, 'open_file');
				library_namespace.error(e);
				reset();
				return e;
			}

		if (IO_mode === _.IO_mode.ForAppending)
			// 因為 appending，將指標設至檔尾。
			file_stream.Position = file_stream.Size;
		// else: assert: file_stream.Position === 0

	} else {
		if (!file_path)
			return new Error('No file path specified!');

		// 使用某些防毒軟體(如諾頓 Norton)時，.OpenTextFile() 可能會被攔截，因而延宕。
		try {
			if (IO_mode === _.IO_mode.ForAppending && !FSO.FileExists(file_path))
				// 無此檔時改 writing.
				IO_mode = _.IO_mode.ForWriting;

			file_stream = FSO.OpenTextFile(file_path, IO_mode
					|| _.IO_mode.ForReading,
			// writing 則自動 create.
			IO_mode === _.IO_mode.ForWriting,
					format === _.open_format.TristateTrue
							|| format === _.open_format.TristateFalse ? format
							: _.open_format.TristateUseDefault);
		} catch (e) {
			library_namespace.error(e);
			reset();
			return e;
		}

	}

	return file_stream;
}

//	character encoding used in guess_encoding.mapping : character encoding name used in OS.
//	TODO: 與 guess_encoding.OS_alias 統合。
open_file.OS_alias = {
	'GB 2312' : 'GB2312'
};


/**
 * 讀取檔案。
 * 
 * @param {String}file_path
 *            file path
 * @param {Number|open_format}format
 *            open format, e.g., open_format.TristateUseDefault.<br />
 *            default: auto-detecting
 * @param {Number|IO_mode}IO_mode
 *            open I/O mode, e.g., IO_mode.ForAppending.<br />
 *            default: ForReading
 * @param {Function}line_handle
 *            TODO: do this function per line, or use [line_handle, maxsize]
 * 
 * @return {String} 檔案內容
 * @returns {Error}
 * 
 * @_memberOf _module_
 */
function read_file(file_path, format, IO_mode, line_handle) {
	var contents, file_stream = open_file(file_path, format, IO_mode
			|| _.IO_mode.ForReading);

	if (library_namespace.is_type(file_stream, 'Error')) {
		return file_stream;
	}

	if (false) {
		// TODO
		if (Array.isArray(line_handle))
			s = line_handle[1], line_handle = line_handle[0];
	}

	try {
		//library_namespace.debug('is_ADO_Stream: ' + is_ADO_Stream(file_stream), 2);
		if (is_ADO_Stream(file_stream)) {
			//library_namespace.debug('Type [' + file_stream.Type + ']', 2);
			if (file_stream.Type === AdoEnums.adTypeBinary) {
				// 讀 binary data 用 'ISO-8859-1' 會 error encoding.
				contents = file_stream.Read(AdoEnums.adReadAll);
				//	此時 IO_mode === true 表示不將 binary data 轉換為 String!
				if (!IO_mode)
					contents = translate_ADO_Stream_binary_data(contents);
			} else if (line_handle) {
				while (!file_stream.EOS)
					line_handle(file_stream.ReadText(AdoEnums.adReadLine));
				if (false)
					while (!file_stream.EOS) {
						for ( var t = '', i = 0; !file_stream.AtEndOfStream
								&& (!t || i < s); i++)
							t += file_stream.ReadText(AdoEnums.adReadLine);
						contents += line_handle(t);
					}

			} else
				contents = file_stream.ReadText(AdoEnums.adReadAll);

			file_stream.Close();

		} else {
			// FSO
			if (line_handle) {
				while (!file_stream.AtEndOfStream)
					line_handle(file_stream.ReadLine());
				if (false)
					while (!file_stream.AtEndOfStream) {
						for (t = '', i = 0; !file_stream.AtEndOfStream
								&& (!t || i < s); i++)
							t += file_stream.ReadLine();
						contents += line_handle(t);
					}

			} else
				contents = file_stream.ReadAll();

			file_stream.Close();

		}
	} catch (e) {
		try {
			file_stream.Close();
		} catch (e) {
		}
		file_stream = null;
		return e;
	}

	return contents;
}

/**
 * 將 contents 寫入 file。<br />
 * WARNING: ADODB.Stream does not support appending!
 * 
 * @param {String}file_path
 *            file path
 * @param {String}contents
 *            內容. contents to write.
 * @param {Number|open_format}format
 *            open format, e.g., open_format.TristateUseDefault.<br />
 *            default: auto-detecting
 * @param {Number|IO_mode}IO_mode
 *            open I/O mode, e.g., IO_mode.ForAppending.<br />
 *            default: ForWriting
 * @param {Boolean}no_overwrite
 *            DO NOT overwrite
 * 
 * @return {Error}error message.
 * 
 * @_memberOf _module_
 */
function write_file(file_path, contents, format, IO_mode, no_overwrite) {
	//	以內容判斷 encoding.
	if (typeof format === 'undefined' && !is_file(file_path)) {
		format = /^[\x20-\x7e\t\r\n]*$/.test(contents)
		? _.open_format.TristateUseDefault : _.open_format.TristateTrue;
	}

	var file_stream = open_file(file_path, format, IO_mode
			|| _.IO_mode.ForWriting);
	if (library_namespace.is_type(file_stream, 'Error')) {
		return file_stream;
	}

	try {
		if (is_ADO_Stream(file_stream)) {
			if (file_stream.Type === AdoEnums.adTypeText) {
				if (typeof format === 'string' && format.toUpperCase() === 'ASCII' && /\.js(?:on)?$/i.test(file_path)) {
					contents = contents.replace(/[^\u0000-\u00ff]/g, function(character) {
						character = character.charCodeAt(0).toString(16);
						while (character.length % 4 !== 0)
							character = '0' + character;
						return '\\u' + character;
					});
				}
				file_stream.WriteText(contents);
			} else {
				file_stream.Write(contents);
			}

			// 設定 end of the stream 後，將 truncate 之後的內容。
			// http://msdn.microsoft.com/en-us/library/windows/desktop/ms676745.aspx
			library_namespace.debug('設定 end of the stream from: ' + file_stream.Position + '/' + file_stream.Size + ', EOS:' + file_stream.EOS, 2);
			//file_stream.Position = file_stream.Size;
			// .SetEOS() 不能傳入 arguments，只能直接將當前 .Position 作為 EOS。
			file_stream.SetEOS();
			// assert: file_stream.Position === file_stream.Size && file_stream.EOS === true
			library_namespace.debug('設定 end of the stream to: ' + file_stream.Position + '/' + file_stream.Size + ', EOS:' + file_stream.EOS, 3);
			library_namespace.debug('Writing ' + contents.length + ' characters / file: ' + file_stream.Size + ' bytes to (' + format + ') [<a href="' + file_path + '">' + file_path + '</a>]');

			// .SaveToFile() 須在 .Write 之後！
			file_stream.SaveToFile(file_path, AdoEnums.adSaveCreateOverWrite);
			file_stream.Close();

		} else {
			file_stream.Write(contents);
			file_stream.Close();
		}

	} catch (e) {
		try {
			file_stream.Close();
		} catch (e) {
		}
		file_stream = null;
		if (e.number & 0xFFFF === 5)
			// for FSO
			library_namespace.debug('contents 中有此 locale 無法相容的字元，例如在中文 Big5 中寫入日文假名。');
		return e;
	}
}



_// JSDT:_module_
.
AdoEnums = AdoEnums;

_// JSDT:_module_
.
open_file = open_file;

_// JSDT:_module_
.
read_file = read_file;

_// JSDT:_module_
.
write_file = write_file;



//	TODO: unfinished
//simpleDealFile[generateCode.dLK]='guess_encoding,read_file,write_file';
_// JSDT:_module_
.
simpleDealFile = function(inFN, func, outFN, format, IO_mode, N_O) {
	if (!inFN)
		return;
	if (!outFN)
		outFN = inFN;
	var e = library_namespace.guess_encoding(inFN), i = read_file(inFN, e), o = read_file(
			outFN, e), t = func(i, inFN);
	if (typeof t === 'string' && o !== t)
		return write_file(outFN, t, e, N_O);
};



/*	將 ISO-8859-1 轉成UTF-8
To use:
..
translated=turnBinStr(original);
..
translated=turnBinStr();	//	delete temp file
*/
turnBinStr.temp_file = 'turnBinStr.tmp'; // temp file name
function turnBinStr(t, _enc) {
	if (typeof t !== 'undefined') {
		if (!turnBinStr.tmpF)
			turnBinStr.tmpF = library_namespace.get_file_path(turnBinStr.temp_file, 1);

	//t+='';
	//if(t.replace(/[^\x00-\x7f]+/g,''))return t;
	//var _q=t.replace(/[^?]+/g,'').length,_t,_j=0;
	var error = write_file(turnBinStr.tmpF,''+t,'ISO-8859-1');
	//alert(turnBinStr.tmpF+'\n'+error.description+'\n'+t+'\n'+read_file(turnBinStr.tmpF,'UTF-8'));
	return read_file(turnBinStr.tmpF,'UTF-8');
/*
  if(!_enc)_enc='UTF-8,Big5,Shift_JIS,EUC-JP,GB 2312'.split(',');
  else if(!Array.isArray(_enc))_enc=[_enc];
  for(;_j<_enc.length;_j++)
   if((_t=read_file(turnBinStr.tmpF,_enc[_j])).replace(/[^?]+/g,'').length==_q)
    return _t;//'['+_enc[_j]+']'+
  return t;
*/
	}
	// 有時會出錯
	try {
		FSO.DeleteFile(turnBinStr.tmpF);
	} catch (e) {
	}
}

//----------------------------------------------------------------------------------------------------------------------------------------------------------//


/*
in UNIX:
iconv -l
iconv -c -f UTF-16 -t BIG5-HKSCS function.js

*/
_// JSDT:_module_
.
/**
 * 將編碼為fromCode之檔案fileName中所有不合編碼toCode之char以encodeFunction轉換
 * @param fileName
 * @param toCode
 * @param fromCode
 * @param encodeFunction
 * @return
 * @_memberOf	_module_
 */
iconv_file = function(fileName, toCode, fromCode, encodeFunction) {
	return iconv(read_file(fileName, fromCode), toCode,
			encodeFunction);
};

_// JSDT:_module_
.
/*	將string text中所有不合編碼toCode之char以encodeFunction轉換
convert string encoding<br />

CeL.iconv('測試每個字元 abc あaいiうuえeおo','Big5')

TODO:
一次寫入多 bytes
*/
iconv = function(text, toCode, encodeFunction) {
	if (!text)
		return '';

	// alert('iconv: ['+toCode+']\n'+text.slice(0,200));
	if (/utf-?(8|16([bl]e)?)/i.test(toCode))
		//	skip Unicode
		return HTMLToUnicode(text, 1);

	var ADO_Stream = open_file(0, toCode);
	if (library_namespace.is_type(ADO_Stream, 'Error')) {
		library_namespace.error('error occurred: ' + ADO_Stream.message);
		return text;
	}

	// ADO_Stream.Type=AdoEnums.adTypeText;
	if (!encodeFunction)
		encodeFunction =
			// typeof toHTML ==='function' ? totoHTML:
			function(t) {
				return '\\u' + t.charCodeAt(0);
			};

	var charToSet, i = 0, t = '';
	//	測試每個字元
	for (; i < text.length; i++)
		try {
			charToSet = text.charAt(i);
			if (charToSet.charCodeAt(0) < 256) {
				//	對於 code 過小的，直接匯入以增加速度。
				t += charToSet;
				continue;
			}
			ADO_Stream.Position = 0;
			ADO_Stream.WriteText(charToSet);
			ADO_Stream.Position = 0;
			t += charToSet === ADO_Stream.ReadText(AdoEnums.adReadAll) ? charToSet
					: encodeFunction(charToSet);
		} catch (e) {
			t += encodeFunction(charToSet);
		}

	try {
		ADO_Stream.Close();
	} catch (e) {
	}
	ADO_Stream = null;
	return t;
};



//---------------------------------------------------


/*
var driverProperty,folderProperty,fileProperty;
set_Object_value('driverProperty','AvailableSpace,DriveLetter,DriveType,FileSystem,FreeSpace,IsReady,Path,RootFolder,SerialNumber,ShareName,TotalSize,VolumeName',1,set_Object_valueFlag.array);
set_Object_value('folderProperty','Attributes,DateCreated,DateLastAccessed,DateLastModified,Drive,Name,ParentFolder,Path,ShortName,ShortPath,Size,Type,Files,IsRootFolder,SubFolders',1,set_Object_valueFlag.array);//Files起為Folder property
fileProperty=folderProperty.slice(0,12);//folderProperty.sort();
*/


//var kkk='';_.traverse_file_system(function(fileItem,itemType){kkk+=(itemType==_.traverse_file_system.f.driver?fileItem.DriveLetter+':('+fileItem.VolumeName+')':fileItem.Name+(itemType==_.traverse_file_system.f.folder?path_separator:''))+'\n';},'I:\\Documents and Settings\\kanashimi\\My Documents\\kanashimi\\www\\cgi-bin\\program');write_file('tmp.txt',kkk,'unicode');
/*

_.traverse_file_system(FS_function_array)	省略path會當作所有Drives
_.traverse_file_system(FS_function_array,'c:')	c:→c:\→sub dir of c:\
_.traverse_file_system(FS_function_array,'c:\\')	c:\→sub dir of c:\
_.traverse_file_system(FS_function_array,'c:\\cc')	c:\cc,cc為dir→sub dir of c:\cc\
_.traverse_file_system(FS_function_array,'c:\\cc\\')	c:\cc\→sub dir of c:\cc\
_.traverse_file_system(FS_function_array,['c:\\cc\\','d:\\dd'])	c:\cc\→sub dir of c:\cc\→d:\dd→sub dir of d:\dd
_.traverse_file_system([,folderFunction],'.');


_.traverse_file_system([,folderFunction],basePath);
function folderFunction(folderItem){
 t=folderItem.Path.slice(same_length(basePath,folderItem.Path));
 //if(t==folderItem.Name)	//	僅單層subdir次目錄
 //if(t.indexOf(path_separator)==t.lastIndexOf(path_separator))	//	僅單層及次層subdir次目錄
 if(t.replace(new RegExp('[^'+path_separator_pattern+']','g'),'').length<3)	//	僅3層subdir以下
  ;
}


//	itemType=0:file/1:folder/2:driver
function FSOFunction(fsi,itemType){if(!itemType){}}
function fileFunction(fileItem){}
function folderFunction(folderItem){}
function driverFunction(driverItem){}

filter:
	file_filter	僅單一 filter 時預設當作 file_filter, should has NO global flag.
	[file_filter,folder_filter]
file_filter	篩選檔案, should has NO global flag.
folder_filter	篩選資料夾, should has NO global flag.



TODO:
限定traverse深度幾層,sort=8,preOrder=0,widthFirst=0,postOrder=16,depthFirst=16
*/
//_.traverse_file_system.stop=false;

//_.traverse_file_system[generateCode.dLK]='initialization_WScript_Objects';
/**
 * 巡覽 file system 的公用函數
 * @param FS_function_array	file system handle function array
 * @param path	target path
 * @param filter	filter
 * @param flag	see <a href="#.traverse_file_system.f">flag</a>
 * @return
 * @deprecated	以 data.file.file_system_structure 代替
 * @_memberOf	_module_
 * @see	<a href="http://msdn.microsoft.com/library/en-US/script56/html/0fa93e5b-b657-408d-9dd3-a43846037a0e.asp">FileSystemObject</a>
 */
function traverse_file_system(FS_function_array, path, filter, flag) {
	var _s = _.traverse_file_system, _f = _s.f, callback, callback_timeout;

	if (arguments.length === 3) {
		if (library_namespace.is_Object(filter)) {
			callback = filter.callback;
			callback_timeout = filter.callback_timeout;
			flag = filter.flag;
			filter = filter.filter;
		}
	} else if (typeof flag === 'function') {
		callback = flag;
		flag = undefined;
	} else if (library_namespace.is_Object(flag)) {
		callback = flag.callback;
		callback_timeout = flag.callback_timeout;
		flag = flag.flag;
	}

	// initial
	// 預設 flag
	// if(isNaN(flag))flag=_f.traverse;

	//library_namespace.log('traverse_file_system:\n[' + path + ']');
	if (FS_function_array === _f.get_object)
		// or FS_function_array=[,,]:	可以使用 Array 常值中的空白元素來建立零星稀疏的陣列。
		FS_function_array = new Array(_f.func_length),
		flag = _f.get_object;
	else {
		/*
		if (Array.isArray(FS_function_array) && FS_function_array.length === 1)
			FS_function_array = FS_function_array[0];
		*/
		if (typeof FS_function_array === 'function') {
			var i = FS_function_array;
			FS_function_array = [ i, i, i ];
		}
	}
	//library_namespace.log('traverse_file_system: FSO:\n[' + FSO + ']');
	if (typeof FSO !== 'object' || !Array.isArray(FS_function_array)
			|| !FS_function_array.length)
		return;
	//library_namespace.log('traverse_file_system: FS_function_array:\n[' + FS_function_array + ']');
	if (!filter)
		filter = [];
	else if (library_namespace.is_RegExp(filter))
		// filter=[filter,filter]; 通常我們輸入的只會指定 file filter
		filter = [ filter, ];
	else if (typeof filter !== 'object')
		filter = [ filter, ];

	//library_namespace.log('traverse_file_system: FS_function_array:\n[' + FS_function_array + ']');
	var item, iType, fc, i, traverse = !(flag & _f.no_traverse), objBuf = [], typeBuf = [], folder_filter = filter[1],
	//
	testFilter = function(f) {
		try {
			// library_namespace.is_RegExp(f)
			f.test('');
		}
		catch (e) {
			throw new Error(e.number,'traverse_file_system: 錯誤的 filter:\n'+f+'\n'+e.description);

			e.description = 'traverse_file_system: 錯誤的 filter:\n' + f + '\n'
			+ e.description;
			throw e;
		}
	};
	if (filter = filter[0])
		if (typeof filter === 'string')
			filter = new RegExp(filter);
		else
			testFilter(filter);
	if (folder_filter)
		if (typeof folder_filter === 'string')
			folder_filter = new RegExp(folder_filter);
		else
			testFilter(folder_filter);
	// if(flag!=_f.get_object)alert(filter+'\n'+folder_filter);
	// 至此 filter 代表 file_filter, vs. folder_filter


	// 轉換輸入之各項成 FSO object
	if (!path) { // 取得各個driver code
		if (flag === _f.get_object)
			return;
		for ( var drivers = new Enumerator(FSO.Drives); !drivers.atEnd(); drivers.moveNext())
			objBuf.push(drivers.item()), typeBuf.push(_f.driver);
		objBuf.reverse(), typeBuf.reverse();
	} else if (typeof path === 'object')
		if (path.length) {
			for (i = 0; i < path.length; i++)
				if (item = _s(_f.get_object,
						'' + path[i], filter, flag))
					objBuf.push(item[0]), typeBuf.push(item[1]);
		} else {
			item = typeof path.IsReady !== 'undefined' ? _f.driver
					: typeof path.IsRootFolder !== 'undefined' ? _f.folder
							: typeof path.Path !== 'undefined' ? _f.file
									: _f.NULL;
			if (_f.NULL !== -1)
				objBuf.push(path), typeBuf.push(item);
		}
	else {
		i = true; // fault
		if (i)
			try {
				// FSO.FolderExists()
				objBuf.push(FSO.GetFolder(path));
				//library_namespace.debug('Adding '+path+'\\');
				typeBuf.push(_f.folder);
				i = false;
			} catch (e) {
			}
		if (i)
			try {
				// FSO.FileExists()
				objBuf.push(FSO.GetFile(path));
				//library_namespace.debug('Adding '+path);
				typeBuf.push(_f.file);
				i = false;
			} catch (e) {
			}
		if (i && path === FSO.GetDriveName(path))
			try {
				objBuf.push(FSO.GetDrive(path));
				//library_namespace.debug('Adding '+path+':');
				typeBuf.push(_f.driver);
				i = false;
			} catch (e) {
			}
	}
	if (flag === _f.get_object)
		return objBuf[0] ? [ objBuf[0], typeBuf[0] ] : 0;

	// FS_function_array.length=_f.func_length;
	for (i = 0; i < _f.func_length; i++)
		// 可以安排僅對folder或是file作用之function
		if (typeof FS_function_array[i] !== 'function')
			FS_function_array[i] = function() {};

	//library_namespace.debug(objBuf.length+','+typeBuf.length+'\n'+typeBuf);
	// main loop
	while (!_s.stop && objBuf.length)
		if (item = objBuf.pop()) // FSOFunction執行途中可能將此項目刪除
			switch (iType = typeBuf.pop()) {
			case _f.folder:
				if (!folder_filter || folder_filter.test(item.Name))
					FS_function_array[iType](item, iType);
				// if(traverse||traverse!==0){
				// if(!traverse)traverse=0; // 加上次一層: 會連這次一層之檔案都加上去。
				for (fc = new Enumerator(item.SubFolders); !fc.atEnd(); fc.moveNext())
					if (i = fc.item(), !folder_filter || folder_filter.test(i.Name)){
						//library_namespace.debug('Adding '+i.Path+'\\');
						if (traverse)
							objBuf.push(i), typeBuf.push(_f.folder);
						else
							FS_function_array[_f.folder](i, _f.folder);
					}
				// }
				// try 以防item已經被刪除
				try {
					fc = new Enumerator(item.Files);
				} catch (e) {
					fc = 0;
				}
				if (fc) {
					// for(;!fc.atEnd();fc.moveNext())if(i=fc.item(),!filter||filter.test(i.Name))FS_function_array[_f.file](i,_f.file);
					// 因為檔案可能因改名等改變順序，因此用.moveNext()的方法可能有些重複，有些漏掉未處理。
					for (item = []; !fc.atEnd(); fc.moveNext())
						item.push(fc.item());
					item.forEach(function(o) {
						if (!filter || filter.test(o.Name))
							//library_namespace.debug('Dealing '+o.Path),
							FS_function_array[_f.file](o, _f.file);
					});
				}
				break;
			case _f.file:
				if (!filter || filter.test(item.Name))
					FS_function_array[iType](item, iType);
				break;
			case _f.driver:
				if (!item.IsReady)
					break;
				FS_function_array[iType](item, iType);
				if (traverse)
					objBuf.push(item.RootFolder), typeBuf.push(_f.folder);
				// break;
				//default:break;
			}

	if (callback)
		if (Number.isInteger(callback_timeout) && callback_timeout > 0)
			setTimeout(function() {
				callback();
			}, callback_timeout);
		else
			callback(path);
};

_// JSDT:_module_
.
traverse_file_system = traverse_file_system;


//set_Object_value('traverse_file_system.f','get_object=-2,NULL=-1,file,folder,driver,func_length,traverse=0,no_traverse=4',1);//,sort=8,preOrder=0,widthFirst=0,postOrder=16,depthFirst=16
_// JSDT:_module_
.
/**
 * <a href="#.traverse_file_system">traverse_file_system</a> 的 flag enumeration
 * @_memberOf	_module_
 * @constant
 */
traverse_file_system.f =
traverse_file_system.f = {
		/**
		 * return object
		 * @_memberOf	_module_
		 */
		get_object : -2,
		/**
		 * null flag
		 * @private
		 * @_memberOf	_module_
		 */
		NULL : -1,
		/**
		 * 用於指示 file
		 * @private
		 * @_memberOf	_module_
		 */
		file : 0,
		/**
		 * 用於指示 folder
		 * @private
		 * @_memberOf	_module_
		 */
		folder : 1,
		/**
		 * 用於指示 driver
		 * @private
		 * @_memberOf	_module_
		 */
		driver : 2,
		/**
		 * handle function 應有的長度
		 * @private
		 * @_memberOf	_module_
		 */
		func_length : 3,
		/**
		 * 深入下層子目錄及檔案
		 * @_memberOf	_module_
		 */
		traverse : 0,
		/**
		 * 不深入下層子目錄及檔案
		 * @_memberOf	_module_
		 */
		no_traverse : 4
};


// ------------------------------------------------------------------------- //
//	應用功能

//	send in file manager, list/open by file manager. 檔案管理器/文件管理器.
//	Windows 檔案總管檢視. Views in Windows Explorer.
//	http://support.microsoft.com/kb/307856
//	Windows 檔案總管的命令列參數
//	http://support.microsoft.com/kb/130510
_// JSDT:_module_
.
show_in_file_manager = function(path) {
	if (FSO.FileExists(path) || FSO.FolderExists(path))
		//	若不存在，會 popup。
		WshShell.Run('EXPLORER.EXE /select,"' + path + '"', 1, 1);
	else
		library_namespace.warn('Path not found: [' + path + ']');
};


//	配合 CeL.DOM.new_node() 使用。
function path_tag(path, handler) {
	if (typeof path === 'string' && path) {
		var tag = {
			// show file name.
			a : path.replace(/^.+[\\\/]([^\\\/]+)$/, '$1'),
			href : '#',
			// file path.
			title : path,
			C : 'path_tag',
			D : {
				path : path
			}
		};

		if (!handler)
			handler = _.show_in_file_manager;
		if (typeof handler === 'function') {
			tag.onclick = function() {
				handler(this.dataset.path);
				return false;
			};
		}

		return tag;
	}
}

//	default handler(path)
path_tag.handler = _.show_in_file_manager;

_.path_tag = path_tag;




// ------------------------------------------------------------------------- //
//interact

/**
 * 小型檔案瀏覽器。
 * 
 * @param {String}path
 *            瀏覽路徑。
 * 
 * @returns
 * 
 * @since 2011/12/26 11:25:04<br />
 *        2012/11/7 23:40:15 add file list.<br />
 *        2012/11/12 0:35:50 refactoring 重構 for sub function.<br />
 *        2012/11/12 17:48:34 置入 CeL.application.OS.Windows.file.
 */
function show_path(path) {
	if (!show_path.panel) {
		library_namespace.warn('請先設定好 panel: using show_path.set_panel()。', 2,
				'show_path');
		return;
	}

	if (!path)
		return;

	if (!is_absolute_path(path) && show_path.last_path)
		path = show_path.last_path + library_namespace.env.path_separator
				+ path;

	working_path = show_path.last_path = path = library_namespace
			.simplify_path(path);
	library_namespace.debug('path: [' + path + ']', 2, 'show_path');

	var path_array = path.split(library_namespace.env.path_separator),
	//
	i = 0, l = path_array.length, show_path_array = [], full_path = '', handler = show_path.handler,
	//
	count = {},
	//
	icon_base = library_namespace.get_module_path(module_name, 'icon')
		+ library_namespace.env.path_separator,
	//
	get_icon = function(file_name, is_file) {
		var icon_name, extension;
		if (is_file) {
			if (extension = file_name.match(/\.([^.]+)$/))
				extension = extension[1].toLowerCase();
			switch (extension) {
			case 'rar':
				icon_name = 'file_rar';
				break;
			case 'zip':
				icon_name = 'file_zip';
				break;
			case '7z':
				icon_name = 'file_7z';
				break;
			default:
				icon_name = 'file';
				break;
			}
		} else {
			icon_name = 'directory';
		}
		return icon_base + icon_name + '.png';
	},
	//
	add_FSO = function(FSO, info) {
		// library_namespace.debug(FSO.Path,2,'show_path.add_FSO');
		if (!info.is_file
				&& (FSO.Path === full_path || FSO.Path
						+ library_namespace.env.path_separator === full_path))
			return;

		var i, tag = info.is_file ? 'file' : 'directory', nodes = [],
		//
		this_handler = handler[tag],
		// directory / file 最基本的圖示與名稱顯示。
		add_main_item = function() {
			// directory / file 最基本的圖示與名稱顯示。
			i = {
				a : [
						{
							img : null,
							src : get_icon(FSO.Name, info.is_file),
							title : tag
									+ ' '
									+ (tag in count ? ++count[tag]
											: (count[tag] = 1)),
							C : 'icon'
						},
						// &nbsp;
						'\u00A0', FSO.Name ],
				href : '#'
			};

			// FSO 之 main handler.
			if (typeof this_handler[show_path.default_name] === 'function')
				i.onclick = show_path.run_function;

			nodes.push(i);
		};

		if (!(show_path.default_name in this_handler))
			// 當沒設定時，首先顯示。
			add_main_item();

		// FSO 之 sub function。
		for (i in this_handler) {
			if (i === show_path.default_name)
				add_main_item();
			else
				nodes.push(' ', {
					a : i.replace(/:.+$/, ''),
					title : i,
					href : '#',
					onclick : show_path.run_function,
					// sub function keyword.
					C : 'sub_function'
				});
		}

		// FSO 之外框。
		show_path_array.push({
			div : nodes,
			C : tag,
			D : {
				full_path : full_path + FSO.Name,
				// directory, file
				type : tag
			}
		});
	};

	// 準備開始顯示 navigation。
	library_namespace.remove_all_child(show_path.panel);
	// navigation。
	for (; i < l; i++)
		if (path_array[i]) {
			full_path += path_array[i] + library_namespace.env.path_separator;
			// use <a
			// href="http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#dom-dataset"
			// accessdate="2011/12/26 11:15">dataset</a>
			show_path_array.push({
				a : path_array[i],
				href : '#',
				title : full_path,
				onclick : show_path.do_navigation,
				D : {
					full_path : full_path
				},
				C : FSO.FolderExists(full_path) ? '' : 'not_exists'
			}, library_namespace.env.path_separator);
		}
	library_namespace.debug('full path: [' + full_path + ']', 1, 'show_path');
	show_path.full_path = full_path;

	// navigation 之 sub function。
	for (i in handler.navigation) {
		show_path_array.push(' ', {
			a : i.replace(/:.+$/, ''),
			title : i,
			href : '#',
			onclick : show_path.run_function,
			C : 'sub_function'
		});
	}

	// navigation 之外框。
	show_path_array = [ {
		div : show_path_array,
		//title : path,
		C : 'show_path_navigation',
		D : {
			full_path : full_path,
			type : 'navigation'
		}
	} ];

	new file_system_structure(path, {
		// 僅子目錄與所包含的檔案。
		depth : 1,
		folder_first : true,
		callback : add_FSO
	});

	// 插入節點。
	library_namespace.new_node({
		div : show_path_array,
		C : 'show_path'
	}, show_path.panel);

	// 設定顯示出來。
	library_namespace.toggle_display(show_path.panel, 1);
}

/**
 * 執行 navigation 功能。
 */
show_path.do_navigation = function() {
	var data = library_namespace.DOM_data(this);
	show_path(data.full_path);
	return false;
};
/**
 * 執行 directory, file 與 navigation 之 sub function。
 */
show_path.run_function = function() {
	var data = library_namespace.DOM_data(this.parentNode);
	show_path.handler[data.type][library_namespace.has_class(this,
			'sub_function') ? this.title : ''](data.full_path);
	return false;
};

/**
 * FSO 之 default handler。
 * 
 * @param {String}path
 *            FSO 路徑。
 * 
 * @returns {Boolean} 因為通常放在 onclick 中，因此 return false。
 */
show_path.default_handler = function(path) {
	library_namespace.show_in_file_manager
			&& library_namespace.show_in_file_manager(path);
	return false;
};

/**
 * 當 show_path.handler 遇到 show_path.default_name 時，會作為此 FSO 之 default handler
 * name。
 */
show_path.default_name = '';
/**
 * user handler.
 */
show_path.handler = {
	// 導航條/navigation bar handler
	navigation : {},
	// folder
	directory : {},
	file : {}
};

// setup default handler.
// →:進入此子目錄
show_path.handler.directory[show_path.default_name] = show_path;
if (show_path.default_handler)
	show_path.handler.file[show_path.default_name] = show_path.default_handler;

show_path.set_to_run = function(path) {
	if (show_path.set_to_run.handler)
		window.clearTimeout(show_path.set_to_run.handler);
	show_path.set_to_run.handler = (show_path.set_to_run.path = path) ? window
			.setTimeout(show_path.set_to_run.running_now,
					show_path.set_to_run.interval) : 0;
};
show_path.set_to_run.interval = 500;
show_path.set_to_run.running_now = function() {
	show_path(show_path.set_to_run.path);
};

show_path.focus = function() {
	show_path.inputter.focus();
};
show_path.toggle = function(show) {
	library_namespace.toggle_display(show_path.panel, show);
};
/**
 * 設定好 panel。
 * 
 * @param {String|HTMLElement}outer_panel
 *            置於此 node 內。
 * @param {Boolean}[no_navigation]
 *            預設將加入 navigation bar。
 */
show_path.set_panel = function(outer_panel, no_navigation) {
	var structure = show_path.panel = library_namespace.new_node({
		div : null
	// id : 'show_path_panel'
	});

	if (!no_navigation) {
		show_path.inputter = library_namespace.new_node({
			input : null,
			// id : 'show_path_input_panel',
			onchange : function(e) {
				show_path(this.value);
			},
			// http://www.bloggingdeveloper.com/post/KeyPress-KeyDown-KeyUp-The-Difference-Between-Javascript-Key-Events.aspx
			// http://unixpapa.com/js/key.html
			// http://jimblackler.net/blog/?p=20
			// http://www.quirksmode.org/js/keys.html
			// https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent
			onkeypress : function(e) {
				if (!e)
					e = window.event;
				var key = e.which || e.keyCode || e.charCode;
				library_namespace.debug('key code: ' + key, 2);
				if (key === 13)
					show_path(this.value);
				else if (key === 8 && !this.value)
					show_path(show_path.full_path.replace(/[\\\/]$/, '')
							.replace(/[\\\/][^\\\/]+$/, ''));
			},
			S : 'width:90%'
		});

		structure = [ {
			div : [ show_path.inputter, '[', {
				a : 'toggle',
				href : '#',
				R : 'toggle file box',
				onclick : function(e) {
					library_namespace.toggle_display(show_path.panel);
					return false;
				}
			}, ']' ]
		}, show_path.panel ];
	}

	library_namespace.new_node(structure, outer_panel);
};



_.show_path=show_path;

// ------------------------------------------------------------------------- //


/*

cache 相關函數:
@see
application.storage.file.get_cache_file
application.OS.Windows.file.cacher
application.net.Ajax.get_URL_cache
application.net.wiki wiki_API.cache() CeL.wiki.cache()

*/


/*
自動 cacher。

var file_data = new CeL.cacher();

data = file_data.add(path);
data[1] = data_1;
data[2] = data_2;

file_data.log();

TODO:
整合至 data.pair
*/

function cacher(cache_file, options) {
	if (!cache_file)
		cache_file = 'cache/' + library_namespace.env.script_name + '.cacher.csv';

	// 前置處理。
	if (!library_namespace.is_Object(options)) {
		options = typeof options === 'string' ? {
			encoding : options
		} : Object.create(null);
	}

	if (this.file !== cache_file) {
		this.file = cache_file;
		this.data = null;
		this.encoding = options.encoding || library_namespace.guess_encoding
				&& library_namespace.guess_encoding(cache_file)
				|| library_namespace.open_format.TristateTrue;
		library_namespace.debug([ '[' + this.encoding, '] ', this.file ]);
	}

	if (!this.data) {
		var i = 0, length, line,key, data = {},
		// library_namespace.application.OS.Windows.file.read_file()
		text = (library_namespace.file && library_namespace.file.read_file || library_namespace.get_file)(cache_file, this.encoding);

		if (typeof text !== 'string'){
			//	Error to open file?
			text='';
		}
		text = text.split(/\r?\n/);
		length = text.length;
		library_namespace.debug('Read-in ' + length + ' records.');
		for (; i < length; i++) {
			line = text[i].split('\t');
			if (key = line[0].trim()) {
				if (key in data) {
					library_namespace.warn([ 'Duplicate records :', {
						br : null
					}, data[key], {
						br : null
					}, line ]);
				}
				data[key] = line;
			}
		}
		this.data = data;
	}
}

/**
 * write / save log.
 */
function cacher_log(new_path) {
	if (!library_namespace.write_file) {
		library_namespace.error('Cannot write log!');
		return false;
	}

	var data = this.data, i = 0, text = [];
	for (i in data)
		text.push(data[i].join('\t'));
	if (new_path)
		this.file = new_path;
	library_namespace.write_file(this.file, text.join('\n'), this.encoding);

	library_namespace.log([ 'cacher logged ', text.length, ' records. ', {
		a : '重新紀錄',
		href : '#',
		onclick : this.log.bind(this)
	}, '。' ]);

	return false;
}

/**
 * add record.
 */
function cacher_add(key) {
	var i, l, data,
	//
	data_array = Array.from(arguments);

	if (key in this.data) {
		data = this.data[key];
		l = data_array.length;
		for (; i<l; i++)
			data[i] = data_array[i];
	} else {
		this.data[key] = data = data_array;
	}

	return data;
};


// public interface of cacher.
library_namespace.set_method(cacher.prototype, {
	log : cacher_log,
	add : cacher_add
});

_.cacher = cacher;


// ---------------------------------------------------------------------//
// export.

// 在沒有COM的情況下，預設不匯出這些有問題的函數，否則可能會取代可能沒有問題的函數。
// @see CeL.application.storage
if (library_namespace.application.OS.Windows.no_COM) {
	// WScript.Echo('設定不匯出的子函式。');
	// 設定不匯出的子函式。
	this.no_extend = 'working_directory,move_file,move_1_file,is_file,is_folder,get_file_details,create_shortcut,open_file,read_file,write_file,traverse_file_system,iconv,show_path,cacher';
}

return (
	_// JSDT:_module_
);
}


});

