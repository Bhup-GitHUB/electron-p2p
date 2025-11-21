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

  async executePython(code) {
    return new Promise((resolve, reject) => {
      const tempFilePath = path.join(__dirname, 'temp_script.py');
      
      try {
        fs.writeFileSync(tempFilePath, code);
      } catch (err) {
        return reject(new Error(`Failed to write temp file: ${err.message}`));
      }

      // Command to open a new CMD window, run the script, and pause so output is visible
      const command = `start cmd /c "python "${tempFilePath}" & echo. & echo Press any key to close... & pause"`;

      exec(command, (error) => {
        if (error) {
          reject(new Error(`Failed to launch CMD: ${error.message}`));
        } else {
          resolve('Code executing in a new CMD window on the remote machine.');
        }
      });
    });
  }
}

module.exports = CodeExecutor;

