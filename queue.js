class CreateQueue {
  constructor (spawnName) {
    const existingMemory = Game.spawns[spawnName].memory.createQueue

    this.spawnName = spawnName
    this.id        = `queue-${spawnName}`

    if (existingMemory) {
      this.queue = [...existingMemory.queue]

      return
    }

    this.queue = []
    this.updateMemory()
  }

  updateMemory () {
    Game.spawns[this.spawnName].memory.createQueue = {
      queue: this.queue
    }
  }

  get (name) {
    const queuedWorker = this.queue.find(worker => worker.name === name)

    return queuedWorker
  }

  add ({abilities, name, priority = 0, options = {}}) {
    const alreadyInQueue = !!this.get(name)
    if (alreadyInQueue) {
      return
    }

    this.queue.push({
      abilities,
      name,
      priority,
      options
    })

    this.updateMemory()
  }

  tick () {
    const { spawnConfigurations } = require('configurations')
    const utils                   = require('utils')

    const spawnConfig = spawnConfigurations.get(this.spawnName)
    const { spawn }   = spawnConfig

    // Return if queue is empty
    if (!this.queue[0]) {
      return
    }
    
    // Return if the spawn is already spawning a worker
    if (spawn.spawning) {
      return
    }

    // Grab the next worker
    const nextWorker = this.nextWorker()

    // Calculate if there's enough energy to spawn the worker
    const neededEnergy    = utils.calculatePartsEnergy(nextWorker.abilities)
    const energyAvailable = spawn.store.getUsedCapacity(RESOURCE_ENERGY)

    if (neededEnergy > energyAvailable) {
      // Switch to input-only if not enabled yet
      if (!spawnConfig.energyInputOnly) {
        utils.toggleInputOnlySpawn(this.spawnName, true)
        console.log(`Enabled input-only mode for spawn ${this.spawnName} to create more workers..`)

        return
      }

      return
    } else {
      // Disable input-only mode if there's enough energy now
      // TODO: Check if there's enough energy for the next in queue, if NOT, don't disable input-only mode
      if (spawnConfig.energyInputOnly) {
        utils.toggleInputOnlySpawn(this.spawnName, false)
      }
    }

    // Attempt to spawn worker
    const spawnAttempt = spawn.spawnCreep(nextWorker.abilities, nextWorker.name, {
      memory: nextWorker.memory || undefined
    })

    switch (spawnAttempt) {
      case OK: {
        // Log if creep is successfully spawning and remove it from the queue
        console.log(`Worker ${nextWorker.name} is now being spawned..`)
        this.removeWorker(nextWorker.name)

        break
      }

      case ERR_NOT_ENOUGH_ENERGY: {
        // Switch the spawn to be input-only if there's not enough resources
        console.log('wtf lol? Not enough energy even tho input-only should be on and the parts are calculated to double-check')

        break
      }

      default: {
        console.log(`Unknown error received at trying to spawn a worker - ${nextWorker.name} : ${spawnAttempt}`)
      }
    }
  }

  removeWorker (name) {
    const workerIndex = this.queue.findIndex(worker => (
      worker.name === name
    ))

    this.queue.splice(workerIndex, 1)
    this.updateMemory()
  }

  nextWorker () {
    const sortedQueue = this.queue.sort((a, b) => (
      (a.priority > b.priority) ? -1 : 1
    ))

    return sortedQueue[0]
  }
}

module.exports.CreateQueue = CreateQueue
