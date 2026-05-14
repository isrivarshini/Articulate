import { useState, useRef } from 'react';

export default function ImageSlot({
  shape = 'rounded',
  placeholder = 'Drop your avatar',
  style = {},
  onImageChange,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const borderRadius =
    shape === 'circle' ? '50%' : shape === 'pill' ? 9999 : 12;

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target.result);
      onImageChange?.(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      style={{
        ...style,
        borderRadius,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        background: isDragging ? 'rgba(184,174,240,0.2)' : 'rgba(0,0,0,0.25)',
        border: isDragging
          ? '2px dashed rgba(184,174,240,0.6)'
          : '2px dashed rgba(255,255,255,0.2)',
        display: 'grid',
        placeItems: 'center',
        transition: 'all 0.2s',
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Avatar"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            inset: 0,
          }}
        />
      ) : (
        <span
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 13,
            textAlign: 'center',
            padding: 8,
          }}
        >
          {placeholder}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}