const { CreateQueue } = require('queue')
const { mainSpawn }   = require('constants')

const spawnConfigurations = {
  initialize: (spawnName) => {
    const createQueue  = new CreateQueue(spawnName)

    Game.spawns[spawnName].memory.config = {
      energyInputOnly  : false,
      createQueueId    : createQueue.id
    }

    return spawnConfigurations.get(spawnName)
  },
  update: (spawnName, key, value) => {
    Game.spawns[spawnName].memory.config[key] = value
  },
  get: (spawnName) => {
    let spawnConfig = Game.spawns[spawnName].memory.config

    if (!spawnConfig) {
      spawnConfig = spawnConfigurations.initialize(spawnName)
    }

    spawnConfig.createQueue = new CreateQueue(spawnName) 
    spawnConfig.spawn       = Game.spawns[spawnName]
    spawnConfig.waitingRoom = Game.flags[`${spawnName} Waiting Room`]

    return spawnConfig
  },
  getSpecific: (spawnName, type) => {
    return Game.spawns[spawnName].memory.config[type]
  }
}

const workerConfigurations = {
  initialize: (workerName) => {
    Game.creeps[workerName].memory.config = {
      task: 'new',
      spawnName: mainSpawn
    }

    return workerConfigurations.get(workerName)
  },
  get: (workerName) => {
    let workerConfig = Game.creeps[workerName].memory.config

    if (!workerConfig) {
      workerConfig = workerConfigurations.initialize(workerName)
    }

    workerConfig.creep = Game.creeps[workerName]

    return workerConfig
  },
  getSpecific: (workerName, type) => {
    return Game.creeps[workerName].memory.config[type]
  },
  update: (workerName, key, value) => {
    Game.creeps[workerName].memory.config[key] = value
  }
}

const roomConfigurations = {
  initialize: (roomName) => {
    const selectedRoom = Game.rooms[roomName]

    Game.rooms[roomName].memory.config = {
      energySources: selectedRoom.find(FIND_SOURCES).map(source => ({
        id             : source.id,
        assignedWorkers: []
      }))
    }

    return roomConfigurations.get(roomName)
  },
  get: (roomName) => {
    let roomConfig = Game.rooms[roomName].memory.config

    if (!roomConfig) {
      roomConfig = roomConfigurations.initialize(roomName)
    }

    return roomConfig
  },
  getSpecific: (roomName, type) => {
    return Game.rooms[roomName].memory.config[type]
  },
  update: (roomName, key, value) => {
    Game.rooms[roomName].memory.config[key] = value
  }
}

module.exports = {
  spawnConfigurations,
  roomConfigurations,
  workerConfigurations
}
