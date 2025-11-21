const { spawn } = require('child_process');
const vm = require('vm');

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
      const python = spawn('python', ['-c', code]);
      let output = '';
      let error = '';

      const timeoutId = setTimeout(() => {
        python.kill();
        reject(new Error('Execution timeout'));
      }, this.timeout);

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        clearTimeout(timeoutId);
        if (code !== 0) {
          reject(new Error(error || 'Python execution failed'));
        } else {
          resolve(output || 'Code executed successfully (no output)');
        }
      });

      python.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to start Python: ${err.message}`));
      });
    });
  }
}

module.exports = CodeExecutor;

