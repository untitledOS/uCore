const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')

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

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit()
// })

app.whenReady().then(() => {
    createWindow()
  
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
            console.log(`Icon ${iconName} not found in 64x64, trying ${size}x${size}`)
            icon = altIcon
            break
          }
        }
        if (icon && !fs.existsSync(icon)) {
          console.error(`Icon ${iconName} not found in any size`)
          icon = '/usr/share/icons/Papirus-Dark/symbolic/places/folder-symbolic.svg'
        }
      }
      console.log(`App: ${name}, Icon: ${icon}`) // Log the name and icon
      return { name, icon, file }
    })
    return apps
  } catch (error) {
    console.error('Error reading desktop files:', error)
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

const { globalShortcut } = require('electron')
app.whenReady().then(() => {
  globalShortcut.register('Meta+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    }
  })
  globalShortcut.register('CommandOrControl+F4', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
      }
    }
  })
})