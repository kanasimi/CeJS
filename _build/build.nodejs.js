/**
 * @name CeJS builer
 * 
 * @fileoverview Tool to build CeJS library.
 * 
 * TODO: https://web.dev/text-fragments/
 * 
 * @since 2022/3/1 9:0:50
 */

'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

const library_base_directory = '../', backup_directory = 'old/';

let library_main_script = 'ce.js';
const structure_directory = '_structure/';
const main_structure_file = structure_directory + 'structure.js';

// timestamp
const datestamp = new Date;

const node_fs = require('fs');

function error_recover(message) {
	console.error(`${error_recover.name}: Try to recover main script file from backup!`);

	//node_fs.cpSync(backup_directory + library_main_script, library_base_directory + library_main_script, { force: true });

	process.exit(1);
}

require('../_for include/_CeL.loader.nodejs');

if (typeof CeL === 'undefined') {
	console.error("Can't load library!");
	error_recover();
}


if (CeL.env.main_script)
	library_main_script = CeL.env.main_script;


// --------------------------------------------------------------------------------------------

CeL.env.ignore_COM_error = true;
CeL.run(['application.storage', 'application.locale.encoding', 'data.date', 'interact.console', 'application.debug.log']);

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
			return $1 + 'new Date("' + datestamp + '")';
		});


	// Add BOM
	library_main_script_content = `\ufeff
/*
	本檔案為自動生成，請勿手動編輯！
	This file is auto created from _structure/${file_list.join(', ')}
		by auto-generate tool: ${CeL.get_script_name() || 'library_build_script'}(.js) @ ${datestamp.format('%Y-%2m-%2d' && '%Y')}.
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

// message_to_localized_mapping['en-US'] = {"original message in source":"localized message"}
const message_to_localized_mapping = Object.create(null);
// i18n_message_id_to_message['en-US'] = {"message_id":"localized message"}
const i18n_message_id_to_message = Object.create(null);
const qqq_data_file_name = 'qqq_data.json';
// qqq_data.get('message_id') = {message: "original message in source", notes: "notes", scope: "source/", demo: "demo URL / application of the message", additional_notes: "additional notes"}
const qqq_data_Map = new Map;
let all_message_Set = new Set(['%1/%2/%3']);
// message_changed.get(from) = to
const message_changed = new Map;

const PATTERN_has_invalid_en_message_char = /[^\x20-\xfe\s↑]/;

function en_message_to_message_id(en_message) {
	var message_id = en_message.trim()
		.replace(/[.!]+$/, '')
		.replace(/[,;:'"\s\[\]\\\/]+/g, '-')
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
function build_locale_messages(resources_path) {
	resources_path = library_base_directory + resources_path + CeL.env.path_separator;

	load_previous_qqq_data();

	load_message_to_localized(resources_path, () => {
		//console.trace(resources_path);
		load_i18n_messages(resources_path, () => {
			create__qqq_data_Map();

			modify_source_files();
			//CeL.log(`${build_locale_messages.name}: Done.`);
		});
	});
}

function load_previous_qqq_data(resources_path) {
	let contents = CeL.read_file(resources_path + qqq_data_file_name);
	if (!contents) return;
	contents = JSON.parse(contents.toString());
	for (const [message_id, qqq_data] of Object.entries(contents)) {
		qqq_data_Map.set(message_id, qqq_data);
	}
}

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

		// 訊息修正。
		for (const [from_message, to_message] of Object.entries({
			Espana: 'España',
			'Calendrier republicain': 'Calendrier républicain',
		})) {
			if ((from_message in locale_data) && !locale_data[to_message]) {
				locale_data[to_message] = locale_data[from_message];
				delete locale_data[from_message];
			}
		}

		const language_code = matched[1];
		message_to_localized_mapping[language_code] = locale_data;

		Object.keys(locale_data).forEach(message => all_message_Set.add(message));
	}, {
		depth: 1,
		callback
	});
}

function load_i18n_messages(resources_path, callback) {
	resources_path += 'i18n' + CeL.env.path_separator;

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
			locale_data = JSON.parse(contents.trim());
		} catch (e) {
			CeL.error(`${fso_path}:`);
			console.error(e);
		}

		if (!locale_data)
			return;

		i18n_message_id_to_message[language_code] = locale_data;

	}, {
		depth: 1,
		callback
	});
}

function parse_qqq(qqq) {
	const qqq_data = {
		message: null,
		notes: null
	};
	let notes = [], additional_notes = [];
	let start_additional_notes;
	qqq.split(/\n/).forEach((line) => {
		line = line.trim();
		if (!line) return;
		const matched = line.match(/^;(.+):(.*)$/);
		if (matched) {
			if (!start_additional_notes && notes.length > 0) start_additional_notes = true;
			qqq_data[matched[1].trim()] = matched[2].trim();
			return;
		}

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
		if (qqq_data[property]) {
			CeL.warn(`${parse_qqq.name}: Skip duplicate property name: ${property}=${value}`);
		} else {
			qqq_data[property] = value;
		}
		notes = notes.slice(0, matched.index);
	}
	qqq_data.notes = notes;
	if (additional_notes.length > 0)
		qqq_data.additional_notes = additional_notes.join('\n');

	return qqq_data;
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
		const from_localized_message = message_to_localized_mapping[language_code][message];
		const to_localized_message = i18n_message_id_to_message[language_code][message_id];
		if (!from_localized_message) {
			// New localized message
			continue;
		}
		if (String(from_localized_message) === String(to_localized_message))
			continue;
		CeL.info(`${message}	[${language_code}] ${from_localized_message}→${to_localized_message}`);
	}
}

function create__qqq_data_Map() {
	for (const [message_id, qqq] of Object.entries(i18n_message_id_to_message.qqq)) {
		if (typeof qqq !== 'string')
			continue;
		const qqq_data = parse_qqq(qqq);
		if (qqq_data_Map.has(message_id)) {
			Object.assign(qqq_data_Map.get(message_id), qqq_data);
		} else {
			CeL.warn(`New message id in i18n: ${message_id}`);
			qqq_data_Map.set(message_id, qqq_data);
		}
	}

	// Create qqq_data_Map
	for (const message of all_message_Set.keys()) {
		if (!message)
			continue;
		let en_message;
		if (!PATTERN_has_invalid_en_message_char.test(message)) {
			en_message = message;
		} else if (!(en_message = message_to_localized_mapping['en-US'][message]) || PATTERN_has_invalid_en_message_char.test(en_message = en_message.toString())) {
			CeL.warn(`${create__qqq_data_Map.name}: Cannot find the en_message of ${message}`);
			continue;
		}
		if (message === 'Calendrier républicain') en_message = 'French Republican Calendar';
		//console.log([message, en_message]);
		const message_id = en_message_to_message_id(en_message);
		const qqq_data = qqq_data_Map.get(message_id);
		if (!qqq_data) {
			CeL.error(`${create__qqq_data_Map.name}: No i18n qqq_data of message id: ${message_id} (message: ${message})`);
			continue;
		}
		if (qqq_data.message && qqq_data.message !== message) {
			CeL.info(`${create__qqq_data_Map.name}: original message changed: ${qqq_data.message}→${message}`);
			message_changed.set(qqq_data.message, message);
		}
		qqq_data.message = message;
	}

	// free
	all_message_Set = null;

	//console.trace(Array.from(qqq_data_Map.keys()).join());
	for (const message_id of qqq_data_Map.keys()) {
		log_message_changed(message_id);
	}

	//console.trace(qqq_data_Map);
}

function modify_source_files() {
	const source_repositories = JSON.parse(CeL.read_file('source_repositories.json').toString());
	//console.log(source_repositories);

	// 增加在地化註記
	add_localization_marks();

	for (let [path, source_data] of Object.entries(source_repositories)) {
		;
	}
}

// ---------------------------------------------------------------------//

build_locale_messages('application/locale/resources');

/*
build_main_script();

update_package_file_version();
*/
