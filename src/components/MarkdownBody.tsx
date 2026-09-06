import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents, transformUrl } from '../content/markdown';

export default function MarkdownBody({ body }: { body: string }) {
  return (
    <div className="markdown">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
        urlTransform={transformUrl}
      >
        {body}
      </Markdown>
    </div>
  );
}
