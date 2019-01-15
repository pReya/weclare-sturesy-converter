#!/usr/bin/env node

"use strict";

const meow = require("meow");
const fs = require("fs");
const nanoid = require("nanoid");
const xml2js = require("xml2js");

const cli = meow(`
	Usage
	  $ weclare-convert <input> <output>

	Examples
	  $ weclare-convert sturesy.xml weclare.json
`);

const newOutputQuestion = (mode, type, text, answers) => ({
  id: nanoid(6),
  type,
  mode,
  text,
  answers
});

const newOutputAnswer = (text, isCorrect) => ({
  id: nanoid(6),
  text,
  isCorrect: false
});

const log = data => {
  console.dir(data, { showHidden: false, depth: 6, colors: true });
};

const transform = (err, result) => {
  log(result);
  //   // console.dir(result, { showHidden: false, depth: 4, colors: true });
  //   const singleChoiceQuestions = result.questionset.questionmodel;
  //   const multipleChoiceQuestions = result.questionset.multiplechoice;
  //   const textQuestions = result.questionset.textquestion;
  //   // console.dir(base, { showHidden: false, depth: 4, colors: true });

  //   const filtered = singleChoiceQuestions.map(question => {
  //     const answers = question.answer.map(answer => newOutputAnswer(answer));
  //     const type = question.correct[0] === "-1" ? "vote" : "question";
  //     if (type === "question") {
  //       const { correct } = question;
  //       correct.forEach(correctAnswerIdx => {
  //         answers[correctAnswerIdx].isCorrect = true;
  //       });
  //     }
  //     return newOutputQuestion("single", type, question.question[0], answers);
  //   });

  //   log(filtered);
};

const parser = new xml2js.Parser({
  explicitChildren: true,
  preserveChildrenOrder: true,
  childkey: "_children"
});

const contents = fs.readFileSync(cli.input[0], "utf8");

parser.parseString(contents, transform);
