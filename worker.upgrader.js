const { Worker }            = require('worker')
const { getOrCreateWorker } = require('./utils')
const { mainSpawn }         = require('constants')

const { 
  workerConfigurations
} = require('configurations')

class workerUpgrader extends Worker {
  constructor (options) {
    super(options)
  }

  loop () {
    const workerUpgrader = getOrCreateWorker({
      abilities: ['move', 'carry', 'work'],
      spawnName: mainSpawn,
      priority : 5,
      name     : this.workerName
    })
  
    if (!workerUpgrader) {
      return
    }
  
    const workerConfig = workerConfigurations.get(this.workerName)
    switch (workerConfig.task) {
      case 'new': {
        this.switchTask('refill')
        this.loop()

        break
      }
  
      case 'refill': {
        const isRefilled = this.refillWorker()

        if (isRefilled) {
          this.switchTask('upgrade')
          this.loop()
        }

        break
      }
  
      case 'upgrade': {
        const roomController = workerUpgrader.room.controller
        const upgradeAttempt = workerUpgrader.upgradeController(roomController)
  
        switch (upgradeAttempt) {
          case ERR_NOT_IN_RANGE: {
            // If creep is not in range, move to controller
            workerUpgrader.moveTo(roomController, {
              visualizePathStyle: {
                stroke: '#fff'
              }
            })
  
            break
          }
  
          case ERR_NOT_ENOUGH_RESOURCES: {
            // Refill creep if it has not enough resources
            this.switchTask('refill')
            workerUpgrader.say('Juicing')
  
            break
          }
        }
      }
    }
  }
}

module.exports.worker = workerUpgrader
