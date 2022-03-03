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
CeL.run(['application.storage', 'application.locale.encoding', 'data.date']);

//const library_main_script_file_path = CeL.env.registry_path + library_main_script;
const library_main_script_file_path = library_base_directory + library_main_script;
// from utf16 big-endian: structure_content.swap16()
//console.log(require('fs').readFileSync(library_main_script_file_path).toString('utf16le'));


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

		// Change version stamp
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
		if (library_main_script_content === CeL.read_file(library_main_script_file_path).toString('utf16le'))
			return;
	} catch { }


	CeL.remove_file(library_base_directory + backup_directory + library_main_script);
	CeL.move_file(library_base_directory + library_main_script, library_base_directory + backup_directory + library_main_script);
	return;

	try {
		node_fs.chmodSync(library_main_script_file_path, 0o600);
	} catch { }
	CeL.write_file(library_main_script_file_path, Buffer.from(library_main_script_content, 'utf16le'));
	try {
		node_fs.chmodSync(library_main_script_file_path, 0o400);
	} catch { }
}

build_main_script();

