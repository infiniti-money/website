"use client";
import { useEffect } from "react";
export default function ZaloWidget({ oaId }: { oaId: string }) {
  useEffect(() => {
    if (!oaId) return;
    const script = document.createElement("script");
    script.src = "https://sp.zalo.me/plugins/sdk.js";
    script.async = true;
    script.id = "zalo-sdk";
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [oaId]);
  return oaId ? (
    <div
      className="zalo-chat-widget"
      data-oaid={oaId}
      data-welcome-message="Infiniti Seller có thể hỗ trợ gì cho bạn?"
      data-autopopup="0"
      data-width="300"
      data-height="420"
    />
  ) : null;
}
