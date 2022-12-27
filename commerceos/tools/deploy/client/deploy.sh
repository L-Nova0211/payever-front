#!/usr/bin/env bash
set -e

name_patterns=('.*/.*\.js')
sed_pattern=$(printenv | grep -e '^MICRO_CHECKOUT_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print "s#"$1"#"$2"#g;"}')
for name_pattern in "${name_patterns[@]}"; do
    find . -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"
        sed -i "$sed_pattern" ./"$filename"
    done
done

node /payever/dist/server/main.js
