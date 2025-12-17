-- CreateTable
CREATE TABLE "cms_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "cover_image" TEXT,
    "seo_title" TEXT,
    "seo_desc" TEXT,
    "seo_keywords" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_article_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "cover_image" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_article_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_articles" (
    "id" TEXT NOT NULL,
    "category_id" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "author" TEXT,
    "source" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_top" BOOLEAN NOT NULL DEFAULT false,
    "is_hot" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "seo_desc" TEXT,
    "seo_keywords" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_pages_slug_idx" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_pages_status_idx" ON "cms_pages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cms_article_categories_slug_key" ON "cms_article_categories"("slug");

-- CreateIndex
CREATE INDEX "cms_article_categories_slug_idx" ON "cms_article_categories"("slug");

-- CreateIndex
CREATE INDEX "cms_article_categories_status_idx" ON "cms_article_categories"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cms_articles_slug_key" ON "cms_articles"("slug");

-- CreateIndex
CREATE INDEX "cms_articles_category_id_idx" ON "cms_articles"("category_id");

-- CreateIndex
CREATE INDEX "cms_articles_slug_idx" ON "cms_articles"("slug");

-- CreateIndex
CREATE INDEX "cms_articles_status_idx" ON "cms_articles"("status");

-- CreateIndex
CREATE INDEX "cms_articles_is_top_sort_idx" ON "cms_articles"("is_top", "sort");

-- CreateIndex
CREATE INDEX "cms_articles_published_at_idx" ON "cms_articles"("published_at");

-- AddForeignKey
ALTER TABLE "cms_articles" ADD CONSTRAINT "cms_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "cms_article_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
