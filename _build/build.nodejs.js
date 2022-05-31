/**
 * @name CeJS builer
 * 
 * @fileoverview Tool to build CeJS library.
 * 
 * @since 2022/3/1 9:0:50
 */

/*

node build.nodejs.js add_mark generate_plural_rules

TODO:
Sorting message id by reference.
對於只有特定 repository 引用的訊息，依照 repository 分割到不同 .js。
測試原文語翻譯訊息首尾的標點符號是否相符。

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

	//node_fs.cpSync(backup_directory + library_main_script, library_main_script_file_path, { force: true });

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
	// CeL.fetch()
	'application.net.Ajax',
]);

/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
const NOT_FOUND = ''.indexOf('_');

if (!globalThis.fetch)
	globalThis.fetch = CeL.fetch;

const library_build_script_name = CeL.get_script_name() || 'library_build_script';
//const library_main_script_file_path = CeL.env.registry_path + library_main_script;
const library_main_script_file_path = library_base_directory + library_main_script;
// from utf16 big-endian: structure_content.swap16()
//console.log(require('fs').readFileSync(library_main_script_file_path).toString('utf16le'));


// matched: [ all, header, v1, v2, _v3, v3, footer ]
const PATTERN_version_stamp = /([\W]library_version[\s\n]*=[\s\n]*'v?)(\d+)\.(\d+)(\.(\d+))?(')/;
// matched: [ all, header, original stamp before ";" ]
const PATTERN_build_date_stamp = /([\W]build_date[\s\n]*=[\s\n]*)[^;]+/;

/**
 * build main script.
 */
function build_main_script() {
	const file_list = [main_structure_file];
	let library_main_script_content = CeL.read_file(library_base_directory + main_structure_file).toString();
	let new_build_version = CeL.version;
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

		// Increase version stamp.
		.replace(PATTERN_version_stamp,
			function (all, header, v1, v2, _v3, v3, footer) {
				// [ all, v1, v2, _v3, v3 ] major.minor.patch
				var matched = new_build_version.match(/^v?(\d+)\.(\d+)(\.(\d+))?$/);
				if (v1 === matched[1] && v2 === matched[2]) {
					// 自動增加 patch 版本號。
					v3 = +matched[4] + 1;
				} else {
					// 主要 major 版本號或 minor 版本號改變，重新設定 patch 版本號 v3 為 base.js 中的號碼。
					;
				}
				// reset new_build_version to new version.
				new_build_version = v1 + '.' + v2 + '.' + v3;
				return header + new_build_version + footer;
			})
		// Add time stamp.
		.replace(PATTERN_build_date_stamp, function ($0, $1) {
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
		if (CeL.read_file(library_main_script_file_path, 'auto').trim().replace(PATTERN_version_stamp, '$1$6').replace(PATTERN_build_date_stamp, '$1')
			=== library_main_script_content.trim().replace(PATTERN_version_stamp, '$1$6').replace(PATTERN_build_date_stamp, '$1')) {
			return;
		}
	} catch { }

	CeL.info(`${build_main_script.name}: Build new main script file: ${library_main_script_file_path}`);
	CeL.version = new_build_version;

	const backup_file_path = library_base_directory + backup_directory + library_main_script;
	CeL.remove_file(backup_file_path);
	CeL.move_file(library_main_script_file_path, backup_file_path);

	CeL.chmod(library_main_script_file_path, 0o600);
	CeL.write_file(library_main_script_file_path, library_main_script_content, CeL.env.source_encoding, { changed_only: true });
	CeL.chmod(library_main_script_file_path, 0o400);
}

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
	CeL.write_file(package_file_path, package_file_content, { changed_only: true });
}

// ---------------------------------------------------------------------//

// message_to_localized_mapping['en-US'] = {"Original language message 原文訊息 in source":"localized message"}
const message_to_localized_mapping = Object.create(null);
// i18n_message_id_to_message['en-US'] = {"message_id":"localized message"}
const i18n_message_id_to_message = Object.create(null);
const qqq_data_file_name = 'qqq_data.json';
// qqq_data.get('message_id') = {message: "Original language message 原文訊息 in source", original_message_language_code: 'en-US|cmn-Hant-TW', notes: "notes", scope: "source/", demo: "demo URL / application of the message", additional_notes: "additional notes"}
const qqq_data_Map = new Map;
let message_to_id_Map = new Map;
/** message_changed.get(from message) = to message */
const message_changed = new Map;
/** message_id_changed.get(from message id) = to message id */
const message_id_changed = new Map;

const PATTERN_has_invalid_en_message_char = /[^\x20-\xfe\s–←↑→≠🆔😘➕]/;


const gettext_plural_rules__file_name = 'gettext_plural_rules.js';
async function get_gettext_plural_rules(resources_path) {
	let rule_contents = await fetch('https://raw.githubusercontent.com/wikimedia/mediawiki-extensions-Translate/master/data/plural-gettext.txt');
	rule_contents = await rule_contents.text();
	rule_contents = rule_contents.trim().split('\n');
	//console.trace(rule_contents);
	const gettext_plural_rules = Object.create(null);
	for (const line of rule_contents) {
		const matched = line.match(/^([a-z\-]+)\tnplurals=(\d+); plural=(.+);$/);
		if (!matched)
			CeL.error(`${get_gettext_plural_rules.name}: Cannot parse: ${line}`);
		//console.log(matched.slice(1));
		matched[2] = +matched[2];
		gettext_plural_rules[matched[1]] = [
			matched[2],
			// assert: (+true===1 && +false===0) @ all platform
			matched[2] === 1 && CeL.is_digits(matched[3]) ? +matched[3]
				: matched[2] === 2 ? `function(n){return +${/^\([^()]+\)$/.test(matched[3]) ? matched[3] : `(${matched[3]})`};}`
					: `function(n){return ${matched[3]};}`,
		];
	}
	//console.trace(gettext_plural_rules);

	const new_contents = `/*	gettext plural rules of ${CeL.Class}.
	This file is auto created by auto-generate tool: ${library_build_script_name}(.js) @ ${datestamp.format('%Y-%2m-%2d' && '%Y')}.
*/'use strict';typeof CeL==='function'&&CeL.application.locale.gettext.set_plural_rules({
	${Object.entries(gettext_plural_rules).map(([language_code, rule]) => {
		return `${/^[a-z]+$/.test(language_code) ? language_code : `"${language_code}"`}: [${rule.join(', ')}]`;
	}).join(',\n	')}
});
`;
	const fso_path = resources_path + gettext_plural_rules__file_name;
	if (!CeL.write_file(fso_path, new_contents, { changed_only: true })) {
		CeL.warn(`${get_gettext_plural_rules.name}: Create new gettext plural rules script: ${fso_path}`);
	}
}


function en_message_to_message_id(en_message) {
	var message_id = en_message.trim();
	if (/\{\{PLURAL:/.test(message_id)) {
		// Remove {{PLURAL:...}}
		message_id = CeL.gettext(message_id);
	}
	message_id = message_id
		.replace(/🆔/g, 'ID')
		.replace(/[,;:.?!~]+$/, '')
		.replace(/[:,;'"|\s\[\]\\\/#]+/g, '-')
		.replace(/[\-\s]+$|^[\-\s]+/g, '')
		.replace(/^[.\-]+/, '')
		.replace(/–|-{2,}/g, '-')
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

	if (CeL.env.arg_hash?.generate_plural_rules)
		await get_gettext_plural_rules(resources_path);

	load_previous_qqq_data(resources_path);

	await new Promise((resolve, reject) => {
		load_message_to_localized(resources_path, resolve);
	});

	if (false) {
		// 不可再用: 一次性匯入 Localized messages in 紀年轉換工具。不再使用。
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

	const message_id_order = write_qqq_data(resources_path);

	write_i18n_files(resources_path, message_id_order);
	CeL.log(`${build_locale_messages.name}: ${new Date().format()} Done.`);
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
		// .projects
		delete qqq_data.repositories;
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
				CeL.error(`${load_CSV_message_to_localized.name}: 設定相異的本地化翻譯於 ${resource_file_path}`);
				CeL.warn(CeL.display_align([
					[nmessage + '\t', JSON.stringify(message)],
					['原本的\t', `${JSON.stringify(local_message)}	[${language_code}]`],
					['新→\t', typeof local_message_of_CSV === 'string' ? JSON.stringify(local_message_of_CSV) : local_message_of_CSV]
				]));
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
		if (!contents) {
			// Not [IETF language tag].js
			return;
		}
		let locale_data;
		try {
			locale_data = JSON.parse(contents);
		} catch (e) {
			//CeL.warn(`${load_message_to_localized.name}: There are functions in the locale? ${fso_path}`);
			try {
				eval('locale_data = ' + contents);
				//console.log(contents);
			} catch (e) {
				//console.trace(JSON.stringify(contents));
				CeL.error(`${load_message_to_localized.name}: 無法解析在地化訊息檔案: ${fso_path}`);
				console.error(e);
			}
		}

		if (!locale_data)
			return;

		if (false) {
			// 一次性訊息修正。不再使用。
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

/** {Set}在新的 qqq_data 未設定這些屬性時，不覆蓋舊的。 */
const do_not_overwrite_null_properities = new Set(['message', 'notes']);

/**
 * 解析 qqq 字串成為 qqq_data。
 * @param {String} qqq 
 * @returns {Object} qqq_data
 */
function parse_qqq(qqq) {
	const qqq_data = {
		message: null,
		notes: null,
		// Referenced by, Occurrences
		references: [],
		repositories: [],
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
		} else if (property !== 'references' && property !== 'repositories') {
			// 警告: 每次 .references, .repositories 都會在 adapt_new_change_to_source_file() 中被重新設定!
			CeL.warn(`${parse_qqq.name}: Skip duplicate property name: ${property}=${value}`);
		}
		notes = notes.slice(0, matched.index);
	}
	qqq_data.notes = notes;
	if (additional_notes.length > 0)
		qqq_data.additional_notes = additional_notes.join('\n');

	return qqq_data;
}

/** 優先搜尋的語言代碼 */
const language_code_priority = ['cmn-Hant-TW', 'en-US'];
function find_message_in_i18n(message_id) {
	function try_language_code(language_code) {
		const locale_data = i18n_message_id_to_message[language_code];
		const message = locale_data && locale_data[message_id];
		if (message) {
			const qqq_data = qqq_data_Map.get(message_id);
			qqq_data.message = message;
			qqq_data.original_message_language_code = language_code;
			return message;
		}
	}

	for (const language_code of language_code_priority) {
		const message = try_language_code(language_code);
		if (message) return message;
	}

	for (const language_code of Object.keys(i18n_message_id_to_message)) {
		const message = try_language_code(language_code);
		if (message) return message;
	}
}

function function_to_message(function_message) {
	return String(function_message).replace(/\\u([\da-f]{4})/g, (all_char, char_code) => String.fromCharCode(parseInt(char_code, 16)));
}

function log_message_changed(message_id) {
	const qqq_data = qqq_data_Map.get(message_id);
	//console.log([message_id, qqq_data]);
	const message = qqq_data.message || find_message_in_i18n(message_id);
	if (!message) {
		CeL.error(`${log_message_changed.name}: No message get for message id: ${message_id}`);
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
			// Set new localized message to i18n.json.
			// e.g., get from load_CSV_message_to_localized()
			locale_data[message_id] = from_localized_message;
			continue;
		}

		const stringified__from_localized_message = typeof from_localized_message === 'function' ? function_to_message(from_localized_message) : from_localized_message;
		if (stringified__from_localized_message === to_localized_message
			|| stringified__from_localized_message === convert_plain_header_tail(to_localized_message))
			continue;
		CeL.info(`${log_message_changed.name}: ${message}`);
		CeL.log(CeL.display_align([
			[language_code + '\t', stringified__from_localized_message],
			['→\t', to_localized_message]
		]));
		if (typeof from_localized_message !== 'function') {
			message_changed.set(from_localized_message, to_localized_message);
			if (from_localized_message === qqq_data.message)
				qqq_data.message = to_localized_message;
		}
	}
}

function set_qqq_data(message_id, qqq, options) {
	if (!qqq || typeof qqq !== 'string')
		return;

	let qqq_data = parse_qqq(qqq);
	const old_qqq_data = qqq_data_Map.get(message_id);
	if (old_qqq_data) {
		console.assert(CeL.is_Object(old_qqq_data));
		// qqq_data.references 應該在 adapt_new_change_to_source_file() 設定。
		delete qqq_data.references;
		delete qqq_data.repositories;
		// Copy new properties from new qqq_data.
		for (const property_name of Object.keys(qqq_data)) {
			if ((qqq_data[property_name] || qqq_data[property_name] === 0
				|| old_qqq_data.hasOwnProperty(property_name) && !do_not_overwrite_null_properities.has(property_name))
				&& old_qqq_data[property_name] !== qqq_data[property_name]) {
				if (options?.show_change_message && old_qqq_data[property_name] !== undefined) {
					CeL.info(`${set_qqq_data.name}: Set [${message_id}].${JSON.stringify(property_name)}:`);
					CeL.log(CeL.display_align([
						['原\t', old_qqq_data[property_name]],
						['新→\t', qqq_data[property_name]]
					]));
				}
				old_qqq_data[property_name] = qqq_data[property_name];
			}
		}
		qqq_data = old_qqq_data;
	} else {
		CeL.warn(`${set_qqq_data.name}: New message id in i18n: ${message_id}`);
		qqq_data_Map.set(message_id, qqq_data);
	}
	return qqq_data;
}

function create__qqq_data_Map() {
	for (const [message_id, qqq] of Object.entries(i18n_message_id_to_message.qqq)) {
		const qqq_data = set_qqq_data(message_id, qqq);
		if (qqq_data) {
			// reset qqq_data.references: 捨棄舊的 .references 資訊，將在 adapt_new_change_to_source_file() 重新設定。
			delete qqq_data.references;
			delete qqq_data.repositories;
		}
	}

	const old_message_to_id_Map = new Map;
	for (const [message_id, qqq_data] of qqq_data_Map.entries()) {
		if (qqq_data.message)
			old_message_to_id_Map.set(qqq_data.message, message_id);
	}

	//console.trace(Array.from(message_to_id_Map.keys()));
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
			// 一次性訊息修正。不再使用。
			// gettext_config:{"id":"french-republican-calendar"}
			if (message === 'Calendrier républicain')
				en_message = 'French Republican Calendar';
		}
		//console.log([message, en_message]);
		const message_id =
			// e.g., message id: "log-type-error"
			qqq_data_Map.has(message) ? message
				// e.g., message id: "some-$2-paths-specified-by-$1-do-not-exist-$3"
				: old_message_to_id_Map.has(message) ? old_message_to_id_Map.get(message)
					// e.g., some new messages
					: qqq_data_Map.has(en_message_to_message_id(message)) ? en_message_to_message_id(message)
						: en_message_to_message_id(en_message);
		let qqq_data = qqq_data_Map.get(message_id);
		//if (message === '作者') { console.trace({ message, message_id, qqq_data }); throw 456465; }
		if (!qqq_data && message_to_localized_mapping.qqq && (qqq_data = set_qqq_data(message_id, message_to_localized_mapping.qqq[message], { show_change_message: true }))) {
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
			// matched: [ all, header punctuation mark, text_id / message, tail punctuation mark ]
			const matched = message.match(CeL.gettext.PATTERN_message_with_tail_punctuation_mark);
			if (!matched || qqq_data.message !== matched[2]) {
				// (references: ${qqq_data.references})
				CeL.info(`${create__qqq_data_Map.name}: Original language message 原文訊息 changed in translatewiki:`);
				CeL.log(CeL.display_align([
					['id\t', message_id],
					['原\t', qqq_data.message],
					['新→\t', message]
				]));
				message_changed.set(qqq_data.message, message);
				message_to_id_Map.set(qqq_data.message, message_id);
				qqq_data.message = message;
				delete qqq_data.original_message_language_code;
			}
		} else if (!qqq_data.message_is_id) {
			// assert: qqq_data.message === message
			// 一次性執行的特殊情況: 之前更新了 ISO 639-1 language tag.json 與 IETF language tag.js，卻沒更新 qqq_data.json 與原始碼。
			const locale_data = i18n_message_id_to_message[qqq_data.original_message_language_code];
			const i18n_message = locale_data && locale_data[message_id];
			if (i18n_message && i18n_message !== message && i18n_message.covers(message)) {
				CeL.warn(`${create__qqq_data_Map.name}: 可能忘了更新原始碼訊息？若有需要請手動更新：`);
				CeL.log(CeL.display_align([
					['id\t', message_id],
					['原始碼\t', JSON.stringify(message)],
					['i18n→\t', JSON.stringify(i18n_message)]
				]));
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
			if (!message_language_code && !PATTERN_has_invalid_en_message_char.test(qqq_data.message))
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
	return `{{GitHub|${encodeURI(`${this.base_GitHub_path}/blob/master/${this.script_file_path.slice(CeL.append_path_separator(this.source_base_path).length).replace(/\\/g, '/')}`)}${this.line_index >= 0 ? `#L${this.line_index + 1}` : ''}}}`;
};

function set_references({ qqq_data, script_file_path, options, line_index }) {
	if (!Array.isArray(qqq_data.references))
		qqq_data.references = qqq_data.references ? [qqq_data.references] : [];
	if (!Array.isArray(qqq_data.repositories))
		qqq_data.repositories = qqq_data.repositories ? [qqq_data.repositories] : [];
	if (!qqq_data.references.script_file_path_hash)
		qqq_data.references.script_file_path_hash = new Map;

	const { base_GitHub_path, source_base_path } = options;
	if (base_GitHub_path) {
		console.assert(script_file_path.startsWith(CeL.append_path_separator(source_base_path)), [source_base_path, script_file_path]);
		// TODO: https://web.dev/text-fragments/
		qqq_data.references.push(new GitHub_link({
			...options,
			script_file_path,
			line_index,
		}));
		qqq_data.references.script_file_path_hash.set(script_file_path, options);
		qqq_data.repositories.push(base_GitHub_path);
	}
}

// matched: [ partly tag, attribute, message ]
const PATTERN_gettext_message_of_tag = /<[a-z\d]+\s[^<>]*(?<=\s)(title|data-gettext)="([^<>"]+)"/g;
function record_HTML_references(/*HTML_file_path*/script_file_path, options) {
	const contents = CeL.read_file(script_file_path).toString();
	let matched;
	while (matched = PATTERN_gettext_message_of_tag.exec(contents)) {
		const message = matched[2];
		const message_id = message_to_id_Map.get(message);
		if (!message_id) {
			if (matched[1] === 'data-gettext')
				CeL.warn(`${record_HTML_references.name}: No message id get for message: ${JSON.stringify(message)}\n	File: ${script_file_path}`);
			continue;
		}
		const qqq_data = qqq_data_Map.get(message_id);
		set_references({ qqq_data, script_file_path, options });
	}
}

function adapt_new_change_to_source_file(script_file_path, options) {
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
			CeL.error(`${adapt_new_change_to_source_file.name}: Invalid gettext_config: ${gettext_config_matched[2]}`);
			continue;
		}
		//console.trace(gettext_config_matched.slice(1));

		if (gettext_config.mark_type === 'combination_message_id'
			//|| gettext_config.mark_type === 'next_non-comment-line'
			// 字串的一部分 部分的字串
			|| gettext_config.mark_type === 'part_of_string') {
			/**
			 * 添加訊息的方法: 特殊型態標記: 將下一非註解的行當作標的，並且不檢查內容。必須自己到 qqq.json 編寫 qqq!
			 * e.g., 組合型 message id <code>

			插入 // gettext_config:{"id":"message_id_1","mark_type":"combination_message_id"}
			插入 // gettext_config:{"id":"message_id_2","mark_type":"combination_message_id"}
			gettext(prefix + 'message_id_type' + postfix);

			插入 // gettext_config:{"id":"message_id","mark_type":"part_of_string"}
			'...|msg=message|...'.split('|');

			</code> */
			let qqq_data = qqq_data_Map.get(gettext_config.id);
			if (!qqq_data) {
				CeL.error(`${adapt_new_change_to_source_file.name}: 特殊型態標記 message id 無 qqq data: ${JSON.stringify(gettext_config.id)}`);
				continue;
			}

			for (let _line_index = line_index; _line_index < content_lines.length; _line_index++) {
				if (!/^\s*\/\//.test(content_lines[_line_index])) {
					set_references({ qqq_data, script_file_path, options, line_index: _line_index });
					break;
				}
			}
			continue;
		}

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
			CeL.error(`${adapt_new_change_to_source_file.name}: No message get for gettext_config: ${gettext_config_matched[2]}\n	File: ${script_file_path}\n	[${line_index}] ${message_line}`);
		}

		try {
			message = JSON.parse('"' + message + '"');
		} catch {
			CeL.error(`${adapt_new_change_to_source_file.name}: Invalid message "${message_line}" for gettext_config: ${gettext_config_matched[2]}`);
			continue;
		}

		let message_id = message_to_id_Map.get(message)
			// 嘗試去掉標點符號之後找不找得到 message。
			|| message_to_id_Map.get(CeL.trim_punctuation_marks(message));
		if (!message_id && !gettext_config.id && (gettext_config.en || !PATTERN_has_invalid_en_message_char.test(message))) {
			/**
			 * 添加訊息的方法: 直接把 message 當英文訊息。
			 * e.g., <code>

			插入 // gettext_config:{"qqq":""}
			插入 // gettext_config:{"qqq":"","zh-tw":"","ja":""}
			gettext('English message');

			插入 // gettext_config:{"en":"English message","qqq":""}
			gettext('Original language message 原文訊息');

			</code> */
			gettext_config.id = en_message_to_message_id(gettext_config.en || message);
			if (PATTERN_has_invalid_en_message_char.test(gettext_config.id)) {
				CeL.warn(`${adapt_new_change_to_source_file.name}: 自動生成的ID包含非英語字元: ${JSON.stringify(gettext_config.id)}`);
			}
		}
		let qqq_data;
		if (message_id) {
			qqq_data = qqq_data_Map.get(message_id);

		} else if (!(message_id = gettext_config.id)) {
			throw new Error(`${adapt_new_change_to_source_file.name}: [${script_file_path}] 原始碼中新增了 message，但未設定且無法自動判別 message id: ${JSON.stringify(message)}`);

		} else if (qqq_data = qqq_data_Map.get(message_id)) {
			if (message_changed.has(qqq_data.message)) {
				if (message_changed.get(qqq_data.message) !== message) {
					throw new Error(`${adapt_new_change_to_source_file.name}: message 衝突:\n原 message	${JSON.stringify(qqq_data.message)}\n→ i18n或其他原始碼中的 message:	${JSON.stringify(message_changed.get(qqq_data.message))}\n→ [${script_file_path}] 原始碼中的 message:${JSON.stringify(message)}`);
				}

			} else if (qqq_data.message !== message
				// e.g., 新訊息遇到 'Does not exist: ' 但原先已有 'Does not exist'
				&& qqq_data.message !== CeL.trim_punctuation_marks(message)) {
				let new_message_language_code = CeL.encoding.guess_text_language(message);
				if (!new_message_language_code && !PATTERN_has_invalid_en_message_char.test(message)) {
					new_message_language_code = 'en-US';
					CeL.warn(`${adapt_new_change_to_source_file.name}: 無法判別 message 之語言，當作 ${new_message_language_code}:\n[${message_id}] ${JSON.stringify(message)}`);
				}
				if (new_message_language_code && new_message_language_code !== qqq_data.original_message_language_code) {
					const locale_data = i18n_message_id_to_message[new_message_language_code];
					const message_changed = !locale_data || locale_data[message_id] !== message;
					CeL.warn(`${adapt_new_change_to_source_file.name}: 改變了[${script_file_path}] ${message_changed ? '原始碼中的訊息以及語言' : '原始碼中訊息的語言'}:`);
					CeL.log(CeL.display_align([
						['id\t', JSON.stringify(message_id)],
						['原訊息\t', `[${qqq_data.original_message_language_code}] ${message_changed ? JSON.stringify(qqq_data.message) + ` ([${new_message_language_code}] ${locale_data[message_id]})` : ''}`],
						['新→\t', `[${new_message_language_code}] ${message_changed ? JSON.stringify(message) : ''}`]
					]));
					qqq_data.original_message_language_code = new_message_language_code;
				} else {
					CeL.info(`${adapt_new_change_to_source_file.name}: 改變了[${script_file_path}] 原始碼中的 message:`);
					CeL.log(CeL.display_align([
						['id\t', JSON.stringify(message_id)],
						['原訊息\t', JSON.stringify(qqq_data.message)],
						['新→\t', JSON.stringify(message)]
					]));
				}
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
			CeL.info(`${adapt_new_change_to_source_file.name}: [${script_file_path}] 原始碼中新增了 message: [${message_id}] ${JSON.stringify(message)}`);
			// assert: !!message_id === true
			if (!gettext_config.en) {
				message_id = en_message_to_message_id(message_id);
			}
			let language_code = CeL.encoding.guess_text_language(message);
			qqq_data = {
				message,
				original_message_language_code: language_code || 'en-US'
			};

			if (gettext_config.id === message_id) {
				if (!language_code) {
					if (PATTERN_has_invalid_en_message_char.test(message)) {
						CeL.error(`${adapt_new_change_to_source_file.name}: 無法判別 message 之語言!\n[${message_id}] ${JSON.stringify(message)}`);
					} else {
						language_code = 'en-US';
						CeL.warn(`${adapt_new_change_to_source_file.name}: 無法判別 message 之語言，當作 ${language_code}:\n[${message_id}] ${JSON.stringify(message)}`);
					}
				}
				if (language_code === 'en-US') {
					/**
					 * 添加訊息的方法: 直接把 Original language message 原文訊息當英文訊息。
					 * e.g., <code>

					插入 // gettext_config:{"id":"message-id","qqq":"","zh-tw":"","ja":""}
					插入 // gettext_config:{"id":"message-id","qqq":""}
					gettext('English message');

					</code> */
					i18n_message_id_to_message['en-US'][message_id] = message;
				} else {
					if (!gettext_config.en) {
						CeL.error(`${adapt_new_change_to_source_file.name}: 原始碼中新增了非 en-US 之 message 卻未提供${CeL.gettext.get_alias('en-US')}訊息! 這會造成無法匯入 translatewiki! ${JSON.stringify(message)}`);
					}
					if (i18n_message_id_to_message[language_code])
						i18n_message_id_to_message[language_code][message_id] = message;
					qqq_data.original_message_language_code = language_code;
				}

			} else {
				/**
				 * 添加訊息的方法: 直接把 message_id 當英文訊息。
				 * e.g., <code>

				插入 // gettext_config:{"id":"English message","qqq":""}
				gettext('Original language message 原文訊息');

				</code> */
				if (!language_code) {
					CeL.warn(`${adapt_new_change_to_source_file.name}: 無法判別 message 之語言! ${JSON.stringify(message)}`);
				} else if (language_code === 'en-US') {
					if (message !== gettext_config.id)
						CeL.error(`${adapt_new_change_to_source_file.name}: 判別 message 與 message id 同為 en-US 但兩者不同!\n	${JSON.stringify(message)}\n	${JSON.stringify(gettext_config.id)}`);
				} else {
					let locale_data = i18n_message_id_to_message[language_code];
					if (!locale_data) {
						CeL.info(`${adapt_new_change_to_source_file.name}: New language code of i18n: ${language_code}`);
						locale_data = i18n_message_id_to_message[language_code] = Object.create(null);
					}
					locale_data[message_id] = message;
				}
				i18n_message_id_to_message['en-US'][message_id] = gettext_config.id;
				gettext_config.id = message_id;
			}

			qqq_data_Map.set(message_id, qqq_data);
		}

		//console.trace([message, gettext_config, qqq_data_Map.get(message_id)]);
		for (const [property_name, value] of Object.entries(gettext_config)) {
			switch (property_name) {
				case 'id':
					if (!value || message_id === value) {
						continue;
					}
					if (message_id_changed.has(message_id)) {
						if (message_id_changed.get(message_id) !== value) {
							throw new Error(`${adapt_new_change_to_source_file.name}: message id 衝突:\n原 message	id ${JSON.stringify(message_id)}\n→ 其他原始碼中的 message id:	${JSON.stringify(message_id_changed.get(message_id))}\n→ [${script_file_path}] 原始碼中的 message:${JSON.stringify(value)}`);
						}

					} else {
						CeL.info(`${adapt_new_change_to_source_file.name}: [${script_file_path}] 原始碼中改變了 message id:`);
						CeL.log(CeL.display_align([
							['原\t', JSON.stringify(message_id)],
							['新→\t', JSON.stringify(value)]
						]));
						message_id_changed.set(message_id, value);
						qqq_data.need_to_recheck_all_sources = true;
						// 當原始碼中改變 message id 時，不會一同變更 qqq_data_Map, message_to_id_Map, i18n_message_id_to_message。唯一只會紀錄於 message_id_changed。
						//qqq_data_Map.set(value, qqq_data);
						//qqq_data_Map.delete(message_id);
						//message_id = value;
					}
					continue;

				case 'qqq':
					if (value) {
						const qqq = /^%\d:/.test(value) ? '; Parameters: ' + value : value;
						set_qqq_data(message_id, qqq, { show_change_message: true });
					}
					continue;
			}

			if (/^[a-z]{2}(-[a-z]{2})?$/.test(property_name)) {
				const language_code = CeL.gettext.to_standard(property_name);
				if (language_code) {
					// assert: CeL.is_Object(i18n_message_id_to_message[language_code])
					if (!value) {
						if (i18n_message_id_to_message['en-US'][message_id])
							continue;
						CeL.warn(`${adapt_new_change_to_source_file.name}: 設定 [${language_code}].[${message_id}] 為空字串。`);
					}

					const old_value = i18n_message_id_to_message[language_code][message_id];
					if ((old_value/* || old_value === 0*/) && old_value !== value) {
						CeL.info(`${adapt_new_change_to_source_file.name}: [${script_file_path}] 原始碼中改變了 [${message_id}] 的 ${language_code} 訊息:`);
						CeL.log(CeL.display_align([
							['原\t', JSON.stringify(old_value)],
							['新→\t', JSON.stringify(value)]
						]));
					}
					i18n_message_id_to_message[language_code][message_id] = value;
					continue;
				}
			}

			const old_value = qqq_data[property_name];
			if (old_value || old_value === 0) {
				CeL.info(`${adapt_new_change_to_source_file.name}: [${script_file_path}] 原始碼中改變了 [${message_id}].${JSON.stringify(property_name)}:`);
				CeL.log(CeL.display_align([
					['原\t', JSON.stringify(old_value)],
					['新→\t', JSON.stringify(value)]
				]));
			}
			qqq_data[property_name] = value;
		}

		if (message_id_changed.has(message_id))
			message_id = message_id_changed.get(message_id);

		set_references({ qqq_data, script_file_path, options, line_index });

		content_lines[line_index - 1] = gettext_config_matched[1] + JSON.stringify({
			// 原始碼中僅留存 message id，其他全部移到 qqq_data。
			id: message_id
		}) + gettext_config_matched[3];
		if (gettext_config_line !== content_lines[line_index - 1]) change_counts++;

		if (message_changed.has(message)) {
			const new_message = message_changed.get(message);
			CeL.info(`${adapt_new_change_to_source_file.name}: [${script_file_path}] 更新原始碼中的訊息: [${message_id}]:`);
			CeL.log(CeL.display_align([
				['原\t', JSON.stringify(message)],
				['新→\t', JSON.stringify(new_message)]
			]));
			message = new_message;
		}
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
		CeL.info(`${adapt_new_change_to_source_file.name}: Modify file for ${change_counts} line(s) changes: ${script_file_path}`);
		CeL.write_file(script_file_path, new_contents);
	}
}

async function modify_source_files() {
	if (false) {
		// manually for debug
		add_localization_marks(CeL.env.script_base_path + '../data/date.js');
		adapt_new_change_to_source_file(CeL.simplify_path(CeL.append_path_separator(CeL.env.script_base_path + '..')) + 'data/date.js', {
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
				if (/[\\\/](?:resources|encoding\.training|tongwen)/.test(fso_path)) {
					// 跳過本地化語系檔本身。
					return;
				}

				// `${modify_source_files.name}: ${fso_path}`
				CeL.log_temporary(`${base_GitHub_path ? `[${base_GitHub_path}]` : ``}	${fso_path}	`);
				const _options = {
					source_base_path,
					base_GitHub_path
				};
				if (/\.html?/i.test(fso_path)) {
					record_HTML_references(fso_path, _options);
					return;
				}
				if (CeL.env.arg_hash?.add_mark)
					add_localization_marks(fso_path);
				adapt_new_change_to_source_file(fso_path, _options);
			}, {
				filter: /\.(js|html?)$/i,
				callback: resolve
			});
		});
	}

	// 重新檢查所有 message_change 的原始檔。
	for (const [message_id, qqq_data] of qqq_data_Map.entries()) {
		if (qqq_data.need_to_recheck_all_sources) {
			delete qqq_data.need_to_recheck_all_sources;
			for (const [script_file_path, options] of qqq_data.references.script_file_path_hash.entries()) {
				adapt_new_change_to_source_file(script_file_path, options);
			}
		}
		delete qqq_data.references?.script_file_path_hash;
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
const qqq_order = ['notes', 'parameters', 'demo', 'repositories', 'references'];
const qqq_order_Set = new Set(qqq_order.concat(['message', 'original_message_language_code', 'additional_notes']));
const qqq_ignore_attributes_Set = new Set(['message_is_id']);

function sort_Object_by_order(object, key_order) {
	if (!key_order)
		return object;

	const sorted_object = Object.create(null);
	const key_Set = new Set(Object.keys(object));
	key_order.forEach(key => {
		if (key_Set.has(key)) {
			key_Set.delete(key);
			sorted_object[key] = object[key];
		}
	});

	const keys_left = Array.from(key_Set.keys()).sort();
	keys_left.forEach(key => sorted_object[key] = object[key]);
	return sorted_object;
}

function write_qqq_data(resources_path) {
	const i18n_qqq_Object = i18n_message_id_to_message.qqq;
	adapt_message_id_changed_to_Object(i18n_qqq_Object);
	adapt_message_id_changed_to_Map(qqq_data_Map);
	let qqq_file_data = Object.create(null);
	let message_id_without_references = [];
	for (const [message_id, qqq_data] of qqq_data_Map.entries()) {
		const original_message_locale_data = i18n_message_id_to_message[qqq_data.original_message_language_code];
		if (original_message_locale_data && !original_message_locale_data[message_id]) {
			CeL.info(`${write_qqq_data.name}: 填補原語言 [${qqq_data.original_message_language_code}] 之訊息 [${message_id}] ${qqq_data.message}`);
			original_message_locale_data[message_id] = qqq_data.message;
		}

		qqq_file_data[message_id] = qqq_data;
		if (Array.isArray(qqq_data.references) && qqq_data.references.length > 0) {
			qqq_data.references = qqq_data.references
				.map(reference => reference.toString())
				.sort().unique().join('\n: ');
		} else {
			message_id_without_references.push(message_id);
			if (false && !qqq_data.references) {
				CeL.warn(`${write_qqq_data.name}: 原始碼中無明確引用的訊息: [${message_id}] ${qqq_data.message}`);
			}
			//if (Array.isArray(qqq_data.references)) delete qqq_data.references;
		}
		if (Array.isArray(qqq_data.repositories) && qqq_data.repositories.length > 0) {
			qqq_data.repositories = qqq_data.repositories.sort().unique();
			if (qqq_data.repositories.length === 1) {
				// TODO: 對於只有特定 repository 引用的訊息，依照 repository 分割到不同 .js。 
			}
			qqq_data.repositories = qqq_data.repositories
				.map(repository => {
					const repository_name = repository.match(/[^/]+$/)[0];
					// [[Category:CeJS-repository-${repository_name}]]
					return `{{GitHub|${repository}|${repository_name}|link=hidden}}`;
				})
				.join(', ');
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
			if (qqq_order_Set.has(property) || qqq_ignore_attributes_Set.has(property))
				continue;
			add_value(property, value);
		}
		if (qqq_data.additional_notes)
			qqq_value.push(qqq_data.additional_notes);
		i18n_qqq_Object[message_id] = qqq_value.join('\n');
	}
	//console.trace(i18n_qqq_Object);

	const message_id_order = Array.from(qqq_data_Map.keys())
		// 依照 References → message id 排序 message id。
		.sort((_1, _2) => CeL.general_ascending(qqq_data_Map.get(_1)?.references, qqq_data_Map.get(_2)?.references)
			|| CeL.general_ascending(_1, _2));
	// 把 metadata 放在最前面。
	message_id_order.unshift("@metadata");
	//console.trace(message_id_order.slice(-5));

	let original_contents = CeL.read_file(resources_path + qqq_data_file_name);
	const new_contents = JSON.stringify(sort_Object_by_order(qqq_file_data, message_id_order), null, '\t') + '\n';
	if (!original_contents || (original_contents = original_contents.toString()) !== new_contents) {
		const fso_path = resources_path + qqq_data_file_name;
		CeL.info(`${write_qqq_data.name}: Create new qqq data cache: ${fso_path}`);
		CeL.write_file(fso_path, new_contents);
	}

	// free
	//qqq_file_data = null;
	if (message_id_without_references.length > 0) {
		CeL.info(`${write_qqq_data.name}: 原始碼中無明確引用的訊息: ${message_id_without_references.length}/${qqq_data_Map.size}`);
		CeL.log(message_id_without_references.map(message_id => {
			const message = qqq_data_Map.get(message_id).message;
			return message_id === message ? message : `[${message_id}]	${message}`;
		}).join('\n'));
	}

	return message_id_order;
}


function write_i18n_files(resources_path, message_id_order) {
	for (const [language_code, locale_data] of Object.entries(i18n_message_id_to_message)) {
		if (language_code !== 'qqq') {
			adapt_message_id_changed_to_Object(locale_data);

			// cmn-Hant-TW: -1
			const untranslated_message_count = Math.max(0, qqq_data_Map.size - Object.keys(locale_data).length);
			const untranslated_ratio = untranslated_message_count / qqq_data_Map.size;
			const number_digits = Math.floor(Math.log10(untranslated_message_count));
			const number_base = 10 ** number_digits;
			// gettext_config:{"id":"untranslated-message-count"}
			locale_data[en_message_to_message_id('untranslated message count')] =
				// String(): FuzzyBot 必須為 {String}?
				number_base < 1 ? String(untranslated_message_count)
					// 減少變更次數: 以數字位數為單位變更。
					: Math.floor(untranslated_message_count / number_base) + '0'.repeat(number_digits) + '+';
			if (untranslated_message_count < 500 || untranslated_ratio < .3) {
				const comments = untranslated_message_count < 20 && untranslated_ratio < .01 ? '幾近翻譯完畢的語言'
					: untranslated_message_count < 100 && untranslated_ratio < .05 ? '翻譯得快完成的語言'
						: '可考慮列入選單的語言';
				CeL.info(`${write_i18n_files.name}: ${comments} (${untranslated_message_count}/${qqq_data_Map.size} 未翻譯): ${language_code}`);
			}

			// qqq was saved to `qqq_data_file_name` @ write_qqq_data()
			write_message_script_file({ resources_path, language_code, locale_data, message_id_order });
		}

		write_i18n_data_file({ language_code, locale_data, message_id_order });
	}
}

// https://translatewiki.net/wiki/MediaWiki:Comma-separator/qqq
function convert_plain_message(message) {
	if (typeof message !== 'string' /*|| !/&#32;|&nbsp;|&#160;$/.test(message)*/) {
		return message;
	}
	return message.replace(/&#32;/g, ' ').replace(/&nbsp;|&#160;/g, '\xA0');
}

function convert_plain_header_tail(message) {
	if (typeof message !== 'string' /*|| !/&#32;|&nbsp;|&#160;$/.test(message)*/) {
		return message;
	}
	const plain_message = message
		.replace(/&#32;$/g, ' ').replace(/^&#32;/g, ' ')
		.replace(/(?:&nbsp;|&#160;)$/g, '\xA0').replace(/^(?:&nbsp;|&#160;)/g, '\xA0')
		;
	return message === plain_message || /&#/.test(plain_message) ? message : plain_message;
}

function escape_non_latin_chars(string) {
	return string.replace(/[^\x20-\x7F]/g, char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, 0));
}

function write_message_script_file({ resources_path, language_code, locale_data, message_id_order }) {
	const fso_path = resources_path + language_code + '.js';
	const locale_message_data = [];
	function convert_message(message) {
		return escape_non_latin_chars(JSON.stringify(convert_plain_header_tail(message)));
	}
	for (const [message_id, locale_message] of Object.entries(sort_Object_by_order(locale_data, message_id_order))) {
		if (message_id === '@metadata')
			continue;
		const qqq_data = qqq_data_Map.get(message_id);
		const key_mark = convert_message(qqq_data.message) + ': ';
		if (/^function(?:\s|\()/.test(locale_message)) {
			const original_function = message_to_localized_mapping[language_code] && message_to_localized_mapping[language_code][qqq_data.message];
			if (function_to_message(original_function) === locale_message) {
				locale_message_data.push(key_mark + locale_message);
				continue;
			}
			CeL.error(`${write_message_script_file.name}: [${language_code}][${message_id}]: 原訊息與新函數不一致！您必須檢核此函數是否有安全疑慮，之後手動更改 [${fso_path}]！\n原	${original_function}\n新	${locale_message}`);
		}
		locale_message_data.push(key_mark + convert_message(locale_message));
	}
	const new_contents = `/*	Localized messages of ${CeL.Class}.
	This file is auto created by auto-generate tool: ${library_build_script_name}(.js) @ ${datestamp.format('%Y-%2m-%2d' && '%Y')}.
*/'use strict';typeof CeL==='function'&&CeL.application.locale.gettext.set_text({
	${locale_message_data
			// The same as JSON.stringify(, null, '\t')
			.join(',\n\t')}
},
${JSON.stringify(language_code)});
`;
	if (!CeL.write_file(fso_path, new_contents, { changed_only: true })) {
		CeL.info(`${write_message_script_file.name}: Create new message script: ${fso_path}`);
	}
}

function data_to_i18n_contents(i18n_locale_data, message_id_order) {
	if (typeof i18n_locale_data === 'string')
		i18n_locale_data = JSON.parse(i18n_locale_data);
	return JSON.stringify(sort_Object_by_order(i18n_locale_data, message_id_order), null, '\t') + '\n';
}
function write_i18n_data_file({ language_code, locale_data, message_id_order }) {
	const i18n_language_code_data = i18n_language_code_data_mapping.get(language_code);
	//console.trace({ language_code, i18n_language_code_data });
	const fso_path = i18n_language_code_data.fso_path;
	//console.trace(i18n_language_code_data.fso_path);
	let original_contents = CeL.read_file(fso_path);
	if (original_contents)
		original_contents = data_to_i18n_contents(original_contents.toString());
	const new_contents = data_to_i18n_contents(locale_data, message_id_order);
	if (original_contents !== new_contents) {
		CeL.info(`${write_i18n_data_file.name}: Create new i18n data file: ${fso_path}`);
		CeL.write_file(fso_path, new_contents);
	}
}

// ---------------------------------------------------------------------//

(async () => {
	// main messages of CeJS library
	await build_locale_messages('application/locale/resources');

	build_main_script();

	update_package_file_version();
})();
