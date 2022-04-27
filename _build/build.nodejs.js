/**
 * @name CeJS builer
 * 
 * @fileoverview Tool to build CeJS library.
 * 
 * @since 2022/3/1 9:0:50
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

const library_base_directory_name = '../', backup_directory = 'old/';

let library_main_script = 'ce.js';
const structure_directory = '_structure/';
const main_structure_file = structure_directory + 'structure.js';

// timestamp
const datestamp = new Date;

const node_fs = require('fs');

function error_recover_and_exit(message) {
	console.error(`${error_recover_and_exit.name}: Try to recover main script file from backup!`);

	//node_fs.cpSync(backup_directory + library_main_script, library_base_directory + library_main_script, { force: true });

	process.exit(1);
}

require('../_for include/_CeL.loader.nodejs');

if (typeof CeL === 'undefined') {
	console.error("Can't load library!");
	error_recover_and_exit();
}


if (CeL.env.main_script)
	library_main_script = CeL.env.main_script;

const library_base_directory = CeL.simplify_path(CeL.env.script_base_path + library_base_directory_name);

// --------------------------------------------------------------------------------------------

CeL.env.ignore_COM_error = true;
CeL.run(['application.storage',
	// Guess language of section title assigned in task file name.
	'application.locale.encoding', 'data.date', 'interact.console', 'application.debug.log',
	// CeL.parse_CSV()
	'data.CSV',
]);

/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
const NOT_FOUND = ''.indexOf('_');

const library_build_script_name = CeL.get_script_name() || 'library_build_script';
//const library_main_script_file_path = CeL.env.registry_path + library_main_script;
const library_main_script_file_path = library_base_directory + library_main_script;
// from utf16 big-endian: structure_content.swap16()
//console.log(require('fs').readFileSync(library_main_script_file_path).toString('utf16le'));


/**
 *  modify time stamp of npm package.json.
 */
function update_package_file_version() {
	const package_file_path = library_base_directory + 'package.json';
	let package_file_content = CeL.read_file(package_file_path).toString()
		// version stamp
		.replace(/("version"[\s\n]*:[\s\n]*")[^"]*(")/, function (all, header, footer) {
			return header + CeL.version + footer;
		});
	CeL.write_file(package_file_path, package_file_content);
}

/**
 * build main script.
 */
function build_main_script() {
	const file_list = [main_structure_file];
	let library_main_script_content = CeL.read_file(library_base_directory + main_structure_file).toString();
	//console.log([CeL.env.source_encoding, main_structure_file, library_main_script_content]);
	library_main_script_content = library_main_script_content
		.replace(/\/\/([^\r\n]+)\r?\n/g, function ($0, $1) {
			return /^\s*add\s/i.test($1) ? $0 : '';
		}).replace(/[\r\n\s]*\/\*[\s\S]*?\*\/[\r\n\s]*/g, '')
		.replace(/\/\/\s*add\s+([a-z_\d]+\.js)/gi, function (all, file_name) {
			file_list.push(file_name);
			const file_path = library_base_directory + structure_directory + file_name;
			//console.log(file_path);
			return CeL.read_file(file_path).toString()
				.replace(/\/\*[\s\S]*?\*\//, '');
		})

		// Increase version stamp
		.replace(/([\W]library_version[\s\n]*=[\s\n]*'v?)(\d+)\.(\d+)(\.(\d+))?(')/,
			function (all, header, v1, v2, _v3, v3, footer) {
				// [ all, v1, v2, _v3, v3 ] major.minor.patch
				var matched = CeL.version.match(/^v?(\d+)\.(\d+)(\.(\d+))?$/);
				if (v1 === matched[1] && v2 === matched[2]) {
					// 自動增加 patch 版本號。
					v3 = +matched[4] + 1;
				} else {
					// 主要 major 版本號或 minor 版本號改變，重新設定 patch 版本號 v3 為 base.js 中的號碼。
					;
				}
				// reset CeL.version to new version.
				CeL.version = v1 + '.' + v2 + '.' + v3;
				return header + CeL.version + footer;
			})
		// time stamp
		.replace(/([\W]build_date[\s\n]*=[\s\n]*)[^;]+/, function ($0, $1) {
			return $1 + 'new Date("' + datestamp.toISOString() + '")';
		});


	// Add BOM
	library_main_script_content = `\ufeff
/*
	本檔案為自動生成，請勿手動編輯！
	This file is auto created from ${file_list.join(', ')}
		by auto-generate tool: ${library_build_script_name}(.js) @ ${datestamp.format('%Y-%2m-%2d' && '%Y')}.
*/

` + library_main_script_content;
	//console.log([CeL.env.source_encoding, main_structure_file, library_main_script_content]);

	try {
		if (library_main_script_content === CeL.read_file(library_main_script_file_path, 'auto'))
			return;
	} catch { }


	CeL.remove_file(library_base_directory + backup_directory + library_main_script);
	CeL.move_file(library_base_directory + library_main_script, library_base_directory + backup_directory + library_main_script);

	CeL.chmod(library_main_script_file_path, 0o600);
	CeL.write_file(library_main_script_file_path, library_main_script_content, CeL.env.source_encoding);
	CeL.chmod(library_main_script_file_path, 0o400);
}

// ---------------------------------------------------------------------//

// message_to_localized_mapping['en-US'] = {"Original language message 原文訊息 in source":"localized message"}
const message_to_localized_mapping = Object.create(null);
// i18n_message_id_to_message['en-US'] = {"message_id":"localized message"}
const i18n_message_id_to_message = Object.create(null);
const qqq_data_file_name = 'qqq_data.json';
// qqq_data.get('message_id') = {message: "Original language message 原文訊息 in source", original_message_language_code: 'en-US|cmn-Hant-TW', notes: "notes", scope: "source/", demo: "demo URL / application of the message", additional_notes: "additional notes"}
const qqq_data_Map = new Map;
// gettext_config:{"id":"$1-$2-$3"}
let message_to_id_Map = new Map([['%1/%2/%3', null]]);
/** message_changed.get(from message) = to message */
const message_changed = new Map;
/** message_id_changed.get(from message id) = to message id */
const message_id_changed = new Map;

const PATTERN_has_invalid_en_message_char = /[^\x20-\xfe\s←↑→≠🆔😘➕]/;

function en_message_to_message_id(en_message) {
	var message_id = en_message.trim()
		.replace(/🆔/g, 'ID')
		.replace(/[,;:.?!~]+$/, '')
		.replace(/[:,;'"\s\[\]\\\/#]+/g, '-')
		.replace(/[\-\s]+$|^[\-\s]+/g, '')
		.replace(/-{2,}/, '-')
		.replace(/%/g, '$')
		.toLowerCase();
	if (message_id.length > 200) {
		message_id = message_id.slice(0, 200).replace(/-[^-]*$/, '');
	}
	return message_id;
}

/**
 * auto-build resources / locale message.
 */
async function build_locale_messages(resources_path) {
	resources_path = library_base_directory + resources_path + CeL.env.path_separator;
	//console.trace(CeL.env);

	load_previous_qqq_data(resources_path);

	await new Promise((resolve, reject) => {
		load_message_to_localized(resources_path, resolve);
	});

	if (false) {
		// 不可再用: 一次性匯入 Localized messages in 紀年轉換工具。
		load_CSV_message_to_localized(library_base_directory + '_test suite/resources/locale.csv');
	}

	// Localized messages for CeJS 網路小說漫畫下載工具。
	//load_CSV_message_to_localized(library_base_directory + '../../program/work_crawler/resources/locale of work_crawler - locale.csv');
	//console.trace(message_to_localized_mapping);

	await new Promise((resolve, reject) => {
		//console.trace(resources_path);
		load_i18n_messages(resources_path, resolve);
	});

	create__qqq_data_Map();
	if (message_to_localized_mapping.qqq) {
		if (!CeL.is_empty_object(message_to_localized_mapping.qqq)) {
			//console.trace(message_to_localized_mapping.qqq);
		}
		delete message_to_localized_mapping.qqq;
	}

	await modify_source_files();

	write_qqq_data(resources_path);

	write_i18n_files(resources_path);
	CeL.log(`${build_locale_messages.name}: Done.`);
}

function load_previous_qqq_data(resources_path) {
	//console.trace(resources_path + qqq_data_file_name);
	let contents = CeL.read_file(resources_path + qqq_data_file_name);
	if (!contents) return;
	contents = JSON.parse(contents.toString());
	for (const [message_id, qqq_data] of Object.entries(contents)) {
		//console.log([message_id, qqq_data]);
		// 因為原始碼只要更動過就可能影響行數，所以每次執行重新抓取設定行數。
		delete qqq_data.references;
		qqq_data_Map.set(message_id, qqq_data);
	}
}

/**
 * Setup message_to_localized_mapping[language_code] and message_to_id_Map via *.csv
 * 
 * @param {String} resource_file_path 
 */
function load_CSV_message_to_localized(resource_file_path) {
	const locale_messages = CeL.parse_CSV(CeL.get_file(resource_file_path), {
		has_title: true
	}), preserved_index = {
		hide: NaN,
		scope: NaN,
		message: NaN,
		note: NaN
	}, language_code_to_index_hash = Object.create(null), heads = locale_messages.shift();

	// CeL.debug(Array.isArray(heads));
	// CeL.debug(heads.forEach);
	// 預先掃描 title。
	heads.forEach(function (title, index) {
		let name;
		if (title in preserved_index) {
			preserved_index[title] = index;
			if (title === 'note') {
				language_code_to_index_hash.qqq = index;
			}
		} else if (name = CeL.gettext.to_standard(title))
			language_code_to_index_hash[name] = index;
		else
			CeL.warn('Unknown language: ' + language);
	});

	// check.
	for (let index in preserved_index) {
		if (isNaN(preserved_index[index]))
			CeL.warn('未提供欄位: ' + index);
	}

	const index_of = locale_messages.index;
	//console.trace({ indexes_of, index_of_hide });
	locale_messages.forEach(record => {
		if (record[index_of.hide])
			return;

		/** 原訊息 */
		const message = record[index_of.message];
		if (!message)
			return;
		message_to_id_Map.set(message, null);
		for (const [language_code, index] of Object.entries(language_code_to_index_hash)) {
			let local_message = record[index];
			if (language_code === 'qqq') {
				local_message += `\n; scope: ${record[preserved_index.scope]}`;
			}
			if (!local_message) continue;
			const localized_mapping = message_to_localized_mapping[language_code] || (message_to_localized_mapping[language_code] = Object.create(null));
			const local_message_of_CSV = localized_mapping[message];
			if (local_message_of_CSV) {
				if (local_message.includes(local_message_of_CSV)) {
					continue;
				}
				CeL.error(`${load_CSV_message_to_localized.name}: 設定相異的本地化翻譯 ${resource_file_path}\nmessage	${JSON.stringify(message)}\n原本地	${JSON.stringify(local_message)}	[${language_code}]\n新→	${typeof local_message_of_CSV === 'string' ? JSON.stringify(local_message_of_CSV) : local_message_of_CSV}`);
				local_message = local_message.toString();
			}
			localized_mapping[message] = local_message;
		}
	});
}

/**
 * Setup message_to_localized_mapping[language_code] and message_to_id_Map via *.js
 * 
 * @param {String} resources_path 
 * @param {Function} callback 
 */
function load_message_to_localized(resources_path, callback) {
	CeL.storage.traverse_file_system(resources_path, fso_path => {
		const matched = fso_path.match(/[\\\/](\w+(?:-\w+)*)\.js$/);
		//console.log([fso_path, matched]);
		if (!matched)
			return;
		const contents = CeL.read_file(fso_path).toString().between('.set_text(', { tail: ',\n' });
		let locale_data;
		try {
			locale_data = JSON.parse(contents);
		} catch (e) {
			CeL.warn(`${load_message_to_localized.name}: There are functions in the locale? ${fso_path}`);
			try {
				eval('locale_data = ' + contents);
				//console.log(data);
			} catch (e) {
				CeL.error(`${fso_path}:`);
				console.error(e);
			}
		}

		if (!locale_data)
			return;

		if (false) {
			// 一次性訊息修正。
			for (const [from_message, to_message] of Object.entries({
				Espana:
					// gettext_config:{"id":"españa"}
					'España',
				'Calendrier republicain':
					// gettext_config:{"id":"french-republican-calendar"}
					'Calendrier républicain',
			})) {
				if ((from_message in locale_data) && !locale_data[to_message]) {
					locale_data[to_message] = locale_data[from_message];
					delete locale_data[from_message];
				}
			}
		}

		const language_code = matched[1];
		message_to_localized_mapping[language_code] = locale_data;

		Object.keys(locale_data).forEach(message => message_to_id_Map.set(message, null));
	}, {
		depth: 1,
		callback
	});
}

const i18n_language_code_data_mapping = new Map;
function load_i18n_messages(resources_path, callback) {
	resources_path += 'i18n' + CeL.env.path_separator;
	i18n_language_code_data_mapping.latest_resources_path = resources_path;

	//console.trace(resources_path);
	CeL.storage.traverse_file_system(resources_path, fso_path => {
		const matched = fso_path.match(/[\\\/]([\w\-]+)\.json$/);
		//console.log([fso_path, matched]);
		if (!matched)
			return;
		const language_code = matched[1] === 'qqq' ? matched[1] : CeL.gettext.to_standard(matched[1]);
		if (!language_code) {
			CeL.error(`${load_i18n_messages.name}: Unknown language code: ${matched[1]}`);
			return;
		}
		const contents = CeL.read_file(fso_path).toString();

		let locale_data;
		try {
			//console.log(contents);
			locale_data = JSON.parse(contents);
		} catch (e) {
			CeL.error(`${fso_path}:`);
			console.error(e);
		}

		if (!locale_data)
			return;

		i18n_message_id_to_message[language_code] = locale_data;
		i18n_language_code_data_mapping.set(language_code, {
			fso_path,
			i18n_language_code: matched[1]
		});

	}, {
		depth: 1,
		callback
	});
}

function parse_qqq(qqq) {
	const qqq_data = {
		message: null,
		notes: null,
		// Referenced by
		references: []
	};
	let notes = [], additional_notes = [];
	let start_additional_notes;
	let latest_attribute;
	qqq.split(/\n/).forEach(line => {
		line = line.trim();
		if (!line) return;
		let matched = line.match(/^;([^:\n]+):(.*)$/);
		if (matched) {
			if (!start_additional_notes && notes.length > 0) start_additional_notes = true;
			qqq_data[latest_attribute = matched[1].trim().replace(/^[A-Z]/, initial_char => initial_char.toLowerCase())] = matched[2].trim();
			return;
		}

		matched = line.match(/^:(.*)$/);
		if (matched && latest_attribute) {
			const value = matched[1].trim();
			const original_value = qqq_data[latest_attribute];
			if (Array.isArray(original_value)) {
				qqq_data[latest_attribute].push(value);
			} else {
				qqq_data[latest_attribute] = original_value ? [original_value, value] : value;
			}
			return;
		}

		latest_attribute = null;
		if (start_additional_notes)
			additional_notes.push(line);
		else
			notes.push(line);
	});

	notes = notes.join('\n');
	// parse "notes (scope: ...)"
	for (let matched; matched = notes.match(/\s*\(([^():]+):((?:\(\)|[^()])+)\)$/);) {
		const property = matched[1].trim();
		const value = matched[2].trim();
		if (!qqq_data[property]) {
			qqq_data[property] = value;
		} else if (property !== 'references') {
			// 警告: 每次 .references 都會在 adapt_new_change() 中被重新設定!
			CeL.warn(`${parse_qqq.name}: Skip duplicate property name: ${property}=${value}`);
		}
		notes = notes.slice(0, matched.index);
	}
	qqq_data.notes = notes;
	if (additional_notes.length > 0)
		qqq_data.additional_notes = additional_notes.join('\n');

	return qqq_data;
}

function function_to_message(function_message) {
	return String(function_message).replace(/\\u([\da-f]{4})/g, (all_char, char_code) => String.fromCharCode(parseInt(char_code, 16)));
}

function log_message_changed(message_id) {
	const qqq_data = qqq_data_Map.get(message_id);
	//console.log([message_id, qqq_data]);
	const message = qqq_data.message;
	if (!message) {
		CeL.error(`${log_message_changed.name}: No message of id: ${message_id}`);
		return;
	}

	for (const language_code of Object.keys(message_to_localized_mapping)) {
		// .hasOwnProperty(message): 避免 'constructor'
		let from_localized_message = (!message_to_localized_mapping[language_code].hasOwnProperty || message_to_localized_mapping[language_code].hasOwnProperty(message)) && message_to_localized_mapping[language_code][message];
		let locale_data = i18n_message_id_to_message[language_code];
		if (!locale_data) {
			// e.g., get from load_CSV_message_to_localized()
			CeL.info(`${log_message_changed.name}: New language code of i18n: ${language_code}`);
			locale_data = i18n_message_id_to_message[language_code] = Object.create(null);
			const i18n_language_code = language_code.match(/^[^-]+/)[0];
			i18n_language_code_data_mapping.set(language_code, {
				fso_path: i18n_language_code_data_mapping.latest_resources_path + i18n_language_code + '.json',
				i18n_language_code
			});
		}
		// .hasOwnProperty(message_id): 避免 'constructor'
		const to_localized_message = locale_data.hasOwnProperty(message_id) && locale_data[message_id];
		if (!from_localized_message) {
			// New localized message
			continue;
		}
		if (!to_localized_message) {
			// New localized message. 
			// e.g., get from load_CSV_message_to_localized()
			locale_data[message_id] = from_localized_message;
			continue;
		}
		if (typeof from_localized_message === 'function') {
			from_localized_message = function_to_message(from_localized_message);
		}
		if (from_localized_message === to_localized_message)
			continue;
		if (from_localized_message.includes('\n'))
			from_localized_message = '\n' + from_localized_message + '\n';
		CeL.info(`${log_message_changed.name}: ${message}	[${language_code}] ${from_localized_message
			}→${to_localized_message.includes('\n') ? '\n' + to_localized_message : to_localized_message}`);
	}
}

function set_qqq_data(message_id, qqq) {
	if (!qqq || typeof qqq !== 'string')
		return;
	let qqq_data = parse_qqq(qqq);
	if (qqq_data_Map.has(message_id)) {
		const old_qqq_data = qqq_data_Map.get(message_id);
		// 捨棄舊的 .references 資訊，將在 adapt_new_change() 重新設定。
		delete qqq_data.references;
		qqq_data = Object.assign(old_qqq_data, qqq_data);
	} else {
		CeL.warn(`${set_qqq_data.name}: New message id in i18n: ${message_id}`);
		qqq_data_Map.set(message_id, qqq_data);
	}
	return qqq_data;
}

function create__qqq_data_Map() {
	for (const [message_id, qqq] of Object.entries(i18n_message_id_to_message.qqq)) {
		set_qqq_data(message_id, qqq);
	}

	// Create qqq_data_Map
	for (const message of message_to_id_Map.keys()) {
		if (!message)
			continue;
		// 首先採用原有訊息。
		let en_message = message_to_localized_mapping['en-US'][message];
		if (!en_message) {
			if (PATTERN_has_invalid_en_message_char.test(message)) {
				CeL.warn(`${create__qqq_data_Map.name}: Cannot find the en_message of ${message}`);
				continue;
			}
			en_message = message;
		}
		// e.g., {Function}
		en_message = en_message.toString();
		if (PATTERN_has_invalid_en_message_char.test(en_message)) {
			CeL.warn(`${create__qqq_data_Map.name}: en_message of ${message} contains invalid char(s)! ${en_message}`);
			continue;
		}
		if (false) {
			// 一次性訊息修正。
			// gettext_config:{"id":"french-republican-calendar"}
			if (message === 'Calendrier républicain')
				en_message = 'French Republican Calendar';
		}
		//console.log([message, en_message]);
		const message_id = qqq_data_Map.has(message) ? message
			: qqq_data_Map.has(en_message_to_message_id(message)) ? en_message_to_message_id(message)
				: en_message_to_message_id(en_message);
		let qqq_data = qqq_data_Map.get(message_id);
		//if (message === '作者') { console.trace({ message, message_id, qqq_data }); throw 456465; }
		if (!qqq_data && message_to_localized_mapping.qqq && (qqq_data = set_qqq_data(message_id, message_to_localized_mapping.qqq[message]))) {
			delete message_to_localized_mapping.qqq[message];
		}
		if (!qqq_data) {
			CeL.error(`${create__qqq_data_Map.name}: No i18n qqq_data of message id: ${message_id} (message: ${message})`);
			continue;
		}
		if (message !== message.trim()) {
			CeL.error(`${create__qqq_data_Map.name}: message is not trimmed: ${JSON.stringify(message)}`);
		}

		if (!qqq_data.message) {
			// set Original language message 原文訊息 qqq_data.message
			qqq_data.message = message;
		} else if (qqq_data.message !== message) {
			// matched: [ all, text_id / message, tail punctuation mark ]
			const matched = message.match(CeL.gettext.PATTERN_message_with_tail_punctuation_mark);
			if (!matched || qqq_data.message !== matched[1]) {
				// (references: ${qqq_data.references})
				CeL.info(`${create__qqq_data_Map.name}: Original language message 原文訊息 changed in translatewiki:\nid:	${message_id}\n原	${qqq_data.message}\n新→	${message}`);
				message_changed.set(qqq_data.message, message);
				message_to_id_Map.set(qqq_data.message, message_id);
				qqq_data.message = message;
				delete qqq_data.original_message_language_code;
			}
		}

		if (!qqq_data.original_message_language_code) {
			// set Original language message 原文訊息之語言代碼 qqq_data.original_message_language_code
			let message_language_code;
			Object.entries(i18n_message_id_to_message).some(([language_code, locale_data]) => {
				if (locale_data[message_id] === qqq_data.message) {
					message_language_code = language_code;
					return true;
				}
			});
			if (!message_language_code)
				message_language_code = CeL.encoding.guess_text_language(qqq_data.message);
			if (!message_language_code && /^[\t\x20-\xfe]+$/.test(qqq_data.message))
				message_language_code = 'en-US';
			qqq_data.original_message_language_code = message_language_code;
		}

		message_to_id_Map.set(message, message_id);
	}

	//console.trace(Array.from(qqq_data_Map.keys()).join());
	for (const message_id of qqq_data_Map.keys()) {
		log_message_changed(message_id);
	}

	for (const [message, message_id] of message_to_id_Map.entries()) {
		if (!message_id)
			CeL.warn(`${create__qqq_data_Map.name}: No message id of message: ${message}`);
	}

	//console.trace(qqq_data_Map);
}

/** {RegExp}在地化語言註記之模式。 */
const PATTERN_gettext_config_line = /^(\s*\/\/\s*gettext_config\s*:\s*)({[\s\S]*?})(\s*)$/;

/** 省略容易混淆出錯的訊息。 */
const ignore_messages = new Set(['boolean', 'number', 'string', 'function', 'date', 'time', 'module', 'constructor', 'class',
	'now', 'file', 'directory', 'Paste', 'Search', 'site', 'link', 'title', 'language', 'dark', 'light', 'default', 'collapse', 'expand', 'finished', 'calendar',
	'中國']);

/**
 * 增加原始檔的在地化語言註記。
 * 
 * @param {String} script_file_path 原始檔路徑
 */
function add_localization_marks(script_file_path) {
	try {
		const node_fs = require('fs');
		node_fs.accessSync(script_file_path, node_fs.constants.F_OK
			| node_fs.constants.R_OK | node_fs.constants.W_OK);
	} catch (e) {
		// 跳過唯讀檔案。
		CeL.log(`${add_localization_marks.name}: Skip ${script_file_path}`);
		return;
	}

	let contents = CeL.read_file(script_file_path).toString();
	let changed_count = 0;
	let new_line = contents.match(/\r?\n/);
	new_line = new_line ? new_line[0] : '\n';

	function add_localization_mark(quoted_message, message_id, had_add_prefix) {
		if (!had_add_prefix && quoted_message.length < 20) {
			// 避免錯誤處理長度較短的訊息。改偵測像這樣的情況:
			// gettext("message")
			add_localization_mark('(' + quoted_message, message_id, true);
			// {T:"message"}
			add_localization_mark(' ' + quoted_message, message_id, true);
			add_localization_mark('\t' + quoted_message, message_id, true);
			add_localization_mark(':' + quoted_message, message_id, true);
			// ["message"]
			add_localization_mark('[' + quoted_message, message_id, true);
			// data-gettext="message"
			add_localization_mark('=' + quoted_message, message_id, true);
			return;
		}

		for (let index = 0; (index = contents.indexOf(quoted_message, index)) !== NOT_FOUND;) {
			//console.trace([message, index]);
			let previous_index_of_new_line = contents.lastIndexOf(new_line, index);
			let spaces, previous_text, post_text;
			if (previous_index_of_new_line === NOT_FOUND) {
				previous_index_of_new_line = 0;
				previous_text = '';
				post_text = contents;
				spaces = contents.match(/^(\s*)/)[0];
			} else {
				previous_text = contents.slice(0, previous_index_of_new_line);
				const previous_line = previous_text.match(/.+$/);
				if (previous_line && PATTERN_gettext_config_line.test(previous_line[0])) {
					// 跳過已經有標記的，避免多次添加在地化語言註記。
					index += quoted_message.length;
					continue;
				}
				// e.g., post_text = '\n  gettext("message")'
				post_text = contents.slice(previous_index_of_new_line);
				// /\s/.test('\n') === true
				spaces = post_text.match(/^(\s*)/)[0];
				//console.trace([message, index, spaces, contents.slice(previous_index_of_new_line, index)]);
			}
			if (/^\s*\/\//.test(post_text)) {
				// 跳過註解中的文字。
				// e.g., 找到的這一行本身就是在地化語言註記。
				index += quoted_message.length;
				continue;
			}
			//CeL.info(`${add_localization_marks.name}: Add mark for [${message_id}] ${message}`);
			const gettext_mark = `${spaces}// gettext_config:${JSON.stringify({ id: message_id })}`;
			contents = previous_text
				+ gettext_mark
				+ post_text;
			index += gettext_mark.length + quoted_message.length;
			changed_count++;
		}
	}


	for (const [message_id, qqq_data] of qqq_data_Map.entries()) {
		const message = qqq_data.message;
		if (!message || message.length < 3
			// /[\u4e00-\u9fa5]/: 匹配中文。
			|| message.length < 4 && !/[\u4e00-\u9fffぁ-んーァ-ヶ]/.test(message) || ignore_messages.has(message))
			continue;
		add_localization_mark("'" + message.replace(/'/g, "\\'") + "'", message_id);
		add_localization_mark(JSON.stringify(message), message_id);
	}

	if (changed_count > 0) {
		CeL.info(`${add_localization_marks.name}: [${script_file_path}] Add ${changed_count} mark(s).`);
		CeL.write_file(script_file_path/* + '.bak' */, contents);
	}
}

function GitHub_link(options) {
	//this.base_GitHub_path = options.base_GitHub_path;
	//this.line_index = options.line_index;
	Object.assign(this, options);
}

GitHub_link.prototype.toString = function toString() {
	return `{{GitHub|${encodeURI(`${this.base_GitHub_path}/blob/master/${this.script_file_path.slice(CeL.append_path_separator(this.source_base_path).length).replace(/\\/g, '/')}`)}#L${this.line_index + 1}}}`;
};

function adapt_new_change(script_file_path, options) {
	const contents = CeL.read_file(script_file_path).toString();
	const content_lines = contents.split('\n');
	let change_counts = 0;

	for (let line_index = 0; line_index < content_lines.length - 1;) {
		const gettext_config_line = content_lines[line_index++];
		// matched: [ all line, front, gettext_config, tail ]
		const gettext_config_matched = gettext_config_line.match(PATTERN_gettext_config_line);
		if (!gettext_config_matched)
			continue;
		let gettext_config;
		try {
			gettext_config = JSON.parse(gettext_config_matched[2]);
		} catch {
			CeL.error(`${adapt_new_change.name}: Invalid gettext_config: ${gettext_config_matched[2]}`);
			continue;
		}
		//console.trace(gettext_config_matched.slice(1));

		const message_line = content_lines[line_index];
		// [ all line, front, quote, message, tail ]
		let message_line_matched = message_line.match(/^([^"']*)(')((?:\\'|[^'])+)'([\s\S]*?)$/);
		let message;
		// 警告: message 不可分割，否則會找不到。且本行的第一個字串就必須是 message，否則會導致誤判！
		if (message_line_matched) {
			message = message_line_matched[3].replace(/"/g, '\\"');
		} else if (message_line_matched = message_line.match(/^([^"']*)(")((?:\\"|[^"])+)"([\s\S]*?)$/)) {
			message = message_line_matched[3];
		} else {
			CeL.error(`${adapt_new_change.name}: No message get for gettext_config: ${gettext_config_matched[2]}\n	File: ${script_file_path}\n	[${line_index}] ${message_line}`);
		}

		try {
			message = JSON.parse('"' + message + '"');
		} catch {
			CeL.error(`${adapt_new_change.name}: Invalid message "${message_line}" for gettext_config: ${gettext_config_matched[2]}`);
			continue;
		}

		let message_id = message_to_id_Map.get(message);
		if (!message_id) {
			// matched: [ all, text_id / message, tail punctuation mark ]
			const matched = message.match(CeL.gettext.PATTERN_message_with_tail_punctuation_mark);
			if (matched) {
				message_id = message_to_id_Map.get(matched[1]);
			} else if (!gettext_config.id && !PATTERN_has_invalid_en_message_char.test(message)) {
				/**
				 * 添加訊息的方法: 直接把 message 當英文訊息。
				 * e.g., <code>
	
				插入 // gettext_config: {}
				gettext('English message');
	
				</code> */
				gettext_config.id = en_message_to_message_id(message);
			}
		}
		let qqq_data;
		if (message_id) {
			qqq_data = qqq_data_Map.get(message_id);

		} else if (!(message_id = gettext_config.id)) {
			throw new Error(`${adapt_new_change.name}: [${script_file_path}]原始碼中新增了 message，但未設定且無法自動判別 message id: ${JSON.stringify(message)}`);

		} else if (qqq_data = qqq_data_Map.get(message_id)) {
			if (message_changed.has(qqq_data.message)) {
				if (message_changed.get(qqq_data.message) !== message) {
					throw new Error(`${adapt_new_change.name}: message 衝突:\n原 message	${JSON.stringify(qqq_data.message)}\n→ i18n或其他原始碼中的 message:	${JSON.stringify(message_changed.get(qqq_data.message))}\n→ [${script_file_path}]原始碼中的 message:${JSON.stringify(message)}`);
				}

			} else if (qqq_data.message !== message) {
				CeL.info(`${adapt_new_change.name}: 改變了[${script_file_path}]原始碼中的 message:\nid	${message_id}\n	${JSON.stringify(qqq_data.message)}\n→	${JSON.stringify(message)}`);
				message_changed.set(qqq_data.message, message);
				qqq_data.need_to_recheck_all_sources = true;
				const locale_data = i18n_message_id_to_message[qqq_data.original_message_language_code];
				if (locale_data) {
					locale_data[message_id] = message;
				}
				//delete message_to_localized_mapping[qqq_data.original_message_language_code][qqq_data.message];
				//message_to_localized_mapping[qqq_data.original_message_language_code][message] = message;
				qqq_data.message = message;
			}

		} else {
			// assert: !!message_id === true
			message_id = en_message_to_message_id(message_id);
			if (gettext_config.id !== message_id) {
				/**
				 * 添加訊息的方法: 直接把 message_id 當英文訊息。
				 * e.g., <code>
	
				插入 // gettext_config: {id:"English message"}
				gettext('Original language message 原文訊息');
	
				</code> */
				i18n_message_id_to_message['en-US'][message_id] = gettext_config.id;
				gettext_config.id = message_id;
			}
			CeL.info(`${adapt_new_change.name}: [${script_file_path}]原始碼中新增了 message: [${message_id}] ${JSON.stringify(message)}`);
		}

		//console.trace([message, gettext_config, qqq_data_Map.get(message_id)]);
		for (const [property, value] of Object.entries(gettext_config)) {
			if (property === 'id') {
				if (message_id === value) {
					continue;
				}
				if (message_id_changed.has(message_id)) {
					if (message_id_changed.get(message_id) !== value) {
						throw new Error(`${adapt_new_change.name}: message id 衝突:\n原 message	id ${JSON.stringify(message_id)}\n→ 其他原始碼中的 message id:	${JSON.stringify(message_id_changed.get(message_id))}\n→ [${script_file_path}]原始碼中的 message:${JSON.stringify(value)}`);
					}

				} else {
					CeL.info(`${adapt_new_change.name}: [${script_file_path}]原始碼改變了的 message id:\n	${JSON.stringify(message_id)}\n→	${JSON.stringify(value)}`);
					message_id_changed.set(message_id, value);
					qqq_data.need_to_recheck_all_sources = true;
					// 當原始碼中改變 message id 時，不會一同變更 qqq_data_Map, message_to_id_Map, i18n_message_id_to_message。唯一只會紀錄於 message_id_changed。
					//qqq_data_Map.set(value, qqq_data);
					//qqq_data_Map.delete(message_id);
					//message_id = value;
				}
				continue;
			}

			qqq_data[property] = value;
		}

		if (message_id_changed.has(message_id))
			message_id = message_id_changed.get(message_id);

		if (!Array.isArray(qqq_data.references))
			qqq_data.references = qqq_data.references ? [qqq_data.references] : [];
		if (!qqq_data.references.script_file_path_hash)
			qqq_data.references.script_file_path_hash = new Map;
		if (options.base_GitHub_path) {
			console.assert(script_file_path.startsWith(CeL.append_path_separator(options.source_base_path)), [options.source_base_path, script_file_path]);
			// TODO: https://web.dev/text-fragments/
			qqq_data.references.push(new GitHub_link({
				...options,
				script_file_path,
				line_index,
			}));
			qqq_data.references.script_file_path_hash.set(script_file_path, options);
		}

		content_lines[line_index - 1] = gettext_config_matched[1] + JSON.stringify({
			// 原始碼中僅留存 message id，其他全部移到 qqq_data。
			id: message_id
		}) + gettext_config_matched[3];
		if (gettext_config_line !== content_lines[line_index - 1]) change_counts++;

		if (message_line_matched[2] === '"') {
			message = JSON.stringify(message);
		} else {
			// assert: message_line_matched[2] === "'"
			message = "'" + message.replace(/'/g, "\\'") + "'";
		}
		content_lines[line_index] = message_line_matched[1] + message + message_line_matched[4];
		if (message_line !== content_lines[line_index]) change_counts++;
		//console.trace(qqq_data);
	}

	const new_contents = content_lines.join('\n');
	if (new_contents !== contents) {
		CeL.info(`${adapt_new_change.name}: Modify file for ${change_counts} line(s) changes: ${script_file_path}`);
		CeL.write_file(script_file_path, new_contents);
	}
}

async function modify_source_files() {
	if (false) {
		// manually for debug
		add_localization_marks(CeL.env.script_base_path + '../data/date.js');
		adapt_new_change(CeL.simplify_path(CeL.append_path_separator(CeL.env.script_base_path + '..')) + 'data/date.js', {
			source_base_path: CeL.simplify_path(CeL.append_path_separator(CeL.env.script_base_path + '..')),
			base_GitHub_path: "kanasimi/CeJS"
		});
	}

	const source_repositories = JSON.parse(CeL.read_file(CeL.env.script_base_path + 'source_repositories.json').toString());
	//console.log(source_repositories);

	for (let [source_base_path, source_data] of Object.entries(source_repositories)) {
		const base_GitHub_path = typeof source_data === 'object' ? source_data.base_GitHub_path : source_data;
		await new Promise((resolve, reject) => {
			source_base_path = CeL.simplify_path(CeL.append_path_separator(CeL.env.script_base_path + source_base_path));
			//console.trace(source_base_path);
			CeL.storage.traverse_file_system(source_base_path, fso_path => {
				if (/[\\\/](?:resources|tongwen)[\\\/]/.test(fso_path)) {
					// 跳過本地化語系檔本身。
					return;
				}

				// `${modify_source_files.name}: ${fso_path}`
				CeL.log_temporary(`${base_GitHub_path ? `[${base_GitHub_path}]` : ``}	${fso_path}	`);
				if (CeL.env.arg_hash.add_mark)
					add_localization_marks(fso_path);
				adapt_new_change(fso_path, {
					source_base_path,
					base_GitHub_path
				});
			}, {
				filter: /\.js$/i,
				callback: resolve
			});
		});
	}

	// 重新檢查所有 message_change 的原始檔。
	for (const [message_id, qqq_data] of qqq_data_Map.entries()) {
		if (qqq_data.need_to_recheck_all_sources) {
			delete qqq_data.need_to_recheck_all_sources;
			for (const [script_file_path, options] of qqq_data.references.script_file_path_hash.entries()) {
				adapt_new_change(script_file_path, options);
			}
		}
		delete qqq_data.references.script_file_path_hash;
	}
}


function adapt_message_id_changed_to_Map(map) {
	for (const [old_message_id, new_message_id] of message_id_changed.entries()) {
		if (!map.has(old_message_id))
			continue;
		if (map.has(new_message_id)) {
			throw new Error(`${adapt_message_id_changed_to_Map.name}: 已經有此 message id，無法更名: ${JSON.stringify(new_message_id)} ← ${JSON.stringify(old_message_id)}`);
		}
		map.set(new_message_id, map.get(old_message_id));
		map.delete(old_message_id);
	}
}

function adapt_message_id_changed_to_Object(object) {
	for (const [old_message_id, new_message_id] of message_id_changed.entries()) {
		if (!object.hasOwnProperty(old_message_id))
			continue;
		if (object.hasOwnProperty(new_message_id)) {
			throw new Error(`${adapt_message_id_changed_to_Object.name}: 已經有此 message id，無法更名: ${JSON.stringify(new_message_id)} ← ${JSON.stringify(old_message_id)}`);
		}
		object[new_message_id] = object[old_message_id];
		delete object[old_message_id];
	}
}

// qqq 展示順序。
const qqq_order = ['notes', 'demo', 'references'];
const qqq_order_Set = new Set(qqq_order.concat(['message', 'original_message_language_code', 'additional_notes']));

function write_qqq_data(resources_path) {
	const i18n_qqq_Object = i18n_message_id_to_message.qqq;
	adapt_message_id_changed_to_Object(i18n_qqq_Object);
	adapt_message_id_changed_to_Map(qqq_data_Map);
	let qqq_file_data = Object.create(null);
	let message_id_without_references = [];
	for (const [message_id, qqq_data] of qqq_data_Map.entries()) {
		qqq_file_data[message_id] = qqq_data;
		if (Array.isArray(qqq_data.references) && qqq_data.references.length > 0) {
			qqq_data.references = qqq_data.references.map(reference => reference.toString()).sort().join('\n: ');
		} else {
			message_id_without_references.push(message_id);
			if (false && !qqq_data.references) {
				CeL.warn(`${write_qqq_data.name}: 原始碼中無明確引用的訊息: [${message_id}] ${qqq_data.message}`);
			}
			//if (Array.isArray(qqq_data.references)) delete qqq_data.references;
		}

		if (!qqq_data.demo && qqq_data.references) {
			if (/era(?:_data)?\.(?:js|htm)/.test(qqq_data.references)) {
				qqq_data.demo = `[https://kanasimi.github.io/CeJS/_test%20suite/era.htm Era Calendar Converter]`;
			} else if (/work_crawler/.test(qqq_data.references)) {
				//qqq_data.demo = `{{GitHub|kanasimi/work_crawler}}`;
			}
		}

		const qqq_value = [];
		function add_value(property, value, index) {
			if (value ? (value = value.toString()) : value === 0)
				qqq_value.push(index === 0 ? value : `; ${property.toTitleCase()}: ${value}`);
		}
		qqq_order.forEach((property, index) => {
			add_value(property, qqq_data[property], index);
		});
		for (const [property, value] of Object.entries(qqq_data)) {
			if (qqq_order_Set.has(property))
				continue;
			add_value(property, value);
		}
		if (qqq_data.additional_notes)
			qqq_value.push(qqq_data.additional_notes);
		i18n_qqq_Object[message_id] = qqq_value.join('\n');
	}
	//console.trace(i18n_qqq_Object);
	CeL.write_file(resources_path + qqq_data_file_name, JSON.stringify(qqq_file_data, null, '\t'));
	// free
	//qqq_file_data = null;
	CeL.info(`${write_qqq_data.name}: 原始碼中無明確引用的訊息: ${message_id_without_references.length}/${qqq_data_Map.size}`);
	if (1 || CeL.is_debug()) {
		CeL.log(message_id_without_references
			.filter(message_id => !/^log-type-[a-z]+$/.test(message_id)
				&& !/^(?:download_options|work_data)\.[a-z_]+$/.test(message_id)
				&& !/^(?:toc)\.[a-z\-]+$/.test(message_id)
				&& !/^(?:work_status|error)-[a-z\-$\d]+$/.test(message_id)
			)
			.map(message_id => `[${message_id}]	${qqq_data_Map.get(message_id).message}`).join('\n'));
	}
}


function write_i18n_files(resources_path) {
	for (const [language_code, locale_data] of Object.entries(i18n_message_id_to_message)) {
		if (language_code !== 'qqq') {
			adapt_message_id_changed_to_Object(locale_data);
			// cmn-Hant-TW: -1
			const untranslated_message_count = Math.max(0, qqq_data_Map.size - Object.keys(locale_data).length);
			// FuzzyBot 必須為 {String}?
			// gettext_config:{"id":"untranslated-message-count"}
			locale_data[en_message_to_message_id('untranslated message count')] = String(untranslated_message_count);
			if (untranslated_message_count < 550) {
				const comments = untranslated_message_count < 20 ? '接近翻譯完畢的語言' : untranslated_message_count < 100 ? '翻譯得差不多的語言' : '可考慮列入選單的語言';
				CeL.info(`${write_i18n_files.name}: ${comments} (${untranslated_message_count}/${qqq_data_Map.size} 未翻譯): ${language_code}`);
			}
			// qqq was saved to `qqq_data_file_name` @ write_qqq_data()
			write_message_script_file({ resources_path, language_code, locale_data });
		}

		write_i18n_data_file({ language_code, locale_data });
	}
}

function escape_non_latin_chars(string) {
	return string.replace(/[^\x20-\x7F]/g, char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, 0));
}

function write_message_script_file({ resources_path, language_code, locale_data }) {
	const fso_path = resources_path + language_code + '.js';
	const locale_message_data = [];
	for (const [message_id, locale_message] of Object.entries(locale_data)) {
		if (message_id === '@metadata') continue;
		const qqq_data = qqq_data_Map.get(message_id);
		const key_mark = escape_non_latin_chars(JSON.stringify(qqq_data.message)) + ': ';
		if (/^function(?:\s|\()/.test(locale_message)) {
			const original_function = message_to_localized_mapping[language_code] && message_to_localized_mapping[language_code][qqq_data.message];
			if (function_to_message(original_function) === locale_message) {
				locale_message_data.push(key_mark + locale_message);
				continue;
			}
			CeL.error(`${write_message_script_file.name}: [${language_code}][${message_id}]: 原訊息與新函數不一致！您必須檢核此函數是否有安全疑慮，之後手動更改 [${fso_path}]！\n原	${original_function}\n新	${locale_message}`);
		}
		locale_message_data.push(key_mark + escape_non_latin_chars(JSON.stringify(locale_message)));
	}
	const new_contents = `/*	Localized messages of ${CeL.Class}.
	This file is auto created by auto-generate tool: ${library_build_script_name}(.js) @ ${datestamp.format('%Y-%2m-%2d' && '%Y')}.
*/'use strict';typeof CeL==='function'&&CeL.application.locale.gettext.set_text({
	${locale_message_data
			// The same as JSON.stringify(, null, '\t')
			.join(',\n\t')}
},
${JSON.stringify(language_code)});`;
	let original_contents = CeL.read_file(fso_path);
	if (!original_contents || (original_contents = original_contents.toString()) !== new_contents) {
		CeL.info(`${write_message_script_file.name}: Create new message script: ${fso_path}`);
		CeL.write_file(fso_path, new_contents);
	}
}

function data_to_i18n_contents(i18n_locale_data) {
	if (typeof i18n_locale_data === 'string')
		i18n_locale_data = JSON.parse(i18n_locale_data);
	return JSON.stringify(i18n_locale_data, null, '\t') + '\n'
}
function write_i18n_data_file({ language_code, locale_data }) {
	const i18n_language_code_data = i18n_language_code_data_mapping.get(language_code);
	//console.trace({ language_code, i18n_language_code_data });
	const fso_path = i18n_language_code_data.fso_path;
	//console.trace(i18n_language_code_data.fso_path);
	let original_contents = CeL.read_file(fso_path);
	if (original_contents)
		original_contents = data_to_i18n_contents(original_contents.toString());
	const new_contents = data_to_i18n_contents(locale_data);
	if (original_contents !== new_contents) {
		CeL.info(`${write_i18n_data_file.name}: Create new i18n data file: ${fso_path}`);
		CeL.write_file(fso_path, new_contents);
	}
}

// ---------------------------------------------------------------------//

(async () => {
	// main messages of CeJS library
	await build_locale_messages('application/locale/resources');

	/*
	build_main_script();

	update_package_file_version();
	*/
})();
