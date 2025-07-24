import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";
import { toast } from "react-toastify";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import PreviewIframe from "../components/PreviewIframe";
import { FaSave, FaPaperPlane } from "react-icons/fa";
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
  const saveTimeout = useRef(null);

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
      await axios.patch(`/api/sessions/${id}`, {
        title,
        code,
        messages,
      });
      toast.success("Session saved!");
    } catch (err) {
      console.log("Error saving session:", err);
      toast.error("Save failed");
    }
  };

  const debouncedSave = useCallback(() => {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      axios.patch(`/api/sessions/${id}`, {
        title,
        code,
        messages,
      });
    }, 1000);
  }, [code, messages, title, id]);

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
      } else {
        toast.error("AI response invalid");
      }
    } catch (err) {
      console.error("Error generating component:", err);
      toast.error("AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row bg-gray-900 text-white overflow-hidden">
      {/* Left Pane */}
      <div className="lg:w-1/2 h-1/2 lg:h-full flex flex-col p-4 space-y-4">
        <div className="flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedSave();
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
              debouncedSave();
            }}
          />
        </div>

        <div>
          <h2 className="text-sm mt-2 mb-1 text-gray-400">CSS Code (optional)</h2>
          <textarea
            rows={4}
            className="w-full bg-gray-800 p-2 rounded text-sm focus:outline-none focus:ring focus:ring-blue-400"
            value={code.css}
            onChange={(e) => {
              setCode((prev) => ({ ...prev, css: e.target.value }));
              debouncedSave();
            }}
          ></textarea>
        </div>
      </div>

      {/* Right Pane */}
      <div className="lg:w-1/2 h-1/2 lg:h-full bg-gray-950 p-4 flex flex-col">
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
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
          >
            <FaPaperPlane />
            {loading ? "Generating..." : "Submit to AI"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
