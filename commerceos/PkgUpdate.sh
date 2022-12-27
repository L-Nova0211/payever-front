#!/bin/bash

set -x

cosf_project_id="198"
bef_project_id="428"
GITLAB_TOKEN="2rva7PXrXLc9hYkpJ8yh"
run_automation_flag="false"

builder_modules=('core' 'api' 'renderer' 'viewer' 'editor' 'media' 'themes' 'shop' 'pos' 'text-editor' 'products')
builder_modules_updated=()

function updat_package_lock {

    GITLAB_TOKEN=${1}
    shift
    cosf_project_id=${1}
    shift
    f_branch_name=${1}
    shift
    builder_modules_updated=("$@")

    mkdir /tmp/commerceos/
    git clone http://gitlab-ci-token:${GITLAB_TOKEN}@gitlab.devpayever.com/frontend/commerceos.git /tmp/commerceos/
    cd /tmp/commerceos/
    git checkout ${f_branch_name}
    npm_install_command="npm i"

    for builder_module in "${builder_modules_updated[@]}";
    do
        npm_install_command="${npm_install_command} ${builder_module}"
    done

    eval "${npm_install_command}"
    cd -

    set +x

    # Get latest version of COSF package.json & package-lock.json
    pck_json=$(cat /tmp/commerceos/package.json)
    pck_lock_json=$(cat /tmp/commerceos/package-lock.json)

    # Encode the content
    pck_json_encoded=$(echo ${pck_json} \
        | jq "." \
        | base64 -w 0)
    pck_lock_json_encoded=$(echo ${pck_lock_json} \
        | jq "." \
        | base64 -w 0)

    rm -rf /tmp/commerceos/

    echo '{
  "branch": "'"${f_branch_name}"'",
  "commit_message": "'"${f_branch_name} Updated package.json & package-lock.json"'",
  "actions": [
    {
      "action": "update",
      "file_path": "package.json",
      "encoding": "base64",
      "content": "'"${pck_json_encoded}"'"
    },
    {
      "action": "update",
      "file_path": "package-lock.json",
      "encoding": "base64",
      "content": "'"${pck_lock_json_encoded}"'"
    }
  ]
}' > PAYLOAD.json

    set -x

    # Commit the updated package.json & package-lock.json to COSF
    curl \
        --request POST \
        --header "Private-Token: ${GITLAB_TOKEN}" \
        --header "Content-Type: application/json" \
        --data @PAYLOAD.json \
        "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/repository/commits"

    rm PAYLOAD.json

}

# Fetch commit hash from detatched branch
commit_hash=$(git branch --contains HEAD \
    | grep "*" \
    | cut -c21-27)

# Get BEF commit details
commit_det=$(curl \
    --header "Private-Token: ${GITLAB_TOKEN}" \
    "https://gitlab.devpayever.com/api/v4/projects/${bef_project_id}/repository/commits/${commit_hash}")

# Get BEF branch name from commit ref
branch_name=$(echo ${commit_det} \
    | jq -r ".last_pipeline.ref")

# Get BEF commit title from commit details
commit_title=$(echo ${commit_det} \
    | jq -r ".title")

if [ "${#branch_name}" -gt "7" ]
then
    # If commit ref has detached head string
    # get BEF branch name from commit title(prefix)
    branch_name=$(echo ${commit_title} \
        | cut -c1-7)

    if [ "${branch_name}" = "Merge b" ]
    then
        # get BEF branch name from commit title(suffix)
        branch_name=$(echo ${commit_title} \
            | cut -c34-40)
    fi
fi

# if master branch; set run_automation_flag="true"
# else check commited files

if [ "${branch_name}" != "master" ];
then
    for builder_module in "${builder_modules[@]}";
    do
        # full path of package.json for builder module
        module_pkg_json="src/modules/${builder_module}/package.json"

        # loop through all files pushed in latest commit
        # for files_commited in `git diff-tree --no-commit-id --name-only -r ${commit_hash}`; 
        builder_module_commited_flag="false"

        for files_commited in `git log -m -1 --name-only --pretty="format:" ${commit_hash}`; 
        do
            # if builder module's package.json presnt in latest commit
            if [ "${module_pkg_json}" = "${files_commited}" ];
            then
                # set flag as true
                builder_module_commited_flag="true"
            fi;
        done

        # if builder module's package.json presnt in latest commit
        if [ "${builder_module_commited_flag}" = "true" ]
        then
            run_automation_flag="true"

            curr_version=$(cat ./dist/libs/${builder_module}/package.json \
                | jq -r '.version')

            # Publish npm package
            cp .npmrc ./dist/libs/${builder_module} 
            cd ./dist/libs/${builder_module}

            npm publish
            cd -

            pkg_name_builder_module="@pe/builder-${builder_module}@${curr_version}"
            builder_modules_updated+=(${pkg_name_builder_module})
        fi
    done
    else
        run_automation_flag="true"
fi

# if builder module's package.json presnt in latest commit
if [ "${run_automation_flag}" = "true" ]
then
    echo "Updating COSF..."

    # Get BEF commit message from commit hash
    mtm_branch_name=$(echo ${commit_title} \
        | cut -c15-21)

    if [ "${branch_name}" = "master" ] && [ "${commit_title}" = "Merge branch '${mtm_branch_name}' into 'master'" ]
    then
        # if merged to master
        # - increament package version
        # - set COSF branch name without BEF

        # Get BEF commit message from commit hash
        mtm_branch_num=$(echo ${mtm_branch_name} \
            | sed 's/BEF-//g')
        cosf_branch_name="COSF-${mtm_branch_num}-BF"
        f_branch_name=${cosf_branch_name}

        # Create a COSF Merge Request and accept
        # Create Merge Request for COSF feature branch to master
        merge_request=$(curl \
            --request POST \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/merge_requests?source_branch=${f_branch_name}&target_branch=master&title=${f_branch_name}%20Update%20package%20JSON")

        mr_iid=$(echo ${merge_request} \
            | jq '.iid')

        # Accept Merge Request for COSF feature branch to master
        echo '{
  "id": "'"${cosf_project_id}"'",
  "merge_request_iid": "'"${mr_iid}"'"
}' > PAYLOAD.json

        curl \
            --request PUT \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            --header "Content-Type: application/json" \
            --data @PAYLOAD.json \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/merge_requests/${mr_iid}/merge"

        rm PAYLOAD.json
    else
        # if pushed to feature branch
        # - set COSF branch name with BEF
        branch_num=$(echo ${branch_name} | sed 's/BEF-//g')
        cosf_branch_name="COSF-${branch_num}-BF"
        f_branch_name=${cosf_branch_name}

        # Create a COSF branch
        curl \
            --request POST \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/repository/branches?branch=${f_branch_name}&ref=master"

        # Get updated package-lock integrity and update package-lock.json
        echo ${PWD}
        updat_package_lock ${GITLAB_TOKEN} ${cosf_project_id} ${f_branch_name} ${builder_modules_updated[@]}

        sleep 30s

        # Wait for COSF build job to finish
        # then run "Deploy to exclusive domain" job

        # Fetch the above commit details/pipeline id
        pipeline_id=$(curl \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/repository/commits/${f_branch_name}" \
            | jq '.last_pipeline.id')

        # Fetch the job id from pipeline where job name "Deploy to exclusive domain"
        job_id=$(curl \
            --header "Private-Token: ${GITLAB_TOKEN}" \
            "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/pipelines/${pipeline_id}/jobs" \
            | jq '.[] | select(.name == "Deploy to exclusive domain") | .id')

        job_play_flag="false"

        while [ "${job_play_flag}" = "false" ]
        do
            # Fetch the job status of Build stage from pipeline where job name "Build"
            job_status=$(curl \
                --header "Private-Token: ${GITLAB_TOKEN}" \
                "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/pipelines/${pipeline_id}/jobs" \
                | jq -r '.[] | select(.name == "Build") | .status')
            
            if [ "${job_status}" = "success" ]
            then
                # Play the job "Deploy to exclusive domain"
                curl \
                    --request POST \
                    --header "Private-Token: ${GITLAB_TOKEN}" \
                    "https://gitlab.devpayever.com/api/v4/projects/${cosf_project_id}/jobs/${job_id}/play"
                
                # set flag to true since job ran
                job_play_flag="true"
            elif [ "${job_status}" = "failed" ]
            then
                exit 1 # terminate and indicate error
            fi

            sleep 60s
        done
    fi
else
    echo "No changes related to builder modules were present in the commit"
fi
