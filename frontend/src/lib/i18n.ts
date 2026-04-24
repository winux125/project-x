export type Lang = "ru" | "en" | "kz";

export const LANG_LABELS: Record<Lang, string> = {
  ru: "Русский",
  en: "English",
  kz: "Қазақша",
};

const translations = {
  hackathon: { ru: "Хакатон 2026", en: "Hackathon 2026", kz: "Хакатон 2026" },
  team: { ru: "Команда GirlyGirl", en: "Team GirlyGirl", kz: "GirlyGirl тобы" },

  heroTag: { ru: "NLP / Классификация токенов", en: "NLP / Token Classification", kz: "NLP / Токен классификациясы" },
  heroSubtitle: { ru: "Восстановление пунктуации казахского текста", en: "Kazakh Punctuation Restoration", kz: "Қазақ мәтінінің пунктуациясын қалпына келтіру" },
  heroDesc: {
    ru: "AI модель, которая восстанавливает знаки препинания в казахском тексте. Превращает сырой ASR-вывод в читаемый текст.",
    en: "AI model that restores punctuation in Kazakh text. Converts raw ASR output into readable text.",
    kz: "Қазақ мәтініндегі тыныс белгілерін қалпына келтіретін AI моделі. ASR шығысын оқылатын мәтінге айналдырады.",
  },
  tryDemo: { ru: "Попробовать демо", en: "Try Demo", kz: "Демо көру" },
  howItWorks: { ru: "Как это работает", en: "How It Works", kz: "Қалай жұмыс істейді" },

  demoTitle: { ru: "Интерактивное демо", en: "Interactive Demo", kz: "Интерактивті демо" },
  demoInput: { ru: "Введите текст без знаков препинания", en: "Enter text without punctuation", kz: "Тыныс белгілерсіз мәтін енгізіңіз" },
  demoExample: { ru: "Пример", en: "Example", kz: "Мысал" },
  demoPlaceholder: { ru: "сәлем менің атым бақыт қалың қалай", en: "сәлем менің атым бақыт қалың қалай", kz: "сәлем менің атым бақыт қалың қалай" },
  demoButton: { ru: "Восстановить пунктуацию", en: "Restore Punctuation", kz: "Пунктуацияны қалпына келтіру" },
  demoProcessing: { ru: "Обработка...", en: "Processing...", kz: "Өңдеу..." },
  demoPredicted: { ru: "Предсказанные метки", en: "Predicted Labels", kz: "Болжанған белгілер" },
  demoResult: { ru: "Результат", en: "Result", kz: "Нәтиже" },
  demoError: {
    ru: "API модели не подключен. Показан демо-вывод.",
    en: "Model API is not connected. Showing demo output.",
    kz: "Модель API қосылмаған. Демо нәтиже көрсетілуде.",
  },

  step1Title: { ru: "Ввод текста", en: "Text Input", kz: "Мәтін енгізу" },
  step1Desc: { ru: "Сырой текст без пунктуации (например, из ASR системы)", en: "Raw text without punctuation (e.g. from ASR system)", kz: "Тыныс белгілерсіз мәтін (мысалы, ASR жүйесінен)" },
  step2Title: { ru: "Токенизация", en: "Tokenization", kz: "Токенизация" },
  step2Desc: { ru: "Текст разбивается на токены по пробелам", en: "Text is split into tokens by whitespace", kz: "Мәтін бос орындар бойынша токендерге бөлінеді" },
  step3Title: { ru: "Классификация", en: "Classification", kz: "Классификация" },
  step3Desc: { ru: "ML модель предсказывает метку для каждого токена: O, COMMA, PERIOD, QUESTION", en: "ML model predicts a label for each token: O, COMMA, PERIOD, QUESTION", kz: "ML моделі әр токен үшін белгі болжайды: O, COMMA, PERIOD, QUESTION" },
  step4Title: { ru: "Результат", en: "Result", kz: "Нәтиже" },
  step4Desc: { ru: "Знаки препинания восстановлены — текст готов к использованию", en: "Punctuation restored — text is ready to use", kz: "Тыныс белгілері қалпына келтірілді — мәтін пайдалануға дайын" },

  labelsTitle: { ru: "Метки классификации", en: "Classification Labels", kz: "Классификация белгілері" },
  noMark: { ru: "Нет знака", en: "No mark", kz: "Белгі жоқ" },
  comma: { ru: "Запятая", en: "Comma", kz: "Үтір" },
  period: { ru: "Точка", en: "Period", kz: "Нүкте" },
  question: { ru: "Вопрос", en: "Question", kz: "Сұрақ" },

  metricsTitle: { ru: "Результаты модели", en: "Model Results", kz: "Модель нәтижелері" },
  metricsComma: { ru: "Запятые", en: "Commas", kz: "Үтірлер" },
  metricsPeriod: { ru: "Точки", en: "Periods", kz: "Нүктелер" },
  metricsQuestion: { ru: "Вопросительные знаки", en: "Question marks", kz: "Сұрақ белгілері" },
  metricsNote: { ru: "Метрики обновятся после завершения обучения модели", en: "Metrics will update after model training is complete", kz: "Модельді оқыту аяқталғаннан кейін метрикалар жаңартылады" },
  metricsMacro: { ru: "Среднее F1 по трём классам", en: "Average F1 across three classes", kz: "Үш класс бойынша орташа F1" },
  metricsKaggle: { ru: "Public Leaderboard Score", en: "Public Leaderboard Score", kz: "Public Leaderboard Score" },

  evalTitle: { ru: "Оценка: Macro F1", en: "Evaluation: Macro F1", kz: "Бағалау: Macro F1" },
  evalDesc: {
    ru: "Submissions оцениваются по Macro F1 — среднее F1 по трём классам (COMMA, PERIOD, QUESTION). Класс O исключён из подсчёта.",
    en: "Submissions are scored using Macro F1 — the average F1 across three classes (COMMA, PERIOD, QUESTION). Class O is excluded.",
    kz: "Submissions Macro F1 бойынша бағаланады — үш класс бойынша орташа F1 (COMMA, PERIOD, QUESTION). O класы есептен шығарылған.",
  },

  archTitle: { ru: "Архитектура модели", en: "Model Architecture", kz: "Модель архитектурасы" },
  archModel: { ru: "Базовая модель", en: "Base Model", kz: "Негізгі модель" },
  archModelDesc: {
    ru: "XLM-RoBERTa-Large (560M параметров) — мультиязычная модель, обученная на 100 языках включая казахский. Выбрана за более сильные представления по сравнению с казахско-специфичными моделями.",
    en: "XLM-RoBERTa-Large (560M params) — multilingual model trained on 100 languages including Kazakh. Chosen for stronger representations over Kazakh-specific models.",
    kz: "XLM-RoBERTa-Large (560M параметр) — қазақ тілін қоса 100 тілде оқытылған мультитілді модель. Қазақ-арнайы модельдерден күшті көрсеткіштері үшін таңдалды.",
  },
  archCrf: { ru: "CRF слой", en: "CRF Layer", kz: "CRF қабаты" },
  archCrfDesc: {
    ru: "Conditional Random Field поверх classification head. Моделирует совместную вероятность последовательности меток, обеспечивая глобально оптимальный вывод через алгоритм Витерби.",
    en: "Conditional Random Field on top of classification head. Models joint probability of the entire label sequence, ensuring globally optimal output via Viterbi algorithm.",
    kz: "Classification head үстіне Conditional Random Field. Барлық белгі тізбегінің бірлескен ықтималдығын модельдейді, Витерби алгоритмі арқылы глобалды оптималды нәтиже береді.",
  },
  archData: { ru: "Данные", en: "Training Data", kz: "Деректер" },
  archDataDesc: {
    ru: "~120K примеров из Multidomain Kazakh Dataset (24M+ текстов) и Kazakh Wikipedia. Стриминг с shuffle для доменного разнообразия. Фильтрация чанков без COMMA и с >95% O-токенов.",
    en: "~120K examples from Multidomain Kazakh Dataset (24M+ texts) and Kazakh Wikipedia. Streamed with shuffle for domain diversity. Filtered chunks with no COMMA or >95% O-tokens.",
    kz: "Multidomain Kazakh Dataset (24M+ мәтін) және қазақ Wikipedia-дан ~120K мысал. Домен алуантүрлілігі үшін shuffle-мен стриминг. COMMA жоқ немесе >95% O-токенді чанктар сүзілді.",
  },
  archTraining: { ru: "Обучение", en: "Training", kz: "Оқыту" },
  archTrainingDesc: {
    ru: "AdamW, LR=1e-5, cosine decay, 6% warmup. Batch 32×2 gradient accumulation. 8 эпох, EarlyStopping patience=3. fp16 на H100 GPU. CRF loss вместо CrossEntropy.",
    en: "AdamW, LR=1e-5, cosine decay, 6% warmup. Batch 32×2 gradient accumulation. 8 epochs, EarlyStopping patience=3. fp16 on H100 GPU. CRF loss instead of CrossEntropy.",
    kz: "AdamW, LR=1e-5, cosine decay, 6% warmup. Batch 32×2 gradient accumulation. 8 эпоха, EarlyStopping patience=3. H100 GPU-да fp16. CrossEntropy орнына CRF loss.",
  },
  archInference: { ru: "Инференс", en: "Inference", kz: "Инференс" },
  archInferenceDesc: {
    ru: "Скользящее окно (256 слов, stride=100) для длинных текстов. Логиты усредняются, затем CRF Витерби декодирование. Постобработка: казахские вопросительные частицы (ма, ме, ба, бе) → QUESTION.",
    en: "Sliding window (256 words, stride=100) for long texts. Logits averaged, then CRF Viterbi decoding. Post-processing: Kazakh interrogative particles (ма, ме, ба, бе) → QUESTION.",
    kz: "Ұзын мәтіндер үшін жылжымалы терезе (256 сөз, stride=100). Логиттер орташаланады, содан кейін CRF Витерби декодтау. Постөңдеу: қазақ сұраулық шылаулары (ма, ме, ба, бе) → QUESTION.",
  },
  archPipeline: { ru: "Пайплайн", en: "Pipeline", kz: "Пайплайн" },
  archPipelineDesc: {
    ru: "Whitespace split → субтокенизация → XLM-R-Large + CRF → Viterbi decode → выравнивание на слова → постобработка вопросительных частиц.",
    en: "Whitespace split → sub-tokenization → XLM-R-Large + CRF → Viterbi decode → alignment to words → interrogative particle post-processing.",
    kz: "Бос орындар бойынша бөлу → суб-токенизация → XLM-R-Large + CRF → Viterbi decode → сөздерге туралау → сұраулық шылау постөңдеу.",
  },

  impTitle: { ru: "Анализ и улучшения", en: "Analysis & Improvements", kz: "Талдау және жақсартулар" },
  impWeakTitle: { ru: "Слабые стороны", en: "Weaknesses", kz: "Әлсіз жақтары" },
  impWeak1: {
    ru: "COMMA — самый сложный класс (F1=0.792): требует понимания клаузальной структуры казахского языка, которую трудно извлечь из автоматически размеченных данных",
    en: "COMMA is the hardest class (F1=0.792): requires understanding Kazakh clause structure, which is hard to learn from auto-labeled data",
    kz: "COMMA — ең қиын класс (F1=0.792): қазақ тілінің клаузалық құрылымын түсінуді талап етеді, автоматты белгіленген деректерден үйрену қиын",
  },
  impWeak2: {
    ru: "Label smoothing (0.1) ухудшил результаты — несовместим с динамикой обучения CRF на данном масштабе",
    en: "Label smoothing (0.1) hurt performance — incompatible with CRF training dynamics at this scale",
    kz: "Label smoothing (0.1) нәтижені нашарлатты — бұл масштабта CRF оқыту динамикасымен сәйкес келмейді",
  },
  impWeak3: {
    ru: "Seed ensemble (2 модели) дал 0.811 vs 0.820 одиночной модели — усреднение похожих моделей добавляет шум",
    en: "Seed ensemble (2 models) scored 0.811 vs 0.820 single model — averaging similar models adds noise",
    kz: "Seed ensemble (2 модель) 0.811 vs 0.820 жалғыз модель — ұқсас модельдерді орташалау шуыл қосады",
  },
  impIdeasTitle: { ru: "Идеи улучшения", en: "Improvement Ideas", kz: "Жақсарту идеялары" },
  impIdea1: {
    ru: "Более агрессивная аугментация данных: перестановка предложений, случайное удаление слов, замена синонимами для увеличения разнообразия COMMA контекстов",
    en: "More aggressive data augmentation: sentence shuffling, random word deletion, synonym replacement to diversify COMMA contexts",
    kz: "Агрессивті деректер аугментациясы: сөйлемдерді ауыстыру, кездейсоқ сөздерді жою, COMMA контексттерін әртараптандыру үшін синонимдермен ауыстыру",
  },
  impIdea2: {
    ru: "Ensemble разных архитектур (XLM-R-Large + KazBERT + mBERT) вместо seed ensemble для большего разнообразия предсказаний",
    en: "Ensemble of different architectures (XLM-R-Large + KazBERT + mBERT) instead of seed ensemble for greater prediction diversity",
    kz: "Seed ensemble орнына әртүрлі архитектуралардың ансамблі (XLM-R-Large + KazBERT + mBERT) болжамдар алуантүрлілігін арттыру үшін",
  },
  impIdea3: {
    ru: "Двухэтапный подход: грубая модель для sentence boundary detection, затем fine-grained модель для COMMA внутри предложений",
    en: "Two-stage approach: coarse model for sentence boundary detection, then fine-grained model for intra-sentence COMMA placement",
    kz: "Екі кезеңді тәсіл: сөйлем шекарасын анықтау үшін дөрекі модель, содан кейін сөйлем ішіндегі COMMA үшін нақты модель",
  },
  impFutureTitle: { ru: "Перспективы", en: "Future Work", kz: "Болашақ жоспарлар" },
  impFuture1: {
    ru: "True Casing как второй этап пайплайна — восстановление заглавных букв после пунктуации",
    en: "True Casing as second pipeline stage — capitalize after punctuation restoration",
    kz: "True Casing пайплайнның екінші кезеңі ретінде — пунктуациядан кейін бас әріптерді қалпына келтіру",
  },
  impFuture2: {
    ru: "Интеграция с ASR (Whisper, Google STT) для end-to-end пайплайна: речь → текст → пунктуация",
    en: "ASR integration (Whisper, Google STT) for end-to-end pipeline: speech → text → punctuation",
    kz: "ASR интеграциясы (Whisper, Google STT) end-to-end пайплайн: сөйлеу → мәтін → пунктуация",
  },
  impFuture3: {
    ru: "Transfer learning на другие тюркские языки (узбекский, кыргызский) — близкая морфология упрощает адаптацию",
    en: "Transfer learning to other Turkic languages (Uzbek, Kyrgyz) — similar morphology simplifies adaptation",
    kz: "Басқа түркі тілдеріне (өзбек, қырғыз) transfer learning — ұқсас морфология бейімдеуді жеңілдетеді",
  },

  footerText: { ru: "KazPunct Хакатон 2026 — Восстановление пунктуации", en: "KazPunct Hackathon 2026 — Punctuation Restoration", kz: "KazPunct Хакатон 2026 — Пунктуацияны қалпына келтіру" },
} as const;

type Key = keyof typeof translations;

export function t(key: Key, lang: Lang): string {
  return translations[key][lang];
}
