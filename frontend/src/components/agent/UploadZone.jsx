import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, Camera, X, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * UploadZone — mobile-first drag-and-drop + camera/gallery picker.
 * Designed for phone primary use: thumb-sized tap targets, camera-centric UI.
 */
export default function UploadZone({ onFileSelect, accept = 'image/*', label = 'Upload Image', disabled }) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview,    setPreview]    = useState(null)
  const fileRef = useRef(null)
  const cameraRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) handleFile(file)
  }

  const clear = () => {
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input ref={fileRef}   type="file" accept={accept} className="hidden" onChange={handleChange} />
      <input ref={cameraRef} type="file" accept={accept} capture="environment" className="hidden" onChange={handleChange} />

      <AnimatePresence mode="wait">
        {preview ? (
          /* Preview state */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-brand-500/30 bg-card"
          >
            <img src={preview} alt="Upload preview" className="w-full max-h-64 object-contain bg-black/20" />
            <button
              onClick={clear}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-xs text-white/80 font-medium">Image ready for processing</p>
            </div>
          </motion.div>
        ) : (
          /* Drop zone */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
              'flex flex-col items-center justify-center text-center p-8 min-h-[200px]',
              isDragging
                ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
                : 'border-border hover:border-brand-500/40 hover:bg-brand-500/5',
            )}
            onClick={() => fileRef.current?.click()}
          >
            <motion.div
              animate={{ y: isDragging ? -4 : 0 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 border border-brand-500/20 mb-4"
            >
              {isDragging ? (
                <Upload className="h-8 w-8 text-brand-400" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              )}
            </motion.div>

            <p className="text-sm font-semibold mb-1">
              {isDragging ? 'Drop to upload' : label}
            </p>
            <p className="text-xs text-muted-foreground">Drag & drop or tap to select</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile action buttons */}
      {!preview && (
        <div className="grid grid-cols-2 gap-3">
          {/* Camera capture — mobile */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border border-border p-4',
              'bg-card hover:border-brand-500/40 hover:bg-brand-500/5',
              'transition-all duration-200 disabled:opacity-50',
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
              <Camera className="h-5 w-5 text-brand-400" />
            </div>
            <span className="text-xs font-medium">Take Photo</span>
            <span className="text-[10px] text-muted-foreground">Camera</span>
          </motion.button>

          {/* Gallery picker */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border border-border p-4',
              'bg-card hover:border-brand-500/40 hover:bg-brand-500/5',
              'transition-all duration-200 disabled:opacity-50',
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <Smartphone className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-xs font-medium">Gallery</span>
            <span className="text-[10px] text-muted-foreground">Choose file</span>
          </motion.button>
        </div>
      )}
    </div>
  )
}
