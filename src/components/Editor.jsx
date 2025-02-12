import React, { useCallback } from "react";
import styled from "styled-components";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Space, Divider } from "antd";
import {
  BoldOutlined,
  DisconnectOutlined,
  ItalicOutlined,
  LinkOutlined,
  OrderedListOutlined,
  RedoOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";

export default function Editor({ content, onEdit, utilities = ["basic"] }) {
  const extensions = [];

  if (utilities.includes("basic")) {
    extensions.push(StarterKit);
  }

  if (utilities.includes("link")) {
    extensions.push(
      Link.configure({
        openOnClick: true,
        autolink: false,
        defaultProtocol: "https",
        protocols: ["https"],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: false,
      })
    );
  }

  return (
    <EditorContainer>
      <EditorProvider
        onUpdate={({ editor }) => onEdit(editor.getHTML())}
        extensions={extensions}
        content={content}
        slotBefore={<MenuBar utilities={utilities} />}
      ></EditorProvider>
    </EditorContainer>
  );
}

const MenuBar = ({ utilities }) => {
  const { editor } = useCurrentEditor();

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl ?? "https://");

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    const isValid = !!pattern.test(url);

    if (!isValid) {
      notification.error({ message: "URL inválida" });
      return;
    }

    // update link
    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch (e) {
      alert(e.message);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menu">
      <Space>
        {utilities.includes("basic") && (
          <>
            <Tooltip title="Negrito">
              <Button
                color="black"
                variant="outlined"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                ghost={!editor.isActive("bold")}
                type="primary"
                icon={<BoldOutlined />}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Itálico">
              <Button
                color="black"
                variant="outlined"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                ghost={!editor.isActive("italic")}
                type="primary"
                icon={<ItalicOutlined />}
                size="small"
              />
            </Tooltip>

            <Tooltip title="Lista não ordenada">
              <Button
                color="black"
                variant="outlined"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                ghost={!editor.isActive("bulletList")}
                type="primary"
                icon={<UnorderedListOutlined />}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Lista ordenada">
              <Button
                color="black"
                variant="outlined"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "is-active" : ""}
                ghost={!editor.isActive("orderedList")}
                type="primary"
                icon={<OrderedListOutlined />}
                size="small"
              />
            </Tooltip>
          </>
        )}

        {utilities.includes("link") && (
          <>
            <Tooltip title="Adicionar link">
              <Button
                color="black"
                variant="outlined"
                onClick={setLink}
                className={editor.isActive("link") ? "is-active" : ""}
                ghost={!editor.isActive("link")}
                type="primary"
                icon={<LinkOutlined />}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Remover link">
              <Button
                color="black"
                variant="outlined"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className={editor.isActive("link") ? "is-active" : ""}
                ghost={!editor.isActive("link")}
                type="primary"
                icon={<DisconnectOutlined />}
                size="small"
              />
            </Tooltip>
          </>
        )}

        <Divider type="vertical" />
        <Tooltip title="Desfazer">
          <Button
            color="black"
            variant="outlined"
            onClick={() => editor.chain().focus().undo().run()}
            ghost
            type="primary"
            icon={<UndoOutlined />}
            size="small"
          />
        </Tooltip>
        <Tooltip title="Refazer">
          <Button
            color="black"
            variant="outlined"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            ghost
            type="primary"
            icon={<RedoOutlined />}
            size="small"
          />
        </Tooltip>
      </Space>
    </div>
  );
};

const EditorContainer = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 6px;

  .tiptap-menu {
    padding: 0.5rem;
    background: #fafafa;
    border-bottom: 1px solid #d9d9d9;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;

    .ant-space {
      width: auto;
    }
  }

  /* Basic editor styles */
  .tiptap {
    min-height: 100px;
    padding: 0.5rem;

    &:focus-visible {
      outline: none;
    }

    > * + * {
      margin-top: 0.75em;
    }

    ul,
    ol {
      padding: 0 1rem;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
    }

    code {
      background: rgba(#ffffff, 0.1);
      color: rgba(#ffffff, 0.6);
      border: 1px solid rgba(#ffffff, 0.1);
      border-radius: 0.5rem;
      padding: 0.2rem;
    }

    pre {
      background: rgba(#ffffff, 0.1);
      font-family: "JetBrainsMono", monospace;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;

      code {
        color: inherit;
        padding: 0;
        background: none;
        font-size: 0.8rem;
        border: none;
      }
    }

    img {
      max-width: 100%;
      height: auto;
    }

    blockquote {
      margin-left: 0;
      padding-left: 1rem;
      border-left: 2px solid rgba(#ffffff, 0.4);
    }

    hr {
      border: none;
      border-top: 2px solid rgba(#ffffff, 0.1);
      margin: 2rem 0;
    }
  }
`;
