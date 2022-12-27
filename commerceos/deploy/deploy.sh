#!/usr/bin/env bash

envsubst < /payever/deploy/env.json > /payever/env.json
envsubst < /payever/environment.prod.ts > /payever/environment.ts

cp -f /payever/environment.ts /payever/environment.prod.ts

# env replace
printenv | grep -E '^MICRO_URL_'
new_hash=$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 10 | head -n 1)
commerceos_version=$(printenv | grep -e '^MICRO_COMMERCEOS_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print $2}')

if [[ $commerceos_version == "latest" ]] ; then
  echo "updating commerceos version tag to: $commerceos_version-$new_hash"
  export MICRO_COMMERCEOS_VERSION="latest-$new_hash"
  commerceos_version="latest-$new_hash"
fi

name_patterns=('.*/index\.html' '.*/.*\.js')
#Below command will sort variables based on key length to avoid missreplacement e.g. MICRO_URL_CHECKOUT and MICRO_URL_CHECKOUT_CDN
sed_pattern=$(printenv | grep -E '^MICRO_URL_' | awk 'BEGIN { FS = "=" } ; { print length($1), $0 }' | sort -r -nk1 | awk '{print $2}' | awk '{sub(/=/," ");$1=$1;print "-e s#"$1"#"$2"#g"}')
sed_pattern+=$(printenv | grep -e '^MICRO_CHECKOUT_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')
sed_pattern+=$(printenv | grep -e '^MICRO_COMMERCEOS_VERSION' | sed -e 's/\.//g' | awk '{sub(/=/," ");$1=$1;print " -e s#"$1"#"$2"#g"}')

for name_pattern in "${name_patterns[@]}"; do
    find /payever/ -regex "${name_pattern}" | while read filename; do
        echo -e "\nProcessing $filename"
        parallel -a "${filename}" -j 6 -k --block -1 --pipe-part sed ${sed_pattern} > "${filename}-cp"
        mv "${filename}-cp" "${filename}"
    done
done

./azcopy copy /payever/pe-finexp-widget.min.js "$MICRO_URL_CUSTOM_STORAGE/cdn/finance-express/widget.min.js$STORAGE_BLOB_SAS_KEY"
./azcopy copy /payever/pe-message-widget.min.js "$MICRO_URL_CUSTOM_STORAGE/cdn/message/widget.min.js$STORAGE_BLOB_SAS_KEY"
#TODO: security
#rm -rf /payever/cdn/commerceos/env.json
if [[ $DEPLOY_TO_EXCLUSIVE != *"true"* ]] ; then
  ./azcopy copy /payever/env.json "$MICRO_URL_CUSTOM_STORAGE/cdn/commerceos/env.json$STORAGE_BLOB_SAS_KEY"
  ./azcopy copy /payever/index.html "$MICRO_URL_CUSTOM_STORAGE/cdn/commerceos/index.html$STORAGE_BLOB_SAS_KEY"
  ./azcopy sync /payever "$MICRO_URL_CUSTOM_STORAGE/cdn/commerceos/$commerceos_version$STORAGE_BLOB_SAS_KEY" --recursive=true
  ./azcopy sync /payever/assets "$MICRO_URL_CUSTOM_STORAGE/cdn/commerceos/assets$STORAGE_BLOB_SAS_KEY" --recursive=true
  ./azcopy copy /payever/environment.prod.ts "$MICRO_URL_CUSTOM_STORAGE/cdn/environment.prod.ts$STORAGE_BLOB_SAS_KEY"
fi

if [[ $DEPLOY_TO_EXCLUSIVE == *"true"* ]] ; then
  mkdir "/tmp/$commerceos_version"
  cp -rf * "/tmp/$commerceos_version/"
  mv "/tmp/$commerceos_version" /payever/

  if [ -d "/etc/nginx/cmconfig" ]; then
    mkdir -p /etc/nginx/conf.d
    sed "s/#INCLUDE_01/rewrite ^\/assets\/(.*)\$ \/$commerceos_version\/assets\/\$1 break;/g" /etc/nginx/cmconfig/default.conf > /etc/nginx/conf.d/default.conf
  fi
  echo -e "\nStarting nginx\n"
  nginx -g 'daemon off;'
fi
