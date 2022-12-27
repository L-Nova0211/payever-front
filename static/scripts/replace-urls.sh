#!/usr/bin/env bash
set -e

CUSTOM_CDN_URL=${1}

name_patterns=('.*/pe-icons-loader\.ts' '.*/pe-svg-icons-loader\.ts')

sed_pattern=$(echo "MICRO_URL_CUSTOM_CDN=$CUSTOM_CDN_URL" | grep -E '^MICRO_URL_' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')

for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"

        sed -i "$sed_pattern" ./"$filename"
    done
done
