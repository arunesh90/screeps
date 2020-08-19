const { 
  workerConfigurations,
  spawnConfigurations
} = require('configurations')

class Worker {
  constructor (workerName) {
    this.workerName = workerName
  }

  tick () {
    this.loop()
  }

  switchTask (newTask) {
    workerConfigurations.update(this.workerName, 'task', newTask)
  }

  // Returns true if worker is filled up
  refillWorker () {
    const workerConfig = workerConfigurations.get(this.workerName)
    const spawnConfig  = spawnConfigurations.get(workerConfig.spawnName)

    const spawn  = spawnConfig.spawn
    const worker = workerConfig.creep

    const spawnUsedCapacity  = spawn.store.getUsedCapacity(RESOURCE_ENERGY)
    const workerFreeCapacity = worker.store.getFreeCapacity()

    // Double check if worker is already filled up
    if (workerFreeCapacity === 0) {
      return true
    }

    // Move to waiting room if spawn is set to input-only modef
    if (spawnConfig.energyInputOnly) {
      this.moveToWaitingRoom()
      return
    }

    // Also move to waiting room if spawn is empty
    if (spawnUsedCapacity === 0) {
      this.moveToWaitingRoom()
      return
    }

    const withdrawAttempt = worker.withdraw(spawnConfig.spawn, RESOURCE_ENERGY)
    if (withdrawAttempt === ERR_NOT_IN_RANGE) {
      // If creep is not in range, move to the spawn
      worker.moveTo(spawnConfig.spawn, {
        visualizePathStyle: {
          stroke: '#fff'
        }
      })
    }
  }

  moveToWaitingRoom () {
    const workerConfig = workerConfigurations.get(this.workerName)
    const spawnConfig  = spawnConfigurations.get(workerConfig.spawnName)

    const { waitingRoom } = spawnConfig
    const worker          = workerConfig.creep

    if (!waitingRoom) {
      return
    }

    worker.moveTo(waitingRoom)
  }
}

module.exports.Worker = Worker
