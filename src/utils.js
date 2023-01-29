const Jimp = require('jimp')
const hsl2rgb = require('hsl-rgb');


// Jimp.read('test1.png', (err, img) => {
//   img
//     .resize(16,16)
//     .write('uwu.png')
// })

// Ros & columns of a 3x3 sprite
// let imageData = [
//   [ 0xFF0000FF, 0xFF0000FF, 0xFF0000FF ],
//   [ 0xFF0000FF, 0x00FF00FF, 0xFF0000FF ],
//   [ 0xFF0000FF, 0xFF0000FF, 0x0000FFFF ]
// ];


const groupArrays = (arr, n) => {
  let arrays = [];
    
  while (arr.length > 0)
    arrays.push(arr.splice(0, n));

  return arrays
}

const vertexBlackedImage = async (imageIn, imageOut) => {
  const e = await Jimp.read(imageIn)

  let meta = []
  const width = e.getWidth()
  const height = e.getHeight()

  for (let i = 0; i < width; i++){
    for (let j = 0; j < height; j++) {
      const {r, g, b, a} = Jimp.intToRGBA(e.getPixelColor(i,j))
      meta = [...meta, 
        `0x`+
        `${r.toString(16).padStart(2, '0')}`+
        `${g.toString(16).padStart(2, '0')}`+
        `${b.toString(16).padStart(2, '0')}`+
        `${a.toString(16).padStart(2, '0')}`]
    }
  }

  const groupedColors = groupArrays(meta, width || height)

  new Jimp(width, height, function (err, image) {
    if (err) throw err;
  
    groupedColors.forEach((row, x) => {
      row.forEach((color, y) => {

        // has alpha?
        const alpha = `${color}`.slice(-2)
        if (alpha === '00') return
        

        // Exact Copy
        if (false)
          image.setPixelColor(color, x, y);


        // by position
        if (true)
          image.setPixelColor(+`0x${x.toString(16).padStart(2, '0')}${y.toString(16).padStart(2, '0')}00FF`, x, y);

      });
    });
  
    image.write(imageOut, (err) => {
      if (err) throw err;
    });
  });

} 


const createSourceFromOverlayAndMap = async (overlayPath, mapPath, sourceOutPath) => {
  const overlay = await Jimp.read(overlayPath)
  const map = await Jimp.read(mapPath)

  // Overlay read
  const overlayWidth = overlay.getWidth()
  const overlayHeight = overlay.getHeight()

  const mapWidth = map.getWidth()
  const mapHeight = map.getHeight()

  let overlayColors = []
  new Jimp(overlayWidth, overlayHeight, (err, image) => {
    loop1: for (let overlayX = 0; overlayX < overlayWidth; overlayX++){
      loop2: for (let overlayY = 0; overlayY < overlayHeight; overlayY++) {
        // Check overlay colors
        const {r: oR, g: oG, b: oB, a: oA} = Jimp.intToRGBA(overlay.getPixelColor(overlayX,overlayY))

        // Discard invisible pixels
        if (oA === 0) continue
        

          // Found a pixel -> loop through map to find where the pixel is
          for (let mapX = 0; mapX < mapWidth; mapX++){
            for (let mapY = 0; mapY < mapHeight; mapY++) {
              const {r: mR, g: mG, b: mB, a: mA} = Jimp.intToRGBA(map.getPixelColor(mapX,mapY))
              
              // Discard invisible pixels
              if (mA === 0) continue

              // Found a pixel. Is it the pixel we are looking for?
              if (
                oR === mR &&
                oG === mG &&
                oB === mB &&
                oA === mA
              ) {
                // Found the pixel!
                const c = 
                  `0x`+
                  `${mapX.toString(16).padStart(2, '0')}`+
                  `${mapY.toString(16).padStart(2, '0')}`+
                  `00FF`

                image.setPixelColor(+c, overlayX, overlayY)
                continue loop2

              }

            } // mapY
          } // mapX

      } // overlayY
    } // overlayX

    // Write 
    image.write(sourceOutPath, (err) => {
      console.log(`Successfully created source at ${sourceOutPath}`)
      if (err) throw err;
    });


  })

}


const createGenericOverlay = async (width, height, imageOut) => {
  // console.log(hsl2rgb(340, 1, 0.5).map(e => e.toString(16).padStart(2, '0')).join(''))
  const angle = 340,
        saturation = 1,
        brightness = .5

  new Jimp(width, height, function (err, image) {
    const n = 2
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // console.log(y % n)
        const color = +`0x${hsl2rgb(x * 2, 1 - (y / 256) * 2, 0.5).map(e => e.toString(16).padStart(2, '0')).join('')}FF`
        // console.log(color)
        image.setPixelColor(color, x, y);
        // console.log(y+1 % n)
      }
    }

    image.write(imageOut, (err) => {
      if (err) throw err;
    });
  })

  // new Jimp(width, height, function (err, image) {
    // if (err) throw err;

    // for (let x = 0; x < width; x++) {
    //   for (let y = 0; y < height; y++) {

    //   }
    // }

  
    // groupedColors.forEach((row, x) => {
    //   row.forEach((color, y) => {

    //     // has alpha?
    //     const alpha = `${color}`.slice(-2)
    //     if (alpha === '00') return
        

    //     // Exact Copy
    //     if (false)
    //       image.setPixelColor(color, x, y);


    //     // by position
    //     if (true)
    //       image.setPixelColor(+`0x${x.toString(16).padStart(2, '0')}${y.toString(16).padStart(2, '0')}00FF`, x, y);

    //   });
    // });
  
    // image.write(imageOut, (err) => {
    //   if (err) throw err;
    // });
  // });
}

module.exports = {
  vertexBlackedImage,
  createSourceFromOverlayAndMap,
  createGenericOverlay
}

