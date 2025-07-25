// Also applied autosave logic of code otherwise code is same
// kyuki jo useCallback se jo maine debounce kiya tha wo adha code save kar raha tha
// isliye maine useEffect ko use kiya aur usme dependency daal di taki koi bhi change ho to
// auto save logic run ho jaye


import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";
import { toast } from "react-toastify";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import PreviewIframe from "../components/PreviewIframe";
import { FaSave, FaPaperPlane, FaSpinner } from "react-icons/fa";
import {
  MdCheck,
  MdContentCopy,
  MdDownload,
  MdDownloading,
} from "react-icons/md";

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Untitled Session");
  const [code, setCode] = useState({ jsx: "", css: "" });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [activeThinking, setActiveThinking] = useState("");

  const saveTimeout = useRef(null);
  const [saveStatus, setSaveStatus] = useState("Saved ✅");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`/api/sessions/${id}`);
        if (res.data.success) {
          setTitle(res.data.session.title);
          setCode(res.data.session.code);
          setMessages(res.data.session.messages || []);
        }
      } catch (err) {
        if (err?.response?.status === 404) {
          toast.error("Session not found");
          navigate("/");
        } else {
          toast.error("Failed to load session");
        }
      }
    };
    fetchSession();
  }, [id, navigate]);

  const handleSave = async () => {
    try {
      setSaveStatus("Saving...");
      await axios.patch(`/api/sessions/${id}`, {
        title,
        code,
        messages,
      });
      setSaveStatus("Saved ✅");
    } catch (err) {
      console.error("Error saving session:", err);
      toast.error("Save failed");
      setSaveStatus("Save failed ❌");
    }
  };


  // auto save logic
  useEffect(() => {
    if (!id) return;

    setSaveStatus("Saving...");
    clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(async () => {
      try {
        await axios.patch(`/api/sessions/${id}`, {
          title,
          code,
          messages,
        });
        setSaveStatus("Saved ✅");
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("Save failed ❌");
      }
    }, 1200);
  }, [code, title, messages, id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.jsx);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    setDownloading(true);
    const blob = new Blob([code.jsx], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${title || "Component"}.jsx`;
    link.href = url;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.info("Download started");
    setTimeout(() => setDownloading(false), 1500);
  };

  const handleSubmit = async () => {
    setActiveThinking("generate");
    setLoading(true);
    try {
      const res = await axios.post(`/api/ai/generate`, { message: input });
      if (res.data.success) {
        const firstComponent = res.data.components?.[0];
        if (!firstComponent) return toast.error("No component received");

        setTitle(firstComponent.componentName || title);
        setCode((prev) => ({ ...prev, jsx: firstComponent.code }));

        const updatedMessages = [
          ...messages,
          { role: "user", content: input },
          { role: "assistant", content: firstComponent.code },
        ];
        setMessages(updatedMessages);

        await axios.patch(`/api/sessions/${id}`, {
          title: firstComponent.componentName || title,
          code: {
            jsx: firstComponent.code,
            css: code.css,
          },
          messages: updatedMessages,
        });

        toast.success("Component generated");
        setSaveStatus("Saved ✅");
      } else {
        toast.error("AI response invalid");
      }
    } catch (err) {
      console.error("Error generating component:", err);
      toast.error("AI generation failed");
    } finally {
      setLoading(false);
      setActiveThinking("");
    }
  };

  const handleRefine = async () => {
    if (!refineInput.trim()) return toast.warn("Enter instruction to refine");
    setActiveThinking("refine");
    setLoading(true);
    try {
      const res = await axios.post(`/api/ai/refine`, {
        code: code.jsx,
        instruction: refineInput,
      });

      if (res.data.success) {
        const refined = res.data.components?.[0];
        if (!refined) return toast.error("No refined component received");

        setCode((prev) => ({ ...prev, jsx: refined.code }));
        setMessages((prev) => [
          ...prev,
          { role: "user", content: refineInput },
          { role: "assistant", content: refined.code },
        ]);
        setRefineInput("");

        await axios.patch(`/api/sessions/${id}`, {
          title,
          code: {
            jsx: refined.code,
            css: code.css,
          },
          messages: [
            ...messages,
            { role: "user", content: refineInput },
            { role: "assistant", content: refined.code },
          ],
        });

        toast.success("Component refined");
        setSaveStatus("Saved ✅");
      } else {
        toast.error("Refine failed");
      }
    } catch (err) {
      console.error("Refine error:", err);
      toast.error("AI refine failed");
    } finally {
      setLoading(false);
      setActiveThinking("");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-col lg:flex-row bg-gray-900 text-white overflow-hidden">
      {/* Left Pane */}
      <div className="w-full lg:w-1/2 h-full flex flex-col p-4 space-y-4 overflow-auto">
        <div className="flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            className="bg-gray-800 px-4 py-2 rounded w-full text-lg font-semibold focus:outline-none focus:ring focus:ring-blue-400"
          />
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 p-3 rounded-full"
          >
            <FaSave />
          </button>
        </div>

        {/* Save Status Badge */}
        <div className="text-sm text-gray-300 font-medium mb-1">
          {saveStatus}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm text-gray-400">JSX Code</h2>
            <div className="space-x-2 flex items-center">
              <button
                onClick={handleCopy}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs flex items-center gap-1"
              >
                {copied ? (
                  <MdCheck className="text-green-400" />
                ) : (
                  <MdContentCopy />
                )}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                onClick={handleDownload}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs flex items-center gap-1"
              >
                {downloading ? (
                  <MdDownloading className="animate-pulse" />
                ) : (
                  <MdDownload />
                )}
                {downloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>

          <CodeMirror
            value={code.jsx}
            height="300px"
            theme="dark"
            extensions={[javascript({ jsx: true })]}
            onChange={(value) => {
              setCode((prev) => ({ ...prev, jsx: value }));
            }}
          />
        </div>

        <div>
          <h2 className="text-sm mt-2 mb-1 text-gray-400">
            CSS Code (optional)
          </h2>
          <textarea
            rows={4}
            className="w-full bg-gray-800 p-2 rounded text-sm focus:outline-none focus:ring focus:ring-blue-400"
            value={code.css}
            onChange={(e) => {
              setCode((prev) => ({ ...prev, css: e.target.value }));
            }}
          ></textarea>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 h-full bg-gray-950 p-4 flex flex-col overflow-auto">
        <h2 className="text-lg font-semibold mb-2">Live Preview</h2>
        <div className="flex-grow border border-gray-700 rounded bg-white overflow-auto">
          <PreviewIframe jsxCode={code.jsx} cssCode={code.css} />
        </div>

        <div className="mt-4">
          <textarea
            placeholder="Enter a prompt to generate component"
            rows={2}
            className="w-full p-3 rounded bg-gray-800 text-sm focus:outline-none focus:ring focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="mt-4">
            <textarea
              disabled={messages.length === 0}
              placeholder="Enter refine instruction like 'Add hover effect'"
              rows={2}
              className="w-full p-3 rounded bg-gray-800 text-sm focus:outline-none focus:ring focus:ring-yellow-500 disabled:opacity-50"
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
            />
            <button
              onClick={handleRefine}
              disabled={loading || messages.length === 0}
              className="mt-2 flex items-center justify-center gap-2 w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded text-white disabled:opacity-50"
            >
              <FaPaperPlane />
              {activeThinking === "refine" ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Thinking...
                </>
              ) : (
                "Refine with AI"
              )}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white disabled:opacity-50"
          >
            <FaPaperPlane />
            {activeThinking === "generate" ? (
              <>
                <FaSpinner className="animate-spin" />
                Thinking...
              </>
            ) : (
              "Submit to AI"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;


























































// code ye bhi ek dam perfect hai but issue ye tha 
// isme auto save logic partially kaam kar raha tha
// kyuki jo useCallback se jo maine debounce kiya tha wo adha code save kar raha tha
// isliye maine useEffect ko use kiya aur usme dependency daal di taki koi bhi change ho to
// auto save logic run ho jaye

// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "../axios";
// import { toast } from "react-toastify";
// import CodeMirror from "@uiw/react-codemirror";
// import { javascript } from "@codemirror/lang-javascript";
// import PreviewIframe from "../components/PreviewIframe";
// import { FaSave, FaPaperPlane, FaSpinner } from "react-icons/fa";
// import {
//   MdCheck,
//   MdContentCopy,
//   MdDownload,
//   MdDownloading,
// } from "react-icons/md";

// const EditorPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [title, setTitle] = useState("Untitled Session");
//   const [code, setCode] = useState({ jsx: "", css: "" });
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [copied, setCopied] = useState(false);
//   const [downloading, setDownloading] = useState(false);
//   const saveTimeout = useRef(null);

//   // Refine karne ke liye
//   const [refineInput, setRefineInput] = useState("");

//   // Thinking text ho jaye uske liye
//   const [activeThinking, setActiveThinking] = useState("");

//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const res = await axios.get(`/api/sessions/${id}`);
//         if (res.data.success) {
//           setTitle(res.data.session.title);
//           setCode(res.data.session.code);
//           setMessages(res.data.session.messages || []);
//         }
//       } catch (err) {
//         if (err?.response?.status === 404) {
//           toast.error("Session not found");
//           navigate("/");
//         } else {
//           toast.error("Failed to load session");
//         }
//       }
//     };
//     fetchSession();
//   }, [id, navigate]);

//   const handleSave = async () => {
//     try {
//       await axios.patch(`/api/sessions/${id}`, {
//         title,
//         code,
//         messages,
//       });
//       toast.success("Session saved!");
//     } catch (err) {
//       console.log("Error saving session:", err);
//       toast.error("Save failed");
//     }
//   };

//   // code editor me kuch bhi change hua to uske auto save ke liye
//   const debouncedSave = useCallback(() => {
//     clearTimeout(saveTimeout.current);
//     saveTimeout.current = setTimeout(() => {
//       axios.patch(`/api/sessions/${id}`, {
//         title,
//         code,
//         messages,
//       });
//     }, 1000);
//   }, [code, messages, title, id]);

//   const handleCopy = () => {
//     navigator.clipboard.writeText(code.jsx);
//     setCopied(true);
//     toast.success("Code copied to clipboard!");
//     setTimeout(() => setCopied(false), 3000);
//   };

//   const handleDownload = () => {
//     setDownloading(true);
//     const blob = new Blob([code.jsx], { type: "text/plain;charset=utf-8" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.download = `${title || "Component"}.jsx`;
//     link.href = url;
//     link.click();
//     window.URL.revokeObjectURL(url);
//     toast.info("Download started");
//     setTimeout(() => setDownloading(false), 1500);
//   };

//   const handleSubmit = async () => {
//     setActiveThinking("generate");
//     setLoading(true);
//     try {
//       const res = await axios.post(`/api/ai/generate`, { message: input });
//       if (res.data.success) {
//         const firstComponent = res.data.components?.[0];
//         if (!firstComponent) return toast.error("No component received");

//         setTitle(firstComponent.componentName || title);
//         setCode((prev) => ({ ...prev, jsx: firstComponent.code }));

//         const updatedMessages = [
//           ...messages,
//           { role: "user", content: input },
//           { role: "assistant", content: firstComponent.code },
//         ];
//         setMessages(updatedMessages);

//         await axios.patch(`/api/sessions/${id}`, {
//           title: firstComponent.componentName || title,
//           code: {
//             jsx: firstComponent.code,
//             css: code.css,
//           },
//           messages: updatedMessages,
//         });

//         toast.success("Component generated");
//       } else {
//         toast.error("AI response invalid");
//       }
//     } catch (err) {
//       console.error("Error generating component:", err);
//       toast.error("AI generation failed");
//     } finally {
//       setLoading(false);
//       setActiveThinking("");
//     }
//   };

//   // Refine karne ka logic
//   const handleRefine = async () => {
//     if (!refineInput.trim()) return toast.warn("Enter instruction to refine");
//     setActiveThinking("refine");
//     setLoading(true);
//     try {
//       const res = await axios.post(`/api/ai/refine`, {
//         code: code.jsx,
//         instruction: refineInput,
//       });

//       if (res.data.success) {
//         const refined = res.data.components?.[0];
//         if (!refined) return toast.error("No refined component received");

//         setCode((prev) => ({ ...prev, jsx: refined.code }));
//         setMessages((prev) => [
//           ...prev,
//           { role: "user", content: refineInput },
//           { role: "assistant", content: refined.code },
//         ]);
//         setRefineInput("");

//         // Auto-save on refine
//         await axios.patch(`/api/sessions/${id}`, {
//           title,
//           code: {
//             jsx: refined.code,
//             css: code.css,
//           },
//           messages: [
//             ...messages,
//             { role: "user", content: refineInput },
//             { role: "assistant", content: refined.code },
//           ],
//         });

//         toast.success("Component refined");
//       } else {
//         toast.error("Refine failed");
//       }
//     } catch (err) {
//       console.error("Refine error:", err);
//       toast.error("AI refine failed");
//     } finally {
//       setLoading(false);
//       setActiveThinking("");
//     }
//   };

//   return (
//     <div className="w-full h-screen flex flex-col lg:flex-row bg-gray-900 text-white overflow-hidden">
//       {/* Left Pane */}
//       <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col p-4 space-y-4">
//         <div className="flex items-center gap-3">
//           <input
//             value={title}
//             onChange={(e) => {
//               setTitle(e.target.value);
//               debouncedSave();
//             }}
//             className="bg-gray-800 px-4 py-2 rounded w-full text-lg font-semibold focus:outline-none focus:ring focus:ring-blue-400"
//           />
//           <button
//             onClick={handleSave}
//             className="bg-green-600 hover:bg-green-700 p-3 rounded-full"
//           >
//             <FaSave />
//           </button>
//         </div>

//         <div>
//           <div className="flex items-center justify-between mb-1">
//             <h2 className="text-sm text-gray-400">JSX Code</h2>
//             <div className="space-x-2 flex items-center">
//               <button
//                 onClick={handleCopy}
//                 className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs flex items-center gap-1"
//               >
//                 {copied ? (
//                   <MdCheck className="text-green-400" />
//                 ) : (
//                   <MdContentCopy />
//                 )}
//                 {copied ? "Copied" : "Copy"}
//               </button>

//               <button
//                 onClick={handleDownload}
//                 className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs flex items-center gap-1"
//               >
//                 {downloading ? (
//                   <MdDownloading className="animate-pulse" />
//                 ) : (
//                   <MdDownload />
//                 )}
//                 {downloading ? "Downloading..." : "Download"}
//               </button>
//             </div>
//           </div>
//           <CodeMirror
//             value={code.jsx}
//             height="300px"
//             theme="dark"
//             extensions={[javascript({ jsx: true })]}
//             onChange={(value) => {
//               setCode((prev) => ({ ...prev, jsx: value }));
//               debouncedSave();
//             }}
//           />
//         </div>

//         <div>
//           <h2 className="text-sm mt-2 mb-1 text-gray-400">
//             CSS Code (optional)
//           </h2>
//           <textarea
//             rows={4}
//             className="w-full bg-gray-800 p-2 rounded text-sm focus:outline-none focus:ring focus:ring-blue-400"
//             value={code.css}
//             onChange={(e) => {
//               setCode((prev) => ({ ...prev, css: e.target.value }));
//               debouncedSave();
//             }}
//           ></textarea>
//         </div>
//       </div>

//       {/* Right Pane */}
//       <div className="lg:w-1/2 h-1/2 lg:h-full bg-gray-950 p-4 flex flex-col">
//         <h2 className="text-lg font-semibold mb-2">Live Preview</h2>
//         <div className="flex-grow border border-gray-700 rounded bg-white overflow-auto">
//           <PreviewIframe jsxCode={code.jsx} cssCode={code.css} />
//         </div>

//         <div className="mt-4">
//           <textarea
//             placeholder="Enter a prompt to generate component"
//             rows={2}
//             className="w-full p-3 rounded bg-gray-800 text-sm focus:outline-none focus:ring focus:ring-blue-500"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//           />

//           {/* Refine Component  */}
//           <div className="mt-4">
//             <textarea
//               disabled={messages.length === 0}
//               placeholder="Enter refine instruction like 'Add hover effect'"
//               rows={2}
//               className="w-full p-3 rounded bg-gray-800 text-sm focus:outline-none focus:ring focus:ring-yellow-500 disabled:opacity-50"
//               value={refineInput}
//               onChange={(e) => setRefineInput(e.target.value)}
//             />

//             {/* Refine with AI button */}
//             <button
//               onClick={handleRefine}
//               disabled={loading || messages.length === 0}
//               className="mt-2 flex items-center justify-center gap-2 w-full bg-yellow-600 hover:bg-yellow-700 p-2 rounded text-white disabled:opacity-50"
//             >
//               <FaPaperPlane />
//               {activeThinking === "refine" ? (
//                 <>
//                   <FaSpinner className="animate-spin" />
//                   Thinking...
//                 </>
//               ) : (
//                 "Refine with AI"
//               )}
//             </button>
//           </div>

//           {/* Sunmit to AI button */}
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white disabled:opacity-50"
//           >
//             <FaPaperPlane />
//             {activeThinking === "generate" ? (
//               <>
//                 <FaSpinner className="animate-spin" />
//                 Thinking...
//               </>
//             ) : (
//               "Submit to AI"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditorPage;