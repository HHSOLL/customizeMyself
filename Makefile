.PHONY: check lint typecheck test format

check: lint typecheck test

lint:
	@npm run lint

typecheck:
	@npm run typecheck

test:
	@npm run test

format:
	@npm run format
