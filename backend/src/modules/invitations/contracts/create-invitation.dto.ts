//backend\src\modules\invitations\contracts\create-invitation.dto.ts
import { z } from 'zod';

export const CreateInvitationSchema = z.object({
    email: z.string().email(),
    role: z.string().min(1).max(50).default('member'),
});

export type CreateInvitationDto = z.infer<typeof CreateInvitationSchema>;