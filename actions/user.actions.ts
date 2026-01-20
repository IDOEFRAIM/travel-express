'use server';

import { prisma } from "@/lib/prisma";
import { authService } from "@/services/auth.service";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const userId = await authService.requireUser();
  
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  try {
     await prisma.user.update({
        where: { id: userId },
        data: {
            fullName,
            email,
            phone
        }
     });

     revalidatePath('/admin/settings');
     return { success: true };
  } catch (error) {
     console.error("Update Profile Error:", error);
     return { success: false, error: "Impossible de mettre à jour le profil" };
  }
}