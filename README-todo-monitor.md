# Todo Monitor System

A Node.js-based system that automatically monitors the `todo.md` file and processes new todo items when they are added.

## Features

- **Real-time monitoring**: Watches `todo.md` for changes using Node.js `fs.watchFile`
- **Automatic processing**: Detects new unchecked todo items and processes them
- **Task categorization**: Handles different types of tasks (code updates, installations, builds, tests)
- **State persistence**: Tracks processed todos to avoid duplicate processing
- **Auto-completion**: Marks completed todos in the markdown file

## Usage

### Start monitoring (runs continuously)
```bash
npm run todo:watch
```

### One-time check
```bash
npm run todo:check
```

### Direct execution
```bash
node todo-monitor.js
node todo-monitor.js --once
```

## Todo Format

Add new todos to `todo.md` using this format:
```markdown
- [ ] Your task description here
```

The monitor will automatically detect unchecked items and process them.

## Task Types

The system recognizes different task patterns:

- **Code tasks**: `update`, `fix` → Triggers code-related processing
- **Installation**: `install`, `npm` → Runs npm install commands  
- **Build tasks**: `build`, `compile` → Runs npm run build
- **Test tasks**: `test` → Runs npm test
- **Generic tasks**: Other patterns → Logs for manual attention

## Files

- `todo-monitor.js` - Main monitoring script
- `todo.md` - Todo list file being monitored
- `.processed-todos.json` - Internal state file (auto-generated)

## Example Workflow

1. Add a new todo: `- [ ] Update header styles`
2. Monitor detects the change
3. System processes the task based on keywords
4. Todo is marked as completed: `- [x] Update header styles`
5. Processing state is saved to prevent re-processing

## Technical Details

- Uses ES modules (import/export)
- File watching with 1-second polling interval
- Graceful error handling and logging
- Cross-platform compatibility (Linux, macOS, Windows)
- Process termination handling (SIGINT, SIGTERM)