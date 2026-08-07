-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('owner', 'partner', 'collaborator', 'viewer');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "WeddingStatus" AS ENUM ('drafting', 'planning', 'week_of', 'done', 'archived');

-- CreateEnum
CREATE TYPE "CurrencyCode" AS ENUM ('BRL');

-- CreateEnum
CREATE TYPE "BudgetItemStatus" AS ENUM ('planned', 'quoted', 'contracted', 'partially_paid', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "Flexibility" AS ENUM ('cannot_cut', 'can_reduce', 'can_remove');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('pix', 'credit_card', 'debit_card', 'boleto', 'transfer', 'cash', 'other');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('researching', 'contacted', 'quoted', 'contracted', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "TaskPhase" AS ENUM ('m18', 'm12', 'm9', 'm6', 'm3', 'm1', 'd15', 'd7', 'd3', 'day_of', 'post', 'honeymoon');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'doing', 'blocked', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('pending', 'yes', 'no', 'maybe');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('unknown', 'confirmed', 'declined');

-- CreateEnum
CREATE TYPE "GuestSide" AS ENUM ('bride', 'groom', 'both');

-- CreateEnum
CREATE TYPE "GiftStatus" AS ENUM ('available', 'reserved', 'purchased', 'delivered');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('contract', 'receipt', 'invoice', 'photo', 'pdf', 'other');

-- CreateEnum
CREATE TYPE "LinkedEntityType" AS ENUM ('budget_item', 'vendor', 'task', 'decision', 'guest', 'gift', 'honeymoon', 'wedding');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('pending', 'decided', 'revisited');

-- CreateEnum
CREATE TYPE "HoneymoonItemType" AS ENUM ('flight', 'hotel', 'insurance', 'itinerary', 'document', 'other');

-- CreateEnum
CREATE TYPE "HoneymoonItemStatus" AS ENUM ('planned', 'reserved', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "AiIntent" AS ENUM ('budget_overflow', 'what_to_hire', 'generate_tasks', 'vendor_value', 'budget_allocation');

-- CreateEnum
CREATE TYPE "AiSuggestionStatus" AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('created', 'updated', 'deleted', 'status_changed', 'commented', 'uploaded', 'invited', 'decided', 'ai_applied');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'collaborator',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'partner',
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "invited_by_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weddings" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "partner_one_name" TEXT,
    "partner_two_name" TEXT,
    "wedding_date" DATE,
    "total_budget" INTEGER NOT NULL DEFAULT 0,
    "currency" "CurrencyCode" NOT NULL DEFAULT 'BRL',
    "city" TEXT,
    "venue" TEXT,
    "style_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "WeddingStatus" NOT NULL DEFAULT 'drafting',
    "onboarding_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "weddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_categories" (
    "id" UUID NOT NULL,
    "wedding_id" UUID,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "subcategory" TEXT,
    "description" TEXT NOT NULL,
    "planned_amount" INTEGER NOT NULL DEFAULT 0,
    "contracted_amount" INTEGER,
    "paid_amount" INTEGER NOT NULL DEFAULT 0,
    "next_payment_date" DATE,
    "vendor_id" UUID,
    "payment_method" "PaymentMethod",
    "notes" TEXT,
    "status" "BudgetItemStatus" NOT NULL DEFAULT 'planned',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "flexibility" "Flexibility" NOT NULL DEFAULT 'can_reduce',
    "emotional_return" INTEGER NOT NULL DEFAULT 3,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_installments" (
    "id" UUID NOT NULL,
    "budget_item_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "due_date" DATE,
    "paid_at" TIMESTAMP(3),
    "payment_method" "PaymentMethod",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "category_slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "quoted_amount" INTEGER,
    "contracted_amount" INTEGER,
    "rating" INTEGER,
    "notes" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'researching',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" "TaskPhase" NOT NULL DEFAULT 'm6',
    "category_slug" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 3,
    "due_date" DATE,
    "start_date" DATE,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "is_milestone" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "assignee_id" UUID,
    "budget_item_id" UUID,
    "vendor_id" UUID,
    "template_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_dependencies" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "depends_on_task_id" UUID NOT NULL,

    CONSTRAINT "task_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "household" TEXT,
    "group_name" TEXT,
    "table_label" TEXT,
    "rsvp" "RsvpStatus" NOT NULL DEFAULT 'pending',
    "attendance" "AttendanceStatus" NOT NULL DEFAULT 'unknown',
    "side" "GuestSide" NOT NULL DEFAULT 'both',
    "party_size" INTEGER NOT NULL DEFAULT 1,
    "dietary_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "price" INTEGER,
    "purchased_by" TEXT,
    "guest_id" UUID,
    "status" "GiftStatus" NOT NULL DEFAULT 'available',
    "thank_you_sent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "honeymoon_items" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "type" "HoneymoonItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT,
    "confirmation_code" TEXT,
    "start_at" TIMESTAMP(3),
    "end_at" TIMESTAMP(3),
    "cost_amount" INTEGER,
    "status" "HoneymoonItemStatus" NOT NULL DEFAULT 'planned',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "honeymoon_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'other',
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_path" TEXT NOT NULL,
    "linked_type" "LinkedEntityType",
    "linked_id" UUID,
    "uploaded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category_slug" TEXT,
    "status" "DecisionStatus" NOT NULL DEFAULT 'pending',
    "options_considered" TEXT,
    "chosen_option" TEXT,
    "rationale" TEXT,
    "due_date" DATE,
    "decided_at" TIMESTAMP(3),
    "decided_by_id" UUID,
    "vendor_id" UUID,
    "budget_item_id" UUID,
    "emotional_return" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "intent" "AiIntent" NOT NULL,
    "status" "AiSuggestionStatus" NOT NULL DEFAULT 'pending',
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "created_by_id" UUID NOT NULL,
    "applied_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "actor_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE INDEX "workspaces_deleted_at_idx" ON "workspaces"("deleted_at");

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_workspace_id_user_id_key" ON "memberships"("workspace_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_workspace_id_email_idx" ON "invitations"("workspace_id", "email");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "weddings_workspace_id_idx" ON "weddings"("workspace_id");

-- CreateIndex
CREATE INDEX "weddings_wedding_date_idx" ON "weddings"("wedding_date");

-- CreateIndex
CREATE INDEX "weddings_deleted_at_idx" ON "weddings"("deleted_at");

-- CreateIndex
CREATE INDEX "budget_categories_wedding_id_idx" ON "budget_categories"("wedding_id");

-- CreateIndex
CREATE UNIQUE INDEX "budget_categories_wedding_id_slug_key" ON "budget_categories"("wedding_id", "slug");

-- CreateIndex
CREATE INDEX "budget_items_workspace_id_idx" ON "budget_items"("workspace_id");

-- CreateIndex
CREATE INDEX "budget_items_wedding_id_status_idx" ON "budget_items"("wedding_id", "status");

-- CreateIndex
CREATE INDEX "budget_items_wedding_id_category_id_idx" ON "budget_items"("wedding_id", "category_id");

-- CreateIndex
CREATE INDEX "budget_items_vendor_id_idx" ON "budget_items"("vendor_id");

-- CreateIndex
CREATE INDEX "budget_items_next_payment_date_idx" ON "budget_items"("next_payment_date");

-- CreateIndex
CREATE INDEX "budget_items_priority_idx" ON "budget_items"("priority");

-- CreateIndex
CREATE INDEX "budget_items_deleted_at_idx" ON "budget_items"("deleted_at");

-- CreateIndex
CREATE INDEX "budget_installments_due_date_idx" ON "budget_installments"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "budget_installments_budget_item_id_sequence_key" ON "budget_installments"("budget_item_id", "sequence");

-- CreateIndex
CREATE INDEX "vendors_workspace_id_idx" ON "vendors"("workspace_id");

-- CreateIndex
CREATE INDEX "vendors_wedding_id_status_idx" ON "vendors"("wedding_id", "status");

-- CreateIndex
CREATE INDEX "vendors_wedding_id_category_slug_idx" ON "vendors"("wedding_id", "category_slug");

-- CreateIndex
CREATE INDEX "vendors_deleted_at_idx" ON "vendors"("deleted_at");

-- CreateIndex
CREATE INDEX "tasks_workspace_id_idx" ON "tasks"("workspace_id");

-- CreateIndex
CREATE INDEX "tasks_wedding_id_status_idx" ON "tasks"("wedding_id", "status");

-- CreateIndex
CREATE INDEX "tasks_wedding_id_phase_idx" ON "tasks"("wedding_id", "phase");

-- CreateIndex
CREATE INDEX "tasks_wedding_id_due_date_idx" ON "tasks"("wedding_id", "due_date");

-- CreateIndex
CREATE INDEX "tasks_assignee_id_idx" ON "tasks"("assignee_id");

-- CreateIndex
CREATE INDEX "tasks_is_milestone_idx" ON "tasks"("is_milestone");

-- CreateIndex
CREATE INDEX "tasks_deleted_at_idx" ON "tasks"("deleted_at");

-- CreateIndex
CREATE INDEX "task_dependencies_depends_on_task_id_idx" ON "task_dependencies"("depends_on_task_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_dependencies_task_id_depends_on_task_id_key" ON "task_dependencies"("task_id", "depends_on_task_id");

-- CreateIndex
CREATE INDEX "task_comments_task_id_created_at_idx" ON "task_comments"("task_id", "created_at");

-- CreateIndex
CREATE INDEX "guests_workspace_id_idx" ON "guests"("workspace_id");

-- CreateIndex
CREATE INDEX "guests_wedding_id_rsvp_idx" ON "guests"("wedding_id", "rsvp");

-- CreateIndex
CREATE INDEX "guests_wedding_id_group_name_idx" ON "guests"("wedding_id", "group_name");

-- CreateIndex
CREATE INDEX "guests_wedding_id_table_label_idx" ON "guests"("wedding_id", "table_label");

-- CreateIndex
CREATE INDEX "guests_deleted_at_idx" ON "guests"("deleted_at");

-- CreateIndex
CREATE INDEX "gifts_workspace_id_idx" ON "gifts"("workspace_id");

-- CreateIndex
CREATE INDEX "gifts_wedding_id_status_idx" ON "gifts"("wedding_id", "status");

-- CreateIndex
CREATE INDEX "gifts_deleted_at_idx" ON "gifts"("deleted_at");

-- CreateIndex
CREATE INDEX "honeymoon_items_workspace_id_idx" ON "honeymoon_items"("workspace_id");

-- CreateIndex
CREATE INDEX "honeymoon_items_wedding_id_type_idx" ON "honeymoon_items"("wedding_id", "type");

-- CreateIndex
CREATE INDEX "honeymoon_items_deleted_at_idx" ON "honeymoon_items"("deleted_at");

-- CreateIndex
CREATE INDEX "documents_workspace_id_idx" ON "documents"("workspace_id");

-- CreateIndex
CREATE INDEX "documents_wedding_id_type_idx" ON "documents"("wedding_id", "type");

-- CreateIndex
CREATE INDEX "documents_linked_type_linked_id_idx" ON "documents"("linked_type", "linked_id");

-- CreateIndex
CREATE INDEX "documents_deleted_at_idx" ON "documents"("deleted_at");

-- CreateIndex
CREATE INDEX "decisions_workspace_id_idx" ON "decisions"("workspace_id");

-- CreateIndex
CREATE INDEX "decisions_wedding_id_status_idx" ON "decisions"("wedding_id", "status");

-- CreateIndex
CREATE INDEX "decisions_due_date_idx" ON "decisions"("due_date");

-- CreateIndex
CREATE INDEX "decisions_deleted_at_idx" ON "decisions"("deleted_at");

-- CreateIndex
CREATE INDEX "ai_suggestions_workspace_id_idx" ON "ai_suggestions"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_suggestions_wedding_id_intent_status_idx" ON "ai_suggestions"("wedding_id", "intent", "status");

-- CreateIndex
CREATE INDEX "activity_logs_workspace_id_created_at_idx" ON "activity_logs"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_categories" ADD CONSTRAINT "budget_categories_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "budget_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_installments" ADD CONSTRAINT "budget_installments_budget_item_id_fkey" FOREIGN KEY ("budget_item_id") REFERENCES "budget_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_budget_item_id_fkey" FOREIGN KEY ("budget_item_id") REFERENCES "budget_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_depends_on_task_id_fkey" FOREIGN KEY ("depends_on_task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "honeymoon_items" ADD CONSTRAINT "honeymoon_items_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_budget_item_id_fkey" FOREIGN KEY ("budget_item_id") REFERENCES "budget_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
