FROM alpine/git AS clone
RUN git clone --depth=1 https://github.com/noharm-ai/database /database

FROM postgres:11.6
COPY --from=clone /database /docker-entrypoint-initdb.d/db/
COPY init.sh /docker-entrypoint-initdb.d/init.sh
RUN chmod +x /docker-entrypoint-initdb.d/init.sh
