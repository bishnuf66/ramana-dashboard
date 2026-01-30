"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  className = "",
  height = "200px",
}: QuillEditorProps) {
  const quillRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Keep the latest onChange in a ref to avoid re-triggering the main effect
  const onUpdateRef = useRef(onChange);
  useEffect(() => {
    onUpdateRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !quillRef.current || quillInstance.current) return;

    let quill: any;

    const initializeQuill = async () => {
      const QuillModule = await import("quill");
      const Quill = QuillModule.default;

      if (!quillRef.current) return;

      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link", "image"],
        ["clean"],
      ];

      quill = new Quill(quillRef.current, {
        theme: "snow",
        modules: { toolbar: toolbarOptions },
        placeholder,
      });

      quillInstance.current = quill;

      // Set initial value
      if (value) {
        quill.root.innerHTML = value;
      }

      // Handle changes
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        // Use the ref to call the latest onChange without re-triggering this effect
        if (onUpdateRef.current) {
          onUpdateRef.current(html === "<p><br></p>" ? "" : html);
        }
      });
    };

    initializeQuill();

    return () => {
      if (quillInstance.current) {
        // Quill doesn't have a formal "destroy", but we clear the UI
        const toolbar = quillRef.current?.previousSibling;
        if (toolbar && (toolbar as Element).classList.contains("ql-toolbar")) {
          toolbar.remove();
        }
        quillInstance.current = null;
      }
    };
    // Removed onChange and placeholder from here to prevent re-init loops
  }, [isClient]);

  // Sync external value changes
  useEffect(() => {
    if (quillInstance.current) {
      const currentHtml = quillInstance.current.root.innerHTML;
      if (value !== currentHtml && value !== undefined) {
        quillInstance.current.root.innerHTML = value || "";
      }
    }
  }, [value]);

  if (!isClient)
    return <div style={{ height }} className="animate-pulse bg-gray-100" />;

  return (
    <div className={`quill-editor ${className}`}>
      <div
        ref={quillRef}
        style={{ height }}
        className="bg-white dark:bg-gray-700"
      />
      <style jsx global>{`
        /* Your existing styles are fine, but ensure .ql-toolbar is visible */
        .ql-toolbar.ql-snow {
          border-radius: 8px 8px 0 0;
          border-color: #e5e7eb;
        }
        .ql-container.ql-snow {
          border-radius: 0 0 8px 8px;
          border-color: #e5e7eb;
        }
        .dark .ql-toolbar,
        .dark .ql-container {
          border-color: #4b5563 !important;
          background: #374151;
          color: white;
        }
      `}</style>
    </div>
  );
}
