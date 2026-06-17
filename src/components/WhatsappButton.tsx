import { STORE_INFO } from "@/config/store";

export function WhatsappButton() {
  return (
    <a
      href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.45 5.13L2 22l5.13-1.53a9.86 9.86 0 0 0 4.91 1.32h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.78 14.07c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.6-2.91-1.25-4.81-4.18-4.96-4.38-.15-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.31.38-.45.51-.15.14-.3.29-.13.58.18.29.79 1.3 1.69 2.1 1.16 1.04 2.14 1.36 2.44 1.51.3.15.47.13.65-.05.18-.18.74-.86.94-1.15.2-.29.4-.24.67-.14.27.1 1.7.8 1.99.95.29.14.49.21.56.33.07.12.07.69-.17 1.37z" />
      </svg>
    </a>
  );
}
