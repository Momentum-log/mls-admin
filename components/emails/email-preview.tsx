"use client";

import { useDeferredValue, useRef, useState } from "react";
import { renderMessagePreview } from "@/lib/email/message-layout";

/**
 * The message as the recipient will see it, inside the MLS header, sign-off
 * and footer. Sandboxed without scripts, so nothing in it runs and no link
 * opens; same-origin only so its height can be read to fit the frame.
 */
export function EmailPreview({
  subject,
  bodyHtml,
  preheader,
}: {
  subject: string;
  bodyHtml: string;
  preheader?: string;
}) {
  // Typing stays responsive; the preview catches up a moment later.
  const deferredBody = useDeferredValue(bodyHtml);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  return (
    <iframe
      ref={frameRef}
      title="Email preview"
      sandbox="allow-same-origin"
      className="w-full rounded-md border bg-[#eef2f7]"
      style={{ height }}
      onLoad={() => {
        const doc = frameRef.current?.contentDocument;
        if (doc) setHeight(doc.documentElement.scrollHeight);
      }}
      srcDoc={renderMessagePreview({
        subject: subject || "(no subject)",
        bodyHtml: deferredBody,
        preheader,
      })}
    />
  );
}
