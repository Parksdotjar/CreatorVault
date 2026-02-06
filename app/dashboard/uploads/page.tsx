import { UploadForm } from "@/components/UploadForm";

export default function UploadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display">Upload new asset</h1>
        <p className="text-sm text-white/60">
          Add metadata, upload files, and publish instantly.
        </p>
      </div>
      <UploadForm />
    </div>
  );
}
