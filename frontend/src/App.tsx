import './App.css';

function App() {
  return (
    <main className="app">
      <section className="app__section">
        <h1 className="app__title">커스터마이즈 마이셀프 MVP</h1>
        <p className="app__subtitle">
          1단계에서는 프로젝트 구조와 품질 도구를 준비하고, 이후 단계에서 온보딩·피팅 경험을
          구축합니다.
        </p>
        <div className="app__grid">
          <article>
            <h2>Front-End</h2>
            <ul>
              <li>Vite + React + TypeScript 기반 PWA</li>
              <li>Three.js / R3F / Zustand 스택</li>
              <li>서비스 워커 자동 등록</li>
            </ul>
          </article>
          <article>
            <h2>Back-End</h2>
            <ul>
              <li>NestJS + Prisma + BullMQ</li>
              <li>API 문서화 및 자산 파이프라인</li>
              <li>CI/CD / 배포 파이프라인 준비</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
