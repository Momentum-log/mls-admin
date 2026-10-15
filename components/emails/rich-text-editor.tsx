"use client";

import { useState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  MousePointerClick,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const BUTTON_CLASS = "btn";

function ToolbarButton({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the editor's selection while clicking the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
        active && "bg-brand-blue/10 text-brand-blue",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Toolbar({
  editor,
  onLink,
}: {
  editor: Editor;
  onLink: () => void;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      button: e.isActive("link", { class: BUTTON_CLASS }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const divider = <span className="mx-1 h-5 w-px bg-border" aria-hidden />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-1.5 py-1">
      <ToolbarButton icon={Heading2} label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton icon={Heading3} label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
      {divider}
      <ToolbarButton icon={Bold} label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()} />
      <ToolbarButton icon={Italic} label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()} />
      <ToolbarButton icon={Underline} label="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()} />
      <ToolbarButton icon={Strikethrough} label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()} />
      {divider}
      <ToolbarButton icon={List} label="Bulleted list" active={state.bulletList} onClick={() => chain().toggleBulletList().run()} />
      <ToolbarButton icon={ListOrdered} label="Numbered list" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()} />
      <ToolbarButton icon={Quote} label="Highlighted note" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()} />
      <ToolbarButton icon={Minus} label="Divider line" onClick={() => chain().setHorizontalRule().run()} />
      {divider}
      <ToolbarButton icon={Link2} label="Link" active={state.link && !state.button} onClick={onLink} />
      <ToolbarButton
        icon={MousePointerClick}
        label="Show link as a button"
        active={state.button}
        disabled={!state.link}
        onClick={() =>
          chain()
            .extendMarkRange("link")
            .updateAttributes("link", { class: state.button ? null : BUTTON_CLASS })
            .run()
        }
      />
      <ToolbarButton icon={RemoveFormatting} label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} />
      <span className="ml-auto flex">
        <ToolbarButton icon={Undo2} label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()} />
        <ToolbarButton icon={Redo2} label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()} />
      </span>
    </div>
  );
}

function LinkBar({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [href, setHref] = useState(
    () => (editor.getAttributes("link").href as string | undefined) ?? "https://",
  );

  const apply = () => {
    const url = href.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!url || url === "https://") chain.unsetLink().run();
    else chain.setLink({ href: url }).run();
    onClose();
  };

  return (
    <div className="flex items-center gap-2 border-b bg-muted/20 px-2 py-1.5">
      <Input
        autoFocus
        aria-label="Link address"
        className="h-8"
        value={href}
        onChange={(e) => setHref(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
          if (e.key === "Escape") onClose();
        }}
      />
      <Button type="button" size="sm" onClick={apply}>
        Apply
      </Button>
      {editor.isActive("link") && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            onClose();
          }}
        >
          Remove
        </Button>
      )}
      <Button type="button" size="sm" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
}

/**
 * Rich text editor for email bodies. Reports HTML on every change; the
 * initial content is read once, so remount it (change `key`) to load new
 * content.
 */
export function RichTextEditor({
  id,
  initialContent,
  onChange,
}: {
  id?: string;
  initialContent: string;
  onChange: (html: string, isEmpty: boolean) => void;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: "mls-editor min-h-72 px-4 py-3 text-sm focus:outline-none",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Message",
      },
    },
    onCreate: ({ editor: e }) => onChange(e.getHTML(), e.isEmpty),
    onUpdate: ({ editor: e }) => onChange(e.getHTML(), e.isEmpty),
  });

  return (
    <div className="overflow-hidden rounded-md border bg-background shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
      {editor ? (
        <>
          <Toolbar editor={editor} onLink={() => setLinkOpen((o) => !o)} />
          {linkOpen && <LinkBar editor={editor} onClose={() => setLinkOpen(false)} />}
        </>
      ) : (
        <div className="h-10 border-b bg-muted/30" />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
