En esta sección presentamos un conjunto de buenas prácticas para escribir tests que te servirán tanto para crear los tuyos como para evaluar críticamente los que generen tus asistentes IA (Claude Code, Cursor, Copilot…). En 2026 la mayor parte del código nuevo lleva huella de IA, y eso cambia las reglas del juego: no sólo hay que saber escribir tests, sino saber distinguir un buen test de un test "vibe-coded" que pasa sin validar nada real.

💡 Idea clave: un test malo es peor que no tener test. Te da falsa confianza y te obliga a mantenerlo.

1. Convención de nombres
Utiliza nombres de tests descriptivos que expliquen qué comportamiento se está verificando, no qué función se está llamando.

Una convención muy extendida es la de 3 partes: <unidad>_<escenario>_<resultadoEsperado> o su variante en lenguaje natural:

// ❌ Poco informativo
test('reverseString works', () => { ... });

// ✅ Describe comportamiento
test('reverseString returns empty string when input is empty', () => { ... });

// ✅ Estilo BDD con describe + it
describe('reverseString', () => {
  it('should return empty string when input is empty', () => { ... });
  it('should preserve unicode characters when reversing', () => { ... });
});
Cuando un test falla en CI, el nombre es lo primero que ves. Un buen nombre te ahorra abrir el archivo.

2. Patrón Arrange-Act-Assert (AAA) o Given-When-Then
Estructura cada test en 3 bloques claramente separados. Mejora la legibilidad y reduce la carga cognitiva al revisar tests ajenos (o generados por IA).

Arrange (Organizar): configura todo lo necesario: crea objetos, prepara fixtures, configura mocks, inicializa el entorno.

Act (Actuar): ejecuta una sola acción. Si necesitas varias llamadas, probablemente estés testeando más de una cosa.

Assert (Afirmar): verifica el resultado mediante aserciones que comparen lo obtenido con lo esperado.

test('createCandidate persists candidate with generated id', () => {
  // Arrange
  const repo = new InMemoryCandidateRepository();
  const service = new CandidateService(repo);
  const input = { name: 'Ada Lovelace', email: 'ada@example.com' };

  // Act
  const result = service.create(input);

  // Assert
  expect(result.id).toBeDefined();
  expect(repo.findById(result.id)).toMatchObject(input);
});
En contextos BDD (stakeholders de negocio, features user-facing) puedes usar la variante Given-When-Then, que es el mismo patrón con otra nomenclatura. Elige una y sé consistente.

⚠ Regla de oro: un test = un comportamiento. Si tienes varios // Act seguidos, parte el test en dos.

3. Parametrización
Si tienes varios tests que siguen la misma estructura pero cambian entradas/salidas, parametrízalos. Evitas duplicación y, más importante, añadir un caso nuevo es una línea, no un test nuevo.

// Vitest (y también Jest: misma API)
import { describe, test, expect } from 'vitest';
import { reverseString } from './reverseString';

describe('reverseString', () => {
  test.each([
    ['hello', 'olleh'],
    ['world', 'dlrow'],
    ['', ''],
    ['a', 'a'],
    ['hello, world!', '!dlrow ,olleh'],
  ])('reverses "%s" into "%s"', (input, expected) => {
    expect(reverseString(input)).toBe(expected);
  });
});
📌 Nota sobre Vitest vs Jest: ambos comparten prácticamente la misma API. En 2025-2026 Vitest se ha consolidado como estándar en proyectos con Vite (React, Vue, Svelte modernos) por su arranque nativo con ESM/TypeScript y velocidad. Jest sigue siendo dominante en React Native y en codebases legacy. Si empiezas un proyecto nuevo con Vite, usa Vitest; si heredas un proyecto con Jest, no migres por migrar.

4. Mensajes descriptivos en aserciones
Cuando una aserción falle, el mensaje que ves en consola debería bastarte para entender qué pasó, sin abrir el código.

describe('reverseString — casos ampliados', () => {
  test.each([
    ['hello',          'olleh',          'ASCII básico'],
    ['こんにちは',       'はちにんこ',       'Caracteres japoneses'],
    ['😊👍',           '👍😊',            'Emojis'],
    ['  leading  ',   '  gnidael  ',     'Espacios preservados'],
  ])('%s → %s (%s)', (input, expected, label) => {
    expect(reverseString(input), `Falló caso: ${label}`).toBe(expected);
  });
});
Aplica también a las aserciones normales: prefiere toHaveLength(3) sobre toBe(true), toMatchObject({...}) sobre múltiples toBe sueltos. Cada matcher trae su propio mensaje de error más rico.

5. Pruebas de casos límite (edge cases) con ayuda de IA
Probar solo el "camino feliz" es la forma más rápida de que un bug llegue a producción. Los casos límite son donde vive la mayoría de los bugs.

Con el auge de la IA, los casos obvios los cubrirá el asistente casi automáticamente. Tu valor está en aportar lo que la IA no puede inferir solo leyendo el código: conocimiento del dominio y lógica de negocio.

Ejemplo: en una app para clínicas médicas, puedes pedir a la IA múltiples validaciones para cada campo del formulario (textos, números, fechas, emails, direcciones…). Sin embargo, es improbable que, sin todo el contexto del problema, deduzca que no puede haber dos historiales clínicos abiertos para el mismo paciente. Esa regla vive en la cabeza del product manager, no en el código. Ahí es donde tú añades valor.

Dicho esto, la IA también es un excelente potenciador de creatividad para descubrir casos que no habíamos considerado. Una pregunta tan simple como esta puede abrirte los ojos:

¿Qué otros casos límite se te ocurren que puedan fallar para reverseString?

Respuesta típica de un asistente 🤖

Cadenas con caracteres Unicode compuestos (grafemas, no code points)

Emojis con modificadores de piel o ZWJ (👨‍👩‍👧‍👦)

Cadenas con caracteres de escape

Cadenas extremadamente largas (GB de memoria)

Cadenas mezclando números, símbolos, RTL (árabe, hebreo)

Espacios al principio o al final

Combinaciones mayúsculas/minúsculas

null / undefined / no-strings

describe('reverseString — edge cases', () => {
  test.each([
    ['hello',            'olleh',            'ASCII'],
    ['こんにちは',         'はちにんこ',          'Japonés'],
    ['😊👍',             '👍😊',              'Emojis simples'],
    ['Line\\\\nBreak',     'kaerB\\\\neniL',      'Escape'],
    ['   spaces   ',     '   secaps   ',      'Espacios extremos'],
    ['12345',            '54321',             'Números'],
  ])('"%s" → "%s" (%s)', (input, expected, label) => {
    expect(reverseString(input)).toBe(expected);
  });

  test.each([null, undefined, 42, {}])('rejects non-string input: %p', (input) => {
    expect(() => reverseString(input)).toThrow(TypeError);
  });
});
🧪 Prueba esto ahora: abre tu último PR y pídele a tu asistente IA: "Dame 5 edge cases para esta función que yo probablemente no haya considerado, priorizando los relacionados con el dominio del negocio." Anota cuáles no habías cubierto.

6. Mockea en las fronteras, no en las entrañas
Las pruebas unitarias no deben depender de infraestructura externa (BD, APIs de terceros, sistema de ficheros, reloj). Pero over-mockear es un anti-patrón tanto o más grave: tests que mockean todo acaban validando el propio mock, no el código.

La regla práctica: mockea en los bordes arquitectónicos (llamadas HTTP salientes, BD, servicios cloud) y deja lo demás real si es rápido y determinista.

Backend (Node.js/Express) — inyección de dependencias
En lugar de mockear el ORM, inyecta un repositorio en memoria. Así testeas la lógica real sin tocar BD:

// candidate.service.test.js
import { describe, test, expect } from 'vitest';
import { CandidateService } from './candidate.service';

class InMemoryCandidateRepo {
  constructor() { this.data = new Map(); }
  save(c)       { this.data.set(c.email, c); return c; }
  findByEmail(e){ return this.data.get(e) ?? null; }
}

describe('CandidateService.create', () => {
  test('rejects duplicate emails', async () => {
    const repo = new InMemoryCandidateRepo();
    const service = new CandidateService(repo);
    await service.create({ email: 'ada@example.com', name: 'Ada' });

    await expect(
      service.create({ email: 'ada@example.com', name: 'Ada 2' })
    ).rejects.toThrow('DuplicateEmailError');
  });
});
Para tests de endpoint HTTP usa Supertest, que levanta tu app Express sin abrir puerto:

// candidates.routes.test.js
import request from 'supertest';
import { app } from '../app';

test('POST /candidates returns 201 with new candidate', async () => {
  const res = await request(app)
    .post('/candidates')
    .send({ name: 'Ada Lovelace', email: 'ada@example.com' });

  expect(res.status).toBe(201);
  expect(res.body).toMatchObject({ name: 'Ada Lovelace' });
  expect(res.body.id).toBeDefined();
});
Para tests de integración contra una BD real pero aislada, usa Testcontainers (levanta un Postgres efímero en Docker). Es el estándar actual para evitar mocks frágiles sin ensuciar tu BD local.

Frontend (React) — mocks de red con MSW
Para mockear llamadas HTTP desde el frontend, Mock Service Worker (MSW) es el estándar de facto. Interceptas en la capa de red (no en fetch/axios), así los mismos mocks sirven para Vitest, Storybook y desarrollo local:

// handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/candidates', () =>
    HttpResponse.json([{ id: 1, name: 'Ada' }])
  ),
];
🚫 Anti-patrón frecuente con IA: pedirle a un asistente "mockea todo lo necesario para este test" y acabar con 40 líneas de mocks para testear 5 líneas de código. Si tu mock es más complejo que lo que testeas, probablemente debas testear a un nivel más alto (integración) en vez de unitario.

7. Elige el tipo de test por valor, no por dogma
La pirámide clásica de tests (muchos unit, algunos integration, pocos e2e) sigue siendo un buen default, pero el consenso actual ha evolucionado hacia el "Testing Trophy" de Kent C. Dodds, que prioriza tests de integración: son los que mejor ratio confianza/coste dan.

        /\\
       /E2E\\        ← Pocos, caros, pero validan flujos críticos reales
      /──────\\
     /Integr.\\     ← La mayoría de tu inversión
    /──────────\\
   /   Unit    \\   ← Solo para lógica compleja y pura
  /──────────────\\
 /  Static (TS,   \\ ← Tipos, lint, formatters: gratis y constantes
/   ESLint, etc)   \\
────────────────────
Reglas prácticas:

Static first: TypeScript + ESLint + Prettier te ahorran una categoría entera de bugs. Son "tests" que se ejecutan mientras escribes.

Unit tests: solo para lógica con ramificaciones (validaciones, cálculos, transformaciones). Para código que solo orquesta llamadas, no suelen aportar.

Integration tests (Supertest + Testcontainers, Vitest + MSW): donde más retorno obtienes.

E2E (Playwright es el estándar actual, por encima de Cypress en adopción y velocidad): solo para flujos críticos de negocio (login, checkout, alta).

8. Code coverage: una señal, no un objetivo
El coverage es útil como alarma de zonas sin tests, pero exigir "90% obligatorio" fabrica tests vacíos que solo ejecutan código sin validar nada. Un test que solo llama a la función sin expect real da coverage y cero confianza.

Mira el coverage relativo (¿qué módulos críticos están por debajo del resto?) más que el absoluto.

Complementa con mutation testing (Stryker en JS/TS) para saber si tus tests realmente detectan cambios en el código, no solo lo ejecutan.

Excluye del coverage lo trivial (DTOs, barrel files, tipos).

9. Tests como contrato con los agentes IA (TDD revive en 2026)
Un cambio importante respecto a hace 2 años: TDD ha recuperado relevancia gracias a los agentes de coding. Escribir el test primero le da al agente (Claude Code, Cursor, Copilot) un criterio de salida objetivo: el código está bien cuando el test pasa. Sin ese criterio, el agente "alucina" soluciones que parecen correctas pero no lo son.

Workflow recomendado con Claude Code u otro agente:

Red: tú escribes (o refinas con la IA) los tests que describen el comportamiento deseado.

Green: pides al agente que implemente hasta que los tests pasen.

Refactor: revisas el código generado y le pides mejoras concretas con los tests como red de seguridad.

🔬 Dato: el informe DORA 2025 de Google encontró que TDD amplifica los beneficios de la adopción de IA en equipos de alto rendimiento. No es nostalgia: es el mecanismo que evita que los agentes entreguen código que "parece bien" pero no lo está.

🧪 Prueba esto ahora: en tu próxima feature pequeña, invierte el orden. Escribe el test primero, pásaselo a Claude Code con un /test o prompt explícito, y observa cuántas iteraciones necesita vs tu flujo habitual.

10. Cuándo NO escribir tests
En un curso de buenas prácticas, esta sección suele faltar, pero es clave para developers senior:

Prototipos desechables y spikes de investigación: si el código va a la papelera en 3 días, los tests también.

Código trivial sin lógica: getters, setters, DTOs, wrappers que solo delegan. El TypeScript ya te protege ahí.

Código que va a cambiar mañana: si estás validando un diseño con usuarios, testea a nivel e2e la feature, no los detalles internos.

Tests de implementación: tests acoplados a cómo funciona el código (no qué hace) son los primeros que se rompen al refactorizar. Testea comportamiento observable.

La pregunta correcta no es "¿tiene tests?" sino "¿los tests que tiene dan confianza para cambiar este código?".