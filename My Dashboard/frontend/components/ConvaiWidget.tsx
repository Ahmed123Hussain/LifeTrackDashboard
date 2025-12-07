"use client";

import React, { useEffect, useRef } from 'react';

type Props = {
  agentId: string;
  className?: string;
};

export default function ConvaiWidget({ agentId, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scriptId = 'convai-widget-script';
    // Inject embed script once
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      s.async = true;
      s.type = 'text/javascript';
      document.body.appendChild(s);
    }

    // Create and attach the custom element
    const el = document.createElement('elevenlabs-convai');
    el.setAttribute('agent-id', agentId);
    if (containerRef.current) containerRef.current.appendChild(el);

    return () => {
      try {
        if (containerRef.current && el.parentElement === containerRef.current) {
          containerRef.current.removeChild(el);
        }
      } catch (e) {
        // ignore cleanup errors
      }
    };
  }, [agentId]);

  return <div ref={containerRef} className={className}></div>;
}
