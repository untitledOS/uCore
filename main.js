const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const { execSync } = require('child_process')

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

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit()
// })

app.whenReady().then(() => {
    createWindow()
    mainWindow.hide()
    createLimelightWindow()
    limelightWindow.hide()
    createSettingsWindow()
    // settingsWindow.hide()

    mainWindow.on('close', (event) => {
      event.preventDefault()
      mainWindow.hide()
    })

    limelightWindow.on('close', (event) => {
      event.preventDefault()
      limelightWindow.hide()
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
    console.log('Bluetoothctl output:', output) // Log the output of the command
    const lines = output.split('\n')
    // structure: Device 00:11:22:33:44:55 DeviceName
    // split by space, take second and third element
    for (const line of lines) {
      console.log('Processing line:', line) // Log each line being processed
      const parts = line.split(' ')
      if (parts.length >= 3) {
        const address = parts[1]
        const name = parts.slice(2).join(' ')
        devices.push({ address, name })
      }
    }
    console.log('Devices found:', devices) // Log the devices found
    return devices
  } catch (error) {
    console.error('Error getting Bluetooth devices:', error) // Log any errors
    return []
  }
})

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

function toggleSettingsWindow() {
  toggleWindow(settingsWindow)
}

const { globalShortcut } = require('electron')
app.whenReady().then(() => {
  globalShortcut.register('Super+Space', () => { toggleLaunchpadWindow() })
  globalShortcut.register('Super+F4', () => { toggleLaunchpadWindow() })
  globalShortcut.register('Alt+Space', () => { toggleLimeLightWindow() })
  globalShortcut.register('Super+I', () => { toggleSettingsWindow() })
})