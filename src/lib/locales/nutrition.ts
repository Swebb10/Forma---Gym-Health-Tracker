export const nutritionCatalogs: Record<string, Record<string, string>> = {
  en: {
    Nutrición: "Nutrition",
    "Ganar masa muscular (Volumen)": "Build muscle (Bulk)",
    "Recomposición corporal": "Body recomposition",
    "Perder grasa (Definición)": "Lose fat (Cut)",
    "Mantener peso": "Maintain weight",
    "Baja · trabajo sentado, poco movimiento":
      "Low · desk work, little movement",
    "Ligera · algo de movimiento y 1–3 sesiones/semana":
      "Light · some movement and 1–3 sessions/week",
    "Moderada · movimiento diario y 3–5 sesiones/semana":
      "Moderate · daily movement and 3–5 sessions/week",
    "Alta · trabajo activo o entrenamiento intenso frecuente":
      "High · active job or frequent intense training",
    "Completa edad, altura, peso y sexo para calcular tus metas.":
      "Enter age, height, weight and sex to calculate your targets.",
    "Revisa los datos: edad válida, altura de 100–250 cm y peso de 30–300 kg.":
      "Check your data: valid age, height 100–250 cm and weight 30–300 kg.",
    "Este cálculo general no se aplica a menores de 18 años, mayores de 100, embarazo, lactancia ni dietas médicas. Consulta a tu nutricionista.":
      "This general calculation does not apply under 18, over 100, during pregnancy or breastfeeding, or to medical diets. Consult your dietitian.",
    "Selecciona un objetivo y un nivel de actividad válidos.":
      "Select a valid goal and activity level.",
    "Con estos datos no proponemos un déficit calórico. Revisa tu objetivo con un profesional.":
      "We do not suggest a calorie deficit with these measurements. Review your goal with a professional.",
    "La estimación queda fuera del rango de esta guía (1200–6000 kcal). Necesitas una valoración individual.":
      "The estimate falls outside this guide’s range (1200–6000 kcal). You need an individual assessment.",
    "No se pudo obtener una distribución válida. Revisa tus datos.":
      "A valid distribution could not be calculated. Check your data.",
    Proteínas: "Protein",
    Carbohidratos: "Carbohydrates",
    Grasas: "Fat",
    "Huevo grande": "Large egg",
    "1 unidad · unos 50 g, sin aceite añadido":
      "1 egg · about 50 g, no added oil",
    "Atún en aceite, escurrido": "Tuna in oil, drained",
    "100 g escurridos · revisa el peso real de tu lata":
      "100 g drained · check your can’s actual drained weight",
    "Pechuga de pollo cocida": "Cooked chicken breast",
    "100 g · sin piel, asada": "100 g · skinless, roasted",
    "Arroz blanco cocido": "Cooked white rice",
    "1 taza · unos 158 g": "1 cup · about 158 g",
    "Frijoles negros cocidos": "Cooked black beans",
    "½ taza · sin grasa añadida": "½ cup · no added fat",
    "Aceite de oliva": "Olive oil",
    "1 cucharada · unos 14 g": "1 tablespoon · about 14 g",
    "No se pudo cargar tu perfil de nutrición. Revisa la conexión y las reglas de Firestore.":
      "Could not load your nutrition profile. Check your connection and Firestore rules.",
    "El perfil cambió en otra pestaña. Revisa los datos e inténtalo de nuevo.":
      "The profile changed in another tab. Review the data and try again.",
    "No se pudieron guardar las metas actualizadas. Reintenta la sincronización.":
      "Could not save the updated targets. Retry synchronization.",
    "Espera a que termine la sincronización de tus datos.":
      "Wait for your data to finish syncing.",
    "NUTRICIÓN A TU MEDIDA": "NUTRITION FOR YOU",
    "Alimenta tu progreso": "Fuel your progress",
    "Un objetivo claro. Una guía para cada día.":
      "A clear goal. A guide for every day.",
    "Objetivo y metas guardados en tu perfil.":
      "Goal and targets saved to your profile.",
    "No se pudo guardar tu objetivo. Revisa la conexión y las reglas de Firestore, y reintenta.":
      "Could not save your goal. Check your connection and Firestore rules, then retry.",
    "Tu objetivo principal": "Your main goal",
    "sobre mantenimiento": "relative to maintenance",
    "Datos para el cálculo": "Calculation inputs",
    "Origen de los datos": "Data source",
    "Última bioimpedancia · actualización automática":
      "Latest bioimpedance · automatic updates",
    "Datos manuales": "Manual data",
    "Evaluación del {0}. La edad es la registrada en esa fecha.":
      "Assessment from {0}. Age is the value recorded on that date.",
    "Aún no tienes bioimpedancia. Usa datos manuales para empezar.":
      "No bioimpedance yet. Start with manual data.",
    "Esta evaluación tiene más de 90 días. Revisa que represente tu situación actual.":
      "This assessment is over 90 days old. Check that it reflects your current situation.",
    "Edad · años": "Age · years",
    "Altura · cm": "Height · cm",
    "Sexo utilizado en la fórmula": "Sex used in the formula",
    Seleccionar: "Select",
    "La fórmula original distingue estos dos coeficientes. Confirma cuál usar; no modifica tu identidad ni tu evaluación.":
      "The original formula uses these two coefficients. Confirm which to use; your identity and assessment remain unchanged.",
    "Actividad habitual": "Usual activity",
    "Incluye trabajo, pasos y entrenamiento. No añadimos otra vez las calorías del gimnasio.":
      "Include work, steps and training. We do not add gym calories a second time.",
    "Embarazo, lactancia o una dieta indicada por un profesional por motivos médicos":
      "Pregnancy, breastfeeding or a professionally prescribed medical diet",
    "TU PUNTO DE PARTIDA": "YOUR STARTING POINT",
    "Metas diarias estimadas": "Estimated daily targets",
    "Vista previa · guarda para aplicar a tu perfil":
      "Preview · save to apply to your profile",
    "Gasto en reposo": "Resting expenditure",
    "Mantenimiento estimado": "Estimated maintenance",
    "Factor de actividad": "Activity factor",
    "Ajuste del objetivo": "Goal adjustment",
    "Es una estimación inicial para adultos, no una prescripción médica. Ajusta con tu nutricionista según tu evolución, apetito y rendimiento.":
      "This is an initial estimate for adults, not a medical prescription. Adjust with your dietitian based on progress, appetite and performance.",
    "Guardar objetivo y metas": "Save goal and targets",
    "Actualizando metas con tus últimos registros…":
      "Updating targets from your latest records…",
    "Cómo se calcula": "How it is calculated",
    "Mifflin–St Jeor: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad + coeficiente (+5 masculino, −161 femenino).":
      "Mifflin–St Jeor: 10 × weight (kg) + 6.25 × height (cm) − 5 × age + coefficient (+5 male, −161 female).",
    "Multiplicamos por tu actividad y aplicamos +10% para volumen, −5% para recomposición, −15% para definición o 0% para mantenimiento. Son ajustes iniciales de la app, no parte de la fórmula original.":
      "We multiply by activity and apply +10% for bulking, −5% for recomposition, −15% for cutting or 0% for maintenance. These are initial app adjustments, not part of the original formula.",
    "Proteínas: 1,6–2 g/kg según el objetivo, limitadas al 35% de las calorías. Grasas: 30%. Carbohidratos: calorías restantes. El redondeo puede producir pequeñas diferencias.":
      "Protein: 1.6–2 g/kg by goal, capped at 35% of calories. Fat: 30%. Carbohydrates: remaining calories. Rounding may cause small differences.",
    "Tu contexto corporal": "Your body context",
    "Las medidas y la bioimpedancia ayudan a seguir tu evolución. No alteran la ecuación Mifflin–St Jeor ni sustituyen una evaluación profesional.":
      "Measurements and bioimpedance help track your progress. They do not change the Mifflin–St Jeor equation or replace a professional assessment.",
    "Bioimpedancia del {0}": "Bioimpedance from {0}",
    "Sin bioimpedancia registrada": "No bioimpedance recorded",
    "Medidas corporales del {0}": "Body measurements from {0}",
    "Sin medidas corporales registradas": "No body measurements recorded",
    "DEL NÚMERO AL PLATO": "FROM NUMBERS TO YOUR PLATE",
    "Macro-Guía": "Macro Guide",
    "Porciones de referencia, sin complicaciones.":
      "Reference portions, made simple.",
    "Buscar alimento": "Search foods",
    "Filtrar nutriente": "Filter by nutrient",
    Todos: "All",
    "No hay alimentos que coincidan.": "No matching foods.",
    "Se destaca un nutriente, no la composición completa. Las marcas, el tamaño y la preparación cambian los valores. En un huevo revuelto cuenta también el aceite, la mantequilla o la leche; en el atún usa el peso escurrido y la etiqueta de tu lata.":
      "One nutrient is highlighted, not the full composition. Brand, size and preparation affect values. Count oil, butter or milk in scrambled eggs; for tuna use the drained weight and your can’s label.",
    Calorías: "Calories",
    "Ver nutrición": "View nutrition",
    "Revisa tus datos para obtener una estimación.":
      "Review your data to get an estimate.",
    "Elige tu objetivo para estimar tus calorías y macronutrientes diarios.":
      "Choose your goal to estimate daily calories and macronutrients.",
  },
  de: {
    Nutrición: "Ernährung",
    "Ganar masa muscular (Volumen)": "Muskelaufbau",
    "Recomposición corporal": "Körperrekomposition",
    "Perder grasa (Definición)": "Fettabbau",
    "Mantener peso": "Gewicht halten",
    "Baja · trabajo sentado, poco movimiento":
      "Gering · sitzende Arbeit, wenig Bewegung",
    "Ligera · algo de movimiento y 1–3 sesiones/semana":
      "Leicht · etwas Bewegung und 1–3 Einheiten/Woche",
    "Moderada · movimiento diario y 3–5 sesiones/semana":
      "Moderat · tägliche Bewegung und 3–5 Einheiten/Woche",
    "Alta · trabajo activo o entrenamiento intenso frecuente":
      "Hoch · aktive Arbeit oder häufiges intensives Training",
    "Completa edad, altura, peso y sexo para calcular tus metas.":
      "Gib Alter, Größe, Gewicht und Geschlecht für die Berechnung ein.",
    "Revisa los datos: edad válida, altura de 100–250 cm y peso de 30–300 kg.":
      "Prüfe die Daten: gültiges Alter, Größe 100–250 cm, Gewicht 30–300 kg.",
    "Este cálculo general no se aplica a menores de 18 años, mayores de 100, embarazo, lactancia ni dietas médicas. Consulta a tu nutricionista.":
      "Diese allgemeine Berechnung gilt nicht unter 18, über 100, in Schwangerschaft oder Stillzeit oder bei medizinischen Diäten. Hole Ernährungsberatung ein.",
    "Selecciona un objetivo y un nivel de actividad válidos.":
      "Wähle ein gültiges Ziel und Aktivitätsniveau.",
    "Con estos datos no proponemos un déficit calórico. Revisa tu objetivo con un profesional.":
      "Bei diesen Werten empfehlen wir kein Kaloriendefizit. Besprich dein Ziel mit einer Fachkraft.",
    "La estimación queda fuera del rango de esta guía (1200–6000 kcal). Necesitas una valoración individual.":
      "Die Schätzung liegt außerhalb dieses Leitfadens (1200–6000 kcal). Eine individuelle Einschätzung ist nötig.",
    "No se pudo obtener una distribución válida. Revisa tus datos.":
      "Keine gültige Verteilung möglich. Prüfe deine Daten.",
    Proteínas: "Protein",
    Carbohidratos: "Kohlenhydrate",
    Grasas: "Fette",
    "Huevo grande": "Großes Ei",
    "1 unidad · unos 50 g, sin aceite añadido":
      "1 Ei · etwa 50 g, ohne zusätzliches Öl",
    "Atún en aceite, escurrido": "Thunfisch in Öl, abgetropft",
    "100 g escurridos · revisa el peso real de tu lata":
      "100 g abgetropft · prüfe das tatsächliche Abtropfgewicht",
    "Pechuga de pollo cocida": "Gegarte Hähnchenbrust",
    "100 g · sin piel, asada": "100 g · ohne Haut, gebraten",
    "Arroz blanco cocido": "Gekochter weißer Reis",
    "1 taza · unos 158 g": "1 Tasse · etwa 158 g",
    "Frijoles negros cocidos": "Gekochte schwarze Bohnen",
    "½ taza · sin grasa añadida": "½ Tasse · ohne zusätzliches Fett",
    "Aceite de oliva": "Olivenöl",
    "1 cucharada · unos 14 g": "1 Esslöffel · etwa 14 g",
    "No se pudo cargar tu perfil de nutrición. Revisa la conexión y las reglas de Firestore.":
      "Dein Ernährungsprofil konnte nicht geladen werden. Prüfe Verbindung und Firestore-Regeln.",
    "El perfil cambió en otra pestaña. Revisa los datos e inténtalo de nuevo.":
      "Das Profil wurde in einem anderen Tab geändert. Prüfe die Daten und versuche es erneut.",
    "No se pudieron guardar las metas actualizadas. Reintenta la sincronización.":
      "Die aktualisierten Ziele konnten nicht gespeichert werden. Starte die Synchronisierung erneut.",
    "Espera a que termine la sincronización de tus datos.":
      "Warte, bis deine Daten synchronisiert sind.",
    "NUTRICIÓN A TU MEDIDA": "ERNÄHRUNG FÜR DICH",
    "Alimenta tu progreso": "Ernähre deinen Fortschritt",
    "Un objetivo claro. Una guía para cada día.":
      "Ein klares Ziel. Orientierung für jeden Tag.",
    "Objetivo y metas guardados en tu perfil.":
      "Ziel und Richtwerte in deinem Profil gespeichert.",
    "No se pudo guardar tu objetivo. Revisa la conexión y las reglas de Firestore, y reintenta.":
      "Dein Ziel konnte nicht gespeichert werden. Prüfe Verbindung und Firestore-Regeln und versuche es erneut.",
    "Tu objetivo principal": "Dein Hauptziel",
    "sobre mantenimiento": "gegenüber Erhaltung",
    "Datos para el cálculo": "Daten für die Berechnung",
    "Origen de los datos": "Datenquelle",
    "Última bioimpedancia · actualización automática":
      "Neueste Bioimpedanz · automatische Aktualisierung",
    "Datos manuales": "Manuelle Daten",
    "Evaluación del {0}. La edad es la registrada en esa fecha.":
      "Messung vom {0}. Das Alter entspricht der Angabe an diesem Datum.",
    "Aún no tienes bioimpedancia. Usa datos manuales para empezar.":
      "Noch keine Bioimpedanz. Beginne mit manuellen Angaben.",
    "Esta evaluación tiene más de 90 días. Revisa que represente tu situación actual.":
      "Diese Messung ist älter als 90 Tage. Prüfe, ob sie noch aktuell ist.",
    "Edad · años": "Alter · Jahre",
    "Altura · cm": "Größe · cm",
    "Sexo utilizado en la fórmula": "Geschlecht für die Formel",
    Seleccionar: "Auswählen",
    "La fórmula original distingue estos dos coeficientes. Confirma cuál usar; no modifica tu identidad ni tu evaluación.":
      "Die Originalformel verwendet diese zwei Koeffizienten. Bestätige die Auswahl; deine Identität und Messung bleiben unverändert.",
    "Actividad habitual": "Übliche Aktivität",
    "Incluye trabajo, pasos y entrenamiento. No añadimos otra vez las calorías del gimnasio.":
      "Berücksichtige Arbeit, Schritte und Training. Trainingskalorien werden nicht doppelt gezählt.",
    "Embarazo, lactancia o una dieta indicada por un profesional por motivos médicos":
      "Schwangerschaft, Stillzeit oder eine medizinisch verordnete Diät",
    "TU PUNTO DE PARTIDA": "DEIN AUSGANGSPUNKT",
    "Metas diarias estimadas": "Geschätzte Tagesziele",
    "Vista previa · guarda para aplicar a tu perfil":
      "Vorschau · speichern, um das Profil zu aktualisieren",
    "Gasto en reposo": "Ruheenergiebedarf",
    "Mantenimiento estimado": "Geschätzter Erhaltungsbedarf",
    "Factor de actividad": "Aktivitätsfaktor",
    "Ajuste del objetivo": "Zielanpassung",
    "Es una estimación inicial para adultos, no una prescripción médica. Ajusta con tu nutricionista según tu evolución, apetito y rendimiento.":
      "Dies ist eine erste Schätzung für Erwachsene, keine ärztliche Verordnung. Passe sie mit einer Ernährungsfachkraft an Fortschritt, Appetit und Leistung an.",
    "Guardar objetivo y metas": "Ziel und Werte speichern",
    "Actualizando metas con tus últimos registros…":
      "Ziele werden mit deinen neuesten Daten aktualisiert…",
    "Cómo se calcula": "So wird gerechnet",
    "Mifflin–St Jeor: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad + coeficiente (+5 masculino, −161 femenino).":
      "Mifflin–St Jeor: 10 × Gewicht (kg) + 6,25 × Größe (cm) − 5 × Alter + Koeffizient (+5 männlich, −161 weiblich).",
    "Multiplicamos por tu actividad y aplicamos +10% para volumen, −5% para recomposición, −15% para definición o 0% para mantenimiento. Son ajustes iniciales de la app, no parte de la fórmula original.":
      "Wir multiplizieren mit der Aktivität und wenden +10% für Aufbau, −5% für Rekomposition, −15% für Fettabbau oder 0% für Erhaltung an. Dies sind Startwerte der App, kein Teil der Originalformel.",
    "Proteínas: 1,6–2 g/kg según el objetivo, limitadas al 35% de las calorías. Grasas: 30%. Carbohidratos: calorías restantes. El redondeo puede producir pequeñas diferencias.":
      "Protein: 1,6–2 g/kg je nach Ziel, maximal 35% der Kalorien. Fett: 30%. Kohlenhydrate: übrige Kalorien. Rundungen können kleine Abweichungen verursachen.",
    "Tu contexto corporal": "Deine Körperdaten",
    "Las medidas y la bioimpedancia ayudan a seguir tu evolución. No alteran la ecuación Mifflin–St Jeor ni sustituyen una evaluación profesional.":
      "Maße und Bioimpedanz helfen, deine Entwicklung zu verfolgen. Sie ändern die Mifflin–St-Jeor-Gleichung nicht und ersetzen keine fachliche Beurteilung.",
    "Bioimpedancia del {0}": "Bioimpedanz vom {0}",
    "Sin bioimpedancia registrada": "Keine Bioimpedanz erfasst",
    "Medidas corporales del {0}": "Körpermaße vom {0}",
    "Sin medidas corporales registradas": "Keine Körpermaße erfasst",
    "DEL NÚMERO AL PLATO": "VON ZAHLEN AUF DEN TELLER",
    "Macro-Guía": "Makro-Leitfaden",
    "Porciones de referencia, sin complicaciones.":
      "Referenzportionen, einfach erklärt.",
    "Buscar alimento": "Lebensmittel suchen",
    "Filtrar nutriente": "Nach Nährstoff filtern",
    Todos: "Alle",
    "No hay alimentos que coincidan.": "Keine passenden Lebensmittel.",
    "Se destaca un nutriente, no la composición completa. Las marcas, el tamaño y la preparación cambian los valores. En un huevo revuelto cuenta también el aceite, la mantequilla o la leche; en el atún usa el peso escurrido y la etiqueta de tu lata.":
      "Ein Nährstoff wird hervorgehoben, nicht die gesamte Zusammensetzung. Marke, Größe und Zubereitung verändern die Werte. Bei Rührei auch Öl, Butter oder Milch einrechnen; bei Thunfisch Abtropfgewicht und Etikett beachten.",
    Calorías: "Kalorien",
    "Ver nutrición": "Ernährung ansehen",
    "Revisa tus datos para obtener una estimación.":
      "Prüfe deine Daten für eine Schätzung.",
    "Elige tu objetivo para estimar tus calorías y macronutrientes diarios.":
      "Wähle dein Ziel, um tägliche Kalorien und Makros zu schätzen.",
  },
  ru: {
    Nutrición: "Питание",
    "Ganar masa muscular (Volumen)": "Набор мышечной массы",
    "Recomposición corporal": "Рекомпозиция тела",
    "Perder grasa (Definición)": "Снижение жировой массы",
    "Mantener peso": "Поддержание веса",
    "Baja · trabajo sentado, poco movimiento":
      "Низкая · сидячая работа, мало движения",
    "Ligera · algo de movimiento y 1–3 sesiones/semana":
      "Лёгкая · немного движения и 1–3 тренировки в неделю",
    "Moderada · movimiento diario y 3–5 sesiones/semana":
      "Умеренная · ежедневное движение и 3–5 тренировок в неделю",
    "Alta · trabajo activo o entrenamiento intenso frecuente":
      "Высокая · активная работа или частые интенсивные тренировки",
    "Completa edad, altura, peso y sexo para calcular tus metas.":
      "Укажите возраст, рост, вес и пол для расчёта целей.",
    "Revisa los datos: edad válida, altura de 100–250 cm y peso de 30–300 kg.":
      "Проверьте данные: корректный возраст, рост 100–250 см, вес 30–300 кг.",
    "Este cálculo general no se aplica a menores de 18 años, mayores de 100, embarazo, lactancia ni dietas médicas. Consulta a tu nutricionista.":
      "Этот общий расчёт не подходит до 18 или после 100 лет, при беременности, кормлении грудью и лечебных диетах. Обратитесь к диетологу.",
    "Selecciona un objetivo y un nivel de actividad válidos.":
      "Выберите корректную цель и уровень активности.",
    "Con estos datos no proponemos un déficit calórico. Revisa tu objetivo con un profesional.":
      "При этих данных мы не предлагаем дефицит калорий. Обсудите цель со специалистом.",
    "La estimación queda fuera del rango de esta guía (1200–6000 kcal). Necesitas una valoración individual.":
      "Оценка вне диапазона этого руководства (1200–6000 ккал). Нужна индивидуальная оценка.",
    "No se pudo obtener una distribución válida. Revisa tus datos.":
      "Не удалось рассчитать распределение. Проверьте данные.",
    Proteínas: "Белки",
    Carbohidratos: "Углеводы",
    Grasas: "Жиры",
    "Huevo grande": "Крупное яйцо",
    "1 unidad · unos 50 g, sin aceite añadido":
      "1 шт. · около 50 г, без добавленного масла",
    "Atún en aceite, escurrido": "Тунец в масле, без жидкости",
    "100 g escurridos · revisa el peso real de tu lata":
      "100 г без жидкости · проверьте массу на банке",
    "Pechuga de pollo cocida": "Готовая куриная грудка",
    "100 g · sin piel, asada": "100 г · без кожи, запечённая",
    "Arroz blanco cocido": "Варёный белый рис",
    "1 taza · unos 158 g": "1 чашка · около 158 г",
    "Frijoles negros cocidos": "Варёная чёрная фасоль",
    "½ taza · sin grasa añadida": "½ чашки · без добавленного жира",
    "Aceite de oliva": "Оливковое масло",
    "1 cucharada · unos 14 g": "1 столовая ложка · около 14 г",
    "No se pudo cargar tu perfil de nutrición. Revisa la conexión y las reglas de Firestore.":
      "Не удалось загрузить профиль питания. Проверьте соединение и правила Firestore.",
    "El perfil cambió en otra pestaña. Revisa los datos e inténtalo de nuevo.":
      "Профиль изменён в другой вкладке. Проверьте данные и повторите попытку.",
    "No se pudieron guardar las metas actualizadas. Reintenta la sincronización.":
      "Не удалось сохранить обновлённые цели. Повторите синхронизацию.",
    "Espera a que termine la sincronización de tus datos.":
      "Дождитесь завершения синхронизации данных.",
    "NUTRICIÓN A TU MEDIDA": "ПИТАНИЕ ДЛЯ ВАС",
    "Alimenta tu progreso": "Питание для прогресса",
    "Un objetivo claro. Una guía para cada día.":
      "Ясная цель. Ориентир на каждый день.",
    "Objetivo y metas guardados en tu perfil.":
      "Цель и нормы сохранены в профиле.",
    "No se pudo guardar tu objetivo. Revisa la conexión y las reglas de Firestore, y reintenta.":
      "Не удалось сохранить цель. Проверьте соединение и правила Firestore и повторите попытку.",
    "Tu objetivo principal": "Ваша основная цель",
    "sobre mantenimiento": "от уровня поддержания",
    "Datos para el cálculo": "Данные для расчёта",
    "Origen de los datos": "Источник данных",
    "Última bioimpedancia · actualización automática":
      "Последняя биоимпедансная оценка · автообновление",
    "Datos manuales": "Ручной ввод",
    "Evaluación del {0}. La edad es la registrada en esa fecha.":
      "Оценка от {0}. Возраст указан на дату измерения.",
    "Aún no tienes bioimpedancia. Usa datos manuales para empezar.":
      "Биоимпедансных данных пока нет. Начните с ручного ввода.",
    "Esta evaluación tiene más de 90 días. Revisa que represente tu situación actual.":
      "Этой оценке более 90 дней. Проверьте, отражает ли она текущее состояние.",
    "Edad · años": "Возраст · лет",
    "Altura · cm": "Рост · см",
    "Sexo utilizado en la fórmula": "Пол для формулы",
    Seleccionar: "Выберите",
    "La fórmula original distingue estos dos coeficientes. Confirma cuál usar; no modifica tu identidad ni tu evaluación.":
      "Исходная формула использует два коэффициента. Подтвердите выбор; ваши личные данные и оценка не изменятся.",
    "Actividad habitual": "Обычная активность",
    "Incluye trabajo, pasos y entrenamiento. No añadimos otra vez las calorías del gimnasio.":
      "Учитывайте работу, шаги и тренировки. Калории тренировок повторно не прибавляются.",
    "Embarazo, lactancia o una dieta indicada por un profesional por motivos médicos":
      "Беременность, кормление грудью или лечебная диета, назначенная специалистом",
    "TU PUNTO DE PARTIDA": "ВАША ОТПРАВНАЯ ТОЧКА",
    "Metas diarias estimadas": "Расчётные суточные нормы",
    "Vista previa · guarda para aplicar a tu perfil":
      "Предпросмотр · сохраните для применения к профилю",
    "Gasto en reposo": "Расход в покое",
    "Mantenimiento estimado": "Расчётный уровень поддержания",
    "Factor de actividad": "Коэффициент активности",
    "Ajuste del objetivo": "Поправка на цель",
    "Es una estimación inicial para adultos, no una prescripción médica. Ajusta con tu nutricionista según tu evolución, apetito y rendimiento.":
      "Это исходная оценка для взрослых, не медицинское назначение. Корректируйте её с диетологом с учётом прогресса, аппетита и результатов.",
    "Guardar objetivo y metas": "Сохранить цель и нормы",
    "Actualizando metas con tus últimos registros…":
      "Обновление норм по последним записям…",
    "Cómo se calcula": "Как выполняется расчёт",
    "Mifflin–St Jeor: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad + coeficiente (+5 masculino, −161 femenino).":
      "Миффлин–Сан Жеор: 10 × вес (кг) + 6,25 × рост (см) − 5 × возраст + коэффициент (+5 мужской, −161 женский).",
    "Multiplicamos por tu actividad y aplicamos +10% para volumen, −5% para recomposición, −15% para definición o 0% para mantenimiento. Son ajustes iniciales de la app, no parte de la fórmula original.":
      "Умножаем на активность и применяем +10% для набора, −5% для рекомпозиции, −15% для снижения жира или 0% для поддержания. Это стартовые настройки приложения, не часть исходной формулы.",
    "Proteínas: 1,6–2 g/kg según el objetivo, limitadas al 35% de las calorías. Grasas: 30%. Carbohidratos: calorías restantes. El redondeo puede producir pequeñas diferencias.":
      "Белки: 1,6–2 г/кг по цели, максимум 35% калорий. Жиры: 30%. Углеводы: оставшиеся калории. Округление может давать небольшие расхождения.",
    "Tu contexto corporal": "Показатели вашего тела",
    "Las medidas y la bioimpedancia ayudan a seguir tu evolución. No alteran la ecuación Mifflin–St Jeor ni sustituyen una evaluación profesional.":
      "Замеры и биоимпеданс помогают отслеживать прогресс. Они не изменяют формулу Миффлина–Сан Жеора и не заменяют оценку специалиста.",
    "Bioimpedancia del {0}": "Биоимпеданс от {0}",
    "Sin bioimpedancia registrada": "Биоимпеданс не записан",
    "Medidas corporales del {0}": "Замеры тела от {0}",
    "Sin medidas corporales registradas": "Замеры тела не записаны",
    "DEL NÚMERO AL PLATO": "ОТ ЦИФР К ТАРЕЛКЕ",
    "Macro-Guía": "Гид по макронутриентам",
    "Porciones de referencia, sin complicaciones.": "Понятные примеры порций.",
    "Buscar alimento": "Найти продукт",
    "Filtrar nutriente": "Фильтр по нутриенту",
    Todos: "Все",
    "No hay alimentos que coincidan.": "Подходящие продукты не найдены.",
    "Se destaca un nutriente, no la composición completa. Las marcas, el tamaño y la preparación cambian los valores. En un huevo revuelto cuenta también el aceite, la mantequilla o la leche; en el atún usa el peso escurrido y la etiqueta de tu lata.":
      "Показан один нутриент, не весь состав. Значения зависят от марки, размера и приготовления. Для яичницы учитывайте масло и молоко; для тунца — массу без жидкости и этикетку банки.",
    Calorías: "Калории",
    "Ver nutrición": "Открыть питание",
    "Revisa tus datos para obtener una estimación.":
      "Проверьте данные для расчёта.",
    "Elige tu objetivo para estimar tus calorías y macronutrientes diarios.":
      "Выберите цель для расчёта суточных калорий и макронутриентов.",
  },
  pt: {
    Nutrición: "Nutrição",
    "Ganar masa muscular (Volumen)": "Ganhar massa muscular (Volume)",
    "Recomposición corporal": "Recomposição corporal",
    "Perder grasa (Definición)": "Perder gordura (Definição)",
    "Mantener peso": "Manter o peso",
    "Baja · trabajo sentado, poco movimiento":
      "Baixa · trabalho sentado, pouco movimento",
    "Ligera · algo de movimiento y 1–3 sesiones/semana":
      "Leve · algum movimento e 1–3 sessões/semana",
    "Moderada · movimiento diario y 3–5 sesiones/semana":
      "Moderada · movimento diário e 3–5 sessões/semana",
    "Alta · trabajo activo o entrenamiento intenso frecuente":
      "Alta · trabalho ativo ou treino intenso frequente",
    "Completa edad, altura, peso y sexo para calcular tus metas.":
      "Preencha idade, altura, peso e sexo para calcular suas metas.",
    "Revisa los datos: edad válida, altura de 100–250 cm y peso de 30–300 kg.":
      "Revise os dados: idade válida, altura de 100–250 cm e peso de 30–300 kg.",
    "Este cálculo general no se aplica a menores de 18 años, mayores de 100, embarazo, lactancia ni dietas médicas. Consulta a tu nutricionista.":
      "Este cálculo geral não se aplica a menores de 18, maiores de 100, gestação, amamentação ou dietas médicas. Consulte seu nutricionista.",
    "Selecciona un objetivo y un nivel de actividad válidos.":
      "Selecione um objetivo e um nível de atividade válidos.",
    "Con estos datos no proponemos un déficit calórico. Revisa tu objetivo con un profesional.":
      "Com esses dados, não sugerimos déficit calórico. Revise seu objetivo com um profissional.",
    "La estimación queda fuera del rango de esta guía (1200–6000 kcal). Necesitas una valoración individual.":
      "A estimativa está fora do intervalo deste guia (1200–6000 kcal). Você precisa de avaliação individual.",
    "No se pudo obtener una distribución válida. Revisa tus datos.":
      "Não foi possível calcular uma distribuição válida. Revise seus dados.",
    Proteínas: "Proteínas",
    Carbohidratos: "Carboidratos",
    Grasas: "Gorduras",
    "Huevo grande": "Ovo grande",
    "1 unidad · unos 50 g, sin aceite añadido":
      "1 unidade · cerca de 50 g, sem óleo adicionado",
    "Atún en aceite, escurrido": "Atum em óleo, escorrido",
    "100 g escurridos · revisa el peso real de tu lata":
      "100 g escorridos · confira o peso real da lata",
    "Pechuga de pollo cocida": "Peito de frango cozido",
    "100 g · sin piel, asada": "100 g · sem pele, assado",
    "Arroz blanco cocido": "Arroz branco cozido",
    "1 taza · unos 158 g": "1 xícara · cerca de 158 g",
    "Frijoles negros cocidos": "Feijão preto cozido",
    "½ taza · sin grasa añadida": "½ xícara · sem gordura adicionada",
    "Aceite de oliva": "Azeite de oliva",
    "1 cucharada · unos 14 g": "1 colher de sopa · cerca de 14 g",
    "No se pudo cargar tu perfil de nutrición. Revisa la conexión y las reglas de Firestore.":
      "Não foi possível carregar seu perfil de nutrição. Verifique a conexão e as regras do Firestore.",
    "El perfil cambió en otra pestaña. Revisa los datos e inténtalo de nuevo.":
      "O perfil mudou em outra aba. Revise os dados e tente novamente.",
    "No se pudieron guardar las metas actualizadas. Reintenta la sincronización.":
      "Não foi possível salvar as metas atualizadas. Tente sincronizar novamente.",
    "Espera a que termine la sincronización de tus datos.":
      "Aguarde a sincronização dos dados terminar.",
    "NUTRICIÓN A TU MEDIDA": "NUTRIÇÃO PARA VOCÊ",
    "Alimenta tu progreso": "Alimente seu progresso",
    "Un objetivo claro. Una guía para cada día.":
      "Um objetivo claro. Um guia para cada dia.",
    "Objetivo y metas guardados en tu perfil.":
      "Objetivo e metas salvos no seu perfil.",
    "No se pudo guardar tu objetivo. Revisa la conexión y las reglas de Firestore, y reintenta.":
      "Não foi possível salvar seu objetivo. Verifique a conexão e as regras do Firestore e tente novamente.",
    "Tu objetivo principal": "Seu objetivo principal",
    "sobre mantenimiento": "em relação à manutenção",
    "Datos para el cálculo": "Dados para o cálculo",
    "Origen de los datos": "Origem dos dados",
    "Última bioimpedancia · actualización automática":
      "Última bioimpedância · atualização automática",
    "Datos manuales": "Dados manuais",
    "Evaluación del {0}. La edad es la registrada en esa fecha.":
      "Avaliação de {0}. A idade é a registrada nessa data.",
    "Aún no tienes bioimpedancia. Usa datos manuales para empezar.":
      "Ainda não há bioimpedância. Use dados manuais para começar.",
    "Esta evaluación tiene más de 90 días. Revisa que represente tu situación actual.":
      "Esta avaliação tem mais de 90 dias. Confira se representa sua situação atual.",
    "Edad · años": "Idade · anos",
    "Altura · cm": "Altura · cm",
    "Sexo utilizado en la fórmula": "Sexo usado na fórmula",
    Seleccionar: "Selecionar",
    "La fórmula original distingue estos dos coeficientes. Confirma cuál usar; no modifica tu identidad ni tu evaluación.":
      "A fórmula original usa estes dois coeficientes. Confirme qual usar; sua identidade e avaliação não mudam.",
    "Actividad habitual": "Atividade habitual",
    "Incluye trabajo, pasos y entrenamiento. No añadimos otra vez las calorías del gimnasio.":
      "Inclua trabalho, passos e treino. Não somamos novamente as calorias da academia.",
    "Embarazo, lactancia o una dieta indicada por un profesional por motivos médicos":
      "Gestação, amamentação ou dieta indicada por um profissional por motivos médicos",
    "TU PUNTO DE PARTIDA": "SEU PONTO DE PARTIDA",
    "Metas diarias estimadas": "Metas diárias estimadas",
    "Vista previa · guarda para aplicar a tu perfil":
      "Prévia · salve para aplicar ao perfil",
    "Gasto en reposo": "Gasto em repouso",
    "Mantenimiento estimado": "Manutenção estimada",
    "Factor de actividad": "Fator de atividade",
    "Ajuste del objetivo": "Ajuste do objetivo",
    "Es una estimación inicial para adultos, no una prescripción médica. Ajusta con tu nutricionista según tu evolución, apetito y rendimiento.":
      "É uma estimativa inicial para adultos, não uma prescrição médica. Ajuste com seu nutricionista conforme evolução, apetite e desempenho.",
    "Guardar objetivo y metas": "Salvar objetivo e metas",
    "Actualizando metas con tus últimos registros…":
      "Atualizando metas com seus últimos registros…",
    "Cómo se calcula": "Como é calculado",
    "Mifflin–St Jeor: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad + coeficiente (+5 masculino, −161 femenino).":
      "Mifflin–St Jeor: 10 × peso (kg) + 6,25 × altura (cm) − 5 × idade + coeficiente (+5 masculino, −161 feminino).",
    "Multiplicamos por tu actividad y aplicamos +10% para volumen, −5% para recomposición, −15% para definición o 0% para mantenimiento. Son ajustes iniciales de la app, no parte de la fórmula original.":
      "Multiplicamos pela atividade e aplicamos +10% para volume, −5% para recomposição, −15% para definição ou 0% para manutenção. São ajustes iniciais do app, não parte da fórmula original.",
    "Proteínas: 1,6–2 g/kg según el objetivo, limitadas al 35% de las calorías. Grasas: 30%. Carbohidratos: calorías restantes. El redondeo puede producir pequeñas diferencias.":
      "Proteínas: 1,6–2 g/kg conforme o objetivo, limitadas a 35% das calorias. Gorduras: 30%. Carboidratos: calorias restantes. O arredondamento pode gerar pequenas diferenças.",
    "Tu contexto corporal": "Seu contexto corporal",
    "Las medidas y la bioimpedancia ayudan a seguir tu evolución. No alteran la ecuación Mifflin–St Jeor ni sustituyen una evaluación profesional.":
      "Medidas e bioimpedância ajudam a acompanhar sua evolução. Não alteram a equação de Mifflin–St Jeor nem substituem avaliação profissional.",
    "Bioimpedancia del {0}": "Bioimpedância de {0}",
    "Sin bioimpedancia registrada": "Sem bioimpedância registrada",
    "Medidas corporales del {0}": "Medidas corporais de {0}",
    "Sin medidas corporales registradas": "Sem medidas corporais registradas",
    "DEL NÚMERO AL PLATO": "DOS NÚMEROS AO PRATO",
    "Macro-Guía": "Guia de Macros",
    "Porciones de referencia, sin complicaciones.":
      "Porções de referência, sem complicação.",
    "Buscar alimento": "Buscar alimento",
    "Filtrar nutriente": "Filtrar nutriente",
    Todos: "Todos",
    "No hay alimentos que coincidan.": "Nenhum alimento encontrado.",
    "Se destaca un nutriente, no la composición completa. Las marcas, el tamaño y la preparación cambian los valores. En un huevo revuelto cuenta también el aceite, la mantequilla o la leche; en el atún usa el peso escurrido y la etiqueta de tu lata.":
      "Destacamos um nutriente, não a composição completa. Marca, tamanho e preparo alteram os valores. No ovo mexido conte também óleo, manteiga ou leite; no atum use o peso escorrido e o rótulo da lata.",
    Calorías: "Calorias",
    "Ver nutrición": "Ver nutrição",
    "Revisa tus datos para obtener una estimación.":
      "Revise seus dados para obter uma estimativa.",
    "Elige tu objetivo para estimar tus calorías y macronutrientes diarios.":
      "Escolha seu objetivo para estimar calorias e macronutrientes diários.",
  },
  fr: {
    Nutrición: "Nutrition",
    "Ganar masa muscular (Volumen)": "Prendre du muscle (Prise de masse)",
    "Recomposición corporal": "Recomposition corporelle",
    "Perder grasa (Definición)": "Perdre de la graisse (Sèche)",
    "Mantener peso": "Maintenir son poids",
    "Baja · trabajo sentado, poco movimiento":
      "Faible · travail assis, peu de mouvement",
    "Ligera · algo de movimiento y 1–3 sesiones/semana":
      "Légère · un peu de mouvement et 1–3 séances/semaine",
    "Moderada · movimiento diario y 3–5 sesiones/semana":
      "Modérée · mouvement quotidien et 3–5 séances/semaine",
    "Alta · trabajo activo o entrenamiento intenso frecuente":
      "Élevée · travail actif ou entraînement intense fréquent",
    "Completa edad, altura, peso y sexo para calcular tus metas.":
      "Renseignez l’âge, la taille, le poids et le sexe pour calculer vos objectifs.",
    "Revisa los datos: edad válida, altura de 100–250 cm y peso de 30–300 kg.":
      "Vérifiez les données : âge valide, taille de 100–250 cm et poids de 30–300 kg.",
    "Este cálculo general no se aplica a menores de 18 años, mayores de 100, embarazo, lactancia ni dietas médicas. Consulta a tu nutricionista.":
      "Ce calcul général ne convient pas avant 18 ans, après 100 ans, pendant la grossesse ou l’allaitement, ni aux régimes médicaux. Consultez votre diététicien.",
    "Selecciona un objetivo y un nivel de actividad válidos.":
      "Sélectionnez un objectif et un niveau d’activité valides.",
    "Con estos datos no proponemos un déficit calórico. Revisa tu objetivo con un profesional.":
      "Avec ces données, nous ne proposons pas de déficit calorique. Revoyez votre objectif avec un professionnel.",
    "La estimación queda fuera del rango de esta guía (1200–6000 kcal). Necesitas una valoración individual.":
      "L’estimation sort de la plage de ce guide (1200–6000 kcal). Une évaluation individuelle est nécessaire.",
    "No se pudo obtener una distribución válida. Revisa tus datos.":
      "Impossible de calculer une répartition valide. Vérifiez vos données.",
    Proteínas: "Protéines",
    Carbohidratos: "Glucides",
    Grasas: "Lipides",
    "Huevo grande": "Gros œuf",
    "1 unidad · unos 50 g, sin aceite añadido":
      "1 œuf · environ 50 g, sans huile ajoutée",
    "Atún en aceite, escurrido": "Thon à l’huile, égoutté",
    "100 g escurridos · revisa el peso real de tu lata":
      "100 g égouttés · vérifiez le poids réel de votre boîte",
    "Pechuga de pollo cocida": "Blanc de poulet cuit",
    "100 g · sin piel, asada": "100 g · sans peau, rôti",
    "Arroz blanco cocido": "Riz blanc cuit",
    "1 taza · unos 158 g": "1 tasse · environ 158 g",
    "Frijoles negros cocidos": "Haricots noirs cuits",
    "½ taza · sin grasa añadida": "½ tasse · sans matière grasse ajoutée",
    "Aceite de oliva": "Huile d’olive",
    "1 cucharada · unos 14 g": "1 cuillère à soupe · environ 14 g",
    "No se pudo cargar tu perfil de nutrición. Revisa la conexión y las reglas de Firestore.":
      "Impossible de charger votre profil nutritionnel. Vérifiez la connexion et les règles Firestore.",
    "El perfil cambió en otra pestaña. Revisa los datos e inténtalo de nuevo.":
      "Le profil a changé dans un autre onglet. Vérifiez les données et réessayez.",
    "No se pudieron guardar las metas actualizadas. Reintenta la sincronización.":
      "Impossible d’enregistrer les objectifs actualisés. Relancez la synchronisation.",
    "Espera a que termine la sincronización de tus datos.":
      "Attendez la fin de la synchronisation de vos données.",
    "NUTRICIÓN A TU MEDIDA": "VOTRE NUTRITION",
    "Alimenta tu progreso": "Nourrissez vos progrès",
    "Un objetivo claro. Una guía para cada día.":
      "Un objectif clair. Un guide au quotidien.",
    "Objetivo y metas guardados en tu perfil.":
      "Objectif et valeurs enregistrés dans votre profil.",
    "No se pudo guardar tu objetivo. Revisa la conexión y las reglas de Firestore, y reintenta.":
      "Impossible d’enregistrer votre objectif. Vérifiez la connexion et les règles Firestore, puis réessayez.",
    "Tu objetivo principal": "Votre objectif principal",
    "sobre mantenimiento": "par rapport au maintien",
    "Datos para el cálculo": "Données du calcul",
    "Origen de los datos": "Source des données",
    "Última bioimpedancia · actualización automática":
      "Dernière bioimpédance · mise à jour automatique",
    "Datos manuales": "Saisie manuelle",
    "Evaluación del {0}. La edad es la registrada en esa fecha.":
      "Évaluation du {0}. L’âge est celui enregistré à cette date.",
    "Aún no tienes bioimpedancia. Usa datos manuales para empezar.":
      "Aucune bioimpédance enregistrée. Commencez par une saisie manuelle.",
    "Esta evaluación tiene más de 90 días. Revisa que represente tu situación actual.":
      "Cette évaluation date de plus de 90 jours. Vérifiez qu’elle reflète votre situation actuelle.",
    "Edad · años": "Âge · ans",
    "Altura · cm": "Taille · cm",
    "Sexo utilizado en la fórmula": "Sexe utilisé dans la formule",
    Seleccionar: "Sélectionner",
    "La fórmula original distingue estos dos coeficientes. Confirma cuál usar; no modifica tu identidad ni tu evaluación.":
      "La formule d’origine utilise ces deux coefficients. Confirmez lequel utiliser ; votre identité et votre évaluation restent inchangées.",
    "Actividad habitual": "Activité habituelle",
    "Incluye trabajo, pasos y entrenamiento. No añadimos otra vez las calorías del gimnasio.":
      "Incluez le travail, les pas et l’entraînement. Les calories de la salle ne sont pas comptées deux fois.",
    "Embarazo, lactancia o una dieta indicada por un profesional por motivos médicos":
      "Grossesse, allaitement ou régime prescrit pour raisons médicales",
    "TU PUNTO DE PARTIDA": "VOTRE POINT DE DÉPART",
    "Metas diarias estimadas": "Objectifs quotidiens estimés",
    "Vista previa · guarda para aplicar a tu perfil":
      "Aperçu · enregistrez pour appliquer au profil",
    "Gasto en reposo": "Dépense au repos",
    "Mantenimiento estimado": "Maintien estimé",
    "Factor de actividad": "Facteur d’activité",
    "Ajuste del objetivo": "Ajustement de l’objectif",
    "Es una estimación inicial para adultos, no una prescripción médica. Ajusta con tu nutricionista según tu evolución, apetito y rendimiento.":
      "C’est une estimation initiale pour adultes, pas une prescription médicale. Ajustez-la avec votre diététicien selon vos progrès, votre appétit et vos performances.",
    "Guardar objetivo y metas": "Enregistrer l’objectif et les valeurs",
    "Actualizando metas con tus últimos registros…":
      "Actualisation des objectifs avec vos dernières données…",
    "Cómo se calcula": "Méthode de calcul",
    "Mifflin–St Jeor: 10 × peso (kg) + 6,25 × altura (cm) − 5 × edad + coeficiente (+5 masculino, −161 femenino).":
      "Mifflin–St Jeor : 10 × poids (kg) + 6,25 × taille (cm) − 5 × âge + coefficient (+5 masculin, −161 féminin).",
    "Multiplicamos por tu actividad y aplicamos +10% para volumen, −5% para recomposición, −15% para definición o 0% para mantenimiento. Son ajustes iniciales de la app, no parte de la fórmula original.":
      "Nous multiplions par l’activité et appliquons +10% pour la prise de masse, −5% pour la recomposition, −15% pour la sèche ou 0% pour le maintien. Ces ajustements initiaux de l’app ne font pas partie de la formule d’origine.",
    "Proteínas: 1,6–2 g/kg según el objetivo, limitadas al 35% de las calorías. Grasas: 30%. Carbohidratos: calorías restantes. El redondeo puede producir pequeñas diferencias.":
      "Protéines : 1,6–2 g/kg selon l’objectif, plafonnées à 35% des calories. Lipides : 30%. Glucides : calories restantes. L’arrondi peut créer de petits écarts.",
    "Tu contexto corporal": "Vos données corporelles",
    "Las medidas y la bioimpedancia ayudan a seguir tu evolución. No alteran la ecuación Mifflin–St Jeor ni sustituyen una evaluación profesional.":
      "Les mensurations et la bioimpédance aident à suivre votre évolution. Elles ne modifient pas l’équation de Mifflin–St Jeor et ne remplacent pas une évaluation professionnelle.",
    "Bioimpedancia del {0}": "Bioimpédance du {0}",
    "Sin bioimpedancia registrada": "Aucune bioimpédance enregistrée",
    "Medidas corporales del {0}": "Mensurations du {0}",
    "Sin medidas corporales registradas": "Aucune mensuration enregistrée",
    "DEL NÚMERO AL PLATO": "DES CHIFFRES À L’ASSIETTE",
    "Macro-Guía": "Guide des macros",
    "Porciones de referencia, sin complicaciones.":
      "Des portions de référence, simplement.",
    "Buscar alimento": "Rechercher un aliment",
    "Filtrar nutriente": "Filtrer par nutriment",
    Todos: "Tous",
    "No hay alimentos que coincidan.": "Aucun aliment correspondant.",
    "Se destaca un nutriente, no la composición completa. Las marcas, el tamaño y la preparación cambian los valores. En un huevo revuelto cuenta también el aceite, la mantequilla o la leche; en el atún usa el peso escurrido y la etiqueta de tu lata.":
      "Un nutriment est mis en avant, pas la composition complète. La marque, la taille et la préparation modifient les valeurs. Pour les œufs brouillés, comptez l’huile, le beurre ou le lait ; pour le thon, utilisez le poids égoutté et l’étiquette.",
    Calorías: "Calories",
    "Ver nutrición": "Voir la nutrition",
    "Revisa tus datos para obtener una estimación.":
      "Vérifiez vos données pour obtenir une estimation.",
    "Elige tu objetivo para estimar tus calorías y macronutrientes diarios.":
      "Choisissez votre objectif pour estimer vos calories et macros quotidiens.",
  },
};
