interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  const colors = [
    '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9',
    '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#c8e6c9',
    '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2',
    '#ffccbc', '#d7ccc8', '#f5f5f5', '#cfd8dc'
  ]

  return (
    <div>
      <h3 style={{ marginBottom: '12px' }}>调色盘🎨</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '5px'
      }}>
        {colors.map((color) => (
          <div
            key={color}
            style={{
              backgroundColor: color,
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              border: selectedColor === color ? '2px solid black' : '1px solid #ccc'
            }}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
      <input
        type="color"
        value={selectedColor}
        onChange={(e) => onColorChange(e.target.value)}
        style={{ width: '100%', height: '40px', marginTop: '10px' }}
      />
    </div>
  )
}
