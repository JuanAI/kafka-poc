.PHONY: help
help:  ## Show this help menu.
	@echo "$(notdir $(CURDIR))"
	@echo
	@echo "Available commands:"
	@sed -nr 's/(.*?):[^#]*##(.*)/    \1|\2/p' $(MAKEFILE_LIST) | column -s\| -t

.PHONY: lint
lint: .venv  ## Run formatting & linting checks.
	. .venv/bin/activate \
	&& flake8 . && black --check .

.PHONY: setup
.venv setup:  ## Setup Python venv.
	python3 -m venv .venv \
	&& . .venv/bin/activate \
	&& pip install pip --upgrade \
	&& pip install -r requirements.txt


.PHONY: all clean # Defaults of Make, required by linter/checkmake.
