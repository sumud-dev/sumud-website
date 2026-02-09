import { useState, useCallback } from 'react';
import { DialogState, TemplateType } from '@/src/lib/types/editor';
import { getTemplate, generateTable } from '@/src/lib/tipTap-editor/templates/editor-templates';

/**
 * Hook for managing editor dialogs
 */
export const useEditorDialogs = () => {
  const [dialogs, setDialogs] = useState<DialogState>({
    link: { isOpen: false, text: '', url: '' },
    image: { isOpen: false, url: '', alt: '' },
    table: { isOpen: false, rows: 3, cols: 3 },
    video: { isOpen: false, url: '' },
    template: { isOpen: false },
    templateEditor: { isOpen: false, templateType: null },
  });

  const openDialog = useCallback((dialog: keyof DialogState) => {
    setDialogs(prev => ({
      ...prev,
      [dialog]: { ...prev[dialog], isOpen: true },
    }));
  }, []);

  const closeDialog = useCallback((dialog: keyof DialogState) => {
    setDialogs(prev => ({
      ...prev,
      [dialog]: { ...prev[dialog], isOpen: false },
    }));
  }, []);

  const updateDialog = useCallback(<K extends keyof DialogState>(
    dialog: K,
    data: Partial<DialogState[K]>
  ) => {
    setDialogs(prev => ({
      ...prev,
      [dialog]: { ...prev[dialog], ...data },
    }));
  }, []);

  const resetDialog = useCallback((dialog: keyof DialogState) => {
    const defaults: DialogState = {
      link: { isOpen: false, text: '', url: '' },
      image: { isOpen: false, url: '', alt: '' },
      table: { isOpen: false, rows: 3, cols: 3 },
      video: { isOpen: false, url: '' },
      template: { isOpen: false },
      templateEditor: { isOpen: false, templateType: null },
    };
    
    setDialogs(prev => ({
      ...prev,
      [dialog]: defaults[dialog],
    }));
  }, []);

  return {
    dialogs,
    openDialog,
    closeDialog,
    updateDialog,
    resetDialog,
  };
};

/**
 * Hook for editor history (undo/redo)
 */
export const useEditorHistory = (initialValue: string) => {
  const [history, setHistory] = useState<string[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((value: string) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(value);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};

/**
 * Hook for template insertion
 */
export const useTemplateInsertion = () => {
  const insertTemplate = (type: TemplateType, insertHTML: (html: string) => void) => {
    const html = getTemplate(type);
    if (html) {
      insertHTML(html);
    }
  };

  const insertTable = useCallback((
    rows: number,
    cols: number,
    insertHtml: (html: string) => void
  ) => {
    const table = generateTable(rows, cols);
    insertHtml(table);
  }, []);

  return {
    insertTemplate,
    insertTable,
  };
};

/**
 * Hook for managing color picker
 */
export const useColorPicker = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'background' | 'highlight'>('text');

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    activeTab,
    setActiveTab,
    open,
    close,
    toggle,
  };
};
