window.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('DOMContentLoaded event fired in renderer.js')
    const apps = await window.api.getDesktopFiles()
    console.log('Apps received in renderer.js:', apps)
    const container = document.getElementById('launchpadAppGrid')
    if (!container) {
      console.error('Container element not found in renderer.js')
      return
    }
    apps.forEach(app => {
      const div = document.createElement('div')
      div.classList.add('app')
      div.id = app.file
      if (app.icon) {
        const img = document.createElement('img')
        img.src = app.icon
        img.alt = `${app.name} icon`
        img.style.width = '64px'
        img.style.height = '64px'
        img.addEventListener('click', async () => {
          window.api.hideWindow()
          try {
            console.log('App clicked in renderer.js:', app)
            const result = await window.api.launchDesktopFile(app.file)
            console.log('App launched in renderer.js:', result)
          } catch (error) {
            console.error('Error launching app in renderer.js:', error)
          }
        })
        div.appendChild(img)
      }
      const p = document.createElement('p')
      p.textContent = app.name
      div.appendChild(p)
      container.appendChild(div)
    })
    console.log('Apps added to DOM in renderer.js')
  } catch (error) {
    console.error('Error adding apps to DOM in renderer.js:', error)
  }

})

window.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Getting bluetooth devices in renderer.js')
    const devices = await window.api.getBluetoothDevices()
    console.log('Devices received in renderer.js:', devices)
    const container = document.getElementById('bluetoothDeviceList')
    if (!container) {
      console.error('Container element not found in renderer.js')
      return
    }
    devices.forEach(device => {
      const div = document.createElement('div')
      div.classList.add('device')
      div.classList.add('settings-content-item')
      div.id = device.address
      const span = document.createElement('span')
      span.textContent = device.name
      div.appendChild(span)
      const button = document.createElement('button')
      button.textContent = 'Connect'
      button.classList.add('settings-content-button')
      button.addEventListener('click', async () => {
        try {
          console.log('Device connect clicked in renderer.js:', device)
          const result = await window.api.connectBluetoothDevice(device.address)
          console.log('Device connected in renderer.js:', result)
        } catch (error) {
          console.error('Error connecting device in renderer.js:', error)
        }
      })
      div.appendChild(button)
      container.appendChild(div)
    })
    console.log('Devices added to DOM in renderer.js')
  } catch (error) {
    console.error('Error adding devices to DOM in renderer.js:', error)
  }
})