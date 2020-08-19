const { roomConfigurations, spawnConfigurations } = require('configurations')
const { getOrCreateWorker }                       = require('utils')
const { mainSpawn }                               = require('constants')

const getAvailableSource = (roomName) => {
  let roomConfig = roomConfigurations.get(roomName)

  // Initialize room if it hasn't been yet
  if (!roomConfig) {
    roomConfig = roomConfigurations.initialize(roomName)
  }

  // Find source with the least workers assigned to it at the moment
  const sortedSources = roomConfig.energySources.sort((a, b) => (
    (a.assignedWorkers.length > b.assignedWorkers.length) ? 1 : -1
  ))

  const leastBusySource = sortedSources[0]
  if (!leastBusySource) {
    return false
  }

  return leastBusySource.id
}

const refreshSources = (roomName) => {
  let roomConfig = roomConfigurations.get(roomName)

  for (const energySource of roomConfig.energySources) {
    const deadWorkers = energySource.assignedWorkers.filter(workerName => {
      const worker = Game.creeps[workerName]

      if (!worker) {
        return true
      }

      return false
    })

    for (const deadWorkerName of deadWorkers) {
      const assignedIndex = energySource.assignedWorkers.indexOf(deadWorkerName)

      energySource.assignedWorkers.splice(assignedIndex, 1)
    }
  }

  roomConfigurations.update(roomName, 'energySources', roomConfig.energySources)
}

const getAssignedSource = (workerMinerName) => {
  const worker   = Game.creeps[workerMinerName]
  const roomName = worker.room.name

  // Refresh sources first for the room thaat the worker is in
  refreshSources(roomName)

  let roomConfig = roomConfigurations.get(roomName)

  // Check if worker is assigned already to a source, if so, return that
  for (const energySource of roomConfig.energySources) {
    if (energySource.assignedWorkers.includes(workerMinerName)) {
      return energySource.id
    }
  }

  // Get next available source and assign the worker to it
  const availableSourceID = getAvailableSource(roomName)
  const sourceIndex       = roomConfig.energySources.findIndex(source => source.id === availableSourceID)

  roomConfig.energySources[sourceIndex].assignedWorkers.push(workerMinerName)
  roomConfigurations.update(roomName, 'energySources', roomConfig.energySources)

  return availableSourceID
}

const workerMinerLoop = (workerMinerName) => {
  const workerMiner = getOrCreateWorker({
    abilities: ['move', 'carry', 'work'],
    spawnName: mainSpawn,
    priority : 10,
    name     : workerMinerName
  })

  if (!workerMiner) {
    return
  }

  const spawnConfig       = spawnConfigurations.get(mainSpawn)
  const workerFreeCapacity = workerMiner.store.getFreeCapacity()

  // Try to mine more energy if there's still enough capacity left
  if (workerFreeCapacity > 0) {
    const assignedSourceID = getAssignedSource(workerMinerName)
    const assignedSource   = Game.getObjectById(assignedSourceID)

    const harvestAttempt = workerMiner.harvest(assignedSource)
    if (harvestAttempt === ERR_NOT_IN_RANGE) {
      // If creep is not in range, move to the source
      workerMiner.moveTo(assignedSource, {
        visualizePathStyle: {
          stroke: 'orange'
        }
      })
    }

    return
  } else {
    const spawnFreeCapacity = spawnConfig.spawn.store.getFreeCapacity(RESOURCE_ENERGY)
    if (spawnFreeCapacity === 0) {
       const energyStorage   = Game.getObjectById('41be4829917256b')
       const transferAttempt = workerMiner.transfer(energyStorage, RESOURCE_ENERGY)

       if (transferAttempt === ERR_NOT_IN_RANGE) {
         workerMiner.moveTo(energyStorage)
         return
       } if (transferAttempt === OK) {
         return
       }

      const { waitingRoom } = spawnConfig
      if (!waitingRoom) {
        return
      }

      workerMiner.moveTo(waitingRoom)
      return
    }

    // Store energy in base if creep is full
    const transferAttempt = workerMiner.transfer(spawnConfig.spawn, RESOURCE_ENERGY)

    switch (transferAttempt) {
      case ERR_NOT_IN_RANGE: {
        // If creep is not in range, move to the spawn
        workerMiner.moveTo(spawnConfig.spawn, {
          visualizePathStyle: {
            stroke: 'grey'
          }
        })
        break
      }
    }
  }
}

module.exports.loop = workerMinerLoop
