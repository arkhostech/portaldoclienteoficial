
import { useState } from "react";
import { Document } from "@/services/documents";

export const useDocumentDialogs = (setSelectedDocument: (doc: Document | null) => void) => {
  // Dialog state
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setOpenEditDialog(true);
  };

  const handleConfirmDelete = (document: Document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };

  return {
    openUploadDialog,
    openEditDialog,
    openDeleteDialog,
    setOpenUploadDialog,
    setOpenEditDialog,
    setOpenDeleteDialog,
    handleEditDocument,
    handleConfirmDelete
  };
};
