/**
 * @name convert Excel .xlsx file to Unicode text
 * 
 * This script file MUST encoding as UTF-16LE to execute as JScript (by CScript
 * or WScript)!
 * 
 * usage: CScript Excel_to_text.js data_file_path sheet_name save_to_file
 * 
 * @since 2018/9/28
 */

var WshShell = WScript.CreateObject("WScript.Shell");

var fso = WScript.CreateObject("Scripting.FileSystemObject");

var VBAV = {
	True : -1,
	False : 0
};
// Excel 常數設定
// XlFileFormat Enumeration (Excel)
// https://docs.microsoft.com/zh-tw/office/vba/api/excel.xlfileformat
var XlFileFormat = {
	// Unicode 文字
	xlUnicodeText : 42
};

// 跳脫
function exit(r) {
	try {
		// objXL.Windows("filename.xlsx").Activate()

		// prevent the prompt box
		// 光是 `objXL.WorkBooks.Close(VBAV.False)` 不夠。
		objXL.ActiveWorkBook.Saved = VBAV.True;

		// https://msdn.microsoft.com/zh-tw/vba/excel-vba/articles/workbook-close-method-excel
		// Close( SaveChanges, Filename, RouteWorkbook )
		// ActiveWorkbook.Close SaveChanges:=False
		objXL.WorkBooks.Close(VBAV.False);
	} catch (e) {
	}

	objXL.Quit();
	// free
	// objXL = null;

	WScript.Quit(r || 0);
}

// 顯示訊息視窗：改編from function.js for 程式執行時間
function alert(x, c, t, d) {
	WScript.Echo(x);
	return;
	// WScript.Echo()
	// if (!date) return WshShell.Popup(x, c, t, d);
	WshShell.Popup(x, c, t, d);
}

var objXL;
try {
	// https://docs.microsoft.com/zh-tw/office/vba/api/excel.application(object)
	objXL = WScript.CreateObject("Excel.Application");
} catch (e) {
	alert('No Automate Objects');
	exit(2);
}

// Warning: data_file_path MUST be full path!
var data_file_path = WScript.Arguments.length > 0 && WScript.Arguments(0);
// WScript.Echo(WScript.Arguments(0));

if (!data_file_path) {
	alert('No data_file_path specified!');
	exit(1);
}

try {
	objXL.WorkBooks.Open(data_file_path, VBAV.False, VBAV.False);
} catch (e) {
	alert('Cannot open data_file_path: ' + data_file_path);
	// e. name number description===message
	alert(e.message.replace(/\r/g, '\n'));
	exit(3);
}
// objXL.Visible = true;

// https://docs.microsoft.com/en-us/office/vba/api/excel.application.sheets
// Sheets.Count
var sheet_name = WScript.Arguments.length > 1 && WScript.Arguments(1);
var sheet = sheet_name
// Sheets(i).Name 若(sheet_name)不存在，可能出現 "Microsoft JScript 執行階段錯誤: 陣列索引超出範圍"
? objXL.Sheets(sheet_name) : objXL.ActiveSheet;

// TODO: 將錯誤訊息用JSON寫在結果檔案中。

var save_to_file = WScript.Arguments.length > 2 && WScript.Arguments(2)
		|| data_file_path.replace(/(?:\.[^.]+)?$/, '.tsv');

if (!/:\\/.test(save_to_file) && !/^\.\.[\\\/]/.test(save_to_file)) {
	// default: save to "%HOMEPATH%\Documents"
	save_to_file = '.\\' + save_to_file;
}

try {
	fso.DeleteFile(save_to_file);
} catch (e) {
	// TODO: handle exception
}

sheet.SaveAs(save_to_file, XlFileFormat.xlUnicodeText);
// alert(WshShell.CurrentDirectory);

exit(0);
