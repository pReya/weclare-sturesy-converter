#!/usr/bin/env node

"use strict";

const meow = require("meow");
const fs = require("fs");
const nanoid = require("nanoid");
const xml2js = require("xml2js");
const striptags = require("striptags");

const cli = meow(`
  Usage
    $ weclare-convert <input> <output>

  Examples
    $ weclare-convert input.xml output.json
`);

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

const logObject = data => {
  console.dir(data, { showHidden: false, depth: 6, colors: false });
};

const transform = (err, result) => {
  if (result) {
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
    console.log(`Done`);
    fs.writeFileSync(cli.input[1], JSON.stringify(output, null, 2));
    // logObject(output);
  } else {
    console.log("Error: ", err);
  }
};

const parser = new xml2js.Parser({
  explicitChildren: true,
  preserveChildrenOrder: true,
  childkey: "_children",
  ignoreAttrs: true,
  valueProcessors: [value => striptags(value)],
  trim: true
});

const contents = fs.readFileSync(cli.input[0], "utf8");

parser.parseString(contents, transform);
