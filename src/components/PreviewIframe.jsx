import React, { useEffect, useRef } from "react";

const PreviewIframe = ({ jsxCode, cssCode }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const match = jsxCode.match(/export\s+default\s+(\w+);?/);
    const componentName = match?.[1];
    if (!componentName) return;

    const cleanedCode = jsxCode
      .replace(/import[^;]*;/g, "") // Remove imports
      .replace(/export\s+default\s+\w+;?/, ""); // Remove export default

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>${cssCode || ""}</style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${cleanedCode}

            // Render the component
            ReactDOM.render(<${componentName} />, document.getElementById('root'));
          </script>
        </body>
      </html>
    `;

    const iframeDoc = iframeRef.current.contentDocument;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  }, [jsxCode, cssCode]);

  return <iframe ref={iframeRef} className="w-full h-full border-none" />;
};

export default PreviewIframe;
