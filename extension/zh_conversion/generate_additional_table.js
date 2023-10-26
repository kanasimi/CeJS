/**
 * 整合繁簡轉換各家辭典: 合併新同文堂和 ConvertZZ 的辭典檔用。
 */

// node generate_additional_table.js to_CN
// node generate_additional_table.js to_TW

'use strict';

// --------------------------------------------------------------------------------------------

require('../../_for include/node.loader.js');

// 在非 Windows 平台上避免 fatal 錯誤。
CeL.env.ignore_COM_error = true;

CeL.run(['application.storage',]);
// move additional.to_TW.auto-generated.txt

let files_config = {
	to_TW: {
		method: 'CN_to_TW',
		OpenCC: ['STPhrases', 'STCharacters', 'TWPhrasesName', 'TWVariants', 'TWPhrasesIT', 'TWPhrasesOther'],
		tongwen: ['s2t-phrase.json', 's2t-char.json']
	},
	to_CN: {
		method: 'TW_to_CN',
		OpenCC: ['TWVariantsRevPhrases', 'TSPhrases', 'TSCharacters'],
		tongwen: ['t2s-phrase.json', 't2s-char.json']
	},
};

const convert_type = process.argv[2] in files_config ? process.argv[2] : 'to_TW';
const target_additional_dictionary_file = `OpenCC/additional.${convert_type}.auto-generated.txt`;
// 存在此檔案的情況下，含入 extension.zh_conversion 會造成干擾。
CeL.move_file(target_additional_dictionary_file, target_additional_dictionary_file.replace(/(\.\w+)$/, '.old$1'));

CeL.run(['extension.zh_conversion', 'data.CSV',]);
//console.log(CeL.TW_to_CN('當日糧草便是從各地徵調過來的。'));
//console.log(CeL.TW_to_CN('規'));

files_config = files_config[convert_type];

const base_dictionary = CeL.get_module_path('extension.zh_conversion', '');

const pair_Map = new CeL.Convert_Pairs(null, { path: files_config.OpenCC.map(name => base_dictionary + 'OpenCC' + CeL.env.path_separator + name + '.txt') }).pair_Map;
const additional_Map = new Map;
const conflict_Set = new Set;
const recommend_Map = new Map;

// ----------------------------------------------------------------------------

const tongwen_Map = new Map;
function add_tongwen_table(file_name) {
	const data = JSON.parse(CeL.read_file(base_dictionary + 'tongwen' + CeL.env.path_separator + file_name).toString());
	for (let [key, value] of Object.entries(data)) {
		key = key.trim();
		if (key && key !== "")
			tongwen_Map.set(key, value);
	}
}
files_config.tongwen.forEach(add_tongwen_table);
//console.log(tongwen_Map);
//console.log(tongwen_Map.get('痺'));


const convertZZ_Map = new Map;
CeL.parse_CSV(CeL.read_file(base_dictionary + 'ConvertZZ' + CeL.env.path_separator + 'Dictionary.csv')).forEach(line => {
	if (line[0] === 'False') return;
	let key, value;
	if (convert_type === 'to_TW') {
		key = line[2];
		value = line[4];
	} else {
		key = line[4];
		value = line[2];
	}

	if (convertZZ_Map.has(key)) {
		CeL.info(`Skip ${key}→${value}: Already has ${key}→${convertZZ_Map.get(key)}`);
		return;
	}
	convertZZ_Map.set(key, value);
});

// ----------------------------------------------------------------------------

process_conversion_Map(tongwen_Map);

process_conversion_Map(convertZZ_Map);

function process_conversion_Map(conversion_Map) {
	conversion_Map.forEach(process_from_to);
}

function process_from_to(to, from, map) {
	const converted = CeL[files_config.method](from);
	//if (to === '痹') console.trace([to, converted, from, pair_Map.has(from), additional_Map.has(from)])
	if (converted === to)
		return;

	if (pair_Map.has(from) || additional_Map.has(from)) {
		//console.log(from + '	→ ' + converted + '	↔ ' + to);

		if (from.length === 1 ? !pair_Map.has(from) && !recommend_Map.has(from)
			: additional_Map.has(from) && additional_Map.get(from) === to) {
			recommend_Map.set(from, to);
		}
		conflict_Set.add(from);
	} else if (from.length === 1) {
		// add from → to
		recommend_Map.set(from, to);
	} else {
		additional_Map.set(from, to);
	}
}

// ----------------------------------------------------------------------------

let additional_table = ['from	to'];
additional_Map.forEach((to, from, map) => additional_table.push(from + '	' + to));
CeL.write_file('additional_table.full.tsv', additional_table.join('\n'));

if (recommend_Map.size > 0) {
	additional_table = [];
	recommend_Map.forEach((to, from, map) => additional_table.push(from + '	' + to));
	CeL.write_file(target_additional_dictionary_file, additional_table.join('\n'));
}
additional_table = null;

function add_item(from, converted, map) {
	var to = map.get(from);
	return to && to !== converted ? to : '';
}

const need_to_check_table = ['from	CeL.zh_conversion	OpenCC	tongwen	convertZZ'];
conflict_Set.forEach(from => {
	const converted = CeL[files_config.method](from);
	need_to_check_table.push(`${from}	${converted}	${pair_Map.get(from) || ''}	${add_item(from, converted, tongwen_Map)}	${add_item(from, converted, convertZZ_Map)}`);
});
CeL.write_file('need_to_check_table.tsv', need_to_check_table.join('\n'));
