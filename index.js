#!/usr/bin/env node

"use strict";

const meow = require("meow");
const fs = require("fs");
const nanoid = require("nanoid");
const xml2js = require("xml2js");
const he = require("he");
const path = require("path");

const walkAndFindXml = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const extension = path.extname(file);
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkAndFindXml(path.join(dir, file), filelist);
    } else if (extension === ".xml") {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const newOutputQuestion = (mode, type, text, answers) => ({
  id: nanoid(6),
  type,
  mode,
  text,
  answers
});
const newOutputAnswer = text => ({
  id: nanoid(6),
  text,
  isCorrect: false
});

// const logObject = data => {
//   console.dir(data, { showHidden: false, depth: 6, colors: false });
// };

const transform = result => {
  // logObject(result);
  const base = result.questionset._children;
  console.log(`Found ${base.length} questions. Converting...`);
  const output = base.map(question => {
    let mode;
    let answers;
    let type = "question";
    const text = question.question[0];
    switch (question["#name"]) {
      case "multiplechoice":
        mode = "multi";
        answers = question.answers.map(answer => newOutputAnswer(answer));
        question.correctAnswers.forEach(correctAnswerIdx => {
          if (answers.length > correctAnswerIdx) {
            answers[correctAnswerIdx].isCorrect = true;
          }
        });

        break;
      case "questionmodel":
        mode = "single";
        answers = question.answer.map(answer => newOutputAnswer(answer));
        if (question.correct.length === 1 && question.correct[0] === "-1") {
          type = "vote";
        } else {
          question.correct.forEach(correctAnswerIdx => {
            answers[correctAnswerIdx].isCorrect = true;
          });
        }

        break;
      case "textquestion":
        mode = "text";
        answers = {};
        break;
      default:
      // do nothing
    }
    return newOutputQuestion(mode, type, text, answers);
  });
  // logObject(output);
  return output;
};

const parser = new xml2js.Parser({
  explicitChildren: true,
  preserveChildrenOrder: true,
  childkey: "_children",
  ignoreAttrs: true,
  valueProcessors: [
    value =>
      he.decode(
        value
          // Replace <br> with spaces
          .replace(/(<br ?\/?>)/g, " ")
          // Delete html tags
          .replace(/<[^>]+>/g, "")
          // Delete malformed \n
          .replace(/\\n/g, " ")
          // Delete double spaces
          .replace(/\s\s+/g, " ")
          .trim()
      )
  ]
});

const cli = meow(`
  Usage
    $ weclare-convert <input>

  Examples
    $ weclare-convert input.xml
    $ weclare-convert path/to/questions
`);

const xmlFiles = [];
if (cli.input.length === 1) {
  if (fs.statSync(cli.input[0]).isDirectory()) {
    console.log("Directory detected. Finding all xml files...");
    walkAndFindXml(cli.input[0], xmlFiles);
  } else {
    xmlFiles.push(cli.input[0]);
  }
  console.log(xmlFiles);
  xmlFiles.forEach(xmlFile => {
    const filename = path.parse(xmlFile);
    const contents = fs.readFileSync(xmlFile, "utf8");
    let output;
    parser.parseString(contents, (err, result) => {
      if (result) {
        console.log(`Reading file ${filename.base}...`);
        output = transform(result);
        console.log(`Done converting. Saving to ${filename.name}.json...`);
        fs.writeFileSync(
          `${filename.name}.json`,
          JSON.stringify(output, null, 2)
        );
        console.log(`Saving successful\n`);
      } else if (err) console.log("Error: ", err);
    });
  });
} else {
  cli.showHelp();
}
