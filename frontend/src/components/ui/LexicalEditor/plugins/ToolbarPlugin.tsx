'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNodeByKey,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  ListNode,
} from '@lexical/list';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
import { $createCodeNode, $isCodeNode } from '@lexical/code';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $isParentElementRTL,
  $setBlocksType,
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  INSERT_TABLE_COMMAND,
} from '@lexical/table';
import Modal from '@/components/ui/Modal';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link2,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  ChevronDown,
  Undo2,
  Redo2,
  Type,
  Highlighter,
  Minus,
  Plus,
  Subscript,
  Superscript,
  Table,
  Youtube,
  Palette,
  IndentIncrease,
  IndentDecrease,
  Calendar,
  Scissors,
} from 'lucide-react';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import { INSERT_YOUTUBE_COMMAND } from './YouTubePlugin';
import { INSERT_PAGE_BREAK_COMMAND } from './PageBreakPlugin';

const LowPriority = 1;

const blockTypeToBlockName: { [key: string]: string } = {
  bullet: 'Bulleted List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
  ['SolaimanLipi', 'SolaimanLipi'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10'],
  ['11px', '11'],
  ['12px', '12'],
  ['13px', '13'],
  ['14px', '14'],
  ['15px', '15'],
  ['16px', '16'],
  ['17px', '17'],
  ['18px', '18'],
  ['19px', '19'],
  ['20px', '20'],
  ['24px', '24'],
  ['28px', '28'],
  ['32px', '32'],
  ['36px', '36'],
  ['48px', '48'],
  ['72px', '72'],
];

const TEXT_COLOR_OPTIONS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
];

function Divider() {
  return <div className="divider" />;
}

function DropdownColorPicker({
  color,
  onChange,
  title,
  icon: Icon,
}: {
  color: string;
  onChange: (color: string) => void;
  title: string;
  icon: any;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dropdown color-picker-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="toolbar-item color-picker-button"
        onClick={() => setShowPicker(!showPicker)}
        title={title}
      >
        <Icon size={18} />
        <div className="color-indicator" style={{ backgroundColor: color }} />
      </button>
      {showPicker && (
        <div className="color-picker-dropdown">
          <div className="color-grid">
            {TEXT_COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  onChange(c);
                  setShowPicker(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FontDropdown({
  value,
  options,
  onChange,
  style,
}: {
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
  style?: 'font-family' | 'font-size';
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = options.find(([v]) => v === value)?.[1] || value;

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="dropdown-button font-dropdown"
        onClick={() => setShowDropdown(!showDropdown)}
        type="button"
        style={style === 'font-family' ? { fontFamily: value, minWidth: '100px' } : { minWidth: '50px' }}
      >
        <span>{displayValue}</span>
        <ChevronDown size={14} />
      </button>
      {showDropdown && (
        <div className="dropdown-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {options.map(([optionValue, optionLabel]) => (
            <button
              key={optionValue}
              className={`dropdown-item ${value === optionValue ? 'active' : ''}`}
              onClick={() => {
                onChange(optionValue);
                setShowDropdown(false);
              }}
              type="button"
              style={style === 'font-family' ? { fontFamily: optionValue } : undefined}
            >
              <span>{optionLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BlockTypeDropdown({
  blockType,
  editor
}: {
  blockType: string;
  editor: any;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
    setShowDropdown(false);
  };

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3' | 'h4' | 'h5') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
    setShowDropdown(false);
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setShowDropdown(false);
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setShowDropdown(false);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
    setShowDropdown(false);
  };

  const formatCode = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType !== 'code') {
          $setBlocksType(selection, () => $createCodeNode());
        } else {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
    setShowDropdown(false);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="dropdown-button"
        onClick={() => setShowDropdown(!showDropdown)}
        type="button"
        aria-label="Format block type"
      >
        <span>{blockTypeToBlockName[blockType] || 'Normal'}</span>
        <ChevronDown size={14} />
      </button>
      {showDropdown && (
        <div className="dropdown-content">
          <button
            className={`dropdown-item ${blockType === 'paragraph' ? 'active' : ''}`}
            onClick={formatParagraph}
            type="button"
          >
            <Type size={16} />
            <span>Normal</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'h1' ? 'active' : ''}`}
            onClick={() => formatHeading('h1')}
            type="button"
          >
            <Heading1 size={16} />
            <span>Heading 1</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'h2' ? 'active' : ''}`}
            onClick={() => formatHeading('h2')}
            type="button"
          >
            <Heading2 size={16} />
            <span>Heading 2</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'h3' ? 'active' : ''}`}
            onClick={() => formatHeading('h3')}
            type="button"
          >
            <Heading3 size={16} />
            <span>Heading 3</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'h4' ? 'active' : ''}`}
            onClick={() => formatHeading('h4')}
            type="button"
          >
            <Heading4 size={16} />
            <span>Heading 4</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'bullet' ? 'active' : ''}`}
            onClick={formatBulletList}
            type="button"
          >
            <List size={16} />
            <span>Bullet List</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'number' ? 'active' : ''}`}
            onClick={formatNumberedList}
            type="button"
          >
            <ListOrdered size={16} />
            <span>Numbered List</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'quote' ? 'active' : ''}`}
            onClick={formatQuote}
            type="button"
          >
            <Quote size={16} />
            <span>Quote</span>
          </button>
          <button
            className={`dropdown-item ${blockType === 'code' ? 'active' : ''}`}
            onClick={formatCode}
            type="button"
          >
            <Code size={16} />
            <span>Code Block</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('15px');
  const [fontColor, setFontColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);
  const [showAlignDropdown, setShowAlignDropdown] = useState(false);
  
  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [tableRows, setTableRows] = useState('3');
  const [tableColumns, setTableColumns] = useState('3');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const insertDropdownRef = useRef<HTMLDivElement>(null);
  const alignDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (insertDropdownRef.current && !insertDropdownRef.current.contains(event.target as Node)) {
        setShowInsertDropdown(false);
      }
      if (alignDropdownRef.current && !alignDropdownRef.current.contains(event.target as Node)) {
        setShowAlignDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));

      // Update font styles
      const fontFamilyValue = $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial');
      setFontFamily(fontFamilyValue);
      const fontSizeValue = $getSelectionStyleValueForProperty(selection, 'font-size', '15px');
      setFontSize(fontSizeValue);

      // Update links
      const node = anchorNode;
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type === 'number' ? 'number' : type === 'check' ? 'check' : 'bullet');
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles);
        }
      });
    },
    [editor]
  );

  const onFontFamilyChange = useCallback(
    (value: string) => {
      applyStyleText({ 'font-family': value });
    },
    [applyStyleText]
  );

  const onFontSizeChange = useCallback(
    (value: string) => {
      applyStyleText({ 'font-size': value });
    },
    [applyStyleText]
  );

  const onFontColorChange = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
      setFontColor(value);
    },
    [applyStyleText]
  );

  const onBgColorChange = useCallback(
    (value: string) => {
      applyStyleText({ 'background-color': value });
      setBgColor(value);
    },
    [applyStyleText]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setShowLinkModal(true);
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const handleInsertLink = () => {
    if (linkUrl) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  const insertImage = useCallback(() => {
    setShowImageModal(true);
    setShowInsertDropdown(false);
  }, []);

  const handleInsertImage = () => {
    if (imageUrl) {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: imageUrl, altText: imageAlt });
    }
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
  };

  const insertYouTubeVideo = useCallback(() => {
    setShowYouTubeModal(true);
    setShowInsertDropdown(false);
  }, []);

  const handleInsertYouTube = () => {
    if (youtubeUrl) {
      editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, youtubeUrl);
    }
    setShowYouTubeModal(false);
    setYoutubeUrl('');
  };

  const insertTable = useCallback(() => {
    setShowTableModal(true);
    setShowInsertDropdown(false);
  }, []);

  const handleInsertTable = () => {
    if (tableRows && tableColumns) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: tableRows,
        columns: tableColumns,
      });
    }
    setShowTableModal(false);
    setTableRows('3');
    setTableColumns('3');
  };

  const insertHorizontalRule = useCallback(() => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
    setShowInsertDropdown(false);
  }, [editor]);

  const insertPageBreak = useCallback(() => {
    editor.dispatchCommand(INSERT_PAGE_BREAK_COMMAND, undefined);
    setShowInsertDropdown(false);
  }, [editor]);

  const insertDate = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const dateString = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        selection.insertText(dateString);
      }
    });
    setShowInsertDropdown(false);
  }, [editor]);

  return (
    <>
      <div className="toolbar">
      {/* Undo/Redo */}
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className="toolbar-item"
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={18} />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className="toolbar-item"
        aria-label="Redo"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={18} />
      </button>
      <Divider />

      {/* Block Type */}
      <BlockTypeDropdown blockType={blockType} editor={editor} />
      <Divider />

      {/* Font Family */}
      <FontDropdown
        value={fontFamily}
        options={FONT_FAMILY_OPTIONS}
        onChange={onFontFamilyChange}
        style="font-family"
      />

      {/* Font Size */}
      <div className="font-size-controls">
        <button
          type="button"
          className="toolbar-item font-size-btn"
          onClick={() => {
            const currentIndex = FONT_SIZE_OPTIONS.findIndex(([v]) => v === fontSize);
            if (currentIndex > 0) {
              onFontSizeChange(FONT_SIZE_OPTIONS[currentIndex - 1][0]);
            }
          }}
          title="Decrease font size"
        >
          <Minus size={14} />
        </button>
        <FontDropdown
          value={fontSize}
          options={FONT_SIZE_OPTIONS}
          onChange={onFontSizeChange}
          style="font-size"
        />
        <button
          type="button"
          className="toolbar-item font-size-btn"
          onClick={() => {
            const currentIndex = FONT_SIZE_OPTIONS.findIndex(([v]) => v === fontSize);
            if (currentIndex < FONT_SIZE_OPTIONS.length - 1) {
              onFontSizeChange(FONT_SIZE_OPTIONS[currentIndex + 1][0]);
            }
          }}
          title="Increase font size"
        >
          <Plus size={14} />
        </button>
      </div>
      <Divider />

      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        className={'toolbar-item ' + (isBold ? 'active' : '')}
        aria-label="Format Bold"
        title="Bold (Ctrl+B)"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        className={'toolbar-item ' + (isItalic ? 'active' : '')}
        aria-label="Format Italics"
        title="Italic (Ctrl+I)"
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        className={'toolbar-item ' + (isUnderline ? 'active' : '')}
        aria-label="Format Underline"
        title="Underline (Ctrl+U)"
      >
        <Underline size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
        className={'toolbar-item ' + (isCode ? 'active' : '')}
        aria-label="Insert Code"
        title="Inline Code"
      >
        <Code size={18} />
      </button>
      <Divider />

      {/* Link */}
      <button
        type="button"
        onClick={insertLink}
        className={'toolbar-item ' + (isLink ? 'active' : '')}
        aria-label="Insert Link"
        title="Insert Link"
      >
        <Link2 size={18} />
      </button>

      {/* Text Color */}
      <DropdownColorPicker
        color={fontColor}
        onChange={onFontColorChange}
        title="Text Color"
        icon={Palette}
      />

      {/* Background Color */}
      <DropdownColorPicker
        color={bgColor}
        onChange={onBgColorChange}
        title="Background Color"
        icon={Highlighter}
      />
      <Divider />

      {/* Subscript / Superscript */}
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
        className={'toolbar-item ' + (isSubscript ? 'active' : '')}
        aria-label="Subscript"
        title="Subscript"
      >
        <Subscript size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
        className={'toolbar-item ' + (isSuperscript ? 'active' : '')}
        aria-label="Superscript"
        title="Superscript"
      >
        <Superscript size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
        className={'toolbar-item ' + (isStrikethrough ? 'active' : '')}
        aria-label="Strikethrough"
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>
      <Divider />

      {/* Insert Dropdown */}
      <div className="dropdown" ref={insertDropdownRef}>
        <button
          type="button"
          className="dropdown-button"
          onClick={() => setShowInsertDropdown(!showInsertDropdown)}
        >
          <Plus size={16} />
          <span>Insert</span>
          <ChevronDown size={14} />
        </button>
        {showInsertDropdown && (
          <div className="dropdown-content insert-dropdown">
            <button className="dropdown-item" onClick={insertHorizontalRule} type="button">
              <Minus size={16} />
              <span>Horizontal Rule</span>
            </button>
            <button className="dropdown-item" onClick={insertPageBreak} type="button">
              <Scissors size={16} />
              <span>Page Break</span>
            </button>
            <button className="dropdown-item" onClick={insertImage} type="button">
              <Image size={16} />
              <span>Image</span>
            </button>
            <button className="dropdown-item" onClick={insertTable} type="button">
              <Table size={16} />
              <span>Table</span>
            </button>
            <button className="dropdown-item" onClick={insertDate} type="button">
              <Calendar size={16} />
              <span>Date</span>
            </button>
            <button className="dropdown-item" onClick={insertYouTubeVideo} type="button">
              <Youtube size={16} />
              <span>YouTube Video</span>
            </button>
          </div>
        )}
      </div>

      {/* Align Dropdown */}
      <div className="dropdown" ref={alignDropdownRef}>
        <button
          type="button"
          className="dropdown-button"
          onClick={() => setShowAlignDropdown(!showAlignDropdown)}
        >
          <AlignLeft size={16} />
          <span>Align</span>
          <ChevronDown size={14} />
        </button>
        {showAlignDropdown && (
          <div className="dropdown-content">
            <button
              className="dropdown-item"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                setShowAlignDropdown(false);
              }}
              type="button"
            >
              <AlignLeft size={16} />
              <span>Left Align</span>
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                setShowAlignDropdown(false);
              }}
              type="button"
            >
              <AlignCenter size={16} />
              <span>Center Align</span>
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                setShowAlignDropdown(false);
              }}
              type="button"
            >
              <AlignRight size={16} />
              <span>Right Align</span>
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
                setShowAlignDropdown(false);
              }}
              type="button"
            >
              <AlignJustify size={16} />
              <span>Justify</span>
            </button>
            <div className="dropdown-divider" />
            <button
              className="dropdown-item"
              onClick={() => {
                editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                setShowAlignDropdown(false);
              }}
              type="button"
            >
              <IndentDecrease size={16} />
              <span>Outdent</span>
            </button>
            <button
              className="dropdown-item"
              onClick={() => {
                editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                setShowAlignDropdown(false);
              }}
              type="button"
            >
              <IndentIncrease size={16} />
              <span>Indent</span>
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Modern Modals */}
    {/* Image Insert Modal */}
    <Modal
        isOpen={showImageModal}
        onClose={() => {
          setShowImageModal(false);
          setImageUrl('');
          setImageAlt('');
        }}
        title="Insert Image"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Alt Text (Optional)
            </label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Describe the image"
              className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowImageModal(false);
                setImageUrl('');
                setImageAlt('');
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertImage}
              disabled={!imageUrl}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Insert Image
            </button>
          </div>
        </div>
      </Modal>

      {/* Link Insert Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkUrl('');
        }}
        title="Insert Link"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Link URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowLinkModal(false);
                setLinkUrl('');
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertLink}
              disabled={!linkUrl}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Insert Link
            </button>
          </div>
        </div>
      </Modal>

      {/* YouTube Insert Modal */}
      <Modal
        isOpen={showYouTubeModal}
        onClose={() => {
          setShowYouTubeModal(false);
          setYoutubeUrl('');
        }}
        title="Insert YouTube Video"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              YouTube URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowYouTubeModal(false);
                setYoutubeUrl('');
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertYouTube}
              disabled={!youtubeUrl}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Insert Video
            </button>
          </div>
        </div>
      </Modal>

      {/* Table Insert Modal */}
      <Modal
        isOpen={showTableModal}
        onClose={() => {
          setShowTableModal(false);
          setTableRows('3');
          setTableColumns('3');
        }}
        title="Insert Table"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Rows <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Columns <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={tableColumns}
                onChange={(e) => setTableColumns(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowTableModal(false);
                setTableRows('3');
                setTableColumns('3');
              }}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              disabled={!tableRows || !tableColumns}
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              Insert Table
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
