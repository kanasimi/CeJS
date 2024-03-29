/**
 * @name convert Word .xml file to Word .docx file
 * 
 * This script file MUST encoding as UTF-16LE to execute as JScript (by CScript
 * or WScript)!
 * 
 * usage: CScript xml_to_Word.js xml_file_path save_to_file
 * 
 * @since 2019/2/25
 */

var WshShell = WScript.CreateObject("WScript.Shell");

var fso = WScript.CreateObject("Scripting.FileSystemObject");

var VBAV = {
	True : -1,
	False : 0
};
// Word 常數設定
// https://docs.microsoft.com/zh-tw/office/vba/api/word.wdsaveoptions
var WdSaveOptions = {
	wdDoNotSaveChanges : 0,
	wdPromptToSaveChanges : -2,
	wdSaveChanges : -1
},
// https://docs.microsoft.com/en-US/office/vba/api/word.wdsaveformat
WdSaveFormat = {
	// Microsoft Office Word 97-2003年二進位檔案格式。
	wdFormatDocument : 0,
	// 篩選的 HTML 格式。
	wdFormatFilteredHTML : 10,
	// 儲存為單一的 XML 檔案開啟 XML 檔案格式。
	wdFormatFlatXML : 19,
	// OpenDocument Text format.
	wdFormatOpenDocumentText : 23,
	// Standard HTML format.
	wdFormatHTML : 8,
	// Strict Open XML document format.
	wdFormatStrictOpenXMLDocument : 24,
	// Unicode text format.
	wdFormatUnicodeText : 7,
	// Word default document file format. For Word, this is the DOCX format.
	wdFormatDocumentDefault : 16,
	// PDF format.
	wdFormatPDF : 17,
	// XML document format.
	wdFormatXMLDocument : 12,
	// XML document format with macros enabled.
	wdFormatXMLDocumentMacroEnabled : 13
};

// 跳脫
function exit(r) {
	try {
		// objWord.Windows("filename.xlsx").Activate()

		// prevent the prompt box
		// 光是 `objWord.Documents.Close(VBAV.False)` 不夠。
		objWord.ActiveDocument.Saved = VBAV.True;

		// https://docs.microsoft.com/zh-TW/office/vba/api/word.document.close%28even%29
		// Close( SaveChanges, Filename, RouteWorkbook )
		// ActiveWorkbook.Close SaveChanges:=False
		objWord.Documents.Close(VBAV.False);
	} catch (e) {
	}

	objWord.Quit();
	// free
	// objWord = null;

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

var objWord;
try {
	// https://docs.microsoft.com/zh-tw/office/vba/api/excel.application(object)
	objWord = WScript.CreateObject("Word.Application");
} catch (e) {
	alert('No Automate Objects');
	exit(2);
}

// Warning: xml_file_path MUST be full path!
var xml_file_path = WScript.Arguments.length > 0 && WScript.Arguments(0);
// WScript.Echo(WScript.Arguments(0));

if (!xml_file_path) {
	alert('No xml_file_path specified!');
	exit(1);
}

try {
	// https://docs.microsoft.com/zh-tw/office/vba/api/word.document.open
	objWord.Documents.Open(xml_file_path, VBAV.False, VBAV.True, VBAV.False);
} catch (e) {
	alert('Cannot open xml_file_path: ' + xml_file_path);
	// e. name number description===message
	alert(e.message.replace(/\r/g, '\n'));
	exit(3);
}
// objWord.Visible = true;

var document = objWord.ActiveDocument;

// TODO: 將錯誤訊息用JSON寫在結果檔案中。

var save_to_file = WScript.Arguments.length > 2 && WScript.Arguments(2)
		|| xml_file_path.replace(/(?:\.[^.]+)?$/, '.docx');

if (!/:\\/.test(save_to_file) && !/^\.\.[\\\/]/.test(save_to_file)) {
	// default: save to "%HOMEPATH%\Documents"
	save_to_file = '.\\' + save_to_file;
}

try {
	fso.DeleteFile(save_to_file);
} catch (e) {
	// TODO: handle exception
}

// document.SaveAs(save_to_file, WdSaveOptions.wdSaveChanges);
// https://docs.microsoft.com/zh-tw/office/vba/api/word.saveas2
document.SaveAs2(save_to_file, WdSaveFormat.wdFormatDocumentDefault);
// alert(WshShell.CurrentDirectory);

exit(0);
