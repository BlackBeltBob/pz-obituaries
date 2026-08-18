import { useRef, useState, type ChangeEvent } from 'react'

interface ImageGalleryProps {
  images: string[]
  onUpload: (file: File) => Promise<void>
}

export function ImageGallery({ images, onUpload }: ImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Photos</h2>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((src) => (
          <img key={src} src={src} alt="" className="aspect-square rounded object-cover" />
        ))}
      </div>
      <label className="mt-3 inline-block cursor-pointer text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        {uploading ? 'Uploading...' : '+ Add a photo'}
      </label>
    </div>
  )
}
