const { randomNumber } = global.utils;

module.exports = {
	config: {
		name: "mathchallenge",
		version: "1.0",
		author: "Claude",
		countDown: 3,
		role: 0,
		shortDescription: {
			vi: "Thử thách toán học",
			en: "Math challenge game"
		},
		longDescription: {
			vi: "Trò chơi thử thách toán học với các bài toán khác nhau",
			en: "Math challenge game with various mathematical problems"
		},
		category: "game",
		guide: {
			vi: "{pn} - bắt đầu thử thách toán\n{pn} easy/medium/hard - chọn độ khó",
			en: "{pn} - start math challenge\n{pn} easy/medium/hard - choose difficulty"
		}
	},

	langs: {
		vi: {
			startGame: "🧮 THỬ THÁCH TOÁN HỌC 🧮\n\nĐộ khó: {difficulty}\nCâu {current}/{total}\nĐiểm: {score}\n\n{question}\n\nReply với đáp án của bạn!\nThời gian: {timeLimit} giây",
			correct: "✅ Chính xác! +{points} điểm\nĐáp án: {answer}",
			incorrect: "❌ Sai rồi! Đáp án đúng: {answer}",
			gameComplete: "🎉 HOÀN THÀNH!\n\nĐiểm cuối: {score}/{maxScore}\nĐộ chính xác: {percentage}%\nThời gian trung bình: {avgTime}s\n{rating}",
			timeout: "⏰ Hết thời gian! Đáp án đúng: {answer}",
			invalidAnswer: "❌ Vui lòng nhập một số!",
			chooseDifficulty: "🎯 Chọn độ khó:\n1. Easy (Dễ) - Phép tính đơn giản, 30s/câu\n2. Medium (Trung bình) - Phép tính phức tạp, 45s/câu\n3. Hard (Khó) - Đại số & hình học, 60s/câu\n\nReply với 1, 2, hoặc 3!"
		},
		en: {
			startGame: "🧮 MATH CHALLENGE 🧮\n\nDifficulty: {difficulty}\nQuestion {current}/{total}\nScore: {score}\n\n{question}\n\nReply with your answer!\nTime limit: {timeLimit} seconds",
			correct: "✅ Correct! +{points} points\nAnswer: {answer}",
			incorrect: "❌ Wrong! Correct answer: {answer}",
			gameComplete: "🎉 CHALLENGE COMPLETE!\n\nFinal score: {score}/{maxScore}\nAccuracy: {percentage}%\nAverage time: {avgTime}s\n{rating}",
			timeout: "⏰ Time's up! Correct answer: {answer}",
			invalidAnswer: "❌ Please enter a number!",
			chooseDifficulty: "🎯 Choose difficulty:\n1. Easy - Simple arithmetic, 30s/question\n2. Medium - Complex calculations, 45s/question\n3. Hard - Algebra & geometry, 60s/question\n\nReply with 1, 2, or 3!"
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
		return this.startMathGame(message, senderID, difficulty, getLang, commandName);
	},

	startMathGame: function(message, senderID, difficulty, getLang, commandName) {
		const totalQuestions = 5;
		const pointsPerQuestion = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30;
		const timeLimit = difficulty === "easy" ? 30 : difficulty === "medium" ? 45 : 60;

		const gameData = {
			type: "math",
			difficulty,
			currentQuestion: 0,
			totalQuestions,
			score: 0,
			maxScore: totalQuestions * pointsPerQuestion,
			pointsPerQuestion,
			timeLimit,
			player: senderID,
			startTime: Date.now(),
			questionStartTime: Date.now(),
			responseTimes: []
		};

		global.GoatBot.onReply.set(message.messageID, {
			commandName,
			author: senderID,
			gameData
		});

		return this.sendQuestion(message, gameData, getLang);
	},

	sendQuestion: function(message, gameData, getLang) {
		const problem = this.generateProblem(gameData.difficulty);
		gameData.currentProblem = problem;
		gameData.questionStartTime = Date.now();
		
		const text = getLang("startGame")
			.replace("{difficulty}", gameData.difficulty.toUpperCase())
			.replace("{current}", gameData.currentQuestion + 1)
			.replace("{total}", gameData.totalQuestions)
			.replace("{score}", gameData.score)
			.replace("{question}", problem.question)
			.replace("{timeLimit}", gameData.timeLimit);

		return message.reply(text);
	},

	generateProblem: function(difficulty) {
		switch (difficulty) {
			case "easy":
				return this.generateEasyProblem();
			case "medium":
				return this.generateMediumProblem();
			case "hard":
				return this.generateHardProblem();
			default:
				return this.generateEasyProblem();
		}
	},

	generateEasyProblem: function() {
		const operations = ['+', '-', '×', '÷'];
		const operation = operations[randomNumber(0, operations.length - 1)];
		
		let a, b, answer, question;
		
		switch (operation) {
			case '+':
				a = randomNumber(1, 50);
				b = randomNumber(1, 50);
				answer = a + b;
				question = `${a} + ${b} = ?`;
				break;
			case '-':
				a = randomNumber(20, 100);
				b = randomNumber(1, a);
				answer = a - b;
				question = `${a} - ${b} = ?`;
				break;
			case '×':
				a = randomNumber(2, 12);
				b = randomNumber(2, 12);
				answer = a * b;
				question = `${a} × ${b} = ?`;
				break;
			case '÷':
				answer = randomNumber(2, 15);
				b = randomNumber(2, 10);
				a = answer * b;
				question = `${a} ÷ ${b} = ?`;
				break;
		}
		
		return { question, answer };
	},

	generateMediumProblem: function() {
		const problemTypes = ['multi_step', 'percentage', 'fraction', 'equation'];
		const type = problemTypes[randomNumber(0, problemTypes.length - 1)];
		
		switch (type) {
			case 'multi_step':
				const a = randomNumber(5, 20);
				const b = randomNumber(2, 10);
				const c = randomNumber(1, 15);
				const answer = (a * b) + c;
				return {
					question: `(${a} × ${b}) + ${c} = ?`,
					answer
				};
				
			case 'percentage':
				const num = randomNumber(20, 200);
				const percent = [10, 20, 25, 50, 75][randomNumber(0, 4)];
				const answer2 = (num * percent) / 100;
				return {
					question: `What is ${percent}% of ${num}?`,
					answer: answer2
				};
				
			case 'fraction':
				const whole = randomNumber(8, 24);
				const fraction = [2, 3, 4, 6, 8][randomNumber(0, 4)];
				const answer3 = whole / fraction;
				return {
					question: `${whole} ÷ ${fraction} = ?`,
					answer: answer3
				};
				
			case 'equation':
				const x = randomNumber(3, 15);
				const constant = randomNumber(5, 25);
				const result = (x * 2) + constant;
				return {
					question: `If 2x + ${constant} = ${result}, what is x?`,
					answer: x
				};
		}
	},

	generateHardProblem: function() {
		const problemTypes = ['quadratic', 'area', 'sequence', 'compound'];
		const type = problemTypes[randomNumber(0, problemTypes.length - 1)];
		
		switch (type) {
			case 'quadratic':
				const a = randomNumber(1, 5);
				const b = randomNumber(1, 10);
				const x = randomNumber(2, 8);
				const result = (a * x * x) + (b * x);
				return {
					question: `If ${a}x² + ${b}x = ${result}, what is x? (positive solution)`,
					answer: x
				};
				
			case 'area':
				const side = randomNumber(5, 15);
				const answer = side * side;
				return {
					question: `What is the area of a square with side length ${side} units?`,
					answer
				};
				
			case 'sequence':
				const start = randomNumber(2, 10);
				const diff = randomNumber(2, 6);
				const term5 = start + (4 * diff);
				return {
					question: `In the sequence ${start}, ${start + diff}, ${start + 2*diff}, ${start + 3*diff}, ..., what is the 5th term?`,
					answer: term5
				};
				
			case 'compound':
				const p = randomNumber(100, 500);
				const r = [5, 10, 15, 20][randomNumber(0, 3)];
				const t = randomNumber(2, 4);
				const amount = p * Math.pow(1 + r/100, t);
				return {
					question: `$${p} invested at ${r}% annual interest for ${t} years (compound). Final amount? (round to nearest dollar)`,
					answer: Math.round(amount)
				};
		}
	},

	onReply: async function ({ api, event, Reply, getLang }) {
		const { author, gameData } = Reply;
		const senderID = event.senderID;
		
		if (senderID !== author) return;

		const userInput = event.body.trim();

		// Handle difficulty selection
		if (gameData.type === "difficulty") {
			const choice = parseInt(userInput);
			if (![1, 2, 3].includes(choice)) {
				return api.sendMessage("❌ Please choose 1, 2, or 3!", event.threadID, event.messageID);
			}

			const difficulties = ["easy", "medium", "hard"];
			const selectedDifficulty = difficulties[choice - 1];
			
			global.GoatBot.onReply.delete(Reply.messageID);
			return this.startMathGame(
				{ reply: (text) => api.sendMessage(text, event.threadID), messageID: event.messageID }, 
				senderID, 
				selectedDifficulty, 
				getLang, 
				Reply.commandName
			);
		}

		// Handle math answers
		if (gameData.type === "math") {
			const userAnswer = parseFloat(userInput);
			if (isNaN(userAnswer)) {
				return api.sendMessage(getLang("invalidAnswer"), event.threadID, event.messageID);
			}

			const responseTime = (Date.now() - gameData.questionStartTime) / 1000;
			gameData.responseTimes.push(responseTime);

			const correctAnswer = gameData.currentProblem.answer;
			const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.01; // Allow small floating point differences

			let responseText;
			if (isCorrect) {
				gameData.score += gameData.pointsPerQuestion;
				responseText = getLang("correct")
					.replace("{points}", gameData.pointsPerQuestion)
					.replace("{answer}", correctAnswer);
			} else {
				responseText = getLang("incorrect")
					.replace("{answer}", correctAnswer);
			}

			gameData.currentQuestion++;

			// Check if game is complete
			if (gameData.currentQuestion >= gameData.totalQuestions) {
				const percentage = Math.round((gameData.score / gameData.maxScore) * 100);
				const avgTime = Math.round(gameData.responseTimes.reduce((a, b) => a + b, 0) / gameData.responseTimes.length);
				
				let rating;
				if (percentage >= 90 && avgTime <= 15) rating = "🏆 MATH GENIUS!";
				else if (percentage >= 80) rating = "🥇 EXCELLENT!";
				else if (percentage >= 60) rating = "🥈 GOOD JOB!";
				else if (percentage >= 40) rating = "🥉 KEEP PRACTICING!";
				else rating = "📚 STUDY MORE!";

				const finalText = responseText + "\n\n" + getLang("gameComplete")
					.replace("{score}", gameData.score)
					.replace("{maxScore}", gameData.maxScore)
					.replace("{percentage}", percentage)
					.replace("{avgTime}", avgTime)
					.replace("{rating}", rating);

				global.GoatBot.onReply.delete(Reply.messageID);
				return api.sendMessage(finalText, event.threadID, event.messageID);
			}

			// Send next question
			setTimeout(() => {
				this.sendQuestion(
					{ reply: (text) => api.sendMessage(text, event.threadID) }, 
					gameData, 
					getLang
				);
			}, 2000);

			return api.sendMessage(responseText, event.threadID, event.messageID);
		}
	}
};