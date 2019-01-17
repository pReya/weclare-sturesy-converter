# weclare-sturesy-converter

This is a node.js command line tool to convert question sets from [StuReSy](https://github.com/sturesy) (XML based) to [Weclare](https://github.com/pReya/weclare) (JSON based).

### Usage:
Download/clone the repository, then do a `npm install` in the folder to install dependencies. Run `npm link` to create a global symlink. Then you can use it like this:
```
weclare-convert input.xml
weclare-convert path/to/files
```

Output files will be created in the current directory and have the same name as the input file. You can also provide a directory as parameter. The converter will convert all .xml files it can find in this directory (including subdirectories).

### Limitations:
- "Duration" is not supported in Weclare
- Text question specific information (lowercase / uppercase, tolerance) will be lost
- All formatting information will get lost in the process
