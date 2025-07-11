const { randomNumber } = global.utils;

module.exports = {
	config: {
		name: "trivia",
		version: "1.0",
		author: "Claude",
		countDown: 5,
		role: 0,
		shortDescription: {
			vi: "Trò chơi hỏi đáp",
			en: "Trivia quiz game"
		},
		longDescription: {
			vi: "Trò chơi hỏi đáp với các câu hỏi kiến thức tổng hợp",
			en: "Trivia quiz game with general knowledge questions"
		},
		category: "game",
		guide: {
			vi: "{pn} - bắt đầu game hỏi đáp\n{pn} easy/medium/hard - chọn độ khó",
			en: "{pn} - start trivia game\n{pn} easy/medium/hard - choose difficulty"
		}
	},

	langs: {
		vi: {
			startGame: "🧠 TRIVIA QUIZ 🧠\n\nĐộ khó: {difficulty}\nCâu hỏi {current}/{total}\n\n{question}\n\n{options}\n\nReply với số từ 1-4 để chọn đáp án!",
			correct: "✅ Chính xác! +{points} điểm\nĐáp án: {answer}",
			incorrect: "❌ Sai rồi!\nĐáp án đúng: {answer}",
			gameComplete: "🎉 HOÀN THÀNH!\n\nTổng điểm: {score}/{maxScore}\nĐộ chính xác: {percentage}%\n{rating}",
			timeout: "⏰ Hết thời gian! Đáp án đúng: {answer}",
			invalidAnswer: "❌ Vui lòng chọn số từ 1-4",
			chooseDifficulty: "🎯 Chọn độ khó:\n1. Easy (Dễ) - 10 điểm/câu\n2. Medium (Trung bình) - 20 điểm/câu\n3. Hard (Khó) - 30 điểm/câu\n\nReply với 1, 2, hoặc 3!"
		},
		en: {
			startGame: "🧠 TRIVIA QUIZ 🧠\n\nDifficulty: {difficulty}\nQuestion {current}/{total}\n\n{question}\n\n{options}\n\nReply with number 1-4 to choose your answer!",
			correct: "✅ Correct! +{points} points\nAnswer: {answer}",
			incorrect: "❌ Wrong!\nCorrect answer: {answer}",
			gameComplete: "🎉 GAME COMPLETE!\n\nTotal score: {score}/{maxScore}\nAccuracy: {percentage}%\n{rating}",
			timeout: "⏰ Time's up! Correct answer: {answer}",
			invalidAnswer: "❌ Please choose a number from 1-4",
			chooseDifficulty: "🎯 Choose difficulty:\n1. Easy - 10 points/question\n2. Medium - 20 points/question\n3. Hard - 30 points/question\n\nReply with 1, 2, or 3!"
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
		return this.startTriviaGame(message, senderID, difficulty, getLang, commandName);
	},

	startTriviaGame: function(message, senderID, difficulty, getLang, commandName) {
		const questions = this.getQuestions(difficulty);
		const totalQuestions = 5;
		const pointsPerQuestion = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 30;

		const gameData = {
			type: "trivia",
			difficulty,
			questions,
			currentQuestion: 0,
			totalQuestions,
			score: 0,
			maxScore: totalQuestions * pointsPerQuestion,
			pointsPerQuestion,
			player: senderID,
			startTime: Date.now()
		};

		global.GoatBot.onReply.set(message.messageID, {
			commandName,
			author: senderID,
			gameData
		});

		return this.sendQuestion(message, gameData, getLang);
	},

	sendQuestion: function(message, gameData, getLang) {
		const question = gameData.questions[gameData.currentQuestion];
		const options = question.options.map((opt, index) => `${index + 1}. ${opt}`).join('\n');
		
		const text = getLang("startGame")
			.replace("{difficulty}", gameData.difficulty.toUpperCase())
			.replace("{current}", gameData.currentQuestion + 1)
			.replace("{total}", gameData.totalQuestions)
			.replace("{question}", question.question)
			.replace("{options}", options);

		return message.reply(text);
	},

	getQuestions: function(difficulty) {
		const allQuestions = {
			easy: [
				{
					question: "What is the capital of France?",
					options: ["London", "Berlin", "Paris", "Madrid"],
					correct: 2
				},
				{
					question: "How many days are there in a week?",
					options: ["5", "6", "7", "8"],
					correct: 2
				},
				{
					question: "What color do you get when you mix red and white?",
					options: ["Purple", "Orange", "Pink", "Yellow"],
					correct: 2
				},
				{
					question: "Which animal is known as the King of the Jungle?",
					options: ["Tiger", "Elephant", "Lion", "Bear"],
					correct: 2
				},
				{
					question: "What is 2 + 2?",
					options: ["3", "4", "5", "6"],
					correct: 1
				},
				{
					question: "Which planet is closest to the Sun?",
					options: ["Venus", "Mercury", "Earth", "Mars"],
					correct: 1
				}
			],
			medium: [
				{
					question: "Who wrote 'Romeo and Juliet'?",
					options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
					correct: 1
				},
				{
					question: "What is the largest ocean on Earth?",
					options: ["Atlantic", "Indian", "Arctic", "Pacific"],
					correct: 3
				},
				{
					question: "In which year did World War II end?",
					options: ["1943", "1944", "1945", "1946"],
					correct: 2
				},
				{
					question: "What is the chemical symbol for gold?",
					options: ["Go", "Gd", "Au", "Ag"],
					correct: 2
				},
				{
					question: "Which country has the most natural lakes?",
					options: ["Russia", "Canada", "USA", "Finland"],
					correct: 1
				},
				{
					question: "What is the smallest prime number?",
					options: ["1", "2", "3", "0"],
					correct: 1
				}
			],
			hard: [
				{
					question: "What is the speed of light in vacuum?",
					options: ["299,792,458 m/s", "300,000,000 m/s", "299,000,000 m/s", "298,792,458 m/s"],
					correct: 0
				},
				{
					question: "Who developed the theory of general relativity?",
					options: ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Stephen Hawking"],
					correct: 2
				},
				{
					question: "What is the most abundant gas in Earth's atmosphere?",
					options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
					correct: 2
				},
				{
					question: "Which element has the atomic number 1?",
					options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
					correct: 1
				},
				{
					question: "In what year was the first computer bug found?",
					options: ["1945", "1947", "1950", "1952"],
					correct: 1
				},
				{
					question: "What is the smallest country in the world?",
					options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
					correct: 1
				}
			]
		};

		const selectedQuestions = allQuestions[difficulty];
		const shuffled = [...selectedQuestions].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, 5);
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
			return this.startTriviaGame(
				{ reply: (text) => api.sendMessage(text, event.threadID), messageID: event.messageID }, 
				senderID, 
				selectedDifficulty, 
				getLang, 
				Reply.commandName
			);
		}

		// Handle trivia answers
		if (gameData.type === "trivia") {
			const answer = parseInt(userInput);
			if (isNaN(answer) || answer < 1 || answer > 4) {
				return api.sendMessage(getLang("invalidAnswer"), event.threadID, event.messageID);
			}

			const question = gameData.questions[gameData.currentQuestion];
			const isCorrect = (answer - 1) === question.correct;
			const correctAnswer = question.options[question.correct];

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
				let rating;
				if (percentage >= 90) rating = "🏆 EXCELLENT!";
				else if (percentage >= 70) rating = "🥇 GREAT!";
				else if (percentage >= 50) rating = "🥈 GOOD!";
				else rating = "🥉 KEEP TRYING!";

				const finalText = responseText + "\n\n" + getLang("gameComplete")
					.replace("{score}", gameData.score)
					.replace("{maxScore}", gameData.maxScore)
					.replace("{percentage}", percentage)
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