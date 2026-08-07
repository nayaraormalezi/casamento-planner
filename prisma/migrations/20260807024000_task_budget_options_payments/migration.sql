-- CreateEnum
CREATE TYPE "PaymentPlan" AS ENUM ('lump_sum', 'installments');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');

-- CreateTable
CREATE TABLE "task_budget_options" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "wedding_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "vendor_id" UUID,
    "vendor_name" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "payment_plan" "PaymentPlan" NOT NULL DEFAULT 'lump_sum',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'unpaid',
    "paid_amount" INTEGER NOT NULL DEFAULT 0,
    "next_payment_date" DATE,
    "installment_count" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_budget_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_budget_installments" (
    "id" UUID NOT NULL,
    "option_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "due_date" DATE,
    "paid_at" TIMESTAMP(3),
    "payment_method" "PaymentMethod",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_budget_installments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "task_budget_options_workspace_id_idx" ON "task_budget_options"("workspace_id");
CREATE INDEX "task_budget_options_wedding_id_idx" ON "task_budget_options"("wedding_id");
CREATE INDEX "task_budget_options_task_id_is_selected_idx" ON "task_budget_options"("task_id", "is_selected");
CREATE UNIQUE INDEX "task_budget_installments_option_id_sequence_key" ON "task_budget_installments"("option_id", "sequence");
CREATE INDEX "task_budget_installments_due_date_idx" ON "task_budget_installments"("due_date");

-- AddForeignKey
ALTER TABLE "task_budget_options" ADD CONSTRAINT "task_budget_options_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_budget_options" ADD CONSTRAINT "task_budget_options_wedding_id_fkey" FOREIGN KEY ("wedding_id") REFERENCES "weddings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_budget_options" ADD CONSTRAINT "task_budget_options_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "task_budget_installments" ADD CONSTRAINT "task_budget_installments_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "task_budget_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
