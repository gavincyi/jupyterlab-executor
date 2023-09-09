.PHONY: clean build check check_lint dev-run-jupyterlab-2.x dev-run-jupyterlab-3.x

clean:
	rm -rf venv* lib node_modules *.egg-info jupyterlab_executor/labextension dist build

venv:
	@python3 -m virtualenv venv
	venv/bin/python -m pip install -U pip wheel setuptools
	venv/bin/python -m pip install jupyterlab build twine
	venv/bin/python -m pip install -e .
	venv/bin/jupyter labextension develop --overwrite .

build:
	jlpm run build

check_lint:
	jlpm run eslint:check

check: check_lint

dev-run: build
	jupyter lab

dist: venv
	rm -rf dist build
	venv/bin/python -m build -s
	venv/bin/python -m build
	ls -l dist

release: dist
	venv/bin/python -m twine upload dist/*


