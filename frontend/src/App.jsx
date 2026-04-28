import { useMemo, useState } from "react";

const METHODS = [
  {
    name: "Метод проговаривания мыслей (Think Aloud)",
    description:
      "Пользователь вслух комментирует действия и ожидания во время выполнения задачи.",
    goals: ["поведение", "проблемы"],
    dataType: "качественные",
    stage: ["концепция", "разработка", "готовый"],
    context: ["лабораторно", "удаленно"],
    requiresUsers: true,
    resources: "средние",
    strengths: ["Показывает причины ошибок", "Хорошо раскрывает логику пользователя"],
    weaknesses: ["Требует модерации", "Анализ занимает время"],
    whatItGives: "Понимание того, где и почему пользователь затрудняется.",
  },
  {
    name: "Экспертная оценка (Heuristic Evaluation)",
    description:
      "Эксперты проверяют интерфейс по эвристикам и выявляют нарушения базовых принципов UX.",
    goals: ["проблемы", "удобство"],
    dataType: "качественные",
    stage: ["концепция", "разработка", "готовый"],
    context: ["лабораторно", "удаленно"],
    requiresUsers: false,
    resources: "низкие",
    strengths: ["Быстро запускается", "Не нужен доступ к пользователям"],
    weaknesses: ["Зависит от компетенции эксперта"],
    whatItGives: "Список UX-проблем структуры, навигации и визуальной иерархии.",
  },
  {
    name: "Cognitive Walkthrough",
    description:
      "Пошаговый разбор пользовательского сценария с оценкой вероятных ошибок на каждом шаге.",
    goals: ["проблемы", "поведение"],
    dataType: "качественные",
    stage: ["концепция", "разработка"],
    context: ["лабораторно", "удаленно"],
    requiresUsers: false,
    resources: "низкие",
    strengths: ["Эффективен на ранних этапах", "Хорошо проверяет сценарии"],
    weaknesses: ["Не показывает реальные эмоции пользователей"],
    whatItGives: "Точки, где пользователь может сбиться или не понять следующий шаг.",
  },
  {
    name: "A/B тестирование",
    description:
      "Сравнение двух интерфейсных вариантов по целевым метрикам на реальном трафике.",
    goals: ["сравнение", "удобство"],
    dataType: "количественные",
    stage: ["готовый"],
    context: ["удаленно", "в реальной среде"],
    requiresUsers: true,
    resources: "высокие",
    strengths: ["Статистически обоснованный выбор", "Объективные метрики"],
    weaknesses: ["Требует достаточного трафика", "Длительный цикл"],
    whatItGives: "Подтверждение, какой вариант интерфейса эффективнее в реальном использовании.",
  },
  {
    name: "SUS (System Usability Scale)",
    description:
      "Краткая стандартизированная шкала для количественной оценки удобства интерфейса.",
    goals: ["удобство", "мнение"],
    dataType: "количественные",
    stage: ["разработка", "готовый"],
    context: ["лабораторно", "удаленно"],
    requiresUsers: true,
    resources: "низкие",
    strengths: ["Быстро собирается", "Удобно сравнивать между итерациями"],
    weaknesses: ["Не объясняет причины низкой оценки"],
    whatItGives: "Числовой индекс воспринимаемой удобности.",
  },
  {
    name: "Интервью пользователей",
    description:
      "Полуструктурированные беседы с пользователями о задачах, ожиданиях и барьерах.",
    goals: ["поведение", "мнение"],
    dataType: "качественные",
    stage: ["концепция", "разработка", "готовый"],
    context: ["лабораторно", "удаленно", "в реальной среде"],
    requiresUsers: true,
    resources: "средние",
    strengths: ["Глубокий контекст", "Выявляет мотивацию"],
    weaknesses: ["Сложно стандартизировать ответы"],
    whatItGives: "Причины поведения и ожиданий пользователей.",
  },
  {
    name: "Опрос (Survey)",
    description:
      "Анкетирование пользователей для сбора массового субъективного мнения.",
    goals: ["мнение", "удобство"],
    dataType: "количественные",
    stage: ["разработка", "готовый"],
    context: ["удаленно"],
    requiresUsers: true,
    resources: "низкие",
    strengths: ["Быстро масштабируется", "Подходит для большого охвата"],
    weaknesses: ["Нет глубины причин"],
    whatItGives: "Общую картину восприятия и удовлетворенности.",
  },
  {
    name: "Карточная сортировка (Card Sorting)",
    description:
      "Пользователи группируют и называют элементы, формируя естественную информационную архитектуру.",
    goals: ["понимание", "проблемы"],
    dataType: "смешанные",
    stage: ["концепция", "разработка"],
    context: ["лабораторно", "удаленно"],
    requiresUsers: true,
    resources: "средние",
    strengths: ["Улучшает структуру разделов", "Снижает когнитивную нагрузку"],
    weaknesses: ["Требует грамотной интерпретации кластеров"],
    whatItGives: "Понимание, как пользователи ожидают видеть структуру контента.",
  },
  {
    name: "Дневниковые исследования",
    description:
      "Пользователи фиксируют опыт взаимодействия с продуктом в течение периода времени.",
    goals: ["поведение", "мнение"],
    dataType: "смешанные",
    stage: ["разработка", "готовый"],
    context: ["в реальной среде"],
    requiresUsers: true,
    resources: "высокие",
    strengths: ["Показывает длительный опыт", "Дает контекст повседневного использования"],
    weaknesses: ["Долгий сбор", "Зависит от дисциплины участников"],
    whatItGives: "Данные о реальном использовании и изменении восприятия во времени.",
  },
  {
    name: "Eye-tracking",
    description:
      "Отслеживание взгляда пользователя для анализа внимания и визуальной навигации.",
    goals: ["поведение", "проблемы"],
    dataType: "количественные",
    stage: ["разработка", "готовый"],
    context: ["лабораторно"],
    requiresUsers: true,
    resources: "высокие",
    strengths: ["Точные визуальные метрики", "Показывает зоны внимания"],
    weaknesses: ["Дорогое оборудование", "Сложная интерпретация"],
    whatItGives: "Понимание, что пользователь видит и что игнорирует.",
  },
  {
    name: "Аналитика (Google Analytics / метрики)",
    description:
      "Анализ цифровых метрик поведения: воронки, отказы, события, конверсии.",
    goals: ["удобство", "сравнение", "проблемы"],
    dataType: "количественные",
    stage: ["готовый"],
    context: ["в реальной среде", "удаленно"],
    requiresUsers: true,
    resources: "низкие",
    strengths: ["Быстрый доступ к данным", "Объективная картина по массовой аудитории"],
    weaknesses: ["Не отвечает на вопрос «почему»"],
    whatItGives: "Где пользователи теряются в воронке и какие шаги проседают.",
  },
  {
    name: "Heatmaps",
    description:
      "Карты кликов и скролла, показывающие зоны внимания и взаимодействия.",
    goals: ["поведение", "проблемы"],
    dataType: "количественные",
    stage: ["разработка", "готовый"],
    context: ["удаленно", "в реальной среде"],
    requiresUsers: true,
    resources: "низкие",
    strengths: ["Быстрый визуальный анализ", "Простая интеграция"],
    weaknesses: ["Ограниченная глубина интерпретации"],
    whatItGives: "Что кликают, что игнорируют и до каких зон страницы доходят.",
  },
  {
    name: "Task Success Rate",
    description:
      "Доля пользователей, успешно выполнивших целевую задачу.",
    goals: ["удобство", "сравнение", "проблемы"],
    dataType: "количественные",
    stage: ["разработка", "готовый"],
    context: ["лабораторно", "удаленно", "в реальной среде"],
    requiresUsers: true,
    resources: "средние",
    strengths: ["Четкая объективная метрика", "Подходит для сравнений"],
    weaknesses: ["Не показывает причины неуспеха"],
    whatItGives: "Насколько интерфейс позволяет пользователю завершить задачу.",
  },
  {
    name: "First Click Test",
    description:
      "Проверка первого клика пользователя при выполнении типовой задачи.",
    goals: ["понимание", "проблемы"],
    dataType: "количественные",
    stage: ["концепция", "разработка"],
    context: ["удаленно", "лабораторно"],
    requiresUsers: true,
    resources: "низкие",
    strengths: ["Быстрый запуск", "Хорошо выявляет проблемы навигации"],
    weaknesses: ["Проверяет только ранний этап сценария"],
    whatItGives: "Понимание, интуитивна ли точка входа в задачу.",
  },
  {
    name: "Five Second Test",
    description:
      "Проверка первого впечатления: что пользователь успел понять за 5 секунд.",
    goals: ["мнение", "понимание"],
    dataType: "качественные",
    stage: ["концепция", "разработка"],
    context: ["удаленно", "лабораторно"],
    requiresUsers: true,
    resources: "низкие",
    strengths: ["Очень быстрый тест", "Показывает читаемость первого экрана"],
    weaknesses: ["Не оценивает полный пользовательский сценарий"],
    whatItGives: "Насколько ясно считывается ценность и структура экрана.",
  },
];

const resourceRank = {
  низкие: 1,
  средние: 2,
  высокие: 3,
};

const QUESTION_OPTIONS = {
  stage: ["концепция", "разработка", "готовый"],
  goal: ["проблемы", "поведение", "удобство", "сравнение", "мнение", "понимание"],
  dataType: ["качественные", "количественные", "смешанные"],
  usersAccess: ["есть", "нет"],
  resources: ["низкие", "средние", "высокие"],
  context: ["лабораторно", "удаленно", "в реальной среде"],
};

const DEFAULT_FORM = {
  stage: "разработка",
  goal: "проблемы",
  dataType: "качественные",
  usersAccess: "есть",
  resources: "средние",
  context: "лабораторно",
};

function scoreMethod(method, form) {
  let score = 0;

  if (method.goals.includes(form.goal)) score += 3;
  if (method.dataType === form.dataType || method.dataType === "смешанные") score += 2;
  if (method.stage.includes(form.stage)) score += 2;
  if (method.context.includes(form.context)) score += 1;

  if (resourceRank[method.resources] <= resourceRank[form.resources]) score += 1;

  const usersMatch =
    (form.usersAccess === "есть" && method.requiresUsers) ||
    (form.usersAccess === "нет" && !method.requiresUsers);
  if (usersMatch) score += 2;

  return score;
}

function buildRecommendationExplanation(form, topMethods) {
  const explanations = [];

  explanations.push(
    `Вы выбрали цель «${form.goal}» на этапе «${form.stage}», поэтому в приоритете методы, которые дают релевантные инсайты именно для этой стадии продукта.`
  );

  if (form.usersAccess === "нет") {
    explanations.push(
      "Так как доступа к пользователям нет, система повышает вес экспертных методов (например, экспертной оценки и cognitive walkthrough)."
    );
  } else {
    explanations.push(
      "Так как доступ к пользователям есть, система усиливает методы с прямым пользовательским участием для получения более валидных данных."
    );
  }

  if (form.dataType === "количественные") {
    explanations.push(
      "Так как вам нужны метрики, выше ранжируются количественные методы (например, SUS, Task Success Rate, A/B)."
    );
  } else if (form.dataType === "качественные") {
    explanations.push(
      "Так как важны причины проблем, система отдает приоритет качественным методам (например, Think Aloud и интервью)."
    );
  } else {
    explanations.push(
      "Так как выбран смешанный тип данных, система рекомендует сочетать качественные и количественные методы для полной картины."
    );
  }

  if (form.resources === "низкие") {
    explanations.push(
      "При низких ресурсах приоритет получают быстрые и организационно простые методы с высокой практической отдачей."
    );
  } else if (form.resources === "высокие") {
    explanations.push(
      "При высоких ресурсах система допускает более трудоемкие методы с глубокой аналитикой (например, дневниковые исследования, eye-tracking)."
    );
  }

  if (topMethods.length > 0) {
    explanations.push(
      `Наиболее релевантными оказались: ${topMethods
        .map((method) => method.name)
        .join(", ")} — они дают взаимодополняющий взгляд на одну и ту же UX-задачу.`
    );
  }

  return explanations;
}

function buildShortWhy(form) {
  const line1 = `Вы выбрали стадию «${form.stage}» и цель «${form.goal}».`;
  const line2 =
    form.usersAccess === "нет"
      ? "Поэтому приоритет отдан методам, которые можно применять без участия пользователей."
      : "Поэтому приоритет отдан методам с участием пользователей и релевантным типом данных.";
  const line3 = `Фокус на данных типа «${form.dataType}» и уровне ресурсов «${form.resources}».`;
  return [line1, line2, line3];
}

function buildScenarioHint(form) {
  if (form.usersAccess === "нет" && form.resources === "низкие") {
    return "Сценарий: нет пользователей + низкие ресурсы. Приоритет: экспертная оценка, cognitive walkthrough.";
  }

  if (form.usersAccess === "есть" && form.goal === "поведение") {
    return "Сценарий: есть пользователи + анализ поведения. Приоритет: think aloud и интервью пользователей.";
  }

  if (form.dataType === "количественные") {
    return "Сценарий: нужны метрики. Приоритет: SUS, Task Success Rate, A/B тестирование.";
  }

  if (form.goal === "сравнение") {
    return "Сценарий: нужно сравнить варианты. Приоритет: A/B тестирование.";
  }

  if (form.goal === "понимание") {
    return "Сценарий: исследование структуры и понимания. Приоритет: Card Sorting и First Click Test.";
  }

  return "Сценарий: комбинированное исследование. Рекомендуется сочетать 2-3 метода с разным типом данных.";
}

function buildFitReasons(method, form) {
  const reasons = [];
  if (method.stage.includes(form.stage)) {
    reasons.push(`соответствует стадии «${form.stage}»`);
  }
  if (method.dataType === form.dataType || method.dataType === "смешанные") {
    reasons.push(`дает ${form.dataType} данные`);
  }
  if (
    (form.usersAccess === "есть" && method.requiresUsers) ||
    (form.usersAccess === "нет" && !method.requiresUsers)
  ) {
    reasons.push(
      form.usersAccess === "есть"
        ? "предполагает работу с пользователями"
        : "можно применять без пользователей"
    );
  }
  return reasons.slice(0, 3);
}

function recommendationEngine(form) {
  const scoredMethods = METHODS.map((method) => ({
    ...method,
    score: scoreMethod(method, form),
  })).sort((a, b) => b.score - a.score);

  const topMethods = scoredMethods.slice(0, 3);
  const additionalMethods = scoredMethods.slice(3, 8);

  return {
    topMethods,
    additionalMethods,
    explanation: buildRecommendationExplanation(form, topMethods),
    shortWhy: buildShortWhy(form),
    scenarioHint: buildScenarioHint(form),
  };
}

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [expandedMethods, setExpandedMethods] = useState({});
  const [showTheory, setShowTheory] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const result = useMemo(() => recommendationEngine(form), [form]);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMethodDetails = (methodName) => {
    setExpandedMethods((prev) => ({
      ...prev,
      [methodName]: !prev[methodName],
    }));
  };

  const resetResultsVisibility = () => {
    setExpandedMethods({});
    setShowTheory(false);
    setShowAdditional(false);
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1>Интеллектуальный подбор методов UX-исследований</h1>
      </header>

      <section className="card">
        <h2>Пошаговый выбор параметров исследования</h2>

        <label>Шаг 1: На каком этапе находится продукт?</label>
        <select value={form.stage} onChange={(e) => updateForm("stage", e.target.value)}>
          {QUESTION_OPTIONS.stage.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label>Шаг 2: Что вы хотите узнать?</label>
        <select value={form.goal} onChange={(e) => updateForm("goal", e.target.value)}>
          <option value="проблемы">Выявить проблемы интерфейса</option>
          <option value="поведение">Анализ поведения пользователя</option>
          <option value="удобство">Оценка удобства (usability)</option>
          <option value="сравнение">Сравнение вариантов (A/B)</option>
          <option value="мнение">Сбор субъективного мнения</option>
          <option value="понимание">Понимание структуры и навигации</option>
        </select>

        <label>Шаг 3: Какие данные вам нужны?</label>
        <select value={form.dataType} onChange={(e) => updateForm("dataType", e.target.value)}>
          {QUESTION_OPTIONS.dataType.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label>Шаг 4: Есть ли доступ к пользователям?</label>
        <select
          value={form.usersAccess}
          onChange={(e) => updateForm("usersAccess", e.target.value)}
        >
          {QUESTION_OPTIONS.usersAccess.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label>Шаг 5: Какие у вас ресурсы?</label>
        <select value={form.resources} onChange={(e) => updateForm("resources", e.target.value)}>
          {QUESTION_OPTIONS.resources.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label>Шаг 6: В каких условиях будет проходить исследование?</label>
        <select value={form.context} onChange={(e) => updateForm("context", e.target.value)}>
          {QUESTION_OPTIONS.context.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <div className="buttons-row">
          <button
            className="primary"
            onClick={() => {
              resetResultsVisibility();
              setSubmitted(true);
            }}
          >
            Сформировать рекомендации
          </button>
        </div>
      </section>

      {submitted && (
        <>
          <section className="card">
            <h2>Вам подходят методы:</h2>

            <div className="method-grid">
              {result.topMethods.map((method) => (
                <article className="method-card" key={method.name}>
                  <h3>{method.name}</h3>
                  <p className="method-one-line">{method.whatItGives}</p>
                  <div className="method-tags">
                    <span className="tag">{method.dataType}</span>
                    <span className="tag">
                      {method.requiresUsers ? "нужны пользователи" : "без пользователей"}
                    </span>
                    <span className="tag">{method.resources} ресурсы</span>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => toggleMethodDetails(method.name)}
                  >
                    {expandedMethods[method.name]
                      ? "Скрыть подробности"
                      : "Показать подробнее"}
                  </button>

                  <div
                    className={`method-details ${expandedMethods[method.name] ? "open" : ""}`}
                  >
                    <p>
                      <strong>Описание:</strong> {method.description}
                    </p>
                    <p>
                      <strong>Когда использовать:</strong> {method.when}
                    </p>
                    <div>
                      <strong>Плюсы:</strong>
                      <ul className="mini-list">
                        {method.strengths.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Минусы:</strong>
                      <ul className="mini-list">
                        {method.weaknesses.slice(0, 2).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <p>
                      <strong>Этап:</strong> {method.stage.join(", ")}
                    </p>
                    <div className="howto-block">
                      <p>
                        <strong>Почему подходит вам:</strong>
                      </p>
                      <ul className="fit-list">
                        {buildFitReasons(method, form).map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Почему выбраны</h2>
            {result.shortWhy.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="notice-text">{result.scenarioHint}</p>
          </section>

          <section className="card">
            <button
              type="button"
              className="secondary"
              onClick={() => setShowTheory((prev) => !prev)}
            >
              {showTheory
                ? "Скрыть обоснование"
                : "Показать обоснование"}
            </button>

            {showTheory && (
              <div className="hero-card theory-block">
                {result.explanation.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <button
              type="button"
              className="secondary"
              onClick={() => setShowAdditional((prev) => !prev)}
            >
              {showAdditional
                ? "Скрыть дополнительные методы"
                : `Дополнительно можно использовать (${result.additionalMethods.length})`}
            </button>

            {showAdditional && (
              <div className="additional-grid">
                {result.additionalMethods.map((method) => (
                  <article key={method.name} className="additional-card">
                    <h3>{method.name}</h3>
                    <p className="method-one-line">{method.description}</p>
                    <div className="method-tags">
                      <span className="tag">{method.dataType}</span>
                      <span className="tag">{method.resources} ресурсы</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
