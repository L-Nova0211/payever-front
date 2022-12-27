#!/usr/bin/env bash

# Register micro.js
register_microjs() {
    curl --user ${APPREGISTRY_CLIENT_USER}:${APPREGISTRY_CLIENT_PASSWORD} \
        --silent --output - --show-error --fail \
        --connect-timeout 3 \
        --max-time 5 \
        -X POST \
        -H "Content-Type:application/json" \
        "${MICRO_URL_APP_REGISTRY}/api/apps" -d "@/payever/micro.config.json"
}
# IT WILL ONLY RUN TO COSF
if [[ -z "$BUILDER_CLIENT_BUILD" ]]; then
    # Translation keys push
    find ./translations -name '*.json' | while read filename; do
        domain_locale=$(basename "${filename}" | sed "s/.json//g;")
        filename=$(readlink -f "${filename}")

        echo -e "> Registering translation ${domain_locale} at ${MICRO_URL_PHP_TRANSLATION} \n"

        curl --user ${TRANSLATION_CLIENT_USER}:${TRANSLATION_CLIENT_PASSWORD} \
            --silent --output - --show-error --fail \
            --connect-timeout 3 \
            --max-time 5 \
            -X POST \
            -H "Content-Type:application/json" \
            "${MICRO_URL_PHP_TRANSLATION}/api/translation/${domain_locale}" -d "@$filename"

        echo -e "\n"
    done
fi
if [[ $DEPLOY_TO_EXCLUSIVE != *"true"* ]] ; then
    echo "Running deploy.sh"
    /payever/deploy/deploy.sh;
fi

echo -e "\nDone\n"