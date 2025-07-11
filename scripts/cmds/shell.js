const { exec } = require('child_process');

module.exports = {
  config: {
    name: "shell",
    version: "1.1",
    author: "Samir",
    countDown: 5,
    role: 2, // Changed from 0 to 2 (admin only)
    shortDescription: "Execute safe shell commands (admin only)",
    longDescription: "Execute whitelisted shell commands with security restrictions",
    category: "admin",
    guide: {
      vi: "{p}{n} <command>",
      en: "{p}{n} <command>"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    const command = args.join(" ");

    if (!command) {
      return message.reply("Please provide a command to execute.");
    }

    // Security: Whitelist of safe commands only
    const safeCommands = [
      'ls', 'dir', 'pwd', 'whoami', 'date', 'uptime', 'df -h', 
      'ps aux', 'top -n 1', 'free -h', 'uname -a', 'node --version',
      'npm --version', 'git --version', 'echo'
    ];

    // Extract base command (first word)
    const baseCommand = command.split(' ')[0];
    
    // Check if command starts with any safe command
    const isSafeCommand = safeCommands.some(safeCmd => {
      const safeCmdBase = safeCmd.split(' ')[0];
      return baseCommand === safeCmdBase;
    });

    if (!isSafeCommand) {
      return message.reply("⚠️ Security Error: This command is not in the whitelist of safe commands. Allowed commands: " + safeCommands.join(', '));
    }

    // Additional security checks
    const dangerousPatterns = [
      /[;&|`$(){}[\]]/,  // Shell metacharacters
      /rm\s+/, /del\s+/, /rmdir\s+/,  // Delete commands
      /sudo/, /su\s+/,  // Privilege escalation
      /passwd/, /adduser/, /useradd/,  // User management
      /chmod/, /chown/,  // Permission changes
      /wget/, /curl/, /nc/, /netcat/,  // Network tools
      />/,  // Redirection
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return message.reply("⚠️ Security Error: Command contains potentially dangerous characters or operations.");
      }
    }

    // Timeout for command execution
    const timeout = setTimeout(() => {
      return message.reply("⚠️ Command execution timed out (10 seconds limit).");
    }, 10000);

    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      clearTimeout(timeout);
      
      if (error) {
        console.error(`Error executing command: ${error}`);
        return message.reply(`An error occurred while executing the command: ${error.message}`);
      }

      if (stderr) {
        console.error(`Command execution resulted in an error: ${stderr}`);
        return message.reply(`Command execution resulted in an error: ${stderr}`);
      }

      // Limit output length to prevent spam
      let output = stdout.toString();
      if (output.length > 2000) {
        output = output.substring(0, 2000) + "\n... (output truncated)";
      }

      console.log(`Command executed successfully:\n${output}`);
      message.reply(`Command executed successfully:\n${output}`);
    });
  }
};