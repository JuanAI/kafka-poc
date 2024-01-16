.PHONY: clean-docker-images

clean-docker-images:
    docker images --format '{{.Repository}}:{{.Tag}}' | grep '^kafka-poc' | xargs -r docker rmi
