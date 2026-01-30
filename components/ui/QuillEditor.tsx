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
        /* Toolbar styling */
        .ql-toolbar.ql-snow {
          border-radius: 8px 8px 0 0;
          border-color: #e5e7eb;
          background: #f8fafc; /* Light gray background */
          border-bottom: 1px solid #e2e8f0;
        }

        .ql-container.ql-snow {
          border-radius: 0 0 8px 8px;
          border-color: #e5e7eb;
        }

        /* Dark mode toolbar */
        .dark .ql-toolbar.ql-snow {
          background: #1e293b; /* Dark slate background */
          border-color: #334155 !important;
          color: #f1f5f9;
        }

        .dark .ql-container.ql-snow {
          border-color: #334155 !important;
          background: #0f172a;
          color: #f1f5f9;
        }

        /* Toolbar button styling */
        .ql-toolbar.ql-snow .ql-formats {
          border-right: 1px solid #e2e8f0;
        }

        .dark .ql-toolbar.ql-snow .ql-formats {
          border-right: 1px solid #334155;
        }

        /* Toolbar button hover effects */
        .ql-toolbar.ql-snow button:hover {
          background: #e2e8f0;
          border-radius: 4px;
        }

        .dark .ql-toolbar.ql-snow button:hover {
          background: #334155;
          border-radius: 4px;
        }

        /* Toolbar button active state */
        .ql-toolbar.ql-snow button.ql-active {
          background: #3b82f6;
          color: white;
          border-radius: 4px;
        }

        .dark .ql-toolbar.ql-snow button.ql-active {
          background: #2563eb;
          color: white;
          border-radius: 4px;
        }

        /* Toolbar icons */
        .ql-toolbar.ql-snow .ql-stroke {
          stroke: #475569;
        }

        .ql-toolbar.ql-snow .ql-fill {
          fill: #475569;
        }

        .dark .ql-toolbar.ql-snow .ql-stroke {
          stroke: #cbd5e1 !important;
        }

        .dark .ql-toolbar.ql-snow .ql-fill {
          fill: #cbd5e1 !important;
        }

        /* Picker styling */
        .ql-toolbar.ql-snow .ql-picker {
          color: #475569;
        }

        .dark .ql-toolbar.ql-snow .ql-picker {
          color: #cbd5e1 !important;
        }

        .ql-toolbar.ql-snow .ql-picker-options {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .dark .ql-toolbar.ql-snow .ql-picker-options {
          background: #1e293b;
          border-color: #334155;
          color: #f1f5f9;
        }

        .ql-toolbar.ql-snow .ql-picker-item:hover {
          background: #f1f5f9;
        }

        .dark .ql-toolbar.ql-snow .ql-picker-item:hover {
          background: #334155;
          color: #f1f5f9;
        }
      `}</style>
    </div>
  );
}
