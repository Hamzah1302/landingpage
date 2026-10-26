"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import LinkExt from "@tiptap/extension-link"
import ImageExt from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { useEffect, useCallback, useRef, useState } from "react"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Link2Off,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Undo,
  Redo,
  CodeSquare,
  Upload,
  Loader2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors text-sm ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-white/70 hover:text-white hover:bg-white/10"
      } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: "language-" },
        // Preserve hard breaks (Shift+Enter) as <br> tags
        hardBreak: {
          keepMarks: true,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your article...",
      }),
      Underline,
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full mx-auto my-4 block" },
        allowBase64: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "article-content min-h-[480px] px-6 py-4 focus:outline-none",
      },
    },
  })

  // Sync external value changes (e.g. loading an existing article for editing)
  useEffect(() => {
    if (!editor) return
    const currentHTML = editor.getHTML()
    if (value !== currentHTML) {
      editor.commands.setContent(value || "", false)
    }
    // Only run when value prop changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("Enter URL:", previousUrl || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const addImageByUrl = useCallback(() => {
    if (!editor) return
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error } = await supabase.storage
        .from("article-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from("article-images")
        .getPublicUrl(data.path)

      editor.chain().focus().setImage({ src: urlData.publicUrl }).run()
    } catch (err: any) {
      alert(`Image upload failed: ${err?.message || err}`)
    } finally {
      setUploading(false)
    }
  }, [editor])

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleImageUpload(file)
      // Reset so same file can be re-uploaded
      e.target.value = ""
    },
    [handleImageUpload]
  )

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0

  if (!editor) return null

  return (
    <div className="rounded-lg border border-white/10 bg-background overflow-hidden">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-white/10 bg-secondary sticky top-0 z-10">
        {/* Undo / Redo */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          title="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Inline formatting */}
        <ToolbarButton title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Blocks */}
        <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
          <CodeSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton title="Add / edit link" onClick={setLink} active={editor.isActive("link")}>
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
            <Link2Off className="h-4 w-4" />
          </ToolbarButton>
        )}

        <Divider />

        {/* Image: upload from device */}
        <ToolbarButton
          title={uploading ? "Uploading..." : "Upload image from device"}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </ToolbarButton>
        {/* Image: insert by URL */}
        <ToolbarButton title="Insert image by URL" onClick={addImageByUrl}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor area — uses shared .article-content styles */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="px-6 py-2 border-t border-white/10 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Shift+Enter for line break &nbsp;·&nbsp; Enter for new paragraph
        </span>
        <span className="text-xs text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  )
}
