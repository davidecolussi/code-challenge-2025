import { appendFileSync, createReadStream } from "fs";
import * as path from "path";
import { createInterface } from "readline";

const inputBasePath = "./input";
const outputBasePath = "./output";
const inputFile = "00-example.txt";

console.log("START\n");

const line_counter = (
  (i = 0) =>
  () =>
    ++i
)();
const lineReader = createInterface({
  input: createReadStream(path.join(inputBasePath, inputFile)),
  crlfDelay: Infinity,
});

lineReader.on("line", (line, index = line_counter()) => {
  // Process the line.
  const values = line.split(" ");
  console.log(index, values);
});

lineReader.on("close", async () => {
  console.log("reader closed");

  appendFileSync(path.join(outputBasePath, inputFile), `Riga di prova \n`);
});
