const constants              = require('constants')
const { spawnConfigurations } = require('./configurations')

const getOrCreateWorker = ({abilities, name, priority, memory, spawnName}) => {
  const spawnConfig     = spawnConfigurations.get(spawnName || constants.mainSpawn)
  const { createQueue } = spawnConfig

  // Check if the worker already exists, if so, return it
  const existingWorker = Game.creeps[name]
  if (existingWorker) {
    return existingWorker
  }

  // Return if the worker is scheduled to be created
  const alreadyInQueue = !!createQueue.get(name)
  if (alreadyInQueue) {
    return
  }

  // Queue worker to be created if it isn't in queue yet
  createQueue.add({
    abilities,
    name,
    priority,
    options: {
      memory: {
        task: 'new',
        ...memory
      }
    }
  })

  console.log(`Queued up worker ${name} to be created soon at spawn ${spawnName}..`)
}

const calculatePartsEnergy = (parts) => {
  let total = 0

  for (const part of parts) {
    const partInfo = constants.bodyParts[part.toUpperCase()]

    total += partInfo.energy
  }

  return total
}

const toggleInputOnlySpawn = (spawnName, toggleValue) => {
  spawnConfigurations.update(spawnName, 'energyInputOnly', toggleValue)
}

module.exports = {
  toggleInputOnlySpawn,
  getOrCreateWorker,
  calculatePartsEnergy
}
