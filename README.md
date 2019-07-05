
# Colombia

NOTE: this is a **public** repo - deliberately - please DO NOT commit anything that should be Pricesearcher Copyright.

An example project repo to demonstrate an ideal configuration for developing
JavaScript / Nodes projects in docker.

Objectives:
* The docker image to contain the npm dependencies (i.e. node_modules/*) as well as the O/S ones.
* Fast as possible development cycle - i.e. code change, buld, manual test, auto test, rinse, repeat.
* Offline development (Steve on the train)
* Close as possible to Jenkins and Production
* Full support for IDE Tools, e.g. Intellisense, that scan the source code and dependencies
* Fast as possible docker shell start-up time


## Handling node_modules - Project Folder Organization

- In order to support a fast development cycle, the source code has to be transferred into the
  docker container by a mount rather than a COPY (at least until IDEs can work in the docker
  container).
- Mounting the entire project folder would mask a node_modules folder already in place.
- The node_modules folder can be mv'ed into place once the container has started by a command
  in an entrypoint script.
- But this is painfully slow on Macs.
- A symlink is also possible, but this leaves a dead blank 'node_modules' file in the project
  root folder of the host system.
- The alternative is to mount subfolders of the project, leaving node_modules in place in the
  container.
- To keep this simple, all the source files that need to be mounted are located in src/, and
  all build products are stored in build/.
- This also cleanly emphasizes the source vs target distinction.
- In particular, all config files are stored in src/config/ rather than the project root.


