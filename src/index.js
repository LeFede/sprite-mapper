const {
  vertexBlackedImage, 
  createSourceFromOverlayAndMap, 
  createGenericOverlay
} = require('./utils')

const cmd = process.env.npm_lifecycle_event

if (cmd === 'source') {
  const validKeys = [
    'overlay', 'map', 'output'
  ]

  const mappedProcess = process.argv.filter(e => e.includes('=')).reduce((prev, curr) => {
    const [key,value] = curr.split('=')
    if (validKeys.some(e => e === key)) return ({
      ...prev, [key]: value
    })
    throw new Error(`Invalid key "${key}"`)
  }, {})



  createSourceFromOverlayAndMap(
    mappedProcess['overlay'], // './64x32/overlay.png', 
    mappedProcess['map'], // './64x32/overlay.png', 
    mappedProcess['output'], // './64x32/source.png'
  )
}

if (cmd === 'colortable') {
  createGenericOverlay(100,100, 'overlay.png')
}
// vertexBlackedImage(
//   'testIn.png', 
//   'testOut.png'
// )

