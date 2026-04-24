import type { Lang } from "@/lib/i18n";

export const EXAMPLE_INPUT = "сәлем менің атым бақыт қалың қалай";
export const EXAMPLE_OUTPUT = "COMMA O O O PERIOD O QUESTION";

export const LABEL_COLORS: Record<string, string> = {
  COMMA: "bg-amber-100 text-amber-700 border-amber-200",
  PERIOD: "bg-emerald-100 text-emerald-700 border-emerald-200",
  QUESTION: "bg-violet-100 text-violet-700 border-violet-200",
  O: "bg-gray-100 text-gray-400 border-gray-200",
};

export const PUNCT_MAP: Record<string, string> = {
  COMMA: ",",
  PERIOD: ".",
  QUESTION: "?",
  O: "",
};

export const TYPING_MAP: Record<Lang, string[]> = {
  ru: [
    "Восстановление пунктуации казахского текста",
    "AI для автоматической расстановки знаков",
    "Из ASR-вывода в читаемый текст",
  ],
  en: [
    "Kazakh Punctuation Restoration",
    "AI-powered automatic punctuation",
    "From raw ASR output to readable text",
  ],
  kz: [
    "Қазақ мәтінінің пунктуациясын қалпына келтіру",
    "Тыныс белгілерін автоматты қою AI",
    "ASR шығысынан оқылатын мәтінге",
  ],
};
