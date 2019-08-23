init:
	npm i

dev:
	npm start

build:
	npm run build

upload: build
	rsync -avzPc --delete dist/ root@174.138.68.174:/var/www/html/non-brute-force
