init:
	npm i

dev:
	npm start

build:
	npm run build

upload: build
	rsync -avzPc --delete build/ root@167.172.233.150:/var/www/html/non-brute-force-ui
