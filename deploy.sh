#!/bin/sh

ansible-playbook --version
ansible-playbook -i ansible/inventory/dev ansible/deploy.yml --tags "stack-sunbird" --extra-vars "hub_org=sunbird image_name=content_image image_tag=0.0.1-bronze" --vault-password-file /run/secrets/vault-pass
