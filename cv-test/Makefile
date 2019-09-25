init:
	yarn

dev:
	yarn start

build:
	yarn build

upload: build
	rsync -avzPc --delete dist/ root@174.138.68.174:/var/www/html/non-brute-force-cv
