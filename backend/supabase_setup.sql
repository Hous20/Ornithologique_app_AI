-- Supabase setup for Ornithologique_app_AI
-- Scope: RPC for atomic bird creation + duplicate protection + temporary public RLS policies.

-- 1) Unique constraint to prevent duplicate image URL for same species.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_image_url_espece'
      AND conrelid = 'public."Image"'::regclass
  ) THEN
    ALTER TABLE public."Image"
      ADD CONSTRAINT uq_image_url_espece UNIQUE (url, espece_id);
  END IF;
END
$$;

-- 1.b) Sequence resync (important after manual imports with explicit IDs).
-- Prevents duplicate key errors like 23505 on auto-generated id columns.
SELECT setval(
  pg_get_serial_sequence('public."Taxonomie"', 'id'),
  COALESCE((SELECT MAX(id) FROM public."Taxonomie"), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public."Espece"', 'id'),
  COALESCE((SELECT MAX(id) FROM public."Espece"), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public."Image"', 'id'),
  COALESCE((SELECT MAX(id) FROM public."Image"), 1),
  true
);

SELECT setval(
  pg_get_serial_sequence('public."Auteur"', 'id'),
  COALESCE((SELECT MAX(id) FROM public."Auteur"), 1),
  true
);

-- 2) RPC function: insert Taxonomie then Espece in one transaction.
CREATE OR REPLACE FUNCTION public.insert_espece_with_taxonomie(
  p_nom character varying,
  p_nombre_individus integer,
  p_longevite character varying,
  p_taille character varying,
  p_poids character varying,
  p_status character varying,
  p_ordre character varying,
  p_famille character varying,
  p_genre character varying
)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_taxonomie_id integer;
  v_espece_id integer;
BEGIN
  -- Reuse existing taxonomy row when present to avoid conflicts.
  SELECT id
  INTO v_taxonomie_id
  FROM public."Taxonomie"
  WHERE ordre = p_ordre
    AND famille = p_famille
    AND genre = p_genre
  LIMIT 1;

  IF v_taxonomie_id IS NULL THEN
    INSERT INTO public."Taxonomie" (ordre, famille, genre)
    VALUES (p_ordre, p_famille, p_genre)
    RETURNING id INTO v_taxonomie_id;
  END IF;

  INSERT INTO public."Espece" (
    nom,
    nombre_individus,
    longevite,
    taille,
    poids,
    status,
    taxonomie_id
  )
  VALUES (
    p_nom,
    p_nombre_individus,
    p_longevite,
    p_taille,
    p_poids,
    COALESCE(NULLIF(TRIM(p_status), ''), 'Stable'),
    v_taxonomie_id
  )
  RETURNING id INTO v_espece_id;

  RETURN v_espece_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_espece_with_taxonomie(
  character varying,
  integer,
  character varying,
  character varying,
  character varying,
  character varying,
  character varying,
  character varying,
  character varying
) TO anon, authenticated;

-- 3) Temporary RLS setup (public read/write while Auth is postponed).
ALTER TABLE public."Taxonomie" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Espece" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Image" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Auteur" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Taxonomie' AND policyname = 'taxonomie_public_select'
  ) THEN
    CREATE POLICY taxonomie_public_select ON public."Taxonomie"
      FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Taxonomie' AND policyname = 'taxonomie_public_insert'
  ) THEN
    CREATE POLICY taxonomie_public_insert ON public."Taxonomie"
      FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Espece' AND policyname = 'espece_public_select'
  ) THEN
    CREATE POLICY espece_public_select ON public."Espece"
      FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Espece' AND policyname = 'espece_public_insert'
  ) THEN
    CREATE POLICY espece_public_insert ON public."Espece"
      FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Image' AND policyname = 'image_public_select'
  ) THEN
    CREATE POLICY image_public_select ON public."Image"
      FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'Image' AND policyname = 'image_public_insert'
  ) THEN
    CREATE POLICY image_public_insert ON public."Image"
      FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
END
$$;
