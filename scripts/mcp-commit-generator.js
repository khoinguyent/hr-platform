#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPCommitGenerator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  // Analyze changes and generate commit message
  generateCommitMessage(changes) {
    const { modified, added, deleted, renamed } = changes;
    
    // Determine commit type based on changes
    const commitType = this.determineCommitType(changes);
    
    // Generate scope based on file patterns
    const scope = this.determineScope(changes);
    
    // Generate description
    const description = this.generateDescription(changes);
    
    // Generate detailed body
    const body = this.generateBody(changes);
    
    return {
      type: commitType,
      scope: scope,
      description: description,
      body: body,
      fullMessage: `${commitType}${scope ? `(${scope})` : ''}: ${description}\n\n${body}`
    };
  }

  // Determine commit type based on changes
  determineCommitType(changes) {
    const { modified, added, deleted, renamed } = changes;
    
    // Check for breaking changes
    if (this.hasBreakingChanges(changes)) {
      return 'BREAKING CHANGE';
    }
    
    // Check for new features
    if (added.some(file => this.isFeatureFile(file))) {
      return 'feat';
    }
    
    // Check for bug fixes
    if (modified.some(file => this.isBugFixFile(file))) {
      return 'fix';
    }
    
    // Check for documentation
    if (this.isDocumentationChange(changes)) {
      return 'docs';
    }
    
    // Check for styling
    if (this.isStylingChange(changes)) {
      return 'style';
    }
    
    // Check for refactoring
    if (this.isRefactoringChange(changes)) {
      return 'refactor';
    }
    
    // Check for tests
    if (this.isTestChange(changes)) {
      return 'test';
    }
    
    // Check for build/CI changes
    if (this.isBuildChange(changes)) {
      return 'build';
    }
    
    // Default to chore
    return 'chore';
  }

  // Determine scope based on file patterns
  determineScope(changes) {
    const allFiles = [
      ...changes.modified,
      ...changes.added,
      ...changes.deleted,
      ...changes.renamed
    ];
    
    const scopes = new Set();
    
    allFiles.forEach(file => {
      if (file.includes('services/auth-service')) {
        scopes.add('auth-service');
      } else if (file.includes('services/job-service')) {
        scopes.add('job-service');
      } else if (file.includes('frontend')) {
        scopes.add('frontend');
      } else if (file.includes('scripts')) {
        scopes.add('scripts');
      } else if (file.includes('docker')) {
        scopes.add('docker');
      } else if (file.includes('docs') || file.endsWith('.md')) {
        scopes.add('docs');
      }
    });
    
    if (scopes.size === 1) {
      return Array.from(scopes)[0];
    } else if (scopes.size > 1) {
      return 'multiple';
    }
    
    return null;
  }

  // Generate description based on changes
  generateDescription(changes) {
    const { modified, added, deleted, renamed } = changes;
    
    const descriptions = [];
    
    if (added.length > 0) {
      descriptions.push(`add ${this.summarizeFiles(added)}`);
    }
    
    if (modified.length > 0) {
      descriptions.push(`update ${this.summarizeFiles(modified)}`);
    }
    
    if (deleted.length > 0) {
      descriptions.push(`remove ${this.summarizeFiles(deleted)}`);
    }
    
    if (renamed.length > 0) {
      descriptions.push(`rename ${this.summarizeFiles(renamed)}`);
    }
    
    return descriptions.join(', ');
  }

  // Generate detailed body
  generateBody(changes) {
    const { modified, added, deleted, renamed } = changes;
    
    const body = [];
    
    if (added.length > 0) {
      body.push('Added:');
      added.forEach(file => body.push(`- ${file}`));
      body.push('');
    }
    
    if (modified.length > 0) {
      body.push('Modified:');
      modified.forEach(file => body.push(`- ${file}`));
      body.push('');
    }
    
    if (deleted.length > 0) {
      body.push('Deleted:');
      deleted.forEach(file => body.push(`- ${file}`));
      body.push('');
    }
    
    if (renamed.length > 0) {
      body.push('Renamed:');
      renamed.forEach(file => body.push(`- ${file}`));
      body.push('');
    }
    
    return body.join('\n');
  }

  // Helper methods
  hasBreakingChanges(changes) {
    const allFiles = [
      ...changes.modified,
      ...changes.added,
      ...changes.deleted,
      ...changes.renamed
    ];
    
    return allFiles.some(file => 
      file.includes('package.json') || 
      file.includes('docker-compose') ||
      file.includes('schema.sql')
    );
  }

  isFeatureFile(file) {
    return file.includes('src/') && 
           (file.includes('Controller') || 
            file.includes('Service') || 
            file.includes('Model') ||
            file.includes('Routes'));
  }

  isBugFixFile(file) {
    return file.includes('fix') || 
           file.includes('bug') || 
           file.includes('error') ||
           file.includes('exception');
  }

  isDocumentationChange(changes) {
    const allFiles = [
      ...changes.modified,
      ...changes.added,
      ...changes.deleted,
      ...changes.renamed
    ];
    
    return allFiles.some(file => 
      file.endsWith('.md') || 
      file.includes('README') || 
      file.includes('docs/')
    );
  }

  isStylingChange(changes) {
    const allFiles = [
      ...changes.modified,
      ...changes.added,
      ...changes.deleted,
      ...changes.renamed
    ];
    
    return allFiles.some(file => 
      file.endsWith('.css') || 
      file.endsWith('.scss') || 
      file.endsWith('.less') ||
      file.includes('style')
    );
  }

  isRefactoringChange(changes) {
    const allFiles = [
      ...changes.modified,
      ...changes.added,
      ...changes.deleted,
      ...changes.renamed
    ];
    
    return allFiles.some(file => 
      file.includes('refactor') || 
      file.includes('cleanup') || 
      file.includes('optimize')
    );
  }

  isTestChange(changes) {
    const allFiles = [
      ...changes.modified,
      ...changes.added,
      ...changes.deleted,
      ...changes.renamed
    ];
    
    return allFiles.some(file => 
      file.includes('test') || 
      file.includes('spec') || 
      file.includes('__tests__')
    );
  }

  isBuildChange(changes) {
    const allFiles = [
      ...changes.modified,
      ...changes.added,
      ...changes.deleted,
      ...changes.renamed
    ];
    
    return allFiles.some(file => 
      file.includes('Dockerfile') || 
      file.includes('docker-compose') || 
      file.includes('package.json') ||
      file.includes('webpack') ||
      file.includes('babel') ||
      file.includes('jest')
    );
  }

  summarizeFiles(files) {
    if (files.length === 0) return '';
    
    const categories = {
      controllers: files.filter(f => f.includes('Controller')),
      models: files.filter(f => f.includes('Model')),
      routes: files.filter(f => f.includes('Routes')),
      services: files.filter(f => f.includes('Service')),
      config: files.filter(f => f.includes('config')),
      docs: files.filter(f => f.endsWith('.md')),
      docker: files.filter(f => f.includes('Docker')),
      scripts: files.filter(f => f.includes('scripts'))
    };
    
    const summaries = [];
    
    Object.entries(categories).forEach(([category, categoryFiles]) => {
      if (categoryFiles.length > 0) {
        summaries.push(`${categoryFiles.length} ${category}`);
      }
    });
    
    if (summaries.length === 0) {
      return `${files.length} files`;
    }
    
    return summaries.join(', ');
  }

  // Get changes from git status
  getChangesFromGit() {
    try {
      const status = execSync('git status --porcelain', { 
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

      status.split('\n').filter(line => line.trim()).forEach(line => {
        const status = line.substring(0, 2).trim();
        const file = line.substring(3);
        
        if (status === 'M') changes.modified.push(file);
        else if (status === 'A') changes.added.push(file);
        else if (status === 'D') changes.deleted.push(file);
        else if (status === 'R') changes.renamed.push(file);
        else if (status === '??') changes.untracked.push(file);
      });

      return changes;
    } catch (error) {
      throw new Error(`Failed to get git status: ${error.message}`);
    }
  }
}

// MCP Server implementation
class MCPCommitGeneratorServer {
  constructor() {
    this.generator = new MCPCommitGenerator();
  }

  async handleRequest(request) {
    const { method, params } = request;

    switch (method) {
      case 'generate-commit-message':
        const changes = params.changes || this.generator.getChangesFromGit();
        return this.generator.generateCommitMessage(changes);
      
      case 'analyze-and-generate':
        const gitChanges = this.generator.getChangesFromGit();
        return {
          changes: gitChanges,
          commitMessage: this.generator.generateCommitMessage(gitChanges)
        };
      
      default:
        return { success: false, error: `Unknown method: ${method}` };
    }
  }
}

// CLI interface
if (require.main === module) {
  const server = new MCPCommitGeneratorServer();
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

module.exports = { MCPCommitGenerator, MCPCommitGeneratorServer }; 