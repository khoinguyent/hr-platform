#!/usr/bin/env node

const { MCPGitHelper } = require('./mcp-git-helper');
const { MCPCommitGenerator } = require('./mcp-commit-generator');

class MCPWorkflow {
  constructor() {
    this.gitHelper = new MCPGitHelper();
    this.commitGenerator = new MCPCommitGenerator();
  }

  // Complete workflow: analyze, generate message, commit, and push
  async commitAndPush(options = {}) {
    console.log('🚀 Starting MCP Workflow: Commit and Push\n');

    try {
      // Step 1: Analyze changes
      console.log('📊 Step 1: Analyzing changes...');
      const changes = this.gitHelper.analyzeChanges();
      
      if (!changes.success) {
        throw new Error(`Failed to analyze changes: ${changes.error}`);
      }

      const totalChanges = changes.summary.totalModified + 
                          changes.summary.totalAdded + 
                          changes.summary.totalDeleted + 
                          changes.summary.totalRenamed;

      if (totalChanges === 0) {
        console.log('✅ No changes to commit');
        return { success: true, message: 'No changes to commit' };
      }

      console.log(`📈 Found ${totalChanges} changes:`);
      console.log(`   Modified: ${changes.summary.totalModified}`);
      console.log(`   Added: ${changes.summary.totalAdded}`);
      console.log(`   Deleted: ${changes.summary.totalDeleted}`);
      console.log(`   Renamed: ${changes.summary.totalRenamed}\n`);

      // Step 2: Generate commit message
      console.log('✍️  Step 2: Generating commit message...');
      const commitMessage = this.commitGenerator.generateCommitMessage(changes.changes);
      
      console.log(`📝 Generated commit message:`);
      console.log(`   Type: ${commitMessage.type}`);
      console.log(`   Scope: ${commitMessage.scope || 'none'}`);
      console.log(`   Description: ${commitMessage.description}\n`);

      // Step 3: Stage files
      console.log('📁 Step 3: Staging files...');
      const stageResult = this.gitHelper.stageFiles(options.files || []);
      
      if (!stageResult.success) {
        throw new Error(`Failed to stage files: ${stageResult.error}`);
      }

      console.log('✅ Files staged successfully\n');

      // Step 4: Commit changes
      console.log('💾 Step 4: Committing changes...');
      const commitResult = this.gitHelper.commitChanges(commitMessage.fullMessage);
      
      if (!commitResult.success) {
        throw new Error(`Failed to commit changes: ${commitResult.error}`);
      }

      console.log('✅ Changes committed successfully\n');

      // Step 5: Push to remote
      console.log('🚀 Step 5: Pushing to remote...');
      const pushResult = this.gitHelper.pushToRemote(options.branch);
      
      if (!pushResult.success) {
        throw new Error(`Failed to push to remote: ${pushResult.error}`);
      }

      console.log(`✅ Successfully pushed to ${pushResult.branch}\n`);

      return {
        success: true,
        commitMessage: commitMessage,
        changes: changes,
        branch: pushResult.branch
      };

    } catch (error) {
      console.error(`❌ Workflow failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Quick commit workflow (without push)
  async quickCommit(options = {}) {
    console.log('⚡ Starting Quick Commit Workflow\n');

    try {
      // Analyze and generate message
      const changes = this.gitHelper.analyzeChanges();
      if (!changes.success) {
        throw new Error(`Failed to analyze changes: ${changes.error}`);
      }

      const commitMessage = this.commitGenerator.generateCommitMessage(changes.changes);
      
      // Stage and commit
      this.gitHelper.stageFiles(options.files || []);
      this.gitHelper.commitChanges(commitMessage.fullMessage);

      console.log('✅ Quick commit completed successfully');
      
      return {
        success: true,
        commitMessage: commitMessage,
        changes: changes
      };

    } catch (error) {
      console.error(`❌ Quick commit failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Feature branch workflow
  async featureWorkflow(featureName, options = {}) {
    console.log(`🌿 Starting Feature Workflow: ${featureName}\n`);

    try {
      // Create feature branch
      console.log('📋 Step 1: Creating feature branch...');
      const branchResult = this.gitHelper.createBranch(featureName);
      
      if (!branchResult.success) {
        throw new Error(`Failed to create branch: ${branchResult.error}`);
      }

      console.log(`✅ Created branch: ${branchResult.branch}\n`);

      // Commit and push
      const result = await this.commitAndPush({
        ...options,
        branch: featureName
      });

      if (result.success) {
        console.log(`🎉 Feature workflow completed for: ${featureName}`);
      }

      return result;

    } catch (error) {
      console.error(`❌ Feature workflow failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Release workflow
  async releaseWorkflow(version, options = {}) {
    console.log(`🏷️  Starting Release Workflow: ${version}\n`);

    try {
      // Create release branch
      const releaseBranch = `release/v${version}`;
      console.log(`📋 Step 1: Creating release branch: ${releaseBranch}`);
      
      const branchResult = this.gitHelper.createBranch(releaseBranch);
      if (!branchResult.success) {
        throw new Error(`Failed to create release branch: ${branchResult.error}`);
      }

      // Generate release commit message
      const changes = this.gitHelper.analyzeChanges();
      const commitMessage = this.commitGenerator.generateCommitMessage(changes.changes);
      
      // Add version to commit message
      const releaseMessage = `release(${version}): ${commitMessage.description}\n\n${commitMessage.body}\n\nVersion: ${version}`;

      // Stage, commit, and push
      this.gitHelper.stageFiles();
      this.gitHelper.commitChanges(releaseMessage);
      this.gitHelper.pushToRemote(releaseBranch);

      console.log(`🎉 Release ${version} created successfully`);
      
      return {
        success: true,
        version: version,
        branch: releaseBranch,
        commitMessage: releaseMessage
      };

    } catch (error) {
      console.error(`❌ Release workflow failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Show current status
  showStatus() {
    console.log('📊 Current Git Status\n');

    try {
      const changes = this.gitHelper.analyzeChanges();
      const currentBranch = this.gitHelper.getCurrentBranch();
      const commitHistory = this.gitHelper.getCommitHistory(5);

      console.log(`🌿 Current Branch: ${currentBranch.branch}`);
      console.log(`📈 Changes Summary:`);
      console.log(`   Modified: ${changes.summary.totalModified}`);
      console.log(`   Added: ${changes.summary.totalAdded}`);
      console.log(`   Deleted: ${changes.summary.totalDeleted}`);
      console.log(`   Renamed: ${changes.summary.totalRenamed}`);
      console.log(`   Untracked: ${changes.summary.totalUntracked}`);

      if (commitHistory.success && commitHistory.history.length > 0) {
        console.log(`\n📜 Recent Commits:`);
        commitHistory.history.forEach(commit => {
          console.log(`   ${commit}`);
        });
      }

    } catch (error) {
      console.error(`❌ Failed to get status: ${error.message}`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const workflow = new MCPWorkflow();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'commit-and-push':
      workflow.commitAndPush()
        .then(result => {
          if (result.success) {
            console.log('🎉 Workflow completed successfully!');
          } else {
            process.exit(1);
          }
        });
      break;

    case 'quick-commit':
      workflow.quickCommit()
        .then(result => {
          if (result.success) {
            console.log('🎉 Quick commit completed!');
          } else {
            process.exit(1);
          }
        });
      break;

    case 'feature':
      if (args.length === 0) {
        console.error('❌ Feature name required');
        process.exit(1);
      }
      workflow.featureWorkflow(args[0])
        .then(result => {
          if (result.success) {
            console.log('🎉 Feature workflow completed!');
          } else {
            process.exit(1);
          }
        });
      break;

    case 'release':
      if (args.length === 0) {
        console.error('❌ Version required (e.g., 1.0.0)');
        process.exit(1);
      }
      workflow.releaseWorkflow(args[0])
        .then(result => {
          if (result.success) {
            console.log('🎉 Release workflow completed!');
          } else {
            process.exit(1);
          }
        });
      break;

    case 'status':
      workflow.showStatus();
      break;

    default:
      console.log(`
🚀 MCP Workflow Commands:

  commit-and-push    Complete workflow: analyze, commit, and push
  quick-commit       Quick commit without push
  feature <name>     Create feature branch and commit
  release <version>  Create release branch with version
  status            Show current git status

Examples:
  node mcp-workflow.js commit-and-push
  node mcp-workflow.js feature user-authentication
  node mcp-workflow.js release 1.2.0
  node mcp-workflow.js status
      `);
  }
}

module.exports = { MCPWorkflow }; 