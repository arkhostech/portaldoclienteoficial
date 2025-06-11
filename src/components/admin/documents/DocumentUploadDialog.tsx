import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentUploadDialogProps } from "./types";
import { useFileSelection } from "./upload/useFileSelection";
import { useUploadProgress } from "./upload/useUploadProgress";
import { UploadDialogContent } from "./upload/UploadDialogContent";
import { toast } from "sonner";

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

  // Improved dialog close handling
  const handleDialogClose = (open: boolean) => {
    console.log("Dialog close triggered, open state:", open);
    
    if (!open) {
      if (isUploading || isSubmitting) {
        console.log("Cannot close dialog: Upload in progress");
        toast.error("Aguarde o upload terminar antes de fechar");
        return; // Don't close if uploading
      }
      
      console.log("Closing dialog and resetting files");
      onOpenChange(false);
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
      <DialogContent 
        className="sm:max-w-[650px] max-h-[90vh] bg-white rounded-[18px] shadow-[0_12px_40px_rgba(5,61,56,0.13)] border border-[#053D38]/10 outline outline-1 outline-[#053D38]/10"
      >
        <DialogHeader>
          <DialogTitle className="text-[#14140F] text-[1.5rem] font-bold">Enviar Documento</DialogTitle>
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
