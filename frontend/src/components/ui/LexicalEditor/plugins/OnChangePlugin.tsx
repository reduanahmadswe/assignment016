'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef } from 'react';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

interface OnChangePluginProps {
  value: string;
  onChange: (html: string) => void;
}

export default function OnChangePlugin({ value, onChange }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext();
  const isFirstRender = useRef(true);

  // Set initial value
  useEffect(() => {
    if (isFirstRender.current && value) {
      isFirstRender.current = false;
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        
        // Clear the root and use $insertNodes to properly handle all node types
        const root = $getRoot();
        root.clear();
        $insertNodes(nodes);
      });
    }
  }, [editor, value]);

  // Listen for changes
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // Only emit changes if the editor state actually changed
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
        return;
      }
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onChange(html);
      });
    });
  }, [editor, onChange]);

  return null;
}
