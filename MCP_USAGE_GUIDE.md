# 🚀 MCP (Model Context Protocol) Usage Guide

This guide shows you how to use MCP tools to automate common development tasks like generating commit messages, committing changes, and pushing to remote repositories.

## 📋 **What is MCP?**

MCP (Model Context Protocol) is a framework for building AI-powered development tools that can:
- Analyze code changes intelligently
- Generate meaningful commit messages
- Automate git workflows
- Provide context-aware assistance

## 🛠️ **Available MCP Tools**

### **1. MCP Git Helper** (`mcp-git-helper.js`)
Handles all git operations:
- Analyze changes
- Stage files
- Commit changes
- Push to remote
- Branch management

### **2. MCP Commit Generator** (`mcp-commit-generator.js`)
Intelligently generates commit messages:
- Analyzes file changes
- Determines commit type (feat, fix, docs, etc.)
- Identifies scope (auth-service, job-service, etc.)
- Generates descriptive messages

### **3. MCP Workflow** (`mcp-workflow.js`)
Complete automation workflows:
- Commit and push
- Feature branch creation
- Release management
- Quick commits

## 🚀 **Quick Start**

### **1. Basic Usage**

```bash
# Navigate to scripts directory
cd scripts

# Show current git status
node mcp-workflow.js status

# Complete workflow: analyze, commit, and push
node mcp-workflow.js commit-and-push

# Quick commit (without push)
node mcp-workflow.js quick-commit
```

### **2. Feature Development**

```bash
# Create feature branch and commit
node mcp-workflow.js feature user-authentication

# This will:
# 1. Create branch: user-authentication
# 2. Analyze changes
# 3. Generate commit message
# 4. Commit and push
```

### **3. Release Management**

```bash
# Create release branch
node mcp-workflow.js release 1.2.0

# This will:
# 1. Create branch: release/v1.2.0
# 2. Generate release commit message
# 3. Commit and push
```

## 📊 **Detailed Commands**

### **MCP Workflow Commands**

| Command | Description | Example |
|---------|-------------|---------|
| `status` | Show current git status | `node mcp-workflow.js status` |
| `commit-and-push` | Complete workflow | `node mcp-workflow.js commit-and-push` |
| `quick-commit` | Quick commit without push | `node mcp-workflow.js quick-commit` |
| `feature <name>` | Create feature branch | `node mcp-workflow.js feature auth-improvements` |
| `release <version>` | Create release branch | `node mcp-workflow.js release 1.3.0` |

### **Individual Tool Commands**

#### **Git Helper**
```bash
# Analyze changes
node mcp-git-helper.js analyze-changes

# Stage files
node mcp-git-helper.js stage-files '["file1.js", "file2.js"]'

# Commit changes
node mcp-git-helper.js commit-changes '{"message": "feat: add new feature"}'

# Push to remote
node mcp-git-helper.js push-to-remote

# Get current branch
node mcp-git-helper.js get-current-branch

# Create new branch
node mcp-git-helper.js create-branch '{"branchName": "feature/new-feature"}'
```

#### **Commit Generator**
```bash
# Generate commit message from git status
node mcp-commit-generator.js analyze-and-generate

# Generate commit message for specific changes
node mcp-commit-generator.js generate-commit-message '{"changes": {...}}'
```

## 🎯 **Example Workflows**

### **Scenario 1: Daily Development**

```bash
# 1. Make your changes
# 2. Check status
node mcp-workflow.js status

# 3. Commit and push
node mcp-workflow.js commit-and-push
```

**Output:**
```
🚀 Starting MCP Workflow: Commit and Push

📊 Step 1: Analyzing changes...
📈 Found 3 changes:
   Modified: 2
   Added: 1
   Deleted: 0

✍️  Step 2: Generating commit message...
📝 Generated commit message:
   Type: feat
   Scope: job-service
   Description: add job search functionality

📁 Step 3: Staging files...
✅ Files staged successfully

💾 Step 4: Committing changes...
✅ Changes committed successfully

🚀 Step 5: Pushing to remote...
✅ Successfully pushed to job-service

🎉 Workflow completed successfully!
```

### **Scenario 2: Feature Development**

```bash
# 1. Start new feature
node mcp-workflow.js feature user-profile-management

# 2. Make changes...

# 3. Commit and push
node mcp-workflow.js commit-and-push
```

### **Scenario 3: Release Preparation**

```bash
# 1. Create release branch
node mcp-workflow.js release 2.0.0

# 2. Make final changes...

# 3. Commit and push
node mcp-workflow.js commit-and-push
```

## 🔧 **Commit Message Types**

The MCP Commit Generator automatically determines commit types:

| Type | Description | When Used |
|------|-------------|-----------|
| `feat` | New feature | New functionality added |
| `fix` | Bug fix | Bug fixes |
| `docs` | Documentation | README, docs updates |
| `style` | Styling | CSS, formatting changes |
| `refactor` | Refactoring | Code restructuring |
| `test` | Testing | Test files, test updates |
| `build` | Build system | Docker, CI/CD, dependencies |
| `chore` | Maintenance | General maintenance |

## 🎨 **Commit Message Format**

Generated messages follow conventional commits format:

```
type(scope): description

Detailed body with file changes

- Added: file1.js, file2.js
- Modified: file3.js
- Deleted: file4.js
```

**Examples:**
```
feat(job-service): add job search functionality

Added:
- services/job-service/src/controllers/searchController.js
- services/job-service/src/routes/searchRoutes.js

Modified:
- services/job-service/src/models/jobModel.js
```

```
fix(auth-service): resolve JWT token validation issue

Modified:
- services/auth-service/src/middleware/authMiddleware.js
- services/auth-service/src/controllers/authController.js
```

## 🛠️ **Customization**

### **1. Custom Commit Types**

Edit `mcp-commit-generator.js` to add custom commit types:

```javascript
// Add custom commit type detection
isCustomChange(changes) {
  // Your custom logic here
  return changes.some(file => file.includes('custom-pattern'));
}
```

### **2. Custom Scopes**

Add new scope detection in `determineScope()`:

```javascript
if (file.includes('services/custom-service')) {
  scopes.add('custom-service');
}
```

### **3. Custom Workflows**

Create new workflows in `mcp-workflow.js`:

```javascript
async customWorkflow(options = {}) {
  // Your custom workflow logic
}
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"No changes to commit"**
   - Make sure you have unstaged changes
   - Check `git status` manually

2. **"Failed to push to remote"**
   - Check remote repository access
   - Verify branch exists on remote

3. **"Permission denied"**
   - Make scripts executable: `chmod +x scripts/mcp-*.js`
   - Check file permissions

### **Debug Mode**

Add debug logging:

```bash
# Set debug environment variable
DEBUG=true node mcp-workflow.js commit-and-push
```

### **Manual Override**

If automatic generation fails, you can manually specify:

```bash
# Manual commit with custom message
git commit -m "your custom message"
```

## 📈 **Best Practices**

### **1. Regular Commits**
- Commit frequently with small, focused changes
- Use `quick-commit` for local development
- Use `commit-and-push` for shared changes

### **2. Meaningful Branches**
- Use descriptive feature branch names
- Follow naming conventions: `feature/`, `fix/`, `release/`

### **3. Review Generated Messages**
- Always review generated commit messages
- Edit if needed before pushing

### **4. Use Appropriate Workflows**
- `quick-commit`: Local development
- `commit-and-push`: Shared features
- `feature`: New features
- `release`: Version releases

## 🎉 **Benefits**

Using MCP tools provides:

✅ **Consistency** - Standardized commit messages
✅ **Efficiency** - Automated workflows
✅ **Quality** - Intelligent analysis of changes
✅ **Time Savings** - Reduced manual git operations
✅ **Better History** - Meaningful commit history

## 🔄 **Integration with IDEs**

### **VS Code Integration**

Add to your VS Code settings:

```json
{
  "git.postCommitCommand": "node scripts/mcp-workflow.js quick-commit"
}
```

### **Git Hooks**

Create pre-commit hook:

```bash
#!/bin/sh
node scripts/mcp-workflow.js quick-commit
```

This MCP setup transforms your development workflow, making git operations faster, more consistent, and more intelligent! 🚀 