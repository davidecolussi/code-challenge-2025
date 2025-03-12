import { appendFileSync, createReadStream, writeFileSync } from "fs";
import * as path from "path";
import { createInterface } from "readline";

const inputBasePath = "./input";
const outputBasePath = "./output";
const inputFile = "7-mckibben.txt";

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
  resources = {},
  turns = [];

lineReader.on("line", (line, index = line_counter()) => {
  // Process the line.
  const values = line.split(" ");

  if (index === 1) {
    budget = Number(values[0]);
    numResources = Number(values[1]);
    numTurns = Number(values[2]);
  } else if (index <= numResources + 1) {
    resources[values[0]] = {
      id: values[0],
      activationCost: Number(values[1]),
      periodicCost: Number(values[2]),
      consecutiveTurns: Number(values[3]),
      recoverTurns: Number(values[4]),
      maxTurns: Number(values[5]),
      numPowered: Number(values[6]),
      specialEffects: values[7],
      specialEffectsValue: values[8] && Number(values[8]), // optional
      status: {
        active: false,
        remainingTurns: Number(values[5]),
        remainingActiveTurns: Number(values[3]),
        remainingRecoverTurns: undefined,
      },
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

  writeFileSync(path.join(outputBasePath, inputFile), "");
  turns.forEach(({ min, max, profit }, i) => {
    Object.values(resources)
      // aggiornare i contatori attive
      .forEach((r) => {
        if (r.status.active) {
          r.status.remainingTurns--;
          r.status.remainingActiveTurns--;
          if (r.status.remainingTurns === 0) {
            r.status.active = false;
          } else if (r.status.remainingActiveTurns === 0) {
            r.status.active = false;
            r.status.recoverTurns = r.recoverTurns;
          }
        } else {
          // aggiornare i contatori non attive
          if (r.status.recoverTurns !== undefined) {
            r.status.recoverTurns--;
          }
        }
      });

    const selectedArray = [];
    const maxNumPerTurn = 2;

    // decisione su quali attivare
    const inBuget = getResourcesInBudget(min, max, profit).sort(
      (a, b) => b[1] - a[1]
    );
    if (!inBuget.length || inBuget[0][1] < 0) {
      return;
    }
    // attiva la prima senza poteri
    const selected = resources[inBuget[0][0]];
    selectedArray.push(selected);
    resources[selected.id].status.active = true;

    for (let i = 1; i < maxNumPerTurn; i++) {
      const inBuget2 = getResourcesInBudget(min, max, profit).sort(
        (a, b) => b[1] - a[1]
      );
      if (inBuget2.length && inBuget2[0][1] >= 0) {
        const selected2 = resources[inBuget2[0][0]];
        selectedArray.push(selected2);
        resources[selected2.id].status.active = true;
      }
    }

    console.log(selectedArray);

    appendFileSync(
      path.join(outputBasePath, inputFile),
      `${i} ${selectedArray.length} ${selectedArray
        .map((r) => r.id)
        .join(" ")}\n`
    );

    // aggiorna budget
    const currProfit = getProfit([], min, max, profit);
    const periodicCost = getPeriodicCost([]);
    budget -= selectedArray.reduce((count, r) => count + r.activationCost, 0);
    budget -= periodicCost;
    budget += currProfit;
    console.log(budget);
  });
});

function getProfit(additionalResources, tm, tx, tr) {
  const n = Object.values(resources)
    .filter((r) => r.status.active)
    .concat(additionalResources)
    .reduce((count, r) => count + r.numPowered, 0);
  return n >= tm ? Math.min(n, tx) * tr : 0;
}

function getPeriodicCost(additionalResources) {
  return Object.values(resources)
    .filter((r) => r.status.active)
    .concat(additionalResources)
    .reduce((count, r) => count + r.periodicCost, 0);
}

function getResourcesInBudget(tm, tx, tr) {
  return (
    Object.values(resources)
      .filter(
        (r) =>
          !r.status.active &&
          (r.status.recoverTurns === undefined ||
            r.status.recoverTurns === 0) &&
          r.status.remainingTurns > 0
      )
      // .filter((r) => r.numPowered > 30 || r.specialEffectsValue > 0)
      // .filter((r) => r.specialEffects === "X" || r.specialEffectsValue > 0)
      .map((r) => {
        if (budget < r.activationCost) {
          return [r.id, -1];
        }
        const profit = getProfit([r], tm, tx, tr);
        return [
          r.id,
          budget + profit - r.activationCost - getPeriodicCost([r]),
        ];
      })
  );
}
