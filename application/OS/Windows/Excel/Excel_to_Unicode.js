/**
 * convert Excel .xlsx to Unicode text
 * 
 * This script file MUST encoding as UTF-16LE to execute by wscript!
 * 
 * @since 2018/9/28
 */

var WshShell = WScript.CreateObject("WScript.Shell");

var fso = WScript.CreateObject("Scripting.FileSystemObject");

// 跳脫
function exit(r) {
	WScript.Quit(r || 0);
}

// 顯示訊息視窗：改編from function.js for 程式執行時間
function alert(x, c, t, d) {
	WScript.Echo(x);
	return;
	// WScript.Echo()
	// if(!date)return WshShell.Popup(x,c,t,d);
	WshShell.Popup(x, c, t, d);
}

// 資料處理
function openDataF() {
	try {
		objXL.WorkBooks.Open(dataFN);
	} catch (e) {
		return 1;
	}
}

var objXL;
try {
	objXL = WScript.CreateObject("Excel.Application");
} catch (e) {
	// no Automate Objects
	exit(2);
}

var data_file_path, save_to_file = data_file_path.replace(/(?:\.[^.]+)?$/,
		'.txt'), sheet_name;

if (WScript.Arguments.length > 0)
	data_file_path = WScript.Arguments(0);
else {
	exit(1);
}
if (WScript.Arguments.length > 1)
	save_to_file = WScript.Arguments(1);
if (WScript.Arguments.length > 2)
	sheet_name = WScript.Arguments(2);

if (!/[\\\/]/.test(save_to_file)) {
	// default: save to "%HOMEPATH%\Documents"
	save_to_file = '.\\' + save_to_file;
}

objXL.WorkBooks.Open(data_file_path);
// objXL.Visible = true;

// Excel常數設定
var xlV = {
	True : -1,
	// XlFileFormat Enumeration (Excel)
	xlUnicodeText : 42
};

// https://docs.microsoft.com/en-us/office/vba/api/excel.application.sheets
// Sheets.Count
var sheet = sheet_name
// Sheets(i).Name
? objXL.Sheets(sheet_name) : objXL.ActiveSheet;

try {
	fso.DeleteFile(save_to_file);
} catch (e) {
	// TODO: handle exception
}

sheet.SaveAs(save_to_file, xlV.xlUnicodeText);
// alert(WshShell.CurrentDirectory);

objXL.ActiveWorkBook.Saved = xlV.True;
objXL.WorkBooks.Close;
