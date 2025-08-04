#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPGitHelper {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  // Analyze git changes and return structured data
  analyzeChanges() {
    try {
      const status = execSync('git status --porcelain', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });
      
      const diff = execSync('git diff --cached --name-status', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });

      const changes = {
        modified: [],
        added: [],
        deleted: [],
        renamed: [],
        untracked: []
      };

      // Parse git status
      status.split('\n').filter(line => line.trim()).forEach(line => {
        const status = line.substring(0, 2).trim();
        const file = line.substring(3);
        
        if (status === 'M') changes.modified.push(file);
        else if (status === 'A') changes.added.push(file);
        else if (status === 'D') changes.deleted.push(file);
        else if (status === 'R') changes.renamed.push(file);
        else if (status === '??') changes.untracked.push(file);
      });

      return {
        success: true,
        changes,
        summary: {
          totalModified: changes.modified.length,
          totalAdded: changes.added.length,
          totalDeleted: changes.deleted.length,
          totalRenamed: changes.renamed.length,
          totalUntracked: changes.untracked.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get detailed diff for specific files
  getFileDiff(filePath) {
    try {
      const diff = execSync(`git diff ${filePath}`, { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });
      return {
        success: true,
        diff,
        file: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        file: filePath
      };
    }
  }

  // Stage files
  stageFiles(files) {
    try {
      if (files.length === 0) {
        execSync('git add .', { cwd: this.projectRoot });
      } else {
        files.forEach(file => {
          execSync(`git add ${file}`, { cwd: this.projectRoot });
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Commit changes with message
  commitChanges(message) {
    try {
      execSync(`git commit -m "${message}"`, { cwd: this.projectRoot });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Push to remote
  pushToRemote(branch = null) {
    try {
      const currentBranch = execSync('git branch --show-current', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim();
      
      const targetBranch = branch || currentBranch;
      execSync(`git push origin ${targetBranch}`, { cwd: this.projectRoot });
      
      return { 
        success: true, 
        branch: targetBranch 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get current branch
  getCurrentBranch() {
    try {
      const branch = execSync('git branch --show-current', { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      }).trim();
      return { success: true, branch };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get commit history
  getCommitHistory(limit = 10) {
    try {
      const history = execSync(`git log --oneline -${limit}`, { 
        cwd: this.projectRoot, 
        encoding: 'utf8' 
      });
      return { success: true, history: history.split('\n').filter(line => line.trim()) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create new branch
  createBranch(branchName) {
    try {
      execSync(`git checkout -b ${branchName}`, { cwd: this.projectRoot });
      return { success: true, branch: branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Switch branch
  switchBranch(branchName) {
    try {
      execSync(`git checkout ${branchName}`, { cwd: this.projectRoot });
      return { success: true, branch: branchName };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// MCP Server implementation
class MCPServer {
  constructor() {
    this.gitHelper = new MCPGitHelper();
  }

  async handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case 'analyze-changes':
        return this.gitHelper.analyzeChanges();
      
      case 'get-file-diff':
        return this.gitHelper.getFileDiff(params.filePath);
      
      case 'stage-files':
        return this.gitHelper.stageFiles(params.files || []);
      
      case 'commit-changes':
        return this.gitHelper.commitChanges(params.message);
      
      case 'push-to-remote':
        return this.gitHelper.pushToRemote(params.branch);
      
      case 'get-current-branch':
        return this.gitHelper.getCurrentBranch();
      
      case 'get-commit-history':
        return this.gitHelper.getCommitHistory(params.limit);
      
      case 'create-branch':
        return this.gitHelper.createBranch(params.branchName);
      
      case 'switch-branch':
        return this.gitHelper.switchBranch(params.branchName);
      
      default:
        return { success: false, error: `Unknown method: ${method}` };
    }
  }
}

// CLI interface
if (require.main === module) {
  const server = new MCPServer();
  const method = process.argv[2];
  const params = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  server.handleRequest({ method, params })
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
    });
}

module.exports = { MCPGitHelper, MCPServer }; 