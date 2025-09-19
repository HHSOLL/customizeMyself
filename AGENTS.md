# Repository Guidelines

Bootstrap work is still in progress; treat this guide as the contract for how we grow the codebase.

## Project Structure & Module Organization
- Runtime code lives in `src/`, with each agent isolated under `src/agents/<agent_name>/`.
- Shared utilities belong in `src/common/`; limit nesting to three levels to keep imports readable.
- Prompts, persona files, and other static artifacts go under `assets/`.
- Store reusable configuration templates in `configs/` and version them.
- Helper tooling (bootstrap scripts, data sync) should live in `scripts/` with executable permissions.
- Mirror the package layout inside `tests/` (e.g., `tests/agents/test_<agent_name>.py`) to simplify discovery.

## Build, Test, and Development Commands
- Create a virtualenv with `python -m venv .venv && source .venv/bin/activate`.
- Once dependencies are defined in `requirements.in`, lock them via `pip-compile requirements.in` and install from `requirements.txt`.
- Expose a CLI entry point (target: `python -m src.agents.cli --agent demo`) so reviewers can trial agents quickly.
- Add a `make check` target that chains lint, type checks, and tests; contributors must run it before pushing.

## Coding Style & Naming Conventions
- Adopt PEP 8 with 4-space indents and 100-character lines; lint via `ruff`.
- Format every commit with `black --preview` and keep the config in `pyproject.toml`.
- Use `snake_case` for modules/functions, `PascalCase` for classes, and `UPPER_SNAKE_CASE` for constants.
- Name prompt files with role prefixes, e.g. `persona_expert.md`, to ease lookup.

## Testing Guidelines
- Standard test runner is `pytest`; place fast unit tests alongside their modules and slower suites under `tests/integration/`.
- Name files `test_<feature>.py` and fixtures in `tests/conftest.py` for reuse.
- Target ≥85% statement coverage and require regression tests before closing bugs.
- Capture CLI smoke checks in `tests/smoke/` with deterministic inputs.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat: add planner`, `fix: guard config load`) in present tense.
- Reference tracking issues in the footer (`Refs #123`) and note any follow-up tasks.
- PR descriptions must summarize intent, list test evidence, and call out remaining risks.
- Attach screenshots or logs for UX-facing or API-breaking work; request review from agent owners.

## Security & Configuration Tips
- Never commit secrets; keep them in `.env.local` and document required keys in `configs/README.md`.
- Rotate keys quarterly and record expirations in the shared tracker.
- Sanitize logs before sharing traces and add reusable scrubbing helpers in `src/common/sanitizers.py`.
