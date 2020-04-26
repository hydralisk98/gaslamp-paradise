'use strict'

const Vessel = require('./vessel')

function Paradise () {
  this.client = null

  this.reset = function () {
    // Default World
    this.import([
      { name: 'ghost', parent: 1, owner: 0, note: 'Well, well, hello there.' },
      { name: 'library', parent: 1, owner: 1, note: 'Hello @(vessel self "name"), and welcome to the @(cc (vessel parent "name")), the stem to an empty world. Type "@(format "learn")" to get started.' },
      { name: 'map', parent: 0, owner: 0, note: 'A basic map', trigger: 'passive', reaction: '@(uc (vessel parent))' }
    ])
  }

  // Start

  this.import = function (json) {
    const a = []
    for (const id in json) {
      const vessel = new Vessel(json[id])
      a.push(vessel)
    }
    this.world = a
  }

  this.export = function () {
    const a = []

    for (const id in this.world) {
      const json = this.world[id].to_h()
      a.push(json)
    }
    return JSON.stringify(a)
  }

  this.add = function (vessel) {
    if (this.exists(vessel)) {
      return false
    }
    this.world.push(vessel)
    this.update()
    return true
  }

  this.exists = function (target) {
    for (const id in this.world) {
      const v = this.world[id]
      if (v.data.name != target.data.name) { continue }
      if (v.data.attr != target.data.attr) { continue }
      if (v.data.parent != target.data.parent) { continue }
      return true
    }
    return false
  }

  this.query = function (id = 0, q = 'look') {
    if (!this.ghost(id)) { return 'error' }
    return this.ghost(id).cmd(q)
  }

  this.update = function () {
    // Connect IDs
    for (const id in this.world) {
      this.world[id].paradise = this
      this.world[id].id = parseInt(id)
    }
  }

  this.ghost = function (id = this.client.id) {
    this.update()
    return this.world[id]
  }

  this.random = function () {
    const id = Math.floor((Math.random() * this.world.length))
    return this.world[id]
  }

  this.to_a = function () {
    const a = []
    for (const id in this.world) {
      a.push(this.world[id].to_h())
    }
    return a
  }
}

module.exports = Paradise
