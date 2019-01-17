#!/usr/bin/env node

"use strict";

const meow = require("meow");
const fs = require("fs");
const nanoid = require("nanoid");
const xml2js = require("xml2js");
const he = require("he");
const path = require("path");

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
  console.log(`Found ${base.length} questions in file. Converting...`);
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
          answers[correctAnswerIdx].isCorrect = true;
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
    $ weclare-convert <input> [<output>]

  Examples
    $ weclare-convert input.xml output.json
    $ weclare-convert input.xml
`);

if (cli.input.length === 1 || cli.input.length === 2) {
  const inputFilename = path.parse(cli.input[0]);
  const outputFilename =
    cli.input.length === 2 ? path.parse(cli.input[1]) : null;
  const contents = fs.readFileSync(cli.input[0], "utf8");
  let output;
  parser.parseString(contents, (err, result) => {
    if (result) {
      console.log(`Reading file ${inputFilename.base}...`);
      output = transform(result);
      console.log(
        `Done converting. Saving to ${
          outputFilename ? outputFilename.name : inputFilename.name
        }.json...`
      );
      fs.writeFileSync(
        `${outputFilename ? outputFilename.name : inputFilename.name}.json`,
        JSON.stringify(output, null, 2)
      );
      console.log(`Saving successful`);
    } else if (err) console.log("Error: ", err);
  });
} else {
  cli.showHelp();
}
