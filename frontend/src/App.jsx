import { useEffect, useMemo, useState } from "react";

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

function recommendationEngine(form, methods) {
  const scoredMethods = methods.map((method) => ({
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
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [expandedMethods, setExpandedMethods] = useState({});
  const [showTheory, setShowTheory] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMethods = async () => {
      try {
        const response = await fetch("/data/methods.json");
        if (!response.ok) {
          throw new Error("Failed to load methods");
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid methods format");
        }

        if (mounted) {
          setMethods(data);
          setError(null);
          setLoading(false);
        }
      } catch (fetchError) {
        if (mounted) {
          setMethods([]);
          setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
          setLoading(false);
        }
      }
    };

    loadMethods();

    return () => {
      mounted = false;
    };
  }, []);

  const result = useMemo(() => recommendationEngine(form, methods), [form, methods]);

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

  if (loading) {
    return <div>Загрузка методов...</div>;
  }

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
