import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function Editor({ content, onEdit, ...props }) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={content}
      onChange={(event, editor) => {
        const data = editor.getData();
        onEdit(data);
      }}
      config={{
        toolbar: [
          "bold",
          "italic",
          "|",
          "numberedList",
          "bulletedList",
          "|",
          "link",
          "|",
          "undo",
          "redo",
        ],
      }}
      {...props}
    />
  );
}
