
/**
 * @name	CeL function for Windows registry
 * @fileoverview
 * 本檔案包含了 Windows registry 操作用的 functions。
 * @since	
 */

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name:'application.OS.Windows.registry',
code : function(library_namespace) {


/**
 * null module constructor
 * @class	Windows registry 的 functions
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








/*	http://msdn2.microsoft.com/en-us/library/x05fawxd.aspx
	作Registry的操作
	WSH_registry.Base	設定工作的基準，這應該是個目錄，將會附加在每個key前面

	WSH_registry(key)	WshShell.RegRead()
*undo*				key假如輸入object，會將之一一分開處理，此時WSH_registry.Err會包含所有發生的錯誤，WSH_registry.Err[0]=發生錯誤的數量
*undo*	WSH_registry(key,0,'info')	完整資訊（包括type）
*undo*	WSH_registry(keyDir,keyPattern,'dir')	傳回整個dir的資料。dir的預設值/標準の値：['']
	WSH_registry(key,value[,type])	WshShell.RegWrite()
	WSH_registry(key,value),WSH_registry(key,value,'auto')	auto detect type
	WSH_registry(key,value,1)	WshShell.RegWrite(key,value)
	WSH_registry(key,0,'del')	WshShell.RegDelete()

TODO:
backup all
search

test:
if(0){
 var k="HKCU\\Software\\Colorless echo\\Comparer\\test\\test",r=WSH_registry(k,1),p=function(){if(WSH_registry.Err)alert(WSH_registry.Err.message);else alert('('+typeof r+')'+k+'\n'+r);};
 p();
 WSH_registry(k,0,'del');
 r=WSH_registry(k);
 p();
 r=WSH_registry(k="HKCU\\Software\\Colorless echo\\Comparer\\");
 p();
}

*/
WSH_registry.Err=WSH_registry.Base=0;
function WSH_registry(key,value,type){
 WSH_registry.Err=null;
 if(WSH_registry.Base){if(WSH_registry.Base.slice(-1)!='\\')WSH_registry.Base+='\\';key=WSH_registry.Base+key;}
 if(!key)return;
 //if(typeof WshShell!='object')WshShell=new ActiveXObject("WScript.Shell");
 if(typeof key=='object'){var i,c=0;for(i in key)c+=WSH_registry(i,key[i],type) instanceof Error?0:1;return c;}
 try{
  var _f=WSH_registry.F;
  //if(typeof type=='string')type=_f[type];
  if(type=='del')WshShell.RegDelete(key);
  else if(typeof value!='undefined'){
   if(typeof type=='undefined'||type=='auto')	//	自動判別
    type=typeof value=='number'&&!value%1?'REG_DWORD'	//	DWORD:4bytes,REG_BINARY
    :typeof value=='string'&&value.indexOf('\n')==-1?value.indexOf('%')==-1?'REG_SZ':'REG_EXPAND_SZ'	//	REG_EXPAND_SZ:"%windir%\\calc.exe"等
    :0;	//	unknown:multi_sz/none/dword_big_endian/link/resource_list	http://www.cotse.com/dlf/man/TclCmd/registry.htm,http://cmpp.linuxforum.net/cman/mann/registry.htm
   //if(isNaN(type))WshShell.RegWrite(key,value);else WshShell.RegWrite(key,value,WSH_registry.T[type]);
   if(typeof type=='string')WshShell.RegWrite(key,value,type);else WshShell.RegWrite(key,value);
  }
  value=WshShell.RegRead(key);	//	寫入後再讀取，傳回真正寫入的值
  //alert('('+typeof value+')'+key+'\n'+value);
 }catch(e){
  //	http://klcintw4.blogspot.com/2007/09/javascriptie.html
  if(e.description.indexOf("伺服程式無法產生物件")!=-1)
   alert("請調整IE瀏覽器的安全性\n網際網路選項→安全性→自訂層級\n「起始不標示為安全的ActiveX控制項」設定為啟用或提示。"); 
  WSH_registry.Err=e;return;
 }
 return value;
}


/*
	registry 登錄值/登錄項目操作

bug:
registry_function.checkAccess('HKLM') always return false. this is OK: registry_function.checkAccess('HKLM\\SOFTWARE\\')

TODO:
Win32_SecurityDescriptor
.moveKey(from,to)
.moveValue(from,to)
用.apply()實作prototype之function，不另外寫。
*/
//registry_function[generateCode.dLK]='VBA,JSArrayToSafeArray';
function registry_function(path,sComputer,flag){	//	key path, ComputerName, create?
/*
 if(!registry_function.prototype.oReg){	//	不能用 this.prototype.~
  var oReg=getWMIData('default:SWbemLocator');//try{oReg=new Enumerator(GetObject("winmgmts:{impersonationLevel=impersonate}//"+(sComputer||'.')+"/root/default:StdRegProv"));}catch(e){}
  if(!oReg)try{
   //	http://msdn2.microsoft.com/en-us/library/aa393774.aspx
   var oLoc=new ActiveXObject("WbemScripting.SWbemLocator")
	,oSvc=oLoc.ConnectServer(sComputer||null,"root/default");
   oReg=oSvc.Get("StdRegProv");
  }catch(e){return;}
  registry_function.prototype.oReg=oReg;
 }
*/
/*
 try{
  this.oReg=new ActiveXObject("WbemScripting.SWbemLocator").ConnectServer(sComputer||null,"root/default").Get("StdRegProv");
 }catch(e){return;}	//	User-defined function to format error codes.
*/
 // with(this)base:'',subkey:{},value:{},type:{},flag:0
 this.setPath(path,sComputer);
 return this;
}


//	下面是公私共用 function
/*
http://www.supinfo-projects.com/en/2004/api_basederegistre__vb_en/2/
http://www.microsoft.com/taiwan/msclub/4P/topic_0402-3.aspx
REG_BINARY 二進位制資料。登錄檔編輯器會以十六進位的記數法來顯示二進位制的資料，而你必須用十六進位制的記數法 來輸入二進位的資料。舉個例子來說，如REG_BINARY值為0x02 0xFE 0xA9 0x38 0x92 0x38 0xAB 0xD9。
REG_DWORD 雙字組值(32-bits)。很多REG_DWORD內容值都使用像是布林值(0 或1、true或false、yes或者是no)。你也可以看到時間值以百萬秒(millisecond)的方式被放在REG_DWORD當中(1000 即1秒)。32-bit未指定的範圍可以從0到4,294,967,295，並且32-bit指定數值範圍可以從-2,147,483,648到 2,147,483,647。你可以使用十進位制或者是十六進位制的方法來編輯這些數值。如REG_DWORD值可表示為0xFE020001及 0x10010001。
REG_DWORD_BIG_ENDIAN 雙字組(Double-word)值以最顯著的方式被存放在記憶體當中。這些位元的順多與REG_DWORD的順序相反。舉個例子來說，數值 0x01020304被以0x01 0x02 0x03 0x04的型態放置在記憶體當中，你並不會在Intel-based 的架構中看到諸如此類的架構。
REG_DWORD_LITTLE_ENDIAN 雙字組值至少有顯者的位元組被儲存在記憶體當中，這個型態跟REG_DWORD是相同的，並且因為Intel-based的架構是以這種格式來儲存數值 的，在Windows XP當中，它是最普遍的數值。舉例來說，0x01020304以0x04 0x03 0x02 0x01的內容被存放在記憶體當中，登錄檔編輯器並不提供用來建立REG_DWORD_LITTLE_ENDIAN 值的能力，因為這個數值資料型態對於REG_DWORD在登錄檔當中的角色而言是相同的。
REG_EXPAND_SZ 變數長度的文字資料。以這種資料型態放置的資料可以是變數、及在使用它們之前，用來延伸這些變數的數值的程式。舉個例子來說，REG_EXPAND_SZ 值包含了%USERPROFILE%\Favorites在程式使用它之前，可能被延伸為C:\Documents and Settings\Jerry\Favorites 。這些登錄器API (Application Programming Interface)會依照所呼叫的程式來延伸環境變數REG_EXPAND_SZ字串，所以它在程式沒有擴充他們的時候，是沒有作用的。您可以看看第十章「引用使用者資訊檔」，以學習更多此類內容值的型態，以修正一些有趣的問題。
REG_FULL_RESOURCE_DESCRIPTOR 資源列表會將裝置及裝置的驅動程式列示出來。這也就資料型態對於PNP裝置來講很重要的原因。登錄檔編輯器並不提供任何方去來製作這種型態的內容值，但是 它允許你顯示它們。你可以查看HKLM\HARDWARE\DESCRIPTION\Description做為這類資料型態的範例。
REG_LINK 它是一個連接，而您無法建立REG_LINK值。
REG_MULTI_SZ 包含一個字串列表的二進位值。登錄檔編輯器會在每一行中顯示一個字串，並且允許你編輯這些列表。在 這些登錄檔當中，一個空的字元(0x00)被每個字串分隔開來，並且兩個空的字串被放置在此列表的結尾。
REG_NONE 擁有並未定義的數值。 Consists of hex data.
REG_QWORD Quadruple-word值(64-bits)。此一型態的資料與REG_DWORD型態相似，但是它包含了 64 bits而不是32 bit。而支援此一型態的作業系統只有Windows XP 64-Bit Edition。你可以使用十進位或者是十六進位的記數方法來查看及編輯此類的登錄值。 0xFE02000110010001為REG_QWORD的一個例子。
REG_QWORD_BIG_ENDIAN Quadruple-word值會將最顯著的位元組第一個儲存在記憶體當中。而此位元組的順序則與REG_QWORD儲存這些值的順序相反。你可以查看 REG_DWORD_BIG_ENDIAN得到更多資訊。
REG_QWORD_LITTLE_ENDIAN 至少有Quadruple-word值儲存在記憶體當中。這種型態與REG_QWORD相同。您可以查看REG_DWORD_LITTLE_ENDIAN 取得更多的資訊。登錄檔編輯器並不提供製作REG_QWORD_LITTLE_ENDIAN 內容的能力，因為這個值的型態對於登錄檔中的REG_QWORD而言是唯一的。
REG_RESOURCE_LIST 是REG_FULL_RESOURCE_DESCRIPTION 內容值的列表。登錄檔編輯器允許你查看，但不允許你編輯這種型態的資料。
REG_RESOURCE_REQUIREMENTS_LIST 列示了裝置所需資源的列表。登錄檔編輯器允許你查看，但並不允許你編輯此種型態的值。
REG_SZ 固定長度的文字 REG_DWORD、REG_SZ值為在登錄檔當中最普遍的資料型態。而REG_SZ值的範例為 Microsoft Windows XP或Jerry Honeycutt。每個字串都是以一個鑋值字元為結尾。程式並在REG_SZ值當中並沒有擴充環境變數。
*/
/* private */registry_function.typeName='REG_NONE,REG_SZ,REG_EXPAND_SZ,REG_BINARY,REG_DWORD,REG_DWORD_BIG_ENDIAN,REG_LINK,REG_MULTI_SZ,REG_RESOURCE_LIST,REG_FULL_RESOURCE_DESCRIPTOR,REG_RESOURCE_REQUIREMENTS_LIST,REG_QWORD,REG_QWORD_LITTLE_ENDIAN=11'.split(',');
//	將 TypeValue 轉成 TypeName
registry_function.getTypeName = registry_function.prototype.getTypeName = function(
		/* int */type) {
	return registry_function.typeName[type];
};
//	將 TypeName 轉成 TypeValue
registry_function.getTypeValue = registry_function.prototype.getTypeValue = function(
		/* string */type) {
	if (!registry_function.typeValue) {
		var i, t = registry_function.typeValue = {}, n = registry_function.typeName;
		for (i in n)
			t[n[i]] = i;
	}
	return registry_function.typeValue[type];
};



/*	將 HKEY_CURRENT_USER 等表示法與數字代號互轉
	http://msdn2.microsoft.com/en-us/library/aa393664.aspx
	http://svn.ruby-lang.org/cgi-bin/viewvc.cgi/tags/v1_8_5_19/ext/Win32API/lib/win32/registry.rb?view=markup&pathrev=11732
	http://www.51log.net/dev/304/4539587.htm
*/
registry_function.getRegCode=registry_function.prototype.getRegCode=function(/*string */name){
 if(!registry_function.RegCode){
  var i,r=registry_function.RegCode={
	HKCR:0,HKEY_CLASSES_ROOT:0
	,HKCU:1,HKEY_CURRENT_USER:1
	,HKLM:2,HKEY_LOCAL_MACHINE:2
	,HKUS:3,HKU:3,HKEY_USERS:3
	//,HKEY_PERFORMANCE_DATA:4
	,HKCC:5,HKEY_CURRENT_CONFIG:5
	,HKEY_DYN_DATA:6
	//,HKEY_PERFORMANCE_TEXT:0x50
	//,HKEY_PERFORMANCE_NLSTEXT:0x60
  };
  for(var i in r)if(!isNaN(r[i])){
   r[i]+=0x80000000;//&
   if(i.indexOf('_')!=-1)r[r[i]]=i;	//	reverse
  }
 }
 //alert(name+'\n'+registry_function.RegCode[name]);
 return registry_function.RegCode[name];
};


//	分開base與path，並作檢查。
registry_function.separatePath=function(path,sComputer,isValue){
 if(typeof path=='object')return path;	//	處理過的
/*
 if(isNaN(base)&&isNaN(base=this.getRegCode(base))&&typeof path=='string'&&(path=path.match(/^([A-Z_]+)\\(.+)$/)))
  base=this.getRegCode(path[1]),path=path[2];
*/
 var base,v;	//	base, ValueName (or tmp)
 if(typeof path=='string' && (v=path.match(/^([A-Z_]+)(\\(.*))?$/)))
  base=this.getRegCode(v[1]),path=v[3]/*||'\\'*/;

 if(!base/*||isNaN(base)*/)return;
 //alert('registry_function.separatePath:\n'+base+'	'+path);
 if(typeof path!='string' || !path&&path!=='')return;

 v=0;
 //	判別輸入
 if(!/[\\]$/.test(path))
  if(!isValue&&this.checkAccess([base,path],1/* KEY_QUERY_VALUE */,sComputer))
   //	輸入 SubkeyName
   path+='\\',v='';
  //	輸入 ValueName
  else if(v=path.match(/^(.+\\)([^\\]+)$/))path=v[1],v=v[2];
  //	輸入 root 之 ValueName，如 HKEY_CURRENT_USER\value
  else v=path,path='';

 if(path[1]=='\\')path[1]='';
 //alert('registry_function.separatePath:\n'+base+'\n'+path+'\n'+v);
 return typeof v=='string'?[base,path,v]:[base,path];	//	考慮用{base:,key:,value:}
};
// private
registry_function.prototype.separatePath=function(name,base){
 //return this instanceof registry_function?[this.base,this.path+path]:registry_function.separatePath(path);
 return typeof name=='string'?name.indexOf('\\')==-1?[this.base,this.path,name]:registry_function.separatePath(this.getPath()+name,this.computer):[this.base,this.path];
};


/*	主要的 WMI 執行 interface
	http://msdn2.microsoft.com/En-US/library/aa394616.aspx
In scripting or Visual Basic, the method returns an integer value that is 0 (zero) if successful. If the function fails, the return value is a nonzero error code that you can look up in WbemErrorEnum.
*/
registry_function.oRegA = {};
registry_function.runMethod=registry_function.prototype.runMethod=function(name,inPO,sComputer/*,flag*/){	//	inPO: input parameters object
 var oReg=this.oReg||registry_function.oRegA[sComputer||'.'];
 if(!oReg)try{
  oReg=this.oReg=registry_function.oRegA[sComputer||'.']
	=new ActiveXObject('WbemScripting.SWbemLocator')
	.ConnectServer(sComputer||null,'root/default')
	.Get('StdRegProv');
 }catch(e){
  //popErr(e);
  return;
 }

 try{
  var i,oMethod=oReg.Methods_.Item(name)	//	若無此方法會 throw error!
	,oInParam=oMethod.InParameters.SpawnInstance_();
  //if(name=='SetMultiStringValue')for(i in inPO){try{oInParam[i]=inPO[i];}catch(e){popErr(e,0,'registry_function.runMethod: '+name+' error:\nset ['+i+'] to ['+inPO[i]+']');}if(name=='CheckAccess')alert(name+': oInParam['+i+']='+inPO[i]);}
  for(i in inPO)oInParam[i]=inPO[i];	//	若無此property會 throw error!
  return oReg.ExecMethod_(oMethod.Name,oInParam);//oOutParam
 }catch(e){
  popErr(e);
  return e;
 }
};


/*	The CheckAccess method verifies that the user has the specified permissions.
	http://msdn2.microsoft.com/en-us/library/aa384911.aspx
	http://msdn2.microsoft.com/en-us/library/ms724878.aspx

制定一個訪問標記以描述訪問新鍵的安全性
    此參數可以是下列值的一個聯合
    KEY_ALL_ACCESS
    KEY_QUERY_VALUE, KEY_ENUMERATE_SUB_KEYS, KEY_NOTIFY, KEY_CREATE_SUB_KEY, KEY_CREATE_LINK, 和 KEY_SET_VALUE 訪問的聯合.
    KEY_CREATE_LINK
    允許創建嚴格符號的鏈接.
    KEY_CREATE_SUB_KEY
    允許創建子鍵.
    KEY_ENUMERATE_SUB_KEYS
    允許枚舉子鍵.
    KEY_EXECUTE
    允許讀訪問.
    KEY_NOTIFY
    允許改變通知.
    KEY_QUERY_VALUE
    允許查詢子鍵的數據.
    KEY_READ
    KEY_QUERY_VALUE, KEY_ENUMERATE_SUB_KEYS, 和 KEY_NOTIFY 訪問的聯合.
    KEY_SET_VALUE
    允許設置子鍵的數據.
    KEY_WRITE
    KEY_SET_VALUE 和 KEY_CREATE_SUB_KEY 訪問的聯合

KEY_ALL_ACCESS (0xF003F)	Combines the STANDARD_RIGHTS_REQUIRED, KEY_QUERY_VALUE, KEY_SET_VALUE, KEY_CREATE_SUB_KEY, KEY_ENUMERATE_SUB_KEYS, KEY_NOTIFY, and KEY_CREATE_LINK access rights. (&& READ_CONTROL?)
KEY_CREATE_LINK (0x0020)	Reserved for system use.
KEY_CREATE_SUB_KEY (0x0004)	Required to create a subkey of a registry key.
KEY_ENUMERATE_SUB_KEYS (0x0008)	Required to enumerate the subkeys of a registry key.
KEY_EXECUTE (0x20019)	Equivalent to KEY_READ.
KEY_NOTIFY (0x0010)	Required to request change notifications for a registry key or for subkeys of a registry key.
KEY_QUERY_VALUE (0x0001)	Required to query the values of a registry key.
KEY_READ (0x20019)	Combines the STANDARD_RIGHTS_READ, KEY_QUERY_VALUE, KEY_ENUMERATE_SUB_KEYS, and KEY_NOTIFY values.
KEY_SET_VALUE (0x0002)	Required to create, delete, or set a registry value.
KEY_WOW64_32KEY (0x0200)	Indicates that an application on 64-bit Windows should operate on the 32-bit registry view. For more information, see Accessing an Alternate Registry View.
	This flag must be combined using the OR operator with the other flags in this table that either query or access registry values.
	Windows 2000:  This flag is not supported.
KEY_WOW64_64KEY (0x0100)	Indicates that an application on 64-bit Windows should operate on the 64-bit registry view. For more information, see Accessing an Alternate Registry View.
	This flag must be combined using the OR operator with the other flags in this table that either query or access registry values.
	Windows 2000:  This flag is not supported.
KEY_WRITE (0x20006)	Combines the STANDARD_RIGHTS_WRITE, KEY_SET_VALUE, and KEY_CREATE_SUB_KEY access rights.

http://www.supinfo-projects.com/en/2004/api_basederegistre__vb_en/2/
*/
registry_function.accessFlag = {
		KEY_QUERY_VALUE : 1,
		KEY_SET_VALUE : 2,
		KEY_CREATE_SUB_KEY : 4,
		KEY_ENUMERATE_SUB_KEYS : 8,
		KEY_NOTIFY : 0x10,
		KEY_CREATE_LINK : 0x20,
		// KEY_WOW64_32KEY:0x0200,
		// KEY_WOW64_64KEY:0x0100,
		DELETE : 0x10000,
		READ_CONTROL : 0x20000,
		STANDARD_RIGHTS_EXECUTE : 0x20000,
		STANDARD_RIGHTS_READ : 0x20000,
		STANDARD_RIGHTS_WRITE : 0x20000,
		KEY_WRITE : 0x20006,
		KEY_READ : 0x20019,
		KEY_EXECUTE : 0x20019,
		// WRITE_DAC:0x40000,
		// WRITE_OWNER:0x80000,
		// STANDARD_RIGHTS_REQUIRED:0xF0000,
		KEY_ALL_ACCESS : 0xF003F
		// ,SYNCHRONIZE:0x100000,
		// STANDARD_RIGHTS_ALL:0x1F0000
};
//	check access of key base+path
registry_function.checkAccess=registry_function.prototype.checkAccess=function(path,uRequired,sComputer){
 if(path=this.separatePath(path,sComputer)){
  if(typeof uRequired=='string')uRequired=registry_function.accessFlag[uRequired];
  //alert('registry_function check:\n'+this.getRegCode(path[0])+'\\'+path[1]+'\n'+this.runMethod('CheckAccess',{hDefKey:path[0],sSubKeyName:path[1],uRequired:uRequired||3/*KEY_QUERY_VALUE+KEY_SET_VALUE*/},sComputer).bGranted);
  try{return this.runMethod('CheckAccess',{hDefKey:path[0],sSubKeyName:path[1],uRequired:uRequired||3/*KEY_QUERY_VALUE+KEY_SET_VALUE*/},sComputer).bGranted;}	//	有可能不存在 .bGranted !
  catch(e){return;}
 }
};


//	一次性功能，不通過創建object
/*	ӥ۞某 path: Subkey(機碼) 之 {ValueName:(int)ValueType} 資訊。無 Value 會 return undefined
registry_function.getValue('HKEY_CLASSES_ROOT\\.odp')	傳ީ設值
registry_function.getValue('HKEY_CLASSES_ROOT\\.odp\\')	傳回整個目錄值
*/
registry_function.getValueType=function(path,sComputer,flag){
 if(!(path=this.separatePath(path,sComputer)))return;

 //	http://msdn2.microsoft.com/en-us/library/aa390388.aspx
 var oOutParam=this.runMethod('EnumValues',{hDefKey:path[0],sSubKeyName:path[1]},sComputer),aNames,aTypes,i=0,r={'':1/* 取得預設值: REG_SZ */};
 if(!oOutParam || oOutParam.sNames==null)return;	//	error 大概都是 ==null，可能因為輸入value而非key值
 aNames=oOutParam.sNames.toArray(),aTypes=oOutParam.Types.toArray();
 //aNames.push(''),aTypes.push(1);	//	預設值
 if(flag==1)return [aNames,aTypes];
 for(;i<aNames.length;i++)
  //WScript.Echo('('+sRegTypes[aTypes[i]]+') '+aNames[i]);
  r[aNames[i]]=aTypes[i];//,this.value[aNames[i]]=getValue(aNames[i],aTypes[i]);

 return flag==2?[aNames,r]:typeof path[2]=='string'?r[path[2]]:r;
};
//	傳回某 Value(數值) 之 (int)type 或 {ValueName:(int)ValueType}
registry_function.prototype.getValueType=function(name,force){
 if(force||!this.type||!this.type[name]){	//	可能有更新
  var t=registry_function.getValueType(this.separatePath(),this.computer,2)||[];
  this.type=(this.valueA=t[0]||[]).length?t[1]:{};
 }
 //alert('registry_function.prototype.getValueType:\n'+name+'	'+this.type[name]);
 if(this.type)return typeof name=='string'?this.type[name]:this.type;	//	應先copy
};
registry_function.prototype.getValueA = function(force) {
	if (force || !this.valueA)
		this.getValueType(0, 1);
	return this.valueA;
};


/*	一次性功能，不通過創建object
	讀取 Subkey(機碼) 之名稱資訊。無 Subkey 會 return undefined

TODO:
return registry_function object
*/
registry_function.getSubkeyName=function(path,sComputer,flag){
 if(!(path=this.separatePath(path,sComputer)))return;
 //alert('registry_function.getSubkeyName:\npath: '+path);

 //	http://msdn2.microsoft.com/en-us/library/aa390387.aspx
 var i=0,r={},aNames=this.runMethod('EnumKey',{hDefKey:path[0],sSubKeyName:path[1]=='\\'?'':path[1]},sComputer).sNames;
 if(aNames!=null){	//	error 大概都是 ==null，可能因為: 1.無Subkey 2.輸入value而非key值
  if(flag==1)return aNames;
  for(aNames=aNames.toArray();i<aNames.length;i++)
   r[aNames[i]]={};//registry_function(r.base+aNames[i]+'\\')
  //alert('registry_function.getSubkeyName: '+aNames.length);
  return flag==2?[aNames,r]:path[2]?path[2] in r:r;
 }
};
registry_function.prototype.getSubkeyName = function(force, flag) {
	if (force || !this.subkey) {
		var t = registry_function.getSubkeyName(this.separatePath(),
				this.computer, 2)
				|| [];
		this.subkey = (this.subkeyA = t[0] || []).length ? t[1] : {};
	}
	return flag ? this.subkeyA : this.subkey;
};


/*	設定 object 之初始 path。
oRegistryF.subkey
oRegistryF.type
oRegistryF.value
*/
registry_function.prototype.setPath=function(path,sComputer){	//	base key path
 if(!(path=registry_function.separatePath(path,sComputer)))return;	//	因為是初次設定，所以這裡不能用 this.separatePath()

 this.base=path[0],this.path=path[1],this.computer=sComputer;
 if(!/[\\]$/.test(this.path))this.path+='\\';	//	確保this.path是key值

 //this.subkey={},this.type={},this.value={};	//	預防 no access permission 之後卻還被呼叫
 if(this.checkAccess(0,0,sComputer))
	this.value={}
	,this.type=this.getValueType()
	,this.subkey=this.getSubkeyName(1)
	;
 //	else: no access permission or doesn't exist.
 return path;
};

//	傳回 object 之初始 path。
registry_function.prototype.getPath = function() {
	return this.getRegCode(this.base) + '\\' + this.path;
};


registry_function.prototype.reset = function() {
	//	預防 no access permission 之後卻還被呼叫
	this.subkey = {}, this.type = {}, this.value = {};
	this.setPath(this.separatePath(), this.computer);
};

//	尚未完善!
registry_function.isExist=function(path,sComputer,flag){
 path=this.separatePath(path,sComputer);
 if(!path)return;

 var _t=this.getSubkeyName([path[0],path[1].replace(/[^\\]+\\?$/,'')],0,2);
 _t= _t && (!path[1]||path[1]=='\\'||_t.length&&_t[1][path[1].replace(/^(.*?)([^\\]+)\\?$/,'$2')]);
 return !_t||!path[2]?_t:typeof this.getValueType(path)!='undefined';

 //if(this.checkAccess(path,1/* KEY_QUERY_VALUE */,sComputer))return true;
 //if(flag)return;	//	不以create的方法test。

 //	若可create(並access)，表示不存在（需刪掉建出來的），return false。否則unknown，return undefined。

};
registry_function.prototype.isExist = function(name, flag) {
	return registry_function.isExist(this.separatePath(name),
			this.computer, flag);
};

//	RegMethod	http://www.cqpub.co.jp/hanbai/pdf/18451/18451_wmi.pdf
registry_function.useMethod = ',String,ExpandedString,Binary,DWORD,DWORD,String,MultiString,String,MultiString,String,QWORD'
	.split(',');
registry_function.useValueName = ',s,s,u,u,u,s,s,s,s,s,u'.split(',');
registry_function.useArray = ',,,1,,,,1,,1,,'.split(',');
//	以 type 取得 path 之 Value。預設自動判別 type
registry_function.getValue=function(path,sComputer,/*int || undefined */type){
 if(!(path=this.separatePath(path,sComputer)))return;
 if(typeof path[2]!='string'){
  //	get all
  var r={},i;
  type=this.getValueType(path,sComputer);
  for(i in type)r[path[2]=i]=this.getValue(path,sComputer,type[i]);
  return r;
 }

 var m;	//	method
 if(!type&&!(type=this.getValueType(path,sComputer))||!(m=this.useMethod[type]))return;

 var oOutParam=this.runMethod('Get'+m+'Value',{hDefKey:path[0],sSubKeyName:path[1],sValueName:path[2]},sComputer);
 if(!oOutParam)return;
 //if(oOutParam.returnValue)return oOutParam.returnValue;

 //	different method return different value name
 oOutParam=oOutParam[this.useValueName[type]+'Value'];
 //	some methods return VB Array
 if(this.useArray[type])oOutParam=VBA(oOutParam);

 //if(!oOutParam)return;
 if(type==7/*REG_MULTI_SZ*/)oOutParam=oOutParam.toArray();
 else if(type==3/*REG_BINARY*/)oOutParam=fromCharCode(oOutParam.toArray());
 //alert(oMethod.Name+'\n'+'('+type+')'+name+'\n'+oOutParam);
 //if(type==3)alert(typeof oOutParam);
 return oOutParam;
};
registry_function.prototype.getValue=function(name,/*int || undefined */type){
 var i,v;
 if(typeof name=='string'){
  if(this.getSubkeyName()[name])
   v=registry_function.getValue([this.base,this.path+'\\'+name,''],this.computer,1/* 取得預設值: REG_SZ */);
  else{
   if(name in this.value)return this.value[name];//if(m=this.value[name])return m;
   if(!type)type=this.getValueType(name);	//	bug: 假如在之前已經更新過，可能得到錯誤的 type ！
   v=registry_function.getValue(this.separatePath(name),this.computer,type);
  }
  if(typeof v!='undefined')this.value[name]=v;
  return v;
 }

 if(!this.gotAllValue){
  //	get all
  for(i in this.type)
   //{v=registry_function.getValue(this.separatePath(i),this.computer,this.type[i]);if(typeof v!='undefined')this.value[i]=v;}
   this.value[i]=registry_function.getValue(this.separatePath(i),this.computer,this.getValueType(i));
  this.gotAllValue=true;
 }
 return this.value;	//	應先copy
};


/*	僅設定 Value	硬將小數設成REG_DWORD會四捨五入
TODO:
set default value:
setValue('@',object)
*/
registry_function.setValue=function(path, value, /*int || undefined */type, sComputer, isValue){
 if(!(path=this.separatePath(path,sComputer,isValue)))return 5;

 if(typeof value=='undefined')return;	//	want to delete?
 if(!type||isNaN(type)&&isNaN(type=this.getTypeValue(type)))	//	自動判別
  type=!isNaN(value)?value%1?1/*REG_SZ*/:4/*REG_DWORD*/	//	DWORD:4bytes, or QWORD
   :typeof value=='string'?
    /^[\x0-\xff]$/.test(value)&&/[\x0\x80-\xff]/.test(value)?3/*REG_BINARY*/
	:value.indexOf('\n')!=-1?7/*REG_MULTI_SZ*/
	:value.indexOf('%')==-1?1/*REG_SZ*/:2/*REG_EXPAND_SZ:"%windir%\\calc.exe"等*/
   :typeof value=='object'?3/*REG_BINARY*/:0/*REG_NONE*/;	//	may buggy
 var m=this.useMethod[type],o;
 //alert('registry_function.setValue:\npath:'+path+'\nvalue:'+(''+value).replace(/\0/g,'\\0')+'\ntype:'+type+'\nm:'+m+'\n\ncreate id:'+this.setValue.cid+'\nexist:'+this.isExist([path[0],path[1]]));
 if(!m)return 6;
 if( this.setValue.cid && !this.isExist([path[0],path[1]]) )
  //alert('registry_function.setValue: add Key:\n'+path[0]+'\n'+path[1]),
  this.addKey(path);

 o={hDefKey:path[0],sSubKeyName:path[1],sValueName:path[2]};

 //	http://msdn.microsoft.com/en-us/library/aa393286(VS.85).aspx
 if(type==3/*REG_BINARY*/&&typeof value=='string'){
  var i=0,v=value;
  for(value=[];i<v.length;i++)value.push(v.charCodeAt(i));//value.push(''+v.charCodeAt(i));
 }
 //	some methods need VB Array
 if(this.useArray[type])value=JSArrayToSafeArray(value);
 //	different method has different value name
 o[this.useValueName[type]+'Value']=value;

 m=this.runMethod('Set'+m+'Value',o,sComputer);
 return m instanceof Error?m:m.returnValue;
};
//	Create intermediate directories as required.
//	設為true記得setValue後馬上改回來，否則可能出現自動加subkey的情形。
//registry_function.setValue.cid=0;
registry_function.prototype.setValue = function(name, value, /*int || undefined */type) {
	return registry_function.setValue(this.separatePath(name), value,
			type, this.computer);
};


/*
只能刪除葉結點項，連同該子項下的所有值均被刪除(如果不存在子項，或該項下還有子項則不能刪除則無效果)
*/
registry_function.deleteKey=function(path,sComputer,flag){
 if(!(path=this.separatePath(path,sComputer))
	||path[2]	//	不接受值
	)return;

 flag=flag||0;
 if(flag&1){
  //	recursive
  var i,k=this.getSubkeyName(path,sComputer);
  for(i in k)this.deleteKey([path[0],path[1]+k[i]],sComputer,flag-(flag&2)/* 不連上層empty者一起刪除 */);
  flag-=1;
 }

 //	do deleteKey
 var r=this.runMethod('DeleteKey',{hDefKey:path[0],sSubKeyName:path[1]},sComputer);
 if(!(flag&2))return r instanceof Error?r:r.returnValue;

 //	連上層empty者一起刪除
 flag-=(flag&1)+(flag&2);
 while(!(r instanceof Error) && (r=path[1].match(/^(.+)[^\\]+\\$/,''))){
  path[1]=r[1];
  if(this.getSubkeyName(path,sComputer)||this.getValueType(path,sComputer))break;
  r=this.deleteKey(path,sComputer,flag);
 }
 return path;
};
registry_function.prototype.deleteKey = function(name, flag) {
	var p = registry_function.deleteKey(this.separatePath(name),
			this.sComputer, flag);
	if (typeof p === 'object' && this.path !== p[1]
			&& this.path.indexOf(p[1]) === 0)
		// 若 p[1] 比較短，表示連本 object 都被刪了。reset
		this.reset();
	return p;
};


//	return 0: success, others: failed
registry_function.deleteValue = function(path, sComputer) {
	if (!(path = this.separatePath(path, sComputer)) || !path[2] // 不接受key
	)
		return;

	var r = this.runMethod('DeleteValue', {
		hDefKey : path[0],
		sSubKeyName : path[1],
		sValueName : path[2]
	}, sComputer);

	return r instanceof Error ? r : r.returnValue;
};
registry_function.prototype.deleteValue = function(name) {
	return registry_function.deleteValue(this.separatePath(name),
			this.computer);
};

//	input key or value, 自動判別
registry_function.deletePath = function(path, sComputer) {
	if (path = this.separatePath(path, sComputer))
		return path[2] ? this.deleteValue(path, sComputer) : this
				.deleteKey(path, sComputer);
};


//	僅設定 Key	add Subkey 創建註冊表項，可以一次創建完整的項子樹(各級不存在也會被創建)
registry_function.addKey = function(path, oValue, flag, sComputer) { // flag:add/overwrite/reset(TODO)
	if (!(path = this.separatePath(path, sComputer)))
		return;

	var i, r = this.runMethod('CreateKey', {
			hDefKey : path[0],
			sSubKeyName : path[1] = path[1]/* +(path[2]||'') */
		}, sComputer).returnValue;

	if (typeof oValue == 'object') {
		r = 0;
		for (i in oValue)
			path[2] = i, r += this.setValue(path, oValue[i], 0,
					sComputer);
	}
	return r;
};
registry_function.prototype.addKey = function(name, oValue, flag) { // flag:add/overwrite/reset(TODO)
	return registry_function.addKey(this.separatePath(name), oValue,
			flag, this.computer);
};


if(0){
	CeL.no_initialization = 1;

	var r = new registry_function('HKCU\\Software\\Colorless echo\\regTest\\test3\\');
	//	alert((r.getValue())['test1']);
	r.setValue('test3', 34452);
	r.setValue('test4', 34452.53);
	r.setValue('test5', {
		ghjk : 'hghj'
	});
	alert(r.getPath() + '\nAccess: ' + r.checkAccess() + '\n\n' + r.getValue('test4'));
	r.deleteValue('test3');
	r.deleteValue('test4');
	r.addKey('test\\test1');
	alert(r.addKey('test1\\test1'));
	r.deleteKey('test\\test1');
	r.deleteKey('test1\\test1');

	/*
	oRegistryF.setValue(name,value,type);
	oRegistryF.getValue();
	oRegistryF.getValue(name);
	oRegistryF.getValueType(name);
	oRegistryF.deleteValue(name);
	oRegistryF.deleteKey(name);
	oRegistryF.addKey(name);
	oRegistryF.addKey(name,oValue,flag:add/overwrite/reset);
	*/
}

//	include library
function _iL() {
	// if(typeof WshShell!='object')WshShell=new ActiveXObject("WScript.Shell");
}
//or: isHTA
_iL.p = library_namespace.env.registry_path_key_name;
_iL.for_include = 'try{var o;try{o=new ActiveXObject("Microsoft.XMLHTTP")}catch(e){o=new XMLHttpRequest()}o.open("GET",(new ActiveXObject("WScript.Shell")).RegRead("'
	//	TODO: 以更準確的方法處理。
	+ _iL.p.replace(/\\/, '\\\\')
	+ '"),false);o.send(null);eval(o.responseText)}catch(e){}';// WScript.Echo(e.message);

//export to CeL root. e.g., CeL.reg
//CeL.extend({registry_function:registry_function,_iL:_iL});
//CeL.extend({reg:registry_function});
_.reg = registry_function;


return (
	_// JSDT:_module_
);
}


});

