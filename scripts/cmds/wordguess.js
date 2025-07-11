const { randomNumber } = global.utils;

module.exports = {
	config: {
		name: "wordguess",
		version: "1.0",
		author: "Claude",
		countDown: 3,
		role: 0,
		shortDescription: {
			vi: "Trò chơi đoán từ",
			en: "Word guessing game"
		},
		longDescription: {
			vi: "Trò chơi đoán từ kiểu hangman với gợi ý",
			en: "Hangman-style word guessing game with hints"
		},
		category: "game",
		guide: {
			vi: "{pn} - bắt đầu game đoán từ\n{pn} easy/medium/hard - chọn độ khó",
			en: "{pn} - start word guessing game\n{pn} easy/medium/hard - choose difficulty"
		}
	},

	langs: {
		vi: {
			startGame: "🎯 ĐOÁN TỪ 🎯\n\nĐộ khó: {difficulty}\nChủ đề: {category}\nGợi ý: {hint}\n\n{display}\n\nSố lần đoán sai: {wrong}/{maxWrong}\nCác chữ đã đoán: {guessed}\n\nReply với một chữ cái để đoán!",
			correctGuess: "✅ Chính xác! Chữ '{letter}' có trong từ!",
			wrongGuess: "❌ Sai rồi! Chữ '{letter}' không có trong từ.",
			alreadyGuessed: "⚠️ Bạn đã đoán chữ '{letter}' rồi!",
			gameWon: "🎉 CHÚC MỪNG!\nBạn đã đoán đúng từ: {word}\nSố lần đoán sai: {wrong}/{maxWrong}",
			gameLost: "😔 THUA RỒI!\nTừ đúng là: {word}\nHãy thử lại lần sau!",
			invalidInput: "❌ Vui lòng nhập một chữ cái!",
			chooseDifficulty: "🎯 Chọn độ khó:\n1. Easy (Dễ) - Từ ngắn, 8 lần đoán sai\n2. Medium (Trung bình) - Từ trung bình, 6 lần đoán sai\n3. Hard (Khó) - Từ dài, 4 lần đoán sai\n\nReply với 1, 2, hoặc 3!"
		},
		en: {
			startGame: "🎯 WORD GUESS 🎯\n\nDifficulty: {difficulty}\nCategory: {category}\nHint: {hint}\n\n{display}\n\nWrong guesses: {wrong}/{maxWrong}\nGuessed letters: {guessed}\n\nReply with a letter to guess!",
			correctGuess: "✅ Correct! Letter '{letter}' is in the word!",
			wrongGuess: "❌ Wrong! Letter '{letter}' is not in the word.",
			alreadyGuessed: "⚠️ You already guessed '{letter}'!",
			gameWon: "🎉 CONGRATULATIONS!\nYou guessed the word: {word}\nWrong guesses: {wrong}/{maxWrong}",
			gameLost: "😔 GAME OVER!\nThe word was: {word}\nTry again next time!",
			invalidInput: "❌ Please enter a single letter!",
			chooseDifficulty: "🎯 Choose difficulty:\n1. Easy - Short words, 8 wrong guesses\n2. Medium - Medium words, 6 wrong guesses\n3. Hard - Long words, 4 wrong guesses\n\nReply with 1, 2, or 3!"
		}
	},

	onStart: async function ({ api, args, message, event, getLang, commandName }) {
		const difficulty = args[0]?.toLowerCase();
		const senderID = event.senderID;

		// If no difficulty specified, ask user to choose
		if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
			const gameData = {
				type: "difficulty",
				player: senderID
			};
			
			global.GoatBot.onReply.set(message.messageID, {
				commandName,
				author: senderID,
				gameData
			});

			return message.reply(getLang("chooseDifficulty"));
		}

		// Start game with specified difficulty
		return this.startWordGame(message, senderID, difficulty, getLang, commandName);
	},

	startWordGame: function(message, senderID, difficulty, getLang, commandName) {
		const wordData = this.getRandomWord(difficulty);
		const maxWrong = difficulty === "easy" ? 8 : difficulty === "medium" ? 6 : 4;

		const gameData = {
			type: "wordguess",
			difficulty,
			word: wordData.word.toLowerCase(),
			category: wordData.category,
			hint: wordData.hint,
			guessed: [],
			wrongGuesses: 0,
			maxWrong,
			player: senderID,
			startTime: Date.now()
		};

		global.GoatBot.onReply.set(message.messageID, {
			commandName,
			author: senderID,
			gameData
		});

		return this.sendGameState(message, gameData, getLang);
	},

	sendGameState: function(message, gameData, getLang) {
		const display = this.getWordDisplay(gameData.word, gameData.guessed);
		const guessedStr = gameData.guessed.length > 0 ? gameData.guessed.join(', ') : 'None';
		
		const text = getLang("startGame")
			.replace("{difficulty}", gameData.difficulty.toUpperCase())
			.replace("{category}", gameData.category)
			.replace("{hint}", gameData.hint)
			.replace("{display}", display)
			.replace("{wrong}", gameData.wrongGuesses)
			.replace("{maxWrong}", gameData.maxWrong)
			.replace("{guessed}", guessedStr);

		return message.reply(text);
	},

	getWordDisplay: function(word, guessed) {
		return word.split('').map(letter => {
			if (letter === ' ') return ' ';
			if (guessed.includes(letter)) return letter;
			return '_';
		}).join(' ');
	},

	getRandomWord: function(difficulty) {
		const words = {
			easy: [
				{ word: "CAT", category: "Animal", hint: "A furry pet that meows" },
				{ word: "SUN", category: "Nature", hint: "Bright star that gives us light" },
				{ word: "BOOK", category: "Object", hint: "You read this for knowledge" },
				{ word: "TREE", category: "Nature", hint: "Tall plant with leaves" },
				{ word: "BALL", category: "Toy", hint: "Round object used in sports" },
				{ word: "FISH", category: "Animal", hint: "Swimming creature with gills" },
				{ word: "RAIN", category: "Weather", hint: "Water falling from clouds" },
				{ word: "MOON", category: "Space", hint: "Earth's natural satellite" }
			],
			medium: [
				{ word: "ELEPHANT", category: "Animal", hint: "Large gray mammal with trunk" },
				{ word: "RAINBOW", category: "Nature", hint: "Colorful arc in the sky after rain" },
				{ word: "COMPUTER", category: "Technology", hint: "Electronic device for processing data" },
				{ word: "BUTTERFLY", category: "Insect", hint: "Colorful flying insect with wings" },
				{ word: "MOUNTAIN", category: "Geography", hint: "Very tall natural elevation" },
				{ word: "BICYCLE", category: "Transport", hint: "Two-wheeled vehicle powered by pedaling" },
				{ word: "GUITAR", category: "Music", hint: "Stringed musical instrument" },
				{ word: "LIBRARY", category: "Building", hint: "Place where books are kept" }
			],
			hard: [
				{ word: "PHARMACEUTICAL", category: "Science", hint: "Related to medicine and drugs" },
				{ word: "CONSTITUTION", category: "Government", hint: "Fundamental law of a country" },
				{ word: "METAPHYSICS", category: "Philosophy", hint: "Branch of philosophy about reality" },
				{ word: "ARCHAEOLOGICAL", category: "Science", hint: "Related to studying ancient civilizations" },
				{ word: "CHOREOGRAPHY", category: "Art", hint: "Art of designing dance movements" },
				{ word: "CRYPTOCURRENCY", category: "Technology", hint: "Digital currency secured by cryptography" },
				{ word: "EXTRAORDINARY", category: "Adjective", hint: "Very unusual or remarkable" },
				{ word: "BIODIVERSITY", category: "Biology", hint: "Variety of life in ecosystems" }
			]
		};

		const wordList = words[difficulty];
		return wordList[randomNumber(0, wordList.length - 1)];
	},

	onReply: async function ({ api, event, Reply, getLang }) {
		const { author, gameData } = Reply;
		const senderID = event.senderID;
		
		if (senderID !== author) return;

		const userInput = event.body.trim().toLowerCase();

		// Handle difficulty selection
		if (gameData.type === "difficulty") {
			const choice = parseInt(userInput);
			if (![1, 2, 3].includes(choice)) {
				return api.sendMessage("❌ Please choose 1, 2, or 3!", event.threadID, event.messageID);
			}

			const difficulties = ["easy", "medium", "hard"];
			const selectedDifficulty = difficulties[choice - 1];
			
			global.GoatBot.onReply.delete(Reply.messageID);
			return this.startWordGame(
				{ reply: (text) => api.sendMessage(text, event.threadID), messageID: event.messageID }, 
				senderID, 
				selectedDifficulty, 
				getLang, 
				Reply.commandName
			);
		}

		// Handle word guessing
		if (gameData.type === "wordguess") {
			// Validate input (single letter)
			if (userInput.length !== 1 || !/[a-z]/.test(userInput)) {
				return api.sendMessage(getLang("invalidInput"), event.threadID, event.messageID);
			}

			const letter = userInput;

			// Check if already guessed
			if (gameData.guessed.includes(letter)) {
				return api.sendMessage(getLang("alreadyGuessed").replace("{letter}", letter.toUpperCase()), event.threadID, event.messageID);
			}

			// Add to guessed letters
			gameData.guessed.push(letter);

			let responseText;
			if (gameData.word.includes(letter)) {
				responseText = getLang("correctGuess").replace("{letter}", letter.toUpperCase());
			} else {
				gameData.wrongGuesses++;
				responseText = getLang("wrongGuess").replace("{letter}", letter.toUpperCase());
			}

			// Check win condition
			const isWordComplete = gameData.word.split('').every(l => l === ' ' || gameData.guessed.includes(l));
			
			if (isWordComplete) {
				const winText = responseText + "\n\n" + getLang("gameWon")
					.replace("{word}", gameData.word.toUpperCase())
					.replace("{wrong}", gameData.wrongGuesses)
					.replace("{maxWrong}", gameData.maxWrong);

				global.GoatBot.onReply.delete(Reply.messageID);
				return api.sendMessage(winText, event.threadID, event.messageID);
			}

			// Check lose condition
			if (gameData.wrongGuesses >= gameData.maxWrong) {
				const loseText = responseText + "\n\n" + getLang("gameLost")
					.replace("{word}", gameData.word.toUpperCase());

				global.GoatBot.onReply.delete(Reply.messageID);
				return api.sendMessage(loseText, event.threadID, event.messageID);
			}

			// Continue game - send updated state
			setTimeout(() => {
				this.sendGameState(
					{ reply: (text) => api.sendMessage(text, event.threadID) }, 
					gameData, 
					getLang
				);
			}, 1500);

			return api.sendMessage(responseText, event.threadID, event.messageID);
		}
	}
};