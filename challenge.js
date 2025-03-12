import { appendFileSync, createReadStream } from "fs";
import * as path from "path";
import { createInterface } from "readline";

const inputBasePath = "./input";
const outputBasePath = "./output";
const inputFile = "0-demo.txt";

const line_counter = (
  (i = 0) =>
  () =>
    ++i
)();
const lineReader = createInterface({
  input: createReadStream(path.join(inputBasePath, inputFile)),
  crlfDelay: Infinity,
});

let budget,
  numResources,
  numTurns,
  availResuorces = {},
  turns = [];

lineReader.on("line", (line, index = line_counter()) => {
  // Process the line.
  const values = line.split(" ");

  if (index === 1) {
    budget = Number(values[0]);
    numResources = Number(values[1]);
    numTurns = Number(values[2]);
  } else if (index <= numResources + 1) {
    availResuorces[values[0]] = {
      id: values[0],
      activationCost: Number(values[1]),
      periodicCost: Number(values[2]),
      consecutiveTurns: Number(values[3]),
      recoverTurns: Number(values[4]),
      maxTurns: Number(values[5]),
      numPowered: Number(values[6]),
      specialEffects: values[7],
      specialEffectsValue: values[8] && Number(values[8]), // optional
    };
  } else {
    turns.push({
      min: Number(values[0]),
      max: Number(values[1]),
      profit: Number(values[2]),
    });
  }
});

lineReader.on("close", async () => {
  console.log("reader closed");
  console.log(budget, numResources, numTurns);
  console.log(availResuorces, turns);

  appendFileSync(path.join(outputBasePath, inputFile), `Riga di prova \n`);
});
