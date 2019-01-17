# weclare-sturesy-converter

This is a node.js command line tool to convert question sets from [StuReSy](https://github.com/sturesy) (XML based) to [Weclare](https://github.com/pReya/weclare) (JSON based).

### Usage:
Download/clone the repository, then do a `npm install` in the folder to install dependencies. Then you can use it like this:
```
weclare-convert input.xml output.json
```

The output parameter is optional. By default, output files will be created in the current directory and have the same name as the input file.

```
weclare-convert input.xml
```

### Limitations:
- "Duration" is not supported in Weclare
- Text question specific information (lowercase / uppercase, tolerance) will be lost
- All formatting information will get lost in the process
