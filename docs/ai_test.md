Al escribir tests con ayuda de IA, podemos apoyarnos en dos elementos del contexto que usualmente ya están disponibles. Esto no solo ahorra tiempo, sino que también facilita la redacción de prompts más precisos:

User Story: Proporciona los criterios de aceptación y el comportamiento esperado de la funcionalidad.

Contexto del Proyecto: Describe las dependencias, frameworks, patrones de diseño y demás elementos técnicos relevantes.

Un prompt sencillo de ejemplo:

Eres un experto en testing con Node.js usando Vitest + Supertest (o Jest, según tu proyecto). Dada la siguiente historia de usuario: [historia de usuario], escribe tests unitarios que garanticen que los criterios de aceptación se cumplen. Utiliza buenas prácticas de testing: describe/it con nombres descriptivos, mocks solo cuando sean estrictamente necesarios, y queries semánticas (getByRole) si testeas React con Testing Library. Añade todos los casos límite que consideres. Añade comentarios para aclarar a qué criterio de aceptación se refiere cada test. Contexto del proyecto: [contexto]

Usa este cuando quieras generar varios tests de golpe a partir de una historia de usuario completa.

Si quieres ser más específico, puedes escoger los criterios de aceptación uno por uno y avanzar progresivamente:

Eres un experto en testing con Node.js usando Vitest + Supertest. Dada la siguiente historia de usuario: [historia de usuario] y el criterio de aceptación [criterio de aceptación], escribe tests unitarios que garanticen que el criterio de aceptación se cumple. Utiliza buenas prácticas de testing y añade todos los casos límite que consideres. Contexto del proyecto: [contexto]

Cuando quieras asegurarte de cubrir bien cada criterio, uno por uno, con foco en calidad.

🧪 TDD asistido por IA: invierte el flujo
Por defecto, los copilotos escriben primero la implementación y luego los tests. Para hacer TDD (spec → test → código) necesitas lo contrario, y debes pedirlo explícitamente en el prompt:

Escribe UN test Vitest que FALLE para la siguiente feature: [descripción concreta, ej: "endpoint POST /users valida que el email tenga formato correcto y devuelve 400 si no"]. NO escribas la implementación todavía. Después de que confirme que el test falla como se espera, te pediré que hagas el código mínimo para que pase.

Esto elimina el problema de la validación circular (la IA validando su propia interpretación del código) y convierte las specs OpenSpec de la Sesión 2 en targets objetivos y verificables. Anthropic lo documenta como uno de los flujos de mayor productividad con Claude Code.

✅ Valida que tus tests realmente prueban algo
Un test que siempre pasa no prueba nada. La IA puede generar tests con 100% de cobertura cuyas assertions son tautológicas o validan el mock en lugar del comportamiento real (Meta publicó en FSE 2024 casos con 100% coverage y solo 4% de mutation score).

Dos reglas prácticas:

Antes de confiar en un test generado por IA, rómpelo a propósito: cambia el retorno de la función, invierte una condición. Si el test sigue pasando, no sirve.

Para código crítico (auth, pagos, validaciones de negocio), corre mutation testing con @stryker-mutator/core sobre tu suite Vitest/Jest. Objetivo realista: mutation score ≥ 70% en paths críticos.

Herramientas con IA para generar tests
Además de los prompts manuales, los copilotos principales ya integran features nativas para testing. Esto puede ser un gran apoyo en el flujo de trabajo de desarrolladores que usan IA como copiloto.

Claude Code (copiloto principal del máster)
Loop autónomo de testing: genera, ejecuta, lee errores y corrige, todo sin salir de la terminal. Prueba en tu proyecto:

claude "escribe tests Vitest para src/services/user.ts, ejecútalos con npm test y corrige cualquier fallo"
Subagentes especializados (v2.0.28+, oct 2025): define un test-runner en .claude/agents/test-runner.md con permisos Read + Edit + Bash, y lo invocas con @test-runner cuando necesites generar/arreglar tests sin contaminar el contexto principal.

Modo headless para CI: claude -p "..." permite generar tests como step de GitHub Actions en PRs.

Plan Mode (Shift+Tab): útil para que Claude proponga la estrategia de testing completa antes de tocar ningún archivo.

Cursor
Comando /test que puedes ejecutar directamente sobre una función o archivo.

Detecta automáticamente los nombres de funciones y escribe pruebas para cada una.

Si el archivo tiene comentarios tipo "user story" o "criteria", los incorpora como contexto.

Desde Cursor 2.0 (octubre 2025): hasta 8 agentes en paralelo vía git worktrees — un agente implementa la feature mientras otro escribe los tests simultáneamente.

GitHub Copilot
Copilot Labs: discontinuado en 2024. Sus features se migraron a Copilot Chat y al modo Agent.

Agent Mode (GA marzo 2026): programador autónomo dentro del IDE (VS Code, JetBrains) que analiza el codebase, crea tests multi-archivo, ejecuta npm test, interpreta resultados y auto-corrige en bucle.

Coding Agent (GA septiembre 2025): asigna un issue de GitHub a @copilot y trabaja en un entorno aislado de GitHub Actions, abriendo un draft PR para tu revisión. Ideal para tareas del tipo "añade tests unitarios al módulo X" sin bloquear tu IDE.

Playwright MCP (para tests E2E)
Si usas Playwright para E2E, el servidor @playwright/mcp conecta Claude Code, Cursor o Copilot con un navegador real. El agente ve la página a través del árbol de accesibilidad (no capturas de pantalla), hace clicks, lee la consola y escribe el test .spec.ts por ti. Es la vía más rápida en 2026 para bootstrappear una suite E2E desde cero. Conecta directamente con el MCP visto en Sesión 3.

Herramientas especializadas (opcionales)
Qodo (antes CodiumAI, rebrandeado en 2024): agente dedicado a generar y validar tests con garantía de incremento de cobertura. Tier gratuito con 250 créditos/mes.

fast-check: para property-based testing en Vitest/Jest. La IA es especialmente buena generando "properties" cuando se lo pides explícitamente — ej: "genera un property-based test con fast-check que valide que parseEmail nunca lance excepción para cualquier string".