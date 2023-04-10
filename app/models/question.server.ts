import type { User, Question } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Question, Choice } from "@prisma/client";

export function getQuestion({
  id,
  userId,
}: Pick<Question, "id"> & {
  userId: User["id"];
}) {
  return prisma.question.findFirst({
    select: { id: true, title: true, choices: true },
    where: { id, userId },
  });
}

export function getQuestions({ userId }: { userId: User["id"] }) {
  return prisma.question.findMany({
    where: { userId },
    select: { id: true, title: true, choices: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createQuestion({ title, choices, userId }) {
  return prisma.question.create({
    data: {
      title,
      choices: {
        create: choices,
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
    include: {
      choices: true,
    },
  });
}

export function deleteQuestion({ id }) {
  return prisma.question.delete({
    where: { id },
  });
}
