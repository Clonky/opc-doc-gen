compile:
	npx tsc

pack:
	npx webpack

bundle: compile pack

test:
	npm run test