-- CreateTable
CREATE TABLE "public"."Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "super_adm" BOOLEAN NOT NULL DEFAULT false,
    "picture" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#013F71',
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Posts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "slug" TEXT NOT NULL,
    "featured_image" TEXT,
    "social_image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "author_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "key_word_seo" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "reading_time" INTEGER,
    "tags" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Files" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "type" TEXT,
    "path" TEXT,
    "subFolder" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cloudinary_id" TEXT,

    CONSTRAINT "Files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Menus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MenuItems" (
    "id" SERIAL NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "target" TEXT NOT NULL DEFAULT '_self',
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contacts" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "link" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "custom_color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HomeAbout" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Sobre Andre Paravela',
    "content" TEXT NOT NULL,
    "photo" TEXT,
    "download_button_text" TEXT NOT NULL DEFAULT 'Baixe o novo material',
    "download_file" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeAbout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BannerWhatsApp" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Acesse nosso grupo de WhatsApp',
    "description" TEXT,
    "button_text" TEXT NOT NULL DEFAULT 'Entrar para o grupo',
    "whatsapp_link" TEXT NOT NULL DEFAULT 'https://wa.me/5511999999999',
    "background_image" TEXT,
    "background_color" TEXT NOT NULL DEFAULT '#013F71',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerWhatsApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Pages" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "featured_image" TEXT,
    "social_image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "author_id" INTEGER NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "key_word_seo" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "template" TEXT NOT NULL DEFAULT 'default',
    "custom_css" TEXT,
    "custom_js" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" INTEGER,
    "record_name" TEXT,
    "old_data" TEXT,
    "new_data" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "public"."Categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Posts_slug_key" ON "public"."Posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Menus_location_key" ON "public"."Menus"("location");

-- CreateIndex
CREATE UNIQUE INDEX "Contacts_location_order_key" ON "public"."Contacts"("location", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Pages_slug_key" ON "public"."Pages"("slug");

-- AddForeignKey
ALTER TABLE "public"."Posts" ADD CONSTRAINT "Posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Posts" ADD CONSTRAINT "Posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuItems" ADD CONSTRAINT "MenuItems_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."MenuItems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuItems" ADD CONSTRAINT "MenuItems_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."Menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Pages" ADD CONSTRAINT "Pages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Logs" ADD CONSTRAINT "Logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
