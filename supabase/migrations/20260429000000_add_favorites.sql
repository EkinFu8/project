CREATE TABLE IF NOT EXISTS public.favorites (
  "userId" uuid NOT NULL,
  "fileID" char(64) NOT NULL,
  "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT favorites_pkey PRIMARY KEY ("userId", "fileID"),
  CONSTRAINT favorites_userId_fkey FOREIGN KEY ("userId")
    REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT favorites_fileID_fkey FOREIGN KEY ("fileID")
    REFERENCES public.content_management(fileid) ON DELETE CASCADE ON UPDATE CASCADE
);
