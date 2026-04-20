'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback } from 'react'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }

function ToolbarButton({ children, active, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active ? 'bg-gray-800 text-white' : 'text-gray-700 hover:bg-gray-200'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ allowBase64: false }),
      Youtube.configure({ controls: true, nocookie: true }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing…' }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[400px] focus:outline-none p-4',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL')
    if (!url) return
    editor.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Image URL (paste from Media library)')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addYoutube = useCallback(() => {
    if (!editor) return
    const url = window.prompt('YouTube URL')
    if (!url) return
    editor.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  const addTwitter = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Tweet URL (e.g. https://twitter.com/user/status/123)')
    if (!url) return
    const html = `<div class="twitter-embed" data-tweet-url="${url}"></div>`
    editor.chain().focus().insertContent(html).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} className="italic">I</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}><u>U</u></ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })}>H4</ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>• List</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>1. List</ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>" Quote</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>— HR</ToolbarButton>
        <div className="w-px bg-gray-300 mx-1" />
        <ToolbarButton onClick={addLink} active={editor.isActive('link')}>Link</ToolbarButton>
        <ToolbarButton onClick={addImage}>Image</ToolbarButton>
        <ToolbarButton onClick={addYoutube}>YouTube</ToolbarButton>
        <ToolbarButton onClick={addTwitter}>Twitter/X</ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}
