/**
 * TODO(phase 2): wire this up to WhatsApp Business API / Twilio WhatsApp so
 * members get pinged the moment a new cycle assigns them a chore. Called
 * once per assignment right after a cycle is generated (see
 * src/app/api/cycles/generate/route.ts). No-op until then.
 */
export async function notifyAssignment(memberId: string, choreId: string): Promise<void> {
  void memberId;
  void choreId;
}
