import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState, useCallback, useRef } from 'react'
import MinecraftHead from './MinecraftHead'
import ColorPicker from './ColorPicker'
import PixelGrid from './PixelGrid'

type Face = 'front' | 'right' | 'back' | 'left' | 'top' | 'bottom'

const createEmptyPixelGrid = () => Array(8).fill(0).map(() => Array(8).fill('#ffffff'))

const FACE_LABELS: Record<Face, string> = {
  front: 'Front',
  right: 'Right',
  back: 'Back',
  left: 'Left',
  top: 'Top',
  bottom: 'Bottom'
}

// 定义皮肤面部的位置映射
const FACE_POSITIONS = {
  top: { x: 8, y: 0 },
  bottom: { x: 16, y: 0 },
  left: { x: 0, y: 8 },
  front: { x: 8, y: 8 },
  right: { x: 16, y: 8 },
  back: { x: 24, y: 8 }
} as const

export default function SkinEditor() {
  const [selectedColor, setSelectedColor] = useState('#ffffff')
  const [textures, setTextures] = useState<Record<Face, string[][]>>({
    front: createEmptyPixelGrid(),
    right: createEmptyPixelGrid(),
    back: createEmptyPixelGrid(),
    left: createEmptyPixelGrid(),
    top: createEmptyPixelGrid(),
    bottom: createEmptyPixelGrid(),
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePixelClick = useCallback((face: Face, x: number, y: number) => {
    setTextures(prev => ({
      ...prev,
      [face]: prev[face].map((row, rowIndex) =>
        rowIndex === y
          ? row.map((color, colIndex) => colIndex === x ? selectedColor : color)
          : row
      )
    }))
  }, [selectedColor])

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      // 创建新的纹理对象
      const newTextures: Record<Face, string[][]> = {
        front: createEmptyPixelGrid(),
        right: createEmptyPixelGrid(),
        back: createEmptyPixelGrid(),
        left: createEmptyPixelGrid(),
        top: createEmptyPixelGrid(),
        bottom: createEmptyPixelGrid(),
      }

      // 从皮肤文件中提取每个面的像素
      Object.entries(FACE_POSITIONS).forEach(([face, position]) => {
        const facePixels = newTextures[face as Face]
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const pixelData = ctx.getImageData(position.x + x, position.y + y, 1, 1).data
            const color = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`
            facePixels[y][x] = color
          }
        }
      })

      setTextures(newTextures)
    }

    img.src = URL.createObjectURL(file)
    
    // 清除文件输入，这样同一个文件可以再次选择
    event.target.value = ''
  }

  const handleExport = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 32
    const ctx = canvas.getContext('2d')!

    // Fill background with transparency
    ctx.fillStyle = 'rgba(0, 0, 0, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const drawFace = (face: Face, offsetX: number, offsetY: number) => {
      textures[face].forEach((row, y) => {
        row.forEach((color, x) => {
          ctx.fillStyle = color
          ctx.fillRect(offsetX + x, offsetY + y, 1, 1)
        })
      })
    }

    // Draw head faces according to Minecraft skin layout
    Object.entries(FACE_POSITIONS).forEach(([face, position]) => {
      drawFace(face as Face, position.x, position.y)
    })

    const link = document.createElement('a')
    link.download = 'minecraft-skin.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <>
      <div style={{ 
        flex: 1,
        position: 'relative',
        height: '100%'
      }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <MinecraftHead textures={textures} />
          <OrbitControls />
        </Canvas>
      </div>
      <div style={{ 
        width: '400px',
        padding: '20px',
        backgroundColor: 'white',
        borderLeft: '1px solid #ddd',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header Section */}
        <div>
          <h2 style={{ 
            margin: 0,
            marginBottom: '16px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            Minecraft Skin Editor
          </h2>
          <div style={{ 
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="file"
              accept=".png"
              onChange={handleImport}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>↑</span>
              Import Skin
            </button>
            <button
              onClick={handleExport}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px' }}>↓</span>
              Export Skin
            </button>
          </div>
        </div>

        {/* Color Picker Section */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <h3 style={{ 
            margin: 0,
            marginBottom: '12px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>
            Color Picker
          </h3>
          <ColorPicker
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>

        {/* Pixel Editor Section */}
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          flex: 1
        }}>
          <h3 style={{ 
            margin: 0,
            marginBottom: '16px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>
            Face Editor
          </h3>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {(Object.keys(FACE_LABELS) as Face[]).map(face => (
              <div key={face} style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ 
                  margin: 0,
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#666'
                }}>
                  {FACE_LABELS[face]}
                </h4>
                <PixelGrid
                  width={8}
                  height={8}
                  selectedColor={selectedColor}
                  pixels={textures[face]}
                  onPixelClick={(x, y) => handlePixelClick(face, x, y)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
