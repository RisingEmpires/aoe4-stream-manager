FROM ghcr.io/nodecg/nodecg:latest

# Switches to the nodecg user created by the base image.
USER nodecg

# RUN nodecg install RisingEmpires/aoe-4-civ-draft && nodecg defaultconfig aoe-4-civ-draft

COPY --chown=nodecg:nodecg ./bundles /opt/nodecg/bundles

COPY --chown=nodecg:nodecg ./assets /opt/nodecg/assets

EXPOSE 9090