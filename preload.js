const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getDesktopFiles: async () => {
    try {
      const apps = await ipcRenderer.invoke('getDesktopFiles')
      return apps
    } catch (error) {
      console.error('Error getting desktop files:', error)
      return []
    }
  },
  launchDesktopFile: async (file) => {
    try {
      const result = await ipcRenderer.invoke('launchDesktopFile', file)
      return result
    } catch (error) {
      console.error('Error launching desktop file:', error)
      return null
    }
  },
  closeWindow: () => {
    ipcRenderer.send('close-window')
  },
  hideWindow: () => {
    ipcRenderer.send('hide-window')
  }
})