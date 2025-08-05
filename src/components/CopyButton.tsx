'use client'

interface CopyButtonProps {
  content: string
  className?: string
}

export default function CopyButton({ content, className }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    alert('All technical documents copied to clipboard!')
  }

  return (
    <button onClick={handleCopy} className={className}>
      Copy All Content
    </button>
  )
}
