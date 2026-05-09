export function buildWhatsAppLink(params: { phone: string; message: string }) {
  const normalizedPhone = params.phone.replace(/[^\d]/g, "");

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    params.message,
  )}`;
}

export function buildCarAvailableMessage(params: { carName: string }) {
  return `مرحباً 👋

نحن من Al-Manara Cars 🚗

السيارة التالية أصبحت متوفرة من جديد:

${params.carName}

يمكنك التواصل معنا للحصول على التفاصيل.`;
}
