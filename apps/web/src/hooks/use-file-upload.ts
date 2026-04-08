import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UseFileUploadOptions {
  bucket: string;
  onSuccess?: (result: { publicUrl: string; storagePath: string; fileName: string }) => void;
}

export function useFileUpload({ bucket, onSuccess }: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${timestamp}-${safeName}`;

        // Simulate incremental progress (Supabase JS SDK doesn't expose XHR progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        let { error } = await supabase.storage
          .from(bucket)
          .upload(storagePath, file, { upsert: false });

        // Stale session tokens (e.g. after `supabase stop` / switching projects) can break the
        // Authorization header while the anon key in env is fine. Retry once unauthenticated.
        if (error?.message.includes("Invalid Compact JWS")) {
          await supabase.auth.signOut();
          ({ error } = await supabase.storage
            .from(bucket)
            .upload(storagePath, file, { upsert: false }));
        }

        clearInterval(progressInterval);

        if (error) {
          const message = error.message.includes("Invalid Compact JWS")
            ? `${error.message}. Confirm VITE_SUPABASE_ANON_KEY matches this Supabase project (repo-root .env). If you reset local Supabase or changed projects, clear site data for this origin.`
            : error.message;
          setUploadError(message);
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

        setUploadProgress(100);

        onSuccess?.({
          publicUrl: publicUrlData.publicUrl,
          storagePath,
          fileName: file.name,
        });

        setTimeout(() => {
          setIsUploading(false);
        }, 400);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [bucket, onSuccess],
  );

  return { upload, isUploading, uploadProgress, uploadError };
}
