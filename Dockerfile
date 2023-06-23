FROM ghcr.io/nodecg/nodecg:latest AS base
USER root
RUN npm install -g nodecg-cli@8.6.8
RUN apt-get -y update; apt-get -y install curl; apt-get -u install wget;


# Switches to the nodecg user created by the base image.
USER nodecg

WORKDIR /opt/nodecg/bundles/

# Get latest release, unpack and remove tar 
ADD "https://api.github.com/repos/RisingEmpires/aoe-4-civ-draft/commits?per_page=1" latest_commit_aoe-4-civ-draft
RUN curl -s https://api.github.com/repos/RisingEmpires/aoe-4-civ-draft/releases/latest | grep "browser_download_url.*tar" | cut -d : -f 2,3 | tr -d \" | wget -qi -
RUN mkdir ./aoe-4-civ-draft && tar -C ./aoe-4-civ-draft -xvf aoe-4-civ-draft.tar && rm -rf aoe-4-civ-draft.tar

ADD "https://api.github.com/repos/RisingEmpires/aoe-4-team-games/commits?per_page=1" latest_commit_aoe-4-team-games
RUN curl -s https://api.github.com/repos/RisingEmpires/aoe-4-team-games/releases/latest | grep "browser_download_url.*tar" | cut -d : -f 2,3 | tr -d \" | wget -qi -
RUN mkdir ./aoe-4-team-games && tar -C ./aoe-4-team-games -xvf aoe-4-team-games.tar && rm -rf aoe-4-team-games.tar

ADD "https://api.github.com/repos/RisingEmpires/aoe4-map-selector/commits?per_page=1" latest_commit_aoe4-map-selector
RUN curl -s https://api.github.com/repos/RisingEmpires/aoe4-map-selector/releases/latest | grep "browser_download_url.*tar" | cut -d : -f 2,3 | tr -d \" | wget -qi -
RUN mkdir ./aoe4-map-selector && tar -C ./aoe4-map-selector -xvf aoe4-map-selector.tar && rm -rf aoe4-map-selector.tar

ADD "https://api.github.com/repos/RisingEmpires/aoe4-score-display/commits?per_page=1" latest_commit_aoe4-score-display
RUN curl -s https://api.github.com/repos/RisingEmpires/aoe4-score-display/releases/latest | grep "browser_download_url.*tar" | cut -d : -f 2,3 | tr -d \" | wget -qi -
RUN mkdir ./aoe4-score-display && tar -C ./aoe4-score-display -xvf score-display.tar && rm -rf score-display.tar

ADD "https://api.github.com/repos/RisingEmpires/caster-manager/commits?per_page=1" latest_commit_caster-manager
RUN curl -s https://api.github.com/repos/RisingEmpires/caster-manager/releases/latest | grep "browser_download_url.*tar" | cut -d : -f 2,3 | tr -d \" | wget -qi -
RUN mkdir ./caster-manager && tar -C ./caster-manager -xvf caster-manager.tar && rm -rf caster-manager.tar


#COPY --chown=nodecg:nodecg ./bundles /opt/nodecg/bundles

# COPY --chown=nodecg:nodecg ./assets /opt/nodecg/assets
# COPY --chown=nodecg:nodecg ./db /opt/nodecg/db

EXPOSE 9090