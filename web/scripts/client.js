'use strict'

/* global btoa */
/* global MouseEvent */
/* global FileReader */
/* global lain */
/* global lainLibrary */

function Client (paradise) {
  this._form = document.createElement('form')
  this._input = document.createElement('input')
  this._location = document.createElement('h2')
  this._note = document.createElement('p')
  this._sight = document.createElement('ul')
  this._response = document.createElement('p')
  this._inventory = document.createElement('ul')
  this._program = document.createElement('pre')
  this._footer = document.createElement('p')

  this._input.setAttribute('size', 48)

  this.vessel = null

  this.install = (host = document.body) => {
    host.appendChild(this._location)
    host.appendChild(this._note)
    host.appendChild(this._sight)
    host.appendChild(this._response)
    host.appendChild(this._inventory)
    host.appendChild(this._form)
    this._form.appendChild(this._input)
    this._form.appendChild(document.createElement('br'))
    host.appendChild(this._program)
    host.appendChild(this._footer)

    host.style.maxWidth = '400px'

    window.addEventListener('dragover', this.onDrag, false)
    window.addEventListener('drop', this.onDrop, false)
    window.addEventListener('click', this.onClick, false)
    this._form.addEventListener('submit', this.onSubmit, false)
  }

  this.start = (id = 1) => {
    console.clear()
    paradise.start()
    this.vessel = paradise.world[id]
    this.update()
    this._input.value = 'create a pocket watch & enter the watch & pass the current time is (time). & leave & take the watch' // 'create a machine & create a box & move the machine in the box'
    this._input.focus()
  }

  this.update = (response = '') => {
    const visibles = this.vessel.sight()
    const children = this.vessel.inventory()
    const stem = this.vessel.stem()
    this._location.innerHTML = this.vessel.isParadox() ? `you are the ${this.vessel.data.name}^.` : `you are a ${this.vessel.data.name}, in the ${this.vessel.parent().data.name}.`
    this._note.innerHTML = this.vessel.parent().data.note ? parse(this.vessel.parent().data.note, this.vessel.parent(), this.vessel) : ''
    this._program.innerHTML = this.vessel.parent().data.program || this.vessel.parent().data.passive ? (this.vessel.parent().data.program ? this.vessel.parent().data.program : '') + '\n' + (this.vessel.parent().data.passive ? this.vessel.parent().data.passive : '') : ''
    this._sight.innerHTML = visibles.reduce((acc, vessel) => { return acc + '<li>' + vessel.toAction() + '</li>' }, '')
    this._inventory.innerHTML = children.reduce((acc, vessel) => { return acc + '<li>' + vessel.toAction() + (vessel.data.passive ? ' ' + parse(vessel.data.passive, vessel, this.vessel) : '') + '</li>' }, '')
    this._response.innerHTML = parse(response, this.vessel, this.vessel)
    this._footer.innerHTML = `<i><a href='#' onclick='client.export()'>${stem ? stem.data.name : 'circular universe^'}</a> ${this.vessel.parent().data.id}:${this.vessel.data.id} ${this.vessel.parent().data.note ? `| <a href='#' data-action='note ${this.vessel.parent().data.note}'>edit note</a> ` : ''} ${this.vessel.parent().data.program ? `| <a href='#' data-action='program ${this.vessel.parent().data.program}'>edit program</a> ` : ''} ${this.vessel.parent().data.passive ? `| <a href='#' data-action='pass ${this.vessel.parent().data.passive}'>edit passive</a> ` : ''}</i>`
  }

  this.validate = (cmd) => {
    if (cmd.indexOf('&') > -1) {
      for (const c of cmd.split('&')) {
        this.validate(c.trim())
      }
      return
    }
    const response = this.vessel.act(cmd)
    this.update(response)
    console.info('> ' + cmd + ' : ' + response)
    this._input.value = ''
  }

  this.export = () => {
    const base64 = 'data:application/json;' + 'base64,' + btoa(paradise.export())
    const name = paradise.name() + '.json'
    const link = document.createElement('a')
    link.setAttribute('href', base64)
    link.setAttribute('download', name)
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  }

  this.docs = () => {
    let markdown = ''
    for (const action of Object.values(this.vessel.actions)) {
      markdown += `- \`${action.name}\`: ${action.docs}\n`
    }
    return markdown
  }

  this.onClick = (e) => {
    if (!e.target.getAttribute('data-action')) { return }
    this._input.value = e.target.getAttribute('data-action')
    this._input.focus()
  }

  this.onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (!file) { return }
    const reader = new FileReader()
    reader.onload = (event) => {
      paradise.import(event.target.result)
      this.update()
    }
    reader.readAsText(file)
  }

  this.onDrag = (e) => {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  this.onSubmit = (e) => {
    this.validate(this._input.value)
    this._input.value = ''
    this._input.focus()
    e.preventDefault()
    return false
  }

  function parse (str, host, guest) {
    for (const seg of findSegs(str)) {
      lainLibrary.host = host
      lainLibrary.guest = guest
      str = str.replace(seg, `${lain.run(seg)}`)
    }
    return str
  }

  function findSegs (str) {
    const segments = []
    let seq = 0
    let len = 0
    let from = null
    for (const c of str) {
      if (c === '(') {
        if (seq === 0) { from = len } ;
        seq += 1
      }
      if (c === ')') {
        if (seq === 1) { segments.push(str.substr(from, len - from + 1)) }
        seq -= 1
      }
      len += 1
    }
    return segments
  }
}
