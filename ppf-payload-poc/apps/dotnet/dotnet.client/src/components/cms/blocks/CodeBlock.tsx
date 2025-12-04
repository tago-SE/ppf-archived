//import { Highlight, themes } from "prism-react-renderer";
import type { CodeBlock as CodeBlockProps } from "@ppf/payload-renderer/payload-types";
import { cn } from "../../../utils/cn";
import { useEventCallback } from "usehooks-ts";
import { lazy, Suspense, useEffect, useState } from "react";
import type { PrismTheme } from "prism-react-renderer";

const Highlight = lazy(() =>
  import("prism-react-renderer").then((mod) => ({ default: mod.Highlight }))
);

function Loading() {
  return (
    <pre className="p-4 mockup-code text-base-300 text-xs overflow-x-auto">
      <div className="loading loading-sm">Loading...</div>
    </pre>
  );
}

export const CodeBlock: React.FC<CodeBlockProps & { className?: string }> = ({
  className,
  code,
  language = "",
}) => {
  const [theme, setTheme] = useState<PrismTheme>();
  const handleCopy = useEventCallback(() => {
    navigator.clipboard.writeText(code);
  });

  useEffect(() => {
    // loads prism-react-renderer dynamically only when code-block is used, this saves bundle size
    import("prism-react-renderer").then((mod) => {
      setTheme(mod.themes.vsLight); // Change to another theme if needed
    });
  }, []);

  if (!code) return null;

  if (!theme) return <Loading />;

  return (
    <div className={cn(className, "not-prose group relative")}>
      <Suspense fallback={<Loading />}>
        <Highlight code={code} language={language!} theme={theme}>
          {({ getLineProps, getTokenProps, tokens }) => (
            <pre className="p-4 mockup-code text-base-300 text-xs overflow-x-auto">
              {tokens.map((line, i) => (
                <div
                  key={i}
                  {...getLineProps({ className: "table-row", line })}
                >
                  <span className="table-cell select-none text-right text-black/25">
                    {i + 1}
                  </span>
                  <span className="table-cell pl-4">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </Suspense>
      <button
        className="hidden group-hover:inline-block btn btn-sm top-1 right-1 absolute"
        onClick={handleCopy}
      >
        Copy
      </button>
    </div>
  );
};
