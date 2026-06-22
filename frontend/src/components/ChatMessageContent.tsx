import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessageContent({ content, isStreaming }: { content: string, isStreaming?: boolean }) {
    return (
        <div className="chat-markdown">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
          {isStreaming && <span className="chat-cursor" />}
        </div>
      );
}