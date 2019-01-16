# weclare-sturesy-converter

This is a node.js command line tool to convert question sets from [StuReSy](https://github.com/sturesy) (XML based) to [Weclare](https://github.com/pReya/weclare) (JSON based).

### Usage:
Download/clone the repository, then do a `npm install` in the folder to install dependencies. Then you can use it like this:
```
weclare-convert input.xml output.json
```

### Limitations:
- "Duration" is not supported in Weclare
- Formatting will get lost in the process
