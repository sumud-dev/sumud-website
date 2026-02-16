import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Details Extension - Interactive Accordion/Collapsible Content
 * Preserves <details> and <summary> HTML elements with full interactivity
 * Allows editing content while maintaining accordion functionality
 */
export const Details = Node.create({
  name: 'details',

  group: 'block',

  content: 'detailsSummary block+',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'details',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes), 0];
  },

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute('open'),
        renderHTML: (attributes) => {
          if (attributes.open) {
            return { open: '' };
          }
          return {};
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },
});

export const DetailsSummary = Node.create({
  name: 'detailsSummary',

  content: 'inline*',

  defining: true,

  parseHTML() {
    return [
      {
        tag: 'summary',
        getAttrs: (node) => {
          if (typeof node === 'string') return null;
          const element = node as HTMLElement;
          // Remove the chevron span when parsing to keep it separate
          const chevronSpan = element.querySelector('span');
          if (chevronSpan && chevronSpan.textContent?.includes('▼')) {
            chevronSpan.remove();
          }
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Add a data attribute to indicate this summary should have a chevron
    return ['summary', mergeAttributes(HTMLAttributes, { 'data-has-chevron': 'true' }), 0];
  },

  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
        },
      },
    };
  },
});
