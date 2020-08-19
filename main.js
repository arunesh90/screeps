const minerLoop = require('worker.miner').loop
const Upgrader  = require('worker.upgrader').worker
const Builder   = require('worker.builder').worker

const { CreateQueue } = require('queue')

module.exports.loop = () => {
  // Miners
  minerLoop('Miner 1')
  minerLoop('Miner 2')
  minerLoop('Miner 3')
  minerLoop('Miner 4')
  minerLoop('Miner 5')
  minerLoop('Miner 6')
  minerLoop('Miner 7')
  minerLoop('Miner 8')
  minerLoop('Miner 9')
  minerLoop('Miner 10')
  minerLoop('Miner 11')
  minerLoop('Miner 12')
  
  // Upgraders
  new Upgrader('Upgrader 1').tick()
  new Upgrader('Upgrader 2').tick()
  new Upgrader('Upgrader 3').tick()
  new Upgrader('Upgrader 4').tick()
  new Upgrader('Upgrader 6').tick()
  new Upgrader('Upgrader 7').tick()
  new Upgrader('Upgrader 8').tick()
//   new Upgrader('Upgrader 9').tick()
//   new Upgrader('Upgrader 10').tick()
//   new Upgrader('Upgrader 11').tick()
//   new Upgrader('Upgrader 12').tick()
//   new Upgrader('Upgrader 13').tick()
//   new Upgrader('Upgrader 14').tick()

  // Builders
  new Builder('Builder 1').tick()
  new Builder('Builder 2').tick()
  new Builder('Builder 3').tick()
  new Builder('Builder 4').tick()
  
  // Run queue ticks per spawn
  for (const spawnName of Object.keys(Game.spawns)) {
    const creationQueue = new CreateQueue(spawnName)

    creationQueue.tick()
  }
}
