init:
	yarn

dev:
	yarn start

build:
	yarn build

upload: build
	rsync -avzPc --delete dist/ root@167.172.233.150:/var/www/html/non-brute-force-cv
