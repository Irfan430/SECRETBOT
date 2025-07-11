const { removeHomeDir, log } = global.utils;
const vm = require('vm');

module.exports = {
	config: {
		name: "eval",
		version: "1.6",
		author: "NTKhang",
		countDown: 5,
		role: 2,
		shortDescription: {
			vi: "Test code nhanh",
			en: "Test code quickly"
		},
		longDescription: {
			vi: "Test code nhanh với các hạn chế bảo mật",
			en: "Test code quickly with security restrictions"
		},
		category: "owner",
		guide: {
			vi: "{pn} <đoạn code cần test>",
			en: "{pn} <code to test>"
		}
	},

	langs: {
		vi: {
			error: "❌ Đã có lỗi xảy ra:",
			securityError: "⚠️ Lỗi bảo mật: Code chứa các lệnh nguy hiểm bị cấm"
		},
		en: {
			error: "❌ An error occurred:",
			securityError: "⚠️ Security Error: Code contains forbidden dangerous operations"
		}
	},

	onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
		const code = args.join(" ");
		
		// Security check: Block dangerous operations
		const dangerousPatterns = [
			/require\s*\(\s*['"]fs['"]|require\s*\(\s*['"]child_process['"]/,
			/process\.exit|process\.kill/,
			/eval\s*\(/,
			/Function\s*\(/,
			/import\s*\(/,
			/require\s*\(\s*['"]\.{1,2}\/.*['"]\s*\)/,
			/fs\.|child_process\.|exec\(|spawn\(/,
			/__dirname|__filename/,
			/global\.|process\./
		];

		for (const pattern of dangerousPatterns) {
			if (pattern.test(code)) {
				return message.reply(getLang("securityError"));
			}
		}

		function output(msg) {
			if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
				msg = msg.toString();
			else if (msg instanceof Map) {
				let text = `Map(${msg.size}) `;
				text += JSON.stringify(mapToObj(msg), null, 2);
				msg = text;
			}
			else if (typeof msg == "object")
				msg = JSON.stringify(msg, null, 2);
			else if (typeof msg == "undefined")
				msg = "undefined";

			message.reply(msg);
		}
		
		function out(msg) {
			output(msg);
		}
		
		function mapToObj(map) {
			const obj = {};
			map.forEach(function (v, k) {
				obj[k] = v;
			});
			return obj;
		}

		// Create a safer sandbox context
		const sandbox = {
			output,
			out,
			mapToObj,
			console: {
				log: output,
				error: output,
				warn: output
			},
			setTimeout: setTimeout,
			setInterval: setInterval,
			clearTimeout: clearTimeout,
			clearInterval: clearInterval,
			Math: Math,
			Date: Date,
			JSON: JSON,
			Array: Array,
			Object: Object,
			String: String,
			Number: Number,
			Boolean: Boolean,
			// Provide safe access to some bot data
			threadsData,
			usersData,
			event: {
				threadID: event.threadID,
				senderID: event.senderID,
				messageID: event.messageID,
				body: event.body
			}
		};

		try {
			const safeCode = `
				(async () => {
					try {
						${code}
					}
					catch(err) {
						output("Error: " + (err.message || err.toString()));
					}
				})()
			`;
			
			// Execute in VM context with timeout
			const context = vm.createContext(sandbox);
			const result = vm.runInContext(safeCode, context, {
				timeout: 5000, // 5 second timeout
				displayErrors: true
			});
			
			await result;
		}
		catch (err) {
			log.err("eval command", err);
			message.send(
				getLang("error") + "\n" +
				(err.stack ?
					removeHomeDir(err.stack) :
					removeHomeDir(JSON.stringify(err, null, 2) || "")
				)
			);
		}
	}
};