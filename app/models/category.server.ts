import type { Category } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Category } from "@prisma/client";

export function getCategory({ id }: Pick<Category, "id">) {
  return prisma.category.findFirst({
    select: { id: true, color: true, title: true },
  });
}

export function getCategoryListItems() {
  return prisma.category.findMany({
    select: { id: true, title: true, color: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createCategory({
  color,
  title,
}: Pick<Category, "color" | "title">) {
  return prisma.category.create({
    data: {
      title,
      color,
    },
  });
}

export function deleteCategory({ id }: Pick<Category, "id">) {
  return prisma.category.deleteMany({
    where: { id },
  });
}
