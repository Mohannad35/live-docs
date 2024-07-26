/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $isRootOrShadowRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import React from "react";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const activeBlock = useActiveBlock();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        // eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars
        (_payload, _newEditor) => {
          $updateToolbar();

          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);

          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);

          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  function toggleBlock(type: "h1" | "h2" | "h3" | "quote") {
    const selection = $getSelection();

    if (activeBlock === type) {
      return $setBlocksType(selection, () => $createParagraphNode());
    }

    if (type === "h1") {
      return $setBlocksType(selection, () => $createHeadingNode("h1"));
    }

    if (type === "h2") {
      return $setBlocksType(selection, () => $createHeadingNode("h2"));
    }

    if (type === "h3") {
      return $setBlocksType(selection, () => $createHeadingNode("h3"));
    }

    if (type === "quote") {
      return $setBlocksType(selection, () => $createQuoteNode());
    }
  }

  return (
    <div ref={toolbarRef} className="toolbar">
      <button
        aria-label="Undo"
        className="toolbar-item spaced"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
      >
        <i className="format undo" />
      </button>
      <button
        aria-label="Redo"
        className="toolbar-item"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
      >
        <i className="format redo" />
      </button>
      <Divider />
      <button
        className={"toolbar-item spaced " + (activeBlock === "h1" ? "active" : "")}
        data-active={activeBlock === "h1" ? "" : undefined}
        onClick={() => editor.update(() => toggleBlock("h1"))}
      >
        <i className="format h1" />
      </button>
      <button
        className={"toolbar-item spaced " + (activeBlock === "h2" ? "active" : "")}
        data-active={activeBlock === "h2" ? "" : undefined}
        onClick={() => editor.update(() => toggleBlock("h2"))}
      >
        <i className="format h2" />
      </button>
      <button
        className={"toolbar-item spaced " + (activeBlock === "h3" ? "active" : "")}
        data-active={activeBlock === "h3" ? "" : undefined}
        onClick={() => editor.update(() => toggleBlock("h3"))}
      >
        <i className="format h3" />
      </button>
      <Divider />
      <button
        aria-label="Format Bold"
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
      >
        <i className="format bold" />
      </button>
      <button
        aria-label="Format Italics"
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
      >
        <i className="format italic" />
      </button>
      <button
        aria-label="Format Underline"
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
      >
        <i className="format underline" />
      </button>
      <button
        aria-label="Format Strikethrough"
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
      >
        <i className="format strikethrough" />
      </button>
      <Divider />
      <button
        aria-label="Left Align"
        className="toolbar-item spaced"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
      >
        <i className="format left-align" />
      </button>
      <button
        aria-label="Center Align"
        className="toolbar-item spaced"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
      >
        <i className="format center-align" />
      </button>
      <button
        aria-label="Right Align"
        className="toolbar-item spaced"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
      >
        <i className="format right-align" />
      </button>
      <button
        aria-label="Justify Align"
        className="toolbar-item"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
      >
        <i className="format justify-align" />
      </button>{" "}
    </div>
  );
}

function useActiveBlock() {
  const [editor] = useLexicalComposerContext();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.registerUpdateListener(onStoreChange);
    },
    [editor],
  );

  const getSnapshot = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) return null;

      const anchor = selection.anchor.getNode();
      let element =
        anchor.getKey() === "root"
          ? anchor
          : $findMatchingParent(anchor, (e) => {
              const parent = e.getParent();

              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchor.getTopLevelElementOrThrow();
      }

      if ($isHeadingNode(element)) {
        return element.getTag();
      }

      return element.getType();
    });
  }, [editor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
