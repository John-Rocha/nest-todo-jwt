-- RenameTable
ALTER TABLE "User" RENAME TO "users";

-- DropIndex (SQLite keeps old name after rename, so recreate with correct name)
DROP INDEX "User_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
