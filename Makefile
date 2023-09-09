.PHONY: clean build check check_lint dev-run-jupyterlab-2.x dev-run-jupyterlab-3.x

clean:
	rm -rf venv* lib node_modules *.egg-info jupyterlab_executor/labextension dist build

venv-jupyterlab-2.x:
	virtualenv venv-jupyterlab-2.x
	venv-jupyterlab-2.x/bin/python -m pip install -U pip wheel setuptools
	venv-jupyterlab-2.x/bin/python -m pip install 'jupyterlab<3.0'
	venv-jupyterlab-2.x/bin/jlpm install
	venv-jupyterlab-2.x/bin/jupyter labextension install . --no-build

venv-jupyterlab-3.x:
	virtualenv venv-jupyterlab-3.x
	venv-jupyterlab-3.x/bin/python -m pip install -U pip wheel setuptools
	venv-jupyterlab-3.x/bin/python -m pip install 'jupyterlab<4.0' jupyter-packaging
	venv-jupyterlab-3.x/bin/python -m pip install -e .
	venv-jupyterlab-3.x/bin/jupyter labextension develop --overwrite .

build:
	jlpm run build

check_lint:
	jlpm run eslint:check

check: check_lint

dev-run-jupyterlab-2.x: build
	jupyter lab --watch

dev-run-jupyterlab-3.x: build
	jupyter lab

dist:  # For JupyterLab >= 3.0
	rm -rf dist build
	python -m build -s
	python -m build
	ls -l dist

release: dist ## For JupyterLab >= 3.0
	twine upload dist/*

release-npm: # Only for JupyterLab-2.x
	npm publish --access=public


