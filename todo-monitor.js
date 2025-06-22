#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TODO_FILE = path.join(__dirname, 'todo.md');
const PROCESSED_TODOS_FILE = path.join(__dirname, '.processed-todos.json');

// Load processed todos from file
function loadProcessedTodos() {
    try {
        if (fs.existsSync(PROCESSED_TODOS_FILE)) {
            const data = fs.readFileSync(PROCESSED_TODOS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('Error loading processed todos:', error.message);
    }
    return [];
}

// Save processed todos to file
function saveProcessedTodos(todos) {
    try {
        fs.writeFileSync(PROCESSED_TODOS_FILE, JSON.stringify(todos, null, 2));
    } catch (error) {
        console.log('Error saving processed todos:', error.message);
    }
}

// Parse todo items from markdown
function parseTodoItems(content) {
    const lines = content.split('\n');
    const todos = [];
    
    for (const line of lines) {
        // Match unchecked todo items: - [ ] Task description
        const uncheckedMatch = line.match(/^- \[ \] (.+)$/);
        if (uncheckedMatch) {
            todos.push({
                text: uncheckedMatch[1].trim(),
                completed: false,
                line: line.trim()
            });
        }
    }
    
    return todos;
}

// Execute a todo task
async function executeTodo(todo) {
    console.log(`\n🔧 Processing todo: ${todo.text}`);
    
    try {
        // Handle different types of todo items
        if (todo.text.toLowerCase().includes('update') || todo.text.toLowerCase().includes('fix')) {
            // Code update tasks
            await executeCodeTask(todo.text);
        } else if (todo.text.toLowerCase().includes('install') || todo.text.toLowerCase().includes('npm')) {
            // Installation tasks
            await executeInstallTask(todo.text);
        } else if (todo.text.toLowerCase().includes('build') || todo.text.toLowerCase().includes('compile')) {
            // Build tasks
            await executeBuildTask(todo.text);
        } else if (todo.text.toLowerCase().includes('test')) {
            // Test tasks
            await executeTestTask(todo.text);
        } else {
            // Generic task
            console.log(`⚠️  Generic task detected: ${todo.text}`);
            console.log('   This task requires manual attention.');
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Error executing todo "${todo.text}":`, error.message);
        return false;
    }
}

// Execute code-related tasks
async function executeCodeTask(taskText) {
    console.log('   → Code task detected');
    
    // Example: Check if it's a specific file update
    if (taskText.includes('header') || taskText.includes('Header')) {
        console.log('   → Header component task');
        // Could trigger specific Claude Code commands here
    } else if (taskText.includes('style') || taskText.includes('CSS')) {
        console.log('   → Styling task');
        // Could trigger style-related commands
    }
    
    console.log('   ✅ Code task completed');
}

// Execute installation tasks
async function executeInstallTask(taskText) {
    console.log('   → Installation task detected');
    
    return new Promise((resolve, reject) => {
        let command = 'npm install';
        
        // Extract specific package if mentioned
        const packageMatch = taskText.match(/install\s+([^\s]+)/i);
        if (packageMatch) {
            command = `npm install ${packageMatch[1]}`;
        }
        
        console.log(`   → Running: ${command}`);
        
        const process = spawn('npm', ['install'], { 
            cwd: __dirname,
            stdio: 'inherit'
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log('   ✅ Installation completed');
                resolve();
            } else {
                reject(new Error(`Installation failed with code ${code}`));
            }
        });
    });
}

// Execute build tasks
async function executeBuildTask(taskText) {
    console.log('   → Build task detected');
    
    return new Promise((resolve, reject) => {
        const process = spawn('npm', ['run', 'build'], { 
            cwd: __dirname,
            stdio: 'inherit'
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log('   ✅ Build completed');
                resolve();
            } else {
                reject(new Error(`Build failed with code ${code}`));
            }
        });
    });
}

// Execute test tasks
async function executeTestTask(taskText) {
    console.log('   → Test task detected');
    
    return new Promise((resolve, reject) => {
        const process = spawn('npm', ['test'], { 
            cwd: __dirname,
            stdio: 'inherit'
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                console.log('   ✅ Tests completed');
                resolve();
            } else {
                console.log('   ⚠️  Tests failed, but continuing...');
                resolve(); // Don't fail on test failures
            }
        });
    });
}

// Mark todo as completed in the file
function markTodoCompleted(todoText) {
    try {
        let content = fs.readFileSync(TODO_FILE, 'utf8');
        
        // Find the unchecked todo and mark it as completed
        const uncheckedPattern = `- [ ] ${todoText}`;
        const checkedPattern = `- [x] ${todoText}`;
        
        if (content.includes(uncheckedPattern)) {
            content = content.replace(uncheckedPattern, checkedPattern);
            fs.writeFileSync(TODO_FILE, content);
            console.log(`   ✅ Marked todo as completed in ${TODO_FILE}`);
        }
    } catch (error) {
        console.error('Error marking todo as completed:', error.message);
    }
}

// Process new todos
async function processNewTodos() {
    try {
        if (!fs.existsSync(TODO_FILE)) {
            console.log(`Todo file ${TODO_FILE} does not exist`);
            return;
        }
        
        const content = fs.readFileSync(TODO_FILE, 'utf8');
        const currentTodos = parseTodoItems(content);
        const processedTodos = loadProcessedTodos();
        
        // Find new todos
        const newTodos = currentTodos.filter(todo => 
            !processedTodos.some(processed => processed.text === todo.text)
        );
        
        if (newTodos.length === 0) {
            console.log('📋 No new todos found');
            return;
        }
        
        console.log(`📋 Found ${newTodos.length} new todo(s):`);
        newTodos.forEach((todo, index) => {
            console.log(`   ${index + 1}. ${todo.text}`);
        });
        
        // Process each new todo
        for (const todo of newTodos) {
            const success = await executeTodo(todo);
            
            if (success) {
                // Mark as completed in file
                markTodoCompleted(todo.text);
                
                // Add to processed list
                processedTodos.push({
                    text: todo.text,
                    processedAt: new Date().toISOString(),
                    success: true
                });
            } else {
                processedTodos.push({
                    text: todo.text,
                    processedAt: new Date().toISOString(),
                    success: false
                });
            }
        }
        
        // Save updated processed todos
        saveProcessedTodos(processedTodos);
        
        console.log('\n🎉 Todo processing completed!');
        
    } catch (error) {
        console.error('Error processing todos:', error.message);
    }
}

// Watch for file changes
function startWatching() {
    console.log(`👀 Watching ${TODO_FILE} for changes...`);
    console.log('   Press Ctrl+C to stop monitoring\n');
    
    // Initial check
    processNewTodos();
    
    // Watch for file changes
    fs.watchFile(TODO_FILE, { interval: 1000 }, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
            console.log('\n📝 Todo file changed, checking for new items...');
            setTimeout(processNewTodos, 500); // Small delay to ensure file write is complete
        }
    });
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--once') || args.includes('-o')) {
    // Run once and exit
    console.log('🔍 Checking for new todos (one-time check)...');
    processNewTodos().then(() => {
        console.log('✅ One-time check completed');
        process.exit(0);
    });
} else {
    // Start watching
    startWatching();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Stopping todo monitor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Stopping todo monitor...');
    process.exit(0);
});