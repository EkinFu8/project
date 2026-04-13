-- Single user model: profile lives in public.users (Supabase Auth is the identity).
-- Drops legacy employee / credentials / app_user; content owners reference users.id.

ALTER TABLE public.content_management
  DROP CONSTRAINT IF EXISTS content_management_content_owner_fkey;

ALTER TABLE public.content_management
  DROP COLUMN IF EXISTS content_owner;

ALTER TABLE public.content_management
  ADD COLUMN owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

DROP TABLE IF EXISTS public.credentials;
DROP TABLE IF EXISTS public.employee;
DROP TABLE IF EXISTS public.app_user;

ALTER TABLE public.users
  ADD COLUMN portal text NOT NULL DEFAULT 'employee',
  ADD COLUMN role text NOT NULL DEFAULT 'underwriter',
  ADD COLUMN employee_code varchar(10) NULL,
  ADD COLUMN job_desc varchar(200) NULL;

ALTER TABLE public.users
  ADD CONSTRAINT users_portal_check CHECK (portal IN ('employee', 'admin'));

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'underwriter', 'business-analyst'));

-- Multiple NULLs allowed (Postgres); non-null codes must be unique.
CREATE UNIQUE INDEX users_employee_code_key ON public.users (employee_code);

-- Sync profile columns when Auth users are created (metadata is optional; app sets authoritative values via API too).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_portal text;
  v_role text;
  v_code text;
BEGIN
  v_portal := CASE WHEN new.raw_user_meta_data->>'portal' = 'admin' THEN 'admin' ELSE 'employee' END;
  v_role := new.raw_user_meta_data->>'role';
  IF v_role IS NULL OR v_role NOT IN ('admin', 'underwriter', 'business-analyst') THEN
    v_role := 'underwriter';
  END IF;
  v_code := nullif(trim(coalesce(new.raw_user_meta_data->>'employee_code', '')), '');
  IF v_code IS NOT NULL AND length(v_code) > 10 THEN
    v_code := left(v_code, 10);
  END IF;

  INSERT INTO public.users (id, email, name, portal, role, employee_code, job_desc)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    v_portal,
    v_role,
    v_code,
    nullif(left(trim(coalesce(new.raw_user_meta_data->>'job_desc', '')), 200), '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Align seeded Auth users with intended portals (metadata is already set in seed.sql; this repairs pre-existing rows).
UPDATE public.users SET portal = 'admin', role = 'admin' WHERE email = 'admin@hanover.test';
UPDATE public.users SET portal = 'employee', role = 'underwriter' WHERE email = 'user@hanover.test';
