-- Wedding Planner — RLS policies (defense in depth)
-- Apply AFTER Prisma migrations.
-- Prisma (service role / direct) bypasses RLS; browser/PostgREST/Storage use these.
-- Roles live in public.memberships — NEVER in user_metadata.

-- ─────────────────────────────────────────────
-- Helpers (private schema)
-- ─────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_workspace_member(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.workspace_id = p_workspace_id
      AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION private.workspace_role(p_workspace_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.role::text
  FROM public.memberships m
  WHERE m.workspace_id = p_workspace_id
    AND m.user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.can_write(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.workspace_id = p_workspace_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'partner', 'collaborator')
  );
$$;

REVOKE ALL ON FUNCTION private.is_workspace_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.workspace_role(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.can_write(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_workspace_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.workspace_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_write(uuid) TO authenticated;

-- ─────────────────────────────────────────────
-- Profiles
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_self_or_same_workspace ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.memberships mine
      JOIN public.memberships theirs
        ON mine.workspace_id = theirs.workspace_id
      WHERE mine.user_id = auth.uid()
        AND theirs.user_id = profiles.id
    )
  );

CREATE POLICY profiles_update_self ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_insert_self ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────
-- Workspaces & memberships
-- ─────────────────────────────────────────────

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspaces_select_member ON public.workspaces
  FOR SELECT TO authenticated
  USING (private.is_workspace_member(id) AND deleted_at IS NULL);

CREATE POLICY workspaces_update_owner_partner ON public.workspaces
  FOR UPDATE TO authenticated
  USING (private.workspace_role(id) IN ('owner', 'partner'))
  WITH CHECK (private.workspace_role(id) IN ('owner', 'partner'));

-- Inserts usually via service / onboarding transaction; allow authenticated create
CREATE POLICY workspaces_insert_authenticated ON public.workspaces
  FOR INSERT TO authenticated
  WITH CHECK (true);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY memberships_select_same_workspace ON public.memberships
  FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id));

CREATE POLICY memberships_write_owner ON public.memberships
  FOR ALL TO authenticated
  USING (private.workspace_role(workspace_id) = 'owner')
  WITH CHECK (private.workspace_role(workspace_id) = 'owner');

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_select_member ON public.invitations
  FOR SELECT TO authenticated
  USING (
    private.is_workspace_member(workspace_id)
    OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY invitations_write_owner_partner ON public.invitations
  FOR ALL TO authenticated
  USING (private.workspace_role(workspace_id) IN ('owner', 'partner'))
  WITH CHECK (private.workspace_role(workspace_id) IN ('owner', 'partner'));

-- ─────────────────────────────────────────────
-- Generic pattern: tables with workspace_id
-- ─────────────────────────────────────────────

-- Helper macro conceptually applied to:
-- weddings, budget_categories, budget_items, budget_installments (via item),
-- vendors, tasks, task_dependencies, task_comments, guests, gifts,
-- honeymoon_items, documents, decisions, ai_suggestions, activity_logs

ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY weddings_select ON public.weddings FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY weddings_write ON public.weddings FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY budget_categories_select ON public.budget_categories FOR SELECT TO authenticated
  USING (wedding_id IS NULL OR EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = budget_categories.wedding_id
      AND private.is_workspace_member(w.workspace_id)
  ));
CREATE POLICY budget_categories_write ON public.budget_categories FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = budget_categories.wedding_id AND private.can_write(w.workspace_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.weddings w
    WHERE w.id = budget_categories.wedding_id AND private.can_write(w.workspace_id)
  ));

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY budget_items_select ON public.budget_items FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY budget_items_write ON public.budget_items FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.budget_installments ENABLE ROW LEVEL SECURITY;
CREATE POLICY budget_installments_select ON public.budget_installments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.budget_items bi
    WHERE bi.id = budget_installments.budget_item_id
      AND private.is_workspace_member(bi.workspace_id)
  ));
CREATE POLICY budget_installments_write ON public.budget_installments FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.budget_items bi
    WHERE bi.id = budget_installments.budget_item_id AND private.can_write(bi.workspace_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.budget_items bi
    WHERE bi.id = budget_installments.budget_item_id AND private.can_write(bi.workspace_id)
  ));

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendors_select ON public.vendors FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY vendors_write ON public.vendors FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_select ON public.tasks FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY tasks_write ON public.tasks FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_deps_select ON public.task_dependencies FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_dependencies.task_id AND private.is_workspace_member(t.workspace_id)
  ));
CREATE POLICY task_deps_write ON public.task_dependencies FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_dependencies.task_id AND private.can_write(t.workspace_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_dependencies.task_id AND private.can_write(t.workspace_id)
  ));

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_comments_select ON public.task_comments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_comments.task_id AND private.is_workspace_member(t.workspace_id)
  ));
CREATE POLICY task_comments_insert ON public.task_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_comments.task_id AND private.can_write(t.workspace_id)
    )
  );

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY guests_select ON public.guests FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY guests_write ON public.guests FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY gifts_select ON public.gifts FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY gifts_write ON public.gifts FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.honeymoon_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY honeymoon_select ON public.honeymoon_items FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY honeymoon_write ON public.honeymoon_items FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_select ON public.documents FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY documents_write ON public.documents FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY decisions_select ON public.decisions FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id) AND deleted_at IS NULL);
CREATE POLICY decisions_write ON public.decisions FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_select ON public.ai_suggestions FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id));
CREATE POLICY ai_write ON public.ai_suggestions FOR ALL TO authenticated
  USING (private.can_write(workspace_id))
  WITH CHECK (private.can_write(workspace_id));

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY activity_select ON public.activity_logs FOR SELECT TO authenticated
  USING (private.is_workspace_member(workspace_id));
CREATE POLICY activity_insert ON public.activity_logs FOR INSERT TO authenticated
  WITH CHECK (private.can_write(workspace_id));

-- ─────────────────────────────────────────────
-- Profile sync trigger from auth.users
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
