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

const iconMap = {
  'audio-card': '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"><path fill="currentColor" d="M11 4V3c0-.55.45-1 1-1s1 .45 1 1v1zm2 5V5h-2v4H9v6c0 1.3.84 2.4 2 2.82V22h2v-4.18c1.16-.42 2-1.52 2-2.82V9z"/></svg>',
  'audio-headset': '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"><path fill="currentColor" d="M12 23v-2h7v-1h-4v-8h4v-1q0-2.9-2.05-4.95T12 4T7.05 6.05T5 11v1h4v8H5q-.825 0-1.412-.587T3 18v-7q0-1.85.713-3.488T5.65 4.65t2.863-1.937T12 2t3.488.713T18.35 4.65t1.938 2.863T21 11v10q0 .825-.587 1.413T19 23z"/></svg>'
}
const iconNameMap = {
  'audio-card': 'Audio Card',
  'audio-headset': 'Audio Headset'
}

async function updateBluetoothDevices() {
  try {
    const bluetoothSettings = document.getElementById('bluetoothSettings')
    if (bluetoothSettings && bluetoothSettings.classList.contains('hidden')) {
      return
    }
    const container = document.getElementById('bluetoothDeviceList')
    console.log('Updating Bluetooth Devices')
    const devices = await window.api.getBluetoothDevices()
    if (!container) {
      console.error('Container element not found in renderer.js')
      return
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
    devices.forEach(device => {
      const div = document.createElement('div')
      div.classList.add('device')
      div.classList.add('settings-content-item')
      div.id = device.address
      const iconAndName = document.createElement('div')
      const iconName = device.Icon
      const iconSVG = iconMap[iconName] || '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"><path fill="currentColor" d="M11 20.575V14.4l-3.9 3.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275L11 9.6V3.425q0-.45.3-.737T12 2.4q.2 0 .375.075t.325.225L17 7q.15.15.213.325t.062.375t-.062.375T17 8.4L13.4 12l3.6 3.6q.15.15.213.325t.062.375t-.062.375T17 17l-4.3 4.3q-.15.15-.325.225T12 21.6q-.4 0-.7-.288t-.3-.737M13 9.6l1.9-1.9L13 5.85zm0 8.55l1.9-1.85l-1.9-1.9z"/></svg>'
      const icon = document.createElement('div')
      icon.innerHTML = iconSVG
      icon.classList.add('settings-content-icon')
      iconAndName.appendChild(icon)
      const span = document.createElement('span')
      span.textContent = device.name
      iconAndName.appendChild(span)
      div.appendChild(iconAndName)
      const button = document.createElement('button')
      button.textContent = 'Connect'
      if (device.Connected === 'yes') {
        button.textContent = 'Disconnect'
      }
      button.classList.add('settings-content-button')
      button.addEventListener('click', async () => {
        try {
          if (device.Connected === 'yes') {
            button.textContent = 'Disconnecting...'
          } else {
            button.textContent = 'Connecting...'
          }
          console.log('Device connect clicked in renderer.js:', device)
          const result = await window.api.connectBluetoothDevice(device.address)
          if (result === 'connected') {
            button.textContent = 'Disconnect'
          } else {
            button.textContent = 'Failed to connect'
            setTimeout(() => {
              button.textContent = 'Connect'
            }, 1000)
          }
        } catch (error) {
          console.error('Error connecting device in renderer.js:', error)
        }
      })
      div.appendChild(button)
      container.appendChild(div)
    })
  } catch (error) {
    console.error('Error adding devices to DOM in renderer.js:', error)
  }
}

async function updateWifiNetworks() {
  try {
    const wifiSettings = document.getElementById('networkSettings')
    if (wifiSettings && wifiSettings.classList.contains('hidden')) {
      return
    }
    const container = document.getElementById('wifiNetworkList')
    console.log('Updating WiFi Networks')
    const networks = await window.api.getWifiNetworks()
    if (!container) {
      console.error('Container element not found in renderer.js')
      return
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
    networks.forEach(network => {
      const div = document.createElement('div')
      div.classList.add('network')
      div.classList.add('settings-content-item')
      div.id = network.SSID
      const iconAndName = document.createElement('div')
      const icon = document.createElement('div')
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3q-1.1 0-2 .9t-.9 2v14q0 1.1.9 2t2 .9t2-.9t.9-2V5q0-1.1-.9-2t-2-.9zm0 2v12l6-6q.2-.2.2-.5t-.2-.5l-6-6zm0 0V5l-6 6q-.2.2-.2.5t.2.5l6 6zm0 0v12l6-6q.2-.2.2-.5t-.2-.5l-6-6zm0 0V5l-6 6q-.2.2-.2.5t.2.5l6 6z"/></svg>'
      icon.classList.add('settings-content-icon')
      iconAndName.appendChild(icon)
      const span = document.createElement('span')
      span.textContent = network.SSID
      iconAndName.appendChild(span)
      div.appendChild(iconAndName)
      const button = document.createElement('button')
      button.textContent = 'Connect'
      button.classList.add('settings-content-button')
    })
  } catch (error) {
    console.error('Error adding networks to DOM in renderer.js:', error)
  }
}

try {
  document.getElementById('showLimelightButton').addEventListener('click', () => {
    window.api.showLimelight()
  })
} catch (error) {
  console.error('Error adding click event listener to showLimelightButton:', error)
}

updateBluetoothDevices()
try {
  document.getElementById('updateBluetoothDevicesButton').addEventListener('click', updateBluetoothDevices)
} catch (error) {
  console.error('Error adding click event listener to updateBluetoothDevicesButton:', error)
}

updateWifiNetworks()