#!/usr/bin/env node

"use strict";

const meow = require("meow");
const fs = require("fs");
const nanoid = require("nanoid");
const { parseString } = require("xml2js");

const cli = meow(`
	Usage
	  $ weclare-convert <input> <output>

	Examples
	  $ weclare-convert sturesy.xml weclare.json
`);

const contents = fs.readFileSync(cli.input[0], "utf8");

const newOutputQuestion = (mode, type, questionText, answers) => ({
  id: nanoid(6),
  type: type,
  mode,
  text: questionText,
  answers
});

const newOutputAnswer = answerText => ({
  id: nanoid(6),
  text: answerText,
  isCorrect: false
});

parseString(contents, (err, result) => {
  // console.dir(result, { showHidden: false, depth: 4, colors: true });
  const singleChoiceQuestions = result.questionset.questionmodel;
  const multipleChoiceQuestions = result.questionset.multiplechoice;
  // console.dir(base, { showHidden: false, depth: 4, colors: true });

  const filtered = singleChoiceQuestions.map(question => {
    const answers = question.answer.map(answer => newOutputAnswer(answer));
    const type = question.correct[0] === "-1" ? "vote" : "question";
    return newOutputQuestion("single", type, question.question[0], answers);
  });
  console.dir(filtered, { showHidden: false, depth: 4, colors: true });
});
