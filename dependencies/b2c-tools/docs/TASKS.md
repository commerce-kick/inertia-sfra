
# tasks.json Usage

`b2c-tools tail` supports being run from `tasks.json` in VSCode and other editors supporting tasks (for instance [overseer](https://github.com/stevearc/overseer.nvim) for neovim). When adding the `--task` argument cartridge names are rewritten to be
project relative which means they can be matched by problem matchers (see example below).

https://github.com/user-attachments/assets/38bbde95-c3ec-4587-b30e-9a2a10ac58f6

## Example `tasks.json`

This matches the most common type of error (`ScriptingException`). Add other patterns as needed.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Tail Logs",
      "type": "shell",
      "command": "b2c-tools tail --task",
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      },
      "isBackground": true,
      "problemMatcher": [
        {
          "owner": "external",
          "source": "sfcc",
          "fileLocation": ["relative", "${workspaceFolder}"],
          "pattern": [
            {
                "regexp": "\\[.*?\\].*?ScriptingException\\s+(.*)\\s+\\((.*?)#(\\d+)\\)",
                "message": 1,
                "file": 2,
                "line": 3
            }
          ],
          "background": {
            "activeOnStart": true,
          }
        }
      ]
    }
  ]
}
```
