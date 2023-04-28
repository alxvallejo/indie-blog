import type { User, Profile } from "@prisma/client";

import { prisma } from "~/db.server";

// export async function createProfile({ name, bio, userId}) {
//     return prisma.profile.create({
//       data: {
//         email,
//         password: {
//           create: {
//             hash: hashedPassword,
//           },
//         },
//       },
//     });
//   }
