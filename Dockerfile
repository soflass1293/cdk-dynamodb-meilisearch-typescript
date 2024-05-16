FROM public.ecr.aws/jsii/superchain:1-bookworm-slim

USER superchain

WORKDIR /home/superchain

COPY --chown=superchain:superchain . .

ENTRYPOINT [ "sh" ]