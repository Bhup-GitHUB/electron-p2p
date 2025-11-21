const { spawn, exec } = require('child_process');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

class CodeExecutor {
  constructor() {
    this.timeout = 10000;
  }

  async execute(language, code) {
    switch (language) {
      case 'javascript':
        return await this.executeJavaScript(code);
      case 'python':
        return await this.executePython(code);
      case 'docker':
        return await this.executeDocker(code);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  async executeJavaScript(code) {
    return new Promise((resolve, reject) => {
      let output = '';
      
      try {
        const sandbox = {
          console: {
            log: (...args) => {
              output += args.join(' ') + '\n';
            }
          }
        };

        vm.createContext(sandbox);
        vm.runInContext(code, sandbox, {
          timeout: this.timeout,
          displayErrors: true
        });
        
        resolve(output || 'Code executed successfully (no output)');
      } catch (error) {
        reject(error);
      }
    });
  }

  async executeDocker(composeContent) {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const tempDir = path.join(__dirname, `temp_docker_${timestamp}`);
      const composeFilePath = path.join(tempDir, 'docker-compose.yml');

      try {
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir);
        }
        fs.writeFileSync(composeFilePath, composeContent);
      } catch (err) {
        return reject(new Error(`Failed to write docker-compose file: ${err.message}`));
      }

      // Command to open a new CMD window, navigate to temp dir, run docker-compose up, and pause
      // We use 'cd /d' to ensure drive change if needed
      const command = `start cmd /c "cd /d "${tempDir}" & echo Starting Docker Compose... & docker-compose up & echo. & echo Press Ctrl+C to stop containers (if attached) and then any key to close this window... & pause"`;

      exec(command, (error) => {
        if (error) {
          reject(new Error(`Failed to launch CMD for Docker: ${error.message}`));
        } else {
          resolve(`Docker Compose started in a new window.\nDirectory: ${tempDir}`);
        }
      });
    });
  }
}

module.exports = CodeExecutor;

