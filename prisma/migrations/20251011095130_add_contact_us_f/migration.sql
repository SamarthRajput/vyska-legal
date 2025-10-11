-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_repliedById_fkey" FOREIGN KEY ("repliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
