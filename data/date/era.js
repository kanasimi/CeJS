/**
 * @name CeL function for era calendar.
 * @fileoverview 本檔案包含了東亞傳統曆法/中國傳統曆法/曆書/歷譜，農曆、夏曆、陰曆，中西曆/信史的日期轉換功能。<br />
 *               以歷史上使用過的曆數為準。用意不在推導曆法，而在對過去時間作正確轉換。因此僅用查表法，不作繁複天文計算。
 * 
 * @since 2013/2/13 12:45:44
 * 
 * TODO:<br />
 * 太複雜了，效率不高，重構。<br />
 * 舊唐書/卷11 <span data-era="~">寶應元年</span>..<span data-era="~">二年</span>..<span
 * data-era="~">二月甲午</span>，回紇登裏可汗辭歸蕃。<span data-era="~">三月甲辰</span>朔，襄州右兵馬使梁崇義殺大將李昭，據城自固，仍授崇義襄州刺史、山南東道節度使。<span
 * data-era="~">丁未</span>，袁傪破袁晁之眾於浙東。玄宗、肅宗歸祔山陵。自<span data-era="~">三月一日</span>廢朝，至於<span
 * data-era="~">晦日</span>，百僚素服詣延英門通名起居。<br />
 * CeL.era('二年春正月丁亥朔',{after:'寶應元年'})<br />
 * CeL.era('丁亥朔',{after:'寶應二年春正月'})<br />
 * CeL.era('寶應元年',{period_end:true})<br />
 * CeL.era('嘉慶十六年二月二十四日寅刻')===CeL.era('嘉慶十六年二月二十四日寅時')<br />
 * Period 獨立成 class<br />
 * 南明紹宗隆武1年閏6月月干支!=甲申, should be 癸未<br />
 * 月令別名 http://140.112.30.230/datemap/monthalias.php<br />
 * 月の異称 http://www.geocities.jp/okugesan_com/yougo.html<br />
 * 西周金文紀時術語. e.g., 初吉，既生霸，既望，既死霸
 * (http://wywu.pixnet.net/blog/post/22412573-%E6%9C%88%E7%9B%B8%E8%A8%98%E6%97%A5%E8%A1%A8)
 * 
 * 未來發展：<br />
 * 加入世界各國的對應機能。<br />
 * 
 * @example <code>


// demo / feature: 較常用、吸引人的特性。

CeL.log('公曆農曆(陽曆陰曆)日期互換:');

var 農曆, 公曆;

// 公曆←農曆特定日期。
農曆 = '農曆2014年1月1日';
公曆 = CeL.era(農曆).format('公元%Y年%m月%d日');
CeL.log(['農曆: ', 農曆, ' → 公曆: ', 公曆]);

// 農曆←公曆特定日期。
公曆 = '公元2014年1月1日';
農曆 = CeL.era({date:公曆.to_Date(), era:'農曆'}).format({parser:'CE',format:'%紀年%年年%月月%日日',locale:'cmn-Hant-TW'});
CeL.log(['公曆: ', 公曆, ' → 農曆: ', 農曆]);

// 今天的農曆日期。
var 今天的農曆日期 = (new Date).format('Chinese');
CeL.log(['今天是農曆: ', 今天的農曆日期]);
今天的農曆日期 = CeL.era({date:new Date, era:'農曆'}).format({parser:'CE',format:'農曆%年(%歲次)年%月月%日日',locale:'cmn-Hant-TW'});
CeL.log(['今天是農曆: ', 今天的農曆日期]);


CeL.env.era_data_load = function(country, queue) {
	if (!queue)
		// 判斷是否已載入。
		CeL.log('era data loaded.');
};


function test_era_data() {
	// 判斷是否已載入曆數資料。
	if (!CeL.era.loaded) {
		setTimeout(test_era_data, 80);
		return;
	}

// 設計上所要求必須通過之測試範例：測試正確性。
CeL.assert(['孺子嬰',CeL.era('初始').君主],'初始.君主: 孺子嬰#1');
CeL.assert(['孺子嬰','初始元年11月1日'.to_Date('era').君主],'初始.君主: 孺子嬰#2');
CeL.assert(['庚辰年庚辰月庚辰日庚辰時','一八八〇年四月二十一日七時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})],'可提供統一時間標準與各干支間的轉換。統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。');
CeL.assert(['清德宗光緒六年三月十三日',CeL.to_Chinese_numeral('一八八〇年四月二十一日七時'.to_Date('era').format({parser:'CE',format:'%朝代%君主%紀年%年年%月月%日日',locale:'cmn-Hant-TW'}))],'查詢一八八〇年四月二十一日七時的中曆日期');
CeL.assert(['1628年3月1日','明思宗崇禎1年1月26日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'可提供統一時間標準與各特殊紀年間的轉換。');
CeL.assert(['1628年3月1日','天聰二年甲寅月戊子日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'可提供統一時間標準與各特殊紀年間的轉換。');
CeL.assert(['1628年3月1日','天聰2年寅月戊子日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'可提供統一時間標準與各特殊紀年間的轉換。');
CeL.assert(['1880年4月21日','清德宗光緒六年三月十三日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'可提供統一時間標準與各特殊紀年間的轉換。');
CeL.assert(['1880年4月21日','清德宗光緒庚辰年三月十三日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'可提供統一時間標準與各特殊紀年間的轉換。');
CeL.assert(['1880年4月21日','清德宗光緒庚辰年庚辰月庚辰日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'可提供統一時間標準與各特殊紀年間的轉換。');
CeL.assert(['庚辰年庚辰月庚辰日','清德宗光緒六年三月十三日'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日',locale:'cmn-Hant-TW'})],'統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。');
CeL.assert(['庚辰年庚辰月庚辰日庚辰時','一八八〇年庚辰月庚辰日7時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})],'各特殊紀年→統一時間標準（中→西）：查詢某農曆+紀年/君主(帝王)對應的標準時間(如UTC+8)。');
CeL.assert(['庚辰年庚辰月庚辰日庚辰時','一八八〇年庚辰月庚辰日庚辰時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})],'各特殊紀年→統一時間標準（中→西）：查詢某農曆+紀年/君主(帝王)對應的標準時間(如UTC+8)。');
CeL.assert(['清德宗光緒六年三月十三日',CeL.to_Chinese_numeral('一八八〇年庚辰月庚辰日庚辰時'.to_Date('era').format({parser:'CE',format:'%朝代%君主%紀年%年年%月月%日日',locale:'cmn-Hant-TW'}))]);
CeL.assert(['庚辰年庚辰月庚辰日庚辰時','西元一八八〇年四月二十一日七時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})],'統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。');
CeL.assert(['庚辰年庚辰月庚辰日庚辰時','清德宗光緒六年三月十三日辰正一刻'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})],'統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）的日期資訊，如月干支等。');
CeL.assert(['252年5月26日','魏少帝嘉平4年5月1日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['252年6月24日','魏少帝嘉平4年閏5月1日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['252年6月24日','魏少帝嘉平4年閏月1日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['1357/1/21','元至正十七年'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 元至正十七年');
CeL.assert(['1357/1/21','元至正十七'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 元至正十七');
CeL.assert(['1357/1/21','至正十七年'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 至正十七年');
CeL.assert(['1357/1/21','至正十七'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 至正十七');
CeL.assert(['1357/1/21','元至正17年'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 元至正17年');
CeL.assert(['1357/1/21','元至正17'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 元至正17');
CeL.assert(['1357/1/21','至正17年'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 至正17年');
CeL.assert(['1357/1/21','至正17'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})],'parse 年 only: 至正17');
CeL.assert(['1880年4月21日','庚辰年庚辰月庚辰日庚辰時'.to_Date({parser:'era',base:'1850年'}).format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['1880年4月21日',CeL.era('庚辰年庚辰月庚辰日庚辰時',{base:'1850年'}).format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['260年6月26日','魏元帝景元元年6月1日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['260年6月26日','元帝景元元年6月1日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['260年6月26日','景元元年6月1日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})]);
CeL.assert(['260年6月26日','魏元帝景元元年'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'省略月日，當作年初。');
CeL.assert(['260年6月26日','元帝景元元年'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'省略月日，當作年初。');
CeL.assert(['260年6月26日','景元元年'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'省略月日，當作年初。');
CeL.assert(['260年7月25日','魏元帝景元元年7月'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'省略日，當作月初。');
CeL.assert(['260年7月25日','元帝景元元年7月'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'省略日，當作月初。');
CeL.assert(['260年7月25日','景元元年7月'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'省略日，當作月初。');
CeL.assert(['304/12/23', '西晉惠帝永安1年11月10日'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})]);
CeL.assert(['304/12/23', '前涼太祖永安1年11月10日'.to_Date('era').format({parser:'CE',format:'%Y/%m/%d'})]);
CeL.assert(['1911年11月30日','清遜帝宣統三年10月10日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'閏月或之後');
CeL.assert(['1329年9月1日','元文宗天曆2年8月8日'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'天曆在元明宗(1329年)時被重複使用，共計3年。');
CeL.assert(['761年10月4日','唐肅宗元年建戌月初二'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日'})],'唐肅宗上元二年九月二十一日去年號，稱元年，以建子之月為歲首。');
CeL.assert(['694年11月25日 戊子小','證聖元年正月初三'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日 %月干支%大小月',locale:'cmn-Hant-TW'})],'證聖元年正月初一辛巳（694年11月23日），改元證聖。');
CeL.assert(['1855年2月5日 '+(CeL.gettext?'星期二':2),'太平天囯乙榮五年正月初一甲寅'.to_Date('era').format({parser:'CE',format:'%Y年%m月%d日 %w',locale:'cmn-Hant-TW'})],'天历与夏历阳历对照及简表');
CeL.assert(['西漢武帝元朔6年12月1日','武帝元朔六年十二月甲寅'.to_Date('era').format({parser:'CE',format:'%紀年名%年年%月月%日日',locale:'cmn-Hant-TW'})],'秦至汉初( 前246 至前104) 历法研究');
CeL.assert(["癸丑年八月初一",'2033年8月25日'.to_Date().format('Chinese')],'2033年閏年八月初一');
CeL.assert(["癸丑年閏十一月初一",'2033年12月22日'.to_Date().format('Chinese')],'2033年閏十一月初一');
CeL.assert(["甲寅年正月初一",'2034年2月19日'.to_Date().format('Chinese')],'2034年正月初一');
CeL.assert(["癸丑年閏11月1日",'2033年12月22日'.to_Date().format({parser:'Chinese',numeral:null,format:'%歲次年%月月%日日'})],'2033年閏十一月初一');
CeL.assert(["癸丑年閏11月1日",'2033年12月22日'.to_Date().format({parser:'era',era:'中曆',format:'%歲次年%月月%日日',locale:'cmn-Hant-TW'})],'2033年閏十一月初一');
CeL.assert([undefined,CeL.era('2200/1/1').共存紀年]);
CeL.assert([undefined,CeL.era('-900/1/1').共存紀年]);
// .共存紀年 test: 可能需要因添加紀年而改變。
CeL.assert(/吳大帝嘉禾7年5月3日(.*?)\|魏明帝景初2年6月3日(.*?)\|蜀後主延熙1年5月2日/.test(CeL.era('238/6/2').共存紀年.join('|')),'統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）存在的所有紀年與資訊。#1');
CeL.assert(['弥生時代神功皇后38年|高句麗東川王12年6月3日|新羅助賁尼師今9年6月3日|吳大帝嘉禾7年5月3日|百濟古尒王5年6月3日|魏明帝景初2年6月3日|魏燕王紹漢2年6月3日',CeL.era('延熙1年5月2日').共存紀年.join('|')],'各特殊紀年→統一時間標準（中→西）：查詢某朝代/君主(帝王)所有的共存紀年與資訊。#1');
CeL.assert(/魏明帝景初3年後12月8日(.*?),蜀後主延熙2年12月8日(.*?),吳大帝赤烏2年12月8日/.test(CeL.era('240-1-19').共存紀年.join()),'測試特殊月名');
CeL.assert(['弥生時代神功皇后40年|高句麗東川王13年後12月8日|新羅助賁尼師今10年後12月8日|百濟古尒王6年後12月8日|蜀後主延熙2年12月8日|吳大帝赤烏2年12月8日',CeL.era('魏明帝景初3年後12月8日').共存紀年.join('|')],'測試特殊月名');
CeL.assert(['高麗忠肅王16年8月8日|鎌倉時代後醍醐天皇嘉暦4年8月8日|陳憲宗開祐1年8月8日|元文宗天曆2年8月8日',CeL.era('1329年9月1日').共存紀年.join('|')],'統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）存在的所有紀年與資訊。#2');
CeL.assert(['後黎神宗永祚10年1月26日|朝鮮仁祖6年1月26日|莫光祖隆泰6年1月26日|江戸時代後水尾天皇寛永5年1月26日|後金太宗天聰2年1月26日|明思宗崇禎1年1月26日',CeL.era('1628年3月1日').共存紀年.join('|')],'統一時間標準→各特殊紀年（西→中）：查詢某時間點（時刻）存在的所有紀年與資訊。#3');
CeL.assert(['後黎神宗永祚10年1月26日|朝鮮仁祖6年1月26日|莫光祖隆泰6年1月26日|江戸時代後水尾天皇寛永5年1月26日|明思宗崇禎1年1月26日',CeL.era('中國清太宗天聰2年1月26日').共存紀年.join('|')],'各特殊紀年→統一時間標準（中→西）：查詢某朝代/君主(帝王)所有的共存紀年與資訊。#2');
CeL.assert(['後黎神宗永祚10年1月26日|朝鮮仁祖6年1月26日|莫光祖隆泰6年1月26日|江戸時代後水尾天皇寛永5年1月26日|後金太宗天聰2年1月26日',CeL.era('中國明思宗崇禎1年1月26日').共存紀年.join('|')],'各特殊紀年→統一時間標準（中→西）：查詢某朝代/君主(帝王)所有的共存紀年與資訊。#3');
//
CeL.assert(["唐代宗寶應2年1月13日",CeL.era('二年春正月丁亥', {base : '寶應元年'}).format({parser:'CE',format:'%朝代%君主%紀年%年年%月月%日日',locale:'cmn-Hant-TW'})],'寶應二年春正月丁亥');
CeL.assert(["唐代宗寶應2年1月13日",CeL.era('丁亥', {base : '寶應二年春正月'}).format({parser:'CE',format:'%朝代%君主%紀年%年年%月月%日日',locale:'cmn-Hant-TW'})],'寶應二年春正月丁亥 (by base)');
CeL.assert(["763/5/17",CeL.era('寶應二年三月晦日').format({parser:'CE',format:'%Y/%m/%d'})],'寶應二年三月晦日');
CeL.assert(["唐代宗寶應|二|三|一",CeL.era('三月一日', {parse_only : true, base : '寶應二年春正月'}).slice(1).join('|')], 'parse_only + base: 寶應二年春正月');
CeL.assert(["唐代宗寶應|二|三|一",CeL.era('三月一日', {parse_only : true, base : '寶應二年'}).slice(1).join('|')], 'parse_only + base: 寶應二年');
CeL.assert(["唐代宗寶應|二|三|晦",CeL.era('晦日', {parse_only : true, base : '代宗寶應二年三月一日'}).slice(1).join('|')], 'parse_only + base: 代宗寶應二年三月一日');
CeL.assert(["134/7/29",CeL.era('陽嘉3年6月20日', {get_range : true})[1].format({parser:'CE',format:'%Y/%m/%d'})],'陽嘉3年6月20日.末');
CeL.assert(["134/8/8",CeL.era('陽嘉3年6月', {get_range : true})[1].format({parser:'CE',format:'%Y/%m/%d'})],'陽嘉3年6月.末');
CeL.assert(["135/2/1",CeL.era('陽嘉3年', {get_range : true})[1].format({parser:'CE',format:'%Y/%m/%d'})],'陽嘉3年.末');
CeL.assert(["136/2/20",CeL.era('陽嘉', {get_range : true})[1].format({parser:'CE',format:'%Y/%m/%d'})],'陽嘉.末');

// 參照紀年之演算機制
CeL.assert([8,CeL.era('明宣宗宣德',{get_era:1}).calendar[7].leap],'明宣宗宣德8年閏8月');
//setup 8月–, CE~CE
CeL.era.set('曆A|1433/8/15~9/13|:宣德');
//setup 閏8月–
CeL.era.set('曆B|1433/9/14~10/12|:宣德');
//setup 9月–
CeL.era.set('曆C|1433/10/13~11/11|:宣德');
//test part
var _c0=CeL.era('宣德',{get_era:1}).calendar[8-1];
CeL.assert(['30,29,30,29,29,30,29,30,29,30,30,30,29',_c0.join(',')],'宣德8年 calendar data');
// 取得 era 第一年之 calendar data, and do test.
_c0=CeL.era('曆A',{get_era:1}).calendar[0];CeL.assert(['8,6,1',[_c0.start,_c0.length,+_c0.leap].join()],'測試 參照紀年之演算機制:8月–');
_c0=CeL.era('曆B',{get_era:1}).calendar[0];CeL.assert(['9,5,0',[_c0.start,_c0.length,+_c0.leap].join()],'測試 參照紀年之演算機制:閏8月–');
_c0=CeL.era('曆C',{get_era:1}).calendar[0];CeL.assert(['9,4,NaN',[_c0.start,_c0.length,+_c0.leap].join()],'測試 參照紀年之演算機制:9月–');

// test period_end of era()
CeL.assert([CeL.era('1627年',{date_only:true,period_end:true}).format('CE'), '1627年'.to_Date({parser:'CE',period_end:true}).format('CE')],'period_end of era() 年');
CeL.assert([CeL.era('1627年9月',{date_only:true,period_end:true}).format('CE'), '1627年9月'.to_Date({parser:'CE',period_end:true}).format('CE')],'period_end of era() 月');
CeL.assert([CeL.era('1627年9月3日',{date_only:true,period_end:true}).format('CE'), '1627年9月3日'.to_Date({parser:'CE',period_end:true}).format('CE')],'period_end of era() 日');
CeL.assert(['0001年'.to_Date().format(),'0001/1/1'.to_Date().format()],'1/1/1');
CeL.assert(['前1年'.to_Date().format(),'-1年'.to_Date().format()],'year -1');
CeL.assert(['前1年'.to_Date({parser:'CE',period_end:true}).format('CE'),'0001年'.to_Date('CE').format('CE')],'period_end of CE');
CeL.assert([CeL.era('前1年',{period_end:true}).format('CE'),'0001年'.to_Date('CE').format('CE')],'period_end of CE@era()');


CeL.info('測試全部通過。');

}

CeL.run('data.date.era', test_era_data);


 // should be error: 清任一紀年無第一八八〇年。
 '清一八八〇年四月二十一日七時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})
 // should be error
 '元一八八〇年四月二十一日七時'.to_Date('era').format({parser:'CE',format:'%歲次年%月干支月%日干支日%時干支時',locale:'cmn-Hant-TW'})



 // ---------------------------------------

 廢棄:

 查找：某 era name → era data:
 1st: [朝代 or 朝代兼紀年] from dynasty{*}
 2ed: [朝代:君主(帝王) list] from dynasty{朝代:{*}}
 3ed: [朝代君主(帝王):紀年 list] from dynasty{朝代:{君主(帝王):[]}}

 查找：某日期 → era data:
 1. get start date: 定 era_start_UTC 所有 day 或之前的 index。
 2. get end date, refrence:
 遍歷 era_end_UTC，處理所有（結束）日期於 day 之後的，即所有包含此日期的 data。


 </code>
 */

'use strict';
// 'use asm';

if (typeof CeL === 'function')
	CeL.run({
		name : 'data.date.era',
		// data.code.compatibility. : for String.prototype.repeat(),
		// String.prototype.trim()
		// data.native. : for Array.prototype.search_sorted()
		// data.date. : 干支
		// application.locale. : 中文數字
		// includes() @ data.code.compatibility.
		require : 'data.code.compatibility.'
				+ '|data.native.|application.locale.|data.date.String_to_Date',

		code : function(library_namespace) {

			// requiring
			var String_to_Date;
			eval(this.use());

			// ---------------------------------------------------------------------//
			// 定義基本常數。

			// 工具函數。
			function generate_pattern(pattern_source, delete_干支, flag) {
				pattern_source = pattern_source
				// 數字
				.replace(/數/g, '(?:[' + library_namespace
				// "有": e.g., 十有二月。
				.positional_Chinese_numerals_digits + '百千]|[十廿卅]有?)');
				if (delete_干支)
					pattern_source = pattern_source.replace(/干支\|/g, '');
				else
					pattern_source = pattern_source
					// 天干
					.replace(/干/g, '[' + library_namespace.STEM_LIST + ']')
					// 地支
					.replace(/支/g, '[' + library_namespace.BRANCH_LIST + ']');
				return new RegExp(pattern_source, flag || '');
			}

			var is_Date = library_namespace.is_Date,

			// or try Array.prototype.splice()
			Array_push = Array.prototype.push.apply.bind(Array.prototype.push),

			Date_to_String_parser = library_namespace.Date_to_String.parser,
			//
			strftime = Date_to_String_parser.strftime,

			// 一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000.
			ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1),

			CE_REFORM_YEAR = library_namespace.Gregorian_reform_date
					.getFullYear(),

			CE_COMMON_YEAR_LENGTH_VALUE
			//
			= new Date(2, 0, 1) - new Date(1, 0, 1),
			//
			CE_LEAP_YEAR_LENGTH_VALUE = CE_COMMON_YEAR_LENGTH_VALUE
					+ ONE_DAY_LENGTH_VALUE,
			//
			CE_REFORM_YEAR_LENGTH_VALUE = library_namespace
			//
			.is_leap_year(CE_REFORM_YEAR, true) ? CE_LEAP_YEAR_LENGTH_VALUE
					: CE_COMMON_YEAR_LENGTH_VALUE,

			CE_COMMON_YEAR_DATA = Object.seal(library_namespace
					.get_month_days()),
			//
			CE_LEAP_YEAR_DATA = Object.seal(library_namespace
					.get_month_days(true)),
			//
			CE_REFORM_YEAR_DATA = library_namespace
					.get_month_days(CE_REFORM_YEAR),

			// cache
			gettext_date = library_namespace.gettext.date,

			// 專門供搜尋各特殊紀年使用。
			era_search_pattern, era_key_list,

			// search_index[ {String}key : 朝代、君主(帝王)、帝王紀年、年號紀年、國家 ]
			// = Set(對應之 era_list index list)
			// = [ Set(對應之 era_list index list), 'key of search_index',
			// 'key'..
			// ]
			search_index = library_namespace.null_Object(),

			// constant 常數。

			// http://zh.wikipedia.org/wiki/Talk:%E8%BE%B2%E6%9B%86
			// 將公元日時換算為夏曆日時，1929年1月1日以前，應將時間換為北京紫禁城（東經116.4度）實際時間，1929年1月1日開始，則使用東八區（東經120度）的標準時間。
			DEFAULT_TIMEZONE = String_to_Date.zone.CST,

			// http://zh.wikipedia.org/wiki/%E7%AF%80%E6%B0%A3
			// 中氣持續日期/前後範疇。
			中氣日_days = 3,
			// 中氣發生於每月此日起 (中氣日_days - 1) 日間。
			// assert: 在整個作業年代中，此中氣日皆有效。起碼須包含
			// proleptic Gregorian calendar -1500 – 2100 CE。
			中氣日 = [ 19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 20 ],

			// const: 基本上與程式碼設計合一，僅表示名義，不可更改。(== -1)
			NOT_FOUND = ''.indexOf('_'),

			// 起始年月日。
			// 基本上與程式碼設計合一，僅表示名義，不可更改。
			START_YEAR = 1, START_MONTH = 1, START_DATE = 1,

			// 閏月名前綴。
			// 基本上與程式碼設計合一，僅表示名義，不可更改。
			LEAP_MONTH_PREFIX = '閏',

			// (年/月分資料=[年分各月資料/月分日數])[NAME_KEY]=[年/月分名稱]
			NAME_KEY = 'name', LEAP_MONTH_KEY = 'leap',
			// 月次，歲次
			START_KEY = 'start',
			//
			START_DATE_KEY = 'start date',
			//
			MONTH_NAME_KEY = 'month name',
			//
			MINUTE_OFFSET_KEY = 'minute offset',

			COUNT_KEY = 'count',

			PERIOD_KEY = '時期',
			//
			PERIOD_PREFIX = 'period:',
			//
			PERIOD_PATTERN = new RegExp('^' + PERIOD_PREFIX + '(.+)$'),

			// set normal month count of a year.
			MONTH_COUNT = 12,

			// 可能出現的最大日期值。
			MAX_DATE_NUMBER = 1e5,

			// 二進位。
			// 基本上與程式碼設計合一，僅表示名義，不可更改。
			RADIX_2 = 2,

			/**
			 * parseInt( , radix) 可處理之最大 radix， 與 Number.prototype.toString ( [
			 * radix ] ) 可用之最大基數 (radix, base)。<br />
			 * 10 Arabic numerals + 26 Latin alphabet.
			 * 
			 * @inner
			 * @see <a href="http://en.wikipedia.org/wiki/Hexadecimal"
			 *      accessdate="2013/9/8 17:26">Hexadecimal</a>
			 */
			PACK_RADIX = 10 + 26,

			LEAP_MONTH_PADDING = new Array(
			// 閏月會有 MONTH_COUNT 個月 + 1個閏月 筆資料。
			(MONTH_COUNT + 1).toString(RADIX_2).length + 1).join(0),

			// 每年月數資料的固定長度。
			// 依當前實作法，最長可能為長度 4。
			YEAR_CHUNK_SIZE = parseInt(
			// 為了保持應有的長度，最前面加上 1。
			'1' + new Array(MONTH_COUNT).join(
			// 農曆通常是大小月相間。
			'110').slice(0, MONTH_COUNT + 1)
			// 13 個月可以二進位 1101 表現。
			+ (MONTH_COUNT + 1).toString(RADIX_2), RADIX_2)
			//
			.toString(PACK_RADIX).length,

			PACKED_YEAR_CHUNK_PADDING = new Array(
			// using String.prototype.repeat
			YEAR_CHUNK_SIZE + 1).join(' '),

			// 篩選出每年月數資料的 pattern。
			CALENDAR_DATA_SPLIT_PATTERN = new RegExp('[\\s\\S]{1,'
			// 或可使用: /[\s\S]{4}/g
			+ YEAR_CHUNK_SIZE + '}', 'g'),

			// date_data 0/1 設定。
			// 農曆一個月是29日或30日。
			大月 = 30, 小月 = 29,
			// 0:30, 1:29
			// 注意:會影響到 parse_era()!
			// 基本上與程式碼設計合一，僅表示名義，不可更改。
			MONTH_DAYS = [ 大月, 小月 ],

			// month length / month days: 公曆大月為31天。
			// 僅表示名義，不可更改。
			CE_MONTH_DAYS = 31,

			// 所有所處理的曆法中，可能出現的每月最大日數。
			// now it's CE.
			MAX_MONTH_DAYS = CE_MONTH_DAYS,

			MONTH_DAY_INDEX = library_namespace.null_Object(),

			// 辨識曆數項。
			// 基本上與程式碼設計合一，不可更改。
			// 見 extract_calendar_data()
			// [ all, front, date_name, calendar_data, back ]
			// 曆數_PATTERN =
			// /(?:([;\t]|^))(.*?)=?([^;\t=]+)(?:([;\t]|$))/g,
			//
			// [ all, date_name, calendar_data, back ]
			曆數_PATTERN = /(.*?)=?([^;\t=]+)([;\t]|$)/g,
			// 以最快速度測出已壓縮曆數。
			// 見 initialize_era_date()
			已壓縮曆數_PATTERN = /^(?:[\d\/]*=)?[\da-z]{3}[\da-z ]*$/,

			// matched: [ , 閏, 月分號碼 ]
			// TODO: 冬月, 臘月.
			// TODO: [閏後]
			// TODO: 闰月
			MONTH_NAME_PATTERN = /^(閏)?([正元]|[01]?\d)月?$/,

			干支_PATTERN = generate_pattern('^干支$'),

			// 年分名稱。
			年_SOURCE = /([前\-−‐]?\d{1,4}|干支|前?數{1,4}|元)[\/.\-年]\s*/.source,
			// 月分名稱。
			月_SOURCE = /\s*([^\s月\/.\-年]{1,4})[\/.\-月]/.source,
			// 日期名稱。
			日_SOURCE = /\s*初?(\d{1,2}|數{1,3}|[^\s日朔晦望]{1,5})日?/.source,

			季_LIST = '春夏秋冬',
			// 季名稱。e.g., 春正月
			季_SOURCE = '[' + 季_LIST + ']?王?',

			// see: 時刻_to_hour()
			時刻_PATTERN = generate_pattern(
			// '(?:[早晚夜])'+
			/(支)(?:時?\s*([初正])([初一二三123])刻|時)/.source),

			// should matched: 月|年/|/日|月/日|/月/日|年/月/|年/月/日
			// ^(年?/)?月/日|年/|/日|月$
			// matched: [ , 年, 月, 日 ]
			// TODO: 冬月, 臘月.
			起始日碼_PATTERN =
			// [日朔晦望]
			/^(-?\d+|元)?[\/.\-年](閏?(?:[正元]|[01]?\d))[\/.\-月]?(?:(初?\d{1,2}?|[正元])日?)?$/
			//
			,

			// 取得/保存前置資訊。
			前置_SOURCE = '^(.*?)',
			// 取得/保存後置資訊。
			後置_SOURCE = '(.*?)$',

			單數字_PATTERN = generate_pattern('^數$'),

			// 當前的 ERA_DATE_PATTERN 必須指明所求年/月/日，無法僅省略日。
			// 否則遇到'吳大帝太元元年1月1日'之類的無法處理。
			// 若有非數字，干支之年分名稱，需要重新設計！
			// matched: [ , prefix, year, month, date, suffix ]
			ERA_DATE_PATTERN = generate_pattern(前置_SOURCE + 年_SOURCE + 季_SOURCE
					+ 月_SOURCE + 日_SOURCE + 後置_SOURCE),

			// 減縮版 ERA_DATE_PATTERN: 省略日期，或亦省略月分。
			// matched: [ , prefix, year, numeral month, month, suffix ]
			ERA_DATE_PATTERN_NO_DATE = generate_pattern(前置_SOURCE + 年_SOURCE
					+ 季_SOURCE
					// 月分名稱。
					+ /\s*(?:([01]?\d)|([^\s月\/.\-年]{1,3})月)?/.source
					+ 後置_SOURCE),

			// parse 年 only
			// matched: [ , prefix, year, , , suffix ]
			ERA_DATE_PATTERN_YEAR = generate_pattern(前置_SOURCE
			// 年分名稱。
			+ /([前\-−‐]?\d{1,4}|干支|前?數{1,4})[\/.\-年]?()()/.source + 後置_SOURCE),

			// 用來測試如 "一八八〇"
			POSITIONAL_DATE_NAME_PATTERN = new RegExp('^['
					+ library_namespace.positional_Chinese_numerals_digits
					+ ']{1,4}$'),

			ERA_PATTERN =
			//
			/^([東西南北前後]?[^\s])(.{1,3}[祖宗皇帝王君公侯伯叔主子后])(.{0,8})(?:([一二三四五六七八九十]{1,3})年)?/
			//
			,

			持續日數_PATTERN = /^\s*\+\d+\s*$/,

			// [ 紀年曆數, 起始日期名, 所參照之紀年或國家 ]
			參照_PATTERN = /^(?:(.*?)=)?:(.+)$/,

			// 可指示尚存疑/爭議資料，例如傳說時代之資料。
			// https://en.wikipedia.org/wiki/Circa
			準確程度_ENUM = {
				疑 : '尚存疑',
				// 為傳說時代之資料
				傳說 : '傳說時代'
			},

			主要索引名稱 = '紀年,君主,朝代,國家'.split(','),

			// 配合 parse_era() 與 get_next_era()。
			// 因為須從範圍小的開始搜尋，因此範圍小的得排前面！
			紀年名稱索引值 = {
				era : 0,
				紀年 : 0,
				年號 : 0,
				// 紀年法: 日本年號, 元号/年号
				元号 : 0,

				// 領袖, 首領, monarch, ruler
				君主 : 1,
				// 君主姓名
				君主名 : 1,
				// 表字,小字
				君主字 : 1,
				帝王 : 1,
				天皇 : 1,
				// 自唐朝以後，廟號在前、諡號在後的連稱方式，構成已死帝王的全號。
				// 唐朝以前的皇帝有廟號者較少，所以對歿世的皇帝一般簡稱諡號，如漢武帝、隋明帝，不稱廟號。唐朝以後，由於皇帝有廟號者佔絕大多數，所以多稱廟號，如唐太宗、宋太宗等。
				// NG: 謚號
				諡 : 1,
				廟號 : 1,
				// 尊號: 君主、后妃在世時的稱呼。不需避諱
				// 尊號 : 1,
				封號 : 1,
				分期 : 1,

				// dynasty
				朝代 : 2,
				政權 : 2,
				國號 : 2,

				// 王朝, 帝國, Empire

				// state 州
				// Ancient Chinese states
				// https://en.wikipedia.org/wiki/Ancient_Chinese_states
				諸侯國 : 2,
				// 歷史時期 period. e.g., 魏晉南北朝, 五代十國
				時期 : 2,
				// period : 2,

				// country
				// e.g., 中國, 日本
				國家 : 3
			// nation
			// 民族 : 3
			// 地區, 區域. e,g, 中亞, 北亞, 東北亞
			},

			Period_屬性歸屬 = Object.assign({
				// 君主出生日期
				生 : 1,
				// 君主逝世日期
				卒 : 1,
				// 君主在位期間: 上任/退位
				在位 : 1
			}, 紀年名稱索引值),

			// era data refrence 對應
			// sorted by: start Date 標準時間(如UTC+8) → parse_era() 插入順序.
			era_list = [],

			// era tree.
			// period_root[國家]
			// = 次階層 Period
			period_root = new Period,

			// default date parser.
			// 採用 'Chinese' 可 parse 日干支。
			DEFAULT_DATE_PARSER = 'Chinese',
			// 不使用 parser。
			PASS_PARSER = [ 'PASS_PARSER' ],
			// 標準時間（如公元紀年）分析器
			standard_time_parser = 'CE',
			// default date format
			// 基本上與程式碼設計合一，不可更改。
			DATE_NAME_FORMAT = '%Y/%m/%d',
			// pass to date formatter.
			standard_time_format = {
				parser : standard_time_parser,
				format : DATE_NAME_FORMAT
			}, standard_year_format = {
				parser : standard_time_parser,
				format : '%Y年'
			},

			// @see get_era_name(type)

			// 基本上僅表示名義。若欲更改，需考慮對外部程式之衝擊。
			SEARCH_STRING = 'dynasty', WITH_PERIOD = 'period',

			// 十二生肖，或屬相。
			// Chinese Zodiac
			十二生肖_LIST = '鼠牛虎兔龍蛇馬羊猴雞狗豬'.split(''),
			// 陰陽五行
			// The Wu Xing, (五行 wŭ xíng) also known as the Five
			// Elements, Five
			// Phases, the Five Agents, the Five Movements, Five
			// Processes, and
			// the Five Steps/Stages
			陰陽五行_LIST = '木火土金水'.split(''),

			// 各月の別名, 日本月名
			// https://ja.wikipedia.org/wiki/%E6%97%A5%E6%9C%AC%E3%81%AE%E6%9A%A6#.E5.90.84.E6.9C.88.E3.81.AE.E5.88.A5.E5.90.8D
			月の別名_LIST = '睦月,如月,弥生,卯月,皐月,水無月,文月,葉月,長月,神無月,霜月,師走'.split(','),
			// '大安赤口先勝友引先負仏滅'.match(/../g)
			六曜_LIST = '大安,赤口,先勝,友引,先負,仏滅'.split(','),
			//
			曜日_LIST = '日月火水木金土'.split(''),
			// "十二值位星"（十二值:建除十二神,十二值位:十二建星） @ 「通勝」或農民曆
			// 建、除、滿、平、定、執、破、危、成、收、開、閉。
			// http://jerry100630902.pixnet.net/blog/post/333011570-%E8%AA%8D%E8%AD%98%E4%BD%A0%E7%9A%84%E5%A2%83%E7%95%8C~-%E9%99%BD%E6%9B%86%E3%80%81%E9%99%B0%E6%9B%86%E3%80%81%E9%99%B0%E9%99%BD%E5%90%88%E6%9B%86---%E7%AF%80%E6%B0%A3-
			// 十二建星每月兩「建」，即正月建寅、二月建卯、三月建辰……，依此類推。正月為寅月，所以六寅日（甲寅、丙寅、戊寅、庚寅、壬寅）中必須有兩個寅日和「建」遇到一起；二月為卯月，所以六卯日（乙卯、丁卯、己卯、辛卯、癸卯）中必須有兩個卯日和「建」遇到一起，否則就不對。逢節（立春、驚蜇、清明、立夏、芒種、小暑、立秋、白魯、寒露、立冬、大雪、小寒）兩個建星相重，這樣才能保證本月第一個與月支相同之日與「建」相遇。
			十二直_LIST = '建除満平定執破危成納開閉'.split(''),
			// "廿八星宿" @ 農民曆
			二十八宿_LIST = '角亢氐房心尾箕斗牛女虚危室壁奎婁胃昴畢觜参井鬼柳星張翼軫'.split(''),
			// 二十八宿にあり二十七宿にはない宿は、牛宿である。
			// will be splited latter.
			二十七宿_LIST = '角亢氐房心尾箕斗女虚危室壁奎婁胃昴畢觜参井鬼柳星張翼軫',
			// 旧暦（太陽太陰暦）における月日がわかれば、自動的に二十七宿が決定される。
			// 各月の朔日の宿
			二十七宿_offset = '室奎胃畢参鬼張角氐心斗虚'.split('');

			// ---------------------------------------------------------------------//
			// 初始調整並規範基本常數。

			(function() {
				var a = [ 2, 1 ];
				Array_push(a, [ 4, 3 ]);
				if (a.join(',') !== "2,1,4,3")
					Array_push = function(array, list) {
						return Array.prototype.push.apply(array, list);
					};

				a = library_namespace.Gregorian_reform_date;
				a = [ a.getFullYear(), a.getMonth() + 1, a.getDate() ];
				if (CE_REFORM_YEAR_LENGTH_VALUE > CE_COMMON_YEAR_LENGTH_VALUE
						&& a[1] < 3 && library_namespace
						//
						.is_different_leap_year(a[0], true))
					CE_REFORM_YEAR_LENGTH_VALUE = CE_COMMON_YEAR_LENGTH_VALUE,
							CE_REFORM_YEAR_DATA[1]--;
				var d = library_namespace.Julian_shift_days(a);
				CE_REFORM_YEAR_LENGTH_VALUE += d * ONE_DAY_LENGTH_VALUE;
				CE_REFORM_YEAR_DATA[a[1] - 1] += d;
				// TODO: 無法處理 1582/10/15-30!!

				Object.seal(CE_REFORM_YEAR_DATA);

				a = 二十七宿_offset;
				d = 二十七宿_LIST.length;
				// 二十七宿_offset[m] 可得到 m月之 offset。
				二十七宿_offset = new Array(START_MONTH);
				a.forEach(function(first) {
					二十七宿_offset.push(二十七宿_LIST.indexOf(first) - START_DATE);
				});

			})();

			二十七宿_LIST = 二十七宿_LIST.split('');

			if (false)
				// assert: this is already done.
				主要索引名稱.forEach(function(name, index) {
					紀年名稱索引值[name] = index;
				});

			// 預設國家。
			// parse_era.default_country = '中國';

			// clone MONTH_DAYS
			parse_era.days = [];

			parse_era.chunk_size = YEAR_CHUNK_SIZE;

			MONTH_DAYS.forEach(function(days, index) {
				MONTH_DAY_INDEX[days] = index;
				parse_era.days.push(days);
			});

			// ---------------------------------------------------------------------//
			// private 工具函數：search_index 處理。search_index public interface。
			// TODO: 增加效率。
			// search_index 必須允許以 ({String}key in search_index)
			// 的方式來偵測是否具有此 key。

			function for_each_era_of_key(key, operator, queue) {
				// 預防循環參照用。
				function not_in_queue(key) {
					if (!queue.has(key)) {
						queue.add(key);
						return true;
					}
					library_namespace.debug('skip [' + eras[i] + ']. (queue: ['
							+ queue.values() + '])', 1, 'for_each_era_of_key');
				}

				var eras = search_index[key],
				//
				for_single = function(era) {
					if (not_in_queue(era))
						operator(era);
				};

				if (!library_namespace.is_Set(queue))
					queue = new Set;
				// assert: queue is Set.

				// era: Era, Set, []
				if (Array.isArray(eras)) {
					eras[0].forEach(for_single);

					for (var i = 1; i < eras.length; i++)
						if (not_in_queue(eras[i]))
							for_each_era_of_key(eras[i], operator, queue);
				} else
					eras.forEach(for_single);
			}

			// bug: 當擅自改變子紀年時，將因 cache 而無法得到正確的 size。
			function era_count_of_key(key, queue) {
				var eras = search_index[key],
				//
				size = ('size' in eras) && eras.size;

				if (!size && Array.isArray(eras)) {
					size = eras[0].size;

					if (Array.isArray(queue)) {
						if (queue.includes(key)) {
							library_namespace.debug(
							// 將造成之後遇到此 key 時，使 for_each_era_of_key() 不斷循環參照。
							'別名設定存在循環參照！您應該改正別名設定: ' + queue.join('→') + '→'
									+ key, 1, 'era_count_of_key');
							return 0;
						}
						queue.push(key);
					} else
						queue = [ key ];
					for (var i = 1; i < eras.length; i++)
						size += era_count_of_key(eras[i], queue);
					eras.size = size;
				}

				return size;
			}

			// 取得以 key 登錄之所有 era。
			// get era Set of {String}key
			function get_era_Set_of_key(key, list) {
				var eras = search_index[key];

				if (Array.isArray(eras))
					if (eras.cache)
						eras = eras.cache;
					else {
						var i = 1, length = eras.length,
						// 不動到 search_index
						set = library_namespace.Set_from_Array(eras[0]);
						for (; i < length; i++)
							for_each_era_of_key(eras[i], function(era) {
								// console.log(String(era));
								set.add(era);
							});
						eras.cache = set;
						eras = set;
					}

				return eras;
			}

			// 登錄 key，使 search_index[key] 可以找到 era。
			// 可處理重複 key 之情況，而不覆蓋原有值。
			function add_to_era_by_key(key, era) {
				if (!key || !era || key === era)
					return;

				var eras = search_index[key];
				if (!eras)
					// 初始化 search_index[key]。
					if (typeof era !== 'string') {
						// search_index[]: Set, [原生 Set, alias String 1,
						// alias
						// String 2, ..]
						(search_index[key] = eras = library_namespace
								.Set_from_Array(Array.isArray(era)
								// era: Era, string, []
								? era : [ era ])).origin = true;
						return;

					} else
						(search_index[key] = eras = new Set).origin = true;

				if (era instanceof Era) {
					if (Array.isArray(eras)) {
						// .size, .cache 已經不準。
						delete eras.size;
						delete eras.cache;
						// 添加在原生 Set: 名稱本身即為此 key。
						eras = eras[0];
					}
					eras.add(era);

					// else assert: typeof era==='string'
				} else if (Array.isArray(eras)) {
					eras.push(era);
					// .size, .cache 已經不準。
					delete eras.size;
					delete eras.cache;
				} else
					(search_index[key] = eras = [ eras, era ]).origin = true;
			}

			function append_period(object, name) {
				var start = object.start,
				//
				format = object.精 === '年' ? standard_year_format
						: standard_time_format;
				name.push(' (', (is_Date(start) ? start : new Date(start))
						.format(format),
				// [\-–－—~～〜至]
				'~', new Date(object.end
				// 向前一天以取得最後一日。
				- ONE_DAY_LENGTH_VALUE).format(format), ')');
			}

			// ---------------------------------------------------------------------//
			// bar 工具函數。

			// TODO: comparator()
			// sorted_array: sorted by .[start_key]
			function order_bar(sorted_array, start_key, end_key, comparator) {
				if (sorted_array.length === 0)
					return [];

				if (!start_key)
					// .start
					start_key = 'start';
				if (!end_key)
					// .end
					end_key = 'end';

				var bars = [], all_end = -Infinity,
				// 置入最後欲回傳的階層。
				layer = [ bars ];

				function settle(do_reset) {
					// clear. 結清。
					// 寫入/紀錄階層序數。

					if (bars.length > 1) {
						// sort 前一區間。
						// TODO: 若有接續前後者的，酌加權重。
						bars.sort(function(a, b) {
							// 大→小。
							return b.weight - a.weight;
						});

						if (do_reset)
							layer.push(bars = []);
					}
				}

				sorted_array.forEach(function(object) {
					var bar,
					//
					start = object[start_key], end = object[end_key];

					if (start < all_end) {
						// 有重疊。

						if (bars.length === 1 && bars[0].length > 1) {
							// 先結清一下前面沒重疊的部分，只擠出最後一個元素。
							// bars : last bar
							bars = bars[0];
							// bar : 最後一個元素。
							bar = bars.pop();
							bars.end = bars[bars.length - 1].end;
							bars.weight -= bar.end - bar.start;
							// 重建新的 bar。
							(bars = [ bar ]).weight -= bar.end - bar.start;
							bars.end = bar.end;
							// 置入最後欲回傳的階層。
							layer.push(bars = [ bars ]);
							// reset
							bar = null;
						}

						// 取 bar 之 end 最接近 object.start 者。
						var
						// 最接近間距。
						closest_gap = Infinity,
						// 最接近之 bar index。
						closest_index = undefined;

						bars.forEach(function(bar, i) {
							var gap = start - bar.end;
							if (gap === 0
									|| 0 < gap
									&& (
									// TODO: comparator()
									closest_index === undefined
									//
									|| gap < end - start ? gap < closest_gap
									// 當 gap 極大時，取不同策略。
									: bar.end - bar.start - gap
									//
									< bars[closest_index].end
											- bars[closest_index].start
											//
											- closest_gap)) {
								closest_gap = gap;
								closest_index = i;
							}
						});

						if (closest_index !== undefined)
							bar = bars[closest_index];

					} else {
						settle(true);
						bar = bars[0];
					}

					// start = 本 object 之 weight。
					start = end - start;
					// 將本 object 加入 bars 中。
					if (bar) {
						bar.push(object);
						bar.weight += start;
					} else {
						// 初始化。
						bars.push(bar = [ object ]);
						bar.weight = start;
					}
					bar.end = end;

					if (all_end < end)
						all_end = end;
				});

				settle();
				layer[start_key] = sorted_array[0][start_key];
				layer[end_key] = all_end;

				return layer;
			}

			// TODO: comparator
			// sorted_array: sorted by .[start_key]
			function order_bar_another_type(sorted_array, start_key, end_key) {
				if (sorted_array.length === 0)
					return [];

				if (!start_key)
					start_key = 'start';
				if (!end_key)
					end_key = 'end';

				var bars = [], all_end = -Infinity,
				// 最後欲回傳的階層。
				layer = [ [] ];

				function settle() {
					if (bars.length > 0) {
						// clear. 結清。
						// 寫入/紀錄階層序數。

						var layer_now;

						if (bars.length === 1) {
							layer_now = layer[0];
							bars[0].forEach(function(object) {
								layer_now.push(object);
							});

						} else {
							// sort 前一區間。
							// TODO: 若有接續前後者的，酌加權重。
							bars.sort(function(a, b) {
								// 大→小。
								return b.weight - a.weight;
							});

							bars.forEach(function(bar, i) {
								layer_now = layer[i];
								if (!layer_now)
									layer_now = layer[i] = [];
								bar.forEach(function(object) {
									layer_now.push(object);
								});
							});
						}

						// reset
						bars = [];
					}
				}

				sorted_array.forEach(function(object) {
					var bar,
					//
					start = object[start_key], end = object[end_key];

					if (start < all_end) {
						// 有重疊。
						// 取 bar 之 end 最接近 object.start 者。
						var
						// 最接近間距。
						closest_gap = Infinity,
						// 最接近之 bar index。
						closest_index = undefined;

						bars.forEach(function(bar, i) {
							var gap = start - bar.end;
							if (gap < closest_gap && 0 <= gap) {
								closest_gap = gap;
								closest_index = i;
							}
						});

						if (closest_index !== undefined)
							bar = bars[closest_index];

					} else
						settle();

					// start = 本 object 之 weight。
					start = end - start;
					// 將本 object 加入 bars 中。
					if (bar) {
						bar.push(object);
						bar.weight += start;
					} else {
						// 初始化。
						bars.push(bar = [ object ]);
						bar.weight = start;
					}
					bar.end = end;

					if (all_end < end)
						all_end = end;
				});

				settle();

				return layer;
			}

			// ---------------------------------------------------------------------//

			// 時期/時段 class。
			function Period(start, end) {
				// {Integer}
				this.start = start;
				// {Integer}
				this.end = end;
				// this.sub[sub Period name] = sub Period
				this.sub = library_namespace.null_Object();
				// 屬性值 attributes
				// e.g., this.attributes[君主名] = {String}君主名
				this.attributes = library_namespace.null_Object();

				// .name, .parent, .level: see Period.prototype.add_sub()

				// 階層序數: 0, 1, 2..
				// see get_periods()
				// this.bar = [ [], [], ..];
			}

			Period.is_Period = function(value) {
				return value.constructor === Period;
			};

			Period.prototype.add_sub = function(start, end, name) {
				var sub;
				if (typeof start === 'object' && start.start) {
					sub = start;
					name = end;
				} else
					sub = new Period(start, end);

				if (!name)
					name = sub.name;

				// 若子 period/era 之時間範圍於原 period (this) 外，
				// 則擴張原 period 之時間範圍，以包含本 period/era。
				if (!(this.start <= sub.start))
					this.start = sub.start;
				if (!(sub.end <= this.end))
					this.end = sub.end;

				this.sub[name] = sub;
				// {String}
				sub.name = name;
				sub.parent = this;
				sub.level = (this.level | 0) + 1;
				// return this;
				return sub;
			};

			Period.prototype.toString = function(type) {
				var name = this.name;
				if (!name)
					name = '[class Period]';
				else if (type === WITH_PERIOD) {
					append_period(this, name = [ name ]);
					name = name.join('');
				}
				return name;
			};

			// ---------------------------------------------------------------------//
			// 處理農曆之工具函數。

			/**
			 * 正規化名稱，盡量將中文數字轉為阿拉伯數字。
			 * 
			 * @param {String}number_String
			 *            中文數字
			 * @returns {String}數字化名稱
			 */
			function normalize_number(number_String) {
				return library_namespace.Chinese_numerals_Formal_to_Normal(
				// "有": e.g., 十有二月。
				library_namespace.normalize_Chinese_numeral(number_String
						.trim().replace(/([十廿卅])有/g, '$1')));
			}

			/**
			 * 正規化日期名稱，盡量將中文數字轉為阿拉伯數字。
			 * 
			 * @param {String}number_String
			 *            中文數字年/月/日
			 * @returns {String}日期名稱
			 */
			function numeralize_date_name(number_String, no_alias) {
				if (!number_String)
					return number_String === 0 ? 0 : '';
				// 處理元年, 閏?[正元]月, 初日
				number_String = String(number_String).trim();

				if (!no_alias)
					number_String = number_String.replace(/^初/, '')
					// 初吉即陰曆初一朔日。
					.replace(/[正元吉]$/, 1)
					// TODO: 統整月令別名。
					.replace(/冬$/, 10).replace(/臘$/, 11)
					// e.g., '前104' (年) → -104
					.replace(/^前/, '-');
				else if (/正$/.test(number_String))
					// 最起碼得把會當作數字的處理掉。
					return number_String;

				return POSITIONAL_DATE_NAME_PATTERN.test(number_String)
				//
				? library_namespace
						.from_positional_Chinese_numeral(number_String)
				//
				: library_namespace.from_Chinese_numeral(number_String);
			}

			// 至順治二年（公元1645年）頒行時憲曆後，改為日96刻，每時辰八刻（初初刻、初一刻、初二刻、初三刻、正初刻、正一刻、正二刻、正三刻）。自此每刻15分，無「四刻」之名。
			function 時刻_to_hour(時刻_String) {
				return String(時刻_String).trim().replace(
						時刻_PATTERN,
						function($0, 時, 初正, 刻) {
							return (2 * library_namespace.BRANCH_LIST
									.indexOf(時) - (初正 === '初' ? 1 : 0))
									+ '時'
									+ (刻
											&& (刻 = isNaN(刻) ? '初一二三'
													.indexOf(刻) : +刻) ? 15 * 刻
											+ '分' : '');
						});
			}

			// 檢查是否可能是日數。
			// 因為得考慮月中起始的情況，因此只檢查是否小於最大可能之日數。
			function maybe_month_days(string) {
				return string <= MAX_MONTH_DAYS;
			}

			// 解壓縮日數 data 片段。
			function extract_calendar_slice(calendar_data_String, date_name,
					閏月名) {
				if (maybe_month_days(calendar_data_String))
					return [ date_name, calendar_data_String ];

				var calendar_data = calendar_data_String
				// TODO: 除此 .split() 之外，盡量不動到這些過於龐大的資料…戯言。
				// http://jsperf.com/chunk-vs-slice
				// JavaScript 中 split 固定長度比 .slice() 慢。
				.match(CALENDAR_DATA_SPLIT_PATTERN),
				//
				calendar_data_Array = [], initial_month = date_name || '';

				if (initial_month.includes('/')) {
					initial_month = initial_month.split('/');
					// 須考慮特殊情況。
					if (initial_month.length === 2 && !initial_month[0])
						// e.g., '/2': should be 1/1/2.
						initial_month = null;
					else
						// 一般情況。 e.g., 2/3/4, 2/3
						initial_month = initial_month[1];
				}
				// assert: initial_month && typeof initial_month === 'string'

				if (calendar_data.length === 0) {
					library_namespace.err(
					//
					'extract_calendar_slice: 無法辨識日數資料 [' + calendar_data_String
							+ ']！');
					return [ date_name, calendar_data_String ];
				}

				calendar_data.forEach(function(year_data) {
					year_data = parseInt(year_data, PACK_RADIX).toString(
							RADIX_2).slice(1);

					var year_data_Array = [],
					//
					leap_month_index, leap_month_index_list;

					// MONTH_COUNT 個月 + 1個閏月。
					while (year_data.length > MONTH_COUNT + 1) {
						// 閏月的部分以 4
						// (LEAP_MONTH_PADDING.length)
						// 個二進位數字指示。
						leap_month_index = parseInt(
						//
						year_data.slice(-LEAP_MONTH_PADDING.length), RADIX_2);
						year_data = year_data.slice(0,
								-LEAP_MONTH_PADDING.length);

						if (leap_month_index_list) {
							library_namespace.err(
							//		
							'extract_calendar_slice: 本年有超過1個閏月！');
							leap_month_index_list.unshift(leap_month_index);
						} else
							leap_month_index_list = [ leap_month_index ];
					}

					leap_month_index
					// assert: 由小至大。
					= leap_month_index_list
					// 僅取最小的 1個閏月。
					&& leap_month_index_list.sort()[0];

					if (initial_month
					// && initial_month != START_MONTH
					) {
						if (閏月名)
							// 正規化閏月名。
							initial_month = initial_month.replace(this.閏月名,
									LEAP_MONTH_PREFIX);
						if (initial_month === LEAP_MONTH_PREFIX)
							initial_month += leap_month_index;

						if (initial_month = initial_month
								.match(MONTH_NAME_PATTERN)) {

							if (initial_month[1]
									|| leap_month_index < initial_month[2]) {
								if (initial_month[1]) {
									if (initial_month[2] != leap_month_index)
										library_namespace.err(
										//
										'extract_calendar_slice: 起始閏月次['
												+ initial_month[2]
												+ '] != 日數資料定義之閏月次['
												+ leap_month_index + ']！');
									// 由於已經在起頭設定閏月或之後起始，
									// 因此再加上閏月的指示詞，會造成重複。
									leap_month_index = null;
								}

								// 閏月或之後起始，須多截1個。
								initial_month[2]++;
							}

							initial_month = initial_month[2] - START_MONTH;

							if (!(0 <= (leap_month_index -= initial_month)))
								leap_month_index = null;

							// 若有起始月分，則會 truncate 到起始月分。
							// 注意：閏月之 index 是 padding 前之資料。
							year_data = year_data.slice(initial_month);

							// 僅能使用一次。
							initial_month = null;
						}
					}
					year_data = year_data.split('');

					year_data.forEach(function(month_days) {
						year_data_Array.push(
						//
						(leap_month_index === year_data_Array.length
						//
						? LEAP_MONTH_PREFIX + '=' : '')
								+ MONTH_DAYS[month_days]);
					});

					calendar_data_Array.push(year_data_Array
							.join(pack_era.month_separator));
				});

				return [ date_name,
						calendar_data_Array.join(pack_era.year_separator) ];
			}

			// 解壓縮日數 data。
			function extract_calendar_data(calendar_data, era) {
				return calendar_data.replace(曆數_PATTERN,
				// replace slice
				function(all, date_name, calendar_data, back) {
					calendar_data = extract_calendar_slice(calendar_data,
							date_name, era && era.閏月名);
					return (calendar_data[0] ? calendar_data.join('=')
							: calendar_data[1])
							+ back;
				});
			}

			// date_Array = [ 年, 月, 日 ]
			function numeralize_date_format(date_Array, numeral) {
				return [ gettext_date.year(date_Array[0], numeral),
						gettext_date.month(date_Array[1], numeral),
						gettext_date.date(date_Array[2], numeral) ];
			}

			function split_era_name(name) {
				if (name = name.trim().match(ERA_PATTERN))
					return {
						朝代 : name[1],
						君主 : name[2],
						// 紀年/其他
						紀年 : name[3],
						// 日期名稱
						日期 : name[4]
					};
			}

			// ---------------------------------------------------------------------//

			// 紀年 class。
			function Era(properties, previous) {
				for ( var property in properties)
					this[property] = properties[property];
			}

			// <a
			// href="http://big5.huaxia.com/zhwh/wszs/2009/12/1670026.html"
			// accessdate="2013/5/2 19:46">《中國歷史紀年表》解惑</a>
			// 謚號紀年的方法是：國號——帝王謚號——年號(無年號者不用)——年序號，如漢惠帝五年，梁武帝大同八年。
			// 自唐朝開始，改紀年方式為國號——帝王廟號——年號——年序號。如唐高宗永徽四年，清世宗雍正八年等。
			function get_era_name(type) {
				var name = this.name;
				if (type === SEARCH_STRING)
					// 搜尋時，紀年顯示方法："紀年 (朝代君主(帝王), 國家)"
					// e.g., "元始 (西漢平帝劉衍, 中國)"
					return name[紀年名稱索引值.紀年] + ' (' + (name[紀年名稱索引值.朝代] || '')
							+ (name[紀年名稱索引值.君主] || '') + ', '
							+ name[紀年名稱索引值.國家] + ')';

				// 基本上不加國家名稱。
				name = name.slice(0, 3).reverse();
				// 對重複的名稱作適當簡略調整。
				if (name[0] && name[0].includes(name[2])
				//
				|| name[1] && name[1].includes(name[2]))
					name[2] = '';
				if (name[1] &&
				// name[1].startsWith(name[0])
				name[1].lastIndexOf(name[0], 0) === 0)
					name[0] = '';

				if (type === WITH_PERIOD)
					append_period(this, name);
				return name.join('');
			}

			// ---------------------------------------
			// 月次，歲次或名稱與序號 (index) 之互換。

			// 歲序(index: start from 0)
			// →歲次(ordinal/serial: start with START_YEAR)
			// →歲名(name)
			function year_index_to_name(歲序) {
				var 歲名 = this.calendar[NAME_KEY];
				if (!歲名 || !(歲名 = 歲名[歲序])) {
					歲名 = 歲序 + (START_KEY in this.calendar
					//
					? this.calendar[START_KEY] : START_YEAR);
					if (this.skip_year_0 && 歲名 >= 0)
						歲名++;
				}
				return 歲名;
			}

			// (歲名 name→)
			// 歲次(ordinal/serial: start with START_YEAR)
			// →歲序(index of year[]: start from 0)
			function year_name_to_index(歲名) {
				if (!歲名)
					return;

				var 歲序 = this.calendar[NAME_KEY];
				if (!歲序 || (歲序 = 歲序.indexOf(歲名)) === NOT_FOUND) {
					歲名 = numeralize_date_name(歲名);

					if (isNaN(歲名)) {
						// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
						if (library_namespace.is_debug())
							library_namespace.err(
							//
							'year_name_to_index: 紀年 [' + this + '] '
							//
							+ (歲序 ? '沒有[' + 歲名 + ']年！' : '不具有特殊名稱設定！'));
						return;
					}

					if (this.skip_year_0 && 歲名 > 0)
						歲名--;

					歲序 = 歲名 - (START_KEY in this.calendar
					//
					? this.calendar[START_KEY] : START_YEAR);
				}
				return 歲序;
			}

			// 月序(index: start from 0)
			// →月次(ordinal/serial: start with START_MONTH)
			// →月名(name)
			function month_index_to_name(月序, 歲序) {
				歲序 = this.calendar[歲序];
				var 月名 = 歲序[NAME_KEY];
				// 以個別命名的月名為第一優先。
				if (!月名 || !(月名 = 月名[月序])) {
					月名 = 月序 + (START_KEY in 歲序 ? 歲序[START_KEY] : START_MONTH);

					if (this.歲首序 && (月名 += this.歲首序) > MONTH_COUNT)
						月名 -= MONTH_COUNT;

					// 依 month_index_to_name() 之演算法，
					// 若為閏月起首，則 [START_KEY] 須設定為下一月名！
					// e.g., 閏3月起首，則 [START_KEY] = 4。
					if (月序 >= 歲序[LEAP_MONTH_KEY]) {
						if (--月名 < START_MONTH)
							月名 += MONTH_COUNT;
						if (月序 === 歲序[LEAP_MONTH_KEY])
							月名 = (this.閏月名 || LEAP_MONTH_PREFIX) + 月名;
					}
				}
				return 月名;
			}

			// (月名 name→)
			// 月次(ordinal/serial: start with START_MONTH)
			// →月序(index of month[]: start from 0)
			function month_name_to_index(月名, 歲序) {
				if (!月名 || !(歲序 in this.calendar))
					return;

				var is_閏月, 歲_data = this.calendar[歲序], 月序 = 歲_data[NAME_KEY],
				// (閏月序) 與 [LEAP_MONTH_KEY] 皆為 (index of month[])！
				// 若當年 .start = 3，並閏4月，則 (閏月序 = 2)。
				閏月序 = 歲_data[LEAP_MONTH_KEY];

				if (!月序 || (月序
				// 以個別命名的月名為第一優先。
				= 月序.indexOf(numeralize_date_name(月名, true))) === NOT_FOUND) {

					月名 = String(numeralize_date_name(月名));

					if (this.閏月名)
						// 正規化閏月名。
						月名 = 月名.replace(this.閏月名, LEAP_MONTH_PREFIX);

					if (!isNaN(is_閏月 = this.歲首序))
						月名 = 月名.replace(/\d+/, function(month) {
							if ((month -= is_閏月) < 1)
								month += MONTH_COUNT;
							return month;
						});

					if (月名 === LEAP_MONTH_PREFIX) {
						if (isNaN(月序 = 閏月序)) {
							// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
							if (library_namespace.is_debug())
								library_namespace.warn(
								//
								'month_name_to_index: 紀年 [' + this + '] 之 ['
										+ this.歲名(歲序) + ']年沒有閏月！');
							return;
						}

					} else if ((月序 = String(numeralize_date_name(月名)))
					// 直接用 String(numeralize_date_name(月名)).match()
					// 在 Chrome 中可能造成值為 null。
					// e.g., 北魏孝武帝永興1年12月 曆譜
					&& (月序 = 月序.match(MONTH_NAME_PATTERN))) {
						is_閏月 = 月序[1];
						月序 = 月序[2] - (START_KEY in 歲_data
						//
						? 歲_data[START_KEY] : START_MONTH);
						// 閏月或之後，月序++。
						if (is_閏月 || 月序 >= 閏月序)
							月序++;

						if (is_閏月 && 月序 !== 閏月序) {
							// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
							if (library_namespace.is_debug())
								library_namespace.warn(
								//
								'month_name_to_index: 紀年 ['
										+ this
										+ '] 之 ['
										+ this.歲名(歲序)
										+ ']年沒有 ['
										+ 月名
										+ ']月'
										+ (閏月序 ? '，只有' + this.月名(閏月序, 歲序) + '月'
												: '') + '！');
							return;
						}

					} else {
						// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
						if (library_namespace.is_debug())
							library_namespace.warn('month_name_to_index: 紀年 ['
									+ this
									+ '] 之 ['
									+ this.歲名(歲序)
									+ ']年'
									+ (歲_data[NAME_KEY] ? '不具有特殊月分名稱設定！'
											: '沒有月分名稱[' + 月名 + ']！'));
						return;
					}
				}

				return 月序;
			}

			// 日序轉成日名。
			// [ 日名, 月名, 歲名 ]
			function date_index_to_name(日序, 月序, 歲序, 日序_only) {
				if (月序 < 0 || this.calendar[歲序].length <= 月序)
					if (月序 = this.shift_month(月序, 歲序)) {
						歲序 = 月序[1];
						月序 = 月序[0];
					} else
						return;

				日序 += (月序 === 0 && 歲序 === 0
						&& (START_DATE_KEY in this.calendar)
				//
				? this.calendar[START_DATE_KEY] : START_DATE);

				return 日序_only ? 日序 : [ 日序, this.月名(月序, 歲序), this.歲名(歲序) ];
			}

			// 日名轉成日序。
			function date_name_to_index(日名, is_首月) {
				if (!isNaN(日名
				//
				= numeralize_date_name(日名)))
					日名 -= (is_首月 && START_DATE_KEY in this.calendar
					//
					? this.calendar[START_DATE_KEY] : START_DATE);
				return 日名;
			}

			// 取得 (歲序)年，與 (月數) 個月之後的月序與歲序。
			function shift_month(月數, 歲數, 基準月) {
				if (Array.isArray(月數))
					基準月 = 月數, 月數 = 歲數 = 0;
				else {
					if (isNaN(月數 |= 0))
						月數 = 0;
					if (Array.isArray(歲數))
						基準月 = 歲數, 歲數 = 0;
					else {
						if (isNaN(歲數 |= 0))
							歲數 = 0;
						if (!Array.isArray(基準月))
							基準月 = [ 0, 0 ];
					}
				}

				// 基準月: [ 月序, 歲序, 差距月數 ]
				var 月序 = (基準月[0] | 0) + 月數,
				//
				歲序 = 基準月[1] | 0,
				//
				差距月數 = (基準月[2] | 0) + 月數;

				if (歲數 > 0)
					while (歲數 > 0 && 歲序 < this.calendar.length)
						歲數--, 差距月數 += this.calendar[歲序++].length;
				else
					while (歲數 < 0 && 歲序 > 0)
						歲數++, 差距月數 -= this.calendar[歲序--].length;

				if (月序 > 0)
					for (;;) {
						if (歲序 >= this.calendar.length) {
							if (library_namespace.is_debug())
								// 可能是孝徳天皇之類，期間過短，又嘗試
								// get_month_branch_index()
								// 的。
								library_namespace.err('shift_month: 已至 ['
										+ this + '] 曆數結尾，無可資利用之月分資料！');
							差距月數 = NaN;
							歲序--;
							break;
						}
						月數 = this.calendar[歲序].length;
						if (月序 < 月數)
							break;
						歲序++;
						月序 -= 月數;
					}
				else
					while (月序 < 0) {
						if (--歲序 < 0) {
							if (library_namespace.is_debug())
								library_namespace.err('shift_month: 已至 ['
										+ this + '] 曆數起頭，無可資利用之月分資料！');
							差距月數 = NaN;
							歲序 = 0;
							break;
						}
						月序 += this.calendar[歲序].length;
					}

				基準月[0] = 月序;
				基準月[1] = 歲序;
				基準月[2] = 差距月數;
				return !isNaN(差距月數) && 基準月;
			}

			// date index of era → Date
			function date_index_to_Date(歲序, 月序, 日序, strict) {
				if (!this.shift_month(歲序 = [ 月序, 歲序 ]))
					return;
				// 差距日數
				月序 = 歲序[0];
				歲序 = 歲序[1];
				日序 |= 0;

				var date = this.year_start[歲序],
				//
				i = 0, calendar = this.calendar[歲序];
				// TODO: use Array.prototype.reduce() or other method
				for (; i < 月序; i++)
					日序 += calendar[i];

				date += 日序 * ONE_DAY_LENGTH_VALUE;
				if (strict && this.end - date < 0)
					// 作邊界檢查。
					return;
				return new Date(date);
			}

			/**
			 * parse date name of calendar data.
			 * 
			 * @param {String}date_name
			 *            date name
			 * @returns [ 年名, 月名, 起始日碼 ]
			 */
			function parse_calendar_date_name(date_name) {
				if (!date_name)
					return [];

				// matched: [ , 年, 月, 日 ]
				var matched = date_name.match(/^\/(\d+)$/);
				date_name = matched ? [ , , matched[1] ]
				//
				: (matched = date_name.match(起始日碼_PATTERN)) ? matched.slice(1)
						: date_name.split('/');
				// 得考慮有特殊月名的情況，因此不可採
				// (name === LEAP_MONTH_PREFIX ||
				// MONTH_NAME_PATTERN.test(name))
				// 之類的測試方式。
				if (date_name.length === 1)
					// 月名
					date_name = [ , date_name[0] ];
				if (date_name.length > 3)
					library_namespace.warn('parse_calendar_date_name: 日碼 ['
							+ date_name.join('/') + '].length = '
							+ date_name.length + '，已過長！');

				date_name.forEach(function(name, index) {
					date_name[index] = numeralize_date_name(name);
				});

				// 正規化月名。
				if ((matched = date_name[1]) && typeof matched === 'string')
					if (matched = matched.match(MONTH_NAME_PATTERN))
						// 去空白與"月"字。
						date_name[1] = (matched[1] || '') + matched[2];
					else if (date_name[1] !== LEAP_MONTH_PREFIX)
						library_namespace.warn(
						//
						'parse_calendar_date_name: 特殊月名: [' + date_name[1]
								+ ']');

				return date_name;
			}

			// 需在設定完個別 this_year_data 之月名後，才作本紀年泛用設定。
			function add_month_name(月名_Array, this_year_data) {
				var name_Array = this_year_data[NAME_KEY],
				//
				leap = this_year_data[LEAP_MONTH_KEY], start;
				if (start = this_year_data[START_KEY])
					start -= START_MONTH;
				else
					start = 0;

				if (!Array.isArray(name_Array))
					if (isNaN(leap)) {
						if (Array.isArray(月名_Array))
							this_year_data[NAME_KEY] = start ? 月名_Array
									.slice(start) : 月名_Array;
						return;
					} else
						name_Array = this_year_data[NAME_KEY] = [];

				月名_Array.forEach(function(名, index) {
					if (0 <= (index -= start)) {
						if (leap <= index) {
							if (leap === index && !(index in name_Array)
									&& 月名_Array[index + start - 1])
								name_Array[index]
								// 閏月使用上一 index 月名。
								= 月名_Array[index + start - 1];
							// index 為閏月或之後，則使用在下一 index 之月名。
							index++;
						}
						// 不作覆蓋。
						if (名 && !(index in name_Array))
							name_Array[index] = 名;
					}
				});
			}

			function is_正統(era, key) {
				// assert: era.正統 === undefined || typeof era.正統 === 'string' ||
				// Array.isArray(era.正統)
				return era.正統 && (era.正統 === true
				// 採用"正統"方法，可避免某些情況下因「挑選最後結束之紀年」之演算法，造成最後無可供參照之紀年。
				// 但這需要手動測試每一種參照 key，並依測試結果添加。非萬全之道。
				|| key && era.正統.includes(key));
			}

			// 初始化/parse 紀年之月分日數 data。
			// initialize era date.
			function initialize_era_date() {
				// IE 需要 .getTime()：IE8 以 new Date(Date object) 會得到 NaN！
				var days, start_time = this.start.getTime(),
				// 當前年分之各月資料 cache。calendar_data[this year]。
				this_year_data,
				//
				紀年曆數 = this.calendar, this_end = this.end.getTime(),

				// 最後將作為 this.year_start 之資料。
				year_start_time = [ start_time ],
				// 最後將作為 this.calendar 之資料。
				// (年/月分資料=[年分各月資料/月分日數])[NAME_KEY]=[年/月分名稱],
				// [START_KEY] = start ordinal,
				// [LEAP_MONTH_KEY] = leap month index.
				calendar_data = [],

				//
				年序, 月序;

				start_time = new Date(start_time);

				// ---------------------------------------

				if (!紀年曆數 || typeof 紀年曆數 !== 'string') {
					library_namespace.err('initialize_era_date: 無法辨識曆數資料！');
					return;
				}

				if ((月序 = 紀年曆數.match(參照_PATTERN))
				// [ 紀年曆數, 起始日期名, 所參照之紀年或國家 ]
				&& ((年序 = 月序[2]) in search_index
				//
				|| (年序 in String_to_Date.parser
				//
				&& 年序 in Date_to_String_parser))) {
					var 曆法 = 年序,
					// [ 年名, 月名, 起始日碼 ]
					date_name = parse_calendar_date_name(月序[1]);
					library_namespace.debug(this + ': 參照紀年或國家 [' + 曆法
							+ '] 之曆數。', 2);

					// 處理紀年曆數所設定之起始年名：基本上僅允許年分不同。
					// 其他月名，日數皆得與起訖時間所設定的相同。
					// 年名應可允許 '0' 與負數。
					if (date_name[0] !== '' && !isNaN(date_name[0])
					//
					&& (date_name[0] |= 0) !== START_YEAR)
						// 複製本年之 START_KEY。
						calendar_data[START_KEY] = date_name[0];

					if (曆法 in search_index) {
						// ---------------------------------------

						/**
						 * 
						 * e.g., test: <code>
						 * CeL.era.set('古曆|-60~1230|-61/=:中國');
						 * CeL.era('古曆9年');
						 * </code>
						 */

						// CeL.era.set('古曆|-60~80|-60/=:中國');CeL.era('古曆1年');
						// CeL.era.set('古曆|25/2/17~27|:中國');CeL.era('古曆1年');
						// CeL.era.set('古曆|-60~1230|-61/=:中國');CeL.era('古曆249年');
						// CeL.era.set('古曆|-57~-48|-58/=:中國');//CeL.era('古曆-58年');
						// CeL.era.set('古曆|-54~-48|-55/=:中國');//CeL.era('古曆-55年');
						// n='古曆',sy=-55;CeL.era.set(n+'|'+(sy+1)+'~'+(sy+10)+'|'+sy+'/=:中國');//CeL.era(n+sy+'年');
						// CeL.era.set('古曆|901~1820|900/=:中國');
						// CeL.era('古曆54年1月').format({parser:'CE',format:'%Y/%m/%d'});
						// CeL.era.dates('古曆901年',{year_limit:2000,date_only:true});
						this.參照紀年 = 曆法;

						var tmp,
						// 所有候選紀年。
						// assert: 不會更動到候選紀年之資料。
						era_Array = [],

						// 當前參照之紀年。
						era,
						// 當前參照紀年之 date 指標。
						date_index,
						// era_year_data: 當前參照紀年之當前年分各月資料。
						era_year_data,
						// for lazy evaluation.
						correct_month_count,
						// 校正 this_year_data 之月份數量:
						// 參照紀元引入的可能只能用到 10月，但卻具足了到 12月的資料。
						// 此時需要先將後兩個月的資料剔除，再行 push()。
						// tested:
						// 百濟汾西王1年
						// 成漢太宗建興1年
						// 新羅儒禮尼師今7年
						correct_month = function(月中交接) {
							// 參照紀元 era 之參照月序。
							var era_month =
							// 參考 month_name_to_index()
							(era_year_data[START_KEY] || START_MONTH) + 月序;
							if ((LEAP_MONTH_KEY in era_year_data)
							//
							&& era_year_data[LEAP_MONTH_KEY] < 月序)
								era_month--;

							var month_diff
							//
							= (this_year_data[START_KEY] || START_MONTH)
							// 當前月序
							+ this_year_data.length;
							if ((LEAP_MONTH_KEY in this_year_data)
							//
							&& this_year_data[LEAP_MONTH_KEY] < month_diff)
								month_diff--;

							if (月中交接
							// 之前已經有東西，並非處在第一個月，「月中交接」才有意義。
							&& this_year_data.length > 0)
								month_diff--;

							// 減去參照紀元 era 之參照月序
							month_diff -= era_month;

							if (month_diff > 0) {
								library_namespace.debug('引入 [' + era
										+ '] 前，先刪掉年序 '
										+ (calendar_data.length - 1) + ' 之 '
										+ month_diff + ' 個月份。 ('
										+ this_year_data.length + ' - '
										+ month_diff + ')', 1,
										'initialize_era_date.correct_month');
								this_year_data.length -= month_diff;
							} else if (month_diff === -1 ?
							// 若是當前 this_year_data 的下一個月為閏月，
							// 亦可能出現 (month_diff = -1) 的情況。
							// 這時得避免亂噴警告。
							era_year_data[LEAP_MONTH_KEY] !== 月序
							//
							|| this_year_data[LEAP_MONTH_KEY] >= 0
							//
							&& this_year_data[LEAP_MONTH_KEY]
							//
							!== this_year_data.length :
							// 差太多了。
							month_diff < -1)
								library_namespace.warn(
								//
								'initialize_era_date.correct_month: 建構途中之曆數資料，與當前正欲參照之紀元 ['
										+ era + '] 間，中斷了 ' + (-month_diff)
										+ ' 個月份！');
						},
						// 當無須改變最後一年曆數，例如已在年尾時，不再複製。
						clone_last_year = function(月中交接) {
							if (!correct_month_count) {
								correct_month(月中交接);
								return;
							}

							var tmp = calendar_data.length - 1;
							if (calendar_data[tmp][COUNT_KEY]) {
								this_year_data = calendar_data[tmp];
								this_year_data.length
								//
								= this_year_data[COUNT_KEY]
								//
								+= correct_month_count;

								correct_month(月中交接);
								return;
							}

							tmp = calendar_data.pop();
							calendar_data.push(this_year_data
							// 初始化本年曆數。
							= tmp.slice(0, correct_month_count));
							this_year_data[COUNT_KEY] = correct_month_count;

							[ START_KEY, LEAP_MONTH_KEY ]
							//
							.forEach(
							// 複製本年之月 START_KEY, LEAP_MONTH_KEY。
							function(key) {
								if (key in tmp)
									this_year_data[key] = tmp[key];
							});
							// 複製 era 之[NAME_KEY]。
							if (NAME_KEY in tmp)
								this_year_data[NAME_KEY] = tmp[NAME_KEY].slice(
										0, correct_month_count);

							// 去除標記。
							correct_month_count = null;

							correct_month(月中交接);
						};

						// 初始化:取得所有候選紀年列表。
						tmp = start_time.getTime();
						for_each_era_of_key(曆法, function(era) {
							if (// era !== this &&
							era.start - this_end < 0
							// 有交集(重疊)才納入。
							&& tmp - era.end < 0 && (era.year_start
							// 篩選合宜的紀年。
							|| !參照_PATTERN.test(era.calendar)))
								era_Array.push(era);
						}
						// .bind(this)
						);

						// sort by era start time.
						era_Array.sort(compare_start_date);
						library_namespace.debug('[' + this + '] 參照紀年 key ['
								+ 曆法 + ']: 共有 ' + era_Array.length + ' 個候選紀年。',
								1, 'initialize_era_date');
						library_namespace.debug('候選紀年列表: [' + era_Array
						//
						.join('<span style="color:#c50;">|</span>') + ']。', 2,
								'initialize_era_date');

						// 因為 parse_calendar_date_name() 與 .日名()
						// 得到相反次序的資料，因此需要轉回來。因為有些項目可能未指定，因此不能用 .reverse()。
						tmp = date_name[0];
						date_name[0] = date_name[2];
						date_name[2] = tmp;

						/**
						 * 參照紀年之演算機制：定 this.year_start 與 this.calendar 之過程。
						 * <dl>
						 * <dt>查找下一參照紀元。</dt>
						 * <dd>優先取用：
						 * <ul>
						 * <li>在(前紀元.end)之時間點，前後紀元之日、月名稱相同，或可銜接。</li>
						 * <li>挑選最後結束之紀年，(後紀元.end)越後面者。較後結束的能減少轉換次數。<br />
						 * 但這方法在魏蜀吳會出問題。以採用"正統"方法迴避。</li>
						 * <li>恰好銜接(前紀元.end === 後紀元.start)。否則取用有重疊的部分之紀元。</li>
						 * </ul>
						 * </dd>
						 * <dt>確定交接日序、日名。</dt>
						 * <dt>處理年中分割，更替時間點不在本年年首的情況。</dt>
						 * <dd>分割點於本月中間而不在首尾，重疊部分本月之日數，以後一使用紀元為準。<br />
						 * 分割點於本年中間之月首，而不在本年首尾。複製本年接下來每月之曆數。</dd>
						 * <dt>盡可能以複製參照的方式，複製整年之暦數。</dt>
						 * <dt>若已是最後一個紀年，則表示完成暦數參照。跳出。</dt>
						 * <dt>設定下一輪必要的初始參數，以及正確之月序。</dt>
						 * </dl>
						 * 須考量僅有幾日的情形，並盡可能利用原有之曆數。
						 */

						// main copy loop
						for (;;) {
							/**
							 * 查找下一參照紀元。
							 */

							// 於此，年序作為前後紀元之日、月名稱相同，或可銜接之紀元列表。
							年序 = [];
							// 月序作為月名稱不同，但日名稱相同，或可銜接之紀元列表。
							// 例如改正朔。
							月序 = [];

							// 先從 era_Array[0] 向後找到可銜接或有重疊的任何參照紀元。
							while (era = era_Array.shift()) {
								// 第二輪後，start_time 代表 (前紀元.end)，而非代表 this.start。
								days = era.start - start_time;
								if (library_namespace.is_debug(2)) {
									if (days === 0)
										tmp = 'a44;">恰好銜接';
									else {
										tmp = days / ONE_DAY_LENGTH_VALUE;
										tmp = (days < 0 ? '4a4;">重疊 ' + -tmp
												: '888;">間隔 ' + tmp)
												+ '日';
									}
									library_namespace.debug([
											'測試  / 餘 ',
											era_Array.length,
											': ' + era,
											' (<span style="color:#' + tmp
													+ '</span>)' ], 2,
											'initialize_era_date');
								}

								if (days > 0) {
									era_Array.unshift(era);
									break;
								}

								tmp = null;
								if (calendar_data.length === 0
										// test: 後紀元無法轉換此 date。
										|| (date_index = era
										// [ 歲序, 月序, 日序 | 0 ]
										.Date_to_date_index(start_time))
										// days === 0: 恰好銜接且無重疊者。無縫接軌。毋須檢測。
										&& (days === 0 || (date_name[0]
										// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
										=== (tmp = era.日名(
										// 月日名連續性檢測。
										// 檢測前後紀元之接續日、月名稱相同。是否為同一月內同一日。
										// 主要指本紀元結束時間 (this.end)
										// 在兩紀元中之月日名：
										// 從 this.end 開始複製可以最節省資源，不用再重複複製重疊部分。
										date_index[2], date_index[1],
												date_index[0]))[0]
												|| !date_name[0]
										// 檢測月名是否相同。
										? !date_name[1]
												|| date_name[1] === tmp[1]
										// 測試月名稱可否銜接。
										: (!date_name[1]
										// 因為 era.end 不一定於 this 範圍內，可能剛好在邊界上，
										// 因此須作特殊處理。
										|| date_name[1] + 1 === tmp[1]
										// 測試是否為跨年。
										|| (tmp[1] === START_MONTH
										//
										&& (date_name[1] === MONTH_COUNT
										//
										|| date_name[1]
										//
										=== LEAP_MONTH_PREFIX + MONTH_COUNT)))
										// 測試日名稱可否銜接。是否為年內換月。
										// era 的 date index 為首日。
										&& tmp[0] === START_DATE
										// 確認 date name 為此月最後一天的後一天。
										// 這邊採用的是不嚴謹的測試:
										// 只要 date name <b>有可能</b>是此月最後一天就算通過。
										&& (date_name[0] === 小月 + 1
										//
										|| date_name[0] === 大月 + 1))))
									// 通過檢驗。
									年序.push([ era, days, date_index ]);

								else if (tmp && (date_name[0] === tmp[0]
								//
								|| tmp[0] === START_DATE
								// 確認 date name
								// 為此月最後一天的後一天。
								// 這邊採用的是不嚴謹的測試:
								// 只要 date name
								// <b>有可能</b>是此月最後一天就算通過。
								&& (date_name[0] === 小月 + 1
								//
								|| date_name[0] === 大月 + 1)))
									月序.push([ era, days, date_index ]);

								else if (tmp || library_namespace.is_debug(3))
									library_namespace.debug([
											'前後紀元之接續月日名不同！' + this,
											' ',
											date_name.slice().reverse().join(
													'/'),
											' != ',
											era.toString(),
											' ',
											tmp ? tmp.reverse().join('/')
													: '(null)' ], 2,
											'initialize_era_date');
							}

							// 僅存在月名稱不同，但日名稱相同，或可銜接之紀元列表。
							if (年序.length === 0) {
								if (月序.length === 0)
									// 因為本函數中應初始化本紀年曆數，否則之後的運算皆會出問題；
									// 因此若無法初始化，則 throw。
									throw new Error(
									//
									'initialize_era_date: [' + this + ']: '
									//
									+ (era_Array.length > 0
									//
									? '尋找 [' + 曆法 + '] 至 [' + era_Array[0]
									//
									+ ']，中間存在有未能尋得曆數之時間段！'
									//
									: '已遍歷所有 [' + 曆法 + ']紀年，至結尾無可供參照之紀年！'));
								年序 = 月序;
							}

							// 設定指標初始值，將 era 指到最佳候選。首先採用 [0]。
							era = 年序.pop();
							if (年序.length > 0 && is_正統(era[0], 曆法))
								// 已是最佳(正統)候選，不用再找下去了。
								年序 = [];
							while (date_index = 年序.pop()) {
								// 尋找最佳候選: 最後結束之紀年。

								// assert: 此時若 (this.start - era[0].start ===
								// era[1] === 0)，
								// 表示 era[0] 與 date_index[0] 有相同之起訖時間。
								if ((tmp = era[0].end - date_index[0].end) < 0
								//
								|| tmp === 0 && date_index[1] === 0) {
									era = date_index;
									if (is_正統(era[0], 曆法))
										break;
								}
							}

							/**
							 * 確定交接日序、日名。
							 */
							// [ 歲序, 月序, 日序 | 0 ]
							date_index = era[2]
									|| era[0].Date_to_date_index(start_time);
							if (!date_index)
								throw new Error('initialize_era_date: 無法取得 ['
										+ era[0]
										+ ']('
										+ start_time
												.format(standard_time_format)
										+ ') 的日期名！');
							// 重設 (年序), (月序), (date_index) 作為 era 之指標。
							年序 = date_index[0];
							月序 = date_index[1];
							date_index = date_index[2];

							era = era[0];
							// era_year_data: 當前參照紀年之當前年分各月資料。
							era_year_data = era.calendar[年序];

							if (library_namespace.is_debug())
								library_namespace.info([
										'initialize_era_date: ',
										start_time
										//
										.format(standard_time_format),
										' 接續參照：',
										is_正統(era, 曆法) ? '<em>[' + 曆法
												+ '] 正統</em> ' : '',
										era.toString(WITH_PERIOD) ]);

							if (false
							// && options.check_overleap
							) {
								// TODO: deep check if conflicts
								// 一一檢測前後紀元時間重疊的部分曆數是否有衝突。
								// also need to check KEYs
							}

							if (calendar_data.length === 0) {
								// first era. 第一輪，從新的參照紀年開始。
								// assert: 應該只有首個紀年會到這邊。
								// 初始化本紀元曆數 (this.calendar)。

								calendar_data[NAME_KEY] = [];

								// 該 copy 的其他紀年屬性全 copy 過來。
								library_namespace.set_method(this, era,
										'歲首序|閏月名'.split('|'));

								// 複製首年之 START_DATE_KEY。
								tmp = era.日名(date_index, 月序, 年序, true);
								if (tmp !== START_DATE)
									calendar_data[START_DATE_KEY] = tmp;

								if (月序 > 0 || (START_KEY in era_year_data)
								// 有時 era_year_data[START_KEY] === START_MONTH。
								&& era_year_data[START_KEY] !== START_MONTH) {
									// 非首月。
									// assert: this_year_data === undefined
									calendar_data.push(
									// this_year_data 一造出來就在 calendar_data 中。
									this_year_data = []);
									// 參考 month_index_to_name()。
									tmp = 月序 + (era_year_data[START_KEY]
									//
									|| START_MONTH);
									// 依 month_index_to_name() 之演算法，
									// 若為閏月起首，則 [START_KEY] 須設定為下一月名！
									// e.g., 閏3月起首，則 [START_KEY] = 4。
									if (月序 > era_year_data[LEAP_MONTH_KEY])
										tmp--;
									this_year_data[START_KEY] = tmp;
								}

								if (date_index > 0) {
									// 非首日。處理到下一個月。
									if (!this_year_data)
										calendar_data.push(
										// 設定好 this_year_data 環境。
										this_year_data = []);
									this_year_data.push(
									//
									era_year_data[月序++] - date_index);
									date_index = 0;
								}

								if (!this_year_data)
									// 首月首日。須保持 calendar_data.length ===
									// year_start_time.length
									year_start_time = [];

								if (library_namespace.is_debug(0)) {
									// check 日次。
									// tmp: 紀年曆數所設定之起始日次。
									tmp = date_name[0] | 0;
									if (tmp && tmp !==
									//
									calendar_data[START_DATE_KEY])
										library_namespace.err([
												'initialize_era_date: ',
												'紀年 [' + this,
												'] 於曆數所設定之起始日名 ', tmp,
												' 與從參照紀年 [' + era, '] 得到的日次 ',
												(calendar_data[START_DATE_KEY]
												//
												|| START_DATE), ' 不同！' ]);

									// check 月次。
									// tmp: 紀年曆數所設定之起始月次。
									tmp = date_name[1] | 0;
									if (tmp && tmp !==
									//
									(this_year_data[START_KEY]
									//
									|| START_MONTH))
										library_namespace.warn([
												'initialize_era_date: ',
												'紀年 [' + this,
												'] 於曆數所設定之起始月名 ', tmp,
												' 與從參照紀年 [' + era, '] 得到的月次 ',
												(this_year_data[START_KEY]
												//
												|| START_MONTH), ' 不同！（本年閏月次',
												//
												era_year_data[LEAP_MONTH_KEY],
												//
												'）' ]);
								}
							}

							/**
							 * 處理年中分割，更替時間點不在本年年首的情況。
							 */

							/**
							 * 分割點於本月中間而不在首尾，重疊部分本月之日數，以後一使用紀元為準。
							 */
							if (date_index > 0 || 年序 === 0 && 月序 === 0
							//
							&& (START_DATE_KEY in era.calendar)
							// 處理紀年於月中交接，交接時日序非 0 的情況。
							// assert: && era.calendar[START_DATE_KEY] !==
							// START_DATE
							) {
								// 續用 this_year_data。
								// 必須設定好 this_year_data 環境。
								clone_last_year(true);

								// 先記下本月現有天數。
								// 若在 clone_last_year() 之前，此時 this_year_data
								// 可能參照的是原參照紀年，為唯讀，因此不使用 .pop()。
								tmp = this_year_data.pop();

								// 參考 date_index_to_name()。
								if (calendar_data.length === 1
								// this.年序 === 0 && this.月序 === 0
								&& this_year_data.length === 0
								//
								&& (START_DATE_KEY in calendar_data))
									tmp
									//
									+= calendar_data[START_DATE_KEY]
											- START_DATE;
								// 由後一使用紀元得出本月實際應有天數。
								date_index = era_year_data[月序];
								if (年序 === 0 && 月序 === 0
								//
								&& (START_DATE_KEY in era.calendar))
									date_index
									//
									+= era.calendar[START_DATE_KEY]
											- START_DATE;
								// check
								if (tmp !== date_index
								// isNaN(tmp): 紀年起始，因此本來就沒有「原先參照的紀元」之資料。
								&& !isNaN(tmp))
									library_namespace.warn([
											'initialize_era_date: ',
											'後一紀元 [' + era, '] 本月 ',
											date_index, '天，不等於原先參照的紀元(為 ', tmp,
											'天)！' ]);
								// 設定
								if (calendar_data.length === 1
								// this.年序 === 0 && this.月序 === 0
								&& this_year_data.length === 0
								//
								&& (START_DATE_KEY in calendar_data))
									date_index
									// 若本已有 START_DATE_KEY 則減去之。
									-= calendar_data[START_DATE_KEY]
											- START_DATE;
								this_year_data.push(date_index);
								月序++;
							}

							/**
							 * 分割點於本年中間之月首，而不在本年首尾。
							 */
							if (月序 > 0 || (START_KEY in era_year_data)
							// 有時 era_year_data[START_KEY] === START_MONTH。
							&& era_year_data[START_KEY] !== START_MONTH) {
								clone_last_year();

								// 複製本年接下來每月之曆數。
								if (月序 < era_year_data.length)
									Array_push(this_year_data, era_year_data
											.slice(月序));

								// 複製本年之 LEAP_MONTH_KEY。
								// 須考慮日月名稱未連續的情況。
								tmp = era_year_data[LEAP_MONTH_KEY]
								// 參考 month_index_to_name()。
								+ (era_year_data[START_KEY] || START_MONTH)
								// 轉成 this_year_data 中之閏月 index。
								- (this_year_data[START_KEY] || START_MONTH);
								if ((tmp > 0 || tmp === 0
								// 本月是否為閏月？若是，則 (===)。
								&& 月序 === era_year_data[LEAP_MONTH_KEY])
								// check: this_year_data[LEAP_MONTH_KEY]
								// 可能已存在。
								&& (!(LEAP_MONTH_KEY in this_year_data)
								//
								|| tmp !== this_year_data[LEAP_MONTH_KEY])) {
									if (LEAP_MONTH_KEY in this_year_data)
										library_namespace.warn([
												'initialize_era_date: ' + this,
												' 年序 ',
												calendar_data.length - 1,
												'，尋至' + era, ' 年序 ', 年序,
												'，此年有兩個閏月設定：',
												this_year_data[LEAP_MONTH_KEY],
												' vs. ', tmp, '！' ]);

									this_year_data[LEAP_MONTH_KEY] = tmp;
								}

								// 複製本年接下來每月之 NAME_KEY。
								tmp = era_year_data[NAME_KEY];
								if (tmp && 月序 < tmp.length) {
									if (NAME_KEY in this_year_data)
										this_year_data[NAME_KEY].length
										//
										= this_year_data.length;
									else
										this_year_data[NAME_KEY]
										//
										= new Array(this_year_data.length);
									Array_push(this_year_data[NAME_KEY], tmp
											.slice(月序));
								}

								if (library_namespace.is_debug(0)) {
									// check 曆數
									tmp = this_year_data.length;
									library_namespace.debug([ this + ' 年序 ',
											calendar_data.length - 1,
											' 參考 ' + era, '，得曆數 ', tmp,
											' 個月: [', this_year_data.join(','),
											']' ], 2, 'initialize_era_date');
									if (START_KEY in this_year_data)
										tmp += this_year_data[START_KEY]
												- START_MONTH;
									if (tmp !== MONTH_COUNT
									//
									+ (LEAP_MONTH_KEY
									//
									in this_year_data ? 1 : 0))
										library_namespace.warn([
												'initialize_era_date: ' + this,
												' 年序 ',
												calendar_data.length - 1,
												'：本年參照紀年 [' + era, '] 年序 ', 年序,
												'，共至 ', tmp, ' 月，正常情況應為 ',
												MONTH_COUNT + (LEAP_MONTH_KEY
												//
												in this_year_data ? 1 : 0),
												' 個月！' ]);
								}

								// 月序 = 0;
								年序++;
							}
							// else: assert: 更替時間點除了'年'外，沒其他的了。本年首月首日,
							// date_index === 月序 === 0

							/**
							 * 盡可能以複製參照的方式，複製整年之暦數。
							 */
							// 第二輪後，start_time 代表 (前紀元.end)，而非代表 this.start。
							start_time = era.end;
							// date_index: is last era. 已至 this.end。
							// 保持 start_time <= this_end。
							date_index = this_end - start_time <= 0;
							if (date_index) {
								tmp = era.year_start.search_sorted(this_end, {
									found : true
								});
								if (era.year_start[tmp] < this_end)
									tmp++;
								if (tmp > era.calendar.length)
									tmp = era.calendar.length;
							} else
								for (tmp = era.calendar.length;
								// assert: era.year_start.length ===
								// era.calendar.length + 1
								start_time - era.year_start[tmp - 1] <= 0;)
									// 預防 era 之暦數超過 era.end 所在年的情況。
									// 此時須取得 era.end 在 era 暦數中真正的位置。
									tmp--;

							// 加速: 逐年複製 era 之暦數，至 this.end 或 era 已無曆數為止。
							if (年序 < tmp) {
								// 有可整年複製之暦數。

								if (this_year_data
								//
								&& this_year_data[COUNT_KEY])
									delete this_year_data[COUNT_KEY];

								// year_start_time 總是與 calendar_data 作相同
								// push/pop 處理，包含與 calendar_data 相同筆數的資料。
								Array_push(year_start_time, era.year_start
										.slice(年序, tmp));
								// assert: era.year_start.length ===
								// era.calendar.length + 1
								Array_push(calendar_data, era.calendar.slice(
										年序, tmp));
								// 複製這些年分之 NAME_KEY。
								if (NAME_KEY in era.calendar) {
									calendar_data[NAME_KEY].length
									//
									= calendar_data.length;
									Array_push(calendar_data[NAME_KEY],
											era.calendar.slice(年序, tmp));
								}
							}

							/**
							 * 若已是最後一個紀年，則表示完成暦數參照。跳出。
							 */
							if (date_index) {
								if (this_year_data
								//
								&& this_year_data[COUNT_KEY])
									delete this_year_data[COUNT_KEY];

								// done.
								// assert: 此時 tmp 代表當前參照紀年之年序。
								break;
							}

							/**
							 * 設定下一輪必要的初始參數，以及正確之月序。
							 */
							// era 已無曆數。需要跳到下個紀元。查找下一參照紀元。
							// 會到這邊，基本上都是經過整年複製的。
							// 有必要重新處理（跨紀年之類）。
							//
							// 設定正確之月序。這時測試前一天。
							// assert: 取前一天則必須為紀年起始後（紀年範圍內），與最後一日期間內；
							// 必能被 parse，且可取得 index。
							// [ 歲序, 月序, 日序 | 0 ]
							月序 = era.Date_to_date_index(new Date(
							// 因為已經處理本年到本年曆數最後一月(倒不見得是年底)，因此需要重設 index。
							// 為預防參照源僅有幾個月或數日，還不到年底，因此不重設年序、跳到下一年。
							start_time - ONE_DAY_LENGTH_VALUE));
							if (!月序)
								throw new Error('initialize_era_date: 無法取得 ['
										+ era + '].end 的日期序！');

							// 設定好交接的 date_name。
							// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
							date_name = era.日名(月序[2], 月序[1], 月序[0]);
							if (!date_name)
								throw new Error('initialize_era_date: 無法取得 ['
										+ era + '].end 的日期名！');
							// 因為取得的是交接點前一日之日名，因此須將日名延後一日，以取得實際交接點應該有的 date。
							date_name[0]++;

							// 做標記。
							// 設定正確之月序。+1: 月序 index → length
							correct_month_count = 月序[1] + 1;
						}

						// assert: year_start_time.length ===
						// calendar_data.length
						// TODO: 若無 era 時之處理。
						year_start_time.push(era.year_start[tmp]);

						if (calendar_data[NAME_KEY].length === 0)
							delete calendar_data[NAME_KEY];

						if (!(MINUTE_OFFSET_KEY in this)
								&& (MINUTE_OFFSET_KEY in era))
							this[MINUTE_OFFSET_KEY] = era[MINUTE_OFFSET_KEY];

						// 不再作一般性的解析。
						紀年曆數 = null;

					} else {
						// ---------------------------------------

						this.參照曆法 = 曆法;

						// 因為了 parser 作設計可能大幅度改變各
						// method，方出此下策，沿用原先的資料結構。
						var time = start_time.getTime(),
						//
						next_time, 日數,
						//
						_to_String
						//
						= Date_to_String_parser[曆法],
						//
						to_String = function(time) {
							return _to_String(time, '%Y/%m/%d').split('/');
						},
						//
						ordinal = to_String(start_time);

						// 檢測
						if (isNaN(ordinal[0] |= 0) || date_name[1]
								&& date_name[1] !== ordinal[1] || date_name[2]
								&& date_name[2] !== ordinal[2])
							library_namespace.warn('initialize_era_date: 紀年 ['
									+ this + '] 起訖時間所設定的紀年<b>開始時間</b> ['
									+ ordinal.join('/') + ']，與從曆數資料取得的 ['
									+ date_name.join('/') + '] 不同！');

						// 不可設為 START_DATE。
						if (isNaN(ordinal[2] |= 0)) {
							library_namespace.err('initialize_era_date: 紀年 ['
									+ this + '] 無法順利轉換日期 [' + ordinal.join('/')
									+ ']！');
							return;
						}
						if (ordinal[2] !== START_DATE)
							calendar_data[START_DATE_KEY] = ordinal[2];

						if (曆法 === 'CE') {
							// 加速 CE 的演算。另可試試不採用 .calendar = [] 的方法，而直接改變
							// this.attributes。
							this.大月 = CE_MONTH_DAYS;
							// this.小月 = CE_MONTH_DAYS - 1;

							// next_time: this year.
							next_time = ordinal[0];

							if ((ordinal[1] |= 0) === START_MONTH
									&& ordinal[2] === START_DATE)
								ordinal = false;

							while (time < this_end) {
								if (next_time === CE_REFORM_YEAR) {
									next_time++;
									this_year_data = CE_REFORM_YEAR_DATA;
									time += CE_REFORM_YEAR_LENGTH_VALUE;
								} else {
									// 日數: year (next_time) is leap year.
									日數 = library_namespace.is_leap_year(
											next_time++, 曆法);
									time += 日數 ? CE_LEAP_YEAR_LENGTH_VALUE
											: CE_COMMON_YEAR_LENGTH_VALUE;
									this_year_data = 日數 ? CE_LEAP_YEAR_DATA
											: CE_COMMON_YEAR_DATA;
								}

								if (ordinal) {
									// 處理第一年非 1/1 起始的情況。
									日數 = ordinal[2] -= START_DATE;
									// to_String, _to_String: tmp
									to_String = _to_String = ordinal[1]
											- START_MONTH | 0;
									while (to_String > 0)
										日數 += this_year_data[--to_String];
									time -= 日數 * ONE_DAY_LENGTH_VALUE;
									this_year_data = this_year_data
											.slice(_to_String);
									this_year_data[START_KEY] = ordinal[1];
									this_year_data[0] -= ordinal[2];

									ordinal = false;
								}

								year_start_time.push(time);
								calendar_data.push(
								//
								this_year_data);
							}

						} else {
							this_year_data = [];
							if ((ordinal[1] |= 0)
							//
							&& ordinal[1] !== START_MONTH)
								this_year_data[START_KEY] = ordinal[1];

							// date 設為 START_DATE，為每個月初的遍歷作準備。
							ordinal[2] = START_DATE;

							曆法 = String_to_Date.parser[曆法];
							// TODO: 這方法太沒效率。
							while (time < this_end) {
								// 找下一月初。
								++ordinal[1];
								next_time = 曆法(ordinal.join('/'), undefined, {
									// 於 CE 可避免 80 被 parse 成 1980。
									year_padding : 0
								});
								if (library_namespace.is_debug(2))
									library_namespace.debug(this + ': '
									//
									+ ordinal.join('/') + ' → '
									//
									+ next_time.format(
									//
									standard_time_format));
								日數 = (next_time - time) / ONE_DAY_LENGTH_VALUE;
								if (!(日數 > 0) && 日數 !== (日數 | 0)) {
									library_namespace.err(
									// 可能是時區問題?
									'initialize_era_date: 紀年 [' + this
											+ '] 無法順利轉換日期 ['
											+ ordinal.join('/') + ']: 錯誤日數！');
									return;
								}
								this_year_data.push(日數);
								time = ordinal;
								ordinal = to_String(next_time);
								if (time.join('/') !== ordinal.join('/')) {
									// 預期應該是隔年一月。
									if (++time[0] === 0
									// CE 預設無 year 0 (第0年/第零年)。
									&& !this.零年 && !this.year0)
										++time[0];
									time[1] = START_MONTH;
									if (time.join('/') !== ordinal.join('/')) {
										library_namespace.err(
										//
										'initialize_era_date: 紀年 [' + this
												+ '] 無法順利轉換日期！['
												+ time.join('/') + ']→['
												+ ordinal.join('/') + ']');
										return;
									}
									year_start_time.push(next_time.getTime());
									calendar_data.push(this_year_data);
									this_year_data = [];
								}
								time = next_time.getTime();
							}
							if (this_year_data.length > 0) {
								// 注意:這最後一個月可能超過 this.end!
								year_start_time.push(next_time.getTime());
								calendar_data.push(this_year_data);
							}
						}

						// 不再作一般性的解析。
						紀年曆數 = null;
					}

				} else
					// 解壓縮日數 data。
					紀年曆數 = extract_calendar_data(紀年曆數, this);

				// ---------------------------------------

				if (紀年曆數)
					紀年曆數 = 紀年曆數.split(pack_era.year_separator);

				if (紀年曆數) {
					// 一般性的解析。
					var 閏月名 = this.閏月名,
					// 為了測試曆數是否已壓縮。
					era = this;

					紀年曆數.forEach(function(year_data) {
						var month_data = year_data
								.split(pack_era.month_separator);

						// 初始設定。
						days = 0;
						年序 = START_YEAR;
						月序 = START_MONTH;
						calendar_data.push(this_year_data = []);

						month_data.forEach(function(date_data) {
							// 當月之日數|日數 data
							// =當月之日數|日數 data
							// 年名/月名/起始日碼=當月之日數|日數 data
							// /月名/起始日碼=當月之日數|日數 data
							// 年名/月名=當月之日數|日數 data
							// 月名=當月之日數|日數 data

							var date_name = date_data
									.match(/^(?:(.*?)=)?([^;\t=]+)$/);

							if (!library_namespace
									.is_digits(date_data = date_name[2].trim())
									|| (date_data |= 0) <= 0) {
								library_namespace
										.err('initialize_era_date: 無法辨識日數資料 ['
												+ calendar_data + '] 中的 ['
												+ date_data + ']！');
								return;
							}

							// 處理日期名稱。
							if (date_name
							//
							= parse_calendar_date_name(date_name[1])) {
								var tmp, 年名 = date_name[0],
								//
								月名 = date_name[1],
								//
								起始日碼 = date_name[2] | 0;

								// 設定年分名稱
								if (年名 && 年名 != 年序) {
									if (/^-?\d+$/.test(年名))
										// 還預防有小數。
										年名 = Math.floor(年名);
									if (typeof 年名 === 'number'
											&& !(NAME_KEY in calendar_data)
											&& !(START_KEY in calendar_data))
										calendar_data[START_KEY] = 年序 = 年名;

									else {
										if (!(NAME_KEY in calendar_data)) {
											calendar_data[NAME_KEY] = [];
											// TODO:
											// 填補原先應有的名稱。

										} else {
											if (calendar_data[NAME_KEY]
											//
											[calendar_data.length])
												library_namespace.warn(
												//
												'initialize_era_date: '
														+ '重複設定年分名稱！');
											if (this_year_data.length > 0)
												library_namespace.warn(
												//
												'initialize_era_date: '
														+ '在年中，而非年初設定年分名稱！');
										}

										calendar_data[NAME_KEY]
										//
										[calendar_data.length] = 年名;
									}

								}

								// 設定起始之月中日數
								if (起始日碼 && 起始日碼 !== START_DATE)
									if (!(START_DATE_KEY in calendar_data)
											&& library_namespace
													.is_digits(起始日碼)) {
										calendar_data[START_DATE_KEY] = 起始日碼;
										// 測試曆數是否已壓縮。
										if (已壓縮曆數_PATTERN.test(era.calendar))
											date_data -= 起始日碼 - START_DATE;
									} else
										library_namespace.warn(
										//
										'initialize_era_date: 設定非數字的月中起始日 ['
												+ 起始日碼 + ']；或是在中途設定日期，'
												+ '而非在曆數資料一開始即設定月中日期！將忽略之。');

								// 設定月分名稱。
								// TODO:
								if (月名 && 月名 != 月序) {
									if (library_namespace.is_digits(月名))
										月名 |= 0;
									if (typeof 月名 === 'number') {
										if (!(NAME_KEY in this_year_data)
										//
										&& !(START_KEY in this_year_data))
											this_year_data[START_KEY]
											// 若 月序
											// ==
											// 月名，則不會到這。
											= 月序 = 月名;
										else {
											if (!(NAME_KEY in this_year_data))
												this_year_data[NAME_KEY] = [];
											this_year_data[NAME_KEY]
											// e.g.,
											// 唐武后久視1年
											[this_year_data.length] = 月名;
										}

									} else if (月名 === LEAP_MONTH_PREFIX
											|| 閏月名
											&& 月名 === 閏月名
											|| (tmp = 月名
													.match(MONTH_NAME_PATTERN))
											&& tmp[1]
											&& (!tmp[2]
													|| (tmp[2] |= 0) + 1 == 月序
											// 閏月起始。
											|| !(NAME_KEY in this_year_data)
											//
											&& !(START_KEY in this_year_data)))
										if (LEAP_MONTH_KEY in this_year_data)
											library_namespace.warn(
											//
											'initialize_era_date: '
													+ '本年有超過1個閏月！將忽略之。');
										else {
											this_year_data[LEAP_MONTH_KEY]
											// 閏月
											// index:
											// 閏月將排在
											// [this_year_data.length]。
											= this_year_data.length;
											if (START_KEY in this_year_data)
												// 因為閏月，減1個月序。
												月序--;
											else
												this_year_data[START_KEY]
												// 閏月起始之處理。
												= 月序 = tmp && tmp[2]
												// 將
												// START_KEY
												// 設成下一月序，以便轉換月名時容易處理。
												// 因為所有閏月之後，包括閏月本身，都會減一。
												? 1 + tmp[2]
												//
												: 2 + MONTH_COUNT
														- month_data.length;
										}
									else {
										if (!(NAME_KEY in this_year_data)) {
											this_year_data[NAME_KEY] = [];
											// TODO:
											// 填補原先應有的名稱。

										} else {
											if (this_year_data[NAME_KEY]
											//
											[this_year_data.length])
												library_namespace.warn(
												//
												'initialize_era_date: '
														+ '重複設定月分名稱！');
										}

										this_year_data[NAME_KEY]
										//
										[this_year_data.length] = 月名;
									}
								}

							}
							// 日期名稱處理完畢。

							// 當月之日數
							this_year_data.push(date_data);
							days += date_data;

							月序++;
							// build year_start_time.

							// 注意:需要依照 MONTH_DAYS 更改公式!
						});

						// 後設定。
						start_time.setDate(start_time.getDate() + days);
						year_start_time.push(start_time.getTime());
						days = 0;
						年序++;
					});
				}

				// ---------------------------------------

				if (Array.isArray(月序 = this[MONTH_NAME_KEY]))
					calendar_data.forEach(function(this_year_data) {
						add_month_name(月序, this_year_data);
					});

				// 彌封。
				calendar_data.forEach(function(data) {
					Object.seal(data);
				});

				// ---------------------------------------
				// 能跑到這邊才算是成功解析，能設定暦數。
				this.year_start = Object.seal(year_start_time);
				this.calendar = Object.seal(calendar_data);

				this.skip_year_0 = calendar_data[START_KEY] < 0
				// 沒有 year 0 (第0年/第零年)?
				&& !this.零年 && !this.year0;

				// ---------------------------------------
				// 出廠前檢測。
				year_start_time = year_start_time[year_start_time.length - 1];
				if (year_start_time === this_end)
					;
				else if (紀年曆數 && this_end < year_start_time) {
					// 可能是為了壓縮而被填補滿了。
					days = new Date(this_end);
					// assert: 取前一天則必須為紀年起始後（紀年範圍內），與最後一日期間內；
					// 必能被 parse，且可取得 index。
					days.setDate(days.getDate() - 1);
					// [ 歲序, 月序, 日序 | 0 ]
					days = this.Date_to_date_index(days);

					if (days[0] + 1 > this.calendar.length) {
						// truncate 年。
						this.calendar.length = days[0] + 1;

					} else if (days[0] + 1 < this.calendar.length)
						library_namespace.debug('由紀年 [' + this
								+ '] 曆數資料取得的紀年<b>結束時間</b>，較其起訖時間所設定的 ['
								+ this.end.format(standard_time_format)
								+ '] 長了 '
								+ (this.calendar.length - (days[0] + 1))
								+ ' 年。可手動刪除之。');

					// truncate 月。
					if (days[1] + 1 > this.calendar[days[0]].length)
						this.calendar[days[0]].length = days[1] + 1;

					// truncate 日: skip。此數據可能保留了當月實際的日數。
					// this.calendar[days[0]][days[1]] = days[2] + 1;

					// TODO: 設定最後之 year_start_time
					// 為真實之下一年開頭，可能需要查詢下一紀年之曆數。
					// 注意:這表示，最後一個 era.year_start 可能與 .calendar
					// 有接近一整年之距離!

				} else {
					if (!this.參照紀年 && year_start_time < this_end
					//
					|| library_namespace.is_debug())
						library_namespace
								.warn('initialize_era_date: 紀年 ['
										+ this
										+ '] 起訖時間所設定的紀年<b>結束時間</b> ['
										+ this.end.format(standard_time_format)
										+ ']，與從曆數資料取得的 ['
										+ (new Date(year_start_time))
												.format(standard_time_format)
										+ '] 不同！');
					if (false)
						this.year_start.forEach(function(date, index) {
							console.log(index
									+ ':'
									+ new Date(date)
											.format(standard_time_format));
						});
				}
			}

			// 保證結果 >=0。
			function positive_modulo(dividend, divisor) {
				if ((dividend %= divisor) < 0)
					dividend += divisor;
				return dividend;
			}

			// get （起始）年干支序。
			// 設定"所求干支序"，將回傳所求干支序之年序。
			// 未設定"所求干支序"，將回傳紀年首年之年干支index。
			function get_year_stem_branch_index(所求干支序) {
				var 曆數 = this.calendar, 年干支 = this.起始年干支序, 起始月分, offset;

				if (isNaN(年干支)) {
					// 盡量取得正月，不需要調整的月分。
					if ((起始月分 = 曆數[0][START_KEY])
					// assert: 即使是只有一個月的短命政權，也得要把日數資料填到年底！
					&& (offset = this.year_start[1]))
						年干支 = new Date(offset);
					else {
						年干支 = new Date(this.start.getTime());
						if (起始月分)
							年干支.setMonth(年干支.getMonth() + START_MONTH - 起始月分);
					}
					年干支 = (年干支.getFullYear()
							- library_namespace.YEAR_STEM_BRANCH_OFFSET
							// 中曆年起始於CE年末，則應算作下一年之
							// YEAR_STEM_BRANCH_OFFSET。
							+ (年干支.getMonth() > 9 ? 1 : 0) - (offset ? 1 : 0))
							% library_namespace.SEXAGENARY_CYCLE_LENGTH;
					if (年干支 < 0)
						年干支 += library_namespace.SEXAGENARY_CYCLE_LENGTH;
					this.起始年干支序 = 年干支;
				}

				if (!isNaN(所求干支序) && (年干支 = 所求干支序 - 年干支) < 0)
					年干支 += library_namespace.SEXAGENARY_CYCLE_LENGTH;

				return 年干支;
			}

			// get （起始）月干支序。

			// 設定"月干支"，將回傳所求月干支之 [ 月序, 歲序 ]。
			// 未設定"月干支"，將回傳紀年首年首月(index: 0, 0)之月干支index。

			// 此非紀年首年歲首之月干支序，而是紀年首年首月之月干支序。
			// 只有在未設定首年起始月數(this.calendar[0][START_KEY])的情況下，兩者才會相等。
			function get_month_branch_index(月干支, 歲序) {
				var 曆數 = this.calendar, 起始月干支 = this.起始月干支序, 月序;

				// 確定建正：以建(何支)之月為正月(一月)。除顓頊曆，通常即正朔。
				// 以冬至建子之月為曆初。
				// 「三正」一說是夏正（建寅的農曆月份，就是現行農曆的正月）殷正（建丑，即現行農曆的十二月）、周正（建子，即現行農曆的十一月）；
				// 建正與歲首一般是統一的。秦始皇統一中國後，改以建亥之月（即夏曆的十月）為歲首（分年/歲之月；當年第一個月），但夏正比較適合農事季節，所以並不稱十月為正月（秦朝管正月叫「端月」），不改正月為四月，

				if (isNaN(起始月干支)) {
					// 月序 = START_DATE_KEY in 曆數 ? 1 : 0 ;

					// 找到第一個非閏月。
					// 一般說來，閏月不應該符合中氣，因此照理不需要這段篩選。
					if (false)
						while (isNaN(this.月名(月序[0], 月序[1])))
							if (!this.shift_month(1, 月序)) {
								library_namespace.err(
								//
								'get_month_branch_index: 無法取得月次（數字化月分名稱）！');
								return;
							}

					// 判別此月份所包含之中氣日。
					// 包冬至 12/21-23 的為建子之月。
					// 冬至所在月份為冬月、大寒所在月份為臘月、雨水所在月份為正月、春分所在月份為二月、…、小雪所在月份為十月，無中氣的月份為前一個月的閏月。
					var ST本月中氣起始日, 下個月起始日差距, ST月序, 中氣差距日數, 閏月後,
					//
					ST本月起始日 = isNaN(this.歲首序) ? START_DATE_KEY in 曆數 ? 1 : 0
							: -1;
					for (月序 = [ 0, 0 ];;)
						if (this.shift_month(ST本月起始日, 月序)) {
							// 標準時間(如UTC+8) 本月月初起始日
							ST本月起始日 = this.date_index_to_Date(月序[1], 月序[0]);
							// 標準時間(如UTC+8) 本月中氣起始日
							ST本月中氣起始日 = 中氣日[ST月序 = ST本月起始日.getMonth()];
							// 中氣起始日與本月月初起始日之差距日數日數
							中氣差距日數 = ST本月中氣起始日 - ST本月起始日.getDate();
							// 下個月月初起始日，與本月月初起始日之差距日數。
							// 即本月之日數。
							下個月起始日差距 = 曆數[月序[1]][月序[0]];

							if (中氣差距日數 < 0) {
								if (false && 月序[2] === 0
										&& 0 < 中氣差距日數 + 中氣日_days + 2) {
									// TODO: 紀年首月之前一個月絕對包含(ST月序)中氣。
									break;
								}

								// 日期(of 標準時間月)於中氣前，改成下個月的中氣日。
								if (++ST月序 >= 中氣日.length)
									ST月序 = 0;
								ST本月中氣起始日 = 中氣日[ST月序];
								// 重新計算中氣差距日數。
								中氣差距日數 = ST本月中氣起始日 - ST本月起始日.getDate();

								// 加上本標準時間月日數，
								// e.g., 3月為31日。
								// 使(中氣差距日數)成為下個月的中氣日差距。
								// .setDate(0) 可獲得上個月的月底日。
								ST本月起始日.setMonth(ST月序, 0);
								中氣差距日數 += ST本月起始日.getDate();
							}

							// 只要本月包含所有中氣可能發生的時段，就當作為此月。
							if (中氣差距日數 + 中氣日_days < 下個月起始日差距) {
								// 標準時間月序(ST月序) No 0:
								// 包含公元當年1月之中氣(大寒)，為臘月，
								// 月建丑，月建序 1(子月:0)。餘以此類推。

								// 歲序(月序[1])月序(月序[0])，
								// 距離紀年初(月序[2])個月，
								// 包含公元當年(ST月序 + 1)月之中氣，
								// 其月建序為(ST月序 + 1)。

								// 判定建正。

								// 寅正:
								// 中曆月: B C 1 2 3 4 5 6 7 8 9 A
								// 中月序: A B 0 1 2 3 4 5 6 7 8 9

								// 中氣序: B 0 1 2 3 4 5 6 7 8 9 A

								// ..月建: 子丑寅卯辰巳午未申酉戌亥
								// 月建序: 0 1 2 3 4 5 6 7 8 9 A B

								// 閏月或之後。
								閏月後 = 月序[0] >= 曆數[月序[1]][LEAP_MONTH_KEY];
								if (library_namespace.is_debug()) {
									library_namespace.debug('閏月或之後: ' + 閏月後, 1,
											'get_month_branch_index');

									// 中曆月序=(曆數[月序[1]].start-START_MONTH)+月序[0]-(閏月或之後?1:0)
									library_namespace.debug('中曆月序 = '
											+ ((START_KEY in 曆數[月序[1]]
											//
											? 曆數[月序[1]][START_KEY]
													- START_MONTH : 0)
													+ 月序[0] - (閏月後 ? 1 : 0)),
											1, 'get_month_branch_index');

									// 歲首包含中氣序=ST月序-月序
									library_namespace.debug('歲首包含中氣序 = '
											+ (ST月序 - ((START_KEY in 曆數[月序[1]]
											//
											? 曆數[月序[1]][START_KEY]
													- START_MONTH : 0)
													+ 月序[0] - (閏月後 ? 1 : 0))),
											1, 'get_month_branch_index');

									// 歲首月建序=(歲首中氣序+1)%MONTH_COUNT
									library_namespace.debug('歲首月建序 = '
											+ (1 + ST月序
											//
											- ((START_KEY in 曆數[月序[1]]
											//
											? 曆數[月序[1]][START_KEY]
													- START_MONTH : 0)
													+ 月序[0] - (閏月後 ? 1 : 0))),
											1, 'get_month_branch_index');
								}

								this.歲首月建序 = ST月序 - 月序[0]
								// 歲首月建序=(ST月序+(is
								// leap?2:1)-月序[0]-(曆數[月序[1]][START_KEY]-START_MONTH))%MONTH_COUNT
								- (START_KEY in 曆數[月序[1]]
								//
								? 曆數[月序[1]][START_KEY] - START_MONTH : 0)
								// 過閏月要再減一。
								+ (閏月後 ? 2 : 1);

								// 將(ST月序)轉為紀年首月之月建序差距。
								// 1: 月建序 - 中氣序
								ST月序 += (閏月後 ? 2 : 1) - (月序[2] || 0);
								break;
							}

							// 跳過無法判斷之月分，移往下個月。
							ST本月起始日 = 1;

						} else {
							// 無法判別的，秦至漢初歲首月建序預設 11。
							// 子正:歲首月建序=0
							// 設定 this.歲首序:已手動設定歲首。
							this.歲首月建序 = (this.歲首序 || 0) + 2;

							// 其他預設甲子年正月(月序0):
							// 丙寅月，月建序(index)=2+月序。
							ST月序 = this.歲首月建序 + (曆數[0] && START_KEY in 曆數[0]
							//
							? 曆數[0][START_KEY] - START_MONTH : 0);
							break;
						}

					閏月後 = library_namespace.BRANCH_LIST.length;
					// positive_modulo
					if ((this.歲首月建序 %= 閏月後) < 0)
						this.歲首月建序 += 閏月後;

					閏月後 = library_namespace.SEXAGENARY_CYCLE_LENGTH;
					// 取得月干支。
					// 月干支每5年一循環。
					// (ST月序):紀年首月之月建序差距。
					起始月干支 = ((this.get_year_stem_branch_index() + 月序[1])
							* MONTH_COUNT + ST月序)
							% 閏月後;
					// positive_modulo
					if (起始月干支 < 0)
						起始月干支 += 閏月後;
					this.起始月干支序 = 起始月干支;
				}

				if (月干支 && isNaN(月干支))
					月干支 = library_namespace.stem_branch_index(月干支);
				if (isNaN(月干支))
					// 回傳紀年首年首月之月干支index。
					return 起始月干支;

				// 找出最接近的月干支所在。
				// 回傳所求干支序之 [ 月序, 歲序 ]。
				// 就算有閏月，每年也不過移動 MONTH_COUNT。
				if (歲序 |= 0) {
					// 算出本歲序首月之月干支。
					// 有閏月的話，月干支會少位移一個月。
					起始月干支 = (起始月干支 + 曆數[0].length
							- (曆數[0][LEAP_MONTH_KEY] ? 1 : 0) + MONTH_COUNT
							* (歲序 - 1))
							% library_namespace.SEXAGENARY_CYCLE_LENGTH;
				}
				// now: 起始月干支 = 歲序(歲序)月序(0)之月干支

				// 取得差距月數，須取得歲序(歲序)月序(0)往後(月干支)個月。
				if ((月序 = 月干支 - 起始月干支) < 0)
					// 確保所求差距月數於起始月干支後。
					月序 += library_namespace.SEXAGENARY_CYCLE_LENGTH;
				if (月序 >= MONTH_COUNT) {

					library_namespace.err('get_month_branch_index: '
					//
					+ this.歲名(歲序) + '年並無此月干支 [' + 月干支 + ']！');

					// 判斷前後差距何者較大。
					if (月序 - 曆數[歲序].length
					// 若是向後月數過大，才採用向前的月分。否則普通情況採用向後的月分。
					> library_namespace.SEXAGENARY_CYCLE_LENGTH - 月序) {
						// 採用向前的月分。
						月序 = library_namespace.SEXAGENARY_CYCLE_LENGTH - 月序;
						// 警告，須檢查(歲序<0)的情況。
						歲序 -= 月序 / MONTH_COUNT | 0;
						月序 %= MONTH_COUNT;
						月序 = 曆數[歲序].length - 月序;
						if (月序 >= 曆數[歲序][LEAP_MONTH_KEY])
							月序--;
					} else {
						// 普通情況採用向後的月分。
						// 警告，須檢查(歲序>=曆數.length)的情況。
						歲序 += 月序 / MONTH_COUNT | 0;
						月序 %= MONTH_COUNT;
					}

				}
				曆數 = 歲序 < 曆數.length && 曆數[歲序];
				// 採用 '>=' 會取非閏月。
				if (曆數 && 曆數[LEAP_MONTH_KEY] <= 月序)
					月序--;
				return [ 月序, 歲序 ];
			}

			// date name of era → Date
			// 年, 月, 日 次/序(ordinal/serial)
			// (start from START_YEAR, START_MONTH, START_DATE)
			// or 年, 月, 日 名(name)
			// or 年, 月, 日 干支
			// end_type = 1: 日, 2: 月, 3: 年, 紀年: 4.
			function date_name_to_Date(年, 月, 日, strict, end_type) {
				if (!this.year_start)
					this.initialize();

				var 干支, year_index = this.歲序(年), month_index;

				if (isNaN(year_index)
				//
				&& !isNaN(干支 = library_namespace.stem_branch_index(年)))
					// 處理年干支。
					year_index = this.get_year_stem_branch_index(干支);

				// 是否為月建。
				if (月)
					if (月.length === 1 && NOT_FOUND !== (干支
					//
					= library_namespace.BRANCH_LIST.indexOf(月))) {
						if (isNaN(this.歲首月建序))
							this.get_month_branch_index();
						month_index = 干支 - this.歲首月建序;
						if (month_index < 0)
							month_index
							//
							+= library_namespace.BRANCH_LIST.length;

					} else if (isNaN(month_index = this.月序(月, year_index || 0))
					//
					&& !isNaN(干支 = library_namespace.stem_branch_index(月))) {
						// 處理月干支。
						// 回傳所求月干支之 [ 月序, 歲序 ]。
						month_index = this.get_month_branch_index(干支,
								year_index || 0);
						// 檢查此年之此月是否為此干支。
						if (year_index !== month_index[1]) {
							if (!isNaN(year_index))
								library_namespace.err('date_name_to_Date: '
										+ this.歲名(year_index) + '年並無此月干支 [' + 月
										+ ']！');
							// 直接設定歲序。
							year_index = month_index[1];
						}
						month_index = month_index[0];
					}

				if (isNaN(year_index)) {
					// assert: !!年 === false
					// 可能只是 to_era_Date() 在作測試，看是否能成功解析？
					if (年 && library_namespace.is_debug()
							|| library_namespace.is_debug(2))
						library_namespace.warn('date_name_to_Date: 未設定或無法辨識年分['
								+ 年 + '] @ ' + this + '。');
					return new Date((end_type === 4 ? this.end : this.start)
							.getTime());
				} else if (end_type === 3)
					year_index++;

				if (isNaN(month_index)) {
					// 可能只是 to_era_Date() 在作測試，看是否能成功解析？
					if (月 && library_namespace.is_debug()
							|| library_namespace.is_debug(2))
						library_namespace.warn('date_name_to_Date: 未設定或無法辨識月分['
								+ 月 + '] @ ' + this + '。');
					return year_index < this.calendar.length
							&& new Date(this.year_start[year_index]);
				} else if (end_type === 2)
					month_index++;

				switch (日) {
				case '朔':
					// 警告:藏曆規定每月十五為望，所以初一可能並不是朔。伊斯蘭曆將新月初現定為每月的第一天，朔則在月末前三四天。
					日 = 1;
					break;
				case '望':
					// 警告:望可能在每月的十五或十六日。
					日 = 15;
					break;
				case '晦':
					日 = this.calendar[year_index][month_index];
					break;
				default:
					break;
				}

				干支 = 日 && this.日序(日, year_index === 0 && month_index === 0);
				if (!isNaN(干支) && end_type === 1)
					干支++;
				// 取得基準 Date。
				year_index = this.date_index_to_Date(year_index, month_index,
				//
				干支 || 0,
				// 作邊界檢查。
				strict);
				// 處理日干支。
				if (isNaN(日)
						&& !isNaN(干支 = library_namespace.stem_branch_index(日)))
					year_index = library_namespace.convert_stem_branch_date(干支,
							year_index);

				return year_index;
			}

			/**
			 * Date → date index of era
			 * 
			 * @param {Date}date
			 * @param {Boolean}accept_end
			 * @returns {Array} [ 歲序, 月序, 日序 | 0 ]
			 */
			function Date_to_date_index(date, accept_end) {
				if (!this.year_start)
					this.initialize();

				var 歲序 = this.year_start.search_sorted(date, {
					found : true
				}),
				//
				month_data = this.calendar[歲序], 月序 = 0, days,
				//
				日序 = Math.floor((date - this.year_start[歲序])
						/ ONE_DAY_LENGTH_VALUE);

				if (!month_data) {
					if (accept_end && 日序 === 0)
						// 剛好在邊界上，越過年。
						// assert: date-this.end === 0 – ONE_DAY_LENGTH_VALUE
						return [ 歲序 - 1, 0, 0 ];

					// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
					if (library_namespace.is_debug())
						library_namespace.err([ 'Date_to_date_index: 日期[',
								date.format(standard_time_format),
								'] 並不在紀年 [' + this, '] 時段內！' ]);
					return;
				}

				while ((days = month_data[月序]) <= 日序)
					日序 -= days, 月序++;

				return [ 歲序, 月序, 日序 | 0 ];
			}

			// 把一年十二個月和天上的十二辰聯繫起來。
			// 閏月月建同本月。
			// 子月：大雪(12月7/8日)至小寒前一日，中氣冬至。
			// 因此可以與12月7日最接近的月首，作為子月初一。
			function comment_月建(date) {
				return date.月干支
				// assert: (date.月干支) 為干支 e.g., '甲子'
				&& date.月干支.charAt(1) || '';
			}

			function comment_季(date) {
				var 月 = date.月;
				if (isNaN(月) && (月 = 月.match(MONTH_NAME_PATTERN)))
					月 = 月[2];

				return 0 <= (月 -= START_MONTH)
				// 此非季節，而為「冬十月」之類用。
				&& 季_LIST.charAt(月 / 4 | 0) || '';
			}

			function comment_旬(date) {
				var 日 = date.日;
				return isNaN(日) ? ''
				// 一個月的第一個十天為上旬，第二個十天為中旬，餘下的天數為下旬。
				: 日 > 10 ? 日 > 20 ? '下' : '中' : '上';
			}

			function comment_生肖(date) {
				return date.年干支序 >= 0
				// 屬相
				? 十二生肖_LIST[date.年干支序 % 十二生肖_LIST.length] : '';
			}

			function comment_五行(date) {
				return date.年干支序 >= 0 ? (date.年干支序 % 2 ? '陰' : '陽')
				// http://zh.wikipedia.org/wiki/五行#五行與干支表
				+ 陰陽五行_LIST[(date.年干支序 >> 1) % 陰陽五行_LIST.length] : '';
			}

			function comment_繞迥(date) {
				var 生肖 = comment_生肖(date);
				return '第' + library_namespace.to_Chinese_numeral(
				// 第一繞迥(rabqung)自公元1027年開始算起
				// 每60年一繞迥，library_namespace.SEXAGENARY_CYCLE_LENGTH
				Math.floor((date.getFullYear() - (1027 - 60)) / 60)) + '繞迥'
				//
				+ (生肖 ? ' ' + comment_五行(date).replace(/金$/, '鐵') + 生肖 : '');
			}

			function comment_二十八宿(date) {
				// http://koyomi8.com/sub/rekicyuu_doc01.htm
				// 日の干支などと同様、28日周期で一巡して元に戻り、これを繰り返すだけである。
				// 8 : 二十八宿_offset
				var index = (8
				// 不可用 "| 0"
				+ Math.floor(date.getTime() / ONE_DAY_LENGTH_VALUE))
						% 二十八宿_LIST.length;
				if (index < 0)
					index += 二十八宿_LIST.length;
				return 二十八宿_LIST[index];
			}

			function comment_二十七宿(date) {
				var index = 二十七宿_offset[date.月] + date.日;
				return date.參照曆法 !== 'CE' && index >= 0
				// 僅對於日本之旧暦與紀年，方能得到正確之暦注值！
				? 二十七宿_LIST[index % 二十七宿_LIST.length] : '';
			}

			function comment_曜日(date) {
				// 七曜
				return 曜日_LIST[date.getDay()];
			}

			function comment_六曜(date) {
				var index = +date.月 + date.日;
				return date.參照曆法 !== 'CE' && index >= 0
				// 六曜は元々は、1箇月（≒30日）を5等分して6日を一定の周期とし（30÷5 =
				// 6）、それぞれの日を星毎に区別する為の単位として使われた。
				// https://ja.wikipedia.org/wiki/%E5%85%AD%E6%9B%9C
				// 旧暦の月の数字と旧暦の日の数字の和が6の倍数であれば大安となる。
				? 六曜_LIST[index % 六曜_LIST.length] : '';
			}

			function comment_月の別名(date, 新暦) {
				// 新暦に適用する
				var index = 新暦 ? date.getMonth() : date.月 - 1;
				return index >= 0 ? 月の別名_LIST[index] : '';
			}

			function comment_反支(date) {
				var 朔干支序 = (library_namespace
				// 月朔日干支序。
				// 36: 能被 library_namespace.BRANCH_LIST.length 整除，且>=大月 之數。
				.stem_branch_index(date) - date.日 + START_DATE + 36)
						% library_namespace.BRANCH_LIST.length,
				// 凡反支日，用月朔為正。戌、亥朔，一日反支。申、酉朔，二日反支。午、未朔，三日反支。辰、巳朔，四日反支。寅、卯朔，五日反支。子、丑朔，六日反支。
				第一反支日 = 6 - (朔干支序 / 2 | 0),
				//
				diff = date.日 - 第一反支日, 反支;
				if (diff % 6 === 0
				// 月朔日為子日之初一，亦可符合上述條件。
				&& 0 <= diff) {
					// 睡虎地和孔家坡:12日一反支
					反支 = '反支';
					if (diff % 12 !== 0)
						// 標記孔家坡:6日一反支
						反支 += '*';
				} else
					反支 = '';

				return 反支;
			}

			function comment_血忌(date) {
				var index = date.月;
				if (index > 0) {
					var 干支序 = ++index / 2 | 0;
					if (index % 2 === 1)
						干支序 += 6;
					if ((library_namespace.stem_branch_index(date)
					// 12: library_namespace.BRANCH_LIST.length
					- 干支序) % 12 === 0)
						return '血忌';
				}
				return '';

				index = [];
				CeL.BRANCH_LIST
				// note: 示例如何計算出各月 index。
				.split('').forEach(function(s) {
					index.push(CeL.stem_branch_index(s));
				});
				[ 1, 7, 2, 8, 3, 9, 4, 10, 5, 11, 6, 0 ];
				return index;
			}

			function comment_三元九運(date) {
				// 64 CE 甲子:上元花甲 一運
				// 一個花甲，共有六十年。而三個花甲，總得一百八十年。
				var index = (date.getFullYear() - 64) % 180;
				if (index < 0)
					index += 180;

				if (false && (index - 1 - (date.年干支序
				// 採用過年改「運」
				|| library_namespace
				// 60: library_namespace.SEXAGENARY_CYCLE_LENGTH
				.guess_year_stem_branch(date, true))) % 60 === 0)
					;
				else {
					// assert: index % 60 === (date.年干支序 ||
					// library_namespace.guess_year_stem_branch(date, true))
				}

				// TODO: 公曆2月3至5日立春後才改「運」，但此處恆定為2月4日改，會因此造成誤差。
				if (date.getMonth() < 2 && date.getDate() < 4)
					// assert: 公曆一、二月，中曆過年前。
					index--;

				// get "運": 二十年一運
				index = index / 20 | 0;

				return '上中下'.charAt(index / 3 | 0) + '元'
				// 運 starts from 1.
				+ library_namespace.to_Chinese_numeral(index + 1) + '運';
			}

			/**
			 * 為 era Date 增添標記，加上曆注(暦注)之類。
			 * 
			 * @param {Date}date
			 * @param {Object}[options]
			 *            options
			 */
			function add_comment(date, options) {
				add_adapt_offset(date, this);

				var date_index = this.comment, tmp, tmp2;

				if (!date_index) {
					date_index = this.comment
					// do cache.
					= library_namespace.null_Object();

					add_comment.copy_attributes.forEach(function(key) {
						if (this[key])
							date_index[key] = this[key];
					}, this);

					date_index.注 = Array.isArray(tmp = this.注) ? tmp
					//
					: tmp ? [ tmp ] : [];

					// 查詢某時間點（時刻）的日期資訊，如月干支等：
					// 對所有紀年，找出此時間點相應之曆數：
					// 若年分起始未初始化，則初始化、解壓縮之。
					// 依年分起始 Date value，以 binary search 找到年分。
					// 依該年之月分資料，找出此時間點相應之月分、日碼(date of month)。

					// Object.seal(紀年);
					// date_index.name = this.name.slice();
					date_index.name = this.name;

					date_index.紀年名 = this.toString();

					for (var tmp = this.name.length,
					// 設定其他屬性。
					tmp2 = period_root; tmp > 0;) {
						tmp2 = tmp2.sub[this.name[--tmp]];
						if (!tmp2)
							break;
						Object.assign(date_index, tmp2.attributes);
					}

					// for '初始.君主: 孺子嬰#1'
					主要索引名稱.forEach(function(name, index) {
						if (tmp = this.name[index])
							if (date_index[name])
								if (Array.isArray(date_index[name]))
									date_index[name].unshift(tmp);
								else
									date_index[name]
									//
									= [ tmp, date_index[name] ];
							else
								date_index[name] = tmp;
					}, this);

				}

				// copy 屬於本紀年的曆注。
				Object.assign(date, date_index);

				// 接著 copy 僅屬於本日期的曆注。

				// [ 歲序, 月序, 日序 | 0 ]
				date_index = this.Date_to_date_index(date);
				if (!date_index) {
					library_namespace.err('add_comment: 加注日期於紀年 [' + this
							+ '] 範圍外！');
				} else {
					// 欲使用 date_index，應該採 (date.年, date.月, date.日)。
					// date.index = date_index;

					date.年干支序 = tmp
					//
					= this.get_year_stem_branch_index() + date_index[0];

					date.歲次 = library_namespace.to_stem_branch(tmp);

					// 精密度至年。
					if (this.精 && (date.精 = this.精) === '年')
						date.年 = this.歲名(date_index[0]);
					else {
						// 日本の暦注。

						// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
						tmp = this.日名(date_index[2], date_index[1],
								date_index[0]).reverse();
						date.閏月 = typeof (tmp2 = tmp[1]) === 'string'
						//
						&& tmp2.charAt(0) === LEAP_MONTH_PREFIX;

						if (options.numeral)
							tmp = numeralize_date_format(tmp, options.numeral);
						date.年 = tmp[0];
						date.月 = tmp[1];
						date.日 = tmp[2];

						if (this.參照曆法)
							date.參照曆法 = this.參照曆法;

						if (0 < +tmp[1]) {
							// http://www.geocities.jp/mishimagoyomi/12choku/12choku.htm
							// 冬至の頃（旧暦11月）に北斗七星のひしゃくの柄の部分が真北（子）に向くため、この日を「建子」の月としました。そこで旧暦11月節（大雪）後の最初の子の日を「建」と定めました。

							// 《通緯·孝經援神契》：「大雪後十五日，斗指子，為冬至，十一月中。陰極而陽始至，日南至，漸長至也。」
							// 大雪後首子日，十二直為「建」。但12節重複前一日之十二直，因此須先計算12節。
							// http://koyomi8.com/sub/rekicyuu_doc01.htm#jyuunicyoku
							if (false)
								date.十二直 = 十二直_LIST[(十二直_LIST.length - tmp[1]
								// 誤:日支與當月之月建相同，則十二直為"建"。
								+ library_namespace.stem_branch_index(date))
										% 十二直_LIST.length];
						}

						// TODO:
						// 二十四節氣，每月有一個節氣，一個中氣，分別發生在每月的7日和22日前後。
						// 物候(七十二候, 初候/二候/三候, 初候/次候/末候), 候應
						// 二十四番花信風 http://baike.baidu.com/view/54438.htm

						tmp = this.calendar[date_index[0]][date_index[1]];
						if (date_index[0] === 0 && date_index[1] === 0
						//
						&& (START_DATE_KEY in this.calendar))
							tmp += this.calendar[START_DATE_KEY] - START_DATE;
						// 大月
						date.大小月 = (tmp2 = this.大月) ? tmp < tmp2 ? '小' : '大'
						//
						: tmp === 大月 ? '大' : tmp === 小月 ? '小' : '(' + tmp
								+ '日)';

						// 取得當年閏月 index。
						tmp = this.calendar[
						//
						tmp2 = date_index[0]][LEAP_MONTH_KEY];
						date.月干支 = library_namespace.to_stem_branch(
						// 基準點。
						this.get_month_branch_index()
						// 就算有閏月，每年也不過移動 MONTH_COUNT。
						+ MONTH_COUNT * tmp2 + date_index[1]
						// 為非一月開始的紀年作修正。
						- (0 < tmp2 && (tmp2 = this.calendar[0][START_KEY])
						//
						? tmp2 - START_MONTH : 0)
						// 閏月或在閏月之後的 index，都得減一。
						- (!tmp || date_index[1] < tmp ? 0 : 1));
					}
				}

				if (false)
					date.日干支 = date.format({
						format : '%日干支',
						locale : library_namespace.gettext
								.to_standard('Chinese')
					});

				// 後期修正。post fix.
				if (typeof this.fix === 'function')
					this.fix(date);

				// after care.
				if (date.注.length === 0)
					delete date.注;

				return date;
			}

			Object.assign(add_comment, {
				// 預設會 copy 的紀年曆注。
				// 據: 根據/出典/原始參考文獻/資料引用來源。
				copy_attributes : '據,準,曆法'.split(','),
				// 曆注, comment
				// 減輕負擔:要這些曆注的自己算。
				comments : {
					月建 : comment_月建,
					季 : comment_季,
					旬 : comment_旬,
					生肖 : comment_生肖,
					五行 : comment_五行,
					繞迥 : comment_繞迥,
					三元九運 : comment_三元九運,

					月の別名 : comment_月の別名,

					反支 : comment_反支,
					血忌 : comment_血忌,
					曜日 : comment_曜日,
					六曜 : comment_六曜,
					二十八宿 : comment_二十八宿,
					二十七宿 : comment_二十七宿
				}
			});

			Object.assign(Era.prototype, {
				// 月次，歲次與 index 之互換。
				// 注意：此處"序"指的是 Array index，從 0 開始。
				// "次"則從 1 開始，閏月次與本月次相同。
				// 若無特殊設定，則"次"="名"。
				歲序 : year_name_to_index,
				月序 : month_name_to_index,
				日序 : date_name_to_index,
				歲名 : year_index_to_name,
				月名 : month_index_to_name,
				日名 : date_index_to_name,

				shift_month : shift_month,

				initialize : initialize_era_date,
				get_month_branch_index : get_month_branch_index,
				get_year_stem_branch_index : get_year_stem_branch_index,
				date_name_to_Date : date_name_to_Date,
				date_index_to_Date : date_index_to_Date,
				Date_to_date_index : Date_to_date_index,

				add_comment : add_comment,
				// 若偵測是否已經存在，則 IE 8 得特別設定。恐怕因原先已經存在?
				toString : get_era_name
			});

			// ---------------------------------------------------------------------//

			// private 工具函數：分割資料檔使用之日期(起訖時間)。
			// return [ 起始時間, 訖, parser ]
			function parse_duration(date, era) {
				var tmp;
				if (typeof date === 'string' && (tmp = date.match(
				// [ matched, parser, 起, 訖1, 訖2 ]
				/^(?:([^:]+):)?([^–－—~～〜至:]*)(?:[–－—~～〜至](.*)|(\+\d+))\s*$/)))
					date = [ tmp[2], tmp[3] || tmp[4], tmp[1] ];

				if (Array.isArray(date) && date.length > 0) {
					if (!date[2]) {
						// 起始時間
						tmp = date[0];
						// 針對從下一筆紀年調來的資料。
						if (typeof tmp === 'string' && (tmp = tmp
						//
						.match(/^(?:([^:]+):)?([^–－—~～〜至:]*)/)))
							date = [ tmp[2], date[1], tmp[1] ];
					}

					if (/^\d{1,2}\/\d{1,2}$/.test(date[1])
					//
					&& (tmp = date[0].match(/^(\d+\/)\d{1,2}\/\d{1,2}$/)))
						// 補上與起始時間相同年分。
						date[1] = tmp[1] + date[1];

					return date;
				}

				library_namespace.err('parse_duration: 無法判別 [' + era
						+ '] 之起訖時間！');
				// return date;
			}

			/**
			 * 工具函數：正規化日期。
			 * 
			 * @private
			 */
			function normalize_date(date, parser, period_end, get_date) {
				library_namespace.debug('以 parser [' + parser + '] 解析 [' + date
						+ ']。', 2, 'normalize_date');
				if (!date)
					return '';

				if (!is_Date(date)) {
					var string, to_period_end = period_end && function() {
						var tmp, matched = string.match(
						// 警告:並非萬全之法!
						/(-?\d+)(?:[\/.\-年 ](\d+)(?:[\/.\-月 ](\d+))?)?/);

						if (matched) {
							matched.shift();
							while (!(tmp = matched.pop()))
								;
							matched.push(++tmp);
							string = matched.join('/');
							period_end = false;
						}
					};

					if (parser in search_index) {
						var era_Set = search_index[parser];
						if (!(era_Set instanceof Set)
						// 確定 parser 為唯一且原生的 era key。
						|| era_Set.size !== 1) {
							library_namespace.err(
							//
							'normalize_date: 無法確認 parser：共有 ' + era_Set.size
									+ ' 個 [' + parser + ']！');
							return;
						}
						era_Set.forEach(function(era) {
							parser = era;
						});
						string = date;
						period_end && to_period_end();
						date = to_era_Date({
							紀年 : parser,
							日期 : string
						}, {
							date_only : true
						});
						if (period_end)
							// 警告:取後一日:並非萬全之法!
							date.setDate(date.getDate() + 1);

					} else if ((/^-?\d{1,4}$/
							.test(string = String(date).trim())
					// 因為 String_to_Date 不好設定僅 parse ('80') 成
					// '80/1/1'，因此在此須自己先作個 padding。
					? (string = string.replace(/^(\d{1,2})$/, '$1'.pad(4, 0)))
					//
					: '' === string.replace(
					// 先確定 .to_Date 有辦法 parse。
					String_to_Date.default_parser.date_first, ''))
							//
							&& typeof string.to_Date === 'function'
							//
							&& (parser = string.to_Date({
								parser : parser === PASS_PARSER ? undefined
										: parser || DEFAULT_DATE_PARSER,
								period_end : period_end,
								// 於 CE 可避免 80 被 parse 成 1980。
								year_padding : 0
							})))
						date = parser;

					else {
						// e.g., 魯春秋-722, 秦漢歷-246
						period_end && to_period_end();
						date = to_era_Date(string, {
							date_only : true
						});
						if (period_end)
							// 警告:取後一日:並非萬全之法!
							date.setDate(date.getDate() + 1);
					}
				}
				// else: 已經處理過了?

				if (is_Date(date))
					if (get_date)
						return date;
					else if (typeof date.format === 'function')
						return date.format(DATE_NAME_FORMAT);

				library_namespace.err('normalize_date: 無法解析 [' + date + ']！');
			}

			/**
			 * 在可適度修改或檢閱紀年資料的範疇內，極小化壓縮紀年的曆數資料。<br />
			 * 會更改到 plain_era_data！
			 * 
			 * @example <code>
			 * CeL.era.pack('/文宗/天曆|1329/8/25~|2/8=30;29;29;30;30\t29;30;30;29');
			 * </code>
			 * 
			 * @param {Array|Object|String}plain_era_data
			 *            紀年資料。
			 * 
			 * @returns {String}壓縮後的紀年資料。
			 */
			function pack_era(plain_era_data) {

				// 單筆/多筆共用函數。

				function pre_parse(era) {
					if (typeof era === 'string')
						era = era.split(pack_era.field_separator);
					if (Array.isArray(era) && era.length === 1
							&& era[0].includes(
							//
							pack_era.month_separator))
						era.unshift('紀年', '');
					if (Array.isArray(era) && 1 < era.length) {
						// 使 pack_era() 可採用 Era / 壓縮過的日期資料 為 input。
						// TODO: 尚未完善。應直接採用 parse_era 解析。
						era[0] = era[0].split(pack_era.era_name_classifier);
						(era[2] = era[2].split(pack_era.year_separator))
								.forEach(function(date, index) {
									era[2][index] = date
											.split(pack_era.month_separator);
								});
						era = {
							紀年 : era[0],
							起訖 : parse_duration(era[1], era[0])
							// assert: 已經警示過了。
							|| era[1].split(/[–－—~～〜至]/),
							曆數 : era[2]
						};
					}
					return era;
				}

				// -----------------------------
				// 處理多筆紀年。

				if (Array.isArray(plain_era_data)) {
					var last_era = [],
					// 上一紀年結束日期。
					last_end_date, era_list = [];

					plain_era_data.forEach(function(era) {
						if (!library_namespace.is_Object(
						//
						era = pre_parse(era))) {
							library_namespace.err('pack_era: 跳過資料結構錯誤的紀年資料！');
							return;
						}

						// 簡併紀年名稱。
						var i = 0, this_era = era.紀年, no_inherit;
						if (!Array.isArray(this_era))
							this_era = [ this_era ];
						for (; i < this_era.length; i++)
							if (!no_inherit && this_era[i] === last_era[i])
								this_era[i] = '';
							else {
								no_inherit = true;
								if (this_era[i] !== parse_era.inherit)
									last_era[i] = this_era[i] || '';
							}
						era.紀年 = this_era;

						// 簡併起訖日期。
						// 起訖 : [ 起, 訖, parser ]
						if (!(this_era = parse_duration(era.起訖, this_era))) {
							library_namespace
									.err('pack_era(Array): 跳過起訖日期錯誤的紀年資料！');
							return;
						}
						// 回存。
						era.起訖 = this_era;

						// 正規化日期。
						// assert: 整個 era Array 都使用相同 parser。

						// 若上一紀年結束日期 == 本紀年開始日期，
						// 則除去上一紀年結束日期。
						if (
						// cache 計算過的值。
						(this_era[0] = normalize_date(this_era[0], this_era[2]
								|| PASS_PARSER))
								&& this_era[0] === last_end_date) {
							library_namespace.debug('接續上一個紀年的日期 ['
									+ last_end_date + ']。除去上一紀年結束日期。', 2);
							last_era.date[1] = '';

							// 這是採除去本紀年開始日期時的方法。
							// this_era[0] = '';

							// 之所以不採除去本紀年的方法，是因為：
							// 史書通常紀載的是紀年開始的日期，而非何時結束。
						} else
							library_namespace.debug('未接續上一個紀年的日期: ['
									+ last_end_date + ']→[' + this_era[0]
									+ ']。', 2);

						if (持續日數_PATTERN.test((last_era.date = this_era)[1])) {
							(last_end_date = normalize_date(this_era[0],
									this_era[2] || PASS_PARSER, true, true))
									.setDate(+this_era[1]);
							last_end_date = normalize_date(last_end_date);
							library_namespace.debug('訖時間 "+d" [' + this_era[1]
									+ '] : 持續日數 [' + last_end_date + ']。', 2);
						} else {
							last_end_date = normalize_date(this_era[1].trim(),
									this_era[2] || PASS_PARSER, true);
							library_namespace.debug('訖時間 "－y/m/d" ['
									+ this_era[1] + '] : 指定 end date ['
									+ last_end_date + ']。', 2);
						}

						era_list.push(era);
					});

					// 因為可能動到前一筆資料，只好在最後才從頭再跑一次。
					library_namespace.debug('開始 pack data。', 2);
					last_era = [];
					era_list.forEach(function(era) {
						last_era.push(pack_era(era));
					});

					library_namespace.debug('共轉換 ' + last_era.length + '/'
							+ era_list.length + '/' + plain_era_data.length
							+ ' 筆紀錄。');

					return last_era;
				}

				// -----------------------------
				// 處理單筆紀年。

				if (!library_namespace.is_Object(
				//
				plain_era_data = pre_parse(plain_era_data))) {
					library_namespace.err('pack_era: 無法判別紀年資料！');
					return plain_era_data;
				}

				// 至此 plain_era_data = {
				// 紀年 : [ 朝代, 君主(帝王), 紀年名稱 ],
				// 起訖 : [ 起, 訖, parser ],
				// 曆數 : [ [1年之月分資料], [2年之月分資料], .. ],
				// 其他附加屬性 : ..
				// }

				var i = 0, j,
				//
				year_data,
				// 當前年度
				year_now = START_YEAR,
				// 當前月分
				month_now,
				// 壓縮用月分資料
				month_data,
				//
				month_name,
				//
				前項已壓縮,
				// {String} 二進位閏月 index
				leap_month_index_base_2, 日數,
				//
				年名, 月名, 起始日碼,
				//
				to_skip = {
					紀年 : 0,
					起訖 : 1,
					曆數 : 2
				}, packed_era_data,
				//
				紀年名稱 = plain_era_data.紀年,
				//
				起訖時間 = parse_duration(plain_era_data.起訖, 紀年名稱),
				// calendar_data
				年度月分資料 = plain_era_data.曆數;

				if (!起訖時間) {
					起訖時間 = [];
					// return;
				}

				if (!Array.isArray(年度月分資料) || !年度月分資料[0]) {
					library_namespace.err('pack_era: 未設定年度月分資料！');
					return;
				}

				if (Array.isArray(紀年名稱))
					紀年名稱 = 紀年名稱.join(pack_era.era_name_classifier)
					//
					.replace(pack_era.era_name_重複起頭,
							pack_era.era_name_classifier)
					//
					.replace(pack_era.era_name_符號結尾, '');
				if (!紀年名稱 || typeof 紀年名稱 !== 'string') {
					library_namespace.err(
					//
					'pack_era: 無法判別紀年名稱: [' + 紀年名稱 + ']');
					return;
				}

				// 簡併月分資料。
				for (; i < 年度月分資料.length; i++, year_now++) {
					year_data = 年度月分資料[i];
					// 每年自一月開始。
					month_now = START_MONTH;
					month_data = [];
					leap_month_index_base_2 = '';
					for (j = 0; j < year_data.length; j++, month_now++) {
						// 允許之日數格式：
						// 日數
						// '起始日碼=日數'
						// [ 起始日碼, 日數 ]
						if (isNaN(日數 = year_data[j])) {
							if (typeof 日數 === 'string')
								日數 = 日數.split('=');

							if (!Array.isArray(日數) || 日數.length !== 2) {
								library_namespace.err(
								//
								'pack_era: 無法辨識日數資料 [' + year_data[j] + ']！');
								month_data = null;

							} else {
								if (起始日碼 = parse_calendar_date_name(
								//
								月名 = String(日數[0])))
									// [ 年名, 月名, 起始日碼 ]
									年名 = 起始日碼[0], 月名 = 起始日碼[1], 起始日碼 = 起始日碼[2];

								else {
									library_namespace.warn(
									//
									'pack_era: 無法辨識紀年 [' + 紀年名稱 + '] '
											+ year_now + '年之年度月分資料 ' + j + '/'
											+ year_data.length + '：起始日碼 [' + 月名
											+ ']，將之逕作為月分名！');
									年名 = 起始日碼 = '';
								}

								// assert: 至此 (年名), (月名), (起始日碼) 皆已設定。

								日數 = 日數[1];

								if (year_now == 年名)
									年名 = '';
								if (month_now == 月名)
									月名 = '';
								if (START_DATE == 起始日碼)
									起始日碼 = '';

								if ((month_name = 月名) || 年名 || 起始日碼) {
									// 可能為: 閏?\d+, illegal.

									if (i === 0 && j === 0 && !起始日碼
											&& (month_name = month_name.match(
											//
											MONTH_NAME_PATTERN))) {
										library_namespace.info(
										//
										'pack_era: 紀年 [' + 紀年名稱 + '] '
										//
										+ (年名 || year_now) + '年：起始的年月分並非 '
												+ year_now + '/' + month_now
												+ '，而為 ' + 年名 + '/' + 月名);

										// 將元年前面不足的填滿。
										// 為了增高壓縮率，對元年即使給了整年的資料，也僅取從指定之日期開始之資料。
										month_data = new Array(
										// reset
										month_now = +month_name[2]
												+ (month_name[1] ? 1 : 0))
												.join('0').split('');
									}

									// 處理簡略表示法: '閏=\d+'
									if (月名 === LEAP_MONTH_PREFIX)
										月名 += month_now - 1;
									// 可壓縮: 必須為閏(month_now - 1)
									if ((month_name = 月名) !== LEAP_MONTH_PREFIX
											+ (month_now - 1)
											|| 年名 || 起始日碼) {
										if ((month_name = 月名)
										//
										!== LEAP_MONTH_PREFIX + (month_now - 1)
												&& (i > 0 || j > 0)) {
											library_namespace.warn(
											//
											'pack_era: 紀年 [' + 紀年名稱 + '] '
											//
											+ year_now + '年：日期非序號或未按照順序。月分資料 '
													+ (j + START_MONTH) + '/'
													+ year_data.length + ' ['
													+ year_now + '/'
													+ month_now + '/'
													+ START_DATE + '] → ['
													+ (年名 || '') + '/'
													+ (月名 || '') + '/'
													+ (起始日碼 || '') + ']');
											month_data = null;
										}

									} else if (leap_month_index_base_2) {
										library_namespace.err(
										//
										'pack_era: 本年有超過1個閏月！');
										month_data = null;

									} else {
										// 處理正常閏月。
										if (month_data) {
											leap_month_index_base_2 =
											// 二進位
											month_data.length
											//
											.toString(RADIX_2);
											// 預防
											// leap_month_index_base_2
											// 過短。
											leap_month_index_base_2
											//
											= LEAP_MONTH_PADDING
											//
											.slice(0, LEAP_MONTH_PADDING.length
											//
											- leap_month_index_base_2.length)
													+ leap_month_index_base_2;
										} else
											leap_month_index_base_2
											//
											= month_now;

										month_now--;
									}

									if (month_name = (年名 ? 年名 + '/' : '')
											+ (月名 || '')
											+ (起始日碼 ? '/' + 起始日碼 : ''))
										month_name += '=';

									if (year_data[j] != (month_name += 日數))
										year_data[j] = month_name;

									if (年名 !== '' && !isNaN(年名)) {
										library_namespace.debug('year: '
												+ year_now + ' → ' + 年名, 2);
										year_now = 年名;
									}

									if (月名 !== ''
											&& typeof 月名 === 'string'
											&& !isNaN(月名 = 月名.replace(
													MONTH_NAME_PATTERN, '$2'))
											&& month_now != 月名) {
										library_namespace.debug('month: '
												+ month_now + ' → ' + 月名, 2);
										month_now = 月名;
									}

								} else if (year_data[j] != 日數)
									// 可省略起始日碼的情況。
									year_data[j] = 日數;

							}
						}

						if (month_data)
							if (日數 in MONTH_DAY_INDEX) {
								month_data.push(MONTH_DAY_INDEX[日數]);
							} else {
								library_namespace.warn(
								//
								'pack_era: 錯誤的日數？[' + 日數 + ']日。');
								month_data = null;
							}
					}

					if (month_data) {
						j = MONTH_COUNT + (leap_month_index_base_2 ? 1 : 0);
						if (month_data.length < j) {
							// padding
							Array_push(
							//
							month_data, new Array(j + 1 - month_data.length)
									.join(0).split(''));
						} else if (month_data.length > j) {
							library_namespace.warn('pack_era: 紀年 [' + 紀年名稱
									+ '] ' + year_now + '年：月分資料過長！');
						}

						if (library_namespace.is_debug(2))
							j = '] ← ['
									+ month_data.join('')
									+ (leap_month_index_base_2 ? ' '
											+ leap_month_index_base_2 : '')
									+ '] ← ['
									+ year_data.join(pack_era.month_separator)
									+ ']';
						month_data = parseInt(
						// 為了保持應有的長度，最前面加上 1。
						'1' + month_data.join('') + leap_month_index_base_2,
								RADIX_2)
						//
						.toString(PACK_RADIX);

						if (month_data.length > YEAR_CHUNK_SIZE)
							library_namespace.warn('pack_era: 紀年 [' + 紀年名稱
									+ '] ' + year_now + '年：月分資料過長！');
						else if (month_data.length < YEAR_CHUNK_SIZE
						// 非尾
						&& i < 年度月分資料.length - 1) {
							if (month_data.length < YEAR_CHUNK_SIZE - 1
							// 非首
							&& i > 0)
								// 非首非尾
								library_namespace.warn('pack_era:紀年 [' + 紀年名稱
										+ '] ' + year_now + '年：月分資料過短！');
							// 注意：閏月之 index 是 padding 前之資料。
							month_data += PACKED_YEAR_CHUNK_PADDING.slice(0,
									YEAR_CHUNK_SIZE - month_data.length);
						}
						library_namespace.debug('[' + month_data + j, 2);

						if (i === 0 && /\=./.test(year_data[0]))
							month_data = year_data[0].replace(/[^=]+$/, '')
									+ month_data;
						年度月分資料[i] = month_data;

					} else {
						// 可能只是 to_era_Date() 在作測試，看是否能成功解析。
						if (library_namespace.is_debug())
							library_namespace.warn(
							//
							'pack_era: 無法壓縮紀年 [' + 紀年名稱 + '] ' + year_now
									+ '年資料 ['
									+ year_data.join(pack_era.month_separator)
									+ ']');
						// 年與年以 pack_era.year_separator 分隔。
						// 月與月以 pack_era.month_separator 分隔。
						年度月分資料[i] = (前項已壓縮 ? pack_era.year_separator : '')
								+ year_data.join(pack_era.month_separator)
								+ pack_era.year_separator;
					}

					前項已壓縮 = !!month_data;
				}

				年度月分資料[i - 1] = 前項已壓縮 ? 年度月分資料[i - 1].replace(/\s+$/, '')
						: 年度月分資料[i - 1].slice(0, -1);

				起訖時間[0] = normalize_date(起訖時間[0], 起訖時間[2] || PASS_PARSER);
				if (!持續日數_PATTERN.test(起訖時間[1]))
					// assert: isNaN(起訖時間[1])
					起訖時間[1] = normalize_date(起訖時間[1], 起訖時間[2] || PASS_PARSER);
				// 去掉相同年分。
				// 800/1/1－800/2/1 → 800/1/1–2/1
				if ((i = 起訖時間[0].match(/^[^\/]+\//))
						&& 起訖時間[1].indexOf(i = i[0]) === 0)
					起訖時間[1] = 起訖時間[1].slice(i.length);
				packed_era_data = [ 紀年名稱, (起訖時間[2] ? 起訖時間[2] + ':' : '')
				//
				+ 起訖時間[0] + '~' + 起訖時間[1], 年度月分資料.join('') ];

				// 添加其他附加屬性名稱。
				for (i in plain_era_data)
					if (!(i in to_skip))
						// TODO: 檢查屬性是否有特殊字元。
						packed_era_data.push(i + '=' + plain_era_data[i]);

				return packed_era_data.join(pack_era.field_separator);
			}

			parse_era.inherit = '=';
			pack_era.field_separator = '|';
			// assert: .length === 1
			pack_era.year_separator = '\t';
			// assert: .length === 1
			pack_era.month_separator = ';';
			pack_era.era_name_separator = pack_era.month_separator;

			pack_era.era_name_classifier = '/';
			pack_era.era_name_重複起頭 = new RegExp('^\\'
					+ pack_era.era_name_classifier + '{2,}');
			// 應當用在 "朝代//" 的情況，而非 "/君主/"。
			pack_era.era_name_符號結尾 = new RegExp('\\'
					+ pack_era.era_name_classifier + '+$');

			// ---------------------------------------------------------------------//
			// private 工具函數。

			// set time zone / time offset (UTC offset by minutes)
			function set_minute_offset(date, minute_offset, detect_if_setted) {
				// 偵測/預防重複設定。
				if (detect_if_setted)
					if ('minute_offset' in date) {
						// 已設定過。
						if (date.minute_offset !== minute_offset)
							library_namespace.err('set_minute_offset: 之前已將 '
									+ date + ' 設定成 ' + date.minute_offset
									+ ' 分鐘，現在又欲設定成 ' + minute_offset + ' 分鐘！');
						return;
					} else
						date.minute_offset = minute_offset;
				date.setMinutes(date.getMinutes() - minute_offset);
			}

			function create_era_search_pattern(get_pattern) {
				if (!era_search_pattern) {
					era_key_list = [];
					for ( var key in search_index)
						era_key_list.push(key);

					// 排序:長的 key 排前面。
					era_key_list.sort(function(key_1, key_2) {
						return key_2.length - key_1.length
								|| era_count_of_key(key_2)
								- era_count_of_key(key_1);
					});
					// 從最後搜尋起。
					// 從後端開始搜尋較容易一開始就取得最少的候選者，能少做點處理，較有效率。
					// 因為採用 /().*?$/ 的方法不一定能 match 到所需（按順序）的 key，只好放棄
					// /.*?$/。
					era_search_pattern = new RegExp('(?:'
							+ era_key_list.join('|')
							// escape.
							.replace(/([()])/g, '\\$1')
							// 處理 space。
							.replace(/\s+/g, '\\s*') + ')$',
					// 對分大小寫之名稱，應允許混用。
					'i');
				}

				return get_pattern ? era_search_pattern : era_key_list;
			}

			// private 工具函數。
			function compare_start_date(era_1, era_2) {
				return era_1.start - era_2.start;
			}

			// 避免覆蓋原有值。
			// object[key] = value
			// TODO: {Array}value
			function add_attribute(object, key, value) {
				var v = object[key];
				if (Array.isArray(v))
					v.push(value);
				else
					object[key] = key in object ? [ v, value ] : value;
			}

			function parse_month_name(月名, 月名_Array) {
				月名 = 月名.split(pack_era.month_separator);
				if (月名.length > 0) {
					if (!Array.isArray(月名_Array))
						月名_Array = [];

					var index = 0, matched;
					月名.forEach(function(名) {
						名 = 名.trim();
						if ((matched = 名.match(/^(\d+)\s*:\s*(.+)$/))
								&& START_MONTH <= matched[1])
							index = matched[1] - START_MONTH, 名 = matched[2];
						if (名)
							月名_Array[index++] = 名;
					});
				}

				return 月名_Array;
			}

			function get_closed_year_start(date) {
				var year = date.getFullYear(), 前 = new Date(0, 0),
				// 僅使用 new Date(0) 的話，會含入 timezone offset (.getTimezoneOffset)。
				// 因此得使用 new Date(0, 0)。
				後 = new Date(0, 0);

				// incase year 0–99
				前.setFullYear(year, 0, 1);
				後.setFullYear(year + 1, 0, 1);

				return date - 前 < 後 - date ? 前 : 後;
			}

			// 處理朝代紀年之 main functions。

			// build data (using insertion):
			// parse era data
			function parse_era(era_data_array, options) {

				function pre_parse_紀年資料(index) {
					var i, j, 附加屬性, era_data = era_data_array[index];
					if (typeof era_data === 'string')
						era_data = era_data.split(pack_era.field_separator);

					else if (library_namespace.is_Object(era_data)) {
						附加屬性 = era_data;
						if (era_data.data) {
							era_data = era_data.data
									.split(pack_era.field_separator);
							delete 附加屬性.data;
						} else
							era_data = [];

						for (i in 紀年名稱索引值)
							// 當正式名稱闕如時，將附加屬性 copy 作為正式名稱。
							if (!era_data[j = 紀年名稱索引值[i]] && (i in 附加屬性)) {
								era_data[j] = 附加屬性[i];
								delete 附加屬性[i];
							}
					}

					if (!Array.isArray(era_data) || era_data.length < 2) {
						library_namespace
								.err('parse_era.pre_parse_紀年資料: 無法判別紀年 ['
										+ index + '] 之資料！');
						return;
					}

					if (!era_data.parsed) {

						if (era_data.length < 3) {
							if (library_namespace.is_Object(i = era_data[1]))
								附加屬性 = i;
							else
								i = [ i ];
							era_data = era_data[0]
									.split(pack_era.field_separator);
						} else
							i = era_data.slice(3);

						if (!附加屬性)
							附加屬性 = library_namespace.null_Object();
						i.forEach(function(pair) {
							if (j = pair.match(
							//		
							/^\s*([^=]+)\s*=\s*([^\s].*)\s*$/))
								add_attribute(附加屬性, j[1], j[2]);
							else if (/^[^\s,.;]+$/.test(pair))
								// 預設將屬性定為 true。
								add_attribute(附加屬性, pair, true);
							else
								library_namespace.debug(
								//
								'無法解析屬性值[' + pair + ']！');
						});

						era_data.length = 3;
						era_data[3] = 附加屬性;
						era_data.parsed = true;
						// 回存。
						era_data_array[index] = era_data;
					}
					return era_data;
				}

				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

				if (!Array.isArray(era_data_array))
					era_data_array = [ era_data_array ];

				// 主要功能。
				var 前一紀年名稱 = [],
				//
				國家 = options.國家 || parse_era.default_country,
				// 上一紀年資料 @ era_list。
				last_era_data,
				// 紀元所使用的當地之 time zone / time offset (UTC offset by minutes)。
				// e.g., UTC+8: 8 * 60 = 480
				// e.g., UTC-5: -5 * 60
				minute_offset = era_data_array.minute_offset
				// 直接將時間設定成「紀元使用地真正之時間」使用。
				// (era_data_array.minute_offset || 0) +
				// String_to_Date.default_offset
				;

				era_data_array.forEach(function(era_data, index) {

					if (!(era_data = pre_parse_紀年資料(index)))
						return;

					var tmp, i, j, k,
					//
					紀年 = era_data[0], 起訖 = era_data[1], 曆數 = era_data[2],
					//
					附加屬性 = era_data[3];

					// 至此已設定完成 (紀年), (起訖), (曆數), (其他附加屬性)。

					if (紀年 && !Array.isArray(紀年))
						紀年 = String(紀年).split(pack_era.era_name_classifier);
					if (!紀年 || 紀年.length === 0) {
						library_namespace.err('parse_era: 無法判別紀年 [' + index
								+ '] 之名稱資訊！');
						return;
					}

					library_namespace.debug(
					//
					'前期準備：正規化紀年 [' + 紀年 + '] 之名稱資訊。', 2);

					// 紀年 = [ 朝代, 君主(帝王), 紀年 ]
					// 配合 (紀年名稱索引值)
					if (紀年.length === 1 && 紀年[0])
						// 朝代兼紀年：紀年=朝代
						前一紀年名稱 = [ 紀年[2] = 紀年[0] ];

					else {
						if (!紀年[0] && (tmp = 前一紀年名稱.length) > 0) {
							// 填補 inherited 繼承值/預設值。
							// 得允許前一位有紀年，後一位無；以及相反的情況。
							紀年.shift();
							tmp -= 紀年.length;
							// 3 = 最大紀年名稱資料長度 = 紀年名稱索引值.國家
							Array.prototype.unshift.apply(紀年, 前一紀年名稱.slice(0,
									tmp > 1 ? tmp : 1));
						}
						紀年.forEach(function(name, index) {
							if (name === parse_era.inherit) {
								if (!前一紀年名稱[index])
									library_namespace.err('parse_era: 前一紀年 ['
											+ 前一紀年名稱 + '] 並未設定 index [' + index
											+ ']！');
								紀年[index] = 前一紀年名稱[index] || '';
							}
						});

						// do clone
						前一紀年名稱 = 紀年.slice();
						if (紀年[1] && !紀年[2])
							// 朝代/君主(帝王)：紀年=君主(帝王)
							紀年[2] = 紀年[1];
					}

					紀年.reverse();
					if (國家 && !紀年[3])
						紀年[3] = 國家;

					// assert: 至此
					// 前一紀年名稱 = [ 朝代, 君主(帝王), 紀年 ]
					// 紀年 = [ 紀年, 君主(帝王), 朝代, 國家 ]

					library_namespace.debug(
					//
					'前期準備：正規化紀年 [' + 紀年 + '] 起訖日期。', 2);

					if (!(起訖 = parse_duration(起訖, 紀年)))
						if (options.extract_only)
							起訖 = [ new Date(0), new Date(0) ];
						else {
							library_namespace.err('parse_era: 跳過起訖日期錯誤的紀年資料！');
							return;
						}

					if (!起訖[0])
						if (index > 0)
							// 本一個紀年的起始日期接續上一個紀年。
							起訖[0] = era_data_array[index - 1].end;
						else if (options.extract_only)
							起訖[0] = new Date(0);
						else {
							library_namespace.err('parse_era: 沒有上一紀年以資參考！');
							return;
						}

					起訖[0] = normalize_date(起訖[0], 起訖[2], false, true);

					if (起訖[1])
						// tmp 於此將設成是否取終點。
						tmp = true;
					else if ((tmp = pre_parse_紀年資料(index + 1))
					// 下一個紀年的起始日期接續本紀年，因此先分解下一個紀年。
					// assert: tmp[1](起訖) is String
					&& (tmp = parse_duration(tmp[1], tmp[0]))) {
						起訖[1] = tmp[0];
						起訖[2] = tmp[2];
						// 既然直接採下一個紀年的起始日期，就不需要取終點了。
						tmp = false;
					} else if (options.extract_only)
						起訖[1] = new Date(0);
					else {
						library_namespace.err('parse_era: 無法求得紀年結束時間！');
						return;
					}

					if (持續日數_PATTERN.test(起訖[1])) {
						// 訖時間 "+d" : 持續日數
						tmp = +起訖[1];
						(起訖[1] = normalize_date(起訖[0], 起訖[2], true, true))
								.setDate(tmp);

					} else
						// 訖時間 "–y/m/d"
						起訖[1] = normalize_date(起訖[1], 起訖[2], tmp, true);

					tmp = {
						// 紀年名稱資訊（範疇小→大）
						// [ 紀年, 君主(帝王), 朝代, 國家, 其他搜尋 keys ]
						name : 紀年,

						// {Date}起 標準時間(如UTC+8),開始時間.
						start : 起訖[0],
						// {Date}訖 標準時間(如UTC+8), 結束時間.
						end : 起訖[1],

						// 共存紀年/同時存在紀年 []:
						// 在本紀年開始時尚未結束的紀年 list,
						contemporary : [],

						// 年分起始 Date value (搜尋用) [ 1年, 2年, .. ],
						// year_tart:[],

						// 曆數/歷譜資料:
						// 各月分資料 [ [1年之月分資料], [2年之月分資料], .. ],
						// 這邊還不先作處理。
						calendar : 曆數

					// { 其他附加屬性 : .. }
					};

					// 處理 time zone / time offset (UTC offset by minutes)
					if (!isNaN(minute_offset)) {
						// 注意:這邊不設定真正的 date value，使得所得出的值為「把本地當作紀元所使用的當地」所得出之值。
						tmp[MINUTE_OFFSET_KEY] = minute_offset;
						// set_minute_offset(起訖[0], minute_offset, true);
						// set_minute_offset(起訖[1], minute_offset, true);
					}

					// assert: 至此
					// 起訖 = [ 起 Date, 訖 Date, parser ]

					last_era_data = new Era(tmp);

					library_namespace.debug('add period [' + 紀年 + ']。', 2);

					i = 紀年名稱索引值.國家;
					k = undefined;
					tmp = period_root;
					// [ , 君主, 朝代, 國家 ]
					var period_attribute_hierarchy = [];
					for (var start = 起訖[0].getTime(),
					//
					end = 起訖[1].getTime();;) {
						// 若本 era 之時間範圍於原 period 外，
						// 則擴張 period 之時間範圍以包含本 era。
						if (!(tmp.start <= start))
							tmp.start = start;
						if (!(end <= tmp.end))
							tmp.end = end;

						if (!(j = 紀年[i]) || i <= 0) {
							if (j || (j = k)) {
								if (!tmp.era)
									tmp.era = library_namespace.null_Object();
								if (j in tmp.era) {
									// 有衝突。
									if (Array.isArray(tmp.era[j]))
										tmp.era[j].push(last_era_data);
									else
										tmp.era[j]
										//
										= [ tmp.era[j], last_era_data ];

									if (library_namespace.is_debug())
										library_namespace.warn(
										//
										'parse_era: 存在相同朝代、名稱重複之紀年 '
												+ tmp.era[j].length + ' 個: '
												+ last_era_data);
								} else
									// 一般情況。
									tmp.era[j] = last_era_data;
							}
							break;
						}

						k = j;
						if (!(j in tmp.sub))
							tmp.add_sub(start, end, j);

						period_attribute_hierarchy[i--]
						// move to sub-period.
						= (tmp = tmp.sub[j]).attributes;
					}

					library_namespace.debug('設定紀年[' + 紀年 + ']之搜尋用 index。', 2);

					紀年.forEach(function(era_token) {
						add_to_era_by_key(era_token, last_era_data);
					});

					library_namespace.debug(
					//
					'正規化紀年 [' + 紀年 + '] 之其他屬性。', 2);

					for (i in 附加屬性) {
						j = 附加屬性[i];
						if (i in Period_屬性歸屬) {
							i = Period_屬性歸屬[tmp = i];
							// now: tmp = name,
							// i = Period_屬性歸屬 index of name
							// e.g., tmp = 君主名, i = 1

							// 解開屬性值。
							// j = 'a;b' → k = [ 'a', 'b' ]
							if (Array.isArray(j)) {
								k = [];
								j.forEach(function(name) {
									Array_push(k, name
									//
									.split(pack_era.era_name_separator));
								});

							} else
								k = j.split(pack_era.era_name_separator);

							// 將屬性值搬移至 period_root 之 tree 中。
							// i === 0，即紀元本身時，毋須搬移。
							if (0 < i) {
								// j: attributes of hierarchy[i]
								j = period_attribute_hierarchy[i];
								// assert: Object.isObject(j)
								if (tmp in j)
									// 解決重複設定、多重設定問題。
									// assert: Array.isArray(j[tmp])
									Array_push(j[tmp], k);
								else
									j[tmp] = k;

								// 將此屬性搬移、設定到 period_root 之 tree 中。
								delete 附加屬性[tmp];
							}

							if (tmp in 紀年名稱索引值) {
								library_namespace.debug(
								// 設定所有屬性值之 search index。
								'設定紀年[' + 紀年 + ']之次要搜尋用 index ['
								// 例如: 元太祖→大蒙古國太祖
								+ tmp + '] (level ' + i + ')。', 2);
								k.forEach(function(name) {
									if (name
									//
									&& !紀年.includes(name)) {
										add_to_era_by_key(name,
										// 對 i 不為 0–2 的情況，將 last_era_data 直接加進去。
										i >= 0 ? 紀年[i] : last_era_data);

										// TODO:
										// 對其他同性質的亦能加入此屬性。
										// 例如設定
										// "朝代=曹魏"
										// 則所有曹魏紀年皆能加入此屬性，
										// 如此則不須每個紀年皆個別設定。
										if (i === 0)
											紀年.push(name);
									}
								});
							}

						} else if (i === '月名' || i === MONTH_NAME_KEY) {
							if (j = parse_month_name(j,
									last_era_data[MONTH_NAME_KEY]))
								last_era_data[MONTH_NAME_KEY] = j;
						} else
							add_attribute(last_era_data, i, j);
					}

					// 處理 accuracy/準度/誤差/正確度。
					if (!last_era_data.準)
						for (i in 準確程度_ENUM)
							if (last_era_data[i]) {
								last_era_data.準 = i;
								break;
							}
					// check 準度。
					if (i = last_era_data.準) {
						if (!/^\d*[年月日]$/.test(i) && !(i in 準確程度_ENUM))
							library_namespace.warn('parse_era: 未支援紀年[' + 紀年
									+ ']所指定之準確度：[' + i + ']');
						if (!last_era_data.calendar && !last_era_data.精)
							last_era_data.精 = '年';
					}

					// 處理 precision/精度。
					i = last_era_data.精;
					if (i === '年') {
						if (!last_era_data.calendar)
							last_era_data.calendar
							// 自動指定個常用的曆法。
							= ':' + standard_time_parser;
						last_era_data.大月 = CE_MONTH_DAYS;

					} else {
						if (i && i !== '月' && i !== '日')
							library_namespace.warn('parse_era: 未支援紀年[' + 紀年
									+ ']所指定之精密度：[' + i + ']');

						if (('歲首' in last_era_data)
						//
						&& (i = last_era_data.歲首 | 0) !== START_MONTH
						//
						&& 0 < i && i <= MONTH_COUNT)
							last_era_data.歲首序 = i - START_MONTH;

						if (!(0 < (last_era_data.大月 |= 0))
								|| last_era_data.大月 === 大月)
							delete last_era_data.大月;
					}

					// 為使後來的能利用此新加入紀年，重新設定 era_search_pattern。
					if (last_era_data.參照用)
						era_search_pattern = null;

					if (options.extract_only)
						return;

					i = era_list.length;
					if (i === 0) {
						era_list.push(last_era_data);
						return;
					}

					var start = 起訖[0],
					//
					contemporary = last_era_data.contemporary;

					// 紀年E 插入演算：
					// 依紀年開始時間，以 binary search 找到插入點 index。
					i -= 4;
					// 因為輸入資料通常按照時間順序，
					// 因此可以先檢查最後幾筆資料，以加快速度。
					if (i < 9)
						i = 0;
					else if (start < era_list[i].start)
						i = era_list.search_sorted(last_era_data, {
							comparator : compare_start_date,
							found : true,
							start : 0
						});

					while (i < era_list.length && era_list[i].start <= start)
						// 預防本紀年實為開始時間最早者，
						// 因此在這邊才處理是否該插入在下一 index。

						// 因為 .search_sorted(, {found : true})
						// 會回傳 <= 的值，
						// 因此應插入在下一 index。

						// 這方法還會跳過相同時間的。
						i++;

					// 以 Array.prototype.splice(插入點 index, 0,
					// 紀年) 插入紀年E，
					// 使本紀年E 之 index 為 (插入點 index)。
					era_list.splice(i, 0, last_era_data);

					// 向後處理"共存紀年" list：
					// 依紀年開始時間，
					// 將所有紀年E 之後(其開始時間 >= 紀年E 開始時間)，
					// 所有開始時間在其結束時間前的紀年，
					// 插入紀年E 於"共存紀年" list。
					for (k = 起訖[1],
					// 從本紀年E 之下個紀年起。
					j = i + 1; j < era_list.length; j++)
						if ((tmp = era_list[j]).start < k) {
							(tmp = tmp.contemporary).push(last_era_data);
							if (tmp.length > 1)
								// 不能保證依照 紀年開始時間 時序，應該插入在最後。
								tmp.sort(compare_start_date);
						} else
							break;

					// 處理同時開始之"共存紀年" list：
					j = [];
					while (i > 0 && (tmp = era_list[--i]).start === start) {
						// 同時開始。
						j.unshift(tmp);
						tmp.contemporary.push(last_era_data);
					}

					// 向前處理"共存紀年" list：
					// 檢查前一紀年，
					// 與其"在本紀年開始時尚未結束的紀年 list"，
					// 找出所有(其結束時間 period_end > 紀年E 開始時間)之紀年，
					// 將之插入紀年E 之"共存紀年" list。
					tmp = era_list[i];
					tmp.contemporary.concat(tmp).forEach(function(era) {
						if (era.end > start)
							contemporary.push(era);
					});
					// 為了按照 紀年開始時間 順序排列。
					if (j.length > 0)
						Array_push(contemporary, j);
				});

				if (last_era_data) {
					if (options.extract_only) {
						last_era_data.initialize();
						return last_era_data;
					}
					// 當有新加入者時，原先的 pattern 已無法使用。
					era_search_pattern = null;
				}
			}

			// ---------------------------------------------------------------------//
			// 工具函數。

			/**
			 * 對於每個朝代，逐一執行 callback。
			 * 
			 * @param {Function}callback
			 *            callback(dynasty_name, dynasty);
			 * @param {String|RegExp}[filter]
			 *            TODO
			 */
			function for_dynasty(callback, filter) {
				for ( var nation_name in period_root.sub) {
					var nations = period_root.sub[nation_name].sub;
					for ( var dynasty_name in nations)
						callback(dynasty_name, nations[dynasty_name]);
				}
			}

			/**
			 * 對於每個君主，逐一執行 callback。
			 * 
			 * @param {Function}callback
			 *            callback(monarch_name, monarch);
			 * @param {String|RegExp}[filter]
			 *            TODO
			 */
			function for_monarch(callback, filter) {
				for ( var nation_name in period_root.sub) {
					var nations = period_root.sub[nation_name].sub;
					for ( var dynasty_name in nations) {
						var dynasty = nations[dynasty_name].sub;
						for ( var monarch_name in dynasty)
							callback(monarch_name, nations[monarch_name]);
					}
				}
			}

			/**
			 * 為 era Date 添加上共存紀年。
			 * 
			 * @param {Date}date
			 * @param {Era}[指定紀年]
			 *            主要紀年
			 * @param {Object}[options]
			 *            options
			 * 
			 * @returns {Array} 共存紀年
			 */
			function add_contemporary(date, 指定紀年, options) {
				var tmp, date_index,
				// 沒意外的話，共存紀年應該會照紀年初始時間排序。
				// 共存紀年.start <= date < 共存紀年.end
				共存紀年,
				// 某時間點（時刻）搜尋演算：
				era_index = (options && Array.isArray(options.list)
				// 查詢某時間點（時刻）存在的所有紀年與資訊：
				// 依紀年開始時間，以 binary search 找到插入點 index。
				? options.list : era_list).search_sorted({
					start : date
				}, {
					comparator : compare_start_date,
					found : true
				}),
				//
				紀年 = era_list[era_index];

				if ((紀年.精 || 紀年.準) && (tmp = options && options.尋精準)) {
					tmp = Math.max(era_index - Math.max(2, tmp | 0), 0);
					for (date_index = era_index; date_index > tmp
					// 使用這方法不能保證無漏失，應該使用 (紀年.contemporary)。
					&& (共存紀年 = era_list[--date_index]).end - date > 0;)
						if (!共存紀年.精 && !共存紀年.準
						// 盡可能向前找到精密暨準確的紀年。
						&& 共存紀年.Date_to_date_index(date)) {
							era_index = date_index;
							紀年 = 共存紀年;
							break;
						}
				}

				if (era_index === 0 && date < 紀年.start) {
					library_namespace.warn('add_contemporary: 日期 ['
							+ date.format(standard_time_format)
							+ '] 在所有已知紀年之前！');
					return;
				}

				// 至此 (era_list[era_index].start <= date)
				// 除非 date < era_list[0].start，那麼 (era_index===0)。

				共存紀年 = [];
				// 向前找。
				紀年.contemporary
				//
				.forEach(function(era) {
					// 檢查其"共存紀年" list，
					// 找出所有(所求時間 < 其結束時間 period_end)之紀年，即為所求紀年。
					if (date < era.end && (!era.參照用 || options.含參照用))
						共存紀年.push(era);
				});

				// 本紀年本身+向後找。
				// 為了待會取未交疊的相同國家紀年作為前後紀年，這邊不改變 era_index。
				for (date_index = era_index;
				//
				date_index < era_list.length; date_index++) {
					tmp = era_list[date_index];
					if (date < tmp.start)
						break;
					else if (date < tmp.end && (!tmp.參照用 || options.含參照用))
						共存紀年.push(tmp);
				}

				if (options.era_only)
					return 共存紀年;

				if (指定紀年) {
					var 指定紀年名 = 指定紀年.name;
					if (Array.isArray(指定紀年名))
						指定紀年名 = 指定紀年名[0] || 指定紀年名[2];
					tmp = 共存紀年;
					共存紀年 = [];
					tmp.forEach(function(era) {
						// 去除指定紀年本身。
						if (era === 指定紀年)
							tmp = null;
						// 避免循環參照。
						else if (era.year_start || era.參照紀年 !== 指定紀年名)
							共存紀年.push(era);
					});

					if (tmp)
						// 不包含指定紀年本身。
						指定紀年 = null;
					else
						// 包含指定紀年本身。
						紀年 = 指定紀年;
				}

				// 取未交疊的相同國家紀年作為前後紀年。
				tmp = era_index;
				while (0 < tmp--)
					if (era_list[tmp].end <= 紀年.start
					// 相同國家
					&& era_list[tmp].name[3] === 紀年.name[3]) {
						date.前紀年 = era_list[tmp].toString();
						break;
					}

				tmp = era_index;
				while (++tmp < era_list.length)
					if (紀年.end <= era_list[tmp].start
					// 相同國家
					&& era_list[tmp].name[3] === 紀年.name[3]) {
						date.後紀年 = era_list[tmp].toString();
						break;
					}

				// 作結尾檢測 (bounds check)。
				if (紀年.end <= date) {
					if (指定紀年) {
						library_namespace.warn(
						//
						'add_contemporary: 日期 ['
								+ date.format(standard_time_format)
								+ '] 在指定紀年 [' + 指定紀年 + '] 之後！');
						return;
					}
					if (共存紀年.length === 0) {
						library_namespace.warn('add_contemporary: 日期 ['
								+ date.format(standard_time_format)
								+ '] 在所有已知紀年之後！');
						return;
					}
					紀年 = 共存紀年[0];
				}

				// 至此已確定所使用紀年。
				共存紀年.紀年 = 紀年;

				if (共存紀年.length > 0) {
					tmp = [];
					共存紀年.forEach(function(era) {
						if (date_index = era.Date_to_date_index(date)) {
							// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
							date_index = era.日名(date_index[2], date_index[1],
									date_index[0]).reverse();
							if (options.numeral)
								date_index = numeralize_date_format(date_index,
										options.numeral);

							var name = era + date_index[0] + '年';
							if (era.精 !== '年') {
								name += date_index[1] + '月';
								if (era.精 !== '月')
									name += date_index[2]
											+ (options.numeral === 'Chinese'
											//
											? '' : '日');
							}
							tmp.push(name);
						}
					});
					if (tmp.length)
						date.共存紀年 = tmp;
				}

				return 共存紀年;
			}

			// e.g., UTC+8: -8 * 60 = -480
			var local_minute_offset = (new Date).getTimezoneOffset() || 0,
			//
			ONE_MINUTE_LENGTH_VALUE = new Date(0, 0, 1, 0, 1)
					- new Date(0, 0, 1, 0, 0);
			function adapt_minute_offset(minute_offset) {
				if (minute_offset === undefined)
					minute_offset = this[MINUTE_OFFSET_KEY];
				else if (minute_offset === '')
					minute_offset = -local_minute_offset;
				if (!isNaN(minute_offset)) {
					if (isNaN(this.original_value))
						this.original_value = this.getTime();
					this.setTime(this.original_value
							- (minute_offset + local_minute_offset)
							* ONE_MINUTE_LENGTH_VALUE);
				}
				return this;
			}

			function add_adapt_offset(date, 紀年) {
				if (MINUTE_OFFSET_KEY in 紀年) {
					date[MINUTE_OFFSET_KEY] = 紀年[MINUTE_OFFSET_KEY];
					// 注意:這邊不更改真正的 date value，使得所得出的值為「把本地當作紀元所使用的當地」所得出之值。
					// 例如求 "東漢明帝永平1年1月1日"，
					// 得到的是 date = "58/2/13 0:0 (UTC-5)"，
					// 實際上只是把本地（例如紐約）當作中國時，所得之時間。
					// 若須得到「紀元使用地真正之時間」（中國真正之時間） "58/2/13 0:0 (UTC+8)"，
					// 則得使用 date.adapt_offset()。
					// 再使用 date.adapt_offset('')，
					// 或 date.adapt_offset(-5*60)，
					// 或 date.adapt_offset(-(new Date).getTimezoneOffset())，
					// 可以還原 local 之時間。
					date.adapt_offset = adapt_minute_offset;
				}
			}

			// ---------------------------------------------------------------------//
			// 應用功能。

			/**
			 * 取得 year CE 當年，特定之月日之日期。
			 * 
			 * @example <code>

			CeL.era.Date_of_CE_year(1850, 1, 1, '中國');
			CeL.era.Date_of_CE_year(1850);

			 </code>
			 * 
			 * @param {Integer}year
			 *            CE year
			 * @param {Integer}[月]
			 *            month of era. default: START_MONTH = 1.
			 * @param {Integer}[日]
			 *            date of era. default: START_DATE = 1.
			 * @param {String}[era_key]
			 *            e.g., '中國'
			 * 
			 * @returns {Date}
			 * 
			 * @since 2014/12/15 20:32:43
			 * 
			 */
			function get_Date_of_key_by_CE(year, 月, 日, era_key) {
				var 日期,
				// 7: 年中， (1 + MONTH_COUNT >> 1)
				date = new Date((year < 0 ? year : '000' + year) + '/7/1'),
				//
				共存紀年 = add_contemporary(date, null, {
					era_only : true,
					尋精準 : true,
					list : !era_key
							|| !(era_key = get_Date_of_key_by_CE.default_key)
					//
					? era_list : get_era_Set_of_key(era_key).values()
				});

				共存紀年.forEach(function(紀年) {
					if (!日期) {
						// [ 歲序, 月序, 日序 | 0 ]
						var date_index = 紀年.Date_to_date_index(date);
						日期 = 紀年.date_name_to_Date(紀年.歲名(date_index[0]), 月, 日,
								true);
					}
				});

				return 日期;
			}

			get_Date_of_key_by_CE.default_key = '中國';

			// ---------------------------------------------------------------------//
			// 應用功能。

			/**
			 * 傳入完整紀年日期，將之轉成具有紀年附加屬性的 Date。
			 * 
			 * @param {String|Object|Array|Date}date
			 *            所欲解析之完整紀年日期。<br />
			 *            era string<br /> { 國家:'', 朝代:'', 君主:'', 紀年:'', 日期:'' ,
			 *            ... }<br />
			 *            duration: [start_date, end_date]
			 * @param {Object}[options]
			 *            此 options 可能會被變更!<br />
			 *            {String|Date}.base: base date<br />
			 *            {Boolean}.get_era: 僅回傳所解析出之紀年 {Object}。<br />
			 *            {Boolean}.get_era_list: 僅回傳所解析出之紀年 list: []。<br />
			 *            {Boolean}.get_range: 僅回傳所解析出之期間: [ "前", "後" ]。<br />
			 *            {Boolean}.get_range_String: 僅回傳所解析出之期間: "前–後"。<br />
			 *            {Boolean}.parse_only: 僅回傳所解析出之紀年資訊: [ 紀年_list, 紀年, 年,
			 *            月, 日 ]<br />
			 *            {Boolean}.is_era: 找不到可用之紀年時，直接 about 跳出，回傳 undefined。<br />
			 * 
			 * @returns {Date} 解析出之日期
			 */
			function to_era_Date(date, options) {
				library_namespace.debug('parse (' + typeof date + ') [' + date
						+ ']', 3, 'to_era_Date');

				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

				if (!date)
					date = new Date();

				var 紀年_list, 紀年, origin = true, 指定紀年, tmp, tmp2;
				// 欲改變 紀年_list。
				function check_to_modify() {
					if (origin) {
						// 防止改變原先的 data。
						(紀年_list =
						//
						library_namespace.Set_from_Array(紀年_list)).名 = origin;
						origin = false;
					}
				}

				// 取 key 與 (紀年_list) 之交集。
				function get_intersection(key) {
					if (key.start && key.end) {
						origin = false;
						(紀年_list = library_namespace.Set_from_Array(
						// or use: (紀年_list = new Set).add(key);
						// 紀年_list.名 = key.name;
						[ key ])).名 = key.name;
						return 紀年_list;
					}

					library_namespace.debug('Get 紀年 list of [' + key + ']', 2,
							'to_era_Date');
					var list = get_era_Set_of_key(key);
					if (!list ||
					// assert: (Set)list
					list.size === 0)
						return;
					// 初次設定。
					if (!紀年_list) {
						if (key)
							origin = key;
						return 紀年_list = list;
					}

					library_namespace.debug('取交集 of [' + key + ']', 2,
							'to_era_Date');
					紀年_list.forEach(function(era) {
						if (!list.has(era))
							check_to_modify(), 紀年_list['delete'](era);
					});

					if (Array.isArray(list = 紀年_list.values()))
						library_namespace.debug(
						//
						'取交集 [' + key + '] 得到 [' + list.join() + ']', 2,
								'to_era_Date');
					return 紀年_list;
				}

				// 取得任何一個紀年作為主紀年。
				function get_next_era() {
					if (!紀年_list || 紀年_list.size === 0)
						return 紀年 = null;

					var key = 紀年_list.名 || origin || false;
					if (typeof key === 'string') {
						try {
							紀年_list.forEach(function(era) {
								if (era.name[0] === key) {
									library_namespace.debug('採用同名紀年 [' + era
											+ ']', 2, 'to_era_Date');
									紀年 = era;
									// TODO: 以更好的方法處理，不用 throw。
									throw 0;
								}
							});
						} catch (e) {
							return 紀年;
						}
					}

					try {
						紀年_list.forEach(function(era) {
							library_namespace.debug('採用紀年 [' + era + ']', 2,
									'to_era_Date');
							紀年 = era;
							// TODO: 以更好的方法處理，不用 throw。
							throw 0;
						});
					} catch (e) {
					}

					return 紀年;
				}

				if (typeof date === 'number')
					date = Math.abs(date) < 4000
					// 當作年分。
					? new Date(date, 0, 1)
					// 當作 date value。
					: new Date(date);

				else if (library_namespace.is_Object(date)) {
					library_namespace.debug('era information Object → Date', 3,
							'to_era_Date');

					// 從範圍小的開始搜尋。
					// TODO: 搜尋日期?
					for ( var i in 紀年名稱索引值)
						if (i = date[i])
							get_intersection(i);

					date = date.日期 || date.date;
				}

				if (typeof date === 'string') {
					library_namespace.debug('parse 紀年日期 string [' + date + ']',
							3, 'to_era_Date');

					// era information String
					// → era information Object
					var matched, 年, 月, 日, 偵測集 = [],
					// 正規化數字。
					numeralized = normalize_number(date = date.trim()),
					//
					search_era = function search_era() {
						// 通常後方的條件會比較精細。
						while (偵測集.length > 0) {
							var slice = 偵測集.pop();
							while (slice) {
								if (matched = slice.match(era_search_pattern)) {
									if (0 < matched.index)
										偵測集.push(
										// 放回尚未處理的部分。
										slice.slice(0, matched.index));
									if (slice = slice.slice(
									//
									matched.index + matched[0].length))
										偵測集.push(slice);
									return matched;
								}
								slice = slice.slice(0, -1);
							}
						}
					};

					// 前置, 後置 改成 Array (紀年指示詞偵測集)，統一處理。
					if (tmp = numeralized.match(ERA_DATE_PATTERN)
							|| (tmp2 = numeralized
									.match(ERA_DATE_PATTERN_NO_DATE))
							|| (matched = numeralized
									.match(ERA_DATE_PATTERN_YEAR))) {
						library_namespace.debug('辨識出紀年+日期之樣式 [' + tmp + ']', 2,
								'to_era_Date');

						// 中間多為日期，前後為紀年。
						年 = tmp[2];
						月 = tmp[3];
						日 = tmp[4];

						if (tmp2)
							if (日 && !月
									&& (matched = tmp[5].match(/^\s*([朔晦望])/)))
								// 處理月相
								// e.g.,
								// '寶應二年三月晦日'
								月 = 日, 日 = matched[1];
							else {
								if (!月)
									月 = 日;
								日 = '';
							}
						else if (matched) {
							if (matched = tmp[5].match(/^月(?:([^日]{1,3})日?)?/))
								// e.g., '三月一日'
								月 = 年, 年 = null, 日 = matched[1];
							// e.g., '一日'
							else if (tmp[5].charAt(0) === '日'
									// 僅輸入單一干支，當作日干支而非年干支。
									// e.g.,
									// ('丁亥朔', {base : '寶應二年春正月'})
									|| options.base
									&& 年.length === 2
									&& !isNaN(library_namespace
											.stem_branch_index(年)))
								日 = 年, 年 = null;
							else if (!月 && !日
							//
							&& (tmp[1] || tmp[5])
							//
							&& 單數字_PATTERN.test(年))
								// e.g., 百濟多婁王, 四条天皇天福, 四条天皇文暦, 後一条天皇長元.
								// 但須考量 "元至正十七"
								年 = '';
							// 不用 numeralized，預防有些紀年名稱包含可數字化資料。
							偵測集.push(date, null);
						}

						// 依照習慣，前置多為(通常應為)紀年。
						tmp2 = tmp[1].replace(to_era_Date.ignore_pattern, '');
						if (tmp2 = 時刻_to_hour(tmp2))
							偵測集.push(tmp2);
						// 依照習慣，後置多為(通常應為)時間。
						tmp2 = tmp[5].replace(to_era_Date.ignore_pattern, '');
						if (tmp2 = 時刻_to_hour(tmp2))
							偵測集.push(tmp2);

					} else {
						tmp2 = date.trim();
						if (options.base
								&& (tmp = tmp2.match(/([朔晦])日?/)
										|| tmp2.match(/^(望)日?$/)))
							日 = tmp[1];
						if (tmp = tmp2.replace(to_era_Date.ignore_pattern, ''))
							偵測集.push(tmp);
						library_namespace.debug('無法辨識出 [' + date + '] 之紀年樣式'
								+ (tmp ? '，直接當紀年名稱處理' : '') + '。', 2,
								'to_era_Date');
					}

					// 首先確定紀年。
					if (偵測集.length > 0) {
						// tmp2 自此當作時間偵測集。
						tmp2 = 偵測集.slice();

						if (!era_search_pattern)
							// 初始化 search pattern。
							create_era_search_pattern();

						do {
							// reset 紀年_list.
							紀年_list = undefined;
							if (search_era()
									&& (tmp = get_intersection(matched[0]))
									&& tmp.size > 1) {
								// 進一步篩選，緊縮符合範圍。
								while (紀年_list.size > 1 && search_era())
									get_intersection(matched[0]);
								if (tmp2[1] === null && 偵測集[1] !== null)
									年 = '';
							}
							// "後一条天皇長元" 需要檢測到 (while ..) 這一項。
						} while ((!紀年_list || 紀年_list.size === 0)
								&& 偵測集.length > 0);
					} else
						tmp2 = null;

					if (date = options.base) {
						if (!Array.isArray(date)
						//
						&& !is_Date(date)) {
							tmp = to_era_Date(date, {
								parse_only : true
							});
							date = tmp[1] && tmp[0] && tmp[0].size > 0 ? tmp
									: numeralize_date_name(date).to_Date(
											standard_time_parser);
						}

						// assert: date(=options.base) 為 Date
						// 或 [ {Set}紀年_list, {Era}紀年, 年, 月, 日 ]。

						if (Array.isArray(date)) {
							// e.g.,
							// options.base 之後，第一個符合 argument(date) 的日期。
							// ('二年春正月丁亥朔', {base : '寶應元年'})
							// ('丁亥朔', {base : '寶應元年二年春正月'})

							tmp = [ 年, 月, 日 ];
							for (matched = 0; matched < tmp.length; matched++)
								if (tmp[matched])
									break;
							switch (matched) {
							// 此處需要與 options.parse_only 之 return 一致。
							case 3:
								日 = date[4];
							case 2:
								月 = date[3];
							case 1:
								年 = date[2];
							case 0:
								origin = true;
								紀年_list = date[0];
							}

						} else if (date && !isNaN(date.getTime())) {
							// e.g.,
							// ('庚辰年庚辰月庚辰日庚辰時', {base : '1850年'})

							// 針對歲次特別做修正。
							// 注意:非泛用方法。
							if (紀年 = library_namespace.stem_branch_index(年)) {
								tmp
								//
								= library_namespace.SEXAGENARY_CYCLE_LENGTH;
								// 計算差距年數。
								if (紀年 = (紀年 - (date.getFullYear()
								//
								- library_namespace.YEAR_STEM_BRANCH_OFFSET))
										% tmp) {
									if (紀年 < 0)
										紀年 += tmp;
									if (紀年 > tmp >> 1)
										紀年 -= tmp;
									// 重設年分。
									date.setFullYear(年 = date.getFullYear()
											+ 紀年);
								}
							}

							// 注意:這邊採用的方法並不完備。
							紀年 = era_list.search_sorted({
								start : date
							}, {
								comparator : compare_start_date,
								found : era_list
							});
							if (紀年)
								紀年_list = library_namespace
										.Set_from_Array(紀年.contemporary
												.concat(紀年));
						}
					}

					// TODO: 篩選*所有*可用之紀年。
					if (!('strict' in options)
					//
					&& 紀年_list && 紀年_list.size > 1)
						// 有多個選擇，因此嚐試嚴格篩選。
						options.strict = true;
					if (tmp = options.period_end) {
						// 取得結束時間。else: 取得開始時間。
						tmp = 日 ? 1 : 月 ? 2 : 年 ? 3 : 4;
					}
					// 從紀年、日期篩選可用之紀年，取得 Date。
					date = null;
					while (get_next_era()
							&& (!(date = 紀年.date_name_to_Date(年, 月, 日,
									options.strict, tmp))
							//
							|| isNaN(date.getTime()))) {
						check_to_modify();
						// 刪掉不合適的紀年。
						紀年_list['delete'](紀年);
						date = 紀年 = null;
					}

					if (紀年) {
						指定紀年 = 紀年;
						if (紀年_list.size > 1) {
							// 可能是相同紀年之延續。現有元文宗天曆、太平天囯具此情況。
							tmp = [];
							紀年_list.forEach(function(era) {
								if (!tmp.includes(
								// 謹記祿未重複的紀年，忽略重複的紀年名稱。
								era = era.toString()))
									tmp.push(era);
							});
							if (tmp.length > 1)
								// 有超過1個紀年。
								if (options.pick)
									tmp = options.pick(tmp) || tmp;
								else
									library_namespace.warn('to_era_Date: 共取得 '
											+ tmp.length + ' 個可能的紀年名稱！ ['
											+ tmp.join(', ') + ']');
						}

					} else if (tmp = numeralized.match(
					// assert: !紀年_list || 紀年_list.size === 0 未特定紀年。
					/^JDN?\s*(\d+(?:.\d*)?)$/i)) {
						date = library_namespace.JD_to_Date(tmp[1]);
						// 此時不該當作符合了。

					} else if (library_namespace.is_debug()
					//
					&& arguments[0])
						library_namespace.info([ 'to_era_Date: 無法自 [', {
							b : arguments[0],
							S : 'color:#e92;'
						}, '] 辨識出特殊地域之紀年名稱。（時間不在所求紀年範圍內？）',
								'將視為標準時間（如公元紀年），嘗試以日期解析器 [',
								standard_time_parser, '] 解析。' ]);

					// 警告:請勿隨意更改這些回傳值，因為他們也為 module 內部其他功能所用!
					if (options.get_era)
						return 紀年;
					if (options.get_era_list)
						return 紀年_list;
					if (options.parse_only)
						return [ 紀年_list, 紀年, 年, 月, 日 ];

					if (date) {
						if (options.get_range_String
						//
						&& !options.get_range)
							options.get_range = -1;
						if (options.get_range) {
							// shift microseconds
							tmp2 = typeof options.get_range === 'boolean' ? 0
									: options.get_range | 0;
							if (!年 || isNaN(年 = numeralize_date_name(年)))
								tmp = new Date(紀年.end.getTime() + tmp2);
							else {
								// [ 歲序, 月序, 日序 | 0 ]
								tmp = 紀年.Date_to_date_index(date);
								if (!月)
									tmp = new Date(紀年.year_start[tmp[0] + 1]
											+ tmp2);
								else if (!日)
									tmp = new Date(date.getTime() + tmp2
									//
									+ (紀年.calendar[tmp[0]][tmp[1]] - tmp[2])
											* ONE_DAY_LENGTH_VALUE);
								else
									tmp = new Date(date.getTime() + tmp2
											+ ONE_DAY_LENGTH_VALUE);
							}
							// 警告:未處理 options.minute_offset。
							// 警告:跨統治者的紀年，或紀年末的情況可能會出錯。

							tmp2 = options.get_range_String;
							if (!tmp2)
								return [ date, tmp ];

							// options.get_range_String as format
							date = date.format(tmp2);
							tmp = tmp.format(tmp2);
							if (date !== tmp) {
								// 起始、結束於不同一天。
								紀年 = /^([^年]+)年/;
								年 = date.match(紀年);
								if (年
								//
								&& (tmp2 = tmp.match(紀年))
								// 去除同一年。
								&& 年[1] === tmp2[1])
									tmp = tmp.replace(紀年, '');
								date += '–' + tmp;
							}
							// for 公元前。
							return date.replace(/-(\d+年)/g, '前$1');
						}

					} else if (options.is_era) {
						// 找不到可用之紀年，卻 must era；直接 about。
						return;

					} else if (年 && !isNaN(年 = numeralize_date_name(年))) {
						date = ((年 < 0 ? 年 : 年.pad(4)) + '年'
						//
						+ (月 ? (numeralize_date_name(月) || START_MONTH)
								+ '月'
								//
								+ (日 ? (numeralize_date_name(日) || START_DATE)
										+ '日' : '')
						//
						: '')).to_Date({
							parser : standard_time_parser,
							period_end : options.period_end
						});

						if (!date || isNaN(date.getTime())) {
							// 可能到這邊的:如 '1880年庚辰月庚辰日庚辰時'。
							// 從 era_list.search_sorted() 擇出所有可能候選。
							var 候選,
							//
							紀年起序 = era_list.search_sorted({
								// 年初
								start : new Date(年, 0, 1)
							}, {
								comparator : compare_start_date,
								found : true
							}), 紀年迄序 = era_list.search_sorted({
								// 年尾
								start : new Date(年 + 1, 0, 1)
							}, {
								comparator : compare_start_date,
								found : true
							});
							紀年_list = era_list[紀年起序].contemporary
									.concat(era_list.slice(紀年起序, 紀年迄序 + 1));

							for (date = new Date(年, 6, 1), 紀年起序 = 0;
							//
							紀年起序 < 紀年_list.length; 紀年起序++) {
								紀年 = 紀年_list[紀年起序];
								if ((候選 = 紀年.Date_to_date_index(date))
										//
										&& (候選 = 紀年.date_name_to_Date(紀年
												.歲名(候選[0]), 月, 日)))
									break;
							}
							date = 候選;
						}
					}

					if (!date)
						// 死馬當活馬醫。
						// 不可用 DEFAULT_DATE_PARSER，恐造成循環參照。
						date = library_namespace.from_Chinese_numeral(
								numeralized).to_Date(standard_time_parser);

					if (date && tmp2)
						while (0 < tmp2.length)
							if ((tmp = tmp2.pop())
									&& (tmp = library_namespace
											.from_Chinese_numeral(tmp).replace(
													/^\D+/, '').replace(
													/[^\d時分秒]+$/, ''))
									&& (tmp = String_to_Date(tmp))
									&& (tmp -= new Date(tmp.getTime())
											.setHours(0, 0, 0, 0))) {
								library_namespace.debug('處理時間。 [' + tmp + ']',
										3, 'to_era_Date');
								date.setTime(date.getTime() + tmp);
								break;
							}

					// 處理完 {String}Date。
					// -----------------------------
				} else if (get_next_era()) {
					指定紀年 = 紀年;
				}

				if (options.get_era || options.get_era_list
						|| options.parse_only || options.get_range
						|| options.get_range_String)
					return;

				if (!date && (指定紀年 || (指定紀年 = get_next_era())))
					date = new Date(指定紀年.start.getTime());

				if (!is_Date(date) || isNaN(date.getTime())) {
					library_namespace.err('to_era_Date: 無法判別紀年 ['
							+ arguments[0] + '] 之時間或名稱資訊！');
					return;
				}

				// 到這裡，date 最起碼是紀年初始時間。

				if (!isNaN(tmp = options.minute_offset))
					set_minute_offset(date, tmp);

				if (options.date_only) {
					if (指定紀年)
						add_adapt_offset(date, 指定紀年);
					return date;
				}

				// 至此 date 應為 Date，並已篩出可能的主要紀年。
				// Date → era information Date (Date += era information)

				tmp = add_contemporary(date, 指定紀年, options);
				if (!tmp)
					return options.era_only ? [] : date;

				// 取得真正使用之紀年。
				紀年 = tmp.紀年;
				delete tmp.紀年;

				if (options.era_only)
					// 此時未設定 (date.共存紀年)
					return tmp;

				紀年.add_comment(date, options);

				return date;
			}

			// TODO: CE, BCE
			to_era_Date.ignore_pattern = /(?:^|\s)[公西][元曆暦](?:$|\s)/;

			// ---------------------------------------------------------------------//
			// 應用功能。

			/**
			 * 取得指定關鍵字之候選列表。
			 * 
			 * @param {String}key
			 *            指定關鍵字。
			 * 
			 * @returns {Array}指定關鍵字之候選列表。
			 */
			function get_candidate(key) {
				var list;
				if (!key) {
					// 取得所有年代之列表。
					if (!get_candidate.all_list) {
						list = library_namespace.null_Object();
						era_list.forEach(function(era) {
							list[era] = era.toString(SEARCH_STRING);
						});
						get_candidate.all_list = list;
					}
					return get_candidate.all_list;
				}

				if (key in search_index) {
					list = library_namespace.null_Object();
					for_each_era_of_key(key, function(era) {
						list[era] = era.toString(SEARCH_STRING);
					});
				}

				else if (key = to_era_Date(key, {
					era_only : true
				})) {
					list = library_namespace.null_Object();
					key.forEach(function name(era) {
						list[era] = era.toString(SEARCH_STRING);
					});
				}

				return list;
			}

			// 將 era object 增加到 list 結構中。
			function add_period(object, list, options) {
				var has_period;
				function add_object(o) {
					list.push(o);
					// 掃描有無時期設定。
					// era 無 .attributes
					if (o.attributes && o.attributes[PERIOD_KEY])
						// assert: Array.isArray(o.attributes.時期);
						// assert: o.level === 2
						// === 主要索引名稱.length - 紀年名稱索引值.時期
						o.attributes[PERIOD_KEY].forEach(function(p) {
							if (!list[PERIOD_KEY][p]) {
								has_period = true;
								(list[PERIOD_KEY][p] = new Period).name
								//
								= PERIOD_PREFIX + p;
							}
							list[PERIOD_KEY][p].add_sub(o);
						});
					else
						list[PERIOD_KEY][''].push(o);
				}

				var is_created = !list[PERIOD_KEY];
				if (is_created)
					list[PERIOD_KEY] = {
						'' : []
					};

				for ( var name in object) {
					if (!Array.isArray(name = object[name]))
						name = [ name ];

					name.forEach(function(o) {
						// 去除循環相依。
						if (o === object)
							return;

						if (!options.含參照用 && Period.is_Period(o)) {
							var i;
							// 只要 .sub, .era
							// 有任一個不是"參照用"，那就顯示出來。
							for (i in o.sub) {
								if (!o.sub[i].參照用) {
									add_object(o);
									return;
								}
							}
							for (i in o.era) {
								if (!o.era[i].參照用) {
									add_object(o);
									return;
								}
							}

						} else if (options.含參照用 || !o.參照用) {
							add_object(o);
							return;
						}

						if (library_namespace.is_debug())
							library_namespace.info([ 'add_period: ', {
								T : [ '跳過 [%1]：本[%2]僅供參照用。', o, 'period' ]
							} ]);
					});
				}

				if (has_period) {
					for ( var p in list[PERIOD_KEY])
						if (p !== '')
							list[PERIOD_KEY][''].push(list[PERIOD_KEY][p]);
				} else if (is_created)
					// 無時期之標注。
					delete list[PERIOD_KEY];

				// return list;
			}

			// get_periods('中國/p:魏晉南北朝'.split('/'))
			// get_periods('中國/p:魏晉南北朝/成漢'.split('/'))
			// get_periods('中國/成漢'.split('/'))
			/**
			 * 取得指定層次/關鍵字之紀年列表。<br />
			 * 
			 * 回傳之列表，會以<b>是否可放在同一時間軸線圖中</b>作為分隔。<br />
			 * e.g.,<code>
			 [
				 [
				 	[ 紀年(1年-2年), 紀年(3年-4年) ]
				 ],
				 [
					 [ 紀年(5年-6年), 紀年(7年-8年) ],
					 [ 紀年(6年-7年), 紀年(8年-9年) ]
				 ]
			 ]
			 * </code>
			 * 
			 * @param {Array|String}hierarchy
			 *            指定層次/關鍵字。
			 * 
			 * @returns {Array}紀年列表。<br /> [ 同階層紀年列表 ]
			 */
			function get_periods(hierarchy, options) {
				var period_now = period_root;

				if (hierarchy)
					if (!Array.isArray(hierarchy))
						if (Period.is_Period(hierarchy))
							period_now = hierarchy.sub, hierarchy = null;
						else
							hierarchy = [ hierarchy ];

				// 將 period_now 推到指定層次。
				if (hierarchy && hierarchy.length)
					hierarchy.forEach(function(name) {
						// skip 時期/分類/分區.
						if (!period_now)
							return;
						var matched = name.match(PERIOD_PATTERN);
						period_now =
						//
						matched && period_now[PERIOD_KEY][matched = matched[1]]
						//
						? period_now[PERIOD_KEY][matched]
						//
						: period_now.sub[name];
					});

				if (!period_now) {
					library_namespace.warn('get_periods: 無法取得指定之紀年層次 ['
							+ hierarchy + ']！');
					return;
				}

				if (!period_now.bar) {
					// 前置處理。
					if (!library_namespace.is_Object(options))
						options = library_namespace.null_Object();

					var list = [];
					add_period(period_now.sub, list, options);
					add_period(period_now.era, list, options);
					// 作 cache。
					period_now.bar = order_bar(list.sort(compare_start_date));

					get_periods.copy_attributes.forEach(function(key) {
						if (period_now.attributes[key])
							period_now.bar[key] = period_now.attributes[key];
					}, this);

					// 處理歷史時期的 bar。
					if (list = list[PERIOD_KEY]) {
						period_now.bar[PERIOD_KEY] = library_namespace
								.null_Object();
						period_now[PERIOD_KEY] = library_namespace
								.null_Object();
						for ( var period_name in list) {
							var period_list = list[period_name];
							if (Array.isArray(period_list))
								period_list = order_bar(period_list
										.sort(compare_start_date));
							else {
								// assert: period_name && period_name !== ''
								// assert: Period.is_Period(list[period_name])
								var period_data
								//
								= period_now[PERIOD_KEY][period_name]
								//
								= period_list;
								period_list = [];
								for ( var _p in period_data.sub)
									period_list.push(period_data.sub[_p]);
								period_list = order_bar(period_list
										.sort(compare_start_date));
								period_data.bar = period_list;
							}

							(period_now.bar[PERIOD_KEY][period_name]
							//
							= period_list)
							//
							.name = PERIOD_PREFIX + period_name;
						}
					}
				}

				return options && options.merge_periods
						&& period_now.bar[PERIOD_KEY]
				//
				? period_now.bar[PERIOD_KEY][''] : period_now.bar;
			}

			// 預設會 copy 的 period 屬性。
			// 生卒年月日 Date of Birth and Death, lifetime.
			get_periods.copy_attributes = '生,卒'.split(',');

			// 文字式曆譜:年曆,朔閏表,曆日譜。
			// 會更改 options!
			function get_dates(era, options) {
				if (!era)
					return;

				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();

				var date_list = [], era_list,
				// date: 月曆/日曆，非年曆。
				date = options.月 || options.日,
				//
				add_date = options.date_only ? function(date_time, era) {
					date_list.push(date = new Date(date_time));
					add_adapt_offset(date, era);
				} : function(date_time, era) {
					date_list.push(date = new Date(date_time));
					add_contemporary(date, era, options);
					era.add_comment(date, options);
				};

				if (typeof era === 'string') {
					// 去掉不需要的空白。
					era = era.replace(/\s+([年月日])/g, '$1')
					//
					.replace(/([年月日])\s+/g, '$1');
					if (era_list = normalize_number(era).match(
					//
					/\d年(.{1,3}月)?/))
						options.月 = 1, options.日 = era_list[1] && 1;

					if (date = date || options.月 || options.日)
						options.get_era = true;
					else
						options.get_era_list = true;
					era_list = to_era_Date(era, options);

				} else
					era_list = era;

				if (!era_list || !date && era_list.size === 0) {
					library_namespace.info([ 'get_dates: ', {
						T : [ '無年號或帝王紀年名稱作 [%1]！', era ]
					} ]);
					return;
				}

				if (era_list.精 === '年' || era_list.精 === '月') {
					// 精密度不足。
					if (era_list.精 === '年')
						delete options.月;
					delete options.日;
					delete options.get_era;
					options.get_era_list = true;
					era_list = to_era_Date(era, options);
					date = null;
				}

				if (date) {
					delete options.get_era;
					// [ 歲序, 月序, 日序 | 0 ];
					date_list.selected = era_list
							.Date_to_date_index(to_era_Date(era, options));
					era = era_list;
					if (!era.year_start)
						era.initialize();
				}

				if (options.月 && !options.日) {
					// 月曆。
					var year_index = date_list.selected[0],
					//
					j, calendar = era.calendar,
					//
					start_time, year_left = options.year_limit | 0;

					if (year_left < 1)
						year_left = get_dates.DEFAULT_YEARS;

					if (0 < year_index)
						date_list.previous = era.toString()
								+ era.歲名(year_index < year_left ? 0
										: year_index - year_left) + '年';

					for (year_left = Math.min(year_left, calendar.length
							- year_index); 0 < year_left--; year_index++) {
						start_time = era.year_start[year_index];
						for (j = 0; j < calendar[year_index].length
								&& start_time < era.end;
						//
						start_time += ONE_DAY_LENGTH_VALUE
								* calendar[year_index][j++])
							add_date(start_time, era);
					}

					date_list.type = 1;
					if (year_index < calendar.length)
						date_list.next = era.toString() + era.歲名(year_index)
								+ '年';
					return date_list;
				}

				if (date) {
					// 日曆。
					date = date_list.selected;
					var i = 0, start_time = 0,
					//
					this_year_data = era.calendar[date[0]];

					for (; i < date[1]; i++)
						// days of month
						start_time += this_year_data[i];
					start_time = era.year_start[date[0]] + ONE_DAY_LENGTH_VALUE
							* start_time;
					this_year_data = start_time + this_year_data[i]
							* ONE_DAY_LENGTH_VALUE;
					if (this_year_data > era.end)
						this_year_data = era.end;
					for (; start_time < this_year_data;
					//
					start_time += ONE_DAY_LENGTH_VALUE)
						add_date(start_time, era);

					date_list.type = 2;
					date = date_list.selected;
					// .日名(日序, 月序, 歲序) = [ 日名, 月名, 歲名 ]
					if (i = era.日名(0, date[1] - 1, date[0]))
						date_list.previous = era.toString() + i[2] + '年' + i[1]
								+ '月';
					if (start_time < era.end
							&& (i = era.日名(0, date[1] + 1, date[0])))
						date_list.next = era.toString() + i[2] + '年' + i[1]
								+ '月';
					return date_list;
				}

				// 年曆。

				era_list.forEach(function(era) {
					if (era.參照用 && !options.含參照用) {
						library_namespace.info([ 'get_dates: ', {
							T : [ '跳過 [%1]：本[%2]僅供參照用。', era, '紀年' ]
						} ]);
						return;
					}

					if (!era.year_start)
						era.initialize();

					var year_start = era.year_start,
					//
					i = 0, l = year_start.length - 1;

					if (l > get_dates.ERA_YEAR_LIMIT)
						library_namespace.warn('get_dates: 跳過 [' + era
								+ ']：跨度過長，共有 ' + l + '個年分！');
					else
						for (; i < l; i++) {
							if (true || date_list.length < get_dates.LIMIT)
								add_date(year_start[i], era);
							else {
								library_namespace
										.warn('get_dates: 輸出年段紀錄過長，已超過輸出總筆數限制 '
												+ get_dates.LIMIT + ' 筆！');
								break;
							}
						}
				});

				return date_list;
			}

			// 輸出總筆數限制。
			// get_dates.LIMIT = Infinity;
			// 跳過跨度過長之紀年。
			get_dates.ERA_YEAR_LIMIT = 150;
			// 預設月曆之年數。
			get_dates.DEFAULT_YEARS = 10;

			// ---------------------------------------------------------------------//

			// 警告:此函數會更改原輸入之 date_value!
			function Date_to_era_String(date_value, format, locale, options) {
				// 前置處理。
				if (!library_namespace.is_Object(options))
					options = library_namespace.null_Object();
				var config = this || options, 紀年名,
				// 指定紀年。
				紀年 = config.era_object;
				if (!紀年) {
					// 在有綁定時，不考慮 options.era。
					if (紀年名 = config.era)
						if ((紀年 = get_era_Set_of_key(紀年名))
						//
						&& 0 < (紀年 = 紀年.values()).length) {
							if (紀年.length !== 1)
								// assert: 有超過1個紀年。
								library_namespace
										.warn('Date_to_era_String: 共取得 '
												+ 紀年.length + ' 個可能的紀年 [' + 紀年名
												+ ']！');
							紀年 = 紀年[0];
						} else
							紀年 = to_era_Date(紀年名, {
								get_era : true
							});

					if (!紀年) {
						library_namespace
								.warn('Date_to_era_String: 無法取得指定之紀年 [' + 紀年名
										+ ']！');
						return;
					}

					// 紀年之 cache。
					if (this)
						this.era_object = 紀年;
				}

				// 前置處理。
				if (!date_value)
					date_value = new Date;
				if (!('numeral' in options) && ('numeral' in config))
					options.numeral = config.numeral;

				// 警告:此函數會更改原輸入之 date_value!

				紀年.add_comment(date_value, options);

				return strftime(date_value,
				//
				format || config.format,
				//
				locale || config.locale, options);
			}

			(function() {
				var era_name, era_data,
				// 為各特殊曆法特設。
				// 今天是農曆 <code>(new Date).format('Chinese')</code>
				era_to_export = {
					Chinese : {
						era : '中曆',
						format : '%歲次年%月月%日'
					}
				};

				Date_to_String_parser.era = Date_to_era_String;

				for (era_name in era_to_export) {
					Date_to_String_parser[era_name] = Date_to_era_String.bind(
					//
					era_data = era_to_export[era_name]);
					if (!era_data.numeral)
						era_data.numeral = era_name;
					if (!era_data.locale)
						era_data.locale = library_namespace.gettext
								.to_standard(era_name);
				}
			})();

			// ---------------------------------------------------------------------//
			// 網頁應用功能。

			/**
			 * 計算已具紀年標記之指定 node 之紀年值。
			 * 
			 * @param {ELEMENT_NODE}node
			 *            具紀年標記之指定 node。
			 * @param {Boolean}[era_only]
			 *            是否僅回傳 era String。
			 * 
			 * @returns [range] || {String}date
			 */
			function caculate_node_era(node, return_type) {
				var era, date, tmp = library_namespace.DOM_data(node, 'era');
				if (!tmp)
					// no era data.
					return;

				era = library_namespace.DOM_data(node, 'era_parsed');
				if (!era) {
					// 解析 era。
					era = tmp.replace(
					// /~/:如英語字典之省略符號
					/~/, library_namespace.set_text(node));

					// 干支_PATTERN: 預防"丁未"被 parse 成丁朝之類的意外。
					date = !干支_PATTERN.test(era) && to_era_Date(era, {
						parse_only : true
					});

					// date: [ {Set}紀年_list, {Era}紀年, 年, 月, 日 ]
					if (!date || !date[1]) {
						date = null;
						// 自身不完整。溯前尋找 base。
						tmp = node;
						while (tmp = tmp.previousSibling)
							// 向前取第一個可以找出日期的。
							if (date = caculate_node_era(tmp, 'String'))
								break;
						if (!date)
							return;

						date = to_era_Date(era, {
							parse_only : true,
							base : date
						});
						if (!date[1])
							return;
					}

					// assert: date: [ {Set}紀年_list, {Era}紀年, 年, 月, 日 ]

					tmp = date.shift();
					if (tmp && tmp.size > 1)
						library_namespace.warn(
						//
						'caculate_node_era: 共取得 ' + tmp.size + ' 個可能的紀年名稱！');
					else
						tmp = null;

					if (Array.isArray(era = date.shift().name))
						// 當有多個可能的紀年名稱時，僅取紀年名，保留最大可能性。
						era = tmp ? era[0]
						//					
						: era.slice(0, 2).reverse().join('');

					if (tmp = date.shift()) {
						era += tmp + '年';
						if (tmp = date.shift()) {
							era += tmp + '月';
							if (tmp = date.shift())
								era += tmp + '日';
						}
					}

					// assert: {String}era

					// cache.
					library_namespace.DOM_data(node, 'era_parsed', era);
				}

				if (return_type === 'String')
					return era;

				node = to_era_Date(era);
				if (return_type === 'Date')
					return node;
				date = node.format(caculate_node_era.era_format);

				tmp = to_era_Date(era, {
					get_range_String : caculate_node_era.format
				});
				if (tmp.includes('–'))
					date += '起';

				tmp = [ era, date, tmp ];
				if (node.共存紀年) {
					date = '<br />☼ ';
					tmp.push('<hr />' + library_namespace.gettext('共存紀年') + '：'
							+ date + node.共存紀年.join(date));
				}

				return tmp;
			}

			// 紀年名
			caculate_node_era.era_format = {
				parser : standard_time_parser,
				format : '%紀年名%年年%月月%日日(%日干支)',
				locale : 'cmn-Hant-TW'
			};
			// range
			caculate_node_era.format = {
				parser : standard_time_parser,
				format : '公元%Y年%m月%d日'
			};

			/**
			 * popup 紀年資訊 dialog 之功能。
			 * 
			 * @returns {Boolean}false
			 */
			function popup_era_dialog() {
				var era = this.era_popup, date;
				if (era)
					// had cached
					library_namespace.toggle_display(this.era_popup, true);

				else if (era = caculate_node_era(this)) {
					if (date = this.add_date) {
						date = '（' + to_era_Date(
						//
						caculate_node_era(this, 'String'), {
							get_range_String : {
								parser : standard_time_parser,
								format : String(date) === 'true'
								//
								? popup_era_dialog.format : date
							}
						}) + '）';

						if (this.appendChild)
							this.appendChild(document.createTextNode(date));
						else
							this.innerHTML += date;

						// reset flag.
						try {
							delete this.add_date;
						} catch (e) {
							this.add_date = undefined;
						}
					}

					// TODO: 檢驗若無法設定 this.era_popup
					library_namespace.locate_node(
							this.era_popup = library_namespace.new_node({
								div : era.join('<br />'),
								C : 'era_popup'
							}, document.body), this);
				}

				if (era)
					library_namespace.set_class(this, 'era_popupd');

				return false;
			}

			popup_era_dialog.format = '%Y年%m月%d日';

			popup_era_dialog.clear = function() {
				library_namespace.toggle_display(this.era_popup, false);
				library_namespace.set_class(this, 'era_popupd', {
					remove : true
				});

				return false;
			};

			/**
			 * 設定好 node，使紀年標示功能作動。
			 * 
			 * @param {ELEMENT_NODE}node
			 */
			function set_up_era_node(node, options) {
				// 先測試是否已標記完成，以加快速度。
				if (!library_namespace.has_class(node, 'era_text')
				//
				&& library_namespace.DOM_data(node, 'era')) {
					node.onmouseover = popup_era_dialog;
					node.onmouseout = popup_era_dialog.clear;
					if (options) {
						if (options.add_date)
							node.add_date = options.add_date;
						if (options.onclick) {
							node.onclick = options.onclick;
							node.style.cursor = 'pointer';
						}
					}
					library_namespace.set_class(node, 'era_text');
				}
			}

			/**
			 * 設定好所有 <tag> node，使紀年標示功能作動。
			 * 
			 * @param {String}tag
			 */
			function set_up_era_nodes(tag, options) {
				// var last_era;
				if (!tag)
					tag = 'span';
				if (typeof tag === 'string')
					library_namespace.for_nodes(options ? function(node) {
						set_up_era_node(node, options);
					} : set_up_era_node, tag);

				else if (library_namespace.is_ELEMENT_NODE(tag))
					set_up_era_node(tag, options);

				else
					library_namespace.warn('set_up_era_nodes: 無法設定 [' + tag
							+ ']');
			}

			// --------------------------------------------

			// 辨識史籍(historical book)紀年用之 pattern。
			var 史籍紀年_PATTERN, ERA_ONLY_PATTERN,
			//
			朔干支_PATTERN = generate_pattern('(朔<\\/span>)(干支)()', false, 'g'),
			// see era_text_to_HTML.build_pattern()
			REPLACED_data_era = '$1<span data-era="~">$2</span>$3';

			/**
			 * 將具有紀年日期資訊的純文字文本(e.g., 史書原文)，轉成供 set_up_era_node() 用之 HTML。<br />
			 * 設定 node.innerHTML = node 後，需要自己設定 set_up_era_node()!
			 * 
			 * @param {String}text
			 *            具紀年日期資訊的純文字文本(e.g., 史書原文)
			 * @param {ELEMENT_NODE}[node]
			 * @returns {String} 供 set_up_era_node() 用之 HTML。
			 */
			function era_text_to_HTML(text, node, options) {
				if (!史籍紀年_PATTERN)
					era_text_to_HTML.build_pattern();

				text = text
				// 因為 史籍紀年_PATTERN 於會利用到 pattern 前後，這部分會被吃掉，
				// 像 "十年，七月庚辰" 就會在 match 了 "十年，" 後，無法 match 到 "七月"。
				// 因此先將可能出現問題的做處理，多墊個字元以備不時之需。
				.replace(/([，。；！）])/g, '$1\0')
				// search
				.replace(史籍紀年_PATTERN, REPLACED_data_era)
				// search for 僅紀年亦轉換的情況。 e.g., '天皇'.
				.replace(ERA_ONLY_PATTERN, REPLACED_data_era)
				//
				.replace(朔干支_PATTERN, REPLACED_data_era)
				// 回復
				.replace(/([，。；！）])\0/g, '$1')
				// format
				.replace(/\n/g, '<br />');

				if (node) {
					if (typeof node === 'string')
						node = document.getElementById(node);
					node.innerHTML = text;
					set_up_era_nodes(null, options);
				} else
					return text;
			}

			/**
			 * 建構辨識史籍紀年用之 pattern。
			 */
			era_text_to_HTML.build_pattern = function() {
				var 紀年 = [];
				create_era_search_pattern().forEach(function(key) {
					var matched = key.match(/^(.+)天皇$/);
					if (matched)
						紀年.push(matched[1]);
				});
				ERA_ONLY_PATTERN = new RegExp('([^>])((?:' + 紀年.join('|')
						+ ')天皇)([^<])', 'g');

				// (紀年)?年(月(日)?)?|(月)?日|月
				紀年 = create_era_search_pattern().join('|').replace(
						/\s*\([^()]*\)/g, '');
				// 去掉「〇」
				// "一二三四五六七八九"
				var 日 = library_namespace.Chinese_numerals_Normal_digits
						.slice(1),
				//
				年 = '(?:[元' + 日 + ']|[十廿卅]有?){1,4}年',
				// 春王正月 冬十有二月
				月 = 季_SOURCE + '閏?(?:[正臘' + 日 + ']|十有?){1,3}月';
				日 = '(?:(?:(?:干支)?(?:初[' + 日 + ']日?|(?:' + 日
						+ '|(?:[一二三]?十|[廿卅])有?[元' + 日 + ']?|[元' + 日
						+ '])日)|干支日?)[朔晦望]?旦?|[朔晦望]日)';

				// TODO: 地皇三年，天鳳六年改為地皇。
				// e.g., 以建平二年為太初元年, 一年中地再動, 大酺五日, 乃元康四年嘉谷, （玄宗開元）十年
				// TODO: 未及一年, [去明]年, 是[年月日]
				return 史籍紀年_PATTERN = generate_pattern('(^|[^為酺乃])((?:' + 紀年
						+ ')*(?:）\0|\\))?' + 年 + '(?:' + 月 + 日 + '?)?|(?:' + 月
						+ ')?' + 日 + '|' + 月 + ')([^中]|$)', false, 'g');
			};

			// ---------------------------------------------------------------------//
			// export.

			Object.assign(to_era_Date, {
				set : parse_era,
				pack : pack_era,
				extract : extract_calendar_data,
				periods : get_periods,
				get_candidate : get_candidate,
				dates : get_dates,
				era_list : create_era_search_pattern,
				for_dynasty : for_dynasty,
				for_monarch : for_monarch,
				numeralize : numeralize_date_name,
				compare_start : compare_start_date,
				Date_of_CE_year : get_Date_of_key_by_CE,

				// 網頁應用功能。
				node_era : caculate_node_era,
				setup_nodes : set_up_era_nodes,
				to_HTML : era_text_to_HTML,
				//
				PERIOD_PATTERN : PERIOD_PATTERN
			}, add_comment.comments);

			// 加工處理。
			(function() {
				function comment_proxy(date_value, options) {
					return this(options
					//
					&& options.original_Date || date_value);
				}
				var comments = add_comment.comments;
				for ( var name in comments)
					comments[name]
					//
					= comment_proxy.bind(comments[name]);
			})();

			Object.assign(add_comment.comments, {
				// 注意:依 .format() 之設定，在未設定值時將採本處之預設。
				// 因此對於可能不設定的值，預設得設定為 ''。

				// 講述東周歷史的兩部典籍《春秋》和《戰國策》都是使用帝王紀年。
				// 共伯和/周定公、召穆公
				// 國號
				朝代 : '',
				// 君主(帝王)號
				君主 : '',
				// 共和
				// 君主(帝王)/年號/民國
				紀年 : '',
				紀年名 : '',

				// 季節:
				// 立春到立夏前為春季，立夏到立秋前為夏季，立秋到立冬前為秋季，立冬到立春前為冬季。

				年 : '(年名)',
				月 : '(月名)',
				日 : '(日名)',

				// 重新定義 (override)
				// 東漢四分曆以前，用歲星紀年和太歲紀年（歲星:木星）。到現在來用干支紀年。
				// 干支紀年萌芽於西漢，始行於王莽，通行於東漢後期。
				歲次 : function(date_value, options) {
					return (options
					//
					&& options.original_Date || date_value).歲次
							|| library_namespace.guess_year_stem_branch(
									date_value, options);
				},
				// 重新定義 (override) alias
				年干支 : '歲次',
				年柱 : '歲次',

				// 星座 : '',

				// 佔位:會引用 Date object 本身的屬性。
				// see strftime()
				月干支 : '月干支',
				// 每年正月初一即改變干支，例如錢益謙在崇禎十五年除夕作「壬午除夕」、隔日作「癸未元日」
				// 日干支:'干支紀日',
				// 月干支:'干支紀月',
				月柱 : '月干支',
				閏月 : '(是否為閏月)',
				大小月 : '(大小月)',

				// 晝夜 : '',
				// 第一個時辰是子時，半夜十一點到一點。
				// 時辰 : '子丑寅卯辰巳午未申酉戌亥',
				// 晚上七點到第二天早上五點平均分為五更（合十個小時），每更合二個小時。
				// 更 : '',

				// 用四柱神算推算之時辰八字
				四柱 : '%年柱%月柱%日柱%時柱',
				// 生辰八字
				八字 : '%年干支%月干支%日干支%時干支',

				// 夏曆 : '%歲次年%月月%日日%辰時',
				// 農民曆 : '',

				// 授時歷即統天歷
				曆法 : '',

				// 注解
				注 : ''
			});
			strftime.set_conversion(add_comment.comments,
			//
			library_namespace.gettext.to_standard('Chinese'));
			// 已經作過改變，不再利用之。
			delete add_comment.comments;

			Object.assign(library_namespace, {
				十二生肖_LIST : 十二生肖_LIST,
				陰陽五行_LIST : 陰陽五行_LIST
			});

			String_to_Date.parser.era = function(date_string, minute_offset,
					options) {
				if (minute_offset) {
					// 前置處理。
					if (!library_namespace.is_Object(options))
						options = library_namespace.null_Object();
					options.minute_offset = minute_offset;
				}

				library_namespace.debug('parse (' + typeof date_string + ') ['
						+ date_string + ']', 3, 'String_to_Date.parser.era');
				return to_era_Date(date_string, options);
			};

			library_namespace.date.age_of.get_new_year = get_Date_of_key_by_CE;

			// ---------------------------------------

			this.finish = function(name_space, waiting) {
				library_namespace.run([
						// 載入 CSS resource。
						// include resource of module.
						library_namespace.get_module_path(this.id).replace(
								/[^.]+$/, 'css'),
						// TODO: set timeout
						// 載入各紀年期間曆數資料 (era_data.js)。
						library_namespace.get_module_path(this.id + '_data')
				//
				], waiting);
				return waiting;
			};

			return to_era_Date;
		},

		// this is a sub module.
		// 完全不 export 至 library_namespace.
		no_extend : '*'
	});
