
import React from "react";
import FileDropzone from "../FileDropzone";
import FileList from "../FileList";
import DocumentUploadForm from "../DocumentUploadForm";
import { ProgressBar } from "./ProgressBar";
import { FileWithPreview } from "../types";
import { Client } from "@/services/clients/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UploadDialogContentProps {
  files: FileWithPreview[];
  onDrop: (acceptedFiles: File[]) => void;
  onBrowseFiles: () => void;
  isCompressing: boolean;
  removeFile: (id: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  handleSubmit: (formData: any) => void;
  clients: Client[];
  preSelectedClientId?: string;
  isSubmitting: boolean;
  handleDialogClose: (open: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadDialogContent = ({
  files,
  onDrop,
  onBrowseFiles,
  isCompressing,
  removeFile,
  isUploading,
  uploadProgress,
  handleSubmit,
  clients,
  preSelectedClientId,
  isSubmitting,
  handleDialogClose,
  fileInputRef,
  handleFileChange
}: UploadDialogContentProps) => {
  // Pick the first file name for form prefill (if exists)
  const firstSelectedFileName = files.length > 0 ? files[0].name : "";

  return (
    <ScrollArea className="max-h-[calc(90vh-120px)]">
      <div className="space-y-4 pr-4 p-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <FileDropzone
          onDrop={onDrop}
          filesCount={files.length}
          onBrowse={onBrowseFiles}
          isCompressing={isCompressing}
        />
        <FileList files={files} onRemove={removeFile} />

        {isUploading && <ProgressBar progress={uploadProgress} />}

        {files.length > 0 ? (
          <DocumentUploadForm
            clients={clients}
            preSelectedClientId={preSelectedClientId}
            isSubmitting={isSubmitting || isUploading}
            onCancel={() => handleDialogClose(false)}
            onSubmit={handleSubmit}
            firstSelectedFileName={firstSelectedFileName}
            files={files}
          />
        ) : null}
      </div>
    </ScrollArea>
  );
};
