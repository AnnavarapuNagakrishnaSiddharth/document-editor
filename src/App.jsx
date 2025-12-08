// // Comment here and add new code below
// import React, { useState, useRef } from "react";
// import axios from "axios";
// import DOMPurify from "dompurify";
// import JoditEditor from "jodit-react";          // ✅ NEW

//        import "jodit/es2021/jodit.min.css";
//    // ✅ Jodit styles

// const API_BASE = "http://localhost:4000";

// export default function App() {
//   const [rawHtml, setRawHtml] = useState("");
//   const editorRef = useRef(null);               // ✅ renamed for clarity
//   const [content, setContent] = useState("");   // ✅ editor HTML state

//   const [sections, setSections] = useState([]); // {id, displayTitle, level, matchText}
//   const [selectedId, setSelectedId] = useState(null);
//   const [hasContent, setHasContent] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   // Analyze heading heuristics (same as before)
//   function analyzeHeadingNode(node) {
//     const tag = node.tagName?.toUpperCase?.();
//     const text = node.textContent.trim();
//     if (!text) return null;

//     if (tag && tag.match(/^H[1-6]$/)) {
//       const level = parseInt(tag.substring(1), 10) || 1;
//       return { level, displayTitle: text, matchText: text };
//     }

//     const numeric = text.match(/^(\d+(\.\d+)*)\s+(.*)$/);
//     if (numeric) {
//       const numbering = numeric[1];
//       const title = numeric[3];
//       const level = numbering.split(".").length;
//       return {
//         level,
//         displayTitle: `${numbering} ${title}`,
//         matchText: text,
//       };
//     }

//     return null;
//   }

//   function buildSectionsFromHtml(html) {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(html, "text/html");
//     const body = doc.body;
//     const sections = [];
//     let index = 0;
//     const candidates = body.querySelectorAll("h1,h2,h3,h4,h5,h6,p");
//     candidates.forEach((node) => {
//       const info = analyzeHeadingNode(node);
//       if (!info) return;
//       sections.push({ id: `sec-${index++}`, ...info });
//     });
//     if (!sections.length) {
//       sections.push({
//         id: "sec-0",
//         level: 1,
//         displayTitle: "Document",
//         matchText: "",
//       });
//     }
//     return sections;
//   }

//   const handleFileChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setUploading(true);

//     const fd = new FormData();
//     fd.append("file", file);

//     try {
//       const res = await axios.post(`${API_BASE}/api/upload`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//         timeout: 5 * 60 * 1000,
//       });

//       let { html } = res.data;

//       // ✅ Allow tables & important tags
//       const cleanHtml = DOMPurify.sanitize(html, {
//         ALLOWED_TAGS: [
//           "p",
//           "br",
//           "strong",
//           "em",
//           "u",
//           "h1",
//           "h2",
//           "h3",
//           "h4",
//           "h5",
//           "h6",
//           "ol",
//           "ul",
//           "li",
//           "blockquote",
//           "a",
//           "img",
//           "table",
//           "thead",
//           "tbody",
//           "tr",
//           "td",
//           "th",
//           "colgroup",
//           "col",
//           "span",
//           "div",
//         ],
//         ALLOWED_ATTR: [
//           "href",
//           "src",
//           "alt",
//           "title",
//           "style",
//           "class",
//           "colspan",
//           "rowspan",
//           "width",
//           "height",
//         ],
//         ALLOW_DATA_ATTR: false,
//       });

//       // ✅ Load HTML into Jodit editor via state
//       setContent(cleanHtml);
//       setHasContent(true);

//       const built = buildSectionsFromHtml(cleanHtml);
//       setSections(built);
//       setSelectedId(built[0]?.id || null);
//     } catch (err) {
//       console.error(err);
//       alert(
//         err?.response?.data?.error ||
//           "Failed to process file. Try converting the PDF to DOCX manually if needed."
//       );
//     } finally {
//       setUploading(false);
//       e.target.value = "";
//     }
//   };

//   const scrollToSection = (section) => {
//     setSelectedId(section.id);
//     // 👇 Look inside Jodit editable area
//     const root = document.querySelector(".jodit-wysiwyg");
//     if (!root) return;

//     const nodes = root.querySelectorAll("p,h1,h2,h3,h4,h5,h6");
//     const matchText = section.matchText?.trim();
//     let target = null;

//     if (matchText) {
//       target = Array.from(nodes).find((el) =>
//         el.textContent.trim().startsWith(matchText)
//       );
//     }
//     if (!target) {
//       target = Array.from(nodes).find((el) =>
//         el.textContent.trim().includes(section.displayTitle)
//       );
//     }
//     if (target) {
//       target.scrollIntoView({ behavior: "smooth", block: "start" });
//     }
//   };

//   const handleExportJson = async () => {
//     if (!hasContent) return;
//     const fullHtml = content; // ✅ use state

//     const payload = {
//       sections: [
//         {
//           title: "Document",
//           html: DOMPurify.sanitize(fullHtml, { ADD_ATTR: ["style"] }),
//         },
//       ],
//     };

//     const res = await axios.post(`${API_BASE}/api/export-json`, payload, {
//       responseType: "blob",
//     });
//     const blob = new Blob([res.data], { type: "application/json" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "sections.json";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // const exportPdfServer = async () => {
//   //   if (!hasContent) {
//   //     alert("No document loaded");
//   //     return;
//   //   }
//   //   const fullHtml = content; // ✅ use state

//   //   try {
//   //     const res = await axios.post(
//   //       `${API_BASE}/api/export-pdf`,
//   //       { html: fullHtml, title: "exported_document" },
//   //       { responseType: "blob", timeout: 120000 }
//   //     );
//   //     const blob = new Blob([res.data], { type: "application/pdf" });
//   //     const url = window.URL.createObjectURL(blob);
//   //     const a = document.createElement("a");
//   //     a.href = url;
//   //     a.download = "exported_document.pdf";
//   //     a.click();
//   //     URL.revokeObjectURL(url);
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert("Server PDF export failed.");
//   //   }
//   // };


// //   const exportPdfServer = async () => {
// //   if (!hasContent) {
// //     alert("No document loaded");
// //     return;
// //   }

// //   try {
// //     const res = await axios.post(
// //       `${API_BASE}/api/export-pdf`,
// //       {
// //         html: content,             // ✅ Jodit HTML
// //         title: "exported_document"
// //       },
// //       {
// //         responseType: "blob",
// //         timeout: 120000
// //       }
// //     );

// //     const blob = new Blob([res.data], { type: "application/pdf" });
// //     const url = window.URL.createObjectURL(blob);
// //     const a = document.createElement("a");
// //     a.href = url;
// //     a.download = "exported_document.pdf";
// //     a.click();
// //     window.URL.revokeObjectURL(url);
// //   } catch (err) {
// //     console.error(err);
// //     alert("Server PDF export failed.");
// //   }
// // };


//     const exportPdfServer = async () => {
//   if (!hasContent) {
//     alert("No document loaded");
//     return;
//   }

//   // 👇 Wrap editor content with fixed layout for PDF
//   const htmlForPdf = `
// <!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="utf-8" />
//     <style>
//       /* Page size & margins – tweak these to match original PDF */
//       @page {
//         size: A4;
//         margin: 1in;
//       }

//       body {
//         font-family: "Times New Roman", serif; /* or whatever original PDF used */
//         font-size: 11pt;                        /* adjust to match */
//         line-height: 1.15;
//         max-width: 6.5in;                       /* controls line length */
//         margin: 0 auto;
//       }

//       p {
//         margin: 0 0 0.5em 0;
//       }

//       table {
//         border-collapse: collapse;
//         width: 100%;           /* keep full width */
//       }

//       th, td {
//         padding: 2px 4px;
//         vertical-align: top;
//       }

//       img {
//         max-width: 100%;
//         height: auto;
//       }
//     </style>
//   </head>
//   <body>
//     ${content}
//   </body>
// </html>
// `;

//   try {
//     const res = await axios.post(
//       `${API_BASE}/api/export-pdf`,
//       {
//         html: htmlForPdf,          // 🔥 send full HTML with CSS
//         title: "exported_document"
//       },
//       {
//         responseType: "blob",
//         timeout: 120000,
//       }
//     );

//     const blob = new Blob([res.data], { type: "application/pdf" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "exported_document.pdf";
//     a.click();
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     console.error(err);
//     alert("Server PDF export failed.");
//   }
// };

//   // ✅ Jodit config – includes table button
//   const editorConfig = {
//     readonly: false,
//     toolbarAdaptive: false,
//     height: "100%",
//     buttons: [
//       "source",
//       "|",
//       "bold",
//       "italic",
//       "underline",
//       "strikethrough",
//       "|",
//       "ul",
//       "ol",
//       "|",
//       "align",
//       "font",
//       "fontsize",
//       "|",
//       "table",      // 🔥 table support
//       "link",
//       "image",
//       "hr",
//       "|",
//       "undo",
//       "redo",
//       "fullsize",
//     ],
//   };

//   return (
//     <div
//       className="app-root"
//       style={{ height: "100vh", display: "flex", flexDirection: "column" }}
//     >
//       <header
//         className="app-header"
//         style={{
//           padding: 12,
//           borderBottom: "1px solid #ddd",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <h1 style={{ margin: 0 }}>Web Document Editor</h1>
//         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//           <input
//             type="file"
//             accept=".docx,.pdf"
//             onChange={handleFileChange}
//             disabled={uploading}
//           />
//           <button
//             className="export-btn"
//             onClick={handleExportJson}
//             disabled={!hasContent}
//           >
//             Export JSON
//           </button>
//           <button
//             className="export-btn"
//             onClick={exportPdfServer}
//             disabled={!hasContent}
//           >
//             Export PDF
//           </button>
//         </div>
//       </header>

//       <div
//         className="app-main"
//         style={{ display: "flex", flex: 1, minHeight: 0 }}
//       >
//         <aside
//           className="sidebar"
//           style={{
//             width: 320,
//             borderRight: "1px solid #ddd",
//             padding: 12,
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           <h2 style={{ marginTop: 0 }}>Sections</h2>
//           <ul
//             style={{
//               listStyle: "none",
//               padding: 0,
//               margin: "8px 0",
//               overflowY: "auto",
//               flex: 1,
//             }}
//           >
//             {sections.map((s) => (
//               <li
//                 key={s.id}
//                 className={s.id === selectedId ? "section-item active" : "section-item"}
//                 style={{
//                   padding: "6px 8px",
//                   borderRadius: 6,
//                   cursor: "pointer",
//                   marginBottom: 4,
//                   background: s.id === selectedId ? "#eef4ff" : "transparent",
//                   borderLeft: s.id === selectedId ? "3px solid #007bff" : "none",
//                   paddingLeft: 8 + (s.level - 1) * 16,
//                 }}
//                 onClick={() => scrollToSection(s)}
//               >
//                 {s.displayTitle}
//               </li>
//             ))}
//           </ul>
//         </aside>

//         <section
//           className="editor-wrapper"
//           style={{
//             flex: 1,
//             padding: 12,
//             display: "flex",
//             flexDirection: "column",
//             minHeight: 0,
//           }}
//         >
//           <JoditEditor
//             ref={editorRef}
//             value={content}
//             config={editorConfig}
//             onChange={(newContent) => setContent(newContent)}
//           />
//         </section>
//       </div>
//     </div>
//   );
// }



import React, { useState, useRef } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import JoditEditor from "jodit-react";          // ✅ NEW

       import "jodit/es2021/jodit.min.css";
   // ✅ Jodit styles

const API_BASE = "http://localhost:4000";

export default function App() {
  const [rawHtml, setRawHtml] = useState("");
  const editorRef = useRef(null);               // ✅ renamed for clarity
  const [content, setContent] = useState("");   // ✅ editor HTML state

  const [sections, setSections] = useState([]); // {id, displayTitle, level, matchText}
  const [selectedId, setSelectedId] = useState(null);
  const [hasContent, setHasContent] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Analyze heading heuristics (same as before)
  function analyzeHeadingNode(node) {
    const tag = node.tagName?.toUpperCase?.();
    const text = node.textContent.trim();
    if (!text) return null;

    if (tag && tag.match(/^H[1-6]$/)) {
      const level = parseInt(tag.substring(1), 10) || 1;
      return { level, displayTitle: text, matchText: text };
    }

    const numeric = text.match(/^(\d+(\.\d+)*)\s+(.*)$/);
    if (numeric) {
      const numbering = numeric[1];
      const title = numeric[3];
      const level = numbering.split(".").length;
      return {
        level,
        displayTitle: `${numbering} ${title}`,
        matchText: text,
      };
    }

    return null;
  }

  function buildSectionsFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;
    const sections = [];
    let index = 0;
    const candidates = body.querySelectorAll("h1,h2,h3,h4,h5,h6,p");
    candidates.forEach((node) => {
      const info = analyzeHeadingNode(node);
      if (!info) return;
      sections.push({ id: `sec-${index++}`, ...info });
    });
    if (!sections.length) {
      sections.push({
        id: "sec-0",
        level: 1,
        displayTitle: "Document",
        matchText: "",
      });
    }
    return sections;
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 5 * 60 * 1000,
      });

      let { html } = res.data;

      // ✅ Allow tables & important tags
      const cleanHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "ol",
          "ul",
          "li",
          "blockquote",
          "a",
          "img",
          "table",
          "thead",
          "tbody",
          "tr",
          "td",
          "th",
          "colgroup",
          "col",
          "span",
          "div",
        ],
        ALLOWED_ATTR: [
          "href",
          "src",
          "alt",
          "title",
          "style",
          "class",
          "colspan",
          "rowspan",
          "width",
          "height",
        ],
        ALLOW_DATA_ATTR: false,
      });

      // ✅ Load HTML into Jodit editor via state
      setContent(cleanHtml);
      setHasContent(true);

      const built = buildSectionsFromHtml(cleanHtml);
      setSections(built);
      setSelectedId(built[0]?.id || null);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          "Failed to process file. Try converting the PDF to DOCX manually if needed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const scrollToSection = (section) => {
    setSelectedId(section.id);
    // 👇 Look inside Jodit editable area
    const root = document.querySelector(".jodit-wysiwyg");
    if (!root) return;

    const nodes = root.querySelectorAll("p,h1,h2,h3,h4,h5,h6");
    const matchText = section.matchText?.trim();
    let target = null;

    if (matchText) {
      target = Array.from(nodes).find((el) =>
        el.textContent.trim().startsWith(matchText)
      );
    }
    if (!target) {
      target = Array.from(nodes).find((el) =>
        el.textContent.trim().includes(section.displayTitle)
      );
    }
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleExportJson = async () => {
    if (!hasContent) return;
    const fullHtml = content; // ✅ use state

    const payload = {
      sections: [
        {
          title: "Document",
          html: DOMPurify.sanitize(fullHtml, { ADD_ATTR: ["style"] }),
        },
      ],
    };

    const res = await axios.post(`${API_BASE}/api/export-json`, payload, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sections.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // const exportPdfServer = async () => {
  //   if (!hasContent) {
  //     alert("No document loaded");
  //     return;
  //   }
  //   const fullHtml = content; // ✅ use state

  //   try {
  //     const res = await axios.post(
  //       `${API_BASE}/api/export-pdf`,
  //       { html: fullHtml, title: "exported_document" },
  //       { responseType: "blob", timeout: 120000 }
  //     );
  //     const blob = new Blob([res.data], { type: "application/pdf" });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "exported_document.pdf";
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Server PDF export failed.");
  //   }
  // };


  const exportPdfServer = async () => {
  if (!hasContent) {
    alert("No document loaded");
    return;
  }

  try {
    const res = await axios.post(
      `${API_BASE}/api/export-pdf`,
      {
        html: content,             // ✅ Jodit HTML
        title: "exported_document"
      },
      {
        responseType: "blob",
        timeout: 120000
      }
    );

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_document.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Server PDF export failed.");
  }
};

  // ✅ Jodit config – includes table button
  const editorConfig = {
    readonly: false,
    toolbarAdaptive: false,
    height: "100%",
    buttons: [
      "source",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "align",
      "font",
      "fontsize",
      "|",
      "table",      // 🔥 table support
      "link",
      "image",
      "hr",
      "|",
      "undo",
      "redo",
      "fullsize",
    ],
  };

  return (
    <div
      className="app-root"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header
        className="app-header"
        style={{
          padding: 12,
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Web Document Editor</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="file"
            accept=".docx,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button
            className="export-btn"
            onClick={handleExportJson}
            disabled={!hasContent}
          >
            Export JSON
          </button>
          <button
            className="export-btn"
            onClick={exportPdfServer}
            disabled={!hasContent}
          >
            Export PDF
          </button>
        </div>
      </header>

      <div
        className="app-main"
        style={{ display: "flex", flex: 1, minHeight: 0 }}
      >
        <aside
          className="sidebar"
          style={{
            width: 320,
            borderRight: "1px solid #ddd",
            padding: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Sections</h2>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "8px 0",
              overflowY: "auto",
              flex: 1,
            }}
          >
            {sections.map((s) => (
              <li
                key={s.id}
                className={s.id === selectedId ? "section-item active" : "section-item"}
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  marginBottom: 4,
                  background: s.id === selectedId ? "#eef4ff" : "transparent",
                  borderLeft: s.id === selectedId ? "3px solid #007bff" : "none",
                  paddingLeft: 8 + (s.level - 1) * 16,
                }}
                onClick={() => scrollToSection(s)}
              >
                {s.displayTitle}
              </li>
            ))}
          </ul>
        </aside>

        <section
          className="editor-wrapper"
          style={{
            flex: 1,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <JoditEditor
            ref={editorRef}
            value={content}
            config={editorConfig}
            onChange={(newContent) => setContent(newContent)}
          />
        </section>
      </div>
    </div>
  );
}