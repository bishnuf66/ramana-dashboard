"use client";

import { useEffect, useRef, useState } from "react";
import Quill from "quill";

// Import Quill styles
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
  const quillInstance = useRef<Quill | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!quillRef.current || quillInstance.current) return;

    // Clear any existing content to prevent duplicate toolbars
    if (quillRef.current) {
      quillRef.current.innerHTML = "";
    }

    // Configure toolbar with heading options
    const toolbarOptions = [
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // Heading levels
      ["bold", "italic", "underline", "strike"], // Text formatting
      ["blockquote", "code-block"], // Blocks
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      [{ script: "sub" }, { script: "super" }], // Scripts
      [{ indent: "-1" }, { indent: "+1" }], // Indent
      [{ direction: "rtl" }], // Text direction
      [{ color: [] }, { background: [] }], // Colors
      [{ font: [] }], // Fonts
      [{ align: [] }], // Alignment
      ["link", "image", "video"], // Media
      ["clean"], // Remove formatting
    ];

    // Initialize Quill
    const quill = new Quill(quillRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder,
    });

    // Set initial content
    if (value) {
      quill.root.innerHTML = value;
    }

    // Handle text changes
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChange(html);
    });

    quillInstance.current = quill;
    setIsReady(true);

    return () => {
      if (quillInstance.current) {
        quillInstance.current.off("text-change");
        quillInstance.current = null;
      }
    };
  }, []);

  // Update content when value changes externally
  useEffect(() => {
    if (quillInstance.current && isReady) {
      const currentHtml = quillInstance.current.root.innerHTML;
      if (currentHtml !== value) {
        quillInstance.current.root.innerHTML = value;
      }
    }
  }, [value, isReady]);

  return (
    <div className={`quill-editor ${className}`}>
      <div
        ref={quillRef}
        style={{ height }}
        className="bg-white dark:bg-gray-700"
      />
      <style jsx global>{`
        .quill-editor .ql-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: none;
          border-radius: 0.5rem 0.5rem 0 0;
          background: white;
        }

        .dark .quill-editor .ql-toolbar {
          border-color: #4b5563;
          background: #374151;
        }

        .quill-editor .ql-container {
          border-top: none;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0 0 0.5rem 0.5rem;
          font-size: 16px;
        }

        .dark .quill-editor .ql-container {
          border-color: #4b5563;
          background: #374151;
          color: white;
        }

        .quill-editor .ql-editor {
          min-height: 150px;
        }

        .dark .quill-editor .ql-editor {
          color: white;
        }

        .dark .quill-editor .ql-stroke {
          stroke: #9ca3af !important;
        }

        .dark .quill-editor .ql-fill {
          fill: #9ca3af !important;
        }

        .dark .quill-editor .ql-picker {
          color: #9ca3af !important;
        }

        .dark .quill-editor .ql-picker-label {
          color: #9ca3af !important;
        }

        .dark .quill-editor .ql-picker-options {
          background: #374151;
          border-color: #4b5563;
        }

        .dark .quill-editor .ql-picker-item {
          color: #9ca3af;
        }

        .dark .quill-editor .ql-picker-item:hover {
          color: white;
        }

        .dark .quill-editor .ql-tooltip {
          background: #374151;
          border-color: #4b5563;
          color: white;
        }

        /* Hide duplicate toolbar if it appears */
        .quill-editor .ql-toolbar + .ql-toolbar {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
