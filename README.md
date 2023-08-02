### 安装
`npm i plum.js`

### 默认使用
```html
 <canvas height="600" width="600"></canvas>
```
```javascript
import { Plum } from 'plum.js'
let plumInstance = new Plum()
const boundingRect = document.body.getBoundingClientRect()
// 默认会从四条边各画一条
plumInstance.start(
  document.querySelector('canvas'),
  { 
    width: boundingRect.width, height: boundingRect.height 
  } 
)
```
### 自定义step
```javascript
  const DEG_180 = Math.PI
  const DEG_90 = DEG_180 / 2
  const DEG_15 = DEG_90 / 6
  // 要先于start调用 否则使用默认的四个
  plumInstance.addDefaultStep([
    { x: plumInstance.getRandomPos() * boundingRect.width, y: -5, rad: DEG_90 },
    { x: -5, y: plumInstance.getRandomPos() * boundingRect.height, rad: 0 },
    { x: boundingRect.width + 5, y: plumInstance.getRandomPos() * boundingRect.height, rad: DEG_180 },
    { x: plumInstance.getRandomPos() * boundingRect.width, y: boundingRect.height + 5, rad: -DEG_90 },
    { x: 0, y: boundingRect.height, rad: -DEG_90 },
    {x:boundingRect.width, y:boundingRect.height, rad:DEG_180},
  ])

  plumInstance.start(
  document.querySelector('canvas'),
  { 
    width: boundingRect.width, height: boundingRect.height 
  } 
)
```
