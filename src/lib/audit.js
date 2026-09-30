import { base44 } from '@/api/base44Client';

let mePromise;

export async function logAction(action, entity_type, entity_id, description) {
  mePromise = mePromise || base44.auth.me();
  const me = await mePromise;
  await base44.entities.AuditLog.create({
    action,
    entity_type,
    entity_id,
    description,
    user_name: me.full_name || me.email,
    user_email: me.email,
  });
}