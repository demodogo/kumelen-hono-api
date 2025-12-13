-- DropForeignKey
ALTER TABLE "blog_post_media" DROP CONSTRAINT "blog_post_media_blogPostId_fkey";

-- AddForeignKey
ALTER TABLE "blog_post_media" ADD CONSTRAINT "blog_post_media_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
