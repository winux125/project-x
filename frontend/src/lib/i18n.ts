export type Lang = "ru" | "en" | "kz";

export const LANG_LABELS: Record<Lang, string> = {
  ru: "Русский",
  en: "English",
  kz: "Қазақша",
};

const translations = {
  brand:        { ru: "LLM Vuln Tester",             en: "LLM Vuln Tester",            kz: "LLM Vuln Tester" },
  hackathon:    { ru: "ICCSDFAI 2026",               en: "ICCSDFAI 2026",              kz: "ICCSDFAI 2026" },
  navRunner:    { ru: "Запуск теста",                 en: "Runner",                     kz: "Іске қосу" },
  navDatasets:  { ru: "Датасеты",                     en: "Datasets",                   kz: "Деректер" },
  navCategories:{ ru: "Категории",                    en: "Categories",                 kz: "Санаттар" },
  navAbout:     { ru: "Архитектура",                  en: "Architecture",               kz: "Архитектура" },

  heroTag:      { ru: "Security / Red-team",         en: "Security / Red-team",         kz: "Security / Red-team" },
  heroTitleA:   { ru: "LLM",                          en: "LLM",                         kz: "LLM" },
  heroTitleB:   { ru: "VulnTester",                   en: "VulnTester",                  kz: "VulnTester" },
  heroDesc:     {
    ru: "Запускайте автоматизированный пакет атак против любой LLM — OpenAI, Ollama, Anthropic или собственного прокси. Асинхронно, с отслеживанием сессии и итоговым отчётом.",
    en: "Run an automated attack suite against any LLM — OpenAI, Ollama, Anthropic, or a custom proxy. Async, with session tracking and a final report.",
    kz: "Кез келген LLM-ға қарсы автоматты шабуыл жинағын іске қосыңыз — OpenAI, Ollama, Anthropic немесе жеке прокси. Асинхронды, сессия бақылауымен және қорытынды есеппен.",
  },
  heroTyping:   {
    ru: "Prompt Injection · Jailbreak · System Leak · Harmful Content",
    en: "Prompt Injection · Jailbreak · System Leak · Harmful Content",
    kz: "Prompt Injection · Jailbreak · System Leak · Harmful Content",
  },
  heroCta:      { ru: "Начать тест",                  en: "Start Test",                 kz: "Тестті бастау" },
  heroDocs:     { ru: "API документация",             en: "API docs",                    kz: "API құжаттамасы" },

  runnerTitle:       { ru: "Запуск атаки",             en: "Run Attack Suite",            kz: "Шабуылды іске қосу" },
  runnerTargetUrl:   { ru: "URL целевой LLM",         en: "Target LLM URL",              kz: "Мақсатты LLM URL" },
  runnerHeaders:     { ru: "HTTP заголовки (JSON)",   en: "HTTP headers (JSON)",         kz: "HTTP тақырыптар (JSON)" },
  runnerModelConfig: { ru: "Параметры модели (JSON)", en: "Model config (JSON)",         kz: "Модель конфигурациясы (JSON)" },
  runnerListModels:  { ru: "Список моделей",          en: "List models",                 kz: "Модельдер тізімі" },
  runnerPickModel:   { ru: "Модель",                   en: "Model",                       kz: "Модель" },
  runnerDataset:     { ru: "Датасет",                  en: "Dataset",                     kz: "Деректер жинағы" },
  runnerCategories:  { ru: "Категории",                en: "Categories",                  kz: "Санаттар" },
  runnerSeverities:  { ru: "Серьёзность",              en: "Severity",                    kz: "Ауырлығы" },
  runnerMaxAttacks:  { ru: "Макс. атак (опц.)",        en: "Max attacks (optional)",      kz: "Макс. шабуыл (қос.)" },
  runnerStart:       { ru: "Запустить",                en: "Start",                       kz: "Іске қосу" },
  runnerStop:        { ru: "Остановить",               en: "Stop",                        kz: "Тоқтату" },
  runnerRunning:     { ru: "Работает...",              en: "Running...",                  kz: "Орындалуда..." },
  runnerCompleted:   { ru: "Завершено",                en: "Completed",                   kz: "Аяқталды" },
  runnerStopped:     { ru: "Остановлено",              en: "Stopped",                     kz: "Тоқтатылды" },
  runnerError:       { ru: "Ошибка",                   en: "Error",                       kz: "Қате" },
  runnerAllCats:     { ru: "Все категории",            en: "All categories",              kz: "Барлық санаттар" },
  runnerAllSevs:     { ru: "Все уровни",               en: "All severities",              kz: "Барлық деңгейлер" },
  runnerResults:     { ru: "Результаты",               en: "Results",                     kz: "Нәтижелер" },
  runnerSummary:     { ru: "Сводка",                   en: "Summary",                     kz: "Қорытынды" },
  runnerVulnRate:    { ru: "Уровень уязвимости",       en: "Vulnerability rate",          kz: "Осалдық деңгейі" },
  runnerAvgScore:    { ru: "Средний балл",             en: "Avg score",                   kz: "Орташа балл" },
  runnerNoSession:   { ru: "Сессия ещё не запущена",   en: "No session yet",              kz: "Сессия әлі іске қосылмаған" },

  datasetsTitle:     { ru: "Наши датасеты",           en: "Our datasets",                kz: "Біздің жинақтар" },
  datasetsDesc: {
    ru: "Три уровня атак — от базового набора до 300 трансформированных промптов для глубокого аудита.",
    en: "Three tiers of attacks — from a curated base to 300 transformation-augmented prompts for deep audits.",
    kz: "Шабуылдардың үш деңгейі — негізгі жинақтан 300 түрлендірілген промптқа дейін.",
  },

  categoriesTitle:   { ru: "Классы уязвимостей",       en: "Vulnerability classes",       kz: "Осалдық кластары" },
  categoryPI:        { ru: "Prompt Injection",         en: "Prompt Injection",            kz: "Prompt Injection" },
  categoryPIDesc: {
    ru: "Инъекция скрытых инструкций, которые переопределяют системный промпт модели.",
    en: "Hidden instructions injected to override the model's system prompt.",
    kz: "Модельдің жүйелік промптын ауыстыратын жасырын нұсқаулар.",
  },
  categoryJB:        { ru: "Jailbreak",                 en: "Jailbreak",                   kz: "Jailbreak" },
  categoryJBDesc: {
    ru: "Обход защитных барьеров через ролевые игры, гипотетические сценарии и персонажи.",
    en: "Bypassing safety guardrails via roleplay, hypothetical framing, or persona overrides.",
    kz: "Рөлдік ойындар, гипотетикалық сценарийлер арқылы қорғауды айналып өту.",
  },
  categorySL:        { ru: "System Leak",               en: "System Leak",                 kz: "System Leak" },
  categorySLDesc: {
    ru: "Попытки заставить модель раскрыть системный промпт или внутренние инструкции.",
    en: "Attempts to coax the model into revealing its system prompt or internal instructions.",
    kz: "Модельді жүйелік промптты ашуға мәжбүрлеу әрекеттері.",
  },
  categoryHC:        { ru: "Harmful Content",           en: "Harmful Content",             kz: "Harmful Content" },
  categoryHCDesc: {
    ru: "Косвенные запросы запрещённого контента через академические или художественные рамки.",
    en: "Indirect requests for prohibited content through academic or fictional framings.",
    kz: "Академиялық немесе көркемдік шеңберлер арқылы тыйым салынған контенттің жанама сұраулары.",
  },

  archTitle:         { ru: "Как это работает",         en: "How it works",                kz: "Қалай жұмыс істейді" },
  archStep1:         { ru: "Клиент отправляет конфиг", en: "Client sends config",         kz: "Клиент конфиг жібереді" },
  archStep1Desc: {
    ru: "POST /api/start с target_url, заголовками и model_config. Возвращается session_id.",
    en: "POST /api/start with target_url, headers and model_config. Returns a session_id.",
    kz: "POST /api/start: target_url, тақырыптар мен model_config. session_id қайтарады.",
  },
  archStep2:         { ru: "Асинхронный движок",       en: "Async engine",                kz: "Асинхронды қозғалтқыш" },
  archStep2Desc: {
    ru: "Для каждой атаки движок вызывает target через httpx, извлекает ответ и запускает evaluator.",
    en: "For each attack the engine calls the target via httpx, extracts the response and runs the evaluator.",
    kz: "Әр шабуыл үшін қозғалтқыш httpx арқылы мақсатқа шақырады, жауапты шығарып, evaluator іске қосады.",
  },
  archStep3:         { ru: "Автодетект формата",       en: "Auto-detect schema",          kz: "Форматты автоанықтау" },
  archStep3Desc: {
    ru: "Поддержка OpenAI, Ollama и Anthropic — никакого хардкода URL в движке.",
    en: "Supports OpenAI, Ollama, and Anthropic out of the box — no hardcoded URLs in the engine.",
    kz: "OpenAI, Ollama және Anthropic қолдау — қозғалтқышта URL қатты кодталмаған.",
  },
  archStep4:         { ru: "Отчёт и сводка",            en: "Report & summary",            kz: "Есеп және қорытынды" },
  archStep4Desc: {
    ru: "GET /api/status возвращает прогресс и полный результат; при завершении — сводка по категориям.",
    en: "GET /api/status returns progress and full results; on completion, a category breakdown.",
    kz: "GET /api/status прогресс пен толық нәтижені қайтарады; аяқталғанда — қорытынды.",
  },

  footerText:   { ru: "Построено для ICCSDFAI 2026 · Case #12", en: "Built for ICCSDFAI 2026 · Case #12", kz: "ICCSDFAI 2026 Case #12 үшін жасалды" },
  copyJson:     { ru: "Скопировать JSON",              en: "Copy JSON",                   kz: "JSON-ды көшіру" },
  copied:       { ru: "Скопировано",                   en: "Copied",                      kz: "Көшірілді" },
} as const;

type TKey = keyof typeof translations;

export function t(key: TKey, lang: Lang): string {
  return translations[key][lang];
}
