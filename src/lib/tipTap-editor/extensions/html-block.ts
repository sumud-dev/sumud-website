import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    htmlBlock: {
      /**
       * Insert an HTML block
       */
      insertHtmlBlock: (html: string) => ReturnType;
    };
  }
}

/**
 * Custom TipTap extension to handle raw HTML blocks
 * This allows inserting template HTML that contains arbitrary styled divs
 */
export const HtmlBlock = Node.create({
  name: 'htmlBlock',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'div[data-html-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-html-block': '' }), 0];
  },

  addAttributes() {
    return {
      content: {
        default: null,
        parseHTML: (element) => element.innerHTML,
        renderHTML: (attributes) => {
          if (!attributes.content) {
            return {};
          }
          return {
            'data-content': attributes.content,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      insertHtmlBlock:
        (html: string) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'text',
                text: html,
              },
            ],
          });
        },
    };
  },
});

/**
 * Alternative: Raw HTML Node that preserves HTML exactly as-is
 */
export const RawHtml = Node.create({
  name: 'rawHtml',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      html: {
        default: '',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return null;
          const element = dom as HTMLElement;
          return { html: element.getAttribute('data-html') || '' };
        },
      },
    ];
  },
  
  renderHTML({ node }) {
    const div = document.createElement('div');
    div.setAttribute('data-raw-html', 'true');
    div.setAttribute('data-html', node.attrs.html);
    div.innerHTML = node.attrs.html;
    return {
      dom: div,
    };
  },
  
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.setAttribute('data-raw-html', 'true');
      dom.innerHTML = node.attrs.html;
      
      return {
        dom,
      };
    };
  },
});
