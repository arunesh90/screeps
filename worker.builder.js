const { Worker }            = require('worker')
const { getOrCreateWorker } = require('./utils')
const { mainSpawn }         = require('constants')

const { 
  workerConfigurations
} = require('configurations')

class WorkerBuilder extends Worker {
  constructor (options) {
    super(options)
  }

  loop () {
    const workerBuilder = getOrCreateWorker({
      abilities: ['move', 'carry', 'work'],
      spawnName: mainSpawn,
      priority : 1,
      name     : this.workerName
    })

    if (!workerBuilder) {
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
          this.switchTask('build')
          this.loop()
        }

        break
      }

      case 'build': {
        const workerConfig = workerConfigurations.get(this.workerName)
        const worker       = workerConfig.creep

        const buildTargets = worker.room.find(FIND_CONSTRUCTION_SITES)
        const buildTarget  = buildTargets[0]
        if (!buildTarget) {
          this.moveToWaitingRoom()

          return
        }

        const buildAttempt = worker.build(buildTarget)
        switch (buildAttempt) {
          case ERR_NOT_IN_RANGE: {
            worker.moveTo(buildTarget, {
              visualizePathStyle: {
                stroke: 'blue'
              }
            })
            break
          }

          case ERR_NOT_ENOUGH_RESOURCES: {
            this.switchTask('refill')
            this.loop()
            break
          }
        }
      }
    }
  }
}

module.exports.worker = WorkerBuilder
