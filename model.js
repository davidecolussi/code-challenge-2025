class Resource {
  constructor(
    id,
    activationCost,
    periodicCost,
    consecutiveTurns,
    recoverTurns,
    maxTurns,
    numPowered,
    specialEffects,
    specialEffectsValue
  ) {
    this.id = id;
    this.activationCost = activationCost;
    this.periodicCost = periodicCost;
    this.consecutiveTurns = consecutiveTurns;
    this.recoverTurns = recoverTurns;
    this.maxTurns = maxTurns;
    this.numPowered = numPowered;
    this.specialEffects = specialEffects;
    this.specialEffectsValue = specialEffectsValue;
  }
}

class Game {
  constructor(budget, resources, turns) {
    this.budget = budget; // Initial budget
    this.resources = resources;
    this.turns = turns;
    
    this.currentTurn = 0;
    this.buildingsPowered = 0;
    this.profit = 0;
  }

  addResource(resource) {
    if (this.budget >= resource.activationCost) {
      this.resources.push(resource);
      this.budget -= resource.activationCost;
      resource.activate();
      console.log(`${resource.name} activated!`);
    } else {
      console.log(`Not enough budget to activate ${resource.name}.`);
    }
  }

  calculateTurnProfit() {
    const minThreshold = 5; // Example threshold
    this.profit = this.resources.reduce((total, resource) => {
      if (resource.active) {
        this.buildingsPowered += resource.specialEffects.poweredBuildings;
        return (
          total +
          resource.specialEffects.profitPerBuilding *
            resource.specialEffects.poweredBuildings
        );
      }
      return total;
    }, 0);

    if (this.buildingsPowered < minThreshold) {
      this.profit = 0;
    }
  }

  updateBudget() {
    const totalCosts = this.resources.reduce((total, resource) => {
      return total + (resource.active ? resource.periodicCost : 0);
    }, 0);
    this.budget += this.profit - totalCosts;
    console.log(`Updated budget for next turn: ${this.budget}`);
  }

  playTurn() {
    this.calculateTurnProfit();
    this.updateBudget();
    this.buildingsPowered = 0; // Reset for the next turn
  }
}

// Example usage
const game = new Game();
const smartMeter = new Resource("Smart Meter", 100, 10, 10, "green", {
  poweredBuildings: 2,
  profitPerBuilding: 50,
});
const renewablePlant = new Resource("Renewable Plant", 300, 20, 15, "green", {
  poweredBuildings: 5,
  profitPerBuilding: 100,
});

game.addResource(smartMeter);
game.addResource(renewablePlant);
game.playTurn();
