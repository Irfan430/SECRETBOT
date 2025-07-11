const { randomNumber } = global.utils;

module.exports = {
	config: {
		name: "game",
		version: "1.0",
		author: "Claude",
		countDown: 3,
		role: 0,
		shortDescription: {
			vi: "Trò chơi chính",
			en: "Main game command"
		},
		longDescription: {
			vi: "Lệnh trò chơi chính với nhiều mini game khác nhau",
			en: "Main game command with various mini games"
		},
		category: "game",
		guide: {
			vi: "{pn} list - xem danh sách game\n{pn} <tên game> - chơi game",
			en: "{pn} list - view game list\n{pn} <game name> - play game"
		}
	},

	langs: {
		vi: {
			gameList: "🎮 DANH SÁCH GAME 🎮\n\n1. 🎲 dice - Tung xúc xắc\n2. 🪙 coinflip - Tung đồng xu\n3. 🔢 number - Đoán số\n4. 🗿 rps - Kéo búa bao\n5. 🎯 8ball - Quả cầu thần số 8\n\nSử dụng: {prefix}game <tên game>",
			invalidGame: "❌ Game không tồn tại! Dùng '{prefix}game list' để xem danh sách.",
			diceResult: "🎲 Xúc xắc: {result}",
			coinResult: "🪙 Đồng xu: {result}",
			numberGame: "🔢 Tôi đã nghĩ ra một số từ 1-100!\nBạn có 5 lần đoán. Hãy reply tin nhắn này với số của bạn!",
			rpsChoose: "🗿 Kéo Búa Bao!\nReply với: rock, paper, hoặc scissors",
			eightBall: "🎯 Quả cầu thần số 8 nói: {result}",
			gameTimeout: "⏰ Hết thời gian chơi game!"
		},
		en: {
			gameList: "🎮 GAME LIST 🎮\n\n1. 🎲 dice - Roll dice\n2. 🪙 coinflip - Flip coin\n3. 🔢 number - Number guessing\n4. 🗿 rps - Rock Paper Scissors\n5. 🎯 8ball - Magic 8 Ball\n\nUsage: {prefix}game <game name>",
			invalidGame: "❌ Game doesn't exist! Use '{prefix}game list' to see the list.",
			diceResult: "🎲 Dice: {result}",
			coinResult: "🪙 Coin: {result}",
			numberGame: "🔢 I'm thinking of a number from 1-100!\nYou have 5 guesses. Reply to this message with your number!",
			rpsChoose: "🗿 Rock Paper Scissors!\nReply with: rock, paper, or scissors",
			eightBall: "🎯 Magic 8 Ball says: {result}",
			gameTimeout: "⏰ Game timeout!"
		}
	},

	onStart: async function ({ api, args, message, event, threadsData, usersData, getLang, commandName }) {
		const gameType = args[0]?.toLowerCase();
		
		if (!gameType || gameType === "list") {
			const prefix = global.utils.getPrefix(event.threadID);
			return message.reply(getLang("gameList").replace(/{prefix}/g, prefix));
		}

		const senderID = event.senderID;
		const threadID = event.threadID;

		switch (gameType) {
			case "dice": {
				const result = randomNumber(1, 6);
				return message.reply(getLang("diceResult").replace("{result}", result));
			}

			case "coinflip": {
				const result = randomNumber(1, 2) === 1 ? "Heads/Ngửa" : "Tails/Sấp";
				return message.reply(getLang("coinResult").replace("{result}", result));
			}

			case "number": {
				const targetNumber = randomNumber(1, 100);
				const gameData = {
					type: "number",
					target: targetNumber,
					attempts: 0,
					maxAttempts: 5,
					player: senderID
				};
				
				global.GoatBot.onReply.set(message.messageID, {
					commandName,
					author: senderID,
					gameData
				});

				return message.reply(getLang("numberGame"));
			}

			case "rps": {
				const gameData = {
					type: "rps",
					player: senderID
				};
				
				global.GoatBot.onReply.set(message.messageID, {
					commandName,
					author: senderID,
					gameData
				});

				return message.reply(getLang("rpsChoose"));
			}

			case "8ball": {
				const responses = [
					"It is certain", "It is decidedly so", "Without a doubt", "Yes definitely",
					"You may rely on it", "As I see it, yes", "Most likely", "Outlook good",
					"Yes", "Signs point to yes", "Reply hazy, try again", "Ask again later",
					"Better not tell you now", "Cannot predict now", "Concentrate and ask again",
					"Don't count on it", "My reply is no", "My sources say no",
					"Outlook not so good", "Very doubtful"
				];
				const result = responses[randomNumber(0, responses.length - 1)];
				return message.reply(getLang("eightBall").replace("{result}", result));
			}

			default: {
				const prefix = global.utils.getPrefix(event.threadID);
				return message.reply(getLang("invalidGame").replace(/{prefix}/g, prefix));
			}
		}
	},

	onReply: async function ({ api, event, Reply, getLang }) {
		const { author, gameData } = Reply;
		const senderID = event.senderID;
		
		if (senderID !== author) return;

		const userInput = event.body.toLowerCase().trim();

		switch (gameData.type) {
			case "number": {
				const guess = parseInt(userInput);
				if (isNaN(guess) || guess < 1 || guess > 100) {
					return api.sendMessage("❌ Please enter a valid number between 1-100!", event.threadID, event.messageID);
				}

				gameData.attempts++;
				
				if (guess === gameData.target) {
					global.GoatBot.onReply.delete(Reply.messageID);
					return api.sendMessage(`🎉 Congratulations! You guessed it right!\nThe number was: ${gameData.target}\nAttempts used: ${gameData.attempts}/${gameData.maxAttempts}`, event.threadID, event.messageID);
				}
				
				if (gameData.attempts >= gameData.maxAttempts) {
					global.GoatBot.onReply.delete(Reply.messageID);
					return api.sendMessage(`😔 Game over! You've used all attempts.\nThe number was: ${gameData.target}`, event.threadID, event.messageID);
				}

				const hint = guess < gameData.target ? "📈 Too low!" : "📉 Too high!";
				return api.sendMessage(`${hint}\nAttempts left: ${gameData.maxAttempts - gameData.attempts}`, event.threadID, event.messageID);
			}

			case "rps": {
				const validChoices = ["rock", "paper", "scissors"];
				const choice = userInput.toLowerCase();
				
				if (!validChoices.includes(choice)) {
					return api.sendMessage("❌ Please choose: rock, paper, or scissors", event.threadID, event.messageID);
				}

				const botChoice = validChoices[randomNumber(0, 2)];
				const emojis = { rock: "🗿", paper: "📄", scissors: "✂️" };
				
				let result;
				if (choice === botChoice) {
					result = "🤝 It's a tie!";
				} else if (
					(choice === "rock" && botChoice === "scissors") ||
					(choice === "paper" && botChoice === "rock") ||
					(choice === "scissors" && botChoice === "paper")
				) {
					result = "🎉 You win!";
				} else {
					result = "😔 I win!";
				}

				global.GoatBot.onReply.delete(Reply.messageID);
				return api.sendMessage(`${emojis[choice]} vs ${emojis[botChoice]}\n${result}`, event.threadID, event.messageID);
			}
		}
	}
};