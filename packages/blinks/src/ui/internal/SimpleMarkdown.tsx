import Markdown, { RuleType, sanitizer } from 'markdown-to-jsx';
import { type PropsWithChildren, type ReactNode, useId } from 'react';
import { confirmLinkTransition } from './utils.ts';

interface Props {
  text: string;
}

const LinkWithConfirm = ({
  href,
  title,
  children,
}: PropsWithChildren<{ href: string; title?: string }>) => {
  return (
    <a
      href={href}
      className="text-text-link hover:text-text-link-hover underline transition-colors motion-reduce:transition-none"
      target="_blank"
      title={title}
      onClick={(e) => {
        if (!confirmLinkTransition(href)) {
          e.preventDefault();
        }
      }}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export const SimpleMarkdown = ({ text }: Props) => {
  const id = useId();

  return (
    <Markdown
      options={{
        disableParsingRawHTML: true,
        slugify: (str) => `${str}-${id}`,
        // @ts-expect-error - return type ReactChild is deprecated, assuming ReactNode
        renderRule(next, node, renderChildren, state): ReactNode {
          switch (node.type) {
            case RuleType.image:
              return null;
            case RuleType.gfmTask:
              return (
                <span className="mb-0.5 inline-block">
                  {/* ✅ and ⬜ */}
                  {node.completed ? '\u2705' : '\u2B1C'}
                </span>
              );
            case RuleType.link:
              /* eslint-disable-next-line no-case-declarations */
              const sanitizedHref = sanitizer(node.target);
              if (sanitizedHref) {
                return (
                  <LinkWithConfirm
                    href={sanitizedHref}
                    key={state.key}
                    title={node.title}
                  >
                    {renderChildren(node.children, state)}
                  </LinkWithConfirm>
                );
              }

              return (
                <span key={state.key}>
                  {renderChildren(node.children, state)}
                </span>
              );
            case RuleType.heading:
              return (
                <h5
                  key={state.key}
                  className="first::mt-0 mb-1 mt-1.5 font-bold"
                >
                  {renderChildren(node.children, state)}
                </h5>
              );
            case RuleType.paragraph:
              return (
                <p key={state.key} className="mb-0.5">
                  {renderChildren(node.children, state)}
                </p>
              );
            default:
              return next();
          }
        },
      }}
    >
      {text}
    </Markdown>
  );
};
