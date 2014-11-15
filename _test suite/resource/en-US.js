// Localized messages in 紀年轉換工具.
'use strict';
if (typeof CeL === 'function')
	CeL.gettext.set_text({
		'取得紀年' : 'Get',
		'之' : "'s",
		'輸出格式:' : 'Output format:',

		'測試範例' : 'EXAMPLE',
		'輸入紀錄' : 'RECORD',
		'使用說明' : 'CONCEPT',
		'紀年線圖' : 'ERA GRAPH',
		'資料圖層' : 'DATA LAYER',
		'曆譜' : 'CALENDAR',
		// batch convert
		'批次轉換' : 'BATCH',
		// tag text
		'標注文本' : 'TAGGING',
		'曆數處理' : 'DEVELOPMENT',
		'問題回報' : 'FEEDBACK',

		'前綴' : 'prefix',

		'中文數字' : 'To Chinese numerals',

		'增加此欄' : 'Add the column',
		'除去此欄' : 'Remove the column',
		'分類' : 'Group',
		// 'reform' : 'Adoption of the Gregorian calendar',

		'伊斯蘭曆' : 'Islamic Calendar',
		'希伯來曆' : 'Hebrew calendar',
		'傣曆' : 'Dai Calendar',
		'印度國定曆' : 'Indian national calendar',
		'巴哈伊曆' : "Bahá'í calendar",
		'科普特曆' : 'Coptic calendar',
		'衣索比亞曆' : 'Ethiopian calendar',
		// contemporary dates
		'共存紀年' : 'Contemporary Period',
		// Buddhist calendar
		'佛曆' : 'Chinese Buddhist',
		'民國' : 'Minguo',
		'檀紀' : 'Dangi',
		'黃帝紀元' : 'Huangdi',
		'泰國佛曆' : 'Thai Buddhist',
		// The Mesoamerican Long Count calendar
		'長紀曆' : 'Long Count',
		'皇紀' : 'Japanese imperial year',
		'羅馬建城' : 'Ab urbe condita',
		'塞琉古紀元' : 'Seleucid era',

		'年日期' : 'Ordinal date',
		'週日期' : 'Week date',
		'公元' : 'Common Era',
		'星期' : 'Week-day',
		// https://en.wikipedia.org/wiki/Chinese_calendar
		// '歲次' : 'Solar year',

		'公元日期' : 'Date of Common Era',
		'朝代紀年日期' : 'Date of calendar era',
		// https://en.wikipedia.org/wiki/Four_Pillars_of_Destiny
		'年月日干支' : 'Stem-branches',
		'四柱八字' : 'Four Pillars',

		'導覽列：' : 'Navigation: ',
		'所有國家' : 'All Countries',

		'難辨識時段：' : 'Unobvious periods: ',

		'請選擇所欲載入之資料圖層。' : 'Please select the layer you want to load.',
		'資料來源' : 'Data source',
		'已載入 %1 筆資料。' : function(domain_name, arg) {
			return '%1 ' + (1 < arg[1] ? 'entries' : 'entry') + ' loaded.';
		},

		'請注意：本欄僅供開發人員使用。' : 'WARNING: Only for developers.',

		'訊息提示與紀錄欄' : 'Log Console',
		'紀年轉換工具' : 'Era Calendar Converter'
	}, 'en-US');