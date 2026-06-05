import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, Camera, X, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * UploadZone — mobile-first drag-and-drop + camera/gallery picker.
 * Designed for phone primary use: thumb-sized tap targets, camera-centric UI.
 */
export default function UploadZone({ onFileSelect, accept = 'image/*', label = 'Upload Image', disabled, status }) {
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
            animate={
              status === 'processing' 
                ? { scale: [1, 0.98, 1], rotateX: [0, 5, 0], rotateY: [0, -5, 0] } 
                : { opacity: 1, scale: 1 }
            }
            transition={status === 'processing' ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "relative rounded-2xl overflow-hidden bg-card transition-all duration-500",
              status === 'processing' ? "border-2 border-brand-400 shadow-[0_0_40px_rgba(139,92,246,0.3)]" : "border border-brand-500/30"
            )}
            style={{ perspective: 1000 }}
          >
            {/* Scan Flash Effect */}
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />

            <img src={preview} alt="Upload preview" className={cn("w-full max-h-[60vh] md:max-h-64 object-contain bg-black/20 transition-all duration-1000", status === 'processing' && "contrast-125 saturate-150")} />
            
            {/* OCR Scanner Effects */}
            {status === 'processing' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                {/* Overlay color */}
                <div className="absolute inset-0 bg-brand-500/10 mix-blend-overlay" />
                
                {/* Scanning Laser Beam */}
                <motion.div
                  animate={{ top: ['-10%', '110%', '-10%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_20px_4px_rgba(139,92,246,1)] z-20"
                />

                {/* Edge Detection Corners */}
                <motion.div 
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-4 border border-brand-400/30"
                >
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-400" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-400" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-400" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-400" />
                </motion.div>

                {/* Live Extracted Keywords Mock */}
                <div className="absolute inset-0 p-8 flex flex-col justify-around opacity-50">
                  <motion.div animate={{ opacity: [0, 1, 0], x: [10, -10] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} className="text-brand-300 font-mono text-[10px] blur-[0.5px]">Analyzing text blocks...</motion.div>
                  <motion.div animate={{ opacity: [0, 1, 0], x: [-10, 10] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }} className="text-cyan-300 font-mono text-[10px] self-end blur-[0.5px]">Extracting dates...</motion.div>
                  <motion.div animate={{ opacity: [0, 1, 0], y: [10, -10] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }} className="text-emerald-300 font-mono text-[10px] blur-[0.5px]">Structuring syllabus...</motion.div>
                </div>
              </div>
            )}

            {status !== 'processing' && (
              <button
                onClick={clear}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-20"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20">
              <p className="text-sm text-white font-bold flex items-center gap-2">
                {status === 'processing' ? (
                  <>
                    <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} className="h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(139,92,246,1)]" />
                    AI Agent Processing Document...
                  </>
                ) : 'Image ready for processing'}
              </p>
            </div>
          </motion.div>
        ) : (
          /* Upload & Scan Selection Area */
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {/* MOBILE PRIMARY: Huge Camera Button */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => cameraRef.current?.click()}
              disabled={disabled}
              className="md:hidden flex flex-col items-center justify-center gap-4 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-3xl p-8 shadow-[0_10px_40px_-10px_rgba(139,92,246,0.6)] text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner border border-white/30">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <span className="block text-lg font-black tracking-tight">Scan Assignment</span>
                <span className="text-xs font-medium text-white/80">Take a photo of your syllabus or canvas page</span>
              </div>
            </motion.button>

            {/* DESKTOP PRIMARY: Dropzone */}
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                'hidden md:flex relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
                'flex-col items-center justify-center text-center p-8 min-h-[200px]',
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile secondary gallery button or desktop standard buttons */}
      {!preview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {/* Gallery picker (Primary fallback on mobile, secondary on desktop) */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
            disabled={disabled}
            className={cn(
              'flex flex-col md:flex-row items-center justify-center gap-3 rounded-2xl border border-border p-4',
              'bg-card hover:border-cyan-500/40 hover:bg-cyan-500/5',
              'transition-all duration-200 disabled:opacity-50',
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <ImageIcon className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xs font-bold text-foreground">Upload from Gallery</span>
              <span className="block text-[10px] text-muted-foreground mt-0.5">Choose an existing photo</span>
            </div>
          </motion.button>
        </div>
      )}
    </div>
  )
}
