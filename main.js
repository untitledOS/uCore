const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const { execSync } = require('child_process')
const { screen } = require('electron')

let mainWindow

const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        enableRemoteModule: false,
        nodeIntegration: false,
      },
      autoHideMenuBar: true,
      fullscreen: true,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
    })
  
    mainWindow.loadFile('launchpad.html')
}

const createLimelightWindow = () => {
  limelightWindow = new BrowserWindow({
    width: 500,
    height: 1920,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
  })

  limelightWindow.loadFile('limelight.html')
}

const createSettingsWindow = () => {
  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  })

  settingsWindow.loadFile('settings.html')
}

const createStatusBar = () => {
  screenWidth = screen.getPrimaryDisplay().workAreaSize.width
  statusBar = new BrowserWindow({
    width: screenWidth,
    height: 30,
    x: 0,
    y: 0,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    frame: false,
    alwaysOnTop: true,
    // resizable: false,
    transparent: true,
  })

  statusBar.loadFile('statusbar.html')
}

const createAppCenterWindow = () => {
  appCenterWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  })

  appCenterWindow.loadFile('flathub.html')
}

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit()
// })

app.whenReady().then(() => {
    // createStatusBar()
    createWindow()
    mainWindow.hide()
    createLimelightWindow()
    limelightWindow.hide()
    // createSettingsWindow()
    createAppCenterWindow()

    mainWindow.on('close', (event) => {
      event.preventDefault()
      mainWindow.hide()
    })

    limelightWindow.on('close', (event) => {
      event.preventDefault()
      limelightWindow.hide()
    })

    statusBar.on('close', (event) => {
      event.preventDefault()
    })
  
    // app.on('activate', () => {
    //   if (BrowserWindow.getAllWindows().length === 0) createWindow()
    // })
})

ipcMain.handle('getDesktopFiles', async () => {
  try {
    const applicationsDir = '/usr/share/applications'
    const iconsDirTemplate = '/usr/share/icons/hicolor/SIZExSIZE/apps'
    const desktopFiles = fs.readdirSync(applicationsDir).filter(file => file.endsWith('.desktop'))
    const apps = desktopFiles.map(file => {
      const content = fs.readFileSync(path.join(applicationsDir, file), 'utf-8')
      const nameMatch = content.match(/^Name=(.*)$/m)
      const iconMatch = content.match(/^Icon=(.*)$/m)
      const name = nameMatch ? nameMatch[1] : 'Unknown'
      const iconName = iconMatch ? iconMatch[1] : null
      let icon = iconName ? path.join(iconsDirTemplate.replace(/SIZE/g, '64'), iconName + '.png') : null
      if (icon && !fs.existsSync(icon)) {
        const sizes = [128, 48, 32, 16]
        for (const size of sizes) {
          const altIcon = path.join(iconsDirTemplate.replace(/SIZE/g, size), iconName + '.png')
          if (fs.existsSync(altIcon)) {
            icon = altIcon
            break
          }
        }
        if (icon && !fs.existsSync(icon)) {
          icon = '/usr/share/icons/Papirus-Dark/symbolic/places/folder-symbolic.svg'
        }
      }
      return { name, icon, file }
    })
    return apps
  } catch (error) {
    return []
  }
})

ipcMain.handle('launchDesktopFile', async (event, file) => {
  try {
    const content = fs.readFileSync("/usr/share/applications/" + file, 'utf-8')
    const execMatch = content.match(/^Exec=(.*)$/m)
    const exec_content = execMatch ? execMatch[1] : null
    if (!exec_content) {
      console.error('No Exec line found in desktop file:', file)
      return null
    }
    const command = exec_content.replace(/%[a-zA-Z]/g, '')
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error launching desktop file:', error)
        return null
      }
      console.log('Desktop file launched:', file)
    })
  } catch (error) {
    console.error('Error launching desktop file:', error)
  }
})

ipcMain.handle('getBluetoothDevices', async () => {
  try {
    const devices = []
    const output = execSync('bluetoothctl devices').toString()
    const lines = output.split('\n')
    for (const line of lines) {
      const parts = line.split(' ')
      if (parts.length >= 3) {
        const address = parts[1]
        const name = parts.slice(2).join(' ')
        devices.push({ address, name })
      }
    }
    // also append bluetoothctl info {address} to get more info for each device and add info as a property to each device
    for (const device of devices) {
      const output = execSync(`bluetoothctl info ${device.address}`).toString()
      const lines = output.split('\n')
      for (const line of lines) {
        const parts = line.split(': ')
        if (parts.length >= 2) {
          const key = parts[0].replace(/^\t/, '')
          const value = parts[1]
          device[key] = value
        }
      }
    }
    console.log('Bluetooth devices:', devices)
    return devices
  } catch (error) {
    console.error('Error getting Bluetooth devices:', error) // Log any errors
    return []
  }
})

ipcMain.handle('connectBluetoothDevice', async (event, address) => {
  try {
    // get info to see if already connected
    const infoOutput = execSync(`bluetoothctl info ${address}`).toString()
    const infoLines = infoOutput.split('\n')
    let connected = false
    for (const line of infoLines) {
      if (line.includes('Connected: yes')) {
        connected = true
        break
      }
    }
    if (connected) {
      const output = execSync(`bluetoothctl disconnect ${address}`).toString()
      return 'disconnected'
    }
    const output = execSync(`bluetoothctl connect ${address}`).toString()
    if (output.includes('Connected: yes')) {
      console.log('Bluetooth device connected:', address)
      return 'connected'
    } else {
      console.log('Failed to connect to Bluetooth device:', address)
      return 'failed'
    }
  } catch (error) {
    console.error('Error connecting Bluetooth device:', error)
    return null
  }
})

ipcMain.handle('getWifiNetworks', async () => {
  try {
    const networks = []
    const output = execSync('nmcli -f SSID,BARS device wifi list').toString()
    const lines = output.split('\n')
    for (const line of lines) {
      const parts = line.split(/\s+/)
      if (parts.length >= 2) {
        const ssid = parts[0]
        const bars = parts[1]
        networks.push({ ssid, bars })
      }
    }
    return networks
  } catch (error) {
    console.error('Error getting WiFi networks:', error)
    return []
  }
})

ipcMain.handle('showLimelight', async () => {
  if (limelightWindow) {
    if (!limelightWindow.isVisible()) {
      limelightWindow.show()
    }
  }
})

ipcMain.handle('getSystemInfo', async () => {
  try {
    const Hostname = execSync('uname -n').toString().trim()
    const Kernel = execSync('uname -sr').toString().trim()
    const Uptime = execSync('uptime -p').toString().trim().replace('up ', '')
    const CPU = execSync('lscpu | grep "Model name"').toString().trim().replace('Model name:', '').trim()
    const RAM = execSync('free -h | grep "Mem"').toString().trim().replace(/Mem:\s+/, '').split(/\s+/)[0]
    const info = { "Computer Name": Hostname, "Kernel Version": Kernel, Uptime, "Processor (CPU)": CPU, "Memory (RAM)": RAM }
    return info;
  } catch (error) {
    console.error('Error getting system info:', error);
    return null;
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close()
  }
})

ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide()
  }
})

function toggleWindow(window) {
  if (window) {
    if (window.isVisible()) {
      window.hide()
    } else {
      window.show()
    }
  }
}

function toggleLaunchpadWindow() {
  toggleWindow(mainWindow)
}

function toggleLimeLightWindow() {
  toggleWindow(limelightWindow)
}

const { globalShortcut } = require('electron')
app.whenReady().then(() => {
  globalShortcut.register('Super+Space', () => { toggleLaunchpadWindow() })
  globalShortcut.register('Super+F4', () => { toggleLaunchpadWindow() })
  globalShortcut.register('Alt+Space', () => { toggleLimeLightWindow() })
  globalShortcut.register('Super+I', () => { createSettingsWindow() })
})
