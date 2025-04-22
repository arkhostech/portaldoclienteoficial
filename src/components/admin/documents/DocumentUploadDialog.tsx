
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentUploadDialogProps } from "./types";
import { useFileSelection } from "./upload/useFileSelection";
import { useUploadProgress } from "./upload/useUploadProgress";
import { UploadDialogContent } from "./upload/UploadDialogContent";

const DocumentUploadDialog = ({
  open,
  onOpenChange,
  onUpload,
  isSubmitting,
  clients,
  preSelectedClientId
}: DocumentUploadDialogProps) => {
  const {
    files,
    setFiles,
    isCompressing,
    fileInputRef,
    onDrop,
    removeFile,
    handleBrowseFiles,
    handleFileChange
  } = useFileSelection();

  const handleDialogClose = (open: boolean) => {
    if (!isUploading && !isSubmitting && open === false) {
      onOpenChange(open);
      setFiles([]);
    }
  };

  const {
    isUploading,
    uploadProgress,
    handleSubmit
  } = useUploadProgress(files, onUpload, handleDialogClose, isSubmitting);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
        </DialogHeader>

        <UploadDialogContent
          files={files}
          onDrop={onDrop}
          onBrowseFiles={handleBrowseFiles}
          isCompressing={isCompressing}
          removeFile={removeFile}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          handleSubmit={handleSubmit}
          clients={clients}
          preSelectedClientId={preSelectedClientId}
          isSubmitting={isSubmitting}
          handleDialogClose={handleDialogClose}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
