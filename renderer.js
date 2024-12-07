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