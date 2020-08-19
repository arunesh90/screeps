const mainSpawn = 'yes'

const bodyParts = {
  MOVE: {
    energy: 50
  },
  WORK: {
    energy: 100
  },
  CARRY: {
    energy: 50
  },
  ATTACK: {
    energy: 80
  },
  RANGED_ATTACK: {
    energy: 150
  },
  HEAL: {
    energy: 250
  },
  CLAIM: {
    energy: 600
  },
  TOUGH: {
    energy: 10
  }
}

module.exports = {
  mainSpawn,
  bodyParts
}
