'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { useEffect, useState, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Image as ImageIcon,
  Highlighter,
  Palette,
  Undo,
  Redo,
  Code,
} from 'lucide-react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightColorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Color,
      TextStyle,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[300px] px-4 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Close color pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textColorRef.current && !textColorRef.current.contains(event.target as Node)) {
        setShowTextColorPicker(false);
      }
      if (highlightColorRef.current && !highlightColorRef.current.contains(event.target as Node)) {
        setShowHighlightPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50 ${className}`}>
        <p className="text-gray-400">Loading editor...</p>
      </div>
    );
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      const caption = window.prompt('Enter image caption (optional):');
      
      if (caption) {
        // Insert as figure with caption
        editor
          .chain()
          .focus()
          .insertContent(`<figure class="image-center"><img src="${url}" alt="${caption}" /><figcaption>${caption}</figcaption></figure>`)
          .run();
      } else {
        // Insert image wrapped in figure without caption (centered by default)
        editor
          .chain()
          .focus()
          .insertContent(`<figure class="image-center"><img src="${url}" alt="" /></figure>`)
          .run();
      }
    }
  };

  const handleTextColor = (color: string) => {
    setTextColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const handleHighlight = (color: string) => {
    setHighlightColor(color);
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const setImageAlignment = (alignment: 'left' | 'center' | 'right') => {
    const html = editor.getHTML();
    let updatedHtml = html;
    
    // Update all existing figures with new alignment class
    updatedHtml = updatedHtml.replace(
      /<figure\s+class="image-(left|center|right)"/g,
      `<figure class="image-${alignment}"`
    );
    
    // Update figures without class
    updatedHtml = updatedHtml.replace(
      /<figure>/g,
      `<figure class="image-${alignment}">`
    );
    
    // Wrap standalone images in paragraphs with figure
    updatedHtml = updatedHtml.replace(
      /<p><img\s+([^>]+)><\/p>/g,
      `<figure class="image-${alignment}"><img $1></figure>`
    );
    
    // Set the updated content
    editor.commands.setContent(updatedHtml);
    editor.commands.focus();
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Color Picker */}
        <div className="relative" ref={textColorRef}>
          <button
            type="button"
            onClick={() => {
              setShowTextColorPicker(!showTextColorPicker);
              setShowHighlightPicker(false);
            }}
            className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
            title="Text Color"
          >
            <Palette size={18} />
            <div
              className="w-4 h-4 rounded border border-gray-400"
              style={{ backgroundColor: textColor }}
            />
          </button>
          {showTextColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <HexColorPicker color={textColor} onChange={handleTextColor} />
              <div className="mt-2 flex flex-wrap gap-1">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleTextColor(color)}
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlight Color Picker */}
        <div className="relative" ref={highlightColorRef}>
          <button
            type="button"
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowTextColorPicker(false);
            }}
            className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
            title="Highlight"
          >
            <Highlighter size={18} />
            <div
              className="w-4 h-4 rounded border border-gray-400"
              style={{ backgroundColor: highlightColor }}
            />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <HexColorPicker color={highlightColor} onChange={handleHighlight} />
              <div className="mt-2 flex flex-wrap gap-1">
                {['#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500', '#FF6B6B', '#A7F3D0', '#DDD6FE'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleHighlight(color)}
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-300' : ''}`}
          title="Code Block"
        >
          <Code size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : ''}`}
          title="Justify"
        >
          <AlignJustify size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link & Image */}
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
          title="Add Link"
        >
          <Link2 size={18} />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
          title="Add Image from URL"
        >
          <ImageIcon size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Image Alignment */}
        <button
          type="button"
          onClick={() => setImageAlignment('left')}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Image Left"
        >
          <div className="flex items-center gap-1">
            <ImageIcon size={14} />
            <AlignLeft size={14} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setImageAlignment('center')}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Image Center"
        >
          <div className="flex items-center gap-1">
            <ImageIcon size={14} />
            <AlignCenter size={14} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setImageAlignment('right')}
          className="p-2 rounded hover:bg-gray-200"
          title="Align Image Right"
        >
          <div className="flex items-center gap-1">
            <ImageIcon size={14} />
            <AlignRight size={14} />
          </div>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  );
}

export default RichTextEditor;
